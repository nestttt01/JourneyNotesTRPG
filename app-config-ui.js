// === [app.js 拆分] app-config-ui.js：原 app.js 第 2921–3436 行｜桌機角色配置 UI/配置概覽/NPC 與情境列表｜需依 index.html 既有順序與其他 app-*.js 一同載入，勿單獨重排。 ===
function openEditScenario() {
document.getElementById('setup-screen').style.display = 'none';
document.getElementById('edit-scenario-screen').style.display = 'flex';
setupEditScenarioLeaveWarning();
renderPresetSelector(); loadPresetToForm(activePresetId);
clearEditScenarioDirty();
switchDesktopConfigWorkspace('characters');
}

        function isDesktopConfigLayout() {
            return window.matchMedia('(min-width: 1100px), (hover: hover) and (pointer: fine)').matches;
        }

        function syncDesktopCharacterNameWidth(input) {
            if (!input) return;
            if (!isDesktopConfigLayout()) {
                input.style.removeProperty('width');
                return;
            }
            const characterCount = Math.max(1, Array.from(valueToText(input.value, '角色')).length);
            input.style.width = `${Math.max(112, Math.min(320, characterCount * 22 + 36))}px`;
        }

        function setDesktopConfigTab(section = 'characters') {
            document.querySelectorAll('.desktop-config-tab').forEach(button => {
                button.classList.toggle('active', button.dataset.configSection === section);
            });
        }

        let desktopConfigWorkspace = 'characters';

        function switchDesktopConfigWorkspace(section = 'characters') {
            const screen = document.getElementById('edit-scenario-screen');
            if (!screen) return;
            if (screen.classList.contains('npc-acquaintance-open')) {
                closeNpcAcquaintanceFlow({ restoreEditor: false });
            }
            if (screen.classList.contains('npc-preview-open')) {
                closeDesktopNpcPreview({ restoreOverview: false });
            }
            if (screen.classList.contains('player-preview-open')) {
                closeDesktopPlayerPreview({ restoreOverview: false });
            }
            if (screen.classList.contains('random-generator-inline-open')) closeRandomGenerator();
            if (screen.style.display === 'flex') syncEditingDataFromDOM();
            desktopConfigWorkspace = ['characters', 'scenarios', 'game'].includes(section) ? section : 'characters';
            screen.dataset.workspace = desktopConfigWorkspace;
            screen.classList.remove('desktop-editor-open');
            screen.classList.toggle('game-workspace-active', desktopConfigWorkspace === 'game');
            delete screen.dataset.editorSection;
            setDesktopConfigTab(desktopConfigWorkspace);
            document.querySelectorAll('.desktop-workspace-view').forEach(view => {
                view.classList.toggle('active', view.dataset.workspaceView === desktopConfigWorkspace);
            });
            renderDesktopPresetOverview();
            if (!isDesktopConfigLayout()) {
                requestAnimationFrame(() => {
                    window.scrollTo(0, 0);
                });
            }
        }

        function openDesktopConfigEditor(section = 'player', itemIndex = -1) {
            const screen = document.getElementById('edit-scenario-screen');
            if (!screen) return;
            if (screen.classList.contains('npc-acquaintance-open')) {
                closeNpcAcquaintanceFlow({ restoreEditor: false });
            }
            if (screen.classList.contains('npc-preview-open')) {
                closeDesktopNpcPreview({ restoreOverview: false });
            }
            if (screen.classList.contains('player-preview-open')) {
                closeDesktopPlayerPreview({ restoreOverview: false });
            }
            const workspace = section === 'scenario' ? 'scenarios' : (section === 'game' ? 'game' : 'characters');
            desktopConfigWorkspace = workspace;
            screen.dataset.workspace = workspace;
            setDesktopConfigTab(workspace);
            document.querySelectorAll('.desktop-workspace-view').forEach(view => {
                view.classList.toggle('active', view.dataset.workspaceView === workspace);
            });
            screen.classList.remove('game-workspace-active');
            screen.classList.add('desktop-editor-open');
            screen.dataset.editorSection = section;

            document.querySelectorAll('#npc-list-container details, #scenario-list-container details').forEach(card => {
                card.classList.remove('desktop-active-card');
            });

            if (section === 'player') {
                document.querySelector('#preset-player-editor > details')?.setAttribute('open', '');
                syncDesktopCharacterNameWidth(document.getElementById('input-player-name'));
                ensureDesktopPlayerEditorReturn();
            }
            if (section === 'npc') {
                const card = document.getElementById('npc-list-container')?.querySelectorAll('details')[itemIndex];
                if (card) {
                    card.open = true;
                    card.classList.add('desktop-active-card');
                }
            }
            if (section === 'scenario') {
                const card = document.getElementById('scenario-list-container')?.querySelectorAll('details')[itemIndex];
                if (card) {
                    card.open = true;
                    card.classList.add('desktop-active-card');
                }
            }
            requestAnimationFrame(() => {
                const editor = document.getElementById('desktop-config-editor');
                if (isDesktopConfigLayout()) {
                    if (editor) {
                        editor.scrollTop = 0;
                    }
                } else {
                    window.scrollTo(0, 0);
                }
            });
        }

        function renderDesktopPresetOverview() {
            const avatar = document.getElementById('desktop-player-avatar');
            const preview = document.getElementById('preview-player');
            const name = document.getElementById('desktop-player-name');
            const nameInput = document.getElementById('input-player-name');
            if (avatar) avatar.src = preview?.src || scenarioPresets[activePresetId]?.playerAvatar || emptyAvatar;
            if (name) name.textContent = valueToText(nameInput?.value, uiText('玩家'));

            const list = document.getElementById('desktop-npc-avatar-list');
            if (!list) return;
            list.innerHTML = '';
            editingNpcs.forEach((npc, index) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'desktop-npc-avatar-button';
                const displayName = uiCharacterName(document.getElementById(`npc-name-${index}`)?.value || npc.name, `角色 ${index + 1}`);
                button.setAttribute('aria-label', `${uiText('查看人物資料')}：${displayName}`);
                button.onclick = () => openDesktopNpcPreview(index);
                const currentPreview = document.getElementById(`preview-npc-${index}`)?.src;
                const image = document.createElement('img');
                image.src = currentPreview || npc.avatar || emptyAvatar;
                image.alt = '';
                const label = document.createElement('span');
                label.textContent = displayName;
                button.append(image, label);
                list.appendChild(button);
                /* 桌機 NPC 總覽:按住頭像拖曳排序(輕點仍是開啟編輯) */
                if (typeof enableReorderDrag === 'function') {
                    enableReorderDrag(button, button, list, '.desktop-npc-avatar-button:not(.desktop-npc-add-button)', (fromIndex, toIndex) => {
                        syncEditingDataFromDOM();
                        const moved = editingNpcs.splice(fromIndex, 1)[0];
                        editingNpcs.splice(toIndex, 0, moved);
                        renderNpcList();
                    }, { axis: 'grid' });
                }
            });

            const addButton = document.createElement('button');
            addButton.type = 'button';
            addButton.className = 'desktop-npc-avatar-button desktop-npc-add-button';
            addButton.setAttribute('aria-label', uiText('新增 NPC'));
            addButton.innerHTML = `<span class="desktop-npc-add-icon">＋</span><span>${escapeStatusHtml(uiText('新增'))}</span>`;
            addButton.onclick = () => {
                addNpcBlock();
                openDesktopConfigEditor('npc', editingNpcs.length - 1);
            };
            list.appendChild(addButton);

            const scenarioList = document.getElementById('desktop-scenario-card-list');
            if (scenarioList) {
                scenarioList.innerHTML = '';
                editingScenarios.forEach((scenario, index) => {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'desktop-overview-card desktop-scenario-card';
                    button.onclick = () => openDesktopConfigEditor('scenario', index);
                    const nameValue = valueToText(document.getElementById(`scen-name-${index}`)?.value || scenario.name, `${uiText('情境')} ${index + 1}`);
                    const fullLoreValue = valueToText(document.getElementById(`scen-lore-${index}`)?.value || scenario.lore, uiText('尚未填寫世界觀'));
                    const loreValue = fullLoreValue.length > 72 ? `${fullLoreValue.slice(0, 72)}…` : fullLoreValue;
                    button.innerHTML = `<span class="desktop-scenario-number">${index + 1}</span><span><strong data-no-i18n>${escapeStatusHtml(nameValue)}</strong><small data-no-i18n>${escapeStatusHtml(loreValue)}</small></span>`;
                    scenarioList.appendChild(button);
                    /* 桌機情境總覽:按住卡片拖曳排序(輕點仍是開啟編輯) */
                    if (typeof enableReorderDrag === 'function') {
                        enableReorderDrag(button, button, scenarioList, '.desktop-scenario-card', (fromIndex, toIndex) => {
                            syncEditingDataFromDOM();
                            const moved = editingScenarios.splice(fromIndex, 1)[0];
                            editingScenarios.splice(toIndex, 0, moved);
                            renderScenarioList();
                        });
                    }
                });
                const addScenarioButton = document.createElement('button');
                addScenarioButton.type = 'button';
                addScenarioButton.className = 'desktop-overview-card desktop-overview-add-card';
                addScenarioButton.innerHTML = `<span class="desktop-scenario-number">＋</span><span><strong>${escapeStatusHtml(uiText('新增情境'))}</strong><small>${escapeStatusHtml(uiText('建立新的世界或場景'))}</small></span>`;
                addScenarioButton.onclick = () => {
                    addScenarioBlock();
                    openDesktopConfigEditor('scenario', editingScenarios.length - 1);
                };
                scenarioList.appendChild(addScenarioButton);
            }

renderDesktopGameSettings();
updateSetupCurrentPresetLabel();
}

        function renderDesktopGameSettings() {
            const selector = document.getElementById('desktop-preset-selector');
            if (selector) {
                selector.innerHTML = '';
                Object.entries(scenarioPresets).forEach(([id, preset]) => {
                    const option = document.createElement('option');
                    option.value = id;
                    option.textContent = `${valueToText(preset?.presetName, '未命名配置')}${preset?.isLocked ? ' 🔒' : ''}`;
                    option.selected = id === activePresetId;
                    selector.appendChild(option);
                });
            }
            const nameInput = document.getElementById('desktop-preset-name-input');
            if (nameInput && document.activeElement !== nameInput) nameInput.value = document.getElementById('input-preset-name')?.value || '';
            const language = document.getElementById('desktop-language-mode');
            if (language) language.value = document.getElementById('input-language-mode')?.value || 'zh-tw';
            const difficulty = document.getElementById('desktop-game-difficulty');
            if (difficulty) difficulty.value = document.getElementById('input-game-difficulty')?.value || 'standard';
const lockButton = document.getElementById('desktop-preset-lock-btn');
if (lockButton) lockButton.textContent = scenarioPresets[activePresetId]?.isLocked ? '🔒' : '🔓';
const bindingNote = document.getElementById('desktop-preset-binding-note');
if (bindingNote) {
bindingNote.textContent = `${uiText('綁定紀錄')}：${getPresetBoundSaveName(activePresetId)}`;
}
renderPresetDeleteList();
}

function getSaveDisplayName(save) {
return valueToText(save?.title, save?.date || uiText('未命名紀錄'));
}

function getPresetBoundSaveName(presetId) {
const boundSaves = getPresetBoundSaves(presetId);
if (!boundSaves.length) return uiText('無');
return getSaveDisplayName(boundSaves[0][1]);
}

function getPresetDeleteBlockReason(id) {
if (scenarioPresets[id]?.isLocked) return uiText('已上鎖');
return '';
}

function getPresetDeleteNote(id) {
const boundSaveName = getPresetBoundSaveName(id);
if (boundSaveName !== uiText('無')) return `${uiText('綁定紀錄')}：${boundSaveName}`;
return '';
}

function renderPresetDeleteList() {
const list = document.getElementById('preset-delete-list');
const selectAll = document.getElementById('preset-delete-select-all');
if (!list) return;
list.innerHTML = '';
Object.entries(scenarioPresets || {}).forEach(([id, preset]) => {
const reason = getPresetDeleteBlockReason(id);
const note = getPresetDeleteNote(id);
const row = document.createElement('label');
row.className = `desktop-preset-delete-row${reason ? ' disabled' : ''}`;
const checkbox = document.createElement('input');
checkbox.type = 'checkbox';
checkbox.className = 'preset-delete-checkbox';
checkbox.value = id;
checkbox.disabled = Boolean(reason);
checkbox.onchange = syncPresetDeleteSelectAll;
const name = document.createElement('span');
name.className = 'desktop-preset-delete-name';
name.textContent = `${valueToText(preset?.presetName, '未命名配置')}${reason ? `（${reason}）` : note ? `（${note}）` : ''}`;
row.title = name.textContent;
row.appendChild(checkbox);
row.appendChild(name);
list.appendChild(row);
});
if (selectAll) {
selectAll.checked = false;
selectAll.indeterminate = false;
selectAll.disabled = !list.querySelector('.preset-delete-checkbox:not(:disabled)');
}
}

function syncPresetDeleteSelectAll() {
const selectAll = document.getElementById('preset-delete-select-all');
const boxes = Array.from(document.querySelectorAll('.preset-delete-checkbox:not(:disabled)'));
if (!selectAll) return;
const checked = boxes.filter(box => box.checked).length;
selectAll.checked = boxes.length > 0 && checked === boxes.length;
selectAll.indeterminate = checked > 0 && checked < boxes.length;
}

function togglePresetDeleteSelectAll(checked) {
document.querySelectorAll('.preset-delete-checkbox:not(:disabled)').forEach(box => {
box.checked = checked;
});
syncPresetDeleteSelectAll();
}

async function deleteSelectedPresets() {
const selectedIds = Array.from(document.querySelectorAll('.preset-delete-checkbox:checked:not(:disabled)')).map(box => box.value);
if (!selectedIds.length) {
alert(uiText('請先勾選要刪除的配置。'));
return;
}
const deletableIds = selectedIds.filter(id => !getPresetDeleteBlockReason(id));
if (!deletableIds.length) {
alert(uiText('勾選的配置目前都不能刪除。'));
renderPresetDeleteList();
return;
}
if (Object.keys(scenarioPresets).length - deletableIds.length < 1) {
alert(uiText('系統至少需要保留一組配置喔！'));
renderPresetDeleteList();
return;
}
const names = deletableIds.map(id => `• ${valueToText(scenarioPresets[id]?.presetName, '未命名配置')}`).join('\n');
const confirmMessage = `${uiText('確定要刪除 {count} 個配置嗎？').replace('{count}', deletableIds.length)}\n${names}`;
if (!confirm(confirmMessage)) return;
for (const id of deletableIds) {
const boundSaves = getPresetBoundSaves(id);
if (!boundSaves.length) continue;
const saveName = getSaveDisplayName(boundSaves[0][1]);
const boundMessage = uiText('此配置目前綁定「{saveName}」遊戲紀錄。刪除配置會一起刪除此紀錄，確定要刪除嗎？')
.replace('{saveName}', saveName);
if (!confirm(boundMessage)) return;
}
const deletionResult = await deletePresetsAndBoundSaves(deletableIds);
if (!deletionResult) {
renderPresetDeleteList();
renderSaveList();
return;
}
renderPresetSelector();
loadPresetToForm(activePresetId);
renderDesktopGameSettings();
renderSaveList();
alert(uiText('已刪除 {count} 個配置。').replace('{count}', deletableIds.length));
}

function selectDesktopPreset(id) {
            if (!scenarioPresets[id] || id === activePresetId) return;
            commitCurrentPresetSilently();
            loadPresetToForm(id);
            localStorage.setItem('sanko_active_preset_id', id);
            renderDesktopPresetOverview();
        }

 function updateDesktopPresetName(value) {
 const input = document.getElementById('input-preset-name');
 if (input) input.value = value;
 const nextName = valueToText(value, uiText('未命名配置'));
 if (scenarioPresets[activePresetId]) scenarioPresets[activePresetId].presetName = nextName;
 const desktopOption = document.querySelector(`#desktop-preset-selector option[value="${CSS.escape(activePresetId)}"]`);
 if (desktopOption) desktopOption.textContent = `${nextName}${scenarioPresets[activePresetId]?.isLocked ? ' 🔒' : ''}`;
 const legacyOption = document.querySelector(`#preset-selector option[value="${CSS.escape(activePresetId)}"]`);
 if (legacyOption) legacyOption.textContent = `${nextName}${scenarioPresets[activePresetId]?.isLocked ? ' 🔒' : ''}`;
 renderDesktopPresetOverview();
 updateSetupCurrentPresetLabel();
 }

        function setDesktopLanguageMode(value) {
            syncPresetLanguageMode(value);
            renderDesktopGameSettings();
        }

        function setDesktopGameDifficulty(value) {
            const input = document.getElementById('input-game-difficulty');
            if (input) input.value = normalizeGameDifficulty(value);
        }

        function renderPresetSelector() {
            const selector = document.getElementById('preset-selector'); selector.innerHTML = '';
            for (const id in scenarioPresets) {
                const opt = document.createElement('option'); opt.value = id;
                const lockStatus = scenarioPresets[id].isLocked ? " 🔒" : "";
                opt.textContent = scenarioPresets[id].presetName + lockStatus;
                if (id === activePresetId) opt.selected = true; selector.appendChild(opt);
            }
            renderDesktopGameSettings();
        }

        function updatePresetLockUI() {
            const p = scenarioPresets[activePresetId];
            const isLocked = p ? p.isLocked : false;
            document.getElementById('preset-lock-toggle').innerText = isLocked ? "🔒" : "🔓";
            renderPresetSelector();
            renderDesktopGameSettings();
        }

        function togglePresetLock() {
            let p = scenarioPresets[activePresetId];
            if (!p) return;
            if (!p.isLocked) {
                commitCurrentPresetSilently();
                p = scenarioPresets[activePresetId];
            }
            p.isLocked = !p.isLocked;
            persistJson('sanko_scenario_presets_v2', scenarioPresets, '角色配置');
            updatePresetLockUI();
        }

        let forceOpenNpcIndex = -1;
        let desktopNewNpcIndex = -1;
        function renderNpcList() {
            const container = document.getElementById('npc-list-container');
            container.innerHTML = '';
            editingNpcs.forEach((npc, index) => {
                const isNewNpc = index === desktopNewNpcIndex;
                const details = document.createElement('details');
                details.className = `foldable-card${isNewNpc ? ' desktop-new-npc-card' : ''}`;
                if (index === forceOpenNpcIndex) details.open = true;
                const backLabel = uiText('返回 NPC 預覽');
                const acquaintanceLabel = uiText('認識夥伴');
                const doneLabel = uiText('完成');
                const deleteLabel = escapeStatusHtml(uiText('刪除 NPC'));
                const deleteButton = isNewNpc ? '' : `
                    <button type="button" class="desktop-npc-editor-delete hold-delete" data-hold-kind="npc" data-hold-index="${index}">
                        <span class="hold-delete-base">${deleteLabel}</span>
                        <span class="hold-delete-wash">${deleteLabel}</span>
                    </button>
                `;

                details.innerHTML = `
                    <summary><span class="reorder-handle" data-no-i18n title="${escapeStatusHtml(uiText('拖曳排序'))}">☰</span>NPC: <span id="npc-title-${index}" data-no-i18n>${escapeStatusHtml(npc.name || '新角色')}</span></summary>
                    <div class="foldable-content">
                        <header class="desktop-npc-editor-header">
                            <button type="button" class="npc-flow-return-action" onclick="completeDesktopNpcEdit(${index})">
                                <img src="assets/icons/back.svg" alt="" aria-hidden="true">
                                <span class="npc-flow-return-label" data-label="${escapeStatusHtml(backLabel)}">
                                    ${escapeStatusHtml(backLabel)}
                                </span>
                            </button>
                        </header>
                        <div class="avatar-setup-area u-inline-060">
                            <div class="avatar-box" onclick="document.getElementById('upload-npc-${index}').click();">
                                <img id="preview-npc-${index}" class="avatar-preview" src="${escapeStatusHtml(npc.avatar || emptyAvatar)}" alt="">
                                <div class="avatar-label">點擊更換頭像</div>
                                <input type="file" id="upload-npc-${index}" accept="image/*" onchange="triggerCrop(this, 'npc-${index}')" hidden class="hidden-file-input">
                            </div>
                        </div>
                        <div class="desktop-npc-editor-identity">
                            <label class="desktop-npc-editor-name">
                                <input type="text" class="scenario-input" id="npc-name-${index}"
                                    value="${escapeStatusHtml(npc.name)}"
                                    aria-label="${escapeStatusHtml(uiText('NPC 名稱'))}"
                                    placeholder="${escapeStatusHtml(uiText('輸入名稱'))}"
                                    oninput="document.getElementById('npc-title-${index}').innerText = this.value || '新角色'; renderDesktopPresetOverview();">
                            </label>
                            <label class="desktop-npc-editor-affection">
                                <span>${escapeStatusHtml(uiText('開局好感'))}</span>
                                <input type="number" class="scenario-input" id="npc-aff-${index}"
                                    value="${npc.affection !== undefined ? npc.affection : 0}">
                            </label>
                        </div>
                        <div class="anime-sheet desktop-npc-editor-grid">
                            <label class="desktop-npc-editor-field">
                                <span>${escapeStatusHtml(uiText('年齡／身高／體型'))}</span>
                                <input type="text" id="npc-age-${index}" value="${escapeStatusHtml(npc.details?.age || '')}">
                            </label>
                            <label class="desktop-npc-editor-field">
                                <span>${escapeStatusHtml(uiText('說話習慣／語氣'))}</span>
                                <input type="text" id="npc-speech-${index}" value="${escapeStatusHtml(npc.details?.speech || '')}">
                            </label>
                            <label class="desktop-npc-editor-field">
                                <span>${escapeStatusHtml(uiText('喜好'))}</span>
                                <input type="text" id="npc-likes-${index}" value="${escapeStatusHtml(npc.details?.likes || '')}">
                            </label>
                            <label class="desktop-npc-editor-field">
                                <span>${escapeStatusHtml(uiText('厭惡'))}</span>
                                <input type="text" id="npc-dislikes-${index}" value="${escapeStatusHtml(npc.details?.dislikes || '')}">
                            </label>
                            <label class="desktop-npc-editor-field full">
                                <span>${escapeStatusHtml(uiText('外貌特徵／常見穿搭'))}</span>
                                <textarea id="npc-app-${index}" rows="3" oninput="autoResize(this)">${escapeStatusHtml(npc.details?.app || '')}</textarea>
                            </label>
                            <label class="desktop-npc-editor-field full">
                                <span>${escapeStatusHtml(uiText('核心性格／背景故事'))}</span>
                                <textarea id="npc-bg-${index}" rows="3" oninput="autoResize(this)">${escapeStatusHtml(npc.details?.bg || npc.persona || '')}</textarea>
                            </label>
                        </div>
                        <div class="desktop-npc-editor-actions">
                            ${deleteButton}
                            <div class="desktop-npc-editor-actions-primary">
                                <button type="button" class="npc-flow-bracket-action" onclick="openNpcAcquaintanceFlow(${index})">
                                    <span class="npc-flow-bracket-label" data-label="${escapeStatusHtml(acquaintanceLabel)}">${escapeStatusHtml(acquaintanceLabel)}</span>
                                </button>
                                <button type="button" class="npc-flow-bracket-action" onclick="completeDesktopNpcEdit(${index})">
                                    <span class="npc-flow-bracket-label" data-label="${escapeStatusHtml(doneLabel)}">${escapeStatusHtml(doneLabel)}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                container.appendChild(details);
                if (typeof enableReorderDrag === 'function') {
                    enableReorderDrag(details.querySelector('.reorder-handle'), details, container, 'details.foldable-card', (fromIndex, toIndex) => {
                        syncEditingDataFromDOM();
                        const moved = editingNpcs.splice(fromIndex, 1)[0];
                        editingNpcs.splice(toIndex, 0, moved);
                        renderNpcList();
                    });
                }
            });
            initTextareas();
            forceOpenNpcIndex = -1;
            renderDesktopPresetOverview();
        }

        let desktopNpcPreviewIndex = -1;

        function desktopNpcPreviewTextHtml(value) {
            const text = valueToText(value, '').trim();
            if (!text) {
                return `<span class="desktop-npc-preview-empty">${escapeStatusHtml(uiText('尚未設定'))}</span>`;
            }
            return escapeStatusHtml(text).replace(/\n/g, '<br>');
        }

        function renderDesktopNpcPreviewItem(label, value) {
            return `
                <div class="npc-flow-basis-row">
                    <span>${escapeStatusHtml(uiText(label))}</span>
                    <strong data-no-i18n>${desktopNpcPreviewTextHtml(value)}</strong>
                </div>
            `;
        }

        function ensureDesktopNpcPreview() {
            const editor = document.getElementById('desktop-config-editor');
            if (!editor) return null;
            let preview = document.getElementById('desktop-npc-readonly-preview');
            if (preview) return preview;
            preview = document.createElement('section');
            preview.id = 'desktop-npc-readonly-preview';
            preview.className = 'desktop-npc-readonly-preview';
            preview.hidden = true;
            editor.appendChild(preview);
            return preview;
        }

        function openDesktopNpcPreview(npcIndex) {
            syncEditingDataFromDOM();
            if (desktopNewNpcIndex >= 0) {
                desktopNewNpcIndex = -1;
                renderNpcList();
            }
            const npc = editingNpcs[npcIndex];
            const screen = document.getElementById('edit-scenario-screen');
            const preview = ensureDesktopNpcPreview();
            if (!npc || !screen || !preview) return;
            if (screen.classList.contains('npc-acquaintance-open')) {
                closeNpcAcquaintanceFlow({ restoreEditor: false });
            }
            if (screen.classList.contains('player-preview-open')) {
                closeDesktopPlayerPreview({ restoreOverview: false });
            }
            desktopNpcPreviewIndex = npcIndex;
            desktopConfigWorkspace = 'characters';
            screen.dataset.workspace = 'characters';
            screen.dataset.editorSection = 'npc';
            screen.classList.remove('game-workspace-active');
            screen.classList.add('desktop-editor-open', 'npc-preview-open');
            setDesktopConfigTab('characters');
            document.querySelectorAll('.desktop-workspace-view').forEach(view => {
                view.classList.toggle('active', view.dataset.workspaceView === 'characters');
            });
            preview.hidden = false;
            renderDesktopNpcPreview();
            document.getElementById('desktop-config-editor')?.scrollTo({ top: 0, behavior: 'auto' });
        }

        function closeDesktopNpcPreview(options = {}) {
            const restoreOverview = options.restoreOverview !== false;
            const screen = document.getElementById('edit-scenario-screen');
            const preview = document.getElementById('desktop-npc-readonly-preview');
            screen?.classList.remove('npc-preview-open');
            if (preview) preview.hidden = true;
            desktopNpcPreviewIndex = -1;
            if (restoreOverview) switchDesktopConfigWorkspace('characters');
        }

        function editDesktopNpcFromPreview() {
            const npcIndex = desktopNpcPreviewIndex;
            if (npcIndex < 0) return;
            closeDesktopNpcPreview({ restoreOverview: false });
            openDesktopConfigEditor('npc', npcIndex);
        }

        function completeDesktopNpcEdit(npcIndex) {
            if (npcIndex < 0) return;
            openDesktopNpcPreview(npcIndex);
        }

        function startNpcAcquaintanceFromPreview() {
            const npcIndex = desktopNpcPreviewIndex;
            if (npcIndex < 0) return;
            closeDesktopNpcPreview({ restoreOverview: false });
            openNpcAcquaintanceFlow(npcIndex);
        }

        function renderDesktopNpcPreview() {
            const preview = document.getElementById('desktop-npc-readonly-preview');
            const npc = editingNpcs[desktopNpcPreviewIndex];
            if (!preview || !npc) return;
            const details = npc.details && typeof npc.details === 'object'
                ? npc.details
                : {};
            const name = uiCharacterName(npc.name, uiText('未命名'));
            const affection = Math.max(-100, Math.min(100, Math.round(Number(npc.affection)) || 0));
            const avatar = valueToText(npc.avatar, '');
            const avatarImage = avatar && avatar !== emptyAvatar
                ? `<img src="${escapeStatusHtml(avatar)}" alt="">`
                : '';
            const initial = Array.from(name)[0] || 'N';
            const editLabel = uiText('編輯');
            const acquaintanceLabel = uiText('認識夥伴');
            preview.innerHTML = `
                <div class="desktop-npc-preview-hero">
                    <span class="desktop-npc-preview-hero-avatar" data-initial="${escapeStatusHtml(initial)}">
                        ${avatarImage}
                    </span>
                    <h2 data-no-i18n>${escapeStatusHtml(name)}</h2>
                    <span class="desktop-npc-preview-affection" data-no-i18n>♥ ${affection}</span>
                    <button type="button" class="desktop-npc-preview-tool" onclick="editDesktopNpcFromPreview()">
                        ${escapeStatusHtml(editLabel)}
                    </button>
                </div>
                <div class="npc-flow-basis-list desktop-character-preview-basis">
                    ${renderDesktopNpcPreviewItem('體格', details.age)}
                    ${renderDesktopNpcPreviewItem('語氣', details.speech)}
                    ${renderDesktopNpcPreviewItem('喜好', details.likes)}
                    ${renderDesktopNpcPreviewItem('厭惡', details.dislikes)}
                    ${renderDesktopNpcPreviewItem('外貌與穿搭', details.app)}
                    ${renderDesktopNpcPreviewItem('核心性格與背景', details.bg)}
                </div>
                <div class="npc-flow-action-row desktop-npc-preview-actions">
                    <button type="button" class="npc-flow-bracket-action" onclick="startNpcAcquaintanceFromPreview()"
                        aria-label="${escapeStatusHtml(acquaintanceLabel)}">
                        <span class="npc-flow-bracket-label" data-label="${escapeStatusHtml(acquaintanceLabel)}">
                            ${escapeStatusHtml(acquaintanceLabel)}
                        </span>
                    </button>
                </div>
            `;
        }

        /* ==== 玩家唯讀預覽(2026-07-16 批次A):沿用 NPC 唯讀預覽與角色面板「詳細」語彙 ==== */
        function ensureDesktopPlayerPreview() {
            const editor = document.getElementById('desktop-config-editor');
            if (!editor) return null;
            let preview = document.getElementById('desktop-player-readonly-preview');
            if (preview) return preview;
            preview = document.createElement('section');
            preview.id = 'desktop-player-readonly-preview';
            preview.className = 'desktop-npc-readonly-preview';
            preview.hidden = true;
            editor.appendChild(preview);
            return preview;
        }

        function openDesktopPlayerPreview() {
            const screen = document.getElementById('edit-scenario-screen');
            const preview = ensureDesktopPlayerPreview();
            if (!screen || !preview) return;
            if (screen.classList.contains('npc-acquaintance-open')) {
                closeNpcAcquaintanceFlow({ restoreEditor: false });
            }
            if (screen.classList.contains('npc-preview-open')) {
                closeDesktopNpcPreview({ restoreOverview: false });
            }
            if (screen.classList.contains('random-generator-inline-open')) closeRandomGenerator();
            desktopConfigWorkspace = 'characters';
            screen.dataset.workspace = 'characters';
            screen.dataset.editorSection = 'player';
            screen.classList.remove('game-workspace-active');
            screen.classList.add('desktop-editor-open', 'player-preview-open');
            setDesktopConfigTab('characters');
            document.querySelectorAll('.desktop-workspace-view').forEach(view => {
                view.classList.toggle('active', view.dataset.workspaceView === 'characters');
            });
            preview.hidden = false;
            renderDesktopPlayerPreview();
            document.getElementById('desktop-config-editor')?.scrollTo({ top: 0, behavior: 'auto' });
            if (!isDesktopConfigLayout()) {
                requestAnimationFrame(() => {
                    window.scrollTo(0, 0);
                });
            }
        }

        function closeDesktopPlayerPreview(options = {}) {
            const restoreOverview = options.restoreOverview !== false;
            const screen = document.getElementById('edit-scenario-screen');
            const preview = document.getElementById('desktop-player-readonly-preview');
            screen?.classList.remove('player-preview-open');
            if (preview) preview.hidden = true;
            if (restoreOverview) switchDesktopConfigWorkspace('characters');
        }

        function editDesktopPlayerFromPreview() {
            closeDesktopPlayerPreview({ restoreOverview: false });
            openDesktopConfigEditor('player');
        }

        function desktopPlayerPreviewStatHtml(label, value) {
            const clamped = Math.max(1, Math.min(20, Number.parseInt(value, 10) || 10));
            const number = String(clamped).padStart(2, '0');
            return `
                <span class="status-stat-item">
                    <span>${escapeStatusHtml(uiText(label))}</span>
                    <strong data-no-i18n>${escapeStatusHtml(number)}</strong>
                </span>
            `;
        }

        function renderDesktopPlayerPreview() {
            const preview = document.getElementById('desktop-player-readonly-preview');
            if (!preview) return;
            const name = uiCharacterName(document.getElementById('input-player-name')?.value, uiText('玩家'));
            const avatar = document.getElementById('preview-player')?.src || '';
            const avatarImage = avatar && avatar !== emptyAvatar
                ? `<img src="${escapeStatusHtml(avatar)}" alt="">`
                : '';
            const initial = Array.from(name)[0] || 'P';
            const readField = id => document.getElementById(id)?.value || '';
            const stats = typeof readPlayerStatsFromInputs === 'function' ? readPlayerStatsFromInputs() : {};
            const editLabel = uiText('編輯');
            preview.innerHTML = `
                <div class="desktop-npc-preview-hero">
                    <span class="desktop-npc-preview-hero-avatar" data-initial="${escapeStatusHtml(initial)}">
                        ${avatarImage}
                    </span>
                    <h2 data-no-i18n>${escapeStatusHtml(name)}</h2>
                    <button type="button" class="desktop-npc-preview-tool" onclick="editDesktopPlayerFromPreview()">
                        ${escapeStatusHtml(editLabel)}
                    </button>
                </div>
                <div class="u-inline-071 desktop-player-preview-stats" aria-label="${escapeStatusHtml(uiText('玩家六圍屬性'))}">
                    ${desktopPlayerPreviewStatHtml('STR 力量', stats.str)}
                    ${desktopPlayerPreviewStatHtml('DEX 敏捷', stats.dex)}
                    ${desktopPlayerPreviewStatHtml('CON 體質', stats.con)}
                    ${desktopPlayerPreviewStatHtml('INT 智力', stats.int)}
                    ${desktopPlayerPreviewStatHtml('WIS 感知', stats.wis)}
                    ${desktopPlayerPreviewStatHtml('CHA 魅力', stats.cha)}
                </div>
                <div class="npc-flow-basis-list desktop-character-preview-basis">
                    ${renderDesktopNpcPreviewItem('體格', readField('p-age'))}
                    ${renderDesktopNpcPreviewItem('語氣', readField('p-speech'))}
                    ${renderDesktopNpcPreviewItem('喜好', readField('p-likes'))}
                    ${renderDesktopNpcPreviewItem('厭惡', readField('p-dislikes'))}
                    ${renderDesktopNpcPreviewItem('外貌與穿搭', readField('p-app'))}
                    ${renderDesktopNpcPreviewItem('核心性格與背景', readField('p-bg'))}
                </div>
            `;
        }

        function completeDesktopPlayerEdit() {
            openDesktopPlayerPreview();
        }

        function ensureDesktopPlayerEditorReturn() {
            const editor = document.getElementById('desktop-config-editor');
            if (!editor) return;
            let button = document.getElementById('desktop-player-editor-return');
            if (!button) {
                button = document.createElement('button');
                button.type = 'button';
                button.id = 'desktop-player-editor-return';
                button.className = 'npc-flow-return-action desktop-player-editor-return';
                button.onclick = completeDesktopPlayerEdit;
                editor.prepend(button);
            }
            const label = uiText('返回玩家預覽');
            button.innerHTML = `
                <img src="assets/icons/back.svg" alt="" aria-hidden="true">
                <span class="npc-flow-return-label" data-label="${escapeStatusHtml(label)}">${escapeStatusHtml(label)}</span>
            `;
        }

        function handleMobileConfigEditorBack() {
            const screen = document.getElementById('edit-scenario-screen');
            const inPlayerEditor = screen?.dataset.editorSection === 'player'
                && !screen.classList.contains('player-preview-open');
            if (inPlayerEditor) {
                openDesktopPlayerPreview();
                return;
            }
            switchDesktopConfigWorkspace(desktopConfigWorkspace);
        }

        let holdDeleteTimer = null;
        let holdDeleteButton = null;

        function ensureHoldDeleteDelegation() {
            if (window.__holdDeleteDelegated) return;
            window.__holdDeleteDelegated = true;
            document.addEventListener('pointerdown', event => {
                const button = event.target.closest('.hold-delete');
                if (!button) return;
                event.preventDefault();
                holdDeleteButton = button;
                button.classList.add('arming');
                holdDeleteTimer = window.setTimeout(() => {
                    button.classList.remove('arming');
                    holdDeleteButton = null;
                    const holdIndex = Number(button.dataset.holdIndex);
                    if (button.dataset.holdKind === 'npc') removeNpcBlock(holdIndex);
                    if (button.dataset.holdKind === 'scenario') removeScenarioBlock(holdIndex);
                }, 1200);
            });
            const disarmHoldDelete = event => {
                if (!holdDeleteButton) return;
                window.clearTimeout(holdDeleteTimer);
                holdDeleteButton.classList.remove('arming');
                holdDeleteButton = null;
                if (event.type === 'pointerup' && typeof tinyToast === 'function') {
                    tinyToast(uiText('長按以刪除'));
                }
            };
            document.addEventListener('pointerup', disarmHoldDelete);
            document.addEventListener('pointercancel', disarmHoldDelete);
            document.addEventListener('contextmenu', event => {
                if (event.target.closest('.hold-delete')) event.preventDefault();
            });
        }

        function syncStaticBracketLabels() {
            document.querySelectorAll('.npc-flow-bracket-label').forEach(label => {
                if (!label.closest('#npc-acquaintance-flow')) {
                    label.dataset.label = label.textContent.trim();
                }
            });
        }

        const NPC_ACQUAINTANCE_FIELDS = [
            { key: 'age', label: '年齡／身高／體型', previewLabel: '體格', inputPrefix: 'npc-age' },
            { key: 'speech', label: '說話習慣／語氣', previewLabel: '語氣', inputPrefix: 'npc-speech' },
            { key: 'likes', label: '喜好', previewLabel: '喜好', inputPrefix: 'npc-likes' },
            { key: 'dislikes', label: '厭惡', previewLabel: '厭惡', inputPrefix: 'npc-dislikes' },
            { key: 'app', label: '外貌特徵／常見穿搭', previewLabel: '外貌與穿搭', inputPrefix: 'npc-app' },
            { key: 'bg', label: '核心性格／背景故事', previewLabel: '核心性格與背景', inputPrefix: 'npc-bg' }
        ];
        const NPC_ACQUAINTANCE_QUESTIONS = [
            '我可以相信你嗎？',
            '你現在最在意的是什麼？',
            '如果我現在需要你幫忙，你會答應嗎？',
            '你總是這麼安靜嗎？',
            '__custom__'
        ];
        const NPC_ACQUAINTANCE_REFINEMENTS = [
            '他不會說得這麼直接。',
            '動作描寫太多了。',
            '語氣應該再冷一點。',
            '__custom__'
        ];
        const npcAcquaintanceSessions = new Map();
        let npcAcquaintanceSession = null;
        let npcAcquaintanceRequestSerial = 0;

        function createNpcAcquaintanceSession(npc, npcIndex) {
            const npcKey = String(npc.id || `npc-index-${npcIndex}`);
            let session = npcAcquaintanceSessions.get(npcKey);
            if (!session) {
                session = {
                    npcKey,
                    npcIndex,
                    view: 'intro',
                    question: '',
                    customQuestion: '',
                    playerLine: '',
                    npcLine: '',
                    judgement: '',
                    refine: '',
                    customRefine: '',
                    refineNote: '',
                    saveTarget: '',
                    saveMode: '',
                    savedNote: false,
                    savedTarget: '',
                    scenarioIndex: -1,
                    scenarioDrafts: {},
                    scenarioPlayerLine: '',
                    scenarioNpcLine: '',
                    busy: false,
                    error: ''
                };
                npcAcquaintanceSessions.set(npcKey, session);
            }
            session.npcIndex = npcIndex;
            session.view = 'intro';
            session.busy = false;
            session.error = '';
            if (session.scenarioIndex >= 0 && !editingScenarios[session.scenarioIndex]) {
                session.scenarioIndex = -1;
            }
            return session;
        }

        function ensureNpcAcquaintanceFlow() {
            const editor = document.getElementById('desktop-config-editor');
            if (!editor) return null;
            let flow = document.getElementById('npc-acquaintance-flow');
            if (flow) return flow;
            flow = document.createElement('section');
            flow.id = 'npc-acquaintance-flow';
            flow.className = 'npc-acquaintance-flow';
            flow.hidden = true;
            flow.setAttribute('aria-live', 'polite');
            flow.addEventListener('pointerdown', handleNpcAcquaintancePointerDown);
            flow.addEventListener('click', handleNpcAcquaintanceClick);
            flow.addEventListener('keydown', handleNpcAcquaintanceKeyDown);
            flow.addEventListener('input', handleNpcAcquaintanceInput);
            editor.appendChild(flow);
            return flow;
        }

        function openNpcAcquaintanceFlow(npcIndex) {
            syncEditingDataFromDOM();
            const npc = editingNpcs[npcIndex];
            const screen = document.getElementById('edit-scenario-screen');
            if (screen?.classList.contains('npc-preview-open')) {
                closeDesktopNpcPreview({ restoreOverview: false });
            }
            const flow = ensureNpcAcquaintanceFlow();
            if (!npc || !screen || !flow) return;
            if (screen.classList.contains('random-generator-inline-open')) closeRandomGenerator();
            npcAcquaintanceSession = createNpcAcquaintanceSession(npc, npcIndex);
            screen.classList.add('desktop-editor-open', 'npc-acquaintance-open');
            screen.dataset.editorSection = 'npc';
            flow.hidden = false;
            renderNpcAcquaintanceFlow();
            document.getElementById('desktop-config-editor')?.scrollTo({ top: 0, behavior: 'auto' });
        }

        function closeNpcAcquaintanceFlow(options = {}) {
            const restoreEditor = options.restoreEditor !== false;
            const screen = document.getElementById('edit-scenario-screen');
            const flow = document.getElementById('npc-acquaintance-flow');
            const npcIndex = npcAcquaintanceSession?.npcIndex ?? -1;
            npcAcquaintanceRequestSerial += 1;
            if (npcAcquaintanceSession?.busy && typeof cancelActiveAIRequest === 'function') {
                cancelActiveAIRequest();
            }
            if (npcAcquaintanceSession) npcAcquaintanceSession.busy = false;
            screen?.classList.remove('npc-acquaintance-open');
            if (flow) flow.hidden = true;
            npcAcquaintanceSession = null;
            if (restoreEditor && npcIndex >= 0) {
                forceOpenNpcIndex = npcIndex;
                renderNpcList();
                openDesktopConfigEditor('npc', npcIndex);
            }
        }

        function npcAcquaintanceActionHtml(action, label, options = {}) {
            const translated = uiText(label);
            const disabled = options.disabled ? ' disabled' : '';
            const className = options.secondary ? ' secondary' : '';
            return `
                <button type="button" class="npc-flow-bracket-action${className}" data-flow-action="${action}"${disabled}
                    aria-label="${escapeStatusHtml(translated)}">
                    <span class="npc-flow-bracket-label" data-label="${escapeStatusHtml(translated)}">${escapeStatusHtml(translated)}</span>
                </button>
            `;
        }

        function npcAcquaintanceReturnHtml(action, label) {
            const translated = uiText(label);
            return `
                <button type="button" class="npc-flow-return-action" data-flow-action="${action}">
                    <img src="assets/icons/back.svg" alt="" aria-hidden="true">
                    <span class="npc-flow-return-label" data-label="${escapeStatusHtml(translated)}">${escapeStatusHtml(translated)}</span>
                </button>
            `;
        }

        function npcAcquaintanceOptionListHtml(group, items, selectedValue) {
            const buttons = items.map(item => {
                const selected = String(item.value) === String(selectedValue);
                return `
                    <button type="button" class="npc-flow-option" data-option-value="${escapeStatusHtml(String(item.value))}"
                        aria-pressed="${selected ? 'true' : 'false'}">${escapeStatusHtml(item.label)}</button>
                `;
            }).join('');
            return `
                <div class="npc-flow-option-list" data-option-group="${group}">
                    ${buttons}
                </div>
            `;
        }

        function getNpcAcquaintanceFieldValue(key) {
            const npc = editingNpcs[npcAcquaintanceSession?.npcIndex];
            return valueToText(npc?.details?.[key], '');
        }

        function getNpcAcquaintanceWriteResult() {
            const session = npcAcquaintanceSession;
            if (!session?.saveTarget || !session.saveMode || !session.refineNote) return '';
            const current = getNpcAcquaintanceFieldValue(session.saveTarget);
            if (session.saveMode === 'replace' || !current) return session.refineNote;
            const multiline = ['app', 'bg'].includes(session.saveTarget);
            return `${current}${multiline ? '\n' : '；'}${session.refineNote}`;
        }

        function npcAcquaintanceDialogueHtml(playerLine, npcLine, npc) {
            const playerName = uiCharacterName(
                document.getElementById('input-player-name')?.value,
                uiText('你')
            );
            const playerAvatar = document.getElementById('preview-player')?.src || emptyAvatar;
            const npcName = uiCharacterName(npc?.name, uiText('未命名'));
            const npcAvatar = valueToText(npc?.avatar, '') || emptyAvatar;
            return `
                <div class="npc-flow-dialogue">
                    <div class="msg-wrapper player">
                        <img src="${escapeStatusHtml(playerAvatar)}" class="chat-avatar" alt="">
                        <div class="msg-content">
                            <span class="msg-speaker" data-no-i18n>${escapeStatusHtml(playerName)}</span>
                            <div class="msg-text" data-no-i18n>${escapeStatusHtml(playerLine)}</div>
                        </div>
                    </div>
                    <div class="msg-wrapper npc">
                        <img src="${escapeStatusHtml(npcAvatar)}" class="chat-avatar" alt="">
                        <div class="msg-content">
                            <span class="msg-speaker" data-no-i18n>${escapeStatusHtml(npcName)}</span>
                            <div class="msg-text" data-no-i18n>${escapeStatusHtml(npcLine)}</div>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderNpcAcquaintanceIntro(npc) {
            const filledFields = NPC_ACQUAINTANCE_FIELDS
                .map(field => ({ ...field, value: valueToText(npc.details?.[field.key], '') }))
                .filter(field => field.value);
            const fieldRows = filledFields.map(field => `
                <div class="npc-flow-basis-row">
                    <span>${escapeStatusHtml(uiText(field.previewLabel))}</span>
                    <strong data-no-i18n>${escapeStatusHtml(field.value)}</strong>
                </div>
            `).join('');
            const emptyMessage = `
                <p class="npc-flow-empty-note">${escapeStatusHtml(uiText('請先填寫至少一項人物基底，再開始認識夥伴。'))}</p>
            `;
            const foundationNote = filledFields.length
                ? `<p class="npc-flow-foundation-note">${escapeStatusHtml(uiText('人物基底已有玩家提供的內容，可以進入對話驗證；對話本身不會改寫人設。'))}</p>`
                : '';
            return `
                <div class="npc-flow-view" data-flow-view="intro">
                    <h2 class="npc-flow-title" tabindex="-1">${escapeStatusHtml(uiText('先確認人物基底'))}</h2>
                    <p class="npc-flow-lead">
                        ${escapeStatusHtml(uiText('只顯示玩家已明確填寫的內容；不知道的部分維持未知，不交給 AI 猜測。'))}
                    </p>
                    <div class="npc-flow-basis-list"
                        aria-label="${escapeStatusHtml(uiText('玩家已填寫的人物基底'))}">
                        ${fieldRows || emptyMessage}
                    </div>
                    ${foundationNote}
                    <div class="npc-flow-action-row">
                        ${npcAcquaintanceActionHtml('question', '和他說一句', { disabled: !filledFields.length })}
                    </div>
                </div>
            `;
        }

        function renderNpcAcquaintanceQuestion() {
            const session = npcAcquaintanceSession;
            const items = NPC_ACQUAINTANCE_QUESTIONS.map(value => ({
                value,
                label: uiText(value === '__custom__' ? '我想自己跟他說' : value)
            }));
            const custom = session.question === '__custom__';
            return `
                <div class="npc-flow-view" data-flow-view="question">
                    <h2 class="npc-flow-title" tabindex="-1">${escapeStatusHtml(uiText('和他說一句'))}</h2>
                    <p class="npc-flow-lead">${escapeStatusHtml(uiText('選一句話，或自己輸入想對他說的內容。'))}</p>
                    ${npcAcquaintanceOptionListHtml('question', items, session.question)}
                    <label class="npc-flow-custom-field${custom ? '' : ' is-hidden'}">
                        <span>${escapeStatusHtml(uiText('我想說'))}</span>
                        <textarea rows="3" data-flow-input="custom-question"
                            placeholder="${escapeStatusHtml(uiText('輸入想對他說的話'))}">${escapeStatusHtml(session.customQuestion)}</textarea>
                    </label>
                    <div class="npc-flow-action-row">
                        ${npcAcquaintanceActionHtml('send-question', '就說這一句', {
                            disabled: custom && !session.customQuestion.trim()
                        })}
                    </div>
                </div>
            `;
        }

        function renderNpcAcquaintanceResponse(npc) {
            const session = npcAcquaintanceSession;
            if (session.busy) {
                return `
                    <div class="npc-flow-view npc-flow-wait-view" data-flow-view="response">
                        <h2 class="npc-flow-title" tabindex="-1">${escapeStatusHtml(uiText('正在聽他回答...'))}</h2>
                        <div class="npc-flow-wait-mark" aria-hidden="true"><span></span><span></span><span></span></div>
                        <p class="npc-flow-lead">${escapeStatusHtml(uiText('人物資料不會在等待時被修改。'))}</p>
                        <div class="npc-flow-action-row">
                            ${npcAcquaintanceReturnHtml('cancel-request', '取消等待')}
                        </div>
                    </div>
                `;
            }
            if (session.error) {
                return `
                    <div class="npc-flow-view" data-flow-view="response">
                        <h2 class="npc-flow-title" tabindex="-1">${escapeStatusHtml(uiText('暫時沒有聽到回答'))}</h2>
                        <p class="npc-flow-error">${escapeStatusHtml(uiText(session.error))}</p>
                        <div class="npc-flow-action-row">
                            ${npcAcquaintanceReturnHtml('question', '回到上一頁')}
                            ${npcAcquaintanceActionHtml('send-question', '再試一次')}
                        </div>
                    </div>
                `;
            }
            const judgementItems = [
                { value: 'accept', label: uiText('像他，先記住這個方向') },
                { value: 'refine', label: uiText('有點不像') },
                { value: 'again', label: uiText('再和他說一句') }
            ];
            return `
                <div class="npc-flow-view" data-flow-view="response">
                    <h2 class="npc-flow-title" tabindex="-1">${escapeStatusHtml(uiText('聽聽看，這像他嗎？'))}</h2>
                    ${npcAcquaintanceDialogueHtml(session.playerLine, session.npcLine, npc)}
                    ${npcAcquaintanceOptionListHtml('judgement', judgementItems, session.judgement)}
                    <div class="npc-flow-action-row">
                        ${npcAcquaintanceActionHtml('confirm-judgement', '確認')}
                    </div>
                </div>
            `;
        }

        function renderNpcAcquaintanceRefine() {
            const session = npcAcquaintanceSession;
            const items = NPC_ACQUAINTANCE_REFINEMENTS.map(value => ({
                value,
                label: uiText(value === '__custom__' ? '我想自己寫提醒' : value)
            }));
            const custom = session.refine === '__custom__';
            return `
                <div class="npc-flow-view" data-flow-view="refine">
                    <h2 class="npc-flow-title" tabindex="-1">${escapeStatusHtml(uiText('哪裡不像他？'))}</h2>
                    <p class="npc-flow-lead">
                        ${escapeStatusHtml(uiText('這句提醒只會用於下一次回覆；確認後才可以另選欄位寫入。'))}
                    </p>
                    ${npcAcquaintanceOptionListHtml('refine', items, session.refine)}
                    <label class="npc-flow-custom-field${custom ? '' : ' is-hidden'}">
                        <span>${escapeStatusHtml(uiText('補充提醒'))}</span>
                        <textarea rows="3" data-flow-input="custom-refine"
                            placeholder="${escapeStatusHtml(uiText('用你自己的話寫下哪裡不像他'))}">${escapeStatusHtml(session.customRefine)}</textarea>
                    </label>
                    <div class="npc-flow-action-row">
                        ${npcAcquaintanceReturnHtml('response', '回到他的回答')}
                        ${npcAcquaintanceActionHtml('retry-with-note', '帶著提醒再試一次', {
                            disabled: custom && !session.customRefine.trim()
                        })}
                    </div>
                </div>
            `;
        }

        function renderNpcAcquaintanceSaveNote() {
            const session = npcAcquaintanceSession;
            const fieldItems = NPC_ACQUAINTANCE_FIELDS.map(field => ({
                value: field.key,
                label: uiText(field.label)
            }));
            const modeItems = [
                { value: 'append', label: uiText('追加在原本內容後面') },
                { value: 'replace', label: uiText('用這句取代原本內容') }
            ];
            const current = session.saveTarget ? getNpcAcquaintanceFieldValue(session.saveTarget) : '';
            const result = getNpcAcquaintanceWriteResult();
            const canSave = Boolean(session.saveTarget && session.saveMode && session.refineNote);
            return `
                <div class="npc-flow-view" data-flow-view="save-note">
                    <h2 class="npc-flow-title" tabindex="-1">${escapeStatusHtml(uiText('要保留這句補充嗎？'))}</h2>
                    <p class="npc-flow-lead">
                        ${escapeStatusHtml(uiText('只有下方這句玩家補充可以寫入；問題與 AI 回答都不會自動保存。'))}
                    </p>
                    <blockquote class="npc-flow-note-preview" data-no-i18n>${escapeStatusHtml(session.refineNote)}</blockquote>
                    <h3 class="npc-flow-section-title">${escapeStatusHtml(uiText('選擇寫入欄位'))}</h3>
                    ${npcAcquaintanceOptionListHtml('saveTarget', fieldItems, session.saveTarget)}
                    <h3 class="npc-flow-section-title">${escapeStatusHtml(uiText('選擇寫入方式'))}</h3>
                    ${npcAcquaintanceOptionListHtml('saveMode', modeItems, session.saveMode)}
                    <div class="npc-flow-write-preview">
                        <div>
                            <span>${escapeStatusHtml(uiText('目前內容'))}</span>
                            <p data-no-i18n>${escapeStatusHtml(current || uiText('尚未填寫'))}</p>
                        </div>
                        <div>
                            <span>${escapeStatusHtml(uiText('確認後將變成'))}</span>
                            <p data-no-i18n>${escapeStatusHtml(result || uiText('請先選擇欄位與寫入方式'))}</p>
                        </div>
                    </div>
                    <div class="npc-flow-action-row">
                        ${npcAcquaintanceReturnHtml('skip-save', '這次不要寫入')}
                        ${npcAcquaintanceActionHtml('save-note', '寫入這個欄位', { disabled: !canSave })}
                    </div>
                </div>
            `;
        }

        function renderNpcAcquaintanceScenario() {
            const session = npcAcquaintanceSession;
            const items = editingScenarios.map((scenario, index) => ({
                value: index,
                label: valueToText(scenario.name, `${uiText('情境')} ${index + 1}`)
            }));
            const draft = session.scenarioIndex >= 0
                ? valueToText(session.scenarioDrafts[session.scenarioIndex], '')
                : '';
            return `
                <div class="npc-flow-view" data-flow-view="scenario">
                    <h2 class="npc-flow-title" tabindex="-1">${escapeStatusHtml(uiText('選一個情境，再跟他說一句'))}</h2>
                    <p class="npc-flow-lead">
                        ${escapeStatusHtml(uiText('只有你明確選中的情境會提供給 AI；切換情境時會保留各自草稿。'))}
                    </p>
                    ${npcAcquaintanceOptionListHtml('scenarioIndex', items, session.scenarioIndex)}
                    <label class="npc-flow-custom-field">
                        <span>${escapeStatusHtml(uiText('在這個情境中，我想說'))}</span>
                        <textarea rows="3" data-flow-input="scenario-line"
                            placeholder="${escapeStatusHtml(uiText('輸入想對他說的話'))}">${escapeStatusHtml(draft)}</textarea>
                    </label>
                    <div class="npc-flow-action-row">
                        ${npcAcquaintanceReturnHtml('response', '回到他的回答')}
                        ${npcAcquaintanceActionHtml('run-scenario', '對他說這句話', { disabled: !draft.trim() })}
                    </div>
                </div>
            `;
        }

        function renderNpcAcquaintanceScenarioResponse(npc) {
            const session = npcAcquaintanceSession;
            if (session.busy) {
                return `
                    <div class="npc-flow-view npc-flow-wait-view" data-flow-view="scenario-response">
                        <h2 class="npc-flow-title" tabindex="-1">${escapeStatusHtml(uiText('正在聽他回答...'))}</h2>
                        <div class="npc-flow-wait-mark" aria-hidden="true"><span></span><span></span><span></span></div>
                        <p class="npc-flow-lead">${escapeStatusHtml(uiText('人物資料不會在等待時被修改。'))}</p>
                        <div class="npc-flow-action-row">
                            ${npcAcquaintanceReturnHtml('cancel-request', '取消等待')}
                        </div>
                    </div>
                `;
            }
            if (session.error) {
                return `
                    <div class="npc-flow-view" data-flow-view="scenario-response">
                        <h2 class="npc-flow-title" tabindex="-1">${escapeStatusHtml(uiText('暫時沒有聽到回答'))}</h2>
                        <p class="npc-flow-error">${escapeStatusHtml(uiText(session.error))}</p>
                        <div class="npc-flow-action-row">
                            ${npcAcquaintanceReturnHtml('scenario', '回到上一頁')}
                            ${npcAcquaintanceActionHtml('run-scenario', '再試一次')}
                        </div>
                    </div>
                `;
            }
            const scenario = editingScenarios[session.scenarioIndex] || {};
            return `
                <div class="npc-flow-view" data-flow-view="scenario-response">
                    <p class="npc-flow-pixel-stamp" data-no-i18n>${escapeStatusHtml(scenario.name || uiText('情境'))}</p>
                    <h2 class="npc-flow-title" tabindex="-1">${escapeStatusHtml(uiText('情境中的他這樣回答'))}</h2>
                    ${npcAcquaintanceDialogueHtml(session.scenarioPlayerLine, session.scenarioNpcLine, npc)}
                    <div class="npc-flow-action-row">
                        ${npcAcquaintanceReturnHtml('scenario', '換一個情境')}
                        ${npcAcquaintanceActionHtml('question', '再和他說一句', { secondary: true })}
                    </div>
                </div>
            `;
        }

        function renderNpcAcquaintanceFlow() {
            const session = npcAcquaintanceSession;
            const flow = document.getElementById('npc-acquaintance-flow');
            const npc = editingNpcs[session?.npcIndex];
            if (!session || !flow || !npc) return;
            const progressByView = {
                intro: '01 / 03',
                question: '02 / 03',
                response: '02 / 03',
                refine: '02 / 03',
                'save-note': '02 / 03',
                scenario: '03 / 03',
                'scenario-response': '03 / 03'
            };
            const viewRenderers = {
                intro: () => renderNpcAcquaintanceIntro(npc),
                question: renderNpcAcquaintanceQuestion,
                response: () => renderNpcAcquaintanceResponse(npc),
                refine: renderNpcAcquaintanceRefine,
                'save-note': renderNpcAcquaintanceSaveNote,
                scenario: renderNpcAcquaintanceScenario,
                'scenario-response': () => renderNpcAcquaintanceScenarioResponse(npc)
            };
            const progress = progressByView[session.view] || '01 / 03';
            const npcName = uiCharacterName(npc.name, uiText('未命名'));
            const avatar = valueToText(npc.avatar, '');
            const avatarImage = avatar && avatar !== emptyAvatar
                ? `<img src="${escapeStatusHtml(avatar)}" alt="">`
                : '';
            const initial = Array.from(npcName)[0] || 'N';
            const introHeader = `
                <header class="npc-flow-header npc-flow-intro-header">
                    ${npcAcquaintanceReturnHtml('close', '回到角色設定')}
                    <span class="npc-flow-progress" data-no-i18n>${progress}</span>
                </header>
                <div class="npc-flow-intro-identity">
                    <span class="npc-flow-intro-avatar" data-initial="${escapeStatusHtml(initial)}">
                        ${avatarImage}
                    </span>
                    <strong class="npc-flow-intro-nameplate" data-no-i18n>${escapeStatusHtml(npcName)}</strong>
                </div>
            `;
            const compactHeader = `
                <header class="npc-flow-header">
                    ${npcAcquaintanceReturnHtml('close', '回到角色設定')}
                    <span class="npc-flow-progress" data-no-i18n>${progress}</span>
                </header>
            `;
            flow.innerHTML = `
                ${session.view === 'intro' ? introHeader : compactHeader}
                ${viewRenderers[session.view]?.() || renderNpcAcquaintanceIntro(npc)}
            `;
            syncNpcAcquaintanceConditionalControls();
            requestAnimationFrame(() => {
                flow.querySelector('.npc-flow-title')?.focus({ preventScroll: true });
            });
        }

        function setNpcAcquaintanceView(view) {
            if (!npcAcquaintanceSession) return;
            npcAcquaintanceSession.view = view;
            npcAcquaintanceSession.error = '';
            renderNpcAcquaintanceFlow();
            document.getElementById('desktop-config-editor')?.scrollTo({ top: 0, behavior: 'auto' });
        }

        function resetNpcAcquaintanceConversation() {
            const session = npcAcquaintanceSession;
            if (!session) return;
            session.question = '';
            session.customQuestion = '';
            session.playerLine = '';
            session.npcLine = '';
            session.judgement = '';
            session.refine = '';
            session.customRefine = '';
            session.refineNote = '';
            session.saveTarget = '';
            session.saveMode = '';
            session.savedNote = false;
            session.savedTarget = '';
        }

        function continueNpcAcquaintanceAfterReview() {
            const session = npcAcquaintanceSession;
            if (!session) return;
            if (editingScenarios.length) {
                session.scenarioIndex = -1;
                setNpcAcquaintanceView('scenario');
                return;
            }
            const npcIndex = session.npcIndex;
            closeNpcAcquaintanceFlow({ restoreEditor: false });
            openDesktopNpcPreview(npcIndex);
        }

        function getNpcAcquaintanceQuestionLine() {
            const session = npcAcquaintanceSession;
            if (!session) return '';
            if (session.question === '__custom__') return session.customQuestion.trim();
            return uiText(session.question);
        }

        function getNpcAcquaintanceRefineNote() {
            const session = npcAcquaintanceSession;
            if (!session) return '';
            if (session.refine === '__custom__') return session.customRefine.trim();
            return uiText(session.refine);
        }

        function syncNpcAcquaintanceConditionalControls() {
            const session = npcAcquaintanceSession;
            const flow = document.getElementById('npc-acquaintance-flow');
            if (!session || !flow) return;
            const questionField = flow.querySelector('[data-flow-input="custom-question"]')?.closest('label');
            questionField?.classList.toggle('is-hidden', session.question !== '__custom__');
            const sendButton = flow.querySelector('[data-flow-action="send-question"]');
            if (sendButton) sendButton.disabled = !getNpcAcquaintanceQuestionLine();

            const confirmButton = flow.querySelector('[data-flow-action="confirm-judgement"]');
            if (confirmButton) confirmButton.disabled = !session.judgement;

            const refineField = flow.querySelector('[data-flow-input="custom-refine"]')?.closest('label');
            refineField?.classList.toggle('is-hidden', session.refine !== '__custom__');
            const retryButton = flow.querySelector('[data-flow-action="retry-with-note"]');
            if (retryButton) retryButton.disabled = !getNpcAcquaintanceRefineNote();

            const scenarioInput = flow.querySelector('[data-flow-input="scenario-line"]');
            if (scenarioInput) {
                scenarioInput.disabled = session.scenarioIndex < 0;
                const draft = session.scenarioIndex >= 0
                    ? valueToText(session.scenarioDrafts[session.scenarioIndex], '')
                    : '';
                if (scenarioInput.value !== draft) scenarioInput.value = draft;
                const runButton = flow.querySelector('[data-flow-action="run-scenario"]');
                if (runButton) runButton.disabled = session.scenarioIndex < 0 || !draft.trim();
            }

            const previewParagraphs = flow.querySelectorAll('.npc-flow-write-preview p');
            if (previewParagraphs.length === 2) {
                const current = session.saveTarget ? getNpcAcquaintanceFieldValue(session.saveTarget) : '';
                previewParagraphs[0].textContent = current || uiText('尚未填寫');
                previewParagraphs[1].textContent = getNpcAcquaintanceWriteResult()
                    || uiText('請先選擇欄位與寫入方式');
            }
            const saveButton = flow.querySelector('[data-flow-action="save-note"]');
            if (saveButton) {
                saveButton.disabled = !(session.saveTarget && session.saveMode && session.refineNote);
            }
        }

        function selectNpcAcquaintanceOption(button) {
            const session = npcAcquaintanceSession;
            const list = button?.closest('.npc-flow-option-list');
            const group = list?.dataset.optionGroup;
            if (!session || !list || !group) return;
            const rawValue = button.dataset.optionValue || '';
            if (group === 'scenarioIndex') {
                session.scenarioIndex = Number(rawValue);
            } else {
                session[group] = rawValue;
            }
            list.querySelectorAll('.npc-flow-option').forEach(option => {
                option.setAttribute('aria-pressed', option === button ? 'true' : 'false');
            });
            syncNpcAcquaintanceConditionalControls();
        }

        function handleNpcAcquaintancePointerDown(event) {
            const button = event.target.closest('.npc-flow-option');
            if (!button || button.disabled) return;
            selectNpcAcquaintanceOption(button);
        }

        function handleNpcAcquaintanceClick(event) {
            const option = event.target.closest('.npc-flow-option');
            if (option) {
                if (event.detail === 0 && !option.disabled) {
                    selectNpcAcquaintanceOption(option);
                }
                return;
            }
            const actionButton = event.target.closest('[data-flow-action]');
            if (!actionButton || actionButton.disabled) return;
            handleNpcAcquaintanceAction(actionButton.dataset.flowAction);
        }

        function handleNpcAcquaintanceKeyDown(event) {
            const option = event.target.closest('.npc-flow-option');
            if (option && ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'].includes(event.key)) {
                const options = Array.from(option.closest('.npc-flow-option-list').querySelectorAll('.npc-flow-option'));
                const currentIndex = options.indexOf(option);
                let nextIndex = currentIndex;
                if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
                    nextIndex = (currentIndex + 1) % options.length;
                } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
                    nextIndex = (currentIndex - 1 + options.length) % options.length;
                } else if (event.key === 'Home') {
                    nextIndex = 0;
                } else if (event.key === 'End') {
                    nextIndex = options.length - 1;
                }
                event.preventDefault();
                options[nextIndex]?.focus();
                return;
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                handleNpcAcquaintanceEscape();
            }
        }

        function handleNpcAcquaintanceInput(event) {
            const session = npcAcquaintanceSession;
            const inputType = event.target.dataset.flowInput;
            if (!session || !inputType) return;
            if (inputType === 'custom-question') {
                session.customQuestion = event.target.value;
            } else if (inputType === 'custom-refine') {
                session.customRefine = event.target.value;
            } else if (inputType === 'scenario-line' && session.scenarioIndex >= 0) {
                session.scenarioDrafts[session.scenarioIndex] = event.target.value;
            }
            syncNpcAcquaintanceConditionalControls();
        }

        function handleNpcAcquaintanceEscape() {
            const session = npcAcquaintanceSession;
            if (!session) return;
            const previousViews = {
                question: 'intro',
                response: 'question',
                refine: 'response',
                'save-note': 'response',
                scenario: 'response',
                'scenario-response': 'scenario'
            };
            if (session.busy) {
                handleNpcAcquaintanceAction('cancel-request');
                return;
            }
            const previous = previousViews[session.view];
            if (previous) setNpcAcquaintanceView(previous);
            else closeNpcAcquaintanceFlow();
        }

        async function submitNpcAcquaintanceLine(options = {}) {
            const session = npcAcquaintanceSession;
            if (!session || session.busy) return;
            const isScenario = options.scenario === true;
            const line = isScenario
                ? valueToText(session.scenarioDrafts[session.scenarioIndex], '').trim()
                : valueToText(options.line || getNpcAcquaintanceQuestionLine(), '').trim();
            if (!line) return;
            if (isScenario && !editingScenarios[session.scenarioIndex]) return;

            const requestSerial = ++npcAcquaintanceRequestSerial;
            session.busy = true;
            session.error = '';
            if (isScenario) {
                session.scenarioPlayerLine = line;
                session.view = 'scenario-response';
            } else {
                session.playerLine = line;
                session.view = 'response';
            }
            renderNpcAcquaintanceFlow();

            try {
                const response = await requestNpcAcquaintanceResponse(session.npcIndex, line, {
                    adjustment: options.adjustment || '',
                    scenarioIndex: isScenario ? session.scenarioIndex : -1
                });
                if (requestSerial !== npcAcquaintanceRequestSerial || session !== npcAcquaintanceSession) return;
                if (isScenario) {
                    session.scenarioNpcLine = response;
                } else {
                    session.npcLine = response;
                    session.judgement = '';
                }
            } catch (error) {
                if (requestSerial !== npcAcquaintanceRequestSerial || session !== npcAcquaintanceSession) return;
                session.error = valueToText(error?.message, uiText('暫時無法取得回應，請稍後再試。'));
            } finally {
                if (requestSerial === npcAcquaintanceRequestSerial && session === npcAcquaintanceSession) {
                    session.busy = false;
                    renderNpcAcquaintanceFlow();
                }
            }
        }

        function writeNpcAcquaintanceNote() {
            const session = npcAcquaintanceSession;
            const npc = editingNpcs[session?.npcIndex];
            if (!session || !npc || !session.saveTarget || !session.saveMode || !session.refineNote) return;
            if (!NPC_ACQUAINTANCE_FIELDS.some(field => field.key === session.saveTarget)) return;
            if (!npc.details || typeof npc.details !== 'object') npc.details = {};
            const result = getNpcAcquaintanceWriteResult();
            npc.details[session.saveTarget] = result;
            const field = NPC_ACQUAINTANCE_FIELDS.find(item => item.key === session.saveTarget);
            const input = document.getElementById(`${field.inputPrefix}-${session.npcIndex}`);
            if (input) {
                input.value = result;
                if (input.tagName === 'TEXTAREA') autoResize(input);
            }
            session.savedNote = true;
            session.savedTarget = session.saveTarget;
            markEditScenarioDirty();
            renderDesktopPresetOverview();
            continueNpcAcquaintanceAfterReview();
        }

        function handleNpcAcquaintanceAction(action) {
            const session = npcAcquaintanceSession;
            if (!session) return;
            if (action === 'close') {
                closeNpcAcquaintanceFlow();
            } else if (action === 'intro') {
                setNpcAcquaintanceView('intro');
            } else if (action === 'question') {
                resetNpcAcquaintanceConversation();
                setNpcAcquaintanceView('question');
            } else if (action === 'send-question') {
                const retryOptions = session.refineNote && session.playerLine
                    ? { line: session.playerLine, adjustment: session.refineNote }
                    : {};
                submitNpcAcquaintanceLine(retryOptions);
            } else if (action === 'response') {
                setNpcAcquaintanceView('response');
            } else if (action === 'confirm-judgement') {
                if (session.judgement === 'refine') {
                    setNpcAcquaintanceView('refine');
                } else if (session.judgement === 'again') {
                    resetNpcAcquaintanceConversation();
                    setNpcAcquaintanceView('question');
                } else if (session.refineNote) {
                    setNpcAcquaintanceView('save-note');
                } else {
                    continueNpcAcquaintanceAfterReview();
                }
            } else if (action === 'retry-with-note') {
                session.refineNote = getNpcAcquaintanceRefineNote();
                submitNpcAcquaintanceLine({ line: session.playerLine, adjustment: session.refineNote });
            } else if (action === 'skip-save') {
                session.savedNote = false;
                session.savedTarget = '';
                continueNpcAcquaintanceAfterReview();
            } else if (action === 'save-note') {
                writeNpcAcquaintanceNote();
            } else if (action === 'run-scenario') {
                submitNpcAcquaintanceLine({ scenario: true });
            } else if (action === 'cancel-request') {
                npcAcquaintanceRequestSerial += 1;
                if (typeof cancelActiveAIRequest === 'function') cancelActiveAIRequest();
                session.busy = false;
                setNpcAcquaintanceView(session.view === 'scenario-response' ? 'scenario' : 'question');
            }
        }

        window.addEventListener('ui-language-change', () => {
            if (npcAcquaintanceSession) renderNpcAcquaintanceFlow();
            const screen = document.getElementById('edit-scenario-screen');
            if (screen?.classList.contains('player-preview-open')) renderDesktopPlayerPreview();
            if (document.getElementById('desktop-player-editor-return')) ensureDesktopPlayerEditorReturn();
            syncStaticBracketLabels();
        });
        window.addEventListener('load', syncStaticBracketLabels);
        syncStaticBracketLabels();
        ensureHoldDeleteDelegation();

        let forceOpenScenIndex = -1;
        function renderScenarioList() {
            const container = document.getElementById('scenario-list-container');
            container.innerHTML = '';
            editingScenarios.forEach((scen, index) => {
                const details = document.createElement('details');
                details.className = 'foldable-card';
                if (index === forceOpenScenIndex) details.open = true;

                details.innerHTML = `
                    <summary><span class="reorder-handle" data-no-i18n title="${escapeStatusHtml(uiText('拖曳排序'))}">☰</span>情境: <span id="scen-title-${index}" data-no-i18n>${escapeStatusHtml(scen.name || '未命名')}</span></summary>
                    <div class="foldable-content">
                        <button type="button" class="delete-scen-btn hold-delete" data-hold-kind="scenario" data-hold-index="${index}"><span class="hold-delete-base">${escapeStatusHtml(uiText('刪除'))}</span><span class="hold-delete-wash">${escapeStatusHtml(uiText('刪除'))}</span></button>
                        <div class="scenario-label">情境名稱</div>
                        <input type="text" class="scenario-input" id="scen-name-${index}" value="${escapeStatusHtml(scen.name)}" oninput="document.getElementById('scen-title-${index}').innerText = this.value || '未命名'; renderDesktopPresetOverview();">
                        <div class="scenario-label">該情境下的物理法則與世界觀</div>
                        <textarea class="scenario-input" id="scen-lore-${index}" oninput="autoResize(this); renderDesktopPresetOverview();">${escapeStatusHtml(scen.lore)}</textarea>
                        <div class="scenario-label">NPC 們在此情境下的總體身分/狀態</div>
                        <textarea class="scenario-input" id="scen-npcRoles-${index}" oninput="autoResize(this)">${escapeStatusHtml(scen.npcRoles || '')}</textarea>
                        <div class="scenario-label">玩家在此的專屬身份/狀態</div>
                        <textarea class="scenario-input" id="scen-player-${index}" oninput="autoResize(this)">${escapeStatusHtml(scen.playerRole)}</textarea>
                        <div class="scenario-label">本場目標（選填，DM 會朝此推進）</div>
<textarea class="scenario-input" id="scen-objective-${index}" placeholder="${escapeStatusHtml(uiText('例如：讓玩家在天黑前找到出口。'))}" oninput="autoResize(this)">${escapeStatusHtml(scen.objective || '')}</textarea>
                        <div class="scenario-label">轉場規則（選填）</div>
<textarea class="scenario-input" id="scen-transition-${index}" placeholder="${escapeStatusHtml(uiText('例如：切回此情境時視為夢醒。'))}" oninput="autoResize(this)">${escapeStatusHtml(scen.transitionRule || '')}</textarea>
                    </div>
                `;
                container.appendChild(details);
                if (typeof enableReorderDrag === 'function') {
                    enableReorderDrag(details.querySelector('.reorder-handle'), details, container, 'details.foldable-card', (fromIndex, toIndex) => {
                        syncEditingDataFromDOM();
                        const moved = editingScenarios.splice(fromIndex, 1)[0];
                        editingScenarios.splice(toIndex, 0, moved);
                        renderScenarioList();
                    });
                }
            });
            initTextareas();
            forceOpenScenIndex = -1;
            renderDesktopPresetOverview();
        }

        let coreRulesSaveTimer = null;
function updateCoreRulesDrawerDirection(widget) {
if (!widget) return;
widget.classList.remove('open-inside', 'open-outside');
const rect = widget.getBoundingClientRect();
const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
const outsideRoom = rect.left;
const insideRoom = viewportWidth - rect.left;
const outsideFitWidth = Math.min(320, Math.max(0, outsideRoom - 48));
const insideFitWidth = Math.min(320, Math.max(240, insideRoom - 24));
const shouldOpenOutside = window.matchMedia('(min-width: 700px)').matches
&& outsideFitWidth >= 240;
widget.style.setProperty('--core-rules-drawer-width', `${shouldOpenOutside ? outsideFitWidth : insideFitWidth}px`);
widget.classList.add(shouldOpenOutside ? 'open-outside' : 'open-inside');
}
        function toggleCoreRulesDrawer(btn, force) {
            const widget = btn && btn.closest ? btn.closest('.core-rules-widget') : document.querySelector('.core-rules-widget');
            if (!widget) return;
            const willOpen = typeof force === 'boolean' ? force : !widget.classList.contains('open');
if (willOpen) {
updateCoreRulesDrawerDirection(widget);
} else {
setTimeout(() => {
if (!widget.classList.contains('open')) {
widget.classList.remove('open-inside', 'open-outside');
widget.style.removeProperty('--core-rules-drawer-width');
}
}, 180);
}
widget.classList.toggle('open', willOpen);
            const tab = widget.querySelector('.core-rules-tab');
            if (tab) tab.setAttribute('aria-expanded', String(willOpen));
            if (willOpen) {
                const editor = widget.querySelector('.core-rules-editor');
                if (editor) {
                    const inGame = Boolean(widget.closest('#game-container'));
                    editor.value = inGame
                        ? ((typeof currentScenario === 'object' && currentScenario && currentScenario.coreRules) || '')
                        : (document.getElementById('input-core-rules')?.value || '');
                    setTimeout(() => editor.focus(), 50);
                }
                if (typeof renderProficiencyTags === 'function') renderProficiencyTags();
            }
        }

        function onCoreRulesInput(el) {
            const widget = el.closest('.core-rules-widget');
            const inGame = Boolean(widget && widget.closest('#game-container'));
            if (inGame) {
                if (typeof currentScenario === 'object' && currentScenario) currentScenario.coreRules = el.value;
                clearTimeout(coreRulesSaveTimer);
                coreRulesSaveTimer = setTimeout(() => { if (typeof saveCurrentProgress === 'function') saveCurrentProgress(); }, 600);
            } else {
                const hidden = document.getElementById('input-core-rules');
                if (hidden) hidden.value = el.value;
            }
        }

        function readEditingProficiencyList() {
            try {
                const v = JSON.parse(document.getElementById('input-proficiencies')?.value || '[]');
                return Array.isArray(v) ? v.map(x => valueToText(x).trim()).filter(Boolean) : [];
            } catch (e) { return []; }
        }

        function getProficiencyListForContext(inGame) {
            if (inGame) {
                return (currentScenario && Array.isArray(currentScenario.playerProficiencies))
                    ? currentScenario.playerProficiencies.map(x => valueToText(x).trim()).filter(Boolean) : [];
            }
            return readEditingProficiencyList();
        }

        function renderProficiencyTags() {
            document.querySelectorAll('[data-proficiency-tags]').forEach(container => {
                const inGame = Boolean(container.closest('#game-container'));
                const list = getProficiencyListForContext(inGame);
                container.innerHTML = '';
                if (!list.length) {
                    const empty = document.createElement('span');
                    empty.className = 'proficiency-empty';
                    empty.textContent = (typeof uiText === 'function') ? uiText('尚未生成擅長領域。') : '尚未生成擅長領域。';
                    container.appendChild(empty);
                    return;
                }
                list.forEach((prof, index) => {
                    const tag = document.createElement('span');
                    tag.className = 'proficiency-tag';
                    tag.appendChild(document.createTextNode(valueToText(prof) + ' '));
                    const rm = document.createElement('span');
                    rm.className = 'proficiency-tag-remove';
                    rm.textContent = '✖';
                    rm.setAttribute('role', 'button');
                    rm.setAttribute('tabindex', '0');
                    rm.onclick = () => removeProficiency(index, inGame);
                    rm.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') removeProficiency(index, inGame); };
                    tag.appendChild(rm);
                    container.appendChild(tag);
                });
            });
        }

        function persistProficiencyList(clean, inGame) {
            if (inGame) {
                if (currentScenario && typeof currentScenario === 'object') currentScenario.playerProficiencies = clean;
                if (typeof saveCurrentProgress === 'function') saveCurrentProgress();
            } else {
                const input = document.getElementById('input-proficiencies');
                if (input) input.value = JSON.stringify(clean);
                if (typeof commitCurrentPresetSilently === 'function') commitCurrentPresetSilently();
            }
            renderProficiencyTags();
        }

        function setEditingProficiencies(list, inGame) {
            const clean = (Array.isArray(list) ? list : []).map(v => valueToText(v).trim()).filter(Boolean).slice(0, 4);
            persistProficiencyList(clean, inGame);
        }

        function removeProficiency(index, inGame) {
            const list = getProficiencyListForContext(inGame).slice();
            if (index < 0 || index >= list.length) return;
            /* 遊戲中刪除要確認(2026/07/10):用成長點買的擅長刪除不退點,防手滑蒸發;
               配置編輯頁(創角階段)不擋,照舊直接刪。 */
            if (inGame) {
                const msg = (typeof uiText === 'function') ? uiText('確定刪除這個擅長領域？（用成長點新增的不會退還點數）') : '確定刪除這個擅長領域？（用成長點新增的不會退還點數）';
                if (!window.confirm(msg)) return;
            }
            list.splice(index, 1);
            persistProficiencyList(list, inGame);
        }

        async function generatePlayerProficiencies(btn) {
            const inGame = Boolean(btn && btn.closest && btn.closest('#game-container'));
            if (!inGame && scenarioPresets[activePresetId] && scenarioPresets[activePresetId].isLocked) {
                alert((typeof uiText === 'function') ? uiText('目前這個配置已上鎖，無法修改。') : '目前這個配置已上鎖，無法修改。');
                return;
            }
            let name = '', bg = '', likes = '';
            if (inGame) {
                const det = (currentScenario && currentScenario.playerDetails) || {};
                name = valueToText(currentScenario && currentScenario.playerName);
                bg = valueToText(det.bg).trim();
                likes = valueToText(det.likes).trim();
            } else {
                name = document.getElementById('input-player-name')?.value.trim() || '';
                bg = document.getElementById('p-bg')?.value.trim() || '';
                likes = document.getElementById('p-likes')?.value.trim() || '';
            }
            if (!bg) {
                alert((typeof uiText === 'function') ? uiText('請先在「核心性格／背景故事」填寫角色設定，再生成擅長。') : '請先填寫角色的性格／背景，再生成擅長。');
                return;
            }
            const buttons = Array.from(document.querySelectorAll('.proficiency-gen-btn'));
            const restoreLabel = (typeof uiText === 'function') ? uiText('角色專屬的魔法') : '角色專屬的魔法';
            buttons.forEach(b => { b.disabled = true; });
            if (btn) btn.textContent = (typeof uiText === 'function') ? uiText('生成中…') : '生成中…';
            try {
                const prompt = `你是 TRPG 角色專長分析器。只根據下面角色「已明確寫出」的性格與背景，列出這名角色真正擅長的 2～4 個具體領域，作為檢定加值依據。\n\n角色名稱：${name || '（未命名）'}\n性格 / 背景：${bg}\n喜好：${likes || '（未填）'}\n\n規則：\n- 只列設定裡明確、具體、符合常理的專長；設定沒有依據的不要編。\n- 拒絕籠統或萬能描述（例如「什麼都會」「天才」「無所不能」），那類請忽略不列。\n- 每項用 4～12 字的具體技能領域（例：安撫他人、潛行跟蹤、機械維修）。\n- 最多 4 項；設定不足時可少於 4 項甚至空陣列。\n\n只輸出 JSON：{"proficiencies":["...","..."]}`;
                const rawText = await requestAIText(prompt, { kind: 'dice', maxTokens: 220 });
                let parsed;
                try { parsed = JSON.parse(extractJsonText(rawText)); } catch (e) { parsed = null; }
                const list = parsed && Array.isArray(parsed.proficiencies) ? parsed.proficiencies : null;
                if (!list) {
                    alert((typeof uiText === 'function') ? uiText('AI 無法生成擅長領域，請稍後再試。') : 'AI 無法生成擅長領域，請稍後再試。');
                    return;
                }
                setEditingProficiencies(list.map(v => valueToText(v).trim().slice(0, 16)), inGame);
            } catch (err) {
                alert((typeof uiText === 'function') ? uiText('AI 無法生成擅長領域，請稍後再試。') : 'AI 無法生成擅長領域，請稍後再試。');
            } finally {
                buttons.forEach(b => { b.disabled = false; });
                if (btn) btn.textContent = restoreLabel;
            }
        }

        function syncEditingDataFromDOM() {
            editingNpcs.forEach((npc, index) => {
                const n = document.getElementById(`npc-name-${index}`);
                if(n) {
                    npc.name = n.value;
                    npc.affection = parseInt(document.getElementById(`npc-aff-${index}`).value) || 0;
                    npc.details = {
                        age: document.getElementById(`npc-age-${index}`).value.trim(),
                        speech: document.getElementById(`npc-speech-${index}`).value.trim(),
                        likes: document.getElementById(`npc-likes-${index}`).value.trim(),
                        dislikes: document.getElementById(`npc-dislikes-${index}`).value.trim(),
                        app: document.getElementById(`npc-app-${index}`).value.trim(),
                        bg: document.getElementById(`npc-bg-${index}`).value.trim()
                    };
                    npc.avatar = document.getElementById(`preview-npc-${index}`).src;
                }
            });
editingScenarios.forEach((scen, index) => {
const n = document.getElementById(`scen-name-${index}`);
if(n) {
scen.name = n.value;
scen.lore = document.getElementById(`scen-lore-${index}`).value;
                    scen.npcRoles = document.getElementById(`scen-npcRoles-${index}`).value;
                    scen.playerRole = document.getElementById(`scen-player-${index}`).value;
                    scen.objective = document.getElementById(`scen-objective-${index}`).value;
                    scen.transitionRule = document.getElementById(`scen-transition-${index}`).value;
}
});
}
