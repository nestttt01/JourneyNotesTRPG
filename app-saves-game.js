// === [app.js 拆分] app-saves-game.js：原 app.js 第 4982–5881 行｜存檔選單與列表/匯出匯入存檔/保存進度/情境管理/系統指令/場景切換｜需依 index.html 既有順序與其他 app-*.js 一同載入，勿單獨重排。 ===
function openSaveMenu() {
refreshApiCredentials();
if(!apiKey || !selectedModel) { alert(`請先驗證 ${getApiProviderLabel()} 金鑰並選擇模型。`); return; }
if (canUseSetupHomeView()) {
embedSaveMenuInSetupHome();
showHomeInfoView('saves');
renderSaveList();
return;
}
document.getElementById('setup-screen').style.display = 'none'; document.getElementById('game-container').style.display = 'none';
document.getElementById('save-menu-screen').style.display = 'flex'; renderSaveList();
}

function backToSetup() { restoreSaveMenuFromSetupHome(); restoreJournalFromSetupHome(); document.getElementById('save-menu-screen').style.display = 'none'; document.getElementById('setup-screen').style.display = 'flex'; showHomeInfoView('main'); }
function backToSaveMenu() {
if (typeof invalidateGameAIRequestContext === 'function') {
invalidateGameAIRequestContext();
}
saveCurrentProgress();
if (journalEmbedded) closeAdventureJournal();
const saveMenuScreen = document.getElementById('save-menu-screen');
const returnToSetupSave = saveMenuScreen?.parentElement?.id === 'setup-save-host'
&& window.matchMedia('(min-width: 1100px)').matches;
setStatusPanelOpen(false);
document.getElementById('game-container').style.display = 'none';
if (returnToSetupSave) {
document.getElementById('setup-screen').style.display = 'flex';
saveMenuScreen.style.display = 'flex';
renderSaveList();
showHomeInfoView('saves', { force: true });
return;
}
restoreSaveMenuFromSetupHome();
document.getElementById('save-menu-screen').style.display = 'flex';
renderSaveList();
}

const SAVE_ORDER_PREF_KEY = 'sanko_save_order_v1';
function readSaveOrderPref() {
    try {
        const parsed = JSON.parse(localStorage.getItem(SAVE_ORDER_PREF_KEY) || '[]');
        return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch (err) { return []; }
}
function persistSaveOrderFromDom() {
    const ids = Array.from(document.querySelectorAll('#save-list .save-slot'))
        .map(el => String(el.dataset.saveId || ''))
        .filter(id => id && savesData[id]);
    try { localStorage.setItem(SAVE_ORDER_PREF_KEY, JSON.stringify(ids)); } catch (err) {}
    renderSaveList();
}
function renderSaveList() {
const listDiv = document.getElementById('save-list');
if (!listDiv) return;
listDiv.innerHTML = '';
updateStorageHealthDisplay();
const saveKeys = Object.keys(savesData || {}).sort((a, b) => String(b).localeCompare(String(a)));
/* 玩家自訂順序(拖曳排序):有記錄的照記錄排,新存檔(未記錄)排最前 */
const savedOrder = readSaveOrderPref();
if (savedOrder.length) {
    const orderPos = new Map(savedOrder.map((sid, i) => [String(sid), i]));
    saveKeys.sort((a, b) => (orderPos.has(a) ? orderPos.get(a) : -1) - (orderPos.has(b) ? orderPos.get(b) : -1));
}
if (saveKeys.length === 0) {
window.journeySelectedSaveIds.clear();
listDiv.innerHTML = `<p class="u-inline-077">${escapeStatusHtml(uiText('目前沒有任何存檔紀錄。'))}</p>`;
updateSaveSelectAllState();
return;
}
saveKeys.forEach(id => {
const saveData = savesData[id] && typeof savesData[id] === 'object' ? savesData[id] : {};
const scenario = getCanonicalScenarioForSave(saveData.scenario && typeof saveData.scenario === 'object' ? saveData.scenario : {}) || {};
const pName = valueToText(scenario.playerName, uiText('玩家'));
const presetId = scenario.sourcePresetId || scenario.id || '';
const presetName = valueToText(scenarioPresets[presetId]?.presetName || scenario.presetName, uiText('未命名配置'));
let tName = '群像劇';
if (Array.isArray(scenario.npcs) && scenario.npcs.length > 0) tName = valueToText(scenario.npcs[0]?.name, tName);
if (scenario.targetName) tName = valueToText(scenario.targetName, tName);
const slotDiv = document.createElement('div');
slotDiv.className = 'save-slot';
slotDiv.dataset.saveId = String(id);
slotDiv.onclick = event => {
if (event.target.closest('input, button, label, .reorder-handle')) return;
loadGame(id);
};
const dragHandle = document.createElement('span');
dragHandle.className = 'reorder-handle';
dragHandle.textContent = '\u2630';
dragHandle.setAttribute('data-no-i18n', '1');
dragHandle.title = uiText('\u62d6\u62fd\u6392\u5e8f');
dragHandle.setAttribute('aria-label', uiText('\u62d6\u62fd\u6392\u5e8f'));
const main = document.createElement('div');
main.className = 'save-slot-main';
const titleInput = document.createElement('input');
titleInput.className = 'save-title-input save-title';
titleInput.value = valueToText(saveData.title, uiText('未命名存檔'));
titleInput.setAttribute('aria-label', uiText('修改記憶紀錄檔名'));
titleInput.onclick = event => event.stopPropagation();
titleInput.onchange = event => renameSaveTitle(id, event.target.value);
titleInput.onkeydown = event => {
if (event.key === 'Enter') {
event.preventDefault();
event.currentTarget.blur();
}
};
const info = document.createElement('div');
info.className = 'save-info';
const locale = uiLocale();
info.innerText = locale === 'en'
? `Preset: ${presetName}\nPartner/NPC: ${tName} | Player: ${pName}\nLast played: ${saveData.date || ''}`
: locale === 'ja'
? `設定：${presetName}\n相手/NPC：${tName}｜プレイヤー：${pName}\n最終プレイ：${saveData.date || ''}`
: `配置：${presetName}\n代表NPC: ${tName}｜玩家: ${pName}\n最後遊玩：${saveData.date || ''}`;
const frame = document.createElement('label');
frame.className = 'save-select-frame';
frame.setAttribute('aria-label', uiText('選取此記憶紀錄'));
frame.onclick = event => event.stopPropagation();
const checkbox = document.createElement('input');
checkbox.type = 'checkbox';
checkbox.className = 'save-select-box';
checkbox.checked = window.journeySelectedSaveIds.has(String(id));
checkbox.onchange = event => toggleSaveSelection(id, event.target.checked);
main.appendChild(titleInput);
main.appendChild(info);
frame.appendChild(checkbox);
slotDiv.appendChild(dragHandle);
slotDiv.appendChild(main);
slotDiv.appendChild(frame);
listDiv.appendChild(slotDiv);
if (typeof enableReorderDrag === 'function') {
    enableReorderDrag(dragHandle, slotDiv, listDiv, '.save-slot', () => persistSaveOrderFromDom());
}
});
updateSaveSelectAllState();
}

        function createNewSave() {
            const defaultName = `群像劇紀錄 - ${new Date().toLocaleDateString()}`;
            
            const userInput = prompt("準備進入遊戲！請為這次存檔命名：", defaultName);
            if (userInput === null) return; 

            const saveName = userInput.trim() || defaultName;
            const id = Date.now().toString();
            const selectedPreset = scenarioPresets[activePresetId] || defaultPreset;
            const freshScenario = createFreshScenarioFromPreset(selectedPreset);
            const newSave = { title: saveName, date: new Date().toLocaleString(), hp: 100, san: 100, items: [], scenIndex: 0, chatPageIndex: 0, scripts: [[]], log: "• 故事剛開始，目前尚無重大事件發生。", memoryBrief: { story: "", tasks: "", relationships: "" }, flags: [], inputDraft: '', respecCount: 3, scenario: freshScenario };
            /* 一配置一存檔:所選配置已被其他存檔綁走時,自動複製一份給新局
               (比照「另存新檔」的專屬配置模式),避免兩局經雙向同步互相感染。 */
            let boundPresetId = activePresetId;
            const presetClaimed = Object.values(savesData || {}).some(existingSave => {
                const claimedId = valueToText(existingSave?.scenario?.sourcePresetId || existingSave?.scenario?.id);
                return claimedId && claimedId === valueToText(activePresetId);
            });
            if (presetClaimed && scenarioPresets[activePresetId]) {
                let clonePresetId = 'preset_' + Date.now();
                while (scenarioPresets[clonePresetId]) clonePresetId = `preset_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
                const presetClone = getJsonClone(scenarioPresets[activePresetId]);
                presetClone.id = clonePresetId;
                presetClone.presetName = `${saveName} 專屬配置`;
                presetClone.isLocked = false;
                scenarioPresets[clonePresetId] = presetClone;
                if (persistJson('sanko_scenario_presets_v2', scenarioPresets, '角色配置')) {
                    boundPresetId = clonePresetId;
                    activePresetId = clonePresetId;
                    localStorage.setItem('sanko_active_preset_id', activePresetId);
                    if (typeof renderPresetSelector === 'function') renderPresetSelector();
                } else {
                    /* 複製配置存不進去時退回舊行為(共綁原配置),至少不擋開局 */
                    delete scenarioPresets[clonePresetId];
                }
            }
            newSave.scenario.sourcePresetId = boundPresetId;
            newSave.scenario.id = boundPresetId;
            if (scenarioPresets[boundPresetId]?.presetName) newSave.scenario.presetName = scenarioPresets[boundPresetId].presetName;
            savesData[id] = newSave;
            if (!persistSingleSave(id, '遊戲存檔')) { delete savesData[id]; return; }
            loadGame(id);
            /* 一次性新手指路(2026/07/10):人生第一次開新局——不論用哪個配置——
               對話欄丟一則系統提示指向教學資源;旗標記在 localStorage,只出現這一次。 */
            if (!localStorage.getItem('sanko_tutorial_hint_shown_v1')) {
                localStorage.setItem('sanko_tutorial_hint_shown_v1', '1');
                const hintText = '第一次跑團嗎？首頁側邊的「遊戲玩法」有完整指南；想被牽著走一遍基本操作，可改用預設配置的「序章：出門前的小演練」。';
                if (typeof createSystemNote === 'function') createSystemNote((typeof uiText === 'function') ? uiText(hintText) : hintText);
            }
        }


function exportSaves() {
const hasSaves = Object.keys(savesData || {}).length > 0;
const hasPresets = Object.keys(scenarioPresets || {}).length > 0;
if (!hasSaves && !hasPresets) {
alert(uiText('目前沒有資料可以匯出。'));
return;
}
const selectedIds = getSelectedSaveIds();
const payload = buildBackupPayload(selectedIds.length ? selectedIds : null);
const scopeName = selectedIds.length ? 'Selected_Saves' : 'Backup';
downloadJsonFile(payload, `Journey_Notes_${scopeName}_${new Date().toISOString().slice(0,10)}.json`);
localStorage.setItem(LAST_BACKUP_STORAGE_KEY, new Date().toISOString());
updateStorageHealthDisplay();
}

function exportCurrentPreset() {
syncEditingDataFromDOM();
const sections = getPresetExportSections();
const sourcePreset = scenarioPresets[activePresetId]
|| gatherPresetData(activePresetId || `preset_${Date.now()}`, document.getElementById('input-preset-name')?.value?.trim() || '未命名配置');
const safePreset = filterPresetForSections(sourcePreset, sections);
const payload = {
version: 2,
type: 'journey-notes-preset',
exportedAt: new Date().toISOString(),
exportSections: sections,
preset: safePreset,
privacy: {
excludes: ['apiKeys', 'homePhoto', 'privateTokens']
}
};
const safeName = valueToText(safePreset.presetName, '未命名配置').replace(/[\\/:*?"<>|]+/g, '_').slice(0, 48);
downloadJsonFile(payload, `Journey_Notes_Preset_${safeName}_${new Date().toISOString().slice(0,10)}.json`);
alert(uiText('已匯出 {count} 份資料。').replace('{count}', '1'));
}

function importSaves(input) {
const file = input.files?.[0];
if (!file) return;
const reader = new FileReader();
reader.onload = event => {
try {
const preservedUiLanguage = window.getUiLanguage ? getUiLanguage() : null;
const importedData = JSON.parse(event.target.result);
const normalizedImport = normalizeImportPayload(importedData);
const importedSaves = normalizedImport.saves;
const importedPresets = normalizedImport.presets;
validateImportCollections(importedSaves, importedPresets);
if ((!importedSaves || typeof importedSaves !== 'object' || Array.isArray(importedSaves))
&& (!importedPresets || typeof importedPresets !== 'object' || Array.isArray(importedPresets))) {
throw new Error('沒有可用的存檔或角色配置');
}
let presetCount = 0;
let saveCount = 0;
let skippedSaveCount = 0;
const presetIdMap = {};
Object.entries(importedPresets || {}).forEach(([sourceId, rawPreset]) => {
if (!rawPreset || typeof rawPreset !== 'object' || Array.isArray(rawPreset)) return;
const result = importPresetWithoutDuplicate(rawPreset, { characters: true, scenarios: true }, {
originalId: sourceId,
matchByNameAndContent: false
});
presetIdMap[sourceId] = result.id;
if (rawPreset.id) presetIdMap[rawPreset.id] = result.id;
if (!result.imported) return;
presetCount += 1;
});
/* 一配置一存檔:先盤點已被本機既有存檔綁走的配置。
   配置與存檔之間是雙向同步(syncBoundPresetFromCurrentScenario ←→ getCanonicalScenarioForSave),
   兩個存檔共綁一個配置會互相感染,匯入時必須拆開。 */
const claimedPresetIds = new Set();
Object.values(savesData || {}).forEach(existingSave => {
const claimedId = valueToText(existingSave?.scenario?.sourcePresetId || existingSave?.scenario?.id);
if (claimedId) claimedPresetIds.add(claimedId);
});
let clonedPresetCount = 0;
Object.entries(importedSaves || {}).forEach(([sourceId, rawSave]) => {
if (!rawSave || typeof rawSave !== 'object' || Array.isArray(rawSave)) return;
const targetId = savesData[sourceId] ? `save_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` : sourceId;
const copiedSave = stripImagesAndPrivateData(getJsonClone(rawSave));
const originalPresetId = copiedSave.scenario?.sourcePresetId || copiedSave.scenario?.id || '';
const mappedPresetId = originalPresetId ? valueToText(presetIdMap[originalPresetId]) : '';
if (mappedPresetId) {
copiedSave.scenario.sourcePresetId = mappedPresetId;
if (copiedSave.scenario.id === originalPresetId) {
copiedSave.scenario.id = mappedPresetId;
}
}
if (findExistingSaveForImport(copiedSave)) {
skippedSaveCount += 1;
return;
}
if (!mappedPresetId && copiedSave.scenario && typeof copiedSave.scenario === 'object') {
const reusablePresetId = originalPresetId
&& scenarioPresets[originalPresetId]
&& getPresetImportSignature(scenarioPresets[originalPresetId]) === getPresetImportSignature(copiedSave.scenario)
? originalPresetId
: '';
if (reusablePresetId) {
copiedSave.scenario.sourcePresetId = reusablePresetId;
copiedSave.scenario.id = reusablePresetId;
} else {
const snapshotId = getUniquePresetId(originalPresetId || `preset_imported_${Date.now()}`);
const importedSnapshot = createPresetSnapshotFromScenario(copiedSave.scenario);
importedSnapshot.id = snapshotId;
importedSnapshot.presetName = valueToText(importedSnapshot.presetName, '未命名配置');
importedSnapshot.isLocked = false;
scenarioPresets[snapshotId] = importedSnapshot;
copiedSave.scenario.sourcePresetId = snapshotId;
copiedSave.scenario.id = snapshotId;
copiedSave.scenario.presetName = importedSnapshot.presetName;
clonedPresetCount += 1;
}
}
/* 綁定的配置已被其他存檔占用 → 複製一份配置給這個匯入存檔,徹底切斷共用 */
const boundPresetId = valueToText(copiedSave.scenario?.sourcePresetId || copiedSave.scenario?.id);
if (boundPresetId && scenarioPresets[boundPresetId] && claimedPresetIds.has(boundPresetId)) {
const cloneId = getUniquePresetId(`preset_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`);
const presetClone = getJsonClone(scenarioPresets[boundPresetId]);
presetClone.id = cloneId;
const baseCloneName = valueToText(presetClone.presetName, '未命名配置');
const existingNames = new Set(Object.values(scenarioPresets).map(preset => valueToText(preset?.presetName)));
let cloneName = `${baseCloneName}（匯入副本）`;
for (let n = 2; existingNames.has(cloneName); n += 1) cloneName = `${baseCloneName}（匯入副本${n}）`;
presetClone.presetName = cloneName;
presetClone.isLocked = false;
scenarioPresets[cloneId] = presetClone;
clonedPresetCount += 1;
if (copiedSave.scenario && typeof copiedSave.scenario === 'object') {
copiedSave.scenario.sourcePresetId = cloneId;
if (copiedSave.scenario.id === boundPresetId || !copiedSave.scenario.id) copiedSave.scenario.id = cloneId;
copiedSave.scenario.presetName = presetClone.presetName;
}
claimedPresetIds.add(cloneId);
} else if (boundPresetId) {
claimedPresetIds.add(boundPresetId);
}
savesData[targetId] = copiedSave;
saveCount += 1;
});
presetCount += clonedPresetCount;
if (!saveCount && !presetCount && !skippedSaveCount) throw new Error('沒有可用的存檔或角色配置');
const presetsPersisted = persistJson('sanko_scenario_presets_v2', scenarioPresets, '匯入角色配置');
const savesPersisted = persistJson('sanko_saves_v8', savesData, '匯入存檔');
if (!presetsPersisted || !savesPersisted) {
throw new Error('無法寫入瀏覽器資料庫。請先匯出備份，並確認瀏覽器沒有封鎖本機儲存。');
}
const importedActivePresetId = valueToText(importedData.activePresetId);
const restoredActivePresetId = valueToText(presetIdMap[importedActivePresetId])
|| (scenarioPresets[importedActivePresetId] ? importedActivePresetId : '');
if (restoredActivePresetId) {
activePresetId = restoredActivePresetId;
localStorage.setItem('sanko_active_preset_id', activePresetId);
}
if (importedData.uiTheme && typeof importedData.uiTheme === 'object' && !Array.isArray(importedData.uiTheme)) {
applyUiTheme(importedData.uiTheme, true);
}
renderPresetSelector();
renderSaveList();
if (preservedUiLanguage && window.setUiLanguage) {
setUiLanguage(preservedUiLanguage, { persist: false, notify: false });
} else if (window.translateUi) {
translateUi(document.body);
}
if (!saveCount && !presetCount && skippedSaveCount) {
alert(uiText('沒有新增資料，已略過 {count} 個重複存檔。').replace('{count}', skippedSaveCount));
} else {
const skippedText = skippedSaveCount
? uiText('略過 {count} 個重複存檔。').replace('{count}', skippedSaveCount)
: '';
alert(uiText('匯入完成：{saveCount} 個存檔、{presetCount} 個角色配置。{skippedText}')
.replace('{saveCount}', saveCount)
.replace('{presetCount}', presetCount)
.replace('{skippedText}', skippedText));
}
} catch (error) {
alert(`匯入失敗：${error.message || '檔案格式不正確或已損毀。'}`);
} finally {
input.value = '';
}
};
reader.readAsText(file);
}

        function saveCurrentProgress() {
            if(!currentSaveId || !savesData[currentSaveId]) return false;
            savesData[currentSaveId].scripts = chatScripts;
            savesData[currentSaveId].chatPageIndex = currentChatPageIndex;
            savesData[currentSaveId].hp = normalizeSurvivalValue(currentHp, 100);
            savesData[currentSaveId].san = normalizeSurvivalValue(currentSan, 100);
            savesData[currentSaveId].survivalState = {
                graceTurns: Math.max(0, Math.min(3, Math.floor(Number(survivalGraceTurns)) || 0)),
                pendingLastStand: pendingLastStand === true,
                pendingLastStandReason: pendingLastStand
                    ? valueToText(pendingLastStandReason).slice(0, 80)
                    : '',
                restJustUsed: restJustUsed === true
            };
            savesData[currentSaveId].items = currentItems;
            savesData[currentSaveId].itemEffects = itemEffects;
            savesData[currentSaveId].achievementCount = achievementCount;
            savesData[currentSaveId].growthSpent = growthSpent;
            savesData[currentSaveId].completedObjectives = completedObjectives;
            savesData[currentSaveId].scenIndex = currentScenarioIndex;
            savesData[currentSaveId].date = new Date().toLocaleString();
            savesData[currentSaveId].log = currentAdventureLog;
            savesData[currentSaveId].memoryBrief = {
                story: currentStorySummary,
                tasks: currentOpenTasks,
                relationships: currentRelationshipSummary
            };
            savesData[currentSaveId].flags = currentFlags;
const currentInputDraft = document.getElementById('player-input')?.value || '';
savesData[currentSaveId].inputDraft = currentInputDraft;
            try {
                const draftKey = getInputDraftStorageKey(currentSaveId);
                if (currentInputDraft) localStorage.setItem(draftKey, currentInputDraft);
                else localStorage.removeItem(draftKey);
            } catch (error) {
                console.warn('輸入草稿暫存失敗', error);
            }
    if (currentScenario && typeof currentScenario === 'object') {
        const boundPresetId = currentScenario.sourcePresetId
            || (currentScenario.id && scenarioPresets?.[currentScenario.id] ? currentScenario.id : '')
            || (activePresetId && scenarioPresets?.[activePresetId] ? activePresetId : '');
        if (boundPresetId) currentScenario.sourcePresetId = boundPresetId;
    }
    syncBoundPresetFromCurrentScenario();
    const scenarioForSave = getCanonicalScenarioForSave(currentScenario);
savesData[currentSaveId].scenario = scenarioForSave;
currentScenario = scenarioForSave;
savesData[currentSaveId].sceneTransition = pendingSceneTransition;
delete savesData[currentSaveId].script;
const saved = persistSingleSave(currentSaveId, '遊戲存檔');
if (saved && typeof showSavedPip === 'function') showSavedPip();
return saved;
}

function syncBoundPresetFromCurrentScenario() {
if (!currentScenario || typeof currentScenario !== 'object') return false;
const sourceId = currentScenario.sourcePresetId
|| (currentScenario.id && scenarioPresets?.[currentScenario.id] ? currentScenario.id : '')
|| '';
if (!sourceId || !scenarioPresets?.[sourceId]) return false;
const previousPreset = scenarioPresets[sourceId];
if (previousPreset.isLocked) return false;
const syncPreset = createPresetSnapshotFromScenario(currentScenario);
syncPreset.id = sourceId;
syncPreset.presetName = previousPreset.presetName;
syncPreset.isLocked = false;
syncPreset.statsLocked = previousPreset.statsLocked !== undefined ? previousPreset.statsLocked : true;
scenarioPresets[sourceId] = syncPreset;
if (!persistJson('sanko_scenario_presets_v2', scenarioPresets, '角色配置')) {
scenarioPresets[sourceId] = previousPreset;
return false;
}
return true;
}

function getInputDraftStorageKey(saveId = currentSaveId) {
return `sanko_input_draft_${saveId || 'none'}`;
}

        function persistActiveInputDraft() {
            if (activeInputDraftTimer) {
                clearTimeout(activeInputDraftTimer);
                activeInputDraftTimer = null;
            }
            if (!currentSaveId || !savesData[currentSaveId]) return;
            const draft = document.getElementById('player-input')?.value || '';
            savesData[currentSaveId].inputDraft = draft;
            try {
                const key = getInputDraftStorageKey();
                if (draft) localStorage.setItem(key, draft);
                else localStorage.removeItem(key);
            } catch (error) {
                console.warn('輸入草稿暫存失敗', error);
            }
        }

        function scheduleInputDraftSave(delay = 300) {
            if (!currentSaveId || !savesData[currentSaveId]) return;
            if (activeInputDraftTimer) clearTimeout(activeInputDraftTimer);
            activeInputDraftTimer = setTimeout(persistActiveInputDraft, delay);
        }

        function syncVisibleGameEditsForSave() {
            if (!currentSaveId || !savesData[currentSaveId]) return;
            const statusModal = document.getElementById('status-modal');
            if (statusModal?.style.display === 'block') syncDomToCurrentScenario();
        }

        function flushActiveGameSave() {
            if (activeGameSaveTimer) {
                clearTimeout(activeGameSaveTimer);
                activeGameSaveTimer = null;
            }
            if (!currentSaveId || !savesData[currentSaveId]) return;
            try {
                persistActiveInputDraft();
                syncVisibleGameEditsForSave();
                saveCurrentProgress();
            } catch (error) {
                console.warn('背景自動存檔失敗', error);
            }
        }

        function flushLifecycleGameSave() {
            const now = Date.now();
            if (now - lastLifecycleSaveAt < 700) return;
            lastLifecycleSaveAt = now;
            flushActiveGameSave();
        }

        function scheduleActiveGameSave(delay = 900) {
            if (!currentSaveId || !savesData[currentSaveId]) return;
            if (activeGameSaveTimer) clearTimeout(activeGameSaveTimer);
            activeGameSaveTimer = setTimeout(flushActiveGameSave, delay);
        }

        document.addEventListener('input', event => {
            if (event.target?.id === 'player-input') scheduleInputDraftSave();
            else if (event.target?.closest?.('#status-modal-content')) scheduleActiveGameSave();
        }, true);
        document.addEventListener('change', event => {
            if (event.target?.id === 'player-input') scheduleInputDraftSave(100);
            else if (event.target?.closest?.('#status-modal-content')) scheduleActiveGameSave(250);
        }, true);
        document.addEventListener('paste', event => {
            if (event.target?.id === 'player-input') setTimeout(() => scheduleInputDraftSave(100), 0);
            else if (event.target?.closest?.('#status-modal-content')) setTimeout(() => scheduleActiveGameSave(250), 0);
        }, true);
        document.addEventListener('compositionend', event => {
            if (event.target?.id === 'player-input') scheduleInputDraftSave(100);
            else if (event.target?.closest?.('#status-modal-content')) scheduleActiveGameSave(250);
        }, true);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') flushLifecycleGameSave();
            else retryPendingIndexedWrites();
        });
        window.addEventListener('pagehide', flushLifecycleGameSave);
        window.addEventListener('pageshow', retryPendingIndexedWrites);

        function createBlankScenario(name = '新情境') {
            return { name, lore: '', npcRoles: '', playerRole: '', transitionRule: '' };
        }

        function refreshGameLocationSelect() {
            const locSelect = document.getElementById('btn-location');
            if (!locSelect) return;
            locSelect.innerHTML = '';
            (currentScenario.scenarios || []).forEach((sc, i) => {
                const opt = document.createElement('option');
                opt.value = i;
                opt.innerText = `✦ ${sc.name || '未命名'}`;
                if (i === currentScenarioIndex) opt.selected = true;
                locSelect.appendChild(opt);
            });
        }

        function addScenarioToCurrentGame(scenario) {
            if (!Array.isArray(currentScenario.scenarios)) currentScenario.scenarios = [];
            currentScenario.scenarios.push(scenario);
            const newIndex = currentScenario.scenarios.length - 1;
            chatScripts[newIndex] = [];
            refreshGameLocationSelect();
            return newIndex;
        }

        function openStatusScenarioEditor(scenarioIndex) {
            activeStatusTab = 'settings';
            openStatusModal();
            switchStatusTab('settings');
            requestAnimationFrame(() => {
                const input = document.getElementById(`edit-scen-name-${scenarioIndex}`);
                const card = input?.closest('details');
                if (card) {
                    card.open = true;
                    card.scrollIntoView({ block: 'start', behavior: 'smooth' });
                }
                if (input) {
                    input.focus();
                    input.select();
                }
            });
        }

        function addMidGameScenarioAndEdit() {
            if (document.getElementById('status-modal')?.style.display === 'block') syncDomToCurrentScenario();
            const newIndex = addScenarioToCurrentGame(createBlankScenario());
            changeScenario(newIndex);
            openStatusScenarioEditor(newIndex);
        }

        function confirmMidGameScenario() {
            const name = document.getElementById('mid-scen-name').value.trim() || '未知領域';
            const lore = document.getElementById('mid-scen-lore').value.trim();
            const npcRoles = document.getElementById('mid-scen-npcs').value.trim();
            const playerRole = document.getElementById('mid-scen-player').value.trim();
            const transitionRule = document.getElementById('mid-scen-transition').value.trim();
            
            const newScen = { name, lore, npcRoles, playerRole, transitionRule };
            const newIndex = addScenarioToCurrentGame(newScen);
            
            document.getElementById('midgame-scen-modal').style.display = 'none';
            changeScenario(newIndex); 
        }

        // 推算「此情境此刻的在場角色」：優先用 AI 維護的現場快照，沒有就用最近 3 回合說過話＋本場景指派身分推測。
        function getPresentRosterForScene(scene = currentScenario.scenarios?.[currentScenarioIndex] || {}, profile = getModelRuntimeProfile()) {
            const aliveNpcs = Array.isArray(currentScenario.npcs) ? currentScenario.npcs.filter(npc => !isNpcDead(npc)) : [];
            const situation = normalizeRuntimeSituation(scene.runtimeSituation);
            const names = [];
            const npcs = [];
            const pushName = name => { const n = valueToText(name); if (n && !names.includes(n)) names.push(n); };
            if (situation.present.length) {
                situation.present.forEach(name => {
                    pushName(name);
                    const npc = aliveNpcs.find(item => valueToText(item.name) === valueToText(name));
                    if (npc && !npcs.includes(npc)) npcs.push(npc);
                });
            } else {
                const recentText = `${valueToText(scene?.npcRoles)}\n${getRecentChatText(currentChatPageIndex, { maxTurns: 3, maxChars: 1800 })}`.toLowerCase();
                aliveNpcs.forEach(npc => {
                    const name = valueToText(npc.name);
                    if (name && recentText.includes(name.toLowerCase())) { pushName(name); npcs.push(npc); }
                });
            }
            return { names: names.slice(0, 12), npcs: npcs.slice(0, Math.max(profile.npcLimit, 6)), situation };
        }

        function getRelevantNpcsForPrompt(scene, latestPlayerAction, profile, forcedNpcs = []) {
            const npcs = Array.isArray(currentScenario.npcs) ? currentScenario.npcs.filter(npc => !isNpcDead(npc)) : [];
            if (npcs.length <= profile.npcLimit) return npcs;
            const forced = Array.isArray(forcedNpcs) ? forcedNpcs.filter(npc => npcs.includes(npc)) : [];
            const relevanceText = [
                latestPlayerAction,
                scene?.npcRoles,
                scene?.playerRole,
                currentStorySummary,
                currentRelationshipSummary,
                getRecentChatText(currentChatPageIndex, { maxTurns: 2, maxChars: 1600 })
            ].map(valueToText).join('\n').toLowerCase();
            return npcs
                .map((npc, index) => ({
                    npc,
                    index,
                    // 在場角色（forced）一律優先保留詳細設定，避免明明在現場卻被預算砍掉。
                    score: (forced.includes(npc) ? 1000 : 0)
                        + (relevanceText.includes(valueToText(npc?.name).toLowerCase()) ? 100 : 0)
                }))
                .sort((a, b) => b.score - a.score || a.index - b.index)
                .slice(0, profile.npcLimit)
                .map(entry => entry.npc);
        }

        /* 新手教學模式規則(2026/07/10 v3):Flag「新手教學進行中」存在時才注入(其他玩家零 token)。
           小模型記不住教到哪——由程式掃對話紀錄偵測進度(輸入/擲骰/用道具)直接告訴它,
           並在三項齊備時強制推進收尾;完成旗標由 app-ai 的寬容匹配收走。 */
        /* 教學進度快照:規則注入與 app-ai 的完成硬驗收共用同一份偵測 */
        function getTutorialProgressSnapshot() {
            const history = (Array.isArray(chatScripts) ? chatScripts.flat() : []).join('\n');
            const playerName = valueToText(currentScenario?.playerName);
            return {
                input: Boolean((playerName && history.includes(`${playerName}：`)) || history.includes('【旁白】：玩家行動')),
                dice: /系統硬判定|｜(大成功|大失敗|成功|失敗|Crit!|Success|Fail|Fumble)｜/.test(history),
                item: /使用了 |を使った|Used /.test(history),
                affection: (currentScenario?.npcs || []).some(n => Number(n?.affection) > 0)
            };
        }

        function getTutorialModeRules() {
            if (!Array.isArray(currentFlags) || !currentFlags.includes('新手教學進行中')) return '';
            const progress = getTutorialProgressSnapshot();
            const yn = value => (value ? '是' : '否');
            return `
【新手教學模式（Flags 含「新手教學進行中」，此段規則優先）】允許後設提及介面：輸入框、「⚄ 擲骰」按鈕、右側「角色面板」、道具的「使用」按鈕。按五步教學，每回合只推進一步、等玩家做了才進下一步：①請玩家在輸入框自由輸入 ②安排無風險小狀況鼓勵按「⚄ 擲骰」，成敗都溫柔收尾 ③讓 NPC 贈送符合世界觀的小食物或飲品（items_add＋item_effects 標 san 8~12），提醒到角色面板按「使用」 ④玩家友善互動後回傳該 NPC 好感 +5 ⑤恭喜玩家並宣布教學結束。教學中禁止任何危險、扣血或負面事件。
【教學進度（程式偵測，請相信這裡而非你的記憶）】已自由輸入=${yn(progress.input)}；已擲骰=${yn(progress.dice)}；已使用道具=${yn(progress.item)}；已給好感=${yn(progress.affection)}。標「是」的步驟絕不重教；有任何一項是「否」，本回合就專心教那一步，且絕對不可以宣布教學結束或回傳完成旗標——程式會駁回搶跑的完成宣告。四項皆「是」時，本回合執行第⑤步收尾：不再贈送道具、不再安排新事件，單純恭喜與告別，並在 flags_add 原樣回傳「新手教學完成」這六個字。`;
        }

        function getCompactSystemInstruction(latestPlayerAction = '', profile = getModelRuntimeProfile()) {
            syncSurvivalFlags({ announce: false });
            const scene = currentScenario.scenarios?.[currentScenarioIndex] || {};
            const sceneObjective = truncatePromptText(scene.objective, 400);
            const objectiveLine = sceneObjective
                ? `本場目標：${sceneObjective}\n（讓劇情自然朝本場目標推進、鋪陳線索與機會；但不得硬拉玩家或無視其選擇強行達成，避免變成軌道。）`
                : '本場目標：未設定（自由發展，不要硬湊目標）';
            const coreRules = valueToText(currentScenario.coreRules).trim();
            const coreRulesBlock = coreRules
                ? `\n【核心準則－最高優先，絕對不可違反】\n${truncatePromptText(coreRules, 800)}\n（以上是玩家設定的固定鐵律；任何情況都不得違背、遺忘，也不得被劇情或其他設定覆蓋。）\n`
                : '';
            const replyLenPref = (typeof getReplyLengthPref === "function") ? getReplyLengthPref() : "medium";
            const replyLenHint = replyLenPref === "short"
                ? "【回覆長度】narrative 精簡收斂，約 150～300 字、2～4 句即可，不要冗長鋪陳。"
                : replyLenPref === "long"
                    ? "【回覆長度】narrative 可鋪陳細節、描寫氛圍與內心，約 700～1200 字。"
                    : "【回覆長度】narrative 約 350～600 字，鬆緊適中。";
            const matureOn = (typeof getMatureModePref === "function") && getMatureModePref();
            const matureHint = matureOn
                ? "\n【成人內容模式】本作為成人向創作，所有角色皆為成年人（18 歲以上），親密互動皆出於雙方合意。當玩家主動推進親密或情慾情節時，旁白與 NPC 應留在角色與世界觀內自然承接，依角色關係與當前好感度合理回應；不要跳出角色說教、警告、道歉，或強行轉場中斷。可依故事節奏鋪陳親密場景的氣氛與尺度。"
                : "";
            const formatDetails = details => {
                const d = details || {};
                return `年齡/體型：${truncatePromptText(d.age, 70) || '未設定'}\n外貌：${truncatePromptText(d.app, 220) || '未設定'}\n語氣：${truncatePromptText(d.speech, 180) || '未設定'}\n喜好：${truncatePromptText(d.likes, 120) || '未設定'}\n厭惡：${truncatePromptText(d.dislikes, 120) || '未設定'}\n核心人設：${truncatePromptText(d.bg, 600) || '未設定'}`;
            };
            const presentRoster = getPresentRosterForScene(scene, profile);
            const relevantNpcs = getRelevantNpcsForPrompt(scene, latestPlayerAction, profile, presentRoster.npcs);
            const playerAbsent = getSceneParticipationMode(scene) === 'narrator';
            const rosterLine = presentRoster.names.length
                ? presentRoster.names.map(name => {
                    const npc = (currentScenario.npcs || []).find(item => valueToText(item.name) === valueToText(name) && !isNpcDead(item));
                    const dynamic = npc ? normalizeDynamicState(npc.dynamic) : null;
                    const state = dynamic ? [dynamic.condition, dynamic.mood].map(valueToText).filter(Boolean).join('／') : '';
                    return state ? `${name}（${truncatePromptText(state, 40)}）` : valueToText(name);
                }).join('、')
                : '尚無明確其他角色在場；僅依旁白描述的環境。';
            const currentSituationBlock = `【現在狀況－每回合必讀，最高優先的當下事實】
地點：${presentRoster.situation.location || '沿用上一幕，未變更前不得擅自更換場景'}
時間：${presentRoster.situation.time || '沿用上一幕，未明確說明前不得跳時間'}
玩家是否在場：${playerAbsent ? `否（${valueToText(currentScenario.playerName, '玩家')} 目前不在現場，操作者採旁白／導演視角）` : `是（${valueToText(currentScenario.playerName, '玩家')} 在現場）`}
在場角色：${rosterLine}
（這是此刻的物理現場。除非本回合輸入或劇情明確改變，必須延續上述地點、時間與在場角色，不得無故遺忘、移除或替換。若現場確實變動，於 changes.scene_state 回報新的 location／time／present。）`;
            const deceasedNpcs = (currentScenario.npcs || []).filter(isNpcDead);
            const deceasedText = deceasedNpcs.length
                ? deceasedNpcs.map(npc => {
                    const dynamic = normalizeDynamicState(npc.dynamic);
                    return `- ${valueToText(npc.name, '未命名')}：${dynamic.deathCause || '已確認死亡'}${dynamic.reviveLocked ? '（復活檢定已失敗，永久死亡）' : ''}`;
                }).join('\n')
                : '無';
            const npcText = relevantNpcs.length
                ? relevantNpcs.map(npc => {
                    npc.dynamic = normalizeDynamicState(npc.dynamic);
                    return `【NPC：${valueToText(npc.name, '未命名')}｜好感 ${Number(npc.affection) || 0}】\n${formatDetails(npc.details)}\n${formatDynamicStateForPrompt(npc.dynamic, { maxNotes: profile.memoryNotes })}`;
                }).join('\n\n')
                : '目前沒有需要載入詳細設定的 NPC。';
            const livingNpcCount = (currentScenario.npcs || []).filter(npc => !isNpcDead(npc)).length;
            const omittedNpcCount = Math.max(0, livingNpcCount - relevantNpcs.length);
            const items = currentItems.slice(0, 24).map(item => truncatePromptText(item, 60));
            const omittedItems = Math.max(0, currentItems.length - items.length);
            const playerStats = currentScenario.playerStats || { str:10, dex:10, con:10, int:10, wis:10, cha:10 };
            currentScenario.playerDynamic = normalizeDynamicState(currentScenario.playerDynamic);
            const difficulty = getGameDifficultyInfo();

            return `【身份與語言】
你是單人 TRPG 的 DM、旁白與 NPC。${getLanguageInstruction(currentScenario.languageMode || 'zh-tw')}
只輸出合法 JSON，不要 Markdown 或額外解釋。
${coreRulesBlock}
【敘事原則】
- 尊重玩家建立的世界、核心人設與已發生事實；不得擅自改寫。
- 對話自然、有角色差異與適度留白；普通回合簡潔，重大轉折才增加描寫。
- 只讓此刻需要反應的角色說話，不要安排所有 NPC 輪流發言。
- 不預設任何固定劇情；只承接本回合輸入與下方資料。

${currentSituationBlock}

【當前場景】
名稱：${truncatePromptText(scene.name, 100) || '未命名'}
世界與規則：${truncatePromptText(scene.lore, profile.loreChars) || '未設定'}
NPC 在本場景的身分：${truncatePromptText(scene.npcRoles || scene.targetRole, 700) || '未設定'}
玩家身分／視角：${truncatePromptText(scene.playerRole, 500) || '未設定'}
${objectiveLine}
轉場規則：${truncatePromptText(scene.transitionRule, 500) || '未設定；預設為鏡頭切換'}
${buildSceneParticipationInstruction(scene)}

【玩家：${valueToText(currentScenario.playerName, '玩家')}】
能力：STR ${playerStats.str}／DEX ${playerStats.dex}／CON ${playerStats.con}／INT ${playerStats.int}／WIS ${playerStats.wis}／CHA ${playerStats.cha}
${formatDetails(currentScenario.playerDetails)}

【本回合相關 NPC】
${npcText}${omittedNpcCount ? `\n（另有 ${omittedNpcCount} 位未被本回合內容提及的 NPC，其詳細資料未傳送；不要擅自安排其登場。）` : ''}

【已死亡 NPC】
${deceasedText}
死亡 NPC 不得說話、行動、改變好感或更新角色狀態；只能被存活角色回憶或談論。

【遊戲狀態】
HP ${currentHp}/100；SAN ${currentSan}/100；難度：${difficulty.label}（DC 修正 ${difficulty.dcModifier >= 0 ? '+' : ''}${difficulty.dcModifier}）
道具：${items.length ? items.join('、') : '無'}${omittedItems ? `（另有 ${omittedItems} 件未列出）` : ''}
Flags：\n${getFlagsForPrompt()}

【長期記憶】
${getMemoryBriefForPrompt()}

【判定與狀態規則】
- 輸入中的「系統硬判定」已由程式算定，必須直接承接，不得重擲或改變成敗。
- 沒有硬判定時，不要假裝已擲骰；風險行動可在 options 建議檢定。
- When SAN <= 20, hidden_san_option must be an AI-written fourth hidden loss-of-control action for the current scene. Do not use a fixed template, and do not duplicate options. check must be int/wis/cha; difficulty must be at least hard.
- 困難或極限模式下，高風險場景應讓玩家有機會取得、交換、消耗或犧牲符合世界觀的抽象資源。資源可為物資、工具、防護、線索、通行權、人脈、信任、人情、承諾或其他故事優勢；不要固定生成特定物品名稱。玩家合理使用資源時，可降低風險、減輕失敗代價或打開新路線。
- 創作者指令是角色外舞台命令；NPC 不得聽見，也不得因此改變好感。輔助旁白不是玩家角色的言行。
- 只有角色行動模式才可改變玩家 HP、SAN、道具或好感；必須依實際事件填入 changes。
- 玩家獲得、撿到或被贈與「會隨身保留」的物品時，必須同步填入 items_add，不得只在敘事文字裡描述；除非玩家明確說要當場使用，否則不要替玩家自行消耗——用不用由玩家在道具區的「使用」按鈕決定。但「持有」認定從嚴：當場吃掉喝掉、端給他人、擺在桌上或場景裡、正在製作中的東西都不算持有，不要進 items_add 也不要標效果；重做或升級同一件東西用換名處理，不要一回合內反覆入手又喪失。單回合新增道具原則上最多 2 件。
- items_add 裡凡是玩家能實際使用、食用、用一次就會消耗掉的恢復性道具，必須同時在 changes.item_effects 標效果——不限藥品：急救包、繃帶、藥水藥劑等治療用品標 hp；食物、熱飲、鎮靜劑，以及他人親手做的點心、帶著心意的小物等能安撫情緒的標 san（情感價值也是回復）。格式 {"道具名":{"type":"hp|san","amount":8-40}}，鍵名須與 items_add 中的道具名完全一致；日常食物或小心意 8~15、專業治療或強效藥劑 16~40。來歷不明或可疑的藥物在鑑定前不要標；裝備、線索、純紀念品等非消耗品不要標。回復由程式在玩家實際使用時執行，不要在敘事或 changes.hp/san 裡自行改動數值。
- 稀有或特殊的裝備型道具可在名稱附上屬性加值標記，如「幸運硬幣（智力+1）」「獵人護符（DEX+1）」；每件限一項屬性、加值限 +1 或 +2，整場少量發放。持有期間的骰點加值由程式自動計算，AI 不得自行更改骰值。標記屬性限用六圍標準名稱：力量／敏捷／體質／智力／感知／魅力（或 STR/DEX/CON/INT/WIS/CHA），不要用耐力、智慧等別名。劇情中道具被鑑定、附魔、升級或詛咒顯現而獲得（或失去、轉為負面）加值時，用 items_remove 移除舊名、items_add 加回帶新標記的名稱（如「透明石頭」鑑定後改為「透明石頭（感知+1）」、詛咒顯現後改為「詛咒的墜飾（感知-2）」）；來歷不明的道具在鑑定前不要帶標記。
- 玩家充分休息、過夜、接受治療或被安撫等正向事件，應在 changes.hp/san 給小幅回復：短暫歇息或安撫 +3~8；完整過夜、專業治療或重大心靈慰藉 +10~20；單回合合計上限 20。不得無事自動回復；連續重複休息應遞減或無效，不可躺著刷血；重傷或深度失常狀態下回復減半，不應一夜滿血。
- HP 或 SAN 歸零時遵守目前難度的結局規則；不可自行忽略程式狀態。
- 場景延續：地點、時間、在場角色預設延續「現在狀況」。只有本回合輸入或劇情明確改變現場時，才在 changes.scene_state 回報變動欄位（present 填目前實際在現場的角色名單，玩家不在場時不要列入玩家）；現場沒變動就省略 scene_state。
- npc_states 的 memoryNotes 不是日誌：只有重大約定、未公開秘密、關係里程碑或不可逆選擇才可新增，且必須 persistent:true。
- 每名角色每回合最多新增 1 條 memoryNotes，限 36 字內的短標題。普通情緒、氣氛、對話內容、受傷與日常互動不得寫入；相似內容不得換句話重複新增。
- 只有劇情文字已明確確認 NPC 死亡時，才可填 npc_deaths；重傷、昏迷、失蹤或生死不明都不算死亡。${getTutorialModeRules()}
- ${difficulty.key === 'standard' ? '標準模式：劇情明確演出復活，或「神」直接介入時可填 npc_revives；不強制檢定。' : (difficulty.key === 'hard' ? '困難模式：每次死亡只有一次復活嘗試。所有復活相關 options 都必須有六屬性檢定且 difficulty 至少為 hard；程式會執行成敗，npc_revives 必須留空。若已標記復活失敗，禁止再提供任何復活選項。' : '極限模式：死亡永久成立，npc_revives 必須為空，禁止提供任何復活行動或選項。')}

【長期記憶判定】
普通對話、移動、短暫情緒、重複描述與無後續影響的小事：memory 必須為 null。
只有任務異動、關係或承諾實質改變、重要物品得失、永久狀態、重要線索、不可逆選擇，或會影響後續的場景變化，才回傳 memory。上述任一情況一旦發生，memory 為必填、不得省略；即使本回合 JSON 內容較長，也必須完整輸出 memory 欄位到最後。
memory.category 只能是 task、relationship、item、status、clue、decision、scene；memory.event 只寫一條簡短既定事實。story_summary 與 relationship_summary 只有重大變化時才回傳完整精簡快照，否則省略。不得把普通事件硬寫成重點。

【狀態旗標（flags_add）判定——嚴格，預設不加】
只有「會長期存在、之後每回合都該當成既定前提」的關鍵標記才寫入 flags_add，且必須屬於下列之一：
1. 持久身分／處境：取得的身分、職位、陣營、被通緝、未解的中毒或傷病、失明、懷孕等會延續多回合的狀態。
2. 稱號／名號：被賦予且會被沿用的稱號。
3. 確定的關係里程碑：關係正式定下的節點（結為戀人、結拜、正式敵對、締結契約），或某 NPC 好感度達到滿值 100。
4. 契約、詛咒、印記、後遺症等會持續生效的設定。
以下一律不得寫成 flag（改走 memory 或日誌）：普通對話、移動、短暫情緒、曖昧或好感小幅變化、單次小事件、一般任務進度。
加入前先自問：「這會延續到很多回合以後、且之後劇情要一直記得嗎？」——不確定就不要加。每回合最多加 1～2 個真正重要的，寧缺勿濫。

【成就（achievement）判定——嚴格，預設留空】
只有真正重大的成就才可填 changes.achievement，寫一句簡短成就描述：完成主線大任務、跨過重大難關、劇情重要轉捩點、達成長期目標、擊敗重要對手等。日常瑣事、一般任務完成、普通對話與小事件一律不得填。預設留空，寧缺勿濫，每回合最多一個。

【本場目標收束（objective_complete）判定——嚴格】
只有當上方『本場目標』確實被完整達成時，才可填 changes.objective_complete=true，並在 narrative 寫一段令人滿足的收束（呈現達成的意義與餘韻，不是只宣布「完成」）。目標未設定、只部分達成、只是接近、或玩家尚未真正促成時一律 false。同一個目標只達成一次。

${replyLenHint}${matureHint}

【JSON 契約】
Return narrative, dialogues, and options. When SAN is 20 or lower, also return hidden_san_option; otherwise hidden_san_option may be null. Put only real changes from this turn in changes; return {} if none. Return memory as null when there is no major event.
{
  "narrative":"旁白文字",
  "dialogues":[{"speaker":"<角色名>","text":"台詞"}],
  "options":[{"text":"下一步","check":"none|str|dex|con|int|wis|cha","difficulty":"trivial|easy|normal|hard|extreme"}],
"hidden_san_option":{"text":"Hidden low-SAN loss-of-control action","check":"int|wis|cha","difficulty":"hard|extreme","forceDice":true},
  "memory":{"category":"task|relationship|item|status|clue|decision|scene","event":"重大既定事實","story_summary":[],"relationship_summary":[],"task_updates":[{"action":"add|complete|reopen|remove","text":"任務"}]},
  "changes":{
    "hp":0,"san":0,
    "affection_change":{"<角色名>":0},"affection_set":{"<角色名>":0},
    "items_add":[],"items_remove":[],"item_effects":{},"flags_add":[],"achievement":"","objective_complete":false,
    "npc_deaths":[{"name":"<角色名>","cause":"明確死因或死亡事件"}],
    "npc_revives":[{"name":"<角色名>","reason":"明確復活事件；只供標準模式使用"}],
    "npc_states":[{"name":"<角色名>","persistent":false,"changes":{"mood":"","condition":"","relationship":"","goal":"","memoryNotes":[]}}],
    "scene_state":{"location":"","time":"","present":["<目前在場角色名>"]}
  }
}
dialogues only lists actual speakers. options must contain exactly 3 entries, usually at most 1 check option and at least 1 option with check none; hidden_san_option is not shown to the player and is only used when low-SAN option corruption triggers. Omit unchanged fields inside changes.`;
        }

        function populateModelSelects(models, preferredModel = "") {
            const select = document.getElementById('model-choice');
            const gameSelect = document.getElementById('game-model-choice');
            select.innerHTML = '';
            gameSelect.innerHTML = '';

            const sortedModels = sortModelsForTRPG(models);
            sortedModels.forEach(model => {
                const category = classifyModelForMenu(model);
                const prefix = category === 'premium' ? '▪ ' : '';
                const label = prefix + (model.name || model.id);
                const opt = document.createElement('option');
                opt.value = model.id;
                opt.textContent = label;
                const optGame = document.createElement('option');
                optGame.value = model.id;
                optGame.textContent = label;
                select.appendChild(opt);
                gameSelect.appendChild(optGame);
            });

            const fallback = sortedModels[0] ? sortedModels[0].id : "";
            const nextModel = sortedModels.some(model => model.id === preferredModel) ? preferredModel : fallback;
            if (nextModel) syncModelSelection(nextModel);
        }

        async function fetchWithTimeout(url, options = {}, timeoutMs = 30000) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            try {
                return await fetch(url, { ...options, signal: controller.signal });
            } catch (error) {
                if (error?.name === 'AbortError') throw new Error(`連線超過 ${Math.round(timeoutMs / 1000)} 秒沒有回應。`);
                throw error;
            } finally {
                clearTimeout(timeoutId);
            }
        }

        // 非「文字寫作」用途的模型關鍵字：程式碼專用 / 安全審查 / embedding / 語音 / OCR 等。
        // 這些即使能輸出文字也不適合拿來跑劇情，從清單濾除以精簡選單。
        const NON_WRITING_MODEL_TOKENS = ['coder', 'codestral', 'codellama', 'codex', 'embed', 'rerank', 'moderation', 'guard', 'shield', 'whisper', 'tts', 'audio', 'speech', 'transcribe', 'ocr'];
        function isWritingFocusedModel(id, name) {
            const haystack = `${id || ''} ${name || ''}`.toLowerCase();
            return !NON_WRITING_MODEL_TOKENS.some(t => haystack.includes(t));
        }

        async function fetchGoogleModels() {
            const res = await fetchWithTimeout('https://generativelanguage.googleapis.com/v1beta/models', { headers: { 'x-goog-api-key': apiKey } });   // 金鑰放 header,URL 不含金鑰
            const data = await res.json();
            if (data.error) throw new Error(data.error.message || "Google API 金鑰驗證失敗。");

            const validModels = data.models
                .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent") && !m.name.includes("-tts") && !m.name.includes("-vision") && isWritingFocusedModel(m.name, m.displayName))
                .map(m => ({ id: m.name, name: m.displayName || m.name, context_length: m.inputTokenLimit || 0 }));
            if(validModels.length === 0) throw new Error("找不到可用的文字生成模型。");
            return validModels;
        }

        async function fetchOpenRouterModels() {
            const res = await fetchWithTimeout('https://openrouter.ai/api/v1/models?output_modalities=text&sort=most-popular', {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.error?.message || "OpenRouter API 金鑰驗證失敗。");

            const validModels = (data.data || [])
                .filter(m => (!m.architecture || !m.architecture.output_modalities || m.architecture.output_modalities.includes('text')) && isWritingFocusedModel(m.id, m.name))
                .map(m => ({
                    id: m.id,
                    name: `${m.name || m.id}${m.context_length ? ` (${Math.round(m.context_length / 1000)}k)` : ''}`,
                    context_length: m.context_length || 0
                }));
            if(validModels.length === 0) throw new Error("找不到可用的 OpenRouter 文字模型。");
            return validModels;
        }

        async function fetchAnthropicModels(options = {}) {
            const allowFallback = options.allowFallback !== false;
            const fallbackModels = [
                { id: 'claude-opus-4-8', name: 'Claude Opus 4.8', context_length: 200000 },
                { id: 'claude-sonnet-5', name: 'Claude Sonnet 5', context_length: 200000 },
                { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', context_length: 200000 },
                { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', context_length: 200000 }
            ];
            try {
                const res = await fetchWithTimeout('https://api.anthropic.com/v1/models?limit=100', {
                    headers: {
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01',
                        'anthropic-dangerous-direct-browser-access': 'true'
                    }
                });
                const data = await res.json();
                if (!res.ok || data.error) {
                    if (res.status === 401 || res.status === 403) throw new Error(data.error?.message || 'Anthropic API 金鑰無效或沒有權限。');
                    if (!allowFallback) {
                        const validationError = new Error(data.error?.message || '');
                        validationError.status = res.status;
                        throw validationError;
                    }
                    return fallbackModels;
                }
                const list = (data.data || [])
                    .filter(m => /claude/i.test(m.id || ''))
                    .map(m => ({ id: m.id, name: m.display_name || m.id, context_length: 200000 }));
                return list.length ? list : fallbackModels;
            } catch (error) {
                if (/金鑰|無效|沒有權限|invalid|unauthor|forbidden/i.test(String(error?.message || ''))) throw error;
                if (!allowFallback) {
                    throw error;
                }
                return fallbackModels;
            }
        }

        /* silentAuto(2026/07/10):載入時的自動背景驗證——成功直接呈現主選單,
           失敗不彈 alert、退回驗證鈕讓玩家手動處理;手動點擊路徑行為不變。 */
        async function fetchAvailableModels(silentAuto = false) {
            apiProvider = document.getElementById('api-provider')?.value || 'google';
            apiKey = document.getElementById('api-key').value.trim();
            if(!apiKey) { if (!silentAuto) alert("請貼上你的 API Key！"); return; }
            const verifyBtn = document.getElementById('verify-btn');
            verifyBtn.innerText = "驗證中..."; verifyBtn.disabled = true;

            try {
                localStorage.setItem('sanko_api_provider', apiProvider);
                sessionApiKeys[apiProvider] = apiKey;

                const preferredModel = localStorage.getItem(getModelStorageKey(apiProvider)) || selectedModel || '';
                const models = apiProvider === 'openrouter'
                    ? await fetchOpenRouterModels()
                    : apiProvider === 'anthropic'
                        ? await fetchAnthropicModels({ allowFallback: false })
                        : await fetchGoogleModels();
                populateModelSelects(models, preferredModel);
                if (rememberApiKey) persistApiKey(apiProvider, apiKey);
                else removePersistedApiKeys();

                document.getElementById('delete-key-btn').style.display = 'inline-block';
                setHomeModelAreaVisible(true);
                verifyBtn.style.display = 'none';
            } catch (error) {
                console.error('API 驗證技術資訊', error);
                if (!silentAuto) alert(getFriendlyErrorMessage(error, 'API 驗證失敗，請確認金鑰後再試。'));
                verifyBtn.innerText = "驗證金鑰"; verifyBtn.disabled = false;
            }
        }

        function truncateSceneTransitionText(value, maxChars = 300) {
            const text = valueToText(value).replace(/\s+/g, ' ').trim();
            if (text.length <= maxChars) return text;
            return `${text.slice(0, Math.max(0, maxChars - 1))}…`;
        }

        function getSceneTransitionHistory(pageIndex, maxLines = 3) {
            const page = Array.isArray(chatScripts[pageIndex]) ? chatScripts[pageIndex] : [];
            const lines = page
                .filter(line => !valueToText(line).startsWith('【系統提示】'))
                .map(line => truncateSceneTransitionText(stripHardDiceDirective(line), 150))
                .filter(Boolean)
                .slice(-maxLines);
            return truncateSceneTransitionText(lines.join(' / '), 420);
        }

        function normalizeSceneTransition(value) {
            if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
            const fromIndex = Number.parseInt(value.fromIndex, 10);
            const toIndex = Number.parseInt(value.toIndex, 10);
            if (!Number.isInteger(fromIndex) || !Number.isInteger(toIndex)) return null;
            return {
                version: 1,
                type: value.type === 'resume' ? 'resume' : 'first-entry',
                fromIndex,
                toIndex,
                fromName: valueToText(value.fromName, '未命名情境'),
                toName: valueToText(value.toName, '未命名情境'),
                sourceTail: valueToText(value.sourceTail),
                targetTail: valueToText(value.targetTail),
                createdAt: valueToText(value.createdAt)
            };
        }

        function createSceneTransition(fromIndex, toIndex) {
            const fromScene = currentScenario.scenarios?.[fromIndex] || {};
            const toScene = currentScenario.scenarios?.[toIndex] || {};
            const targetTail = getSceneTransitionHistory(toIndex);
            return normalizeSceneTransition({
                version: 1,
                type: targetTail ? 'resume' : 'first-entry',
                fromIndex,
                toIndex,
                fromName: fromScene.name || '未命名情境',
                toName: toScene.name || '未命名情境',
                sourceTail: getSceneTransitionHistory(fromIndex),
                targetTail,
                createdAt: new Date().toISOString()
            });
        }

        function buildSceneTransitionPrompt() {
            const transition = normalizeSceneTransition(pendingSceneTransition);
            if (!transition || transition.toIndex !== currentScenarioIndex) return '';
            const targetScene = currentScenario.scenarios?.[transition.toIndex] || {};
            const typeLabel = transition.type === 'resume' ? '返回既有支線' : '首次進入新情境';
            const targetHistory = transition.targetTail || '此情境尚無先前對話。';
            const sourceHistory = transition.sourceTail || '來源情境沒有可用的近期對話。';
            const transitionRule = truncateSceneTransitionText(targetScene.transitionRule, 260)
                || '未指定。採用安全的鏡頭切換，不得自行發明傳送、夢醒或時間跳躍。';
            return `

【情境交接包－本回合最高優先】
切換類型：${typeLabel}
來源情境：${transition.fromName}
目標情境：${transition.toName}
來源上一幕：${sourceHistory}
目標支線既有進度：${targetHistory}
轉場規則：${transitionRule}
目標情境 NPC 身分／狀態：${targetScene.npcRoles || '未指定'}
目標情境玩家身分／視角：${targetScene.playerRole || '未指定'}
玩家在場判定：${getSceneParticipationMode(targetScene) === 'narrator' ? `玩家角色 ${currentScenario.playerName} 目前不視為在場；操作者輸入採輔助旁白／導演模式。` : `玩家角色 ${currentScenario.playerName} 預設在場；除非當前指令另有說明。`}

交接要求：
1. narrative 第一段先讓讀者明白目前的時間、空間與在場角色，再直接回應操作者本回合輸入；旁白／創作者模式不得改寫成玩家角色行動。
2. 返回既有支線時，優先接續「目標支線既有進度」；來源上一幕只作為跨支線共同記憶，不得把兩地物理場景混在一起。
3. 首次進入時，依目標情境設定建立自然入口；未指定轉場方式時只做鏡頭切換，不可擅自創造穿越機制。
4. 核心人設、關係、重大約定與長期記憶延續；當下身分與環境法則以目標情境為準。
5. 若目標情境是輔助旁白／玩家不在場模式，禁止把操作者輸入當成玩家角色發言；只有明確回歸指令才能讓玩家角色重新登場。`;
        }

        function changeScenario(indexStr) {
            const newIndex = Number.parseInt(indexStr, 10);
            if (!Number.isInteger(newIndex) || !currentScenario.scenarios?.[newIndex]) return;
            if (newIndex === currentScenarioIndex && newIndex === currentChatPageIndex) return;
            if (typeof invalidateGameAIRequestContext === 'function') {
                invalidateGameAIRequestContext();
            }

            /* 翻頁式轉場(2026/07/10 定案):舊內容上淡出→切場景→新內容下浮入,外框不動 */
            const doSwitch = () => {
                const fromIndex = currentScenarioIndex;
                pendingSceneTransition = createSceneTransition(fromIndex, newIndex);
                currentScenarioIndex = newIndex;
                currentChatPageIndex = newIndex;

                if (!chatScripts[currentChatPageIndex]) chatScripts[currentChatPageIndex] = [];
                renderChatPage(currentChatPageIndex);
                setCreatorInputMode(false, false);

                saveCurrentProgress();
                document.getElementById('btn-location').value = currentScenarioIndex;
            };
            const dialogueBox = document.getElementById('dialogue-box');
            const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (!dialogueBox || reducedMotion) { doSwitch(); return; }
            dialogueBox.classList.add('scene-page-out');
            window.setTimeout(() => {
                doSwitch();
                dialogueBox.classList.remove('scene-page-out');
                dialogueBox.classList.add('scene-page-in');
                window.setTimeout(() => dialogueBox.classList.remove('scene-page-in'), 320);
            }, 210);
        }

