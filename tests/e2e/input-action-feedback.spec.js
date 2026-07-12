const { test, expect } = require('@playwright/test');
const { openApp } = require('./test-helpers');

test('game input controls use theme typography and object-only hover shine', async ({ page }) => {
    await openApp(page);
    const baseState = await page.evaluate(() => {
        document.documentElement.style.setProperty('--accent-neon', '#ff78b7');
        document.getElementById('setup-screen').style.display = 'none';
        document.getElementById('game-container').style.display = 'flex';
        const narratorMode = document.getElementById('input-mode-narrator');
        document.querySelectorAll('.input-mode-tab').forEach(button => button.classList.remove('active'));
        narratorMode.classList.add('active');
        const modeStyle = getComputedStyle(narratorMode);
        const inputStyle = getComputedStyle(document.getElementById('player-input'));
        return {
            modeBackground: modeStyle.backgroundColor,
            modeRadius: modeStyle.borderRadius,
            modeShadow: modeStyle.textShadow,
            modeFont: modeStyle.fontFamily,
            inputFont: inputStyle.fontFamily,
            inputWeight: inputStyle.fontWeight,
            stackCount: document.querySelectorAll('.input-action-icon-stack').length,
            glintCount: document.querySelectorAll('.input-action-icon-glint').length
        };
    });

    expect(baseState.modeBackground).toBe('rgba(0, 0, 0, 0)');
    expect(baseState.modeRadius).toBe('0px');
    expect(baseState.modeShadow).toBe('rgb(255, 120, 183) 1px 1px 0px');
    expect(baseState.modeFont).toContain('TRPG Cubic Pixel');
    expect(baseState.inputFont).toContain('TRPG Cubic Pixel');
    expect(baseState.inputWeight).toBe('400');
    expect(baseState.stackCount).toBe(2);
    expect(baseState.glintCount).toBe(2);

    await page.locator('#send-btn').hover();
    const hoverState = await page.locator('#send-btn .input-action-icon-glint').evaluate(element => {
        const style = getComputedStyle(element);
        return {
            opacity: style.opacity,
            animationName: style.animationName,
            animationDuration: style.animationDuration,
            animationTiming: style.animationTimingFunction,
            animationIteration: style.animationIterationCount
        };
    });
    expect(hoverState.opacity).toBe('1');
    expect(hoverState.animationName).toBe('input-action-icon-scan');
    expect(hoverState.animationDuration).toBe('0.72s');
    expect(hoverState.animationTiming).toBe('linear');
    expect(hoverState.animationIteration).toBe('infinite');
});

test('input actions lock immediately and finish feedback before icon gray', async ({ page }) => {
    await openApp(page);
    const sendStart = await page.evaluate(() => {
        const sendButton = document.getElementById('send-btn');
        const diceButton = document.getElementById('dice-btn');
        playInputActionCommitFx(sendButton, 220);
        sendButton.disabled = true;
        diceButton.disabled = true;
        return {
            sendDisabled: sendButton.disabled,
            diceDisabled: diceButton.disabled,
            sendCommit: sendButton.classList.contains('input-action-commit'),
            sendBackground: getComputedStyle(sendButton).backgroundColor,
            sendButtonOpacity: getComputedStyle(sendButton).opacity,
            sendIconOpacity: getComputedStyle(sendButton.querySelector('.input-action-icon-stack')).opacity,
            diceIconOpacity: getComputedStyle(diceButton.querySelector('.input-action-icon-stack')).opacity,
            sendAnimation: getComputedStyle(sendButton.querySelector('.input-action-icon-base')).animationName
        };
    });
    expect(sendStart.sendDisabled).toBe(true);
    expect(sendStart.diceDisabled).toBe(true);
    expect(sendStart.sendCommit).toBe(true);
    expect(sendStart.sendBackground).toBe('rgba(0, 0, 0, 0)');
    expect(sendStart.sendButtonOpacity).toBe('1');
    expect(sendStart.sendIconOpacity).toBe('1');
    expect(sendStart.diceIconOpacity).toBe('0.62');
    expect(sendStart.sendAnimation).toBe('input-action-pixel-press');

    await page.waitForTimeout(100);
    expect(await page.locator('#send-btn').evaluate(button => (
        button.classList.contains('input-action-commit')
    ))).toBe(true);
    await page.waitForTimeout(150);
    expect(await page.locator('#send-btn').evaluate(button => (
        button.classList.contains('input-action-commit')
    ))).toBe(false);

    const diceStart = await page.evaluate(() => {
        const sendButton = document.getElementById('send-btn');
        const diceButton = document.getElementById('dice-btn');
        sendButton.disabled = false;
        diceButton.disabled = false;
        playDiceRollFx();
        sendButton.disabled = true;
        diceButton.disabled = true;
        return {
            rolling: diceButton.classList.contains('dice-rolling'),
            buttonAnimation: getComputedStyle(diceButton).animationName,
            iconAnimation: getComputedStyle(
                diceButton.querySelector('.input-action-icon-base')
            ).animationName,
            diceIconOpacity: getComputedStyle(diceButton.querySelector('.input-action-icon-stack')).opacity,
            sendIconOpacity: getComputedStyle(sendButton.querySelector('.input-action-icon-stack')).opacity
        };
    });
    expect(diceStart.rolling).toBe(true);
    expect(diceStart.buttonAnimation).toBe('dice-roll-shake');
    expect(diceStart.iconAnimation).toBe('dice-icon-turn');
    expect(diceStart.diceIconOpacity).toBe('1');
    expect(diceStart.sendIconOpacity).toBe('0.62');

    await page.waitForTimeout(300);
    expect(await page.locator('#dice-btn').evaluate(button => (
        button.classList.contains('dice-rolling')
    ))).toBe(true);
    await page.waitForTimeout(450);
    const diceEnd = await page.locator('#dice-btn').evaluate(button => ({
        rolling: button.classList.contains('dice-rolling'),
        iconOpacity: getComputedStyle(button.querySelector('.input-action-icon-stack')).opacity
    }));
    expect(diceEnd.rolling).toBe(false);
    expect(diceEnd.iconOpacity).toBe('0.62');
});
