const { test, expect } = require('@playwright/test');
const { openApp } = require('./test-helpers');

async function openCharacterConfig(page, width = 1440, height = 1000) {
    await page.setViewportSize({ width, height });
    await openApp(page);
    await page.evaluate(() => openEditScenario());
}

async function countEditableElements(page) {
    return page.locator('#desktop-player-readonly-preview')
        .locator('input, textarea, select, [contenteditable]')
        .count();
}

test('player card opens a read-only preview before editing (desktop)', async ({ page }) => {
    await openCharacterConfig(page);
    await page.locator('.desktop-player-card').click();

    const preview = page.locator('#desktop-player-readonly-preview');
    const plusButton = page.locator('#desktop-config-editor > .desktop-player-new-preset-btn');
    await expect(preview).toBeVisible();
    await expect(page.locator('#edit-scenario-screen')).toHaveClass(/player-preview-open/);
    expect(await countEditableElements(page)).toBe(0);
    await expect(page.locator('#preset-player-editor')).toBeHidden();
    await expect(preview.locator('.desktop-npc-preview-hero h2')).toBeVisible();
    await expect(preview.locator('.status-stat-item')).toHaveCount(6);
    await expect(plusButton).toBeVisible();
    const plusBoxInPreview = await plusButton.boundingBox();

    await preview.locator('.desktop-npc-preview-tool').click();
    await expect(preview).toBeHidden();
    await expect(page.locator('#edit-scenario-screen')).not.toHaveClass(/player-preview-open/);
    await expect(page.locator('#input-player-name')).toBeVisible();

    const editorReturn = page.locator('#desktop-player-editor-return');
    await expect(editorReturn).toBeVisible();
    await expect(plusButton).toBeVisible();

    const plusBoxInEditor = await plusButton.boundingBox();
    expect(Math.abs(plusBoxInEditor.x - plusBoxInPreview.x)).toBeLessThan(0.5);
    expect(Math.abs(plusBoxInEditor.y - plusBoxInPreview.y)).toBeLessThan(0.5);

    const returnBox = await editorReturn.boundingBox();
    const plusCenter = plusBoxInEditor.y + plusBoxInEditor.height / 2;
    const returnCenter = returnBox.y + returnBox.height / 2;
    expect(Math.abs(plusCenter - returnCenter)).toBeLessThan(1);

    await editorReturn.click();
    await expect(preview).toBeVisible();
    await expect(page.locator('#edit-scenario-screen')).toHaveClass(/player-preview-open/);

    await page.evaluate(() => switchDesktopConfigWorkspace('characters'));
    await expect(page.locator('.desktop-player-card')).toBeVisible();
    await expect(preview).toBeHidden();
});

test('player preview mirrors form data and follows UI language', async ({ page }) => {
    await openCharacterConfig(page);
    await page.evaluate(() => {
        document.getElementById('input-player-name').value = '測試玩家';
        document.getElementById('p-age').value = '17歲／160cm';
        openDesktopPlayerPreview();
    });

    const preview = page.locator('#desktop-player-readonly-preview');
    await expect(preview).toBeVisible();
    await expect(preview.locator('.desktop-npc-preview-hero h2')).toHaveText('測試玩家');
    await expect(preview.locator('.desktop-npc-preview-read-item').first()).toContainText('17歲／160cm');
    expect(await countEditableElements(page)).toBe(0);

    const editButton = preview.locator('.desktop-npc-preview-tool');
    await page.evaluate(() => setUiLanguage('en'));
    await expect(editButton).toHaveText(/Edit/i);
    await page.evaluate(() => setUiLanguage('ja'));
    await expect(editButton).toHaveText(/編集/);
    await page.evaluate(() => setUiLanguage('zh-TW'));
    await expect(editButton).toHaveText(/編輯/);
});

test('player preview stats grid is centered and content width matches editor column', async ({ page }) => {
    await openCharacterConfig(page);
    await page.evaluate(() => openDesktopPlayerPreview());
    const stats = page.locator('.desktop-player-preview-stats');
    await expect(stats).toBeVisible();
    await expect(stats).toHaveCSS('justify-items', 'center');

    const widths = await page.evaluate(() => {
        const editor = document.getElementById('desktop-config-editor');
        const grid = document.querySelector('.desktop-npc-preview-read-grid');
        const chapters = document.querySelector('.desktop-npc-preview-chapters');
        const editorStyle = getComputedStyle(editor);
        const contentWidth = editor.clientWidth
            - parseFloat(editorStyle.paddingLeft) - parseFloat(editorStyle.paddingRight);
        return {
            expected: Math.min(contentWidth * 0.82, 750),
            grid: grid.getBoundingClientRect().width,
            chapters: chapters.getBoundingClientRect().width
        };
    });
    expect(Math.abs(widths.grid - widths.expected)).toBeLessThan(2);
    expect(Math.abs(widths.chapters - widths.expected)).toBeLessThan(2);
});

test('player editor uses the light NPC-style fields', async ({ page }) => {
    await openCharacterConfig(page);
    await page.evaluate(() => openDesktopConfigEditor('player'));
    const ageInput = page.locator('#p-age');
    await expect(ageInput).toBeVisible();
    await expect(ageInput).toHaveCSS('border-top-width', '0px');
    await expect(ageInput).toHaveCSS('border-bottom-width', '1px');
    const sheet = page.locator('#preset-player-editor .anime-sheet');
    await expect(sheet).toHaveCSS('border-top-width', '0px');
    await expect(sheet).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
});

test('mobile single-column preview supports back and edit-return flow', async ({ browser }) => {
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true
    });
    const page = await context.newPage();
    await openApp(page);
    await page.evaluate(() => openEditScenario());

    await page.locator('.desktop-player-card').click();
    const preview = page.locator('#desktop-player-readonly-preview');
    await expect(preview).toBeVisible();
    expect(await countEditableElements(page)).toBe(0);

    const backButton = page.locator('#desktop-config-editor > .mobile-config-editor-back');
    await expect(backButton).toBeVisible();

    await preview.locator('.desktop-npc-preview-tool').click();
    await expect(preview).toBeHidden();
    await expect(page.locator('#input-player-name')).toBeVisible();
    await backButton.click();
    await expect(preview).toBeVisible();
    await expect(page.locator('#edit-scenario-screen')).toHaveClass(/player-preview-open/);

    await backButton.click();
    await expect(preview).toBeHidden();
    await expect(page.locator('#edit-scenario-screen')).not.toHaveClass(/player-preview-open/);
    await expect(page.locator('.desktop-player-card')).toBeVisible();

    await context.close();
});

test('mobile back button anchors to the editor panel like the scenario page', async ({ browser }) => {
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true
    });
    const page = await context.newPage();
    await openApp(page);
    await page.evaluate(() => openEditScenario());

    const readBackOffset = () => page.evaluate(() => {
        const editor = document.getElementById('desktop-config-editor').getBoundingClientRect();
        const back = document.querySelector('#desktop-config-editor > .mobile-config-editor-back').getBoundingClientRect();
        return { top: back.top - editor.top, left: back.left - editor.left };
    });

    await page.evaluate(() => openDesktopConfigEditor('scenario', 0));
    const scenarioOffset = await readBackOffset();
    await page.evaluate(() => switchDesktopConfigWorkspace('characters'));

    await page.evaluate(() => openDesktopPlayerPreview());
    const previewOffset = await readBackOffset();

    expect(Math.abs(previewOffset.top - scenarioOffset.top)).toBeLessThan(1);
    expect(Math.abs(previewOffset.left - scenarioOffset.left)).toBeLessThan(1);

    await context.close();
});
