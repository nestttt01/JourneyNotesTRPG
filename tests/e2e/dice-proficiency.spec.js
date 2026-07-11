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
