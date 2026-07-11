const { test, expect } = require('@playwright/test');
const { openApp } = require('./test-helpers');

test('starred journal entries skip AI organizing and return to their spot', async ({ page }) => {
    await openApp(page);
    const result = await page.evaluate(async () => {
        const save = {
            title: 'Journal Fixture',
            log: '\u2022 \u4e8b\u4ef6A\n\u2022 \u4e8b\u4ef6B\n\u2022 \u4e8b\u4ef6C\n\u2022 \u4e8b\u4ef6D',
            importantJournalEntries: [1, 3]
        };
        const capturedPrompts = [];
        window.requestAIText = async prompt => {
            capturedPrompts.push(prompt);
            return JSON.stringify({ adventure_log: ['\u4e8b\u4ef6A\u8207\u4e8b\u4ef6C\u5408\u4f75'] });
        };
        const importantEntries = getImportantAdventureLogEntries(save);
        const organizedLog = await organizeAdventureLogWithAI(save);
        const importantLog = restoreImportantAdventureLogEntries(organizedLog, importantEntries);
        const finalLog = restoreProtectedAdventureLogEntries(save.log, importantLog);
        const remapped = remapImportantJournalEntries(save, importantEntries, finalLog);
        return {
            importantEntries,
            promptCount: capturedPrompts.length,
            promptHasStarred: capturedPrompts[0].includes('\u4e8b\u4ef6B') || capturedPrompts[0].includes('\u4e8b\u4ef6D'),
            promptHasOthers: capturedPrompts[0].includes('\u4e8b\u4ef6A') && capturedPrompts[0].includes('\u4e8b\u4ef6C'),
            finalEntries: splitAdventureLog(finalLog),
            remapped
        };
    });
    expect(result.importantEntries).toEqual([
        { index: 1, text: '\u4e8b\u4ef6B' },
        { index: 3, text: '\u4e8b\u4ef6D' }
    ]);
    expect(result.promptCount).toBe(1);
    expect(result.promptHasStarred).toBe(false);
    expect(result.promptHasOthers).toBe(true);
    expect(result.finalEntries).toEqual(['\u4e8b\u4ef6A\u8207\u4e8b\u4ef6C\u5408\u4f75', '\u4e8b\u4ef6B', '\u4e8b\u4ef6D']);
    expect(result.remapped).toEqual([1, 2]);
});

test('organizing refuses when every entry is starred', async ({ page }) => {
    await openApp(page);
    const message = await page.evaluate(async () => {
        const save = {
            log: '\u2022 \u4e8b\u4ef6A\n\u2022 \u4e8b\u4ef6B',
            importantJournalEntries: [0, 1]
        };
        window.requestAIText = async () => { throw new Error('should not call AI'); };
        try {
            await organizeAdventureLogWithAI(save);
            return '';
        } catch (error) {
            return error.message;
        }
    });
    expect(message).toContain('\u6c92\u6709\u9700\u8981 AI \u6574\u7406\u7684\u5167\u5bb9');
});
