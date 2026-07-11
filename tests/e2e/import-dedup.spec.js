const path = require('path');
const { test, expect } = require('@playwright/test');
const {
    acceptDialogs,
    flushIndexedWrites,
    openApp,
    readImportState
} = require('./test-helpers');

const FIXTURE_PATH = path.resolve(__dirname, '../fixtures/duplicate-save-backup.json');

test('importing the same backup twice does not duplicate saves or presets', async ({ page }) => {
    const dialogMessages = acceptDialogs(page);
    await openApp(page);
    const initialState = await readImportState(page);

    const firstDialogCount = dialogMessages.length;
    await page.locator('#import-input').setInputFiles(FIXTURE_PATH);
    await expect.poll(() => dialogMessages.length).toBeGreaterThan(firstDialogCount);
    await expect.poll(() => page.locator('#import-input').inputValue()).toBe('');
    await flushIndexedWrites(page);

    const firstImportState = await readImportState(page);
    expect(firstImportState.saveIds).toHaveLength(initialState.saveIds.length + 1);
    expect(firstImportState.presetIds).toHaveLength(initialState.presetIds.length + 1);
    expect(firstImportState.saveIds).toContain('fixture_save');
    expect(firstImportState.presetIds).toContain('fixture_preset');
    expect(firstImportState.boundPresetId).toBe('fixture_preset');

    await page.reload();
    await openApp(page);
    expect(await readImportState(page)).toEqual(firstImportState);

    const secondDialogCount = dialogMessages.length;
    await page.locator('#import-input').setInputFiles(FIXTURE_PATH);
    await expect.poll(() => dialogMessages.length).toBeGreaterThan(secondDialogCount);
    await expect.poll(() => page.locator('#import-input').inputValue()).toBe('');
    await flushIndexedWrites(page);

    const secondImportState = await readImportState(page);
    expect(secondImportState).toEqual(firstImportState);
    expect(dialogMessages.length).toBe(secondDialogCount + 1);
});
