// === [app.js 拆分] app-backup-io.js：原 app.js 第 1216–1570 行｜匯出匯入/sanitize/備份打包/存檔選取/配置匯入｜需依 index.html 既有順序與其他 app-*.js 一同載入，勿單獨重排。 ===
/* ======= 2026-06 desktop export/save menu refinements ======= */
window.journeySelectedSaveIds = window.journeySelectedSaveIds || new Set();

function getJsonClone(value) {
if (typeof clonePersistentValue === 'function') return clonePersistentValue(value);
return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function isPrivateOrImageKey(key) {
const normalized = String(key || '').toLowerCase();
return normalized.includes('apikey')
|| normalized === 'api_key'
|| normalized === 'key'
|| normalized.includes('token')
|| normalized.includes('secret')
|| normalized.includes('homepic')
|| normalized.includes('image')
|| normalized.includes('photo')
|| normalized.includes('picture')
|| normalized.includes('pic');
}

function isAvatarKey(key) {
return String(key || '').toLowerCase().includes('avatar');
}

function stripImagesAndPrivateData(value, key = '') {
if (value === null || value === undefined) return value;
if (typeof value === 'string') {
if (/^(data:image|blob:)/i.test(value.trim())) return isAvatarKey(key) ? value : '';
return value;
}
if (Array.isArray(value)) return value.map(item => stripImagesAndPrivateData(item));
if (typeof value === 'object') {
const output = {};
Object.entries(value).forEach(([childKey, childValue]) => {
if (isPrivateOrImageKey(childKey) && !isAvatarKey(childKey)) return;
output[childKey] = stripImagesAndPrivateData(childValue, childKey);
});
return output;
}
return value;
}

function getPresetExportSections() {
const both = document.getElementById('preset-export-both')?.checked;
const characters = both || document.getElementById('preset-export-characters')?.checked;
const scenarios = both || document.getElementById('preset-export-scenarios')?.checked;
return {
characters: characters || (!characters && !scenarios),
scenarios: scenarios || (!characters && !scenarios)
};
}

function filterPresetForSections(preset, sections = { characters: true, scenarios: true }) {
const safePreset = stripImagesAndPrivateData(getJsonClone(preset || {}));
if (!sections.characters) {
delete safePreset.playerAvatar;
delete safePreset.playerName;
delete safePreset.playerDetails;
delete safePreset.playerStats;
delete safePreset.statsLocked;
delete safePreset.npcs;
delete safePreset.targetName;
delete safePreset.targetPersona;
delete safePreset.targetAvatar;
}
if (!sections.scenarios) delete safePreset.scenarios;
return safePreset;
}

function sanitizePresetCollection(presets, sections = { characters: true, scenarios: true }, presetIds = null) {
const output = {};
const allowed = presetIds ? new Set([...presetIds].map(String)) : null;
Object.entries(presets || {}).forEach(([id, preset]) => {
if (allowed && !allowed.has(String(id))) return;
output[id] = filterPresetForSections(preset, sections);
});
return output;
}

function getPresetIdsReferencedBySaves(saveIds = null) {
const allowedSaves = saveIds ? new Set(saveIds.map(String)) : null;
const output = new Set();
Object.entries(savesData || {}).forEach(([saveId, save]) => {
if (allowedSaves && !allowedSaves.has(String(saveId))) return;
const presetId = valueToText(save?.scenario?.sourcePresetId || save?.scenario?.id);
if (presetId && scenarioPresets?.[presetId]) output.add(presetId);
});
return output;
}

function sanitizeSavesCollection(saves, ids = null) {
const output = {};
const allowed = ids ? new Set(ids.map(String)) : null;
Object.entries(saves || {}).forEach(([id, save]) => {
if (!allowed || allowed.has(String(id))) {
const cleanSave = stripImagesAndPrivateData(getJsonClone(save));
/* 整理日誌用的內部備援不進匯出檔:備份檔本身就是還原手段,帶著會讓檔案膨脹數倍 */
delete cleanSave.memoryLogBackups;
output[id] = cleanSave;
}
});
return output;
}

function buildBackupPayload(saveIds = null, presetSections = { characters: true, scenarios: true }) {
saveCurrentProgress();
const referencedPresetIds = saveIds ? getPresetIdsReferencedBySaves(saveIds) : null;
return {
version: 5,
type: 'journey-notes-backup',
exportedAt: new Date().toISOString(),
saves: sanitizeSavesCollection(savesData, saveIds),
scenarioPresets: sanitizePresetCollection(scenarioPresets, presetSections, referencedPresetIds),
activePresetId,
uiTheme: normalizeUiTheme(uiTheme),
privacy: {
excludes: ['apiKeys', 'homePhoto', 'privateTokens']
}
};
}

function downloadJsonFile(payload, filename) {
const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = filename;
document.body.appendChild(a);
a.click();
a.remove();
URL.revokeObjectURL(url);
}

function goHomeFromSetupNav() {
restoreSaveMenuFromSetupHome();
restoreJournalFromSetupHome();
const setupScreen = document.getElementById('setup-screen');
if (setupScreen) setupScreen.style.display = 'flex';
document.getElementById('save-menu-screen').style.display = 'none';
document.getElementById('journal-screen').style.display = 'none';
showHomeInfoView('main', { force: true });
}
window.goHomeFromSetupNav = goHomeFromSetupNav;

function getSelectedSaveIds() {
return Array.from(window.journeySelectedSaveIds || []).filter(id => savesData[id]);
}

function updateSaveSelectAllState() {
const selectAll = document.getElementById('save-select-all');
if (!selectAll) return;
const ids = Object.keys(savesData || {});
const selected = getSelectedSaveIds();
selectAll.checked = ids.length > 0 && selected.length === ids.length;
selectAll.indeterminate = selected.length > 0 && selected.length < ids.length;
}

function toggleSaveSelection(id, checked) {
if (checked) window.journeySelectedSaveIds.add(String(id));
else window.journeySelectedSaveIds.delete(String(id));
updateSaveSelectAllState();
}

function toggleAllSaveSelection(checked) {
window.journeySelectedSaveIds.clear();
if (checked) Object.keys(savesData || {}).forEach(id => window.journeySelectedSaveIds.add(String(id)));
renderSaveList();
}

function renameSaveTitle(id, value) {
const save = savesData[id];
if (!save) return;
const nextTitle = valueToText(value, '未命名存檔').trim() || '未命名存檔';
save.title = nextTitle;
if (!persistSingleSave(id, '重新命名遊戲存檔')) renderSaveList();
}

function deleteSelectedSaves() {
const ids = getSelectedSaveIds();
if (!ids.length) {
alert(uiText('請先勾選要刪除的記憶紀錄。'));
return;
}
if (!confirm(uiText('確定要刪除 {count} 個記憶紀錄嗎？此操作無法復原。').replace('{count}', ids.length))) return;
const releasedPresetIds = new Set();
ids.forEach(id => {
const removedSave = savesData[id];
const removedPresetId = valueToText(removedSave?.scenario?.sourcePresetId || removedSave?.scenario?.id);
delete savesData[id];
if (!removePersistedSave(id, '刪除遊戲存檔')) { savesData[id] = removedSave; return; }
if (removedPresetId) releasedPresetIds.add(removedPresetId);
localStorage.removeItem(getInputDraftStorageKey(id));
if (currentSaveId === id) currentSaveId = null;
window.journeySelectedSaveIds.delete(String(id));
});
cleanupOrphanDedicatedPresets(releasedPresetIds);
renderSaveList();
}

/* 刪存檔後的孤兒配置清理:只針對「XX 專屬配置」「XX（匯入副本N）」這類
   系統自動產生的配置;名稱不符的(玩家手工模板)一律不動。
   條件:曾被剛刪除的存檔綁定、現在沒有任何存檔在用、且至少保留一組配置。 */
function cleanupOrphanDedicatedPresets(releasedPresetIds) {
if (!releasedPresetIds || !releasedPresetIds.size) return;
const stillClaimed = new Set();
Object.values(savesData || {}).forEach(save => {
const claimedId = valueToText(save?.scenario?.sourcePresetId || save?.scenario?.id);
if (claimedId) stillClaimed.add(claimedId);
});
const orphanIds = [...releasedPresetIds].filter(presetId => scenarioPresets[presetId]
&& !stillClaimed.has(presetId)
&& /(專屬配置|（匯入副本\d*）)$/.test(valueToText(scenarioPresets[presetId].presetName)));
const keepAtLeastOne = Object.keys(scenarioPresets).length - 1;
const deletable = orphanIds.slice(0, Math.max(0, keepAtLeastOne));
if (!deletable.length) return;
if (!confirm(uiText('同時刪除 {count} 個不再使用的專屬配置嗎？').replace('{count}', deletable.length))) return;
const backups = deletable.map(presetId => [presetId, scenarioPresets[presetId]]);
deletable.forEach(presetId => { delete scenarioPresets[presetId]; });
if (!persistJson('sanko_scenario_presets_v2', scenarioPresets, '刪除未使用配置')) {
backups.forEach(([presetId, preset]) => { scenarioPresets[presetId] = preset; });
return;
}
if (!scenarioPresets[activePresetId]) {
activePresetId = Object.keys(scenarioPresets)[0] || '';
try { localStorage.setItem('sanko_active_preset_id', activePresetId); } catch (error) { /* 忽略 */ }
}
if (typeof renderPresetSelector === 'function') renderPresetSelector();
}


function getUniquePresetId(baseId = 'preset_imported') {
let candidate = String(baseId || `preset_imported_${Date.now()}`).replace(/[^\w-]+/g, '_');
if (!candidate || candidate === 'default') candidate = `preset_imported_${Date.now()}`;
if (!scenarioPresets[candidate]) return candidate;
let counter = 1;
while (scenarioPresets[`${candidate}_${counter}`]) counter += 1;
return `${candidate}_${counter}`;
}

function isPlainImportObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function rejectInvalidImportShape() {
    throw new Error('檔案格式不正確或已損毀。');
}

function validateImportedPresetShape(rawPreset) {
    if (!isPlainImportObject(rawPreset)) {
        rejectInvalidImportShape();
    }
    ['playerDetails', 'playerStats'].forEach(field => {
        if (rawPreset[field] !== undefined && !isPlainImportObject(rawPreset[field])) {
            rejectInvalidImportShape();
        }
    });
    if (rawPreset.npcs !== undefined) {
        if (!Array.isArray(rawPreset.npcs)) {
            rejectInvalidImportShape();
        }
        rawPreset.npcs.forEach(npc => {
            if (!isPlainImportObject(npc)) {
                rejectInvalidImportShape();
            }
            if (npc.details !== undefined && !isPlainImportObject(npc.details)) {
                rejectInvalidImportShape();
            }
            if (npc.dynamic !== undefined && !isPlainImportObject(npc.dynamic)) {
                rejectInvalidImportShape();
            }
        });
    }
    if (rawPreset.scenarios !== undefined) {
        if (!Array.isArray(rawPreset.scenarios)) {
            rejectInvalidImportShape();
        }
        rawPreset.scenarios.forEach(scene => {
            if (!isPlainImportObject(scene)) {
                rejectInvalidImportShape();
            }
            if (scene.runtimeSituation !== undefined && !isPlainImportObject(scene.runtimeSituation)) {
                rejectInvalidImportShape();
            }
        });
    }
    if (rawPreset.playerDynamic !== undefined && !isPlainImportObject(rawPreset.playerDynamic)) {
        rejectInvalidImportShape();
    }
    return rawPreset;
}

function validateImportedSaveShape(rawSave) {
    if (!isPlainImportObject(rawSave)) {
        rejectInvalidImportShape();
    }
    if (rawSave.scenario !== undefined) {
        validateImportedPresetShape(rawSave.scenario);
    }
    if (rawSave.scripts !== undefined) {
        if (!Array.isArray(rawSave.scripts) || rawSave.scripts.some(page => !Array.isArray(page))) {
            rejectInvalidImportShape();
        }
    }
    if (rawSave.script !== undefined && !Array.isArray(rawSave.script)) {
        rejectInvalidImportShape();
    }
    return rawSave;
}

function validateImportCollections(saves = {}, presets = {}) {
    if (!isPlainImportObject(saves) || !isPlainImportObject(presets)) {
        rejectInvalidImportShape();
    }
    Object.values(presets).forEach(validateImportedPresetShape);
    Object.values(saves).forEach(validateImportedSaveShape);
    return true;
}

function normalizeImportedPreset(rawPreset, sections = { characters: true, scenarios: true }) {
const base = stripImagesAndPrivateData(getJsonClone(scenarioPresets[activePresetId] || defaultPreset || {}));
const incoming = stripImagesAndPrivateData(getJsonClone(rawPreset || {}));
const output = { ...base, ...incoming };
if (!sections.characters) {
output.playerName = base.playerName || '';
output.playerDetails = base.playerDetails || {};
output.playerStats = base.playerStats || {};
output.npcs = base.npcs || [];
}
if (!sections.scenarios) output.scenarios = base.scenarios || [{ name: '主情境', lore: '', npcRoles: '', playerRole: '', transitionRule: '' }];
output.id = getUniquePresetId(incoming.id || `preset_imported_${Date.now()}`);
output.presetName = valueToText(incoming.presetName || output.presetName, '匯入配置');
output.isLocked = false;
return output;
}

function getPresetImportSignature(preset) {
const copy = stripImagesAndPrivateData(getJsonClone(preset || {}));
delete copy.id;
delete copy.sourcePresetId;
delete copy.isLocked;
delete copy.statsLocked;
delete copy.playerDynamic;
if (Array.isArray(copy.npcs)) {
copy.npcs = copy.npcs.map(npc => {
const cleanNpc = getJsonClone(npc || {});
delete cleanNpc.dynamic;
return cleanNpc;
});
}
if (Array.isArray(copy.scenarios)) {
copy.scenarios = copy.scenarios.map(scene => {
const cleanScene = getJsonClone(scene || {});
delete cleanScene.runtimePlayerPresence;
delete cleanScene.runtimeGuideRole;
return cleanScene;
});
}
return JSON.stringify(copy);
}

function findExistingPresetForImport(preset, options = {}) {
const incomingSignature = getPresetImportSignature(preset);
const incomingName = valueToText(preset?.presetName);
const originalId = valueToText(options.originalId);
const matchByNameAndContent = options.matchByNameAndContent !== false;
return Object.entries(scenarioPresets || {}).find(([, existing]) => {
if (!existing || typeof existing !== 'object') return false;
const sameId = valueToText(existing.id) && (
valueToText(existing.id) === valueToText(preset?.id)
|| (originalId && valueToText(existing.id) === originalId)
);
const sameName = matchByNameAndContent && incomingName && valueToText(existing.presetName) === incomingName;
if (!sameId && !sameName) return false;
return getPresetImportSignature(existing) === incomingSignature;
})?.[0] || '';
}

function importPresetWithoutDuplicate(rawPreset, sections = { characters: true, scenarios: true }, options = {}) {
const preset = normalizeImportedPreset(rawPreset, sections);
const existingId = findExistingPresetForImport(preset, {
originalId: rawPreset?.id || options.originalId,
matchByNameAndContent: options.matchByNameAndContent
});
if (existingId) return { id: existingId, imported: false, preset: scenarioPresets[existingId] };
scenarioPresets[preset.id] = preset;
return { id: preset.id, imported: true, preset };
}

function getSaveImportSignature(save) {
const copy = stripImagesAndPrivateData(getJsonClone(save || {}));
delete copy.date;
delete copy.inputDraft;
delete copy.importedAt;
delete copy.memoryLogBackups;   /* 匯出檔不含此欄位,不算內容差異 */
/* 綁定的配置 ID 不算內容:匯入時可能因「一配置一存檔」被改綁到複製配置,
   若把 ID 算進簽章,重複匯入同一份備份就不會被略過。 */
if (copy.scenario && typeof copy.scenario === 'object') {
delete copy.scenario.sourcePresetId;
delete copy.scenario.id;
delete copy.scenario.presetName;   /* 匯入改綁副本時會改寫,不視為內容差異 */
}
return JSON.stringify(copy);
}

function findExistingSaveForImport(save) {
const signature = getSaveImportSignature(save);
return Object.entries(savesData || {}).find(([, existing]) => {
if (!existing || typeof existing !== 'object') return false;
return getSaveImportSignature(existing) === signature;
})?.[0] || '';
}

function normalizeImportPayload(importedData) {
if (!importedData || typeof importedData !== 'object' || Array.isArray(importedData)) {
return { saves: {}, presets: {} };
}
const saves = importedData.saves || importedData.savesData || {};
const presets = importedData.scenarioPresets || importedData.presets || {};
const normalizedSaves = saves && typeof saves === 'object' && !Array.isArray(saves) ? { ...saves } : {};
const normalizedPresets = presets && typeof presets === 'object' && !Array.isArray(presets) ? { ...presets } : {};
if (importedData.type === 'journey-notes-preset' && importedData.preset && typeof importedData.preset === 'object') {
const presetId = valueToText(importedData.preset.id, `preset_imported_${Date.now()}`);
normalizedPresets[presetId] = importedData.preset;
}
if (importedData.type === 'journey-notes-save' && importedData.save && typeof importedData.save === 'object') {
const saveId = valueToText(importedData.saveId || importedData.id, `save_imported_${Date.now()}`);
normalizedSaves[saveId] = importedData.save;
}
if (!Object.keys(normalizedSaves).length && importedData.scenario && (importedData.scripts || importedData.log || importedData.title)) {
const saveId = valueToText(importedData.id || importedData.saveId, `save_imported_${Date.now()}`);
normalizedSaves[saveId] = importedData;
}
return { saves: normalizedSaves, presets: normalizedPresets };
}

function importPresetConfig(input) {
const file = input.files?.[0];
if (!file) return;
const reader = new FileReader();
reader.onload = event => {
try {
const importedData = JSON.parse(event.target.result);
const importedPresets = importedData.type === 'journey-notes-preset'
? { imported: importedData.preset }
: (importedData.scenarioPresets || importedData.presets || {});
const sections = importedData.exportSections || { characters: true, scenarios: true };
validateImportCollections({}, importedPresets);
let count = 0;
Object.values(importedPresets || {}).forEach(rawPreset => {
if (!rawPreset || typeof rawPreset !== 'object' || Array.isArray(rawPreset)) return;
const result = importPresetWithoutDuplicate(rawPreset, sections);
activePresetId = result.id;
if (!result.imported) return;
count += 1;
});
if (!count) throw new Error('沒有找到可匯入的配置。');
persistJson('sanko_scenario_presets_v2', scenarioPresets, '匯入角色配置');
localStorage.setItem('sanko_active_preset_id', activePresetId);
currentScenario = getJsonClone(scenarioPresets[activePresetId]);
renderPresetSelector();
loadPresetToForm(activePresetId);
renderDesktopPresetOverview();
alert(uiText('已匯入 {count} 個配置。').replace('{count}', count));
} catch (error) {
alert(`匯入配置失敗：${error.message || '檔案格式不正確或已損毀。'}`);
} finally {
input.value = '';
}
};
reader.readAsText(file);
}

        const LANGUAGE_MODE_LABELS = {
            "zh-tw": "繁體中文",
            "en": "English",
            "ja": "日本語",
            "ja-zh": "日文台詞 + 繁中翻譯",
            "en-zh": "英文台詞 + 繁中翻譯",
            "auto": "自動依玩家語言"
        };

