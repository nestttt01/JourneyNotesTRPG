const { expect } = require('@playwright/test');

async function openApp(page) {
    await page.goto('/');
    await page.waitForFunction(() => (
        typeof buildBackupPayload === 'function'
        && typeof importSaves === 'function'
    ));
    await expect(page.locator('#boot-curtain')).toHaveCount(0, { timeout: 10_000 });
}

function acceptDialogs(page) {
    const messages = [];
    page.on('dialog', async dialog => {
        messages.push(dialog.message());
        await dialog.accept();
    });
    return messages;
}

async function flushIndexedWrites(page) {
    await page.evaluate(async () => {
        await indexedWriteQueue;
    });
}

async function readImportState(page) {
    return page.evaluate(() => {
        const saveIds = Object.keys(savesData || {}).sort();
        const presetIds = Object.keys(scenarioPresets || {}).sort();
        const importedSave = savesData.fixture_save || null;
        return {
            saveIds,
            presetIds,
            boundPresetId: importedSave?.scenario?.sourcePresetId || importedSave?.scenario?.id || '',
            saveSignature: importedSave ? getSaveImportSignature(importedSave) : ''
        };
    });
}

module.exports = {
    acceptDialogs,
    flushIndexedWrites,
    openApp,
    readImportState
};
