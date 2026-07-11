const { test, expect } = require('@playwright/test');
const { openApp } = require('./test-helpers');

const toastCases = [
    {
        locale: 'zh-TW',
        success: '\u5192\u96aa\u7d00\u9304\u5df2\u6574\u7406\uff1b\u82e5\u7d50\u679c\u4e0d\u5982\u9810\u671f\uff0c\u53ef\u6309\u300c\u9084\u539f\u300d\u3002',
        noBackup: '\u9019\u4efd\u5b58\u6a94\u76ee\u524d\u6c92\u6709\u53ef\u5fa9\u539f\u7684\u6574\u7406\u5099\u4efd\u3002'
    },
    {
        locale: 'en',
        success: 'Adventure log organized. If the result is not as expected, press \u201cUndo\u201d.',
        noBackup: 'This save has no organization backup to restore.'
    },
    {
        locale: 'ja',
        success: '\u5192\u967a\u65e5\u8a8c\u3092\u6574\u7406\u3057\u307e\u3057\u305f\u3002\u7d50\u679c\u304c\u671f\u5f85\u3069\u304a\u308a\u3067\u306a\u3044\u5834\u5408\u306f\u300c\u5143\u306b\u623b\u3059\u300d\u3092\u62bc\u3057\u3066\u304f\u3060\u3055\u3044\u3002',
        noBackup: '\u3053\u306e\u30c7\u30fc\u30bf\u306b\u306f\u5fa9\u5143\u3067\u304d\u308b\u6574\u7406\u30d0\u30c3\u30af\u30a2\u30c3\u30d7\u304c\u3042\u308a\u307e\u305b\u3093\u3002'
    }
];

test('journal toast messages follow zh-TW, en and ja on the real page', async ({ page }) => {
    await openApp(page);

    for (const toastCase of toastCases) {
        await page.evaluate(({ locale }) => {
            const saveId = 'toast_i18n_fixture';
            setUiLanguage(locale);
            savesData[saveId] = {
                title: 'Toast Fixture',
                date: 'Fixture',
                log: '\u2022 \u4e8b\u4ef6 A\n\u2022 \u4e8b\u4ef6 A \u91cd\u8907',
                memoryBrief: { story: '', tasks: '', relationships: '' },
                scenario: { playerName: 'Player', npcs: [] },
                importantJournalEntries: [],
                memoryLogBackups: []
            };
            window.requestAIText = async () => JSON.stringify({
                adventure_log: ['\u6574\u5408\u5f8c\u4e8b\u4ef6']
            });
            openAdventureJournal(saveId);
            showHomeInfoView('journal', { force: true });
        }, { locale: toastCase.locale });

        const organizeButton = page.locator('#journal-organize-btn');
        await expect(organizeButton).toBeVisible();
        await expect(organizeButton).toBeEnabled();
        await organizeButton.click();
        await expect(page.locator('.tiny-toast')).toHaveText(toastCase.success);
        await expect(page.locator('.tiny-toast')).toHaveCount(0, { timeout: 3_000 });

        await page.evaluate(() => {
            savesData.toast_i18n_fixture.memoryLogBackups = [];
        });
        const restoreButton = page.locator('button[onclick="restoreSelectedJournalBackup()"]');
        await expect(restoreButton).toHaveCount(1);
        await restoreButton.click();
        await expect(page.locator('.tiny-toast')).toHaveText(toastCase.noBackup);
        await expect(page.locator('.tiny-toast')).toHaveCount(0, { timeout: 3_000 });
    }
});
