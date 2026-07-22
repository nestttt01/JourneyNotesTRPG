const { test, expect } = require('@playwright/test');
const { openApp } = require('./test-helpers');

const TUTORIAL_COPY = {
    'zh-TW': '第一次跑團時，可以在進入遊戲後使用「遊戲教學」功能。教學會直接在目前的角色與情境中啟動，依序帶你完成自由輸入、擲骰、使用道具與好感互動，不需要改用其他預設配置。完成後會繼續目前的故事；若流程卡住，最晚會在 16 個旁白回合後自動結束。',
    en: 'First time playing? After entering the game, use the "Game Tutorial" feature. It starts inside your current characters and scenario and walks you through free input, dice rolls, item use, and affection interactions, with no need to switch to another preset. When it finishes, your current story continues; if the flow gets stuck, the tutorial ends automatically after at most 16 narrator turns.',
    ja: '初めて遊ぶ場合は、ゲームに入ったあと「ゲームチュートリアル」機能を使用できます。現在のキャラクターとシナリオ内で直接始まり、自由入力・ダイス・アイテム使用・好感度のやり取りを順に案内するため、別のプリセットへ切り替える必要はありません。完了後は現在の物語を続行し、進行が止まった場合もナレーター16ターン以内に自動終了します。'
};

test('game guide keeps both surfaces and three locales in sync', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openApp(page);
    await page.evaluate(() => showHomeInfoView('guide'));
    await expect(page.locator('[data-home-view="guide"]')).toBeVisible();

    const guide = await page.evaluate(() => {
        const getText = selector => [...document.querySelectorAll(selector)]
            .map(element => element.textContent.trim());
        const modalSelector = [
            '#tutorial-modal-content .u-inline-018 > .u-inline-019',
            '#tutorial-modal-content .u-inline-018 > .u-inline-020'
        ].join(', ');
        const homeSelector = [
            '[data-home-view="guide"] .setup-info-scroll > h2',
            '[data-home-view="guide"] .setup-info-lead',
            '[data-home-view="guide"] article > h3',
            '[data-home-view="guide"] article > p'
        ].join(', ');

        setUiLanguage('zh-TW', { persist: false, notify: false });
        const sourceHome = getText(homeSelector);
        const sourceModal = getText(modalSelector);
        const localized = {};
        for (const locale of ['en', 'ja']) {
            setUiLanguage(locale, { persist: false, notify: false });
            const expected = sourceHome.map(text => uiText(text));
            localized[locale] = {
                expected,
                home: getText(homeSelector),
                modal: getText(modalSelector),
                untranslated: expected.filter((text, index) => text === sourceHome[index])
            };
        }
        setUiLanguage('zh-TW', { persist: false, notify: false });
        return { sourceHome, sourceModal, localized };
    });

    expect(guide.sourceHome).toHaveLength(43);
    expect(guide.sourceModal).toEqual(guide.sourceHome);

    const homeLayout = await page.locator(
        '[data-home-view="guide"] .setup-info-scroll'
    ).evaluate(container => {
        const leads = [...container.querySelectorAll(':scope > .setup-info-lead')];
        const grid = container.querySelector(':scope > .setup-info-grid');
        const secondLeadRect = leads[1].getBoundingClientRect();
        const gridRect = grid.getBoundingClientRect();
        return {
            leadCount: leads.length,
            secondLeadBottom: secondLeadRect.bottom,
            gridTop: gridRect.top,
            gridHeight: gridRect.height
        };
    });
    expect(homeLayout.leadCount).toBe(2);
    expect(homeLayout.gridTop).toBeGreaterThanOrEqual(homeLayout.secondLeadBottom - 0.5);
    expect(homeLayout.gridHeight).toBeGreaterThan(0);
    expect(guide.sourceHome).toContain(TUTORIAL_COPY['zh-TW']);
    expect(guide.sourceHome.join('\n')).not.toContain('序章：出門前的小演練');

    for (const locale of ['en', 'ja']) {
        const localized = guide.localized[locale];
        expect(localized.untranslated).toEqual([]);
        expect(localized.home).toEqual(localized.expected);
        expect(localized.modal).toEqual(localized.expected);
        expect(localized.home).toContain(TUTORIAL_COPY[locale]);
    }

    await page.setViewportSize({ width: 430, height: 800 });
    const narrowHomeLayout = await page.locator(
        '[data-home-view="guide"] .setup-info-scroll'
    ).evaluate(container => {
        const leads = container.querySelectorAll(':scope > .setup-info-lead');
        const secondLeadRect = leads[1].getBoundingClientRect();
        const gridRect = container.querySelector(
            ':scope > .setup-info-grid'
        ).getBoundingClientRect();
        return {
            secondLeadBottom: secondLeadRect.bottom,
            gridTop: gridRect.top
        };
    });
    expect(narrowHomeLayout.gridTop).toBeGreaterThanOrEqual(
        narrowHomeLayout.secondLeadBottom - 0.5
    );
});
