const { test, expect } = require('@playwright/test');
const { openApp, acceptDialogs } = require('./test-helpers');

test('dice failure recovery pops the alert and restores player input', async ({ page }) => {
    const dialogs = acceptDialogs(page);
    await openApp(page);
    const result = await page.evaluate(() => {
        currentScenario = { playerName: '\u6e2c\u8a66\u73a9\u5bb6' };
        currentSaveId = null;
        window.saveCurrentProgress = () => {};
        currentChatPageIndex = 0;
        chatScripts = [[
            '\u6e2c\u8a66\u73a9\u5bb6\uff1a\u6211\u8981\u8df3\u904e\u53bb\n(\u7cfb\u7d71\u786c\u5224\u5b9a\uff1aDEX \u654f\u6377\uff5cD20 7 +1 = 8\uff5c\u7d50\u679c\u3010\u5931\u6557\u3011\uff5c\u5224\u5b9a\u7406\u7531\uff1a\u6e2c\u8a66\u3002\u6b64\u7d50\u679c\u7531\u7a0b\u5f0f\u8a08\u7b97\uff0cAI \u4e0d\u5f97\u66f4\u6539\u3002)',
            '\u3010\u7cfb\u7d71\u63d0\u793a\u3011\uff1aDEX \u654f\u6377\uff5c\u5931\u6557\uff5c7+1=8\uff0fDC12'
        ]];
        const dialogueBox = document.getElementById('dialogue-box');
        const baseChildren = dialogueBox.children.length;
        const playerNode = document.createElement('div');
        playerNode.className = 'msg-wrapper';
        dialogueBox.appendChild(playerNode);
        const alertNode = document.createElement('div');
        alertNode.className = 'alert-msg';
        dialogueBox.appendChild(alertNode);
        recoverFromAIFailure(new Error('test network error'), false);
        return {
            chatLength: chatScripts[0].length,
            inputValue: document.getElementById('player-input').value,
            childrenDelta: dialogueBox.children.length - baseChildren
        };
    });
    expect(result.chatLength).toBe(0);
    expect(result.inputValue).toBe('\u6211\u8981\u8df3\u904e\u53bb');
    expect(result.childrenDelta).toBe(0);
    expect(dialogs.length).toBe(1);
});
