const { test, expect } = require('@playwright/test');
const { openApp } = require('./test-helpers');

function fixtureScenario() {
    return {
        playerName: '\u6e2c\u8a66\u73a9\u5bb6',
        gameDifficulty: 'standard',
        playerStats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 16 },
        playerProficiencies: ['\u5b89\u64ab\u60c5\u7dd2\u8207\u966a\u4f34']
    };
}

test('proficiency adds +2 only when the check is proficient', async ({ page }) => {
    await openApp(page);
    const result = await page.evaluate(scenario => {
        currentScenario = scenario;
        const options = { applySurvivalModifier: false, applyItemModifier: false };
        const withProf = calculateDiceCheck('cha', 'normal', 10, { ...options, proficient: true });
        const withoutProf = calculateDiceCheck('cha', 'normal', 10, { ...options, proficient: false });
        return {
            withProf: {
                roll: withProf.roll,
                proficiencyModifier: withProf.proficiencyModifier,
                totalModifier: withProf.totalModifier,
                total: withProf.total
            },
            withoutProf: {
                proficiencyModifier: withoutProf.proficiencyModifier,
                totalModifier: withoutProf.totalModifier,
                total: withoutProf.total
            }
        };
    }, fixtureScenario());
    expect(result.withProf.roll).toBe(10);
    expect(result.withProf.proficiencyModifier).toBe(2);
    expect(result.withProf.totalModifier).toBe(5);
    expect(result.withProf.total).toBe(15);
    expect(result.withoutProf.proficiencyModifier).toBe(0);
    expect(result.withoutProf.totalModifier).toBe(3);
    expect(result.withoutProf.total).toBe(13);
});

test('option proficiency flag flows into the suggested-check path', async ({ page }) => {
    await openApp(page);
    const result = await page.evaluate(scenario => {
        currentScenario = scenario;
        const inputEl = document.getElementById('player-input');
        const normalized = {
            valid: normalizeOptionEntry({ text: 'a', check: 'cha', difficulty: 'normal', proficient: true }).proficient,
            noCheck: normalizeOptionEntry({ text: 'a', check: 'none', proficient: true }).proficient,
            looseTrue: normalizeOptionEntry({ text: 'a', check: 'cha', proficient: 'yes' }).proficient
        };
        selectOption('a', 'cha', 'normal', true);
        const datasetProficient = inputEl.dataset.diceProficient;
        const applyWithList = shouldApplySuggestedProficiency(inputEl, false);
        const applyNarrator = shouldApplySuggestedProficiency(inputEl, true);
        currentScenario.playerProficiencies = [];
        const applyWithoutList = shouldApplySuggestedProficiency(inputEl, false);
        selectOption('b', '', 'normal', true);
        const datasetNoCheck = inputEl.dataset.diceProficient || '';
        return { normalized, datasetProficient, applyWithList, applyNarrator, applyWithoutList, datasetNoCheck };
    }, fixtureScenario());
    expect(result.normalized.valid).toBe(true);
    expect(result.normalized.noCheck).toBe(false);
    expect(result.normalized.looseTrue).toBe(false);
    expect(result.datasetProficient).toBe('1');
    expect(result.applyWithList).toBe(true);
    expect(result.applyNarrator).toBe(false);
    expect(result.applyWithoutList).toBe(false);
    expect(result.datasetNoCheck).toBe('');
});

test('low SAN option mutation waits for a narrator dice roll', async ({ page }) => {
    await openApp(page);
    const result = await page.evaluate(async scenario => {
        currentScenario = {
            ...scenario,
            scenarios: [{ runtimePlayerPresence: 'absent' }]
        };
        currentScenarioIndex = 0;
        currentHp = 100;
        currentSan = 5;
        creatorInputArmed = false;
        survivalFxHiddenCooldown = 0;
        localStorage.setItem('sanko_survival_fx', 'full');

        const inputEl = document.getElementById('player-input');
        const optionsEl = document.getElementById('options-area');
        optionsEl.innerHTML = '';
        const button = document.createElement('button');
        button.className = 'opt-btn';
        button.dataset.survivalHiddenText = 'hidden choice';
        button.dataset.survivalHiddenCheck = 'wis';
        button.dataset.survivalHiddenDifficulty = 'hard';
        button.dataset.survivalHiddenForceDice = '0';
        optionsEl.appendChild(button);

        const originalSendChoice = sendChoice;
        const originalRandom = Math.random;
        let sendCount = 0;
        sendChoice = async () => {
            sendCount += 1;
        };
        Math.random = () => 0;

        try {
            handleSurvivalOptionClick(button, 'narrator choice', 'int', 'hard', false);
            await new Promise(resolve => window.setTimeout(resolve, 150));
            const narrator = {
                mode: getGameInputMode(),
                interference: shouldApplySurvivalOptionInterference(),
                value: inputEl.value,
                stat: inputEl.dataset.diceStat,
                difficulty: inputEl.dataset.diceDifficulty,
                sendCount,
                mutated: button.classList.contains('survival-option-mutated')
            };

            currentScenario.scenarios[0].runtimePlayerPresence = 'present';
            handleSurvivalOptionClick(button, 'character choice', 'cha', 'normal', false);
            await new Promise(resolve => window.setTimeout(resolve, 150));
            const character = {
                mode: getGameInputMode(),
                interference: shouldApplySurvivalOptionInterference(),
                value: inputEl.value,
                sendCount,
                mutated: button.classList.contains('survival-option-mutated')
            };
            return { narrator, character };
        } finally {
            sendChoice = originalSendChoice;
            Math.random = originalRandom;
        }
    }, fixtureScenario());

    expect(result.narrator.mode).toBe('narrator');
    expect(result.narrator.interference).toBe(false);
    expect(result.narrator.value).toBe('narrator choice');
    expect(result.narrator.stat).toBe('int');
    expect(result.narrator.difficulty).toBe('hard');
    expect(result.narrator.sendCount).toBe(0);
    expect(result.narrator.mutated).toBe(false);
    expect(result.character.mode).toBe('character');
    expect(result.character.interference).toBe(true);
    expect(result.character.value).toBe('hidden choice');
    expect(result.character.sendCount).toBe(1);
    expect(result.character.mutated).toBe(true);
});
