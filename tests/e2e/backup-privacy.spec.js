const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { acceptDialogs, flushIndexedWrites, openApp } = require('./test-helpers');

const LEGACY_BACKUP_PATH = path.resolve(__dirname, '../fixtures/duplicate-save-backup.json');

const TEST_SECRETS = {
    active: 'TEST_ONLY_ACTIVE_API_SECRET',
    google: 'TEST_ONLY_GOOGLE_API_SECRET',
    openrouter: 'TEST_ONLY_OPENROUTER_API_SECRET',
    anthropic: 'TEST_ONLY_ANTHROPIC_API_SECRET',
    legacy: 'TEST_ONLY_LEGACY_API_SECRET',
    nested: 'TEST_ONLY_NESTED_PRIVATE_SECRET',
    usage: 'TEST_ONLY_USAGE_PRIVATE_SECRET'
};

test('backup payload never exports API credentials', async ({ page }) => {
    await openApp(page);

    const result = await page.evaluate(secrets => {
        apiProvider = 'google';
        apiKey = secrets.active;
        sessionApiKeys.google = secrets.google;
        sessionApiKeys.openrouter = secrets.openrouter;
        sessionApiKeys.anthropic = secrets.anthropic;
        localStorage.setItem('sanko_api_key', secrets.legacy);
        localStorage.setItem('sanko_api_key_google', secrets.google);
        localStorage.setItem('sanko_api_key_openrouter', secrets.openrouter);
        localStorage.setItem('sanko_api_key_anthropic', secrets.anthropic);
        document.getElementById('api-key').value = secrets.active;
        apiUsageStats = { marker: secrets.usage, totalCalls: 99 };

        const avatar = 'data:image/png;base64,TEST_ONLY_AVATAR';
        const scenario = {
            id: 'privacy_preset',
            sourcePresetId: 'privacy_preset',
            presetName: 'Privacy Fixture',
            playerName: 'Test Player',
            playerAvatar: avatar,
            playerStats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
            playerDetails: { age: '', speech: '', likes: '', dislikes: '', app: '', bg: '' },
            apiKey: secrets.nested,
            npcs: [{
                id: 'npc_fixture',
                name: 'Test NPC',
                avatar,
                clientSecret: secrets.nested,
                details: { age: '', speech: '', likes: '', dislikes: '', app: '', bg: '' }
            }],
            scenarios: [{
                name: 'Test Scene',
                lore: 'Safe public lore',
                accessToken: secrets.nested,
                npcRoles: '',
                playerRole: '',
                transitionRule: ''
            }]
        };
        savesData = {
            privacy_save: {
                title: 'Privacy Save',
                date: '2026-07-11 00:00:00',
                scripts: [[]],
                scenario: JSON.parse(JSON.stringify(scenario)),
                api_key: secrets.nested
            }
        };
        scenarioPresets = {
            privacy_preset: {
                ...JSON.parse(JSON.stringify(scenario)),
                privateToken: secrets.nested
            }
        };
        activePresetId = 'privacy_preset';
        currentSaveId = null;

        const payload = buildBackupPayload();
        return {
            payload,
            serialized: JSON.stringify(payload),
            avatar
        };
    }, TEST_SECRETS);

    for (const secret of Object.values(TEST_SECRETS)) {
        expect(result.serialized).not.toContain(secret);
    }
    expect(result.payload.apiUsageStats).toBeUndefined();
    expect(result.payload.uiTheme).toBeUndefined();
    expect(Object.keys(result.payload).sort()).toEqual([
        'activePresetId',
        'exportedAt',
        'privacy',
        'saves',
        'scenarioPresets',
        'type',
        'version'
    ]);
    expect(result.payload.saves.privacy_save.api_key).toBeUndefined();
    expect(result.payload.saves.privacy_save.scenario.apiKey).toBeUndefined();
    expect(result.payload.scenarioPresets.privacy_preset.privateToken).toBeUndefined();
    expect(result.payload.saves.privacy_save.scenario.playerAvatar).toBe(result.avatar);
    expect(result.payload.scenarioPresets.privacy_preset.playerAvatar).toBe(result.avatar);
});

test('importing a legacy backup keeps the current device appearance', async ({ page }) => {
    const dialogMessages = acceptDialogs(page);
    await openApp(page);
    const currentTheme = {
        background: '#123456',
        paper: '#234567',
        surface: '#345678',
        ink: '#456789',
        accent: '#AABBCC',
        dialogue: '#778899',
        heart: '#CC4477'
    };
    const legacyTheme = {
        background: '#F1F1F1',
        paper: '#F2F2F2',
        surface: '#F3F3F3',
        ink: '#111111',
        accent: '#DDEEFF',
        dialogue: '#999999',
        heart: '#FF0000'
    };
    await page.evaluate(theme => applyUiTheme(theme, true), currentTheme);

    const legacyBackup = JSON.parse(fs.readFileSync(LEGACY_BACKUP_PATH, 'utf8'));
    legacyBackup.uiTheme = legacyTheme;
    await page.locator('#import-input').setInputFiles({
        name: 'legacy-theme-backup.json',
        mimeType: 'application/json',
        buffer: Buffer.from(JSON.stringify(legacyBackup))
    });
    await expect.poll(() => dialogMessages.length).toBeGreaterThan(0);
    await flushIndexedWrites(page);

    const importedThemeState = await page.evaluate(() => ({
        runtime: { ...uiTheme },
        stored: JSON.parse(localStorage.getItem(UI_THEME_STORAGE_KEY))
    }));
    expect(importedThemeState.runtime).toEqual(currentTheme);
    expect(importedThemeState.stored).toEqual(currentTheme);

    await page.reload();
    await openApp(page);
    const reloadedThemeState = await page.evaluate(() => ({
        runtime: { ...uiTheme },
        stored: JSON.parse(localStorage.getItem(UI_THEME_STORAGE_KEY))
    }));
    expect(reloadedThemeState.runtime).toEqual(currentTheme);
    expect(reloadedThemeState.stored).toEqual(currentTheme);
});
