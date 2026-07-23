const { test, expect } = require('@playwright/test');
const { openApp } = require('./test-helpers');

async function showGameSurface(page) {
    await page.evaluate(() => {
        document.getElementById('setup-screen').style.display = 'none';
        document.getElementById('game-container').style.display = 'flex';
    });
}

async function beginPresentation(page, check) {
    return page.evaluate(nextCheck => {
        window.__dicePresentationPending = window.playDiceResultPresentation(nextCheck);
        const card = document.getElementById('dice-result-card');
        const overlay = document.getElementById('dice-result-overlay');
        const rollValue = card.querySelector('.roll-value');
        const firstEdge = card.querySelector('.die-edge');
        const outline = card.querySelector('.die-outline');
        return {
            animationDuration: getComputedStyle(card.querySelector('.die-motion')).animationDuration,
            animationName: getComputedStyle(card.querySelector('.die-motion')).animationName,
            edgeStroke: getComputedStyle(firstEdge).stroke,
            facePoints: Array.from(card.querySelectorAll('.die-face'))
                .filter(face => face.style.display !== 'none')
                .map(face => face.getAttribute('points') || ''),
            loadingVisibility: getComputedStyle(document.getElementById('loading')).visibility,
            numberOpacity: getComputedStyle(rollValue).opacity,
            outcome: card.dataset.outcome,
            outlinePath: outline.getAttribute('d'),
            outlineStroke: getComputedStyle(outline).stroke,
            overlayBackground: getComputedStyle(overlay).backgroundColor,
            overlayParent: overlay.parentElement?.tagName || '',
            phase: overlay.dataset.phase,
            rollText: rollValue.textContent
        };
    }, check);
}

async function captureControlledSpinFrames(page, check, elapsedTimes) {
    return page.evaluate(({ nextCheck, elapsedValues }) => {
        window.cancelDiceResultPresentation();
        const originalRequestAnimationFrame = window.requestAnimationFrame;
        const originalCancelAnimationFrame = window.cancelAnimationFrame;
        const originalCos = Math.cos;
        const performanceNowDescriptor = Object.getOwnPropertyDescriptor(performance, 'now');
        const callbacks = new Map();
        const cosineArguments = [];
        let nextFrameId = 1;
        Math.cos = value => {
            cosineArguments.push(value);
            return originalCos(value);
        };
        Object.defineProperty(performance, 'now', {
            configurable: true,
            value: () => 1000
        });
        window.requestAnimationFrame = callback => {
            const frameId = nextFrameId;
            nextFrameId += 1;
            callbacks.set(frameId, callback);
            return frameId;
        };
        window.cancelAnimationFrame = frameId => callbacks.delete(frameId);
        const startedAt = performance.now();

        try {
            window.playDiceResultPresentation(nextCheck);
            const card = document.getElementById('dice-result-card');
            return elapsedValues.map(elapsed => {
                const nextFrame = callbacks.entries().next().value;
                if (!nextFrame) throw new Error('D20 animation frame was not scheduled');
                callbacks.delete(nextFrame[0]);
                cosineArguments.length = 0;
                nextFrame[1](startedAt + elapsed);
                return {
                    edgePaths: Array.from(card.querySelectorAll('.die-edge'))
                        .filter(edge => edge.style.display !== 'none')
                        .map(edge => edge.getAttribute('d') || ''),
                    facePoints: Array.from(card.querySelectorAll('.die-face'))
                        .filter(face => face.style.display !== 'none')
                        .map(face => face.getAttribute('points') || ''),
                    numberOpacity: getComputedStyle(card.querySelector('.roll-value')).opacity,
                    outlinePath: card.querySelector('.die-outline').getAttribute('d'),
                    rotationX: cosineArguments[0]
                };
            });
        } finally {
            window.cancelDiceResultPresentation();
            Math.cos = originalCos;
            if (performanceNowDescriptor) {
                Object.defineProperty(performance, 'now', performanceNowDescriptor);
            } else {
                delete performance.now;
            }
            window.requestAnimationFrame = originalRequestAnimationFrame;
            window.cancelAnimationFrame = originalCancelAnimationFrame;
        }
    }, { nextCheck: check, elapsedValues: elapsedTimes });
}

async function captureControlledSpinFrame(page, check, elapsedMs) {
    const [frame] = await captureControlledSpinFrames(page, check, [elapsedMs]);
    return frame;
}

test('D20 presentation maps B/D/D/C while every spin stays neutral and numberless', async ({ page }) => {
    await openApp(page);
    await showGameSurface(page);
    const cases = [
        { check: { roll: 20, result: '大成功', total: 22, dc: 14 }, outcome: 'critical' },
        { check: { roll: 14, result: '成功', total: 16, dc: 14 }, outcome: 'success' },
        { check: { roll: 6, result: '失敗', total: 8, dc: 14 }, outcome: 'failure' },
        { check: { roll: 1, result: '大失敗', total: 3, dc: 14 }, outcome: 'fumble' },
        { check: { roll: 19, result: '大成功', total: 23, dc: 14 }, outcome: 'success' },
        { check: { roll: 2, result: '大失敗', total: 3, dc: 14 }, outcome: 'failure' }
    ];
    const signatures = [];
    const middleFrameSignatures = [];

    for (const entry of cases) {
        const state = await beginPresentation(page, entry.check);
        expect(state.outcome).toBe(entry.outcome);
        expect(state.phase).toBe('rolling');
        expect(state.numberOpacity).toBe('0');
        expect(state.rollText).toBe(String(entry.check.roll));
        expect(state.animationName).toBe('dice-result-roll-stage');
        expect(state.animationDuration).toBe('1.96s');
        expect(state.loadingVisibility).toBe('hidden');
        expect(state.overlayBackground).toBe('rgba(0, 0, 0, 0)');
        expect(state.overlayParent).toBe('BODY');
        signatures.push({
            edgeStroke: state.edgeStroke,
            facePoints: state.facePoints,
            outlinePath: state.outlinePath,
            outlineStroke: state.outlineStroke
        });
        middleFrameSignatures.push(
            await captureControlledSpinFrame(page, entry.check, 910)
        );
    }

    for (const signature of signatures.slice(1)) {
        expect(signature).toEqual(signatures[0]);
    }
    for (const signature of middleFrameSignatures) {
        expect(signature.numberOpacity).toBe('0');
    }
    for (const signature of middleFrameSignatures.slice(1)) {
        expect(signature).toEqual(middleFrameSignatures[0]);
    }
    await page.evaluate(() => window.cancelDiceResultPresentation());
});

test('D20 geometry updates continuously and visibly eases toward the landing pose', async ({ page }) => {
    await openApp(page);
    await showGameSurface(page);
    const frames = await captureControlledSpinFrames(page, {
        roll: 20,
        result: '大成功',
        total: 22,
        dc: 14
    }, [200, 300, 850, 950, 1660, 1760]);

    expect(frames[2].rotationX).not.toBe(frames[3].rotationX);
    const earlyRotation = Math.abs(frames[1].rotationX - frames[0].rotationX);
    const landingRotation = Math.abs(frames[5].rotationX - frames[4].rotationX);
    expect(earlyRotation).toBeGreaterThan(landingRotation * 2);
});

test('natural 1 contact moves the interface only vertically and leaves the overlay fixed', async ({ page }) => {
    for (const viewport of [
        {
            width: 1280,
            height: 900,
            sequence: ['9px', '-4px', '2px', '-1px', '0px']
        },
        {
            width: 390,
            height: 844,
            sequence: ['6px', '-3px', '1px', '-1px', '0px']
        }
    ]) {
        await page.setViewportSize(viewport);
        await openApp(page);
        await showGameSurface(page);
        await beginPresentation(page, {
            roll: 1,
            result: '大失敗',
            total: 3,
            dc: 14
        });

        const overlayBefore = await page.locator('#dice-result-overlay').boundingBox();
        const survivalBefore = await page.locator('#survival-effects-layer').boundingBox();
        await page.locator('#status-modal-content').evaluate(element => {
            document.getElementById('status-modal').style.display = 'flex';
            element.style.transform = 'translate(48px, 32px)';
        });
        await page.waitForFunction(() => (
            document.getElementById('dice-result-overlay')?.dataset.phase === 'impact'
        ));
        const gameBeforeContact = await page.locator('#game-container').boundingBox();
        await page.waitForFunction(() => document.body.classList.contains('dice-interface-impact'));

        const impactState = await page.evaluate(() => {
            const game = document.getElementById('game-container');
            const animation = game.getAnimations().find(candidate => (
                candidate.animationName === 'dice-result-interface-impact'
            ));
            const statusContent = document.getElementById('status-modal-content');
            const keyframes = animation?.effect?.getKeyframes() || [];
            const keyframeSequence = keyframes
                .map(frame => {
                    const parts = String(frame.translate || '0px').trim().split(/\s+/);
                    return parts[1] || parts[0];
                })
                .filter((value, index, values) => index === 0 || value !== values[index - 1]);
            return {
                duration: animation?.effect?.getTiming().duration || 0,
                keyframes: keyframes.map(frame => frame.translate),
                keyframeSequence,
                statusTransform: getComputedStyle(statusContent).transform
            };
        });
        const overlayDuring = await page.locator('#dice-result-overlay').boundingBox();
        const survivalDuring = await page.locator('#survival-effects-layer').boundingBox();
        const gameDuring = await page.locator('#game-container').boundingBox();

        expect(overlayBefore).not.toBeNull();
        expect(overlayDuring).not.toBeNull();
        expect(survivalBefore).not.toBeNull();
        expect(survivalDuring).not.toBeNull();
        expect(gameBeforeContact).not.toBeNull();
        expect(gameDuring).not.toBeNull();
        expect(Math.abs((overlayDuring?.x || 0) - (overlayBefore?.x || 0))).toBeLessThanOrEqual(0.5);
        expect(Math.abs((overlayDuring?.y || 0) - (overlayBefore?.y || 0))).toBeLessThanOrEqual(0.5);
        expect(Math.abs((survivalDuring?.x || 0) - (survivalBefore?.x || 0))).toBeLessThanOrEqual(0.5);
        expect(Math.abs((survivalDuring?.y || 0) - (survivalBefore?.y || 0))).toBeLessThanOrEqual(0.5);
        expect(Math.abs((gameDuring?.x || 0) - (gameBeforeContact?.x || 0))).toBeLessThanOrEqual(0.5);
        expect(impactState.duration).toBe(280);
        expect(impactState.keyframeSequence).toEqual(viewport.sequence);
        expect(impactState.keyframes.length).toBeGreaterThanOrEqual(5);
        expect(impactState.keyframes.every(translate => (
            !translate || translate === '0px' || translate.startsWith('0px ')
        ))).toBe(true);
        expect(impactState.statusTransform).toBe('matrix(1, 0, 0, 1, 48, 32)');
        expect(await page.locator('#survival-effects-layer').evaluate(element => (
            element.parentElement === document.body
        ))).toBe(true);

        await page.waitForFunction(() => !document.body.classList.contains('dice-interface-impact'));
        await page.evaluate(() => window.cancelDiceResultPresentation());
    }
});

test('reduced motion shows the final face immediately without movement or interface impact', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openApp(page);
    await showGameSurface(page);
    const status = await page.evaluate(async () => {
        const presentationStatus = await window.playDiceResultPresentation({
            roll: 1,
            result: '大失敗',
            total: 3,
            dc: 14
        });
        const card = document.getElementById('dice-result-card');
        return {
            bodyImpact: document.body.classList.contains('dice-interface-impact'),
            impact: card.classList.contains('is-impact'),
            numberOpacity: getComputedStyle(card.querySelector('.roll-value')).opacity,
            phase: document.getElementById('dice-result-overlay').dataset.phase,
            rolling: card.classList.contains('is-rolling'),
            settled: card.classList.contains('is-settled'),
            status: presentationStatus
        };
    });

    expect(status).toEqual({
        bodyImpact: false,
        impact: false,
        numberOpacity: '1',
        phase: 'revealed',
        rolling: false,
        settled: true,
        status: 'revealed'
    });
    await page.evaluate(() => window.cancelDiceResultPresentation());
});

test('a newer roll supersedes the old run and explicit cancellation clears the overlay', async ({ page }) => {
    await openApp(page);
    await showGameSurface(page);
    const result = await page.evaluate(async () => {
        const firstRun = window.playDiceResultPresentation({
            roll: 14,
            result: '成功',
            total: 16,
            dc: 14
        });
        const secondRun = window.playDiceResultPresentation({
            roll: 6,
            result: '失敗',
            total: 8,
            dc: 14
        });
        const firstStatus = await firstRun;
        window.cancelDiceResultPresentation();
        const secondStatus = await secondRun;
        const overlay = document.getElementById('dice-result-overlay');
        return {
            bodyImpact: document.body.classList.contains('dice-interface-impact'),
            firstStatus,
            outcome: document.getElementById('dice-result-card').dataset.outcome,
            overlayVisible: overlay.classList.contains('is-visible'),
            phase: overlay.dataset.phase,
            presentationActive: document.body.classList.contains('dice-presentation-active'),
            secondStatus
        };
    });

    expect(result).toEqual({
        bodyImpact: false,
        firstStatus: 'superseded',
        outcome: 'failure',
        overlayVisible: false,
        phase: 'hidden',
        presentationActive: false,
        secondStatus: 'cancelled'
    });
});

test('sendDiceChoice passes the hard result to presentation and waits for its reveal', async ({ page }) => {
    await openApp(page);
    const result = await page.evaluate(async () => {
        currentScenario = {
            gameDifficulty: 'standard',
            playerName: '測試玩家',
            playerProficiencies: [],
            playerStats: {
                str: 10,
                dex: 10,
                con: 10,
                int: 10,
                wis: 10,
                cha: 10
            }
        };
        const inputEl = document.getElementById('player-input');
        inputEl.value = '跨過倒塌的欄杆';
        inputEl.dataset.diceSuggestedText = inputEl.value;
        inputEl.dataset.diceStat = 'dex';
        inputEl.dataset.diceDifficulty = 'normal';
        const originalPresentation = window.playDiceResultPresentation;
        const originalSendChoice = sendChoice;
        let capturedCheck = null;
        let releasePresentation = null;
        let sendCount = 0;
        window.playDiceResultPresentation = check => {
            capturedCheck = check;
            return new Promise(resolve => {
                releasePresentation = resolve;
            });
        };
        sendChoice = async () => {
            sendCount += 1;
        };

        try {
            const pending = sendDiceChoice();
            while (!capturedCheck || !releasePresentation) {
                await new Promise(resolve => window.setTimeout(resolve, 0));
            }
            const beforeReveal = sendCount;
            releasePresentation('revealed');
            await pending;
            return {
                beforeReveal,
                roll: capturedCheck.roll,
                result: capturedCheck.result,
                sendCount
            };
        } finally {
            window.playDiceResultPresentation = originalPresentation;
            sendChoice = originalSendChoice;
        }
    });

    expect(result.beforeReveal).toBe(0);
    expect(result.roll).toBeGreaterThanOrEqual(1);
    expect(result.roll).toBeLessThanOrEqual(20);
    expect(['大成功', '成功', '失敗', '大失敗']).toContain(result.result);
    expect(result.sendCount).toBe(1);
});

test('a superseded gameplay presentation releases controls when no newer roll owns them', async ({ page }) => {
    await openApp(page);
    const result = await page.evaluate(async () => {
        currentScenario = {
            gameDifficulty: 'standard',
            playerName: '測試玩家',
            playerProficiencies: [],
            playerStats: {
                str: 10,
                dex: 10,
                con: 10,
                int: 10,
                wis: 10,
                cha: 10
            }
        };
        const inputEl = document.getElementById('player-input');
        inputEl.value = '翻過矮牆';
        inputEl.dataset.diceSuggestedText = inputEl.value;
        inputEl.dataset.diceStat = 'dex';
        inputEl.dataset.diceDifficulty = 'normal';
        const originalPresentation = window.playDiceResultPresentation;
        const originalSendChoice = sendChoice;
        let sendCount = 0;
        window.playDiceResultPresentation = async () => 'superseded';
        sendChoice = async () => {
            sendCount += 1;
        };

        try {
            await sendDiceChoice();
            return {
                diceDisabled: document.getElementById('dice-btn').disabled,
                inputDisabled: inputEl.disabled,
                loadingDisplay: document.getElementById('loading').style.display,
                sendCount,
                sendDisabled: document.getElementById('send-btn').disabled
            };
        } finally {
            window.playDiceResultPresentation = originalPresentation;
            sendChoice = originalSendChoice;
        }
    });

    expect(result).toEqual({
        diceDisabled: false,
        inputDisabled: false,
        loadingDisplay: 'none',
        sendCount: 0,
        sendDisabled: false
    });
});

test('body-level survival effects pause outside the game and can resync on return', async ({ page }) => {
    await openApp(page);
    await showGameSurface(page);
    const result = await page.evaluate(() => {
        currentHp = 10;
        currentSan = 10;
        syncSurvivalVisualEffects();
        const activeBeforeExit = document.body.classList.contains('survival-fx-active');
        backToSaveMenu();
        const activeAfterExit = document.body.classList.contains('survival-fx-active');
        const gameHidden = getComputedStyle(document.getElementById('game-container')).display === 'none';

        document.getElementById('save-menu-screen').style.display = 'none';
        document.getElementById('game-container').style.display = 'flex';
        syncSurvivalVisualEffects();
        const activeAfterReturn = document.body.classList.contains('survival-fx-active');
        suspendSurvivalVisualEffects();

        return {
            activeAfterExit,
            activeAfterReturn,
            activeBeforeExit,
            gameHidden,
            survivalParent: document.getElementById('survival-effects-layer').parentElement?.tagName
        };
    });

    expect(result).toEqual({
        activeAfterExit: false,
        activeAfterReturn: true,
        activeBeforeExit: true,
        gameHidden: true,
        survivalParent: 'BODY'
    });
});
