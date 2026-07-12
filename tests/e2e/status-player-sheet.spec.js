const { test, expect } = require('@playwright/test');
const { openApp } = require('./test-helpers');

test('status player sheet uses the flat G layout and K respec icon', async ({ page }) => {
    await openApp(page);
    await page.evaluate(() => {
        document.documentElement.style.setProperty('--accent-neon', '#ff78b7');
        currentSaveId = 'status-player-sheet-test';
        savesData[currentSaveId] = { respecCount: 2 };
        currentScenario = {
            playerName: '小島秀芙',
            languageMode: 'zh-tw',
            playerStats: { str: 6, dex: 8, con: 10, int: 16, wis: 16, cha: 16 },
            playerDetails: { age: '', speech: '', likes: '', dislikes: '', app: '', bg: '' },
            npcs: [],
            scenarios: []
        };
        currentScenarioIndex = 0;
        currentStorySummary = '';
        currentOpenTasks = '';
        currentRelationshipSummary = '';
        currentAdventureLog = '';
        currentFlags = [];
        currentItems = [];
        openStatusModal();
        switchStatusTab('settings');
    });

    const sheetState = await page.locator('.u-inline-067').evaluate(sheet => {
        const respecButton = sheet.querySelector('.u-inline-065');
        const activeTab = document.querySelector('.status-tab-btn.active');
        const sheetStyle = getComputedStyle(sheet);
        const buttonStyle = getComputedStyle(respecButton);
        const tabStyle = getComputedStyle(activeTab);
        return {
            background: sheetStyle.backgroundColor,
            radius: sheetStyle.borderRadius,
            shadow: sheetStyle.boxShadow,
            playerLabel: sheet.querySelector('.status-player-console-label').textContent.trim(),
            playerName: sheet.querySelector('.u-inline-069').textContent.trim(),
            statLabels: Array.from(sheet.querySelectorAll('.status-stat-item > span'), item => item.textContent.trim()),
            statValues: Array.from(sheet.querySelectorAll('.status-stat-item > strong'), item => item.textContent.trim()),
            statLabelFont: getComputedStyle(sheet.querySelector('.status-stat-item > span')).fontFamily,
            statValueFont: getComputedStyle(sheet.querySelector('.status-stat-item > strong')).fontFamily,
            respecWidth: buttonStyle.width,
            respecHeight: buttonStyle.height,
            respecBackground: buttonStyle.backgroundColor,
            respecTitle: respecButton.title,
            respecIconCount: respecButton.querySelectorAll('.status-respec-icon').length,
            respecUseTarget: respecButton.querySelector('use').getAttribute('href'),
            tabWeight: tabStyle.fontWeight,
            tabShadow: tabStyle.textShadow
        };
    });

    expect(sheetState.background).toBe('rgba(0, 0, 0, 0)');
    expect(sheetState.radius).toBe('0px');
    expect(sheetState.shadow).toBe('none');
    expect(sheetState.playerLabel).toBe('[ PLAYER ]');
    expect(sheetState.playerName).toBe('小島秀芙');
    expect(sheetState.statLabels).toEqual([
        'STR 力量', 'DEX 敏捷', 'CON 體質', 'INT 智力', 'WIS 感知', 'CHA 魅力'
    ]);
    expect(sheetState.statValues).toEqual(['06', '08', '10', '16', '16', '16']);
    expect(sheetState.statLabelFont).toContain('TRPG Cubic Pixel');
    expect(sheetState.statValueFont).toContain('TRPG Cubic Pixel');
    expect(sheetState.respecWidth).toBe('44px');
    expect(sheetState.respecHeight).toBe('44px');
    expect(sheetState.respecBackground).toBe('rgba(0, 0, 0, 0)');
    expect(sheetState.respecTitle).toBe('找守墓人洗點 (剩餘 2 次)');
    expect(sheetState.respecIconCount).toBe(2);
    expect(sheetState.respecUseTarget).toBe('#theme-icon-skull');
    expect(sheetState.tabWeight).toBe('400');
    expect(sheetState.tabShadow).toBe('rgb(255, 120, 183) 1px 1px 0px');

    const respecButton = page.locator('.u-inline-065');
    await respecButton.hover();
    const hoverState = await respecButton.evaluate(button => {
        const glintStyle = getComputedStyle(button.querySelector('.status-respec-icon-glint'));
        return {
            outerBackground: getComputedStyle(button, '::before').backgroundImage,
            glintOpacity: glintStyle.opacity,
            animationName: glintStyle.animationName,
            animationDuration: glintStyle.animationDuration,
            animationTiming: glintStyle.animationTimingFunction,
            animationIteration: glintStyle.animationIterationCount
        };
    });
    expect(hoverState.outerBackground).toBe('none');
    expect(hoverState.glintOpacity).toBe('1');
    expect(hoverState.animationName).toBe('status-respec-icon-scan');
    expect(hoverState.animationDuration).toBe('0.72s');
    expect(hoverState.animationTiming).toBe('linear');
    expect(hoverState.animationIteration).toBe('infinite');

    await page.evaluate(() => {
        window.__respecTestCalls = 0;
        modalRespecStats = () => {
            window.__respecTestCalls += 1;
        };
    });
    await respecButton.click();
    expect(await page.evaluate(() => window.__respecTestCalls)).toBe(1);

    await page.evaluate(() => {
        savesData[currentSaveId].respecCount = 0;
        openStatusModal();
        switchStatusTab('settings');
    });
    const disabledState = await page.locator('.u-inline-066').evaluate(control => ({
        title: control.title,
        opacity: getComputedStyle(control).opacity,
        iconCount: control.querySelectorAll('.status-respec-icon').length
    }));
    expect(disabledState.title).toBe('洗點次數已用盡');
    expect(disabledState.opacity).toBe('0.38');
    expect(disabledState.iconCount).toBe(2);
});
