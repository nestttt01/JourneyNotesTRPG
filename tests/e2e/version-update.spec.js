const { test, expect } = require('@playwright/test');
const { openApp } = require('./test-helpers');

const CURRENT_UPDATE = [
    '角色與配置介面全面整理，玩家、NPC、情境的查看與編輯更加直覺，桌機與手機操作也更順暢。',
    '新增 NPC「認識夥伴」：可以透過預設或自訂問題逐步認識角色，只有在最後確認後才會將內容保存到 NPC 設定。',
    '遊戲設定與系統頁重新整理：配置可以鎖定，批次選擇與刪除不會影響已鎖定項目；模型、回覆長度、畫面效果與 API 資訊也更方便管理。',
    '首頁、存檔、日記、冒險日誌等介面與操作體驗一併改善，排版更整齊，並提升不同螢幕尺寸下的使用體驗。',
    '新手教學與敘事規則改善：教學會沿用目前的角色與情境，卡住時最晚於第 16 個旁白回合自動結束；一般敘事與 NPC 也不會再反覆提醒玩家操作介面或使用道具。'
];

test('v3 update notes stay current, translated, and preserve v2.9 history', async ({ page }) => {
    await openApp(page);

    await page.locator('#home-update-tab').click();
    const drawerLayout = await page.locator('#home-update-drawer').evaluate(drawer => {
        const items = [...drawer.querySelectorAll(':scope > ul > li')]
            .map(item => item.getBoundingClientRect());
        return {
            overflowY: getComputedStyle(drawer).overflowY,
            itemsDoNotOverlap: items.every((item, index) => (
                index === 0 || item.top >= items[index - 1].bottom
            )),
            scrollHeight: drawer.scrollHeight,
            clientHeight: drawer.clientHeight
        };
    });
    expect(drawerLayout.overflowY).toBe('auto');
    expect(drawerLayout.itemsDoNotOverlap).toBe(true);
    expect(drawerLayout.scrollHeight).toBeGreaterThanOrEqual(drawerLayout.clientHeight);

    const notes = await page.evaluate(sourceItems => {
        const drawer = document.querySelector('#home-update-drawer');
        const currentKicker = () => drawer.querySelector(
            ':scope > .home-update-kicker'
        ).textContent.trim();
        const currentItems = () => [...drawer.querySelectorAll(':scope > ul > li')]
            .map(item => item.textContent.trim());
        const historyKickers = [...drawer.querySelectorAll(
            '.home-update-history > .home-update-kicker'
        )];
        const v29Kicker = historyKickers.find(kicker => (
            kicker.textContent.trim().startsWith('v2.9')
        ));
        const source = {
            kicker: currentKicker(),
            items: currentItems(),
            v29Items: [...v29Kicker.nextElementSibling.children]
                .map(item => item.textContent.trim()),
            version: document.querySelector('.setup-version').textContent.trim()
        };
        const localized = {};
        for (const locale of ['en', 'ja']) {
            setUiLanguage(locale, { persist: false, notify: false });
            const expected = sourceItems.map(item => uiText(item));
            localized[locale] = {
                expected,
                kicker: currentKicker(),
                items: currentItems(),
                untranslated: expected.filter((item, index) => (
                    item === sourceItems[index]
                )),
                version: document.querySelector('.setup-version').textContent.trim()
            };
        }
        setUiLanguage('zh-TW', { persist: false, notify: false });
        return { source, localized };
    }, CURRENT_UPDATE);

    expect(notes.source.kicker).toBe('v3.0 更新（07/22）');
    expect(notes.source.items).toEqual(CURRENT_UPDATE);
    expect(notes.source.v29Items).toHaveLength(3);
    expect(notes.source.version).toContain('v3.0 · 2026/07/22');

    for (const locale of ['en', 'ja']) {
        const localized = notes.localized[locale];
        expect(localized.untranslated).toEqual([]);
        expect(localized.items).toEqual(localized.expected);
        expect(localized.kicker).not.toBe(notes.source.kicker);
        expect(localized.version).toContain('v3.0 · 2026/07/22');
    }
});
