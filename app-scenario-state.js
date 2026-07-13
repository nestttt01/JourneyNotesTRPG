// === [app.js 拆分] app-scenario-state.js：原 app.js 第 2073–2690 行｜persistJson/情境快照/動態狀態/NPC 死亡與好感/狀態摘要｜需依 index.html 既有順序與其他 app-*.js 一同載入，勿單獨重排。 ===
        function persistJson(storageKey, data, label = '資料') {
            if (storageKey === 'sanko_saves_v8') return persistAllSaves(label);
            if (indexedDatabaseReady && isIndexedStorageKey(storageKey)) return queueIndexedWrite(storageKey, data, label);
            try {
                localStorage.setItem(storageKey, JSON.stringify(data));
                storageWarningShown = false;
                return true;
            } catch (error) {
                handleIndexedWriteError(label, error);
                return false;
            }
        }


        function createEmptyDynamicState() {
            return { mood: '', condition: '', relationship: '', goal: '', memoryNotes: [], isDead: false, deathCause: '', diedAt: '', revivedAt: '', reviveAttempted: false, reviveLocked: false, reviveFailureReason: '', reviveAttemptedAt: '', lastReason: '', updatedAt: '' };
        }

        // 每條情境/支線各自的「當下現場快照」：目前地點、時間、在場角色名單。
        // 這是 runtime 狀態（不進配置模板），只在存檔內依情境保存，用來避免 AI 過幾回合就忘了時間/空間/在場 NPC。
        function normalizeRuntimeSituation(value) {
            const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
            const rawPresent = Array.isArray(source.present)
                ? source.present
                : valueToText(source.present).split(/[、,，\n]+/);
            const present = [];
            rawPresent.forEach(entry => {
                const name = truncatePromptText(valueToText(entry).replace(/^\s*[-•*]\s*/, ''), 40);
                if (name && !present.includes(name)) present.push(name);
            });
            return {
                location: truncatePromptText(valueToText(source.location), 120),
                time: truncatePromptText(valueToText(source.time), 80),
                present: present.slice(0, 12),
                updatedAt: valueToText(source.updatedAt)
            };
        }

        function runtimeSituationHasContent(situation) {
            const s = normalizeRuntimeSituation(situation);
            return Boolean(s.location || s.time || s.present.length);
        }

function createPresetSnapshotFromScenario(sourceScenario, baselinePreset = null) {
const snapshot = clonePersistentValue(sourceScenario || defaultPreset);
delete snapshot.playerDynamic;
delete snapshot.sourcePresetId;
if (!Array.isArray(snapshot.npcs)) snapshot.npcs = [];
if (Array.isArray(snapshot.scenarios)) {
snapshot.scenarios.forEach(scene => { delete scene.runtimePlayerPresence; delete scene.runtimeGuideRole; delete scene.runtimeSituation; });
}
snapshot.npcs = snapshot.npcs.map(npc => {
const cleanNpc = clonePersistentValue(npc);
delete cleanNpc.dynamic;
return cleanNpc;
});
return snapshot;
}

function createFreshScenarioFromPreset(preset) {
const fresh = createPresetSnapshotFromScenario(preset || defaultPreset);
fresh.playerDynamic = createEmptyDynamicState();
fresh.npcs.forEach(npc => { npc.dynamic = createEmptyDynamicState(); });
fresh.memoryNotesPaused = false;
return fresh;
}

function findMatchingRuntimeNpc(existingNpcs, nextNpc, index) {
if (!Array.isArray(existingNpcs)) return null;
const nextId = valueToText(nextNpc?.id);
const nextName = valueToText(nextNpc?.name);
return existingNpcs.find(item =>
(nextId && valueToText(item?.id) === nextId)
|| (nextName && valueToText(item?.name) === nextName)
) || existingNpcs[index] || null;
}

function resolvePresetIdForScenario(scenario) {
if (!scenario || typeof scenario !== 'object') return '';
const directId = valueToText(scenario.sourcePresetId || scenario.id);
if (directId && scenarioPresets[directId]) return directId;
const presetName = valueToText(scenario.presetName);
if (!presetName) return directId;
return Object.keys(scenarioPresets).find(id => valueToText(scenarioPresets[id]?.presetName) === presetName) || directId;
}

function mergePresetIntoBoundSaveScenario(saveScenario, presetId, preset) {
const previousScenario = saveScenario && typeof saveScenario === 'object' ? saveScenario : {};
const nextScenario = createFreshScenarioFromPreset(preset);
nextScenario.sourcePresetId = presetId;
nextScenario.id = presetId;
nextScenario.presetName = preset.presetName || nextScenario.presetName;
nextScenario.playerDynamic = previousScenario.playerDynamic
? clonePersistentValue(previousScenario.playerDynamic)
: createEmptyDynamicState();
nextScenario.memoryNotesPaused = previousScenario.memoryNotesPaused === true;

const previousNpcs = Array.isArray(previousScenario.npcs) ? previousScenario.npcs : [];
if (!Array.isArray(nextScenario.npcs)) nextScenario.npcs = [];
nextScenario.npcs.forEach((npc, index) => {
const previousNpc = findMatchingRuntimeNpc(previousNpcs, npc, index);
npc.dynamic = previousNpc?.dynamic
? clonePersistentValue(previousNpc.dynamic)
: createEmptyDynamicState();
});

const previousScenarios = Array.isArray(previousScenario.scenarios) ? previousScenario.scenarios : [];
if (Array.isArray(nextScenario.scenarios)) {
nextScenario.scenarios.forEach((scene, index) => {
const previousScene = previousScenarios.find(item =>
valueToText(item?.name) && valueToText(item.name) === valueToText(scene?.name)
) || previousScenarios[index];
if (!previousScene) return;
if (previousScene.runtimePlayerPresence !== undefined) scene.runtimePlayerPresence = previousScene.runtimePlayerPresence;
if (previousScene.runtimeGuideRole !== undefined) scene.runtimeGuideRole = previousScene.runtimeGuideRole;
if (previousScene.runtimeSituation !== undefined) scene.runtimeSituation = previousScene.runtimeSituation;
});
}

return nextScenario;
}

function getCanonicalScenarioForSave(scenario) {
if (!scenario || typeof scenario !== 'object') return scenario;
const presetId = resolvePresetIdForScenario(scenario);
const preset = presetId ? scenarioPresets[presetId] : null;
return preset ? mergePresetIntoBoundSaveScenario(scenario, presetId, preset) : scenario;
}

function normalizeMemoryNotes(value) {
            const rawEntries = Array.isArray(value)
                ? value
                : valueToText(value).split(/\n+/);
            const notes = [];
            rawEntries.forEach(entry => {
                const clean = valueToText(entry).replace(/^\s*[-•*]\s*/, '').trim();
                if (clean && !notes.includes(clean)) notes.push(clean);
            });
            return notes;
        }

        function normalizeMemoryNoteKey(value) {
            return valueToText(value)
                .toLowerCase()
                .replace(/[\s\p{P}\p{S}]/gu, '')
                .replace(/(?:目前|此刻|現在|已經|曾經|對玩家|與玩家|將會|會|要|的)/g, '');
        }

        function areMemoryNotesSimilar(left, right) {
            const a = normalizeMemoryNoteKey(left);
            const b = normalizeMemoryNoteKey(right);
            if (!a || !b) return false;
            if (a === b) return true;
            if (Math.min(a.length, b.length) >= 6 && (a.includes(b) || b.includes(a))) return true;
            const makePairs = text => {
                const pairs = new Set();
                for (let index = 0; index < text.length - 1; index += 1) pairs.add(text.slice(index, index + 2));
                return pairs;
            };
            const aPairs = makePairs(a);
            const bPairs = makePairs(b);
            if (!aPairs.size || !bPairs.size) return false;
            let overlap = 0;
            aPairs.forEach(pair => { if (bPairs.has(pair)) overlap += 1; });
            return overlap / Math.max(aPairs.size, bPairs.size) >= 0.72;
        }

        function truncatePromptText(value, maxChars) {
            const text = valueToText(value).trim();
            if (text.length <= maxChars) return text;
            return `${text.slice(0, Math.max(0, maxChars - 1))}…`;
        }

        function normalizeDynamicState(state) {
            const source = state && typeof state === 'object' ? state : {};
            return {
                mood: valueToText(source.mood),
                condition: valueToText(source.condition),
                relationship: valueToText(source.relationship),
                goal: valueToText(source.goal),
                memoryNotes: normalizeMemoryNotes(source.memoryNotes ?? source.recentChange ?? source.development),
                isDead: source.isDead === true,
                deathCause: valueToText(source.deathCause),
                diedAt: valueToText(source.diedAt),
                revivedAt: valueToText(source.revivedAt),
                reviveAttempted: source.reviveAttempted === true,
                reviveLocked: source.reviveLocked === true,
                reviveFailureReason: valueToText(source.reviveFailureReason),
                reviveAttemptedAt: valueToText(source.reviveAttemptedAt),
                lastReason: valueToText(source.lastReason),
                updatedAt: valueToText(source.updatedAt)
            };
        }

        function getDynamicStatePreview(state) {
            const dynamic = normalizeDynamicState(state);
            if (dynamic.isDead) return `已死亡${dynamic.deathCause ? `：${dynamic.deathCause}` : ''}`;
            return [dynamic.mood, dynamic.condition].filter(Boolean).join(' · ');
        }

        function isNpcDead(npc) {
            return normalizeDynamicState(npc?.dynamic).isDead === true;
        }

        function isPermanentNpcDeathMode() {
            return normalizeGameDifficulty(currentScenario?.gameDifficulty) === 'nightmare';
        }

        function isNpcRevivePermanentlyLocked(npc) {
            return isPermanentNpcDeathMode() || normalizeDynamicState(npc?.dynamic).reviveLocked === true;
        }

        function markNpcDead(npc, cause = '') {
            if (!npc) return false;
            const dynamic = normalizeDynamicState(npc.dynamic);
            if (dynamic.isDead) return false;
            dynamic.isDead = true;
            dynamic.deathCause = truncatePromptText(cause, 120) || '劇情已明確確認死亡';
            dynamic.diedAt = new Date().toLocaleString();
            dynamic.revivedAt = '';
            dynamic.reviveAttempted = false;
            dynamic.reviveLocked = false;
            dynamic.reviveFailureReason = '';
            dynamic.reviveAttemptedAt = '';
            dynamic.mood = '';
            dynamic.goal = '';
            dynamic.condition = '已死亡';
            dynamic.lastReason = `死亡：${dynamic.deathCause}`;
            dynamic.updatedAt = dynamic.diedAt;
            npc.dynamic = dynamic;
            return true;
        }

        function reviveNpc(npc, reason = '', { allowHardSuccess = false } = {}) {
            if (!npc || !isNpcDead(npc) || isNpcRevivePermanentlyLocked(npc)) return false;
            const difficulty = normalizeGameDifficulty(currentScenario?.gameDifficulty);
            if (difficulty === 'hard' && !allowHardSuccess) return false;
            const dynamic = normalizeDynamicState(npc.dynamic);
            dynamic.isDead = false;
            dynamic.revivedAt = new Date().toLocaleString();
            dynamic.condition = '';
            dynamic.deathCause = '';
            dynamic.reviveAttempted = difficulty === 'hard';
            dynamic.reviveLocked = false;
            dynamic.reviveFailureReason = '';
            dynamic.reviveAttemptedAt = difficulty === 'hard' ? new Date().toLocaleString() : dynamic.reviveAttemptedAt;
            dynamic.lastReason = `恢復存活${reason ? `：${truncatePromptText(reason, 100)}` : ''}`;
            dynamic.updatedAt = dynamic.revivedAt;
            npc.dynamic = dynamic;
            return true;
        }

        function lockFailedNpcRevival(npc, reason = '') {
            if (!npc || !isNpcDead(npc)) return false;
            const dynamic = normalizeDynamicState(npc.dynamic);
            if (dynamic.reviveLocked) return false;
            dynamic.reviveAttempted = true;
            dynamic.reviveLocked = true;
            dynamic.reviveFailureReason = truncatePromptText(reason, 140) || '困難模式復活檢定失敗';
            dynamic.reviveAttemptedAt = new Date().toLocaleString();
            dynamic.lastReason = `復活失敗：${dynamic.reviveFailureReason}`;
            dynamic.updatedAt = dynamic.reviveAttemptedAt;
            npc.dynamic = dynamic;
            return true;
        }

        function getNpcDeathBadgeText(npc) {
            const dynamic = normalizeDynamicState(npc?.dynamic);
            return dynamic.reviveLocked ? '已死亡・復活失敗' : '已死亡';
        }

        function renderDynamicStateEditor(prefix, state, { allowDeath = false } = {}) {
            const dynamic = normalizeDynamicState(state);
            const promptNoteLimit = getModelRuntimeProfile().memoryNotes;
            const deadStateLock = allowDeath && dynamic.isDead ? 'readonly' : '';
            const reason = dynamic.lastReason
                ? `<p class="dynamic-state-reason">最近更新：${escapeStatusHtml(dynamic.lastReason)}${dynamic.updatedAt ? ` · ${escapeStatusHtml(dynamic.updatedAt)}` : ''}</p>`
                : '';
            const notesText = dynamic.memoryNotes.map(note => `• ${note}`).join('\n');
            const notesEditor = dynamic.memoryNotes.length > MEMORY_NOTES_COLLAPSE_THRESHOLD
                ? `<details class="dynamic-memory-details"><summary>查看／編輯全部 ${dynamic.memoryNotes.length} 筆紀錄</summary><textarea id="${prefix}-memoryNotes" rows="6" ${deadStateLock}>${escapeStatusHtml(notesText)}</textarea></details>`
                : `<textarea id="${prefix}-memoryNotes" rows="4" ${deadStateLock}>${escapeStatusHtml(notesText)}</textarea>`;
            return `
                <div class="dynamic-state-panel">
                    <div class="dynamic-state-heading">
                        <strong>動態狀態</strong>
                        <span>${currentScenario.memoryNotesPaused ? 'AI 重要紀錄追加已暫停；仍可手動修改' : `只有重大約定／秘密才會追加；AI 每回合讀最近 ${promptNoteLimit} 筆`}</span>
                    </div>
                    <div class="dynamic-state-grid">
                        <div class="dynamic-state-field"><label>當前情緒</label><input type="text" id="${prefix}-mood" value="${escapeStatusHtml(dynamic.mood)}" ${deadStateLock}></div>
                        <div class="dynamic-state-field"><label>身體／外觀狀態</label><input type="text" id="${prefix}-condition" value="${escapeStatusHtml(dynamic.condition)}" ${deadStateLock}></div>
                        <div class="dynamic-state-field"><label>此刻對玩家／隊伍的個人態度</label><input type="text" id="${prefix}-relationship" value="${escapeStatusHtml(dynamic.relationship)}" ${deadStateLock}></div>
                        <div class="dynamic-state-field"><label>當前目標</label><input type="text" id="${prefix}-goal" value="${escapeStatusHtml(dynamic.goal)}" ${deadStateLock}></div>
                        <div class="dynamic-state-field full"><label>角色專屬約定／秘密（完整保留；每行一個短標題）</label>${notesEditor}</div>
                    </div>
                    ${reason}
                </div>`;
        }

        function syncDynamicStateFromDom(prefix, existingState) {
            const previous = normalizeDynamicState(existingState);
            const next = { ...previous, memoryNotes: [...previous.memoryNotes] };
            let changed = false;

            if (!next.isDead) ['mood', 'condition', 'relationship', 'goal'].forEach(key => {
                const input = document.getElementById(`${prefix}-${key}`);
                if (!input) return;
                const value = input.value.trim();
                if (value !== previous[key]) {
                    next[key] = value;
                    changed = true;
                }
            });

            const notesInput = document.getElementById(`${prefix}-memoryNotes`);
            if (notesInput && !next.isDead) {
                const notes = normalizeMemoryNotes(notesInput.value);
                if (JSON.stringify(notes) !== JSON.stringify(previous.memoryNotes)) {
                    next.memoryNotes = notes;
                    changed = true;
                }
            }

            if (changed) {
                next.lastReason = '玩家手動修改';
                next.updatedAt = new Date().toLocaleString();
            }
            return next;
        }

        function formatDynamicStateForPrompt(state, { maxNotes = MAX_MEMORY_NOTES_FOR_PROMPT } = {}) {
            const dynamic = normalizeDynamicState(state);
            const visibleNotes = dynamic.memoryNotes.slice(-Math.max(0, maxNotes));
            const omittedCount = Math.max(0, dynamic.memoryNotes.length - visibleNotes.length);
            const memoryText = visibleNotes.length
                ? `${omittedCount ? `（另有 ${omittedCount} 筆較舊個人紀錄保留在角色面板，本回合不重複傳送）\n` : ''}${visibleNotes.map(note => `- ${truncatePromptText(note, MAX_MEMORY_NOTE_PROMPT_CHARS)}`).join('\n')}`
                : '無';
            return `[當前情緒]: ${truncatePromptText(dynamic.mood, 80) || '未特別標記'}\n[身體/外觀狀態]: ${truncatePromptText(dynamic.condition, 120) || '正常'}\n[此刻對玩家/隊伍的個人態度；不是全局角色關係摘要]: ${truncatePromptText(dynamic.relationship, 160) || '尚未形成'}\n[當前目標]: ${truncatePromptText(dynamic.goal, 160) || '未設定'}\n[角色專屬約定/秘密，只可追加不可覆寫；每則為短標題]:\n${memoryText}`;
        }

        function applyDynamicStatePatch(existingState, update, allowMemoryNotes = true) {
            const state = normalizeDynamicState(existingState);
            if (state.isDead) return { state, changed: false, changedLabels: [] };
            const changes = update?.changes && typeof update.changes === 'object'
                ? update.changes
                : (update?.state && typeof update.state === 'object' ? update.state : {});
            const changedLabels = [];
            const persistent = update?.persistent === true || valueToText(update?.importance).toLowerCase() === 'major';

            const immediateLabels = { mood: '情緒', condition: '身體狀態' };
            Object.keys(immediateLabels).forEach(key => {
                const value = valueToText(changes[key]);
                if (!value || value === state[key]) return;
                state[key] = value;
                changedLabels.push(immediateLabels[key]);
            });

            if (persistent) {
                const lastingLabels = { relationship: '關係態度', goal: '當前目標' };
                Object.keys(lastingLabels).forEach(key => {
                    const value = valueToText(changes[key]);
                    if (!value || value === state[key]) return;
                    state[key] = value;
                    changedLabels.push(lastingLabels[key]);
                });

                if (allowMemoryNotes) {
                    const incomingNotes = normalizeMemoryNotes(changes.memoryNotes ?? changes.recentChange)
                        .map(note => truncatePromptText(note, MAX_MEMORY_NOTE_STORED_CHARS))
                        .filter(Boolean)
                        .slice(0, 1);
                    incomingNotes.forEach(note => {
                        if (!state.memoryNotes.some(existing => areMemoryNotesSimilar(existing, note))) state.memoryNotes.push(note);
                    });
                    if (incomingNotes.length) {
                        const previousNotes = normalizeDynamicState(existingState).memoryNotes;
                        const addedCount = incomingNotes.filter(note => !previousNotes.some(existing => areMemoryNotesSimilar(existing, note))).length;
                        if (addedCount > 0) changedLabels.push('重要紀錄');
                    }
                }
            }

            if (changedLabels.length) {
                state.lastReason = valueToText(update?.reason, '劇情推進');
                state.updatedAt = new Date().toLocaleString();
            }
            return { state, changedLabels };
        }

        function clampAffectionValue(value, fallback = 0) {
            const parsed = Number.parseInt(value, 10);
            const safe = Number.isFinite(parsed) ? parsed : Number.parseInt(fallback, 10) || 0;
            return Math.max(-100, Math.min(100, safe));
        }

        function normalizeNpcLookupName(value) {
            return valueToText(value)
                .toLowerCase()
                .replace(/[「」『』\"'`·・．。\s_\-]/g, '')
                .replace(/^(npc|角色)/, '');
        }

        function findNpcByName(name) {
            const cleanName = valueToText(name).replace(/^[「『\"']+|[」』\"']+$/g, '').trim();
            if (!cleanName || !currentScenario?.npcs) return null;
            return currentScenario.npcs.find(npc => valueToText(npc.name) === cleanName) || null;
        }

        function findNpcByLooseName(name) {
            const exact = findNpcByName(name);
            if (exact) return exact;
            const lookup = normalizeNpcLookupName(name);
            if (!lookup || !currentScenario?.npcs) return null;
            return currentScenario.npcs.find(npc => {
                const npcName = normalizeNpcLookupName(npc.name);
                return npcName === lookup || (lookup.length >= 2 && (npcName.includes(lookup) || lookup.includes(npcName)));
            }) || null;
        }

        // === 關係里程碑保底旗標（好感滿值 / 好感觸底 / NPC 死亡；程式硬保證，不靠 AI 自覺）===
        const AFFECTION_MAX_MILESTONE = 100;
        const AFFECTION_MIN_MILESTONE = -30;
        const AFFECTION_HELL_MILESTONE = -100;   // 好感觸底：保底成就「我們地獄見」（2026/07/10）
        const AFFECTION_INCREASE_THRESHOLDS = [15, 30, 45, 60, 75, 90, 100];
        const AFFECTION_DECREASE_THRESHOLDS = [-15, -30, -100];
        const AFFECTION_NOTICE_KEYS = {
            15: '\u8ddf {npc} \u7684\u8ddd\u96e2\u62c9\u8fd1\u4e86\u4e00\u9ede',
            30: '{npc} \u5c0d\u4f60\u591a\u4e86\u4e00\u9ede\u597d\u611f',
            45: '\u8ddf {npc} \u611f\u60c5\u8b8a\u597d\u4e86',
            60: '{npc} \u958b\u59cb\u66f4\u4fe1\u4efb\u4f60\u4e86',
            75: '\u8ddf {npc} \u8b8a\u5f97\u66f4\u52a0\u89aa\u8fd1',
            90: '{npc} \u5c0d\u4f60\u62b1\u6709\u6df1\u539a\u60c5\u611f',
            100: '\u8ddf {npc} \u7de0\u7d50\u4e86\u81f3\u6df1\u7f88\u7d46',
            '-15': '\u8ddf {npc} \u7684\u95dc\u4fc2\u8b8a\u5f97\u6709\u4e9b\u7dca\u5f35',
            '-30': '{npc} \u5c0d\u4f60\u7684\u6575\u610f\u52a0\u6df1\u4e86',
            '-100': '\u8207 {npc} \u6069\u65b7\u7fa9\u7d55\uff0c\u5730\u7344\u898b'
        };

        function getCrossedAffectionThreshold(previous, next) {
            if (!Number.isFinite(previous) || !Number.isFinite(next) || next === previous) return null;
            let crossed = null;
            if (next > previous) {
                AFFECTION_INCREASE_THRESHOLDS.forEach(threshold => {
                    if (previous < threshold && next >= threshold) crossed = threshold;
                });
            } else {
                AFFECTION_DECREASE_THRESHOLDS.forEach(threshold => {
                    if (previous > threshold && next <= threshold) crossed = threshold;
                });
            }
            return crossed;
        }

        function getAffectionNoticeText(threshold, npcName) {
            const key = AFFECTION_NOTICE_KEYS[String(threshold)] || AFFECTION_NOTICE_KEYS[threshold];
            const name = valueToText(npcName || 'NPC') || 'NPC';
            if (!key) return name;
            if (window.uiMessage) return window.uiMessage(key, { npc: name });
            return key.replaceAll('{npc}', name);
        }

        function showAffectionThresholdEffect(npcName, affectionValue, threshold) {
            const msgBox = document.getElementById('dialogue-box');
            if (!msgBox) return;
            const effect = document.createElement('div');
            effect.className = 'relationship-heart-effect';
            effect.innerHTML = `${renderNpcAffectionHeart(affectionValue)}<span class="relationship-heart-effect-label">${escapeStatusHtml(getAffectionNoticeText(threshold, npcName))}</span>`;
            msgBox.appendChild(effect);
            window.setTimeout(() => effect.remove(), 3000);
        }

        function announceAffectionBreakthrough(npc, previous, next) {
            const threshold = getCrossedAffectionThreshold(previous, next);
            if (threshold === null) return false;
            showAffectionThresholdEffect(npc?.name || 'NPC', next, threshold);
            return true;
        }

        let pendingRelationshipMilestones = [];

        function queueRelationshipMilestone(npcName, kind) {
            const name = valueToText(npcName);
            if (!name) return;
            if (pendingRelationshipMilestones.some(m => m.npcName === name && m.kind === kind)) return;
            pendingRelationshipMilestones.push({ npcName: name, kind });
        }

        function buildMilestoneFlagText(npcName, kind) {
            if (kind === 'maxAffection') return `與 ${npcName} 締結至深羈絆`;
            if (kind === 'minAffection') return `與 ${npcName} 結下難解深仇`;
            if (kind === 'death') return `${npcName} 已殞命`;
            return '';
        }

        function addGuaranteedFlag(flagText) {
            const cleanFlag = normalizeFlagText(flagText);
            if (!cleanFlag || currentFlags.includes(cleanFlag)) return false;
            if (currentFlags.length >= MAX_STORED_FLAGS) {
                createSystemNote(`Flags 已達 ${MAX_STORED_FLAGS} 個上限；重要標記「${cleanFlag}」未加入，請至角色面板整理。`);
                return false;
            }
            currentFlags.push(cleanFlag);
            createSystemNote(`新增狀態 [ ${cleanFlag} ]`);
            return true;
        }

        // aiFlagsThisTurn：本回合 AI 回傳的 flags_add。好感里程碑若 AI 已給含該角色名的標籤，
        // 交給 AI 的關係措辭，程式不再補；死亡一律程式保底。
        function flushRelationshipMilestoneFlags(aiFlagsThisTurn = []) {
            if (!pendingRelationshipMilestones.length) return;
            const aiFlags = Array.isArray(aiFlagsThisTurn)
                ? aiFlagsThisTurn.map(flag => normalizeFlagText(flag)).filter(Boolean)
                : [];
            const pending = pendingRelationshipMilestones;
            pendingRelationshipMilestones = [];
            pending.forEach(({ npcName, kind }) => {
                if (kind === 'hellAffection') { grantHellAchievement(npcName); return; }
                if ((kind === 'maxAffection' || kind === 'minAffection')
                    && npcName && aiFlags.some(flag => flag.includes(npcName))) return;
                addGuaranteedFlag(buildMilestoneFlagText(npcName, kind));
            });
        }

        // 好感觸底 -100 的保底成就「我們地獄見」：與 AI 回傳的成就同一套路徑
        //（成就數 +1、寫入冒險日誌、成就揭幕線訊息），計入套用快照可完整回滾。
        function grantHellAchievement(npcName) {
            const name = valueToText(npcName) || 'NPC';
            /* 防重複刷點(2026/07/10):保底 Flag 一生一次——Flag 已存在(好感回升後再觸底)就不再發成就。
               Flag 隨存檔持久化,讀檔後依然有效;Flags 滿載加不進時成就一併不發,與其他里程碑同語意。 */
            if (!addGuaranteedFlag(`與 ${name} 恩斷義絕`)) return;
            const text = window.uiMessage ? uiMessage('我們地獄見（{npc}）', { npc: name }) : `我們地獄見（${name}）`;
            achievementCount = (Number(achievementCount) || 0) + 1;
            currentAdventureLog = mergeAdventureLog(currentAdventureLog, `成就：${text}`);
            if (typeof createSystemAlert === 'function' && typeof survivalFxUiMessage === 'function') {
                createSystemAlert(survivalFxUiMessage('— 成就達成：{text} —', { text }));
            }
        }

        function applyAffectionUpdate(npc, value, mode = 'change', { announce = true } = {}) {
            if (!npc || isNpcDead(npc)) return null;
            const previous = clampAffectionValue(npc.affection, 0);
            const numericValue = Number.parseInt(value, 10);
            if (!Number.isFinite(numericValue)) return null;
            const next = mode === 'set'
                ? clampAffectionValue(numericValue, previous)
                : clampAffectionValue(previous + numericValue, previous);
            npc.affection = next;
            if (previous < AFFECTION_MAX_MILESTONE && next >= AFFECTION_MAX_MILESTONE) queueRelationshipMilestone(npc.name, 'maxAffection');
            if (previous > AFFECTION_MIN_MILESTONE && next <= AFFECTION_MIN_MILESTONE) queueRelationshipMilestone(npc.name, 'minAffection');
            if (previous > AFFECTION_HELL_MILESTONE && next <= AFFECTION_HELL_MILESTONE) queueRelationshipMilestone(npc.name, 'hellAffection');
            if (announce) announceAffectionBreakthrough(npc, previous, next);
            return { npcId: npc.id || npc.name, npcName: npc.name, previous, next, mode };
        }

        function normalizeAffectionPayloadEntries(payload) {
            if (!payload) return [];
            if (Array.isArray(payload)) {
                return payload.map(entry => ({
                    name: valueToText(entry?.name || entry?.npc || entry?.character),
                    value: entry?.value ?? entry?.affection ?? entry?.change ?? entry?.delta
                })).filter(entry => entry.name);
            }
            if (typeof payload !== 'object') return [];
            return Object.entries(payload).map(([name, rawValue]) => ({
                name,
                value: rawValue && typeof rawValue === 'object'
                    ? (rawValue.value ?? rawValue.affection ?? rawValue.change ?? rawValue.delta)
                    : rawValue
            }));
        }

        function applyAffectionPayload(payload, mode = 'change', skippedNpcIds = new Set()) {
            const updates = [];
            normalizeAffectionPayloadEntries(payload).forEach(entry => {
                const npc = findNpcByLooseName(entry.name);
                if (!npc || isNpcDead(npc) || skippedNpcIds.has(npc.id || npc.name)) return;
                const update = applyAffectionUpdate(npc, entry.value, mode);
                if (update) {
                    updates.push(update);
                    queueAffectionHeartPop(update);
                }
            });
            return updates;
        }

        /* ===== 好感變動彈心(2026/07/09):AI 回傳好感增減時,
           在該 NPC 本回合最後一則對話泡泡右上角彈出像素心+像素字增減值。
           心沿用 renderNpcAffectionHeart(與面板同一顆),佇列在對話渲染完後
           由 callAI_JSON 呼叫 flushAffectionHeartPops() 統一施放。 ===== */
        let pendingAffectionHeartPops = [];
        function queueAffectionHeartPop(update) {
            if (!update || update.next === update.previous) return;
            pendingAffectionHeartPops.push({ npcName: update.npcName, delta: update.next - update.previous });
        }
        let pendingAffectionHeartWatchers = [];
        function clearAffectionHeartPops() {
            pendingAffectionHeartPops = [];
            pendingAffectionHeartWatchers.forEach(watcher => {
                try { watcher.observer.disconnect(); } catch (error) { /* 忽略 */ }
                window.clearTimeout(watcher.timeoutId);
            });
            pendingAffectionHeartWatchers = [];
        }
        function flushAffectionHeartPops() {
            const pops = pendingAffectionHeartPops;
            pendingAffectionHeartPops = [];
            pops.forEach((pop, index) => {
                window.setTimeout(() => spawnAffectionHeartPop(pop.npcName, pop.delta), index * 280);
            });
        }
        function findLatestBubbleForSpeaker(npcName) {
            const wrappers = document.querySelectorAll('#dialogue-box .msg-wrapper');
            for (let i = wrappers.length - 1; i >= 0; i -= 1) {
                if (valueToText(wrappers[i].dataset.menuSpeaker) === valueToText(npcName)) return wrappers[i];
            }
            return null;
        }
        function isAffectionAnchorInView(anchor) {
            const box = document.getElementById('dialogue-box');
            const rect = anchor.getBoundingClientRect();
            if (!rect.width && !rect.height) return false;
            if (!box) return true;
            const boxRect = box.getBoundingClientRect();
            return rect.top < boxRect.bottom - 24 && rect.bottom > boxRect.top + 24;
        }
        /* 糰子心(2026/07/10):好感增減彈出動畫專用的圓滾滾麻糬心。
           面板量表維持原本心形;這顆只在慶祝/難過彈窗出現。
           沿用 npc-affection-pixel 色票 class,顏色跟著「愛心顏色」主題走。 */
        const MOCHI_HEART_ROWS = [
            [[2, 4], [6, 8]],
            [[1, 9]],
            [[1, 9]],
            [[1, 9]],
            [[2, 8]],
            [[3, 7]],
            [[4, 6]],
        ];
        function renderAffectionPopHeart(percent) {
            const width = 11;
            const height = 7;
            const cells = new Set();
            MOCHI_HEART_ROWS.forEach((ranges, y) => {
                ranges.forEach(([start, end]) => {
                    for (let x = start; x <= end; x += 1) cells.add(`${x},${y}`);
                });
            });
            const hasCell = (x, y) => cells.has(`${x},${y}`);
            const isOutline = (x, y) => !hasCell(x - 1, y) || !hasCell(x + 1, y) || !hasCell(x, y - 1) || !hasCell(x, y + 1);
            const clamped = Math.max(0, Math.min(100, Number(percent) || 0));
            const cutoff = clamped >= 100 ? 0 : Math.max(1, Math.round(height * (1 - clamped / 100)));
            const parts = [];
            const pixel = (x, y, className) => parts.push(`<span class="npc-affection-pixel ${className}" style="--x:${x};--y:${y}"></span>`);
            for (let y = 0; y < height; y += 1) {
                for (let x = 0; x < width; x += 1) {
                    if (!hasCell(x, y)) continue;
                    if (isOutline(x, y)) pixel(x, y, y >= height - 2 ? 'is-outline is-outline-dark' : 'is-outline');
                    else if (y >= cutoff) pixel(x, y, y <= 2 ? 'is-fill is-fill-light' : (y >= height - 3 ? 'is-fill is-fill-dark' : 'is-fill'));
                    else pixel(x, y, 'is-empty');
                }
            }
            [[3, 2]].forEach(([x, y]) => {   /* 光點一顆(2026/07/10 定案,原三顆 L 形) */
                if (hasCell(x, y) && !isOutline(x, y) && y >= cutoff) pixel(x, y, 'is-shine');
            });
            return `<span class="npc-affection" style="width:calc(${width} * var(--u));height:calc(${height} * var(--u))">${parts.join('')}</span>`;
        }

        function spawnAffectionHeartPop(npcName, delta, skipEnterWait) {
            if (!delta) return;
            const wrapper = findLatestBubbleForSpeaker(npcName);
            if (!wrapper) return;   /* NPC 本回合沒說話就不彈,面板里程碑特效照舊 */
            /* 訊息逐則入場(msg-enter 錯相)期間泡泡還隱形——等它的 animation-delay+入場動畫跑完再彈,
               不然心會比泡泡早半拍浮在空白處(2026/07/10) */
            if (!skipEnterWait && wrapper.classList.contains('msg-enter')) {
                const enterDelay = (Number.parseInt(wrapper.style.animationDelay, 10) || 0) + 260;
                window.setTimeout(() => {
                    if (!document.body.contains(wrapper)) return;
                    spawnAffectionHeartPop(npcName, delta, true);
                }, enterDelay);
                return;
            }
            /* 錨定泡泡本體(.msg-text/.msg-content),不能用整列容器——那是全寬的,
               右緣等於聊天欄右邊,心會跑到版面最右側。 */
            const anchor = wrapper.querySelector('.msg-text') || wrapper.querySelector('.msg-content') || wrapper;
            /* 泡泡在視野內就直接演;還在畫面外(AI 回覆後畫面沒自動捲到底)
               就等玩家捲到它進入視野的瞬間才演,animation 不會白演。最多等 2 分鐘。 */
            if (isAffectionAnchorInView(anchor)) {
                renderAffectionHeartPopAt(anchor, delta);
                return;
            }
            if (typeof IntersectionObserver !== 'function') {
                renderAffectionHeartPopAt(anchor, delta);
                return;
            }
            const watcher = {};
            watcher.observer = new IntersectionObserver(entries => {
                if (!entries.some(entry => entry.isIntersecting)) return;
                watcher.observer.disconnect();
                window.clearTimeout(watcher.timeoutId);
                pendingAffectionHeartWatchers = pendingAffectionHeartWatchers.filter(item => item !== watcher);
                window.setTimeout(() => renderAffectionHeartPopAt(anchor, delta), 200);
            }, { root: document.getElementById('dialogue-box'), threshold: 0.55 });
            watcher.timeoutId = window.setTimeout(() => {
                try { watcher.observer.disconnect(); } catch (error) { /* 忽略 */ }
                pendingAffectionHeartWatchers = pendingAffectionHeartWatchers.filter(item => item !== watcher);
            }, 120000);
            watcher.observer.observe(anchor);
            pendingAffectionHeartWatchers.push(watcher);
        }
        function renderAffectionHeartPopAt(anchor, delta) {
            const rect = anchor.getBoundingClientRect();
            if (!rect.width && !rect.height) return;
            const pop = document.createElement('span');
            pop.className = 'affection-heart-pop';
            let heartWrap;
            if (delta > 0) {
                /* 上升:輕盈上飄——單顆小糰子浮現後直直上飄淡出(2026/07/10 實測定案) */
                heartWrap = document.createElement('span');
                heartWrap.className = 'affection-pop-heart';
                heartWrap.innerHTML = renderAffectionPopHeart(100);
            } else {
                /* 下降:維持垂頭+眼淚+下沉的難過糰子 */
                heartWrap = document.createElement('span');
                heartWrap.className = 'affection-pop-heart sad';
                heartWrap.innerHTML = renderAffectionPopHeart(35);
                const tear = document.createElement('span');
                tear.className = 'affection-pop-tear';
                heartWrap.appendChild(tear);
            }
            const amount = document.createElement('span');
            amount.className = 'affection-pop-amount' + (delta < 0 ? ' down' : '');
            amount.textContent = (delta > 0 ? '+' : '') + delta;
            pop.appendChild(heartWrap);
            pop.appendChild(amount);
            pop.style.left = Math.max(8, Math.min(window.innerWidth - 96, rect.right - 14)) + 'px';
            pop.style.top = Math.max(8, rect.top - 26) + 'px';
            document.body.appendChild(pop);
            window.setTimeout(() => pop.remove(), 1700);
        }

        function normalizeNpcLifePayload(payload, detailKey) {
            const source = Array.isArray(payload) ? payload : (payload ? [payload] : []);
            return source.map(entry => {
                if (typeof entry === 'string') return { name: valueToText(entry), detail: '' };
                return {
                    name: valueToText(entry?.name || entry?.npc || entry?.character),
                    detail: valueToText(entry?.[detailKey] || entry?.reason || entry?.cause)
                };
            }).filter(entry => entry.name);
        }

        function applyNpcDeathPayload(payload, skippedNpcIds = new Set()) {
            const events = [];
            normalizeNpcLifePayload(payload, 'cause').forEach(entry => {
                const npc = findNpcByLooseName(entry.name) || ensureNpcForSpeaker(entry.name, { announce: false });
                if (!npc || skippedNpcIds.has(npc.id || npc.name) || !markNpcDead(npc, entry.detail)) return;
                const cause = normalizeDynamicState(npc.dynamic).deathCause;
                events.push(`${npc.name} 已死亡：${cause}`);
                /* 死亡演出:畫面上該 NPC 的頭像閃爍後轉灰(2026/07/10) */
                const deadNpcId = valueToText(npc.id || npc.name);
                document.querySelectorAll('img.chat-avatar').forEach(avatarImg => {
                    if (valueToText(avatarImg.dataset.avatarNpcId) === deadNpcId) avatarImg.classList.add('npc-dead-fx');
                });
                createSystemAlert(`☠ ${npc.name} 已死亡${cause ? `：${cause}` : ''}`);
                queueRelationshipMilestone(npc.name, 'death');
            });
            return events;
        }

        function applyNpcRevivePayload(payload) {
            const events = [];
            if (normalizeGameDifficulty(currentScenario?.gameDifficulty) !== 'standard') return events;
            normalizeNpcLifePayload(payload, 'reason').forEach(entry => {
                const npc = findNpcByLooseName(entry.name);
                if (!npc || !reviveNpc(npc, entry.detail)) return;
                events.push(`${npc.name} 已恢復存活${entry.detail ? `：${truncatePromptText(entry.detail, 100)}` : ''}`);
                createSystemAlert(`✦ ${npc.name} 已恢復存活`);
            });
            return events;
        }

        function escapeRegExp(value) {
            return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }

        function applyManualAffectionCommands(text) {
            const source = valueToText(text);
            if (!source.includes('好感') || !Array.isArray(currentScenario?.npcs)) return [];
            const updates = [];
            currentScenario.npcs.forEach(npc => {
                if (isNpcDead(npc)) return;
                const escapedName = escapeRegExp(valueToText(npc.name));
                if (!escapedName || !source.includes(valueToText(npc.name))) return;
                const prefix = `(?:把|將)?\\s*${escapedName}\\s*(?:的)?\\s*好感度`;
                const setMatch = source.match(new RegExp(`${prefix}\\s*(?:改成|改為|設為|設定為|設定成|調到|調成|調整到|變成|為)\\s*(-?\\d+)`, 'i'));
                const addMatch = source.match(new RegExp(`${prefix}\\s*(?:增加|提升|加)\\s*(\\d+)`, 'i'));
                const subtractMatch = source.match(new RegExp(`${prefix}\\s*(?:減少|降低|扣除|扣)\\s*(\\d+)`, 'i'));
                let update = null;
                if (setMatch) update = applyAffectionUpdate(npc, setMatch[1], 'set');
                else if (addMatch) update = applyAffectionUpdate(npc, addMatch[1], 'change');
                else if (subtractMatch) update = applyAffectionUpdate(npc, -Number.parseInt(subtractMatch[1], 10), 'change');
                if (update) updates.push(update);
            });
            return updates;
        }

        function buildManualAffectionPrompt(updates) {
            if (!Array.isArray(updates) || !updates.length) return '';
            const summary = updates.map(update => `${update.npcName}：${update.previous} → ${update.next}`).join('、');
            return `【系統已直接執行玩家的好感度修改】${summary}。請自然承接玩家指令，但本回合不得再對這些 NPC 回傳 npc_love_change 或 npc_love_set，以免重複計算。`;
        }

        function isBlankNpcPlaceholder(npc) {
            if (!npc || valueToText(npc.name) !== '新角色') return false;
            const details = npc.details || {};
            return ['age', 'speech', 'likes', 'dislikes', 'app', 'bg'].every(key => !valueToText(details[key]));
        }

        function ensureNpcForSpeaker(name, { announce = true } = {}) {
            const cleanName = valueToText(name).replace(/^[「『\"']+|[」』\"']+$/g, '').trim();
            if (!cleanName || cleanName === currentScenario?.playerName) return null;
            if (['旁白', '系統', 'DM', '遊戲引擎', '玩家'].includes(cleanName)) return null;
            const existing = findNpcByName(cleanName);
            if (existing) return existing;

            let npc = currentScenario.npcs.find(isBlankNpcPlaceholder);
            if (npc) {
                npc.name = cleanName;
                npc.dynamic = normalizeDynamicState(npc.dynamic);
                npc.dynamic.memoryNotes = [`於「${currentScenario.scenarios?.[currentScenarioIndex]?.name || '目前情境'}」首次登場。`];
            } else {
                npc = {
                    id: `npc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                    name: cleanName,
                    avatar: emptyAvatar,
                    affection: 0,
                    details: { age: '', speech: '', likes: '', dislikes: '', app: '', bg: '' },
                    dynamic: {
                        ...createEmptyDynamicState(),
                        memoryNotes: [`於「${currentScenario.scenarios?.[currentScenarioIndex]?.name || '目前情境'}」首次登場。`]
                    }
                };
                currentScenario.npcs.push(npc);
            }
            npc.dynamic.lastReason = 'AI 在劇情中引入新角色';
            npc.dynamic.updatedAt = new Date().toLocaleString();
            if (announce) createSystemAlert(`— 新登場 NPC [ ${cleanName} ] 已加入角色面板 —`);
            return npc;
        }

        // 量表心造型換糰子（2026/07/10 heart-mood-lab 比稿定案）：11×7,與彈心同款;
        // 舊 10×8 尖底心形見 git 歷史。門檻檔位與所有規則不變,只換形狀。
        const NPC_AFFECTION_HEART_ROWS = [
            [[2, 4], [6, 8]],
            [[1, 9]],
            [[1, 9]],
            [[1, 9]],
            [[2, 8]],
            [[3, 7]],
            [[4, 6]],
        ];

        function getNpcAffectionHeartCells() {
            const cells = new Set();
            NPC_AFFECTION_HEART_ROWS.forEach((ranges, y) => {
                ranges.forEach(([start, end]) => {
                    for (let x = start; x <= end; x += 1) cells.add(`${x},${y}`);
                });
            });
            return cells;
        }

        // 好感情緒漸進動態分檔（2026/07/10，heart-mood-lab 定案）：
        // 感情越好動作越活潑；門檻對齊里程碑階梯，動畫規則在 style.css npc-mood-*。
        function getAffectionMoodClass(value) {
            const v = Number(value) || 0;
            if (v <= -100) return 'mood-dead';       // 整顆倒下 45°，不動
            if (v <= -30) return 'mood-sad-deep';    // 重度垂頭
            if (v <= -15) return 'mood-sad';         // 垂頭喪氣
            if (v >= 100) return '';                 // 滿值走 affection-full 終點招（雙段跳）
            if (v >= 90) return 'mood-6';            // 雀躍歪頭
            if (v >= 75) return 'mood-5';            // 蹦蹦跳
            if (v >= 60) return 'mood-4';            // 小雀躍
            if (v >= 45) return 'mood-3';            // 輕快漂浮
            if (v >= 30) return 'mood-2';            // 輕輕漂浮
            if (v >= 15) return 'mood-1';            // 微微呼吸
            return 'mood-0';                         // −14~14 靜止（15 是第一個里程碑）
        }

        function renderNpcAffectionHeart(value) {
            const affection = Number(value ?? 0);
            const negative = affection < 0;
            const percent = Math.max(0, Math.min(100, affection));
            let cutoff = 7;
            if (percent >= 100) cutoff = 0;
            else if (percent >= 90) cutoff = 1;
            else if (percent >= 75) cutoff = 2;
            else if (percent >= 60) cutoff = 3;
            else if (percent >= 45) cutoff = 4;
            else if (percent >= 30) cutoff = 5;
            else if (percent > 0) cutoff = 6;
            const cells = getNpcAffectionHeartCells();
            const hasCell = (x, y) => cells.has(`${x},${y}`);
            const isOutline = (x, y) => !hasCell(x - 1, y) || !hasCell(x + 1, y) || !hasCell(x, y - 1) || !hasCell(x, y + 1);
            const pixel = (x, y, className) => `<span class="npc-affection-pixel ${className}" style="--x:${x};--y:${y}"></span>`;
            const parts = [];
            for (let y = 0; y < 7; y += 1) {
                for (let x = 0; x < 11; x += 1) {
                    if (!hasCell(x, y)) continue;
                    if (negative) {
                        const severe = affection <= -30;
                        if (isOutline(x, y)) parts.push(pixel(x, y, severe ? (y >= 4 ? 'is-negative-dark' : 'is-negative-mid') : (y >= 4 ? 'is-negative-mid' : 'is-negative-light')));
                        else if (severe) parts.push(pixel(x, y, y <= 2 ? 'is-negative-light' : (y >= 4 ? 'is-negative-dark' : 'is-negative-mid')));
                        else parts.push(pixel(x, y, y <= 2 ? 'is-negative-soft' : (y >= 4 ? 'is-negative-mid' : 'is-negative-light')));
                    } else if (isOutline(x, y)) {
                        parts.push(pixel(x, y, y >= 5 ? 'is-outline is-outline-dark' : 'is-outline'));
                    } else if (y >= cutoff) {
                        parts.push(pixel(x, y, y <= 2 ? 'is-fill is-fill-light' : (y >= 4 ? 'is-fill is-fill-dark' : 'is-fill')));
                    } else {
                        parts.push(pixel(x, y, 'is-empty'));
                    }
                }
            }
            /* 光澤跟著填色走:只要光澤像素落在已填色區(y >= cutoff)就渲染,
               不再滿值限定——90% 的心也有高光,不會灰灰的。外圈星星維持滿值專屬。 */
            if (!negative && percent > 0) {
                [[3, 2]].forEach(([x, y]) => {   /* 光點一顆(2026/07/10 定案,原三顆 L 形) */
                    if (hasCell(x, y) && !isOutline(x, y) && y >= cutoff) parts.push(pixel(x, y, 'is-shine'));
                });
            }
            /* 星塵量表(2026/07/10):閃耀度跟著好感走——>=60 一顆、>=90 兩顆、滿值五星全開 */
            if (!negative && percent >= 100) {
                [[-1, 1, 'is-hot'], [11, 2, 'is-s2'], [1, -1, 'is-s3'], [9, -1, 'is-hot is-s2'], [11, 5, 'is-s3']].forEach(([x, y, className]) => {
                    parts.push(`<span class="npc-affection-spark ${className}" style="--x:${x};--y:${y}"></span>`);
                });
            } else if (!negative && percent >= 90) {
                [[-1, 2, ''], [11, 1, 'is-s2']].forEach(([x, y, className]) => {
                    parts.push(`<span class="npc-affection-spark ${className}" style="--x:${x};--y:${y}"></span>`);
                });
            } else if (!negative && percent >= 60) {
                parts.push(`<span class="npc-affection-spark is-s2" style="--x:11;--y:2"></span>`);
            }
            const moodClass = getAffectionMoodClass(affection);
            return `<span class="npc-affection${negative ? (affection <= -30 ? ' negative' : ' negative negative-soft') : ''}${percent >= 100 ? ' affection-full' : ''}${moodClass ? ' ' + moodClass : ''}" aria-label="NPC affection ${affection}">${parts.join('')}</span>`;
        }

        function renderStatusSummary() {
            const target = document.getElementById('status-summary-display');
            if (!target) return;
            const currentScen = currentScenario.scenarios?.[currentScenarioIndex] || {};
            const npcs = currentScenario.npcs || [];
            const npcRows = npcs.length
                ? npcs.map(n => {
                    const affection = Number(n.affection ?? 0);
                    return `<div class="npc-summary-row"><span class="npc-summary-name">${escapeStatusHtml(n.name || 'NPC')}</span>${renderNpcAffectionHeart(affection)}</div>`;
                }).join('')
                : '<p class="status-panel-hint">尚未設定 NPC。</p>';
            target.innerHTML = `
                <div class="quick-status-grid">
                    <div class="quick-status-box"><div class="quick-status-label">HP</div><div class="quick-status-value">${currentHp}/100</div></div>
                    <div class="quick-status-box"><div class="quick-status-label">SAN</div><div class="quick-status-value">${currentSan}/100</div></div>
                    <div class="quick-status-box"><div class="quick-status-label">情境</div><div class="quick-status-value">${escapeStatusHtml(currentScen.name || '未命名')}</div></div>
                </div>
                <p class="u-inline-016">NPC 好感摘要</p>
                <div class="npc-summary-list">${npcRows}</div>
            `;
        }

        function renderApiUsageStats() {
            const target = document.getElementById('api-usage-display');
            if (!target) return;
            const { today, month } = ensureApiUsageBucket();
            const day = apiUsageStats.days[today];
            const mon = apiUsageStats.months[month];
            const total = apiUsageStats.totals;
            const providerText = getApiProviderLabel();
            const modelRows = Object.values(apiUsageStats.models || {})
                .sort((a, b) => (b.requests || 0) - (a.requests || 0))
                .slice(0, 8)
                .map(entry => {
                    const provider = entry.provider === 'openrouter' ? 'OpenRouter' : (entry.provider === 'google' ? 'Google' : (entry.provider === 'anthropic' ? 'Anthropic' : valueToText(entry.provider, '未知')));
                    const requestCount = Math.max(0, Number.parseInt(entry.requests, 10) || 0);
                    const repairCount = Math.max(0, Number.parseInt(entry.repairRequests, 10) || 0);
                    const repairs = repairCount ? ` / 修復 ${repairCount}` : '';
                    return `<div class="api-model-row"><span><b>${escapeStatusHtml(entry.displayName || entry.model)}</b><small>${escapeStatusHtml(provider)}</small></span><strong>${requestCount}${repairs}</strong></div>`;
                }).join('') || '<p class="api-stat-note">尚未有模型使用紀錄。</p>';
            target.innerHTML = `
                <div class="api-stat-grid">
                    <div class="api-stat-box"><div class="api-stat-label">今日呼叫</div><div class="api-stat-value">${Math.max(0, Number.parseInt(day.requests, 10) || 0)}</div></div>
                    <div class="api-stat-box"><div class="api-stat-label">本月呼叫</div><div class="api-stat-value">${Math.max(0, Number.parseInt(mon.requests, 10) || 0)}</div></div>
                    <div class="api-stat-box"><div class="api-stat-label">JSON 修復</div><div class="api-stat-value">${Math.max(0, Number.parseInt(mon.repairRequests, 10) || 0)}</div></div>
                    <div class="api-stat-box"><div class="api-stat-label">總呼叫</div><div class="api-stat-value">${Math.max(0, Number.parseInt(total.requests, 10) || 0)}</div></div>
                </div>
                <p class="u-inline-016">模型使用次數</p>
                <div class="api-model-list">${modelRows}</div>
                <p class="api-stat-note">目前供應商：${providerText}<br>目前模型：${escapeStatusHtml(getModelDisplayName(selectedModel) || '尚未選擇')}<br>最後使用：${escapeStatusHtml(apiUsageStats.lastUsedAt || '尚未使用')}<br>實際費用仍以 OpenRouter / Google 後台為準。</p>
                <div class="api-stat-actions">
                    <button class="btn u-inline-057" onclick="resetApiUsageStats()">重設統計</button>
                </div>
            `;
        }
        function resetApiUsageStats() {
            if (!confirm("確定要清除本機 API 使用統計嗎？遊戲存檔不會被刪除。")) return;
            apiUsageStats = {};
            saveApiUsageStats();
            renderApiUsageStats();
        }
        function switchStatusTab(tabName) {
            activeStatusTab = tabName || "state";
            document.querySelectorAll('.status-tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.statusTab === activeStatusTab));
            document.querySelectorAll('.status-page').forEach(page => page.classList.toggle('active', page.id === `status-page-${activeStatusTab}`));
            if (activeStatusTab === "api") renderApiUsageStats();
            if (activeStatusTab === "log") resizeMemoryTextareas();
            if (activeStatusTab === "settings") initTextareas();
        }

        function setMemoryNotesPaused(paused, { persist = false, notify = true } = {}) {
            if (!currentScenario || typeof currentScenario !== 'object') return false;
            const nextPaused = paused === true;
            if (currentScenario.memoryNotesPaused === nextPaused) return false;
            currentScenario.memoryNotesPaused = nextPaused;
            if (notify && typeof createSystemNote === 'function') {
                createSystemNote(nextPaused
                    ? '重要紀錄：已暫停 AI 自動追加（仍可在面板手動修改）'
                    : '重要紀錄：已恢復 AI 自動追加');
            }
            if (persist && typeof saveCurrentProgress === 'function') saveCurrentProgress();
            return true;
        }
