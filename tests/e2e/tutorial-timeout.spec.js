const { test, expect } = require('@playwright/test');
const { openApp } = require('./test-helpers');

test('tutorial flag expires only after sixteen narrator turns', async ({ page }) => {
    await openApp(page);
    const state = await page.evaluate(() => {
        currentScenario = {
            playerName: '測試玩家',
            gameDifficulty: 'standard',
            memoryNotesPaused: false,
            npcs: [],
            scenarios: []
        };
        currentScenarioIndex = 0;
        currentHp = 100;
        currentSan = 100;
        currentItems = [];
        itemEffects = {};
        currentAdventureLog = '';
        currentFlags = ['新手教學進行中', '保留旗標'];
        currentChatPageIndex = 0;
        chatScripts = [Array.from(
            { length: 15 },
            (_, index) => `【旁白】：第 ${index + 1} 回合`
        )];
        const notes = [];
        const originalCreateSystemNote = createSystemNote;
        createSystemNote = message => {
            notes.push(message);
        };
        try {
            const applyEmptyTurn = () => applyAIStateChanges(
                { changes: {} },
                '測試行動',
                [],
                []
            );
            applyEmptyTurn();
            const afterFifteen = [...currentFlags];
            chatScripts[0].push('【旁白】：第 16 回合');
            applyEmptyTurn();
            return {
                afterFifteen,
                afterSixteen: [...currentFlags],
                notes
            };
        } finally {
            createSystemNote = originalCreateSystemNote;
        }
    });

    expect(state.afterFifteen).toEqual(['新手教學進行中', '保留旗標']);
    expect(state.afterSixteen).toEqual(['保留旗標']);
    expect(state.notes).toEqual(['新手教學已自動結束，祝旅途愉快！']);
});
