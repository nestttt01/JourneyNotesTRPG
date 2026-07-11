// === [app.js 拆分] app-status-journal.js：原 app.js 第 4153–4981 行｜狀態面板/Flags/道具/冒險日誌頁｜需依 index.html 既有順序與其他 app-*.js 一同載入，勿單獨重排。 ===
const statusModalDragState = { x: 0, y: 0 };
const gamePanelDragState = { x: 0, y: 0 };
/* 拖動邊界:以「視口」為準,面板可以拖到畫面任何位置,
   但左右至少留 120px 在畫面內、標題不可拖出畫面頂端(否則抓不回來)。 */
function computePanelDragBounds(content, state) {
    const rect = content.getBoundingClientRect();
    const baseLeft = rect.left - state.x;
    const baseTop = rect.top - state.y;
    const keep = 120;
    return {
        xMin: keep - rect.width - baseLeft,
        xMax: window.innerWidth - keep - baseLeft,
        yMin: -baseTop,
        yMax: Math.max(-baseTop, window.innerHeight - 80 - baseTop)
    };
}
/* 通用面板拖動:status 面板與遊戲對話介面共用。
   cfg = { content, state, applyTransform(animate), markActive(on), clearSnap(), dragThreshold } */
function beginFreePanelDrag(startEvent, cfg) {
    const content = cfg.content;
    if (!content) return;
    if (window.innerWidth <= 600) return;          /* 手機不啟用拖動 */
    if (startEvent.button !== undefined && startEvent.button !== 0) return;
    startEvent.preventDefault();
    const state = cfg.state;
    const bounds = computePanelDragBounds(content, state);
    const startX = startEvent.clientX;
    const startY = startEvent.clientY;
    const baseX = startX - state.x;
    const baseY = startY - state.y;
    const threshold = cfg.dragThreshold || 0;
    let started = threshold <= 0;
    if (started && cfg.markActive) cfg.markActive(true);
    const onMove = moveEvent => {
        if (moveEvent.pointerId !== startEvent.pointerId) return;
        if (!started) {
            if (Math.abs(moveEvent.clientX - startX) + Math.abs(moveEvent.clientY - startY) < threshold) return;
            started = true;
            if (cfg.markActive) cfg.markActive(true);
        }
        state.x = Math.max(bounds.xMin, Math.min(bounds.xMax, moveEvent.clientX - baseX));
        state.y = Math.max(bounds.yMin, Math.min(bounds.yMax, moveEvent.clientY - baseY));
        cfg.applyTransform(false);
    };
    const onUp = upEvent => {
        if (upEvent && upEvent.pointerId !== undefined && upEvent.pointerId !== startEvent.pointerId) return;
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        document.removeEventListener('pointercancel', onUp);
        if (cfg.markActive) cfg.markActive(false);
        if (!started) return;
        /* 拖曳結束吃掉一次 click,避免誤觸 */
        const swallow = clickEvent => { clickEvent.stopPropagation(); clickEvent.preventDefault(); };
        document.addEventListener('click', swallow, { capture: true, once: true });
        setTimeout(() => document.removeEventListener('click', swallow, { capture: true }), 0);
        /* 拖回原位附近(90px 內)自動吸回 */
        if (Math.hypot(state.x, state.y) < 90) {
            state.x = 0;
            state.y = 0;
            cfg.applyTransform(true);
            setTimeout(() => { if (cfg.clearSnap) cfg.clearSnap(); }, 220);
        }
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
}
/* 「角色面板」標籤跟隨:標籤是遊戲容器的子元素,拖對話框它會被動跟著跑。
   要讓它永遠黏住狀態面板,補償量 = 狀態面板位移 − 對話框位移。
   面板開著時任何一邊被拖都會呼叫這裡,兩邊都歸位時清乾淨。 */
function syncStatusTabFollow(animate) {
    const tab = document.getElementById('floating-menu-btn');
    if (!tab) return;
    if (!document.body.classList.contains('status-panel-open')) {
        tab.style.transform = '';
        tab.style.zIndex = '';
        return;
    }
    const tx = statusModalDragState.x - gamePanelDragState.x;
    const ty = statusModalDragState.y - gamePanelDragState.y;
    tab.classList.toggle('status-drag-snap', Boolean(animate));
    if (tx || ty) {
        tab.style.transform = 'translateY(-50%) translate(' + tx + 'px, ' + ty + 'px)';
        tab.style.zIndex = '10001';
    } else {
        tab.style.transform = '';
        tab.style.zIndex = '';
    }
}
function applyStatusModalDragTransform(animate) {
    const content = document.getElementById('status-modal-content');
    if (!content) return;
    const x = statusModalDragState.x;
    const y = statusModalDragState.y;
    content.classList.toggle('status-drag-snap', Boolean(animate));
    content.style.transform = (x || y) ? 'translate(' + x + 'px, ' + y + 'px)' : '';
    syncStatusTabFollow(animate);
}
function resetStatusModalDrag() {
    statusModalDragState.x = 0;
    statusModalDragState.y = 0;
    const content = document.getElementById('status-modal-content');
    const tab = document.getElementById('floating-menu-btn');
    if (content) { content.classList.remove('status-drag-snap', 'status-drag-active'); content.style.transform = ''; }
    if (tab) { tab.classList.remove('status-drag-snap', 'status-drag-active'); tab.style.transform = ''; tab.style.zIndex = ''; }
    syncStatusTabFollow(false);
}
function statusModalDragCfg(dragThreshold) {
    const content = document.getElementById('status-modal-content');
    const tab = document.getElementById('floating-menu-btn');
    return {
        content,
        state: statusModalDragState,
        dragThreshold,
        applyTransform: applyStatusModalDragTransform,
        markActive: on => {
            if (content) content.classList.toggle('status-drag-active', on);
            if (tab) tab.classList.toggle('status-drag-active', on);
        },
        clearSnap: () => {
            if (content) content.classList.remove('status-drag-snap');
            const tabNow = document.getElementById('floating-menu-btn');
            if (tabNow) tabNow.classList.remove('status-drag-snap');
        }
    };
}
function beginStatusModalDrag(startEvent, dragThreshold) {
    beginFreePanelDrag(startEvent, statusModalDragCfg(dragThreshold));
}
function ensureStatusModalDrag() {
    const content = document.getElementById('status-modal-content');
    const header = content ? content.querySelector('.modal-header-sticky') : null;
    if (header && !header.dataset.dragWired) {
        header.dataset.dragWired = '1';
        header.addEventListener('pointerdown', startEvent => {
            if (startEvent.target.closest('button, input, select, textarea, a')) return;
            beginStatusModalDrag(startEvent, 0);
        });
    }
    const tab = document.getElementById('floating-menu-btn');
    if (tab && !tab.dataset.dragWired) {
        tab.dataset.dragWired = '1';
        tab.addEventListener('pointerdown', startEvent => {
            if (!document.body.classList.contains('status-panel-open')) return;   /* 面板關閉時純粹是開關鈕 */
            beginStatusModalDrag(startEvent, 6);
        });
    }
}
/* 遊戲對話介面拖動:抓頂部狀態列(離開/HP/SAN 那條)空白處拖動整個對話面板。
   事件委派掛 document,不必等載入流程;手機與互動元件排除。 */
function applyGamePanelDragTransform(animate) {
    const container = document.getElementById('game-container');
    if (!container) return;
    const x = gamePanelDragState.x;
    const y = gamePanelDragState.y;
    container.classList.toggle('status-drag-snap', Boolean(animate));
    /* 重要:用 left/top 而非 transform。#survival-effects-layer(低 SAN 全螢幕暈影)
       是對話框的 fixed 子元素;祖先一有 transform,fixed 會改以祖先為基準,
       暈影就會脫離螢幕、卡在對話框後面。left/top 沒有這個副作用(容器本身是 position:relative)。 */
    if (x || y) {
        container.style.left = x + 'px';
        container.style.top = y + 'px';
    } else {
        container.style.left = '';
        container.style.top = '';
    }
    syncStatusTabFollow(animate);
}
document.addEventListener('pointerdown', event => {
    const container = document.getElementById('game-container');
    if (!container) return;
    const target = event.target;
    /* 可拖區:頂部狀態列全區 + 容器本身的留白(對話框外框、輸入列/選項列的空隙) */
    const inBar = target.closest && target.closest('#status-bar');
    const onShell = target === container || target.id === 'input-area' || target.id === 'options-area';
    if (!inBar && !onShell) return;
    if (target.closest('button, input, select, textarea, a')) return;
    const tab = document.getElementById('floating-menu-btn');
    beginFreePanelDrag(event, {
        content: container,
        state: gamePanelDragState,
        dragThreshold: 0,
        applyTransform: applyGamePanelDragTransform,
        markActive: on => {
            container.classList.toggle('status-drag-active', on);
            if (tab) tab.classList.toggle('status-drag-active', on);   /* 關掉標籤 0.2s 過渡,避免慢半拍脫隊 */
        },
        clearSnap: () => {
            container.classList.remove('status-drag-snap');
            if (tab) tab.classList.remove('status-drag-snap');
        }
    });
});
function openStatusModal() {
            if(!currentSaveId) return;
            ensureStatusModalDrag();
            currentStorySummary = formatBulletListText(currentStorySummary, '', true);
            currentOpenTasks = serializeTaskChecklist(currentOpenTasks);
            currentRelationshipSummary = formatBulletListText(currentRelationshipSummary, '', true);
            currentAdventureLog = formatBulletListText(currentAdventureLog, "• 故事剛開始，目前尚無重大事件發生。");
            document.getElementById('ui-story-summary').value = currentStorySummary;
            renderTaskChecklist(currentOpenTasks);
            document.getElementById('ui-relationship-summary').value = currentRelationshipSummary;
            setLanguageModeControls(currentScenario.languageMode || 'zh-tw');
            const rlSel = document.getElementById('reply-length-select'); if (rlSel && typeof getReplyLengthPref === 'function') rlSel.value = getReplyLengthPref();
            const sfSel = document.getElementById('survival-fx-select'); if (sfSel && typeof getSurvivalFxPref === 'function') sfSel.value = getSurvivalFxPref();
            if (typeof refreshMatureToggle === 'function') refreshMatureToggle();
            
            const pStats = currentScenario.playerStats || {str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10};
            let pDet = currentScenario.playerDetails || { age: '', speech: '', likes: '', dislikes: '', app: '', bg: currentScenario.playerPersona || '' };

                        let rCount = Math.max(0, Number.parseInt(savesData[currentSaveId].respecCount, 10));
            if (!Number.isFinite(rCount)) rCount = 3;
            // 改為單純的骷髏頭按鈕，長按或游標懸停會顯示剩餘次數
            let respecBtnHtml = rCount > 0 
                ? `<button onclick="modalRespecStats()" title="找守墓人洗點 (剩餘 ${rCount} 次)" class="u-inline-065">💀</button>` 
                : `<span title="洗點次數已用盡" class="u-inline-066">💀</span>`;

                        // Player Section 完美還原圖3排版
            let statsHtml = `
            <div class="u-inline-067">
                <div class="u-inline-068">
                    <span class="u-inline-069">玩家：${escapeStatusHtml(currentScenario.playerName)}</span>
                    <span class="u-inline-070">${respecBtnHtml}</span>
                </div>

                <div class="u-inline-071">
                    <span>[力量STR: ${pStats.str}]</span>
                    <span>[敏捷DEX: ${pStats.dex}]</span>
                    <span>[體質CON: ${pStats.con}]</span>
                    <span>[智力INT: ${pStats.int}]</span>
                    <span>[感知WIS: ${pStats.wis}]</span>
                    <span>[魅力CHA: ${pStats.cha}]</span>
                </div>
            </div>
            
            <details class="dark-card u-inline-072">
                <summary>
                    <div class="summary-left">
                        <span class="summary-name">編輯玩家細節設定</span>
                    </div>
                </summary>
                <div class="dark-card-content anime-sheet u-inline-073">
                    <div><label>年齡 / 身高 / 體型</label><input type="text" id="edit-p-age" value="${escapeStatusHtml(pDet.age)}"></div>
                    <div><label>說話習慣 / 語氣</label><input type="text" id="edit-p-speech" value="${escapeStatusHtml(pDet.speech)}"></div>
                    <div><label>喜歡的事物</label><input type="text" id="edit-p-likes" value="${escapeStatusHtml(pDet.likes)}"></div>
                    <div><label>討厭的事物</label><input type="text" id="edit-p-dislikes" value="${escapeStatusHtml(pDet.dislikes)}"></div>
                    <div class="full"><label>外貌特徵 / 常見穿搭</label><textarea id="edit-p-app" rows="1" oninput="autoResize(this)">${escapeStatusHtml(pDet.app)}</textarea></div>
                    <div class="full"><label>核心性格 / 背景故事</label><textarea id="edit-p-bg" rows="1" oninput="autoResize(this)">${escapeStatusHtml(pDet.bg)}</textarea></div>
                </div>
            </details>\n`;
            
            // NPC Section
            statsHtml += `
            <div class="section-header-flex">
                <h4>${escapeStatusHtml(uiText('登場 NPC 管理'))}</h4>
                <button class="section-add-btn" onclick="modalAddNpc()">${escapeStatusHtml(uiText('+ 新增 NPC'))}</button>
            </div>`;

            currentScenario.npcs.forEach((n, idx) => {
                const affectionValue = Number(n.affection);
                const aff = Number.isFinite(affectionValue) ? affectionValue : 0;
                let nDet = n.details || { age: '', speech: '', likes: '', dislikes: '', app: '', bg: n.persona || '' };
                n.dynamic = normalizeDynamicState(n.dynamic);
                const nDynamic = n.dynamic;
                const npcDead = nDynamic.isDead === true;
                const nDynamicPreview = npcDead ? '' : getDynamicStatePreview(nDynamic);
                
                statsHtml += `
                <details class="dark-card">
                    <summary>
                        <div class="summary-left">
                            <span class="summary-name"><span class="npc-summary-user-name" data-no-i18n>${escapeStatusHtml(n.name)}</span>${npcDead ? `<span class="npc-dead-badge">${getNpcDeathBadgeText(n)}</span>` : ''}</span>
                            <span class="summary-tag">♥好感: ${aff}</span>
                            ${nDynamicPreview ? `<span class="dynamic-state-preview" title="${escapeStatusHtml(nDynamicPreview)}">${escapeStatusHtml(nDynamicPreview)}</span>` : ''}
                        </div>
                    </summary>
                    <div class="dark-card-content">
                        <div class="u-inline-074">
                            <button class="delete-btn-red" onclick="modalDeleteNpc(${idx}); event.stopPropagation();">刪除</button>
                        </div>
                        <div class="anime-sheet u-inline-075">
                            <div class="full"><label>角色名稱</label><input type="text" id="edit-n-name-${idx}" value="${escapeStatusHtml(n.name)}" oninput="this.closest('details').querySelector('.npc-summary-user-name').innerText = this.value || '未命名';"></div>
                            <div><label>目前好感度${npcDead ? '（死亡後停止）' : ''}</label><input type="number" id="edit-n-aff-${idx}" min="-100" max="100" value="${clampAffectionValue(n.affection, 0)}" ${npcDead ? 'disabled' : ''}></div>
                            <div><label>年齡 / 身高 / 體型</label><input type="text" id="edit-n-age-${idx}" value="${escapeStatusHtml(nDet.age)}"></div>
                            <div><label>說話習慣 / 語氣</label><input type="text" id="edit-n-speech-${idx}" value="${escapeStatusHtml(nDet.speech)}"></div>
                            <div><label>喜歡的事物</label><input type="text" id="edit-n-likes-${idx}" value="${escapeStatusHtml(nDet.likes)}"></div>
                            <div><label>討厭的事物</label><input type="text" id="edit-n-dislikes-${idx}" value="${escapeStatusHtml(nDet.dislikes)}"></div>
                            <div class="full"><label>外貌特徵 / 常見穿搭</label><textarea id="edit-n-app-${idx}" rows="1" oninput="autoResize(this)">${escapeStatusHtml(nDet.app)}</textarea></div>
                            <div class="full"><label>核心性格 / 背景故事</label><textarea id="edit-n-bg-${idx}" rows="1" oninput="autoResize(this)">${escapeStatusHtml(nDet.bg)}</textarea></div>
                            ${renderDynamicStateEditor(`edit-n-state-${idx}`, nDynamic, { allowDeath: true })}
                        </div>
                    </div>
                </details>\n`;
            });

            // Scenario Section
            statsHtml += `
            <div class="section-header-flex">
                <h4>情境空間管理</h4>
                <button class="section-add-btn" onclick="modalAddScenario()">+ 新增情境</button>
            </div>`;

            currentScenario.scenarios.forEach((sc, idx) => {
                const isCurrent = idx === currentScenarioIndex ? `<span class="summary-tag">當前</span>` : '';
                statsHtml += `
                <details class="dark-card">
                    <summary>
                        <div class="summary-left">
                            <span class="summary-name">情境：${escapeStatusHtml(sc.name || '未命名')}</span>
                            ${isCurrent}
                        </div>
                    </summary>
                    <div class="dark-card-content">
                        <div class="u-inline-074">
                            <button class="delete-btn-red" onclick="modalDeleteScenario(${idx}); event.stopPropagation();">刪除</button>
                        </div>
                        <div class="scenario-label">情境名稱</div>
                        <input type="text" id="edit-scen-name-${idx}" class="scenario-input" value="${escapeStatusHtml(sc.name)}" oninput="this.closest('details').querySelector('.summary-name').innerText = '情境：' + (this.value || '未命名');">
                        <div class="scenario-label">環境法則與世界觀</div>
                        <textarea id="edit-scen-lore-${idx}" class="scenario-input" oninput="autoResize(this)">${escapeStatusHtml(sc.lore)}</textarea>
                        <div class="scenario-label">NPC 們在此的身分/狀態</div>
                        <textarea id="edit-scen-npcs-${idx}" class="scenario-input" oninput="autoResize(this)">${escapeStatusHtml(sc.npcRoles || '')}</textarea>
                        <div class="scenario-label">玩家在此的身分/狀態</div>
                        <textarea id="edit-scen-player-${idx}" class="scenario-input" oninput="autoResize(this)">${escapeStatusHtml(sc.playerRole || '')}</textarea>
                        <div class="scenario-label">本場目標（選填，DM 會朝此推進）</div>
<textarea id="edit-scen-objective-${idx}" class="scenario-input" placeholder="${escapeStatusHtml(uiText('例如：讓玩家在天黑前找到出口。'))}" oninput="autoResize(this)">${escapeStatusHtml(sc.objective || '')}</textarea>
                        <div class="scenario-label">轉場規則（選填）</div>
<textarea id="edit-scen-transition-${idx}" class="scenario-input" placeholder="${escapeStatusHtml(uiText('例如：切回此情境時視為夢醒。'))}" oninput="autoResize(this)">${escapeStatusHtml(sc.transitionRule || '')}</textarea>
                    </div>
                </details>`;
            });

            document.getElementById('ui-stats-display').innerHTML = statsHtml;
            
            renderStatusSummary(); renderFlags(); renderItems(); renderGrowth(); renderApiUsageStats();
            setStatusPanelOpen(true);
            updateStatusSaveButtonLabel();
            switchStatusTab(activeStatusTab);
            initTextareas();
        }

        function setStatusPanelOpen(isOpen) {
            const statusModal = document.getElementById('status-modal');
            if (!statusModal) return;
            statusModal.style.display = isOpen ? 'block' : 'none';
            document.body.classList.toggle('status-panel-open', Boolean(isOpen));
            if (typeof resetStatusModalDrag === 'function') resetStatusModalDrag();
            if (isOpen) statusModal.scrollTop = 0;
        }

        function shouldKeepStatusPanelOpenAfterSave() {
            return window.matchMedia('(min-width: 1100px)').matches
                && document.getElementById('game-container')?.style.display === 'flex';
        }

        function updateStatusSaveButtonLabel() {
            const button = document.getElementById('status-save-btn');
            if (button) button.textContent = shouldKeepStatusPanelOpenAfterSave() ? '儲存' : '儲存並返回';
        }

        function collapseStatusPanel() {
            const statusModal = document.getElementById('status-modal');
            if (!statusModal || statusModal.style.display !== 'block') return;
            try {
                syncDomToCurrentScenario();
                saveCurrentProgress();
            } catch (error) {
                console.warn('收回角色面板時背景儲存失敗', error);
            }
            setStatusPanelOpen(false);
        }

        function toggleStatusPanel() {
            const statusModal = document.getElementById('status-modal');
            if (statusModal?.style.display === 'block') collapseStatusPanel();
            else openStatusModal();
        }

function saveStatusModal() {
try {
syncDomToCurrentScenario();
let presetSyncedBeforeSave = false;
const preSaveSourceId = currentScenario.sourcePresetId || currentScenario.id;
if (preSaveSourceId && scenarioPresets[preSaveSourceId] && !scenarioPresets[preSaveSourceId].isLocked) {
presetSyncedBeforeSave = syncBoundPresetFromCurrentScenario();
}
if (!saveCurrentProgress()) return; // 存檔未成功時禁止繼續覆寫大廳配置
                
                // 雙向同步：覆寫回大廳的原始配置檔
                let sourceId = currentScenario.sourcePresetId || currentScenario.id;
                if (sourceId && scenarioPresets[sourceId]) {
if (scenarioPresets[sourceId].isLocked) {
alert(`【系統提醒】\n因為大廳的配置 [${scenarioPresets[sourceId].presetName}] 已上鎖 (🔒)，\n本次變更僅儲存於「當前遊戲紀錄」中，不會覆蓋回大廳。\n(若要備份目前設定，請使用另存配置；若要覆蓋回大廳，請先至大廳解鎖)`);
} else if (!presetSyncedBeforeSave) {
                        let syncPreset = createPresetSnapshotFromScenario(currentScenario, scenarioPresets[sourceId]);
                        syncPreset.id = sourceId;
                        syncPreset.presetName = scenarioPresets[sourceId].presetName; 
                        syncPreset.isLocked = false; 
                        syncPreset.statsLocked = scenarioPresets[sourceId].statsLocked !== undefined ? scenarioPresets[sourceId].statsLocked : true;
                        const previousPreset = scenarioPresets[sourceId];
                        scenarioPresets[sourceId] = syncPreset;
                        if (!persistJson('sanko_scenario_presets_v2', scenarioPresets, '角色配置')) {
                            scenarioPresets[sourceId] = previousPreset;
                            return;
                        }
                    }
                }
                
                // 同步更新選擇框中的情境名稱與選單
                const locSelect = document.getElementById('btn-location');
                if(locSelect) {
                    locSelect.innerHTML = '';
                    currentScenario.scenarios.forEach((sc, i) => {
                        const opt = document.createElement('option'); opt.value = i; opt.innerText = `✦ ${sc.name}`;
                        if(i === currentScenarioIndex) opt.selected = true; locSelect.appendChild(opt);
                    });
                }

                if (shouldKeepStatusPanelOpenAfterSave()) {
                    renderStatusSummary();
                    renderFlags();
                    renderItems();
                    updateStatusSaveButtonLabel();
                } else {
                    setStatusPanelOpen(false);
                }
            } catch (e) {
                console.error(e);
                alert("儲存時發生錯誤：" + e.message);
            }
        }

        window.addEventListener('resize', () => {
            if (document.getElementById('status-modal')?.style.display === 'block') updateStatusSaveButtonLabel();
        });

        function renderFlags() {
            const container = document.getElementById('ui-flags-container'); container.innerHTML = '';
            const budgetNote = document.getElementById('flags-budget-note');
            const normalizedFlags = [];
            currentFlags.forEach(flag => {
                const clean = cleanStoredFlagText(flag);
                if (clean && !normalizedFlags.includes(clean)) normalizedFlags.push(clean);
            });
            currentFlags = normalizedFlags;
            if (budgetNote) {
                const omitted = Math.max(0, currentFlags.length - MAX_FLAGS_FOR_PROMPT);
                budgetNote.textContent = omitted
                    ? `已保存 ${currentFlags.length} 個 Flags；AI 每回合優先讀取 ${MAX_FLAGS_FOR_PROMPT} 個（含生存狀態、最早重要項目與最近項目），其餘仍完整保留。`
                    : `已保存 ${currentFlags.length} / ${MAX_STORED_FLAGS} 個 Flags；目前全部都會提供給 AI。`;
                budgetNote.classList.toggle('warning', omitted > 0 || currentFlags.length >= MAX_STORED_FLAGS);
            }
            if(currentFlags.length === 0) { container.innerHTML = '<span class="u-inline-076">尚未解鎖任何標籤...</span>'; return; }
            currentFlags.forEach((flag, index) => {
                const cleanFlag = cleanStoredFlagText(flag);

                const tag = document.createElement('div');
                tag.className = 'flag-tag';
                /* 顯示層翻譯(2026/07/10):系統旗標(如「新手教學進行中」)有 i18n key 就翻,
                   玩家自訂旗標查無 key 原樣顯示;儲存值恆為原文,prompt 比對不受影響 */
                const displayFlag = (typeof uiText === 'function') ? uiText(cleanFlag) : cleanFlag;
                tag.appendChild(document.createTextNode(`${displayFlag} `));

                const removeButton = document.createElement('span');
                removeButton.innerText = '✖';
                removeButton.title = '刪除此標籤';
                removeButton.setAttribute('role', 'button');
                removeButton.setAttribute('tabindex', '0');
                removeButton.onclick = () => removeFlag(index);
                removeButton.onkeydown = event => { if (event.key === 'Enter' || event.key === ' ') removeFlag(index); };
                tag.appendChild(removeButton);
                container.appendChild(tag);
            });
        }

        function cleanStoredFlagText(value) {
            return valueToText(value)
                .replace(/^\[[^\]]+\]\s*/, '')
                .replace(/^狀態[：:]\s*/, '')
                .replace(/\s+/g, ' ')
                .trim();
        }

        function normalizeFlagText(value) {
            return cleanStoredFlagText(value).slice(0, MAX_FLAG_CHARS);
        }

        function getFlagsForPrompt() {
            const allFlags = [];
            currentFlags.map(normalizeFlagText).filter(Boolean).forEach(flag => {
                if (!allFlags.includes(flag)) allFlags.push(flag);
            });
            if (!allFlags.length) return '目前尚無。';
            let selectedFlags = allFlags;
            if (allFlags.length > MAX_FLAGS_FOR_PROMPT) {
                const autoFlags = allFlags.filter(flag => AUTO_SURVIVAL_FLAG_SET.has(flag));
                const regularFlags = allFlags.filter(flag => !AUTO_SURVIVAL_FLAG_SET.has(flag));
                const earliest = regularFlags.slice(0, Math.min(4, regularFlags.length));
                const remainingSlots = Math.max(0, MAX_FLAGS_FOR_PROMPT - autoFlags.length - earliest.length);
                const recent = remainingSlots > 0 ? regularFlags.slice(-remainingSlots) : [];
                selectedFlags = [];
                [...autoFlags, ...earliest, ...recent].forEach(flag => {
                    if (!selectedFlags.includes(flag) && selectedFlags.length < MAX_FLAGS_FOR_PROMPT) selectedFlags.push(flag);
                });
            }
            const omitted = Math.max(0, allFlags.length - selectedFlags.length);
            return `${selectedFlags.map(flag => `${flag}`).join('\n')}${omitted ? `\n（另有 ${omitted} 個較舊 Flags 完整保留於角色面板；重要歷史應以摘要為準。）` : ''}`;
        }

        function manualAddFlag() {
            const input = document.getElementById('new-flag-input');
            const val = normalizeFlagText(input?.value);
            if (!val || currentFlags.includes(val)) return;
            if (currentFlags.length >= MAX_STORED_FLAGS) {
                alert(`Flags 已達 ${MAX_STORED_FLAGS} 個，請先刪除或合併較舊項目再新增。`);
                return;
            }
            currentFlags.push(val);
            if (input) input.value = '';
            renderFlags();
            saveCurrentProgress();
        }

        function removeFlag(index) { currentFlags.splice(index, 1); renderFlags(); saveCurrentProgress(); }

        function removeItem(index) {
            if (!Number.isInteger(index) || index < 0 || index >= currentItems.length) return;
            const removedName = currentItems[index];
            /* 刪除確認(2026/07/10):× 貼著「使用」鈕,誤觸即蒸發(成長結晶=2 成長點);與擅長刪除同語彙 */
            const confirmMsg = (typeof uiText === 'function') ? uiText('確定刪除這個道具？（成長結晶或劇情道具刪除後不會補償）') : '確定刪除這個道具？（成長結晶或劇情道具刪除後不會補償）';
            if (!window.confirm(`${confirmMsg}\n[ ${removedName} ]`)) return;
            currentItems.splice(index, 1);
            if (itemEffects && !currentItems.includes(removedName)) {
                delete itemEffects[removedName];
            }
            renderItems();
            saveCurrentProgress();
        }

        function renderItems() {
            const container = document.getElementById('ui-items-container'); container.innerHTML = '';
            if(currentItems.length === 0) { container.innerHTML = '<span class="u-inline-076">背包空空如也...</span>'; return; }
            currentItems.forEach((item, index) => {
                const tag = document.createElement('div');
                tag.className = 'item-tag';

                const label = document.createElement('span');
                label.innerText = item;
                tag.append(label);

                const eff = (typeof itemEffects === 'object' && itemEffects) ? itemEffects[item] : null;
                if (eff && typeof useItem === 'function') {
                    tag.classList.add('item-tag-usable');
                    const useButton = document.createElement('button');
                    useButton.type = 'button';
                    useButton.className = 'item-use-btn';
                    useButton.innerText = (typeof uiText === 'function') ? uiText('使用') : '使用';
                    useButton.title = (typeof itemEffectLabel === 'function') ? itemEffectLabel(eff) : '';
                    useButton.onclick = () => useItem(index);
                    tag.append(useButton);
                }

                const removeButton = document.createElement('button');
                removeButton.type = 'button';
                removeButton.className = 'item-remove-btn';
                removeButton.innerText = '×';
                removeButton.title = `刪除道具：${item}`;
                removeButton.setAttribute('aria-label', `刪除道具：${item}`);
                removeButton.onclick = () => removeItem(index);

                tag.append(removeButton);
                container.appendChild(tag);
            });
        }

        function getPlayerRankTitle(count) {
            const c = Number(count) || 0;
            const t = (typeof uiText === 'function') ? uiText : (x => x);
            if (c >= 20) return t('傳奇');
            if (c >= 15) return t('卓越');
            if (c >= 10) return t('資深');
            if (c >= 6) return t('老練');
            if (c >= 3) return t('略有歷練');
            if (c >= 1) return t('初露鋒芒');
            return t('初心');
        }
        function renderGrowth() {
            const container = document.getElementById('ui-growth-container');
            if (!container) return;
            const t = (typeof uiText === 'function') ? uiText : (x => x);
            const available = Math.max(0, (achievementCount || 0) - (growthSpent || 0));
            const rank = getPlayerRankTitle(achievementCount || 0);
            const stats = (currentScenario && currentScenario.playerStats) ? currentScenario.playerStats : {};
            const statOrder = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
            const disabled = available <= 0;
            let html = '';
            html += `<div class="growth-head"><span class="growth-rank">${escapeStatusHtml(rank)}</span><span class="growth-points"><span class="growth-points-label">${escapeStatusHtml(t('可用成長點'))}</span>：${available}</span></div>`;
            html += `<div class="growth-sub"><span class="growth-sub-label">${escapeStatusHtml(t('累積成就'))}</span>：${achievementCount || 0}</div>`;
            /* 判定加值總覽(A 案單行文字條):兩種模式都顯示(2026/07/10 修——
               升級抉擇時最需要看到道具加值與懲罰);黃底=含道具,紅字=懲罰生效 */
            html += `<div class="growth-mod-title">${escapeStatusHtml(t('判定加值總覽'))}<span class="growth-mod-hint">${escapeStatusHtml(t('擲骰時自動計入'))}</span></div>`;
            const parts = statOrder.map(k => {
                const info = (typeof DICE_STATS === 'object' && DICE_STATS[k]) ? DICE_STATS[k] : { code: k.toUpperCase() };
                const val = Number(stats[k] != null ? stats[k] : 10);
                const abilityMod = Math.floor((val - 10) / 2);
                const itemMod = (typeof getItemDiceModifier === 'function') ? getItemDiceModifier(k) : 0;
                const survMod = (typeof getSurvivalDiceModifier === 'function') ? getSurvivalDiceModifier(k) : 0;
                const total = abilityMod + itemMod + survMod;
                const signed = total >= 0 ? `+${total}` : String(total).replace('-', '−');
                const cls = [];
                if (itemMod > 0) cls.push('it');
                if (itemMod < 0 || survMod < 0) cls.push('pn');
                return `${info.code} <span${cls.length ? ` class="${cls.join(' ')}"` : ''}>${signed}</span>`;
            });
            html += `<div class="growth-mod-line">${parts.join('<span class="sep">｜</span>')}</div>`;
            const profs = (currentScenario && Array.isArray(currentScenario.playerProficiencies)) ? currentScenario.playerProficiencies : [];
            if (profs.length) {
                html += `<div class="growth-sub"><span class="growth-sub-label">${escapeStatusHtml(t('擅長領域'))}</span>：${profs.map(p => escapeStatusHtml(valueToText(p))).join('、')}<span class="growth-mod-hint">${escapeStatusHtml(t('判定符合時另 +2'))}</span></div>`;
            }
            if (available > 0) {
                /* 升級模式:有成長點才展開可點的 + 按鈕與擅長輸入(2026/07/10 收斂改版) */
                html += `<div class="growth-stat-row">`;
                statOrder.forEach(k => {
                    const info = (typeof DICE_STATS === 'object' && DICE_STATS[k]) ? DICE_STATS[k] : { code: k.toUpperCase() };
                    const val = Number(stats[k] != null ? stats[k] : 10);
                    const capped = val >= 20;
                    if (!capped) {
                        html += `<button type="button" class="growth-stat-btn" ${disabled ? 'disabled' : ''} onclick="spendGrowthOnStat('${k}')" title="${escapeStatusHtml(t('花 1 點提升此屬性'))}">${info.code} ${val} +</button>`;
                        return;
                    }
                    /* 屬性滿 20 → 鍛造態(2026/07/10):花 2 點兌換該屬性的成長結晶(道具加值 +1,與 AI 裝備共用 ±3 上限) */
                    const itemMod = (typeof getItemDiceModifier === 'function') ? getItemDiceModifier(k) : 0;
                    const canForge = available >= 2 && itemMod < 3;
                    const forgeTitle = itemMod >= 3
                        ? t('此屬性的道具加值已達上限 +3')
                        : t('屬性已達上限：花 2 點兌換成長結晶（該屬性判定 +1）');
                    html += `<button type="button" class="growth-stat-btn growth-forge-btn" ${canForge ? '' : 'disabled'} onclick="forgeGrowthCrystal('${k}')" title="${escapeStatusHtml(forgeTitle)}">${info.code} ${val} ✦</button>`;
                });
                html += `</div>`;
                html += `<div class="growth-prof-row"><input type="text" id="growth-prof-input" maxlength="16" placeholder="${escapeStatusHtml(t('新擅長領域（最多16字）'))}"><button type="button" class="btn growth-prof-btn" onclick="spendGrowthOnProficiency()">${escapeStatusHtml(t('新增熟練'))}</button></div>`;
            }
            container.innerHTML = html;
        }
        function spendGrowthOnStat(stat) {
            const available = Math.max(0, (achievementCount || 0) - (growthSpent || 0));
            if (available <= 0) return;
            if (!currentScenario || !currentScenario.playerStats || typeof DICE_STATS !== 'object' || !DICE_STATS[stat]) return;
            const val = Number(currentScenario.playerStats[stat] != null ? currentScenario.playerStats[stat] : 10);
            if (val >= 20) return;
            currentScenario.playerStats[stat] = val + 1;
            growthSpent = (growthSpent || 0) + 1;
            renderGrowth();
            if (typeof saveCurrentProgress === 'function') saveCurrentProgress();
            if (typeof createSystemAlert === 'function') createSystemAlert(survivalFxUiMessage('— {stat} +1（成長點 -1）—', { stat: DICE_STATS[stat].code }));
        }
        function spendGrowthOnProficiency() {
            const available = Math.max(0, (achievementCount || 0) - (growthSpent || 0));
            if (available <= 0) return;
            const input = document.getElementById('growth-prof-input');
            const text = input ? valueToText(input.value).trim().slice(0, 16) : '';
            if (!text || !currentScenario) return;
            if (!Array.isArray(currentScenario.playerProficiencies)) currentScenario.playerProficiencies = [];
            if (currentScenario.playerProficiencies.includes(text)) return;
            /* 上限防呆(2026/07/10):清單其他路徑會硬切 4 個,沒擋會「點花了、擅長被默默丟掉」 */
            if (currentScenario.playerProficiencies.length >= 4) {
                alert((typeof uiText === 'function') ? uiText('擅長領域最多 4 個，請先刪除一個再新增。') : '擅長領域最多 4 個，請先刪除一個再新增。');
                return;
            }
            currentScenario.playerProficiencies.push(text);
            growthSpent = (growthSpent || 0) + 1;
            if (input) input.value = '';
            renderGrowth();
            if (typeof saveCurrentProgress === 'function') saveCurrentProgress();
            if (typeof createSystemAlert === 'function') createSystemAlert(survivalFxUiMessage('— 新增擅長領域：{text}（成長點 -1）—', { text }));
        }

        /* 成長結晶(2026/07/10):屬性滿 20 後的成長點出口——花 2 點兌換該屬性 +1 的加值道具。
           與 AI 裝備共用每屬性 ±3 clamp;同名自動加序號防 items_remove 誤刪;可被劇情失去(風險稅)。 */
        function forgeGrowthCrystal(stat) {
            const available = Math.max(0, (achievementCount || 0) - (growthSpent || 0));
            if (available < 2 || !currentScenario || !currentScenario.playerStats) return;
            if (typeof DICE_STATS !== 'object' || !DICE_STATS[stat]) return;
            const val = Number(currentScenario.playerStats[stat] != null ? currentScenario.playerStats[stat] : 10);
            if (val < 20) return;
            const itemMod = (typeof getItemDiceModifier === 'function') ? getItemDiceModifier(stat) : 0;
            if (itemMod >= 3) {
                alert((typeof uiText === 'function') ? uiText('此屬性的道具加值已達上限 +3') : '此屬性的道具加值已達上限 +3');
                return;
            }
            const zhNames = (typeof ITEM_DICE_STAT_NAMES === 'object' && ITEM_DICE_STAT_NAMES[stat]) ? ITEM_DICE_STAT_NAMES[stat] : null;
            const zh = zhNames && zhNames[1] ? zhNames[1] : DICE_STATS[stat].code;
            if (!Array.isArray(currentItems)) currentItems = [];
            let name = `成長結晶（${zh}+1）`;
            let serial = 2;
            while (currentItems.includes(name)) { name = `成長結晶・${serial}（${zh}+1）`; serial += 1; }
            currentItems.push(name);
            growthSpent = (growthSpent || 0) + 2;
            renderGrowth();
            if (typeof renderItems === 'function') renderItems();
            if (typeof saveCurrentProgress === 'function') saveCurrentProgress();
            if (typeof createSystemAlert === 'function') {
                createSystemAlert(`獲得道具 [ ${name} ]`);
                createSystemNote((typeof uiText === 'function') ? uiText('兌換成長結晶（成長點 -2）') : '兌換成長結晶（成長點 -2）');
            }
        }

        function refreshOpenStatusPanel() {
            const modal = document.getElementById('status-modal');
            if (!modal || modal.style.display !== 'block') return;
            const panelHasFocus = document.activeElement?.closest?.('#status-modal-content');
            if (panelHasFocus) {
                renderStatusSummary();
                renderFlags();
                renderItems();
                return;
            }
            const scroller = document.querySelector('#status-modal-content > .u-inline-012');
            const scrollTop = scroller?.scrollTop || 0;
            openStatusModal();
            const refreshedScroller = document.querySelector('#status-modal-content > .u-inline-012');
            if (refreshedScroller) refreshedScroller.scrollTop = scrollTop;
        }

        document.getElementById('status-modal')?.addEventListener('click', event => {
            if (event.target === event.currentTarget) collapseStatusPanel();
        });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && document.getElementById('status-modal')?.style.display === 'block') collapseStatusPanel();
            if ((event.key === 'Enter' || event.key === ' ') && event.target?.id === 'floating-menu-btn') {
                event.preventDefault();
                toggleStatusPanel();
            }
        });

        function getAdventureJournalSaveKeys() {
            return Object.keys(savesData).filter(id => savesData[id] && typeof savesData[id] === 'object' && !Array.isArray(savesData[id]))
                .sort((a, b) => String(b).localeCompare(String(a)));
        }

        // === Diary 收藏（範圍/長截圖；跟著存檔）===
        function getCollections(saveId) {
            const sv = savesData[saveId || currentSaveId];
            if (!sv) return [];
            if (!Array.isArray(sv.collections)) sv.collections = [];
            return sv.collections;
        }
        function addCollectionRange(lines, caption) {
            if (!currentSaveId || !Array.isArray(lines) || !lines.length) { if (typeof tinyToast === 'function') tinyToast('請先載入存檔'); return; }
const now = new Date();
getCollections().push({ lines: lines.slice(), caption: valueToText(caption), date: now.toLocaleString(), dateMs: now.getTime() });
            if (typeof saveCurrentProgress === 'function') saveCurrentProgress();
            if (typeof tinyToast === 'function') tinyToast('已收藏 ♥');
        }
        let diaryViewSaveId = '';
        let diaryViewIndex = 0;
function persistDiarySave() {
if (typeof persistSingleSave === 'function') persistSingleSave(diaryViewSaveId, '日記');
else if (typeof saveCurrentProgress === 'function') saveCurrentProgress();
}
function getDiaryUiText(text) {
return (typeof uiText === 'function') ? uiText(text) : text;
}
function getDiaryDateText(col) {
const localeMap = { 'zh-TW': 'zh-TW', en: 'en-US', ja: 'ja-JP' };
const lang = (typeof getUiLanguage === 'function') ? getUiLanguage() : 'zh-TW';
const ms = Number(col && col.dateMs);
if (Number.isFinite(ms) && ms > 0) return new Date(ms).toLocaleString(localeMap[lang] || 'zh-TW');
const raw = valueToText(col && col.date);
if (!raw) return getDiaryUiText('未知時間');
const parsed = raw.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})\s*(上午|下午|AM|PM|午前|午後)?\s*(\d{1,2}):(\d{2})(?::(\d{2}))?/i);
if (parsed) {
let hour = Number(parsed[5]);
const marker = parsed[4] || '';
if (/下午|PM|午後/i.test(marker) && hour < 12) hour += 12;
if (/上午|AM|午前/i.test(marker) && hour === 12) hour = 0;
return new Date(Number(parsed[1]), Number(parsed[2]) - 1, Number(parsed[3]), hour, Number(parsed[6]), Number(parsed[7] || 0)).toLocaleString(localeMap[lang] || 'zh-TW');
}
if (lang === 'en') return raw.replaceAll('上午', 'AM').replaceAll('下午', 'PM');
if (lang === 'ja') return raw.replaceAll('上午', '午前').replaceAll('下午', '午後');
return raw;
}
function beginDiaryCaptionEdit(capEl, col) {
if (!capEl || !col || capEl.isContentEditable) return;
const placeholder = getDiaryUiText('（點這裡寫一句話）');
const current = valueToText(col.caption);
capEl.contentEditable = 'true';
capEl.spellcheck = false;
capEl.classList.add('is-editing');
capEl.textContent = current;
capEl.focus();
const range = document.createRange();
range.selectNodeContents(capEl);
range.collapse(false);
const selection = window.getSelection();
if (selection) { selection.removeAllRanges(); selection.addRange(range); }
const finish = () => {
capEl.removeEventListener('blur', finish);
capEl.contentEditable = 'false';
capEl.classList.remove('is-editing');
col.caption = valueToText(capEl.textContent).trim();
persistDiarySave();
capEl.textContent = col.caption || placeholder;
};
capEl.addEventListener('blur', finish);
capEl.onkeydown = event => {
if (event.key === 'Enter') { event.preventDefault(); capEl.blur(); }
if (event.key === 'Escape') { event.preventDefault(); capEl.textContent = current; capEl.blur(); }
};
}
function removeCollection(idx) {
            const list = getCollections(diaryViewSaveId);
            if (idx < 0 || idx >= list.length) return;
            list.splice(idx, 1);
            persistDiarySave();
            renderDiary();
        }
        function selectDiarySave(id) { diaryViewSaveId = id; diaryViewIndex = 0; renderDiary(); }
        function deleteCurrentDiary() {
            const list = getCollections(diaryViewSaveId);
            if (list.length && confirm('刪除目前這則收藏？')) removeCollection(diaryViewIndex);
        }
        // 用「跟遊戲同一套」的泡泡/旁白元件，把收藏的原始訊息行重畫進任意容器
        function renderDiaryLines(container, lines, scenario) {
            container.innerHTML = '';
            const empty = (typeof emptyAvatar !== 'undefined') ? emptyAvatar : '';
            const strip = (x) => (typeof stripHardDiceDirective === 'function') ? stripHardDiceDirective(x) : x;
            const playerName = valueToText(scenario && scenario.playerName);
            const playerAvatar = (scenario && scenario.playerAvatar) || empty;
            const npcs = (scenario && Array.isArray(scenario.npcs)) ? scenario.npcs : [];
            (lines || []).forEach(raw => {
                const line = valueToText(raw);
                if (line.startsWith('【旁白】：')) {
                    const nav = document.createElement('div'); nav.className = 'msg-narrative';
                    nav.innerText = strip(line.replace('【旁白】：', ''));
                    container.appendChild(nav);
                } else if (/^【[^】]+】：/.test(line)) {
                    const sys = document.createElement('div'); sys.className = 'system-msg';
                    sys.textContent = line.replace(/^【[^】]+】：/, '');
                    container.appendChild(sys);
                } else {
                    const idx = line.indexOf('：'); if (idx < 0) return;
                    const speaker = line.substring(0, idx);
                    const text = strip(line.substring(idx + 1));
                    const isPlayer = speaker === playerName;
                    const wrap = document.createElement('div'); wrap.className = 'msg-wrapper ' + (isPlayer ? 'player' : 'npc');
                    const av = document.createElement('img'); av.className = 'chat-avatar';
                    let src = empty;
                    if (isPlayer) src = playerAvatar;
                    else { const npc = npcs.find(n => valueToText(n.name) === speaker); if (npc) src = npc.avatar || empty; }
                    av.src = src; av.onerror = () => { if (av.src !== empty) av.src = empty; };
                    const content = document.createElement('div'); content.className = 'msg-content';
                    const sp = document.createElement('div'); sp.className = 'msg-speaker'; sp.textContent = speaker;
                    const tx = document.createElement('div'); tx.className = 'msg-text'; tx.textContent = text;
                    content.appendChild(sp); content.appendChild(tx);
                    wrap.appendChild(av); wrap.appendChild(content);
                    container.appendChild(wrap);
                }
            });
        }
        function openDiary() {
            const keys = Object.keys(savesData || {});
            if (!diaryViewSaveId || !savesData[diaryViewSaveId]) diaryViewSaveId = (currentSaveId && savesData[currentSaveId]) ? String(currentSaveId) : (keys[0] || '');
            const cols = getCollections(diaryViewSaveId);
            diaryViewIndex = cols.length ? cols.length - 1 : 0;
            const embedded = (typeof showHomeInfoView === 'function') && showHomeInfoView('diary');
            if (!embedded) {
                const sec = document.querySelector('.setup-home-view[data-home-view="diary"]');
                if (sec) sec.classList.add('active', 'diary-fullscreen');
            }
            renderDiary();
            wireDiaryShotGestures();
        }
        function closeDiary() {
            const sec = document.querySelector('.setup-home-view[data-home-view="diary"]');
            if (sec) sec.classList.remove('diary-fullscreen', 'active');
            if (typeof showHomeInfoView === 'function') showHomeInfoView('main');
        }
        async function exportDiaryImage() {
            const content = document.getElementById('diary-content');
            if (!content) return;
            if (typeof html2canvas !== 'function') { alert(getDiaryUiText('圖片元件還在載入，請稍等幾秒再試一次。')); return; }
            if (!content.querySelector('.msg-wrapper, .msg-narrative, .system-msg')) { alert(getDiaryUiText('這一篇日記沒有可存的對話內容。')); return; }
            const toast = m => { try { if (typeof tinyToast === 'function') tinyToast(m); } catch (e) {} };

            const capEl = document.getElementById('diary-caption');
            const dateEl = document.getElementById('diary-date');
            const capRaw = (capEl && capEl.textContent || '').trim();
            const capText = (capRaw === '（點這裡寫一句話）') ? '' : capRaw;
            const dateText = (dateEl && dateEl.textContent || '').trim();
            const safe = s => (s || '').replace(/[\\/:*?"<>|\r\n\t]/g, '').slice(0, 24);
            const base = '日記' + (capText ? '_' + safe(capText) : '');

            let foot = null;
            if (capText || dateText) {
                foot = document.createElement('div');
                foot.className = 'diary-shot-foot';
                if (capText) { const c = document.createElement('div'); c.className = 'diary-shot-cap'; c.textContent = capText; foot.appendChild(c); }
                if (dateText) { const d = document.createElement('div'); d.className = 'diary-shot-date'; d.textContent = dateText; foot.appendChild(d); }
                content.appendChild(foot);
            }

            const savedStyle = content.getAttribute('style') || '';
            content.style.maxHeight = 'none';
            content.style.height = 'auto';
            content.style.overflow = 'visible';

            const cs = getComputedStyle(content);
            let bg = cs.backgroundColor;
            if (!bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') bg = '#EEEEEE';

            toast(getDiaryUiText('產生圖片中…'));
            try {
                await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
                const fullH = content.scrollHeight;
                const scale = Math.min(2, window.devicePixelRatio || 1) || 1;
                const maxH = Math.max(300, Math.floor(16000 / scale));   // 每張最大高度（CSS px）

                // 以「訊息／旁白區塊」為單位決定切點，避免把一則切成兩半
                const cRect = content.getBoundingClientRect();
                const items = Array.from(content.children).map(el => {
                    const r = el.getBoundingClientRect();
                    return { top: r.top - cRect.top, bottom: r.bottom - cRect.top };
                }).filter(it => it.bottom > it.top);

                const parts = [];
                if (!items.length) {
                    parts.push({ y: 0, h: fullH });
                } else {
                    let startY = 0, idx = 0;
                    const n = items.length;
                    while (startY < fullH - 1) {
                        const limitY = startY + maxH;
                        let lastFit = idx - 1;
                        for (let k = idx; k < n; k++) { if (items[k].bottom <= limitY + 0.5) lastFit = k; else break; }
                        let endY;
                        if (lastFit < idx) {                       // 單一區塊本身就超過上限：只能硬切
                            endY = Math.min(limitY, fullH);
                            while (idx < n && items[idx].bottom <= endY + 0.5) idx++;
                        } else {                                   // 切在下一則的頂端（把中間空隙留給上一張）
                            const next = lastFit + 1;
                            endY = (next < n) ? items[next].top : fullH;
                            idx = next;
                        }
                        if (endY <= startY) endY = Math.min(startY + maxH, fullH);
                        parts.push({ y: startY, h: endY - startY });
                        startY = endY;
                    }
                }

                const pages = parts.length;
                for (let i = 0; i < pages; i++) {
                    const canvas = await html2canvas(content, {
                        backgroundColor: bg, scale, useCORS: true, logging: false,
                        height: Math.ceil(parts[i].h), y: Math.floor(parts[i].y)
                    });
                    const url = canvas.toDataURL('image/png');
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = (pages > 1 ? base + '_' + (i + 1) : base) + '.png';
                    document.body.appendChild(a); a.click(); a.remove();
                    if (pages > 1 && i < pages - 1) await new Promise(r => setTimeout(r, 500));
                }
            } catch (e) {
                alert(getDiaryUiText('存成圖片失敗：') + (e && e.message ? e.message : e));
            } finally {
                if (foot && foot.parentNode) foot.remove();
                content.setAttribute('style', savedStyle);
            }
        }
        function closeDiaryShotMenu() {
            const m = document.getElementById('diary-shot-menu');
            if (m) m.remove();
            document.removeEventListener('click', closeDiaryShotMenu);
        }
        function openDiaryShotMenu(x, y) {
            closeDiaryShotMenu();
            const menu = document.createElement('div');
            menu.id = 'diary-shot-menu';
            menu.className = 'msg-context-menu';
            const b = document.createElement('button');
            b.className = 'msg-menu-item';
            b.textContent = getDiaryUiText('保存圖片');
            b.onclick = ev => { ev.stopPropagation(); closeDiaryShotMenu(); exportDiaryImage(); };
            menu.appendChild(b);
            document.body.appendChild(menu);
            const mw = menu.offsetWidth, mh = menu.offsetHeight;
            menu.style.left = Math.max(8, Math.min(x, window.innerWidth - mw - 8)) + 'px';
            menu.style.top = Math.max(8, Math.min(y, window.innerHeight - mh - 8)) + 'px';
            setTimeout(() => document.addEventListener('click', closeDiaryShotMenu), 0);
        }
        function wireDiaryShotGestures() {
            const bar = document.querySelector('#diary-pager');
            if (!bar || bar.dataset.shotWired) return;
            bar.dataset.shotWired = '1';
            bar.title = getDiaryUiText('右鍵（手機長按）可存成圖片');
            bar.addEventListener('contextmenu', e => { e.preventDefault(); openDiaryShotMenu(e.clientX, e.clientY); });
            let timer = null, sx = 0, sy = 0;
            bar.addEventListener('touchstart', e => {
                const t = e.touches && e.touches[0]; if (!t) return;
                sx = t.clientX; sy = t.clientY;
                timer = setTimeout(() => { timer = null; openDiaryShotMenu(sx, sy); }, 500);
            }, { passive: true });
            const cancel = () => { if (timer) { clearTimeout(timer); timer = null; } };
            bar.addEventListener('touchend', cancel);
            bar.addEventListener('touchcancel', cancel);
            bar.addEventListener('touchmove', e => {
                const t = e.touches && e.touches[0]; if (!t) return;
                if (Math.abs(t.clientX - sx) > 10 || Math.abs(t.clientY - sy) > 10) cancel();
            }, { passive: true });
        }
function renderDiary() {
            const content = document.getElementById('diary-content');
            if (!content) return;
            const saveSel = document.getElementById('diary-save-select');
            const pager = document.getElementById('diary-pager');
            const capEl = document.getElementById('diary-caption');
            const dateEl = document.getElementById('diary-date');
            const keys = Object.keys(savesData || {});
            if (!diaryViewSaveId || !savesData[diaryViewSaveId]) diaryViewSaveId = (currentSaveId && savesData[currentSaveId]) ? String(currentSaveId) : (keys[0] || '');
            if (saveSel) {
                saveSel.innerHTML = '';
                keys.forEach(k => { const o = document.createElement('option'); o.value = k; o.textContent = valueToText(savesData[k].title || k); saveSel.appendChild(o); });
                saveSel.value = diaryViewSaveId;
            }
            const cols = getCollections(diaryViewSaveId);
            if (diaryViewIndex >= cols.length) diaryViewIndex = cols.length - 1;
            if (diaryViewIndex < 0) diaryViewIndex = 0;
if (pager) {
pager.innerHTML = '';
const pageList = document.createElement('div');
pageList.className = 'diary-pg-list';
const pageActions = document.createElement('div');
pageActions.className = 'diary-pg-actions';
cols.forEach((c, i) => {
const b = document.createElement('button'); b.type = 'button'; b.className = 'diary-pg' + (i === diaryViewIndex ? ' active' : '');
b.textContent = String(i + 1); b.onclick = () => { diaryViewIndex = i; renderDiary(); };
pageList.appendChild(b);
if (i < cols.length - 1) { const sep = document.createElement('span'); sep.className = 'diary-pg-sep'; sep.textContent = '/'; pageList.appendChild(sep); }
});
pager.appendChild(pageList);
if (typeof enableReorderDrag === 'function') {
    Array.from(pageList.querySelectorAll('.diary-pg')).forEach(pageBtn => {
        enableReorderDrag(pageBtn, pageBtn, pageList, '.diary-pg', (fromIndex, toIndex) => {
            const list = getCollections(diaryViewSaveId);
            if (fromIndex < 0 || fromIndex >= list.length || toIndex < 0 || toIndex >= list.length) return;
            const viewed = list[diaryViewIndex];
            const moved = list.splice(fromIndex, 1)[0];
            list.splice(toIndex, 0, moved);
            diaryViewIndex = Math.max(0, list.indexOf(viewed));
            persistDiarySave();
            renderDiary();
        }, { axis: 'x' });
    });
}
pageList.onwheel = event => {
if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
event.preventDefault();
pageList.scrollLeft += event.deltaY;
};
if (cols.length) {
const del = document.createElement('button'); del.type = 'button'; del.className = 'diary-pg-del'; del.textContent = '\u2715';
del.title = getDiaryUiText('\u522a\u9664\u9019\u5247'); del.setAttribute('aria-label', getDiaryUiText('\u522a\u9664\u9019\u5247'));
del.onclick = () => deleteCurrentDiary();
pageActions.appendChild(del);
const nx = document.createElement('button'); nx.type = 'button'; nx.className = 'diary-pg-next'; nx.textContent = '\u2794'; nx.onclick = () => { diaryViewIndex = (diaryViewIndex + 1) % cols.length; renderDiary(); };
pageActions.appendChild(nx);
pager.appendChild(pageActions);
}
}
            if (!cols.length) {
                content.innerHTML = '';
                const p = document.createElement('p'); p.className = 'diary-empty';
p.textContent = getDiaryUiText('這份存檔還沒有收藏。遊戲中右鍵（手機長按）對話 →「收藏這段」，選一段連續對話收起來。');
                content.appendChild(p);
                if (capEl) capEl.textContent = ''; if (dateEl) dateEl.textContent = '';
                return;
            }
            const col = cols[diaryViewIndex];
            const scenario = (savesData[diaryViewSaveId] && savesData[diaryViewSaveId].scenario) || {};
            renderDiaryLines(content, col.lines || [], scenario);
            content.scrollTop = 0;
            if (capEl) {
capEl.textContent = valueToText(col.caption) || getDiaryUiText('（點這裡寫一句話）');
capEl.title = getDiaryUiText('點擊編輯一句話');
capEl.setAttribute('aria-label', getDiaryUiText('點擊編輯一句話'));
capEl.onclick = () => beginDiaryCaptionEdit(capEl, col);
            }
if (dateEl) dateEl.textContent = getDiaryDateText(col);
}
window.addEventListener('ui-language-change', () => {
const diaryView = document.querySelector('.setup-home-view[data-home-view="diary"]');
if (diaryView && diaryView.classList.contains('active')) renderDiary();
});

function openAdventureJournal(preferredSaveId = '') {
const gameVisible = document.getElementById('game-container')?.style.display === 'flex';
const saveMenuVisible = document.getElementById('save-menu-screen')?.style.display === 'flex';
const setupHomeVisible = canUseSetupHomeView();
journalReturnTarget = gameVisible ? 'game' : (saveMenuVisible ? 'save-menu' : (setupHomeVisible ? 'setup-home' : 'setup'));
if (gameVisible && currentSaveId) {
const statusModal = document.getElementById('status-modal');
if (statusModal?.style.display === 'block') syncDomToCurrentScenario();
saveCurrentProgress();
                const host = document.getElementById('inline-journal-host');
                const journalScreen = document.getElementById('journal-screen');
                if (host && journalScreen) {
                    host.appendChild(journalScreen);
                    journalScreen.classList.add('journal-screen-embedded');
                    journalScreen.style.display = 'flex';
                    journalEmbedded = true;
                    document.getElementById('status-page-log')?.classList.add('journal-inline-open');
                    const toggleButton = document.getElementById('inline-journal-toggle-btn');
                    if (toggleButton) {
                        toggleButton.textContent = '收起完整冒險日誌';
                        toggleButton.classList.add('is-open');
                    }
const closeButton = document.getElementById('journal-close-btn');
if (closeButton) closeButton.textContent = '收起';
}
} else if (setupHomeVisible) {
if (embedJournalInSetupHome()) showHomeInfoView('journal');
} else {
['setup-screen', 'edit-scenario-screen', 'save-menu-screen', 'game-container'].forEach(id => {
const el = document.getElementById(id);
if (el) el.style.display = 'none';
                });
                document.getElementById('journal-screen').style.display = 'flex';
            }
            const keys = getAdventureJournalSaveKeys();
            journalSelectedSaveId = journalEmbedded && currentSaveId && savesData[currentSaveId]
                ? String(currentSaveId)
                : ((preferredSaveId && savesData[preferredSaveId])
                    ? String(preferredSaveId)
                    : (journalSelectedSaveId && savesData[journalSelectedSaveId] ? journalSelectedSaveId : (keys[0] || '')));
            journalPageIndex = 0;
            journalSearchText = '';
            journalImportantOnly = false;
            const search = document.getElementById('journal-search');
            if (search) search.value = '';
            renderAdventureJournalSaveSelector();
            renderAdventureJournal();
            if (!journalEmbedded) window.scrollTo(0, 0);
        }

        function toggleInlineAdventureJournal(preferredSaveId = '') {
            if (journalEmbedded) closeAdventureJournal();
            else openAdventureJournal(preferredSaveId);
        }

function closeAdventureJournal() {
const journalScreen = document.getElementById('journal-screen');
journalScreen.style.display = 'none';
if (journalScreen.classList.contains('journal-screen-home-embedded')) {
restoreJournalFromSetupHome();
showHomeInfoView('main');
return;
}
if (journalEmbedded) {
journalScreen.classList.remove('journal-screen-embedded');
document.getElementById('journal-screen-home')?.after(journalScreen);
journalEmbedded = false;
                document.getElementById('status-page-log')?.classList.remove('journal-inline-open');
                const toggleButton = document.getElementById('inline-journal-toggle-btn');
                if (toggleButton) {
                    toggleButton.textContent = '開啟完整冒險日誌';
                    toggleButton.classList.remove('is-open');
                }
                const closeButton = document.getElementById('journal-close-btn');
                if (closeButton) closeButton.textContent = '返回';
                return;
            }
            if (journalReturnTarget === 'game' && currentSaveId) {
                document.getElementById('game-container').style.display = 'flex';
                updatePlayerInputPlaceholder();
                return;
            }
            if (journalReturnTarget === 'save-menu') {
                document.getElementById('save-menu-screen').style.display = 'flex';
                renderSaveList();
                return;
            }
            document.getElementById('setup-screen').style.display = 'flex';
        }

        function renderAdventureJournalSaveSelector() {
            const select = document.getElementById('journal-save-select');
            if (!select) return;
            const keys = journalEmbedded && currentSaveId && savesData[currentSaveId]
                ? [String(currentSaveId)]
                : getAdventureJournalSaveKeys();
            select.innerHTML = '';
            if (!keys.length) {
                const option = document.createElement('option');
                option.value = '';
 option.textContent = uiText('目前沒有存檔');
                select.appendChild(option);
                select.disabled = true;
                return;
            }
            select.disabled = false;
            keys.forEach(id => {
                const save = savesData[id];
                const option = document.createElement('option');
                option.value = id;
 option.textContent = `${valueToText(save.title, uiText('未命名紀錄'))} · ${valueToText(save.date, uiText('未知時間'))}`;
                option.selected = id === journalSelectedSaveId;
                select.appendChild(option);
            });
        }

        function selectAdventureJournalSave(saveId) {
            if (journalEmbedded && String(saveId) !== String(currentSaveId)) return;
            if (!savesData[saveId]) return;
            journalSelectedSaveId = String(saveId);
            journalPageIndex = 0;
            renderAdventureJournal();
        }

        function filterAdventureJournal(value) {
            journalSearchText = valueToText(value).toLowerCase();
            journalPageIndex = 0;
            renderAdventureJournal();
        }

        function toggleJournalImportantFilter() {
            journalImportantOnly = !journalImportantOnly;
            journalPageIndex = 0;
            renderAdventureJournal();
        }

function getAdventureJournalEntries(saveId = journalSelectedSaveId) {
const save = savesData[saveId];
if (!save) return [];
const important = Array.isArray(save.importantJournalEntries) ? save.importantJournalEntries.map(Number) : [];
return splitAdventureLog(save.log).map((text, index) => ({ text, index, important: important.includes(index) }));
}

function getImportantAdventureLogEntries(save, log = save?.log) {
    if (!save) {
        return [];
    }
    const entries = splitAdventureLog(log);
    const importantIndices = Array.isArray(save.importantJournalEntries)
        ? save.importantJournalEntries.map(Number)
        : [];
    return [...new Set(importantIndices)]
        .filter(index => Number.isInteger(index) && index >= 0 && index < entries.length)
        .sort((a, b) => a - b)
        .map(index => ({ index, text: entries[index] }));
}

function restoreImportantAdventureLogEntries(organizedLog, importantEntries = []) {
    if (!Array.isArray(importantEntries) || !importantEntries.length) {
        return organizedLog;
    }
    const mergedEntries = splitAdventureLog(organizedLog);
    const availableCounts = new Map();
    mergedEntries.forEach(entry => {
        const key = normalizeAdventureLogKey(entry);
        if (!key) {
            return;
        }
        availableCounts.set(key, (availableCounts.get(key) || 0) + 1);
    });
    const requiredCounts = new Map();
    importantEntries.forEach(entry => {
        const text = typeof entry === 'string' ? entry : valueToText(entry?.text);
        const key = normalizeAdventureLogKey(text);
        if (!key) {
            return;
        }
        const requiredCount = (requiredCounts.get(key) || 0) + 1;
        requiredCounts.set(key, requiredCount);
        if ((availableCounts.get(key) || 0) >= requiredCount) {
            return;
        }
        const originalIndex = Number.isInteger(entry?.index) ? entry.index : mergedEntries.length;
        const insertAt = Math.max(0, Math.min(originalIndex, mergedEntries.length));
        mergedEntries.splice(insertAt, 0, text);
        availableCounts.set(key, (availableCounts.get(key) || 0) + 1);
    });
    return formatBulletListText(mergedEntries, '');
}

function remapImportantJournalEntries(save, importantEntries = [], log = save?.log) {
    if (!save) {
        return [];
    }
    const availableIndices = new Map();
    splitAdventureLog(log).forEach((entry, index) => {
        const key = normalizeAdventureLogKey(entry);
        if (!key) {
            return;
        }
        const indices = availableIndices.get(key) || [];
        indices.push(index);
        availableIndices.set(key, indices);
    });
    const consumedCounts = new Map();
    const nextIndices = [];
    importantEntries.forEach(entry => {
        const entryText = typeof entry === 'string' ? entry : valueToText(entry?.text);
        const key = normalizeAdventureLogKey(entryText);
        const indices = availableIndices.get(key) || [];
        const consumedCount = consumedCounts.get(key) || 0;
        if (!key || consumedCount >= indices.length) {
            return;
        }
        nextIndices.push(indices[consumedCount]);
        consumedCounts.set(key, consumedCount + 1);
    });
    save.importantJournalEntries = nextIndices.sort((a, b) => a - b);
    return save.importantJournalEntries;
}

function toggleJournalEntryImportant(entryIndex) {
const save = savesData[journalSelectedSaveId];
if (!save) return;
const index = Number(entryIndex);
const important = Array.isArray(save.importantJournalEntries) ? save.importantJournalEntries.map(Number) : [];
const next = important.includes(index)
? important.filter(item => item !== index)
: [...important, index].sort((a, b) => a - b);
save.importantJournalEntries = next;
persistSingleSave(journalSelectedSaveId, '冒險日誌重要標記');
renderAdventureJournal();
}

        function renderAdventureJournal() {
            const list = document.getElementById('journal-entry-list');
            const meta = document.getElementById('journal-meta');
 const pageLabel = document.getElementById('journal-page-label');
 const prevButton = document.getElementById('journal-prev-btn');
 const nextButton = document.getElementById('journal-next-btn');
 const organizeButton = document.getElementById('journal-organize-btn');
 const pagination = pageLabel?.closest('.journal-pagination');
 if (!list || !meta || !pageLabel) return;
 if (pagination) {
 pagination.style.position = '';
 pagination.style.inset = '';
 pagination.style.top = '';
 pagination.style.right = '';
 pagination.style.bottom = '';
 pagination.style.left = '';
 pagination.style.zIndex = '';
 pagination.style.transform = '';
 }
 const save = savesData[journalSelectedSaveId];
 if (!save) {
 list.innerHTML = `<p class="journal-empty">${escapeStatusHtml(uiText('目前沒有可查看的冒險紀錄。'))}</p>`;
 meta.textContent = uiText('請先建立遊戲存檔。');
 pageLabel.textContent = uiText('第 0 / 0 頁');
 if (prevButton) prevButton.disabled = true;
 if (nextButton) nextButton.disabled = true;
 if (organizeButton) organizeButton.disabled = true;
 if (pagination) {
 pagination.hidden = true;
 pagination.style.display = 'none';
 list.appendChild(pagination);
 }
 return;
 }
            if (organizeButton) organizeButton.disabled = false;
            const allEntries = getAdventureJournalEntries();
            const searchedEntries = journalSearchText
                ? allEntries.filter(entry => entry.text.toLowerCase().includes(journalSearchText))
                : allEntries;
            const filteredEntries = journalImportantOnly
                ? searchedEntries.filter(entry => entry.important)
                : searchedEntries;
            const importantFilterButton = document.getElementById('journal-important-filter-btn');
            if (importantFilterButton) {
                importantFilterButton.setAttribute('aria-pressed', journalImportantOnly ? 'true' : 'false');
            }
            const pageCount = Math.max(1, Math.ceil(filteredEntries.length / JOURNAL_PAGE_SIZE));
            journalPageIndex = Math.max(0, Math.min(journalPageIndex, pageCount - 1));
            const start = journalPageIndex * JOURNAL_PAGE_SIZE;
            const visibleEntries = filteredEntries.slice(start, start + JOURNAL_PAGE_SIZE);
 const locale = uiLocale();
 meta.textContent = (journalSearchText || journalImportantOnly)
 ? uiText('找到 {filtered} / {total} 條紀錄')
 .replace('{filtered}', filteredEntries.length)
 .replace('{total}', allEntries.length)
 : uiText('共 {total} 條紀錄；每頁最多 {pageSize} 條')
 .replace('{total}', allEntries.length)
 .replace('{pageSize}', JOURNAL_PAGE_SIZE);
 pageLabel.textContent = locale === 'en' ? `Page ${journalPageIndex + 1} / ${pageCount}` : locale === 'ja' ? `${journalPageIndex + 1} / ${pageCount} ページ` : `第 ${journalPageIndex + 1} / ${pageCount} 頁`;
 if (pagination) {
 const showPagination = pageCount > 1;
 pagination.hidden = !showPagination;
 pagination.style.display = showPagination ? 'grid' : 'none';
 }
 if (prevButton) prevButton.disabled = journalPageIndex <= 0;
 if (nextButton) nextButton.disabled = journalPageIndex >= pageCount - 1;
            if (!visibleEntries.length) {
                list.innerHTML = `<p class="journal-empty">${escapeStatusHtml(uiText('沒有符合搜尋條件的紀錄。'))}</p>`;
 if (pagination) list.appendChild(pagination);
                return;
            }
list.innerHTML = visibleEntries.map(entry => `
<article class="journal-entry${entry.important ? ' journal-entry-important' : ''}">
<span class="journal-entry-index">#${entry.index + 1}</span>
<textarea class="journal-entry-text journal-entry-inline-input" rows="1" aria-label="${escapeStatusHtml(uiText('冒險紀錄內容'))}" oninput="autoResize(this)" onblur="saveJournalEntryInlineEdit(${entry.index}, this.value)">${escapeStatusHtml(uiJournalEntryText(entry.text))}</textarea>
<button class="journal-entry-star" type="button" aria-label="${entry.important ? escapeStatusHtml(uiText('取消重要標記')) : escapeStatusHtml(uiText('標記為重要'))}" title="${entry.important ? escapeStatusHtml(uiText('取消重要標記')) : escapeStatusHtml(uiText('標記為重要'))}" onclick="toggleJournalEntryImportant(${entry.index})">${entry.important ? '★' : '☆'}</button>
<button class="journal-entry-delete" type="button" aria-label="${escapeStatusHtml(uiText('刪除此筆'))}" title="${escapeStatusHtml(uiText('刪除此筆'))}" onclick="deleteJournalEntryInline(${entry.index})">－</button>
</article>`).join('');
list.querySelectorAll('.journal-entry-inline-input').forEach(autoResize);
if (pagination) list.appendChild(pagination);
}

function saveJournalEntryInlineEdit(entryIndex, value) {
const save = savesData[journalSelectedSaveId];
const index = Number(entryIndex);
if (!save || !Number.isInteger(index)) return;
const entries = getAdventureJournalEntries().map(entry => entry.text);
if (index < 0 || index >= entries.length) return;
const text = valueToText(value).replace(/\s*\n+\s*/g, ' ').trim();
if (!text || text === entries[index]) {
renderAdventureJournal();
return;
}
entries[index] = stripMemoryListPrefix(text);
save.log = formatBulletListText(entries, '• 故事剛開始，目前尚無重大事件發生。');
save.date = new Date().toLocaleString();
if (journalSelectedSaveId === currentSaveId) currentAdventureLog = save.log;
persistSingleSave(journalSelectedSaveId, '冒險日誌');
renderAdventureJournal();
}

function deleteJournalEntryInline(entryIndex) {
const save = savesData[journalSelectedSaveId];
const index = Number(entryIndex);
if (!save || !Number.isInteger(index)) return;
const entries = getAdventureJournalEntries().map(entry => entry.text);
if (index < 0 || index >= entries.length) return;
if (!confirm(uiText('確定要刪除這筆冒險紀錄嗎？'))) return;
entries.splice(index, 1);
if (Array.isArray(save.importantJournalEntries)) {
save.importantJournalEntries = save.importantJournalEntries
.map(Number)
.filter(item => Number.isInteger(item) && item !== index)
.map(item => item > index ? item - 1 : item);
}
save.log = formatBulletListText(entries, '• 故事剛開始，目前尚無重大事件發生。');
save.date = new Date().toLocaleString();
if (journalSelectedSaveId === currentSaveId) currentAdventureLog = save.log;
persistSingleSave(journalSelectedSaveId, '冒險日誌');
renderAdventureJournal();
}

        function changeAdventureJournalPage(delta) {
            journalPageIndex += Number(delta) || 0;
            renderAdventureJournal();
            window.scrollTo(0, 0);
        }

        function jumpAdventureJournalToLatest() {
            const entries = getAdventureJournalEntries().filter(entry =>
                (!journalSearchText || entry.text.toLowerCase().includes(journalSearchText))
                && (!journalImportantOnly || entry.important));
            journalPageIndex = Math.max(0, Math.ceil(entries.length / JOURNAL_PAGE_SIZE) - 1);
            renderAdventureJournal();
            window.scrollTo(0, document.body.scrollHeight);
        }

        function chunkAdventureLog(log, maxChars = 7000) {
 const entries = splitAdventureLog(log);
 const chunks = [];
            let currentChunk = [];
            let currentLength = 0;
            entries.forEach(entry => {
                const clean = truncatePromptText(entry, 600);
                const nextLength = currentLength + clean.length + 3;
                if (currentChunk.length && nextLength > maxChars) {
                    chunks.push(currentChunk.join('\n'));
                    currentChunk = [];
                    currentLength = 0;
                }
                currentChunk.push(`• ${clean}`);
                currentLength += clean.length + 3;
            });
            if (currentChunk.length) chunks.push(currentChunk.join('\n'));
 return chunks.length ? chunks : ['• 尚無重大事件。'];
 }

 function isProtectedAdventureLogEntry(line) {
 const text = stripMemoryListPrefix(line);
 return /^(?:【\s*)?任務(?:完成|失敗)(?:\s*】)?[：:]?/.test(text)
 || /^(?:🏆|(?:【\s*)?(?:成就|成就解鎖|成就達成)(?:\s*】)?[：:]?)/.test(text)
 || /^\[(?:成就|Achievement|ACHIEVEMENT|狀態\/成就)\]/.test(text);
 }

 function restoreProtectedAdventureLogEntries(originalLog, organizedLog) {
 const protectedEntries = splitAdventureLog(originalLog).filter(isProtectedAdventureLogEntry);
 if (!protectedEntries.length) return organizedLog;
 const mergedEntries = splitAdventureLog(organizedLog);
 const seen = new Set(mergedEntries.map(normalizeAdventureLogKey).filter(Boolean));
 protectedEntries.forEach(entry => {
 const key = normalizeAdventureLogKey(entry);
 if (!key || seen.has(key)) return;
 seen.add(key);
 mergedEntries.push(entry);
 });
 return formatBulletListText(mergedEntries, '• 故事剛開始，目前尚無重大事件發生。');
 }

 function buildSelectedJournalOrganizerPrompt(save, logChunk = '', partIndex = 0, partCount = 1) {
 const scenario = save?.scenario || {};
 const memory = save?.memoryBrief || {};
 return `你是 TRPG 冒險紀錄整理器。整理第 ${partIndex + 1}/${partCount} 段紀錄：合併本段語意重複內容，保持原順序，保留重要事實、任務結果、角色關係轉折、場景變化與重要物品異動。不得捏造或預設劇情。
保護規則：凡是「任務完成：」「任務失敗：」「【成就】」「成就：」「🏆」或「[成就]」開頭的紀錄，必須原文保留；不得刪除、不得改寫成摘要、不得把完成或失敗任務改回未完成。
只輸出 JSON：{"adventure_log":["精簡事件"]}。\n玩家：${valueToText(scenario.playerName, '玩家')}\n相關角色：${(scenario.npcs || []).map(npc => npc.name).filter(Boolean).slice(0, 20).join('、') || '無'}\n既有摘要：${truncatePromptText(memory.story, 1200) || '無'}\n任務：${truncatePromptText(memory.tasks, 900) || '無'}\n關係：${truncatePromptText(memory.relationships, 900) || '無'}\n\n本段紀錄：\n${logChunk}`;
 }

        async function organizeAdventureLogWithAI(save, onProgress = null) {
            const profile = getModelRuntimeProfile();
            const importantIndices = new Set(
                (Array.isArray(save?.importantJournalEntries) ? save.importantJournalEntries.map(Number) : [])
                    .filter(index => Number.isInteger(index) && index >= 0)
            );
            const organizerEntries = splitAdventureLog(save?.log)
                .filter((entry, index) => !importantIndices.has(index));
            if (!organizerEntries.length) {
                const emptyError = new Error(uiText('所有紀錄都已標記為重要（★），沒有需要 AI 整理的內容。'));
                emptyError.userFriendly = true;
                throw emptyError;
            }
            const chunks = chunkAdventureLog(organizerEntries, profile.id === 'gpt-4.1' ? 6000 : 8000);
            const organizedEntries = [];
            for (let index = 0; index < chunks.length; index += 1) {
                if (typeof onProgress === 'function') onProgress(index + 1, chunks.length);
                const prompt = buildSelectedJournalOrganizerPrompt(save, chunks[index], index, chunks.length);
                const rawText = await requestAIText(prompt, { kind: 'journal', maxTokens: profile.journalMaxTokens });
                const data = await parseMemoryOrganizerJson(rawText, prompt);
                normalizeSummaryPayload(data.adventure_log, 200, 240).forEach(entry => organizedEntries.push(entry));
            }
            return formatBulletListText(organizedEntries, '', true);
        }

        async function organizeSelectedJournalLog() {
            const save = savesData[journalSelectedSaveId];
            if (!save) return;
            const importantEntries = getImportantAdventureLogEntries(save);
 if (!confirm(uiText('整理會合併語意重複的事件。系統會先保留備份，確定要繼續嗎？'))) return;
            const button = document.getElementById('journal-organize-btn');
            const originalLabel = button?.innerText || '';
 if (button) { button.disabled = true; button.innerText = uiText('整理中…'); }
            try {
                const organizedLog = await organizeAdventureLogWithAI(save, (current, total) => {
 if (button) {
 button.innerText = total > 1
 ? uiText('整理中 {current}/{total}').replace('{current}', current).replace('{total}', total)
 : uiText('整理中…');
 }
                });
 if (!organizedLog) throw new Error(uiText('AI 沒有回傳可用的冒險紀錄。'));
 const importantLog = restoreImportantAdventureLogEntries(organizedLog, importantEntries);
 const finalLog = restoreProtectedAdventureLogEntries(save.log, importantLog);
 if (!Array.isArray(save.memoryLogBackups)) save.memoryLogBackups = [];
 save.memoryLogBackups.push({ date: new Date().toLocaleString(), log: save.log });
 save.memoryLogBackups = save.memoryLogBackups.slice(-3);
 save.log = finalLog;
 remapImportantJournalEntries(save, importantEntries, finalLog);
 save.date = new Date().toLocaleString();
 if (journalSelectedSaveId === currentSaveId) currentAdventureLog = finalLog;
                persistSingleSave(journalSelectedSaveId, '整理冒險日誌');
                journalPageIndex = 0;
                renderAdventureJournalSaveSelector();
                renderAdventureJournal();
 alert(uiText('冒險紀錄已整理完成；如不滿意可按「復原上次整理」。'));
            } catch (error) {
                console.error(error);
                alert(`${getFriendlyErrorMessage(error, 'AI 暫時無法完成整理。')}\n原本內容沒有被刪除。`);
            } finally {
                if (button) { button.disabled = false; button.innerText = originalLabel; }
            }
        }

        function restoreSelectedJournalBackup() {
            const save = savesData[journalSelectedSaveId];
            const backups = Array.isArray(save?.memoryLogBackups) ? save.memoryLogBackups : [];
            if (!backups.length) { alert('這份存檔目前沒有可復原的整理備份。'); return; }
            const latest = backups[backups.length - 1];
            const importantEntries = getImportantAdventureLogEntries(save);
            if (!confirm(`要復原 ${latest.date || '上一次'} 整理前的冒險紀錄嗎？`)) return;
            save.log = formatBulletListText(latest.log, '• 故事剛開始，目前尚無重大事件發生。');
            remapImportantJournalEntries(save, importantEntries, save.log);
            backups.pop();
            save.memoryLogBackups = backups;
            save.date = new Date().toLocaleString();
            if (journalSelectedSaveId === currentSaveId) currentAdventureLog = save.log;
            persistSingleSave(journalSelectedSaveId, '復原冒險日誌');
            renderAdventureJournalSaveSelector();
            renderAdventureJournal();
        }

        function formatStorageBytes(bytes) {
            const value = Number(bytes) || 0;
            if (value < 1024) return `${value} B`;
            if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
            if (value < 1024 * 1024 * 1024) return `${(value / 1024 / 1024).toFixed(1)} MB`;
            return `${(value / 1024 / 1024 / 1024).toFixed(2)} GB`;
        }

        async function updateStorageHealthDisplay() {
            const usageText = document.getElementById('storage-usage-text');
            const backupText = document.getElementById('storage-backup-text');
            if (!usageText || !backupText) return;
            try {
                let usage = 0;
                let quota = 0;
                if (navigator.storage?.estimate) {
                    const estimate = await navigator.storage.estimate();
                    usage = Number(estimate.usage) || 0;
                    quota = Number(estimate.quota) || 0;
                } else {
                    usage = new Blob([JSON.stringify({ savesData, scenarioPresets, apiUsageStats })]).size;
                }
                const persisted = navigator.storage?.persisted ? await navigator.storage.persisted() : false;
                const ratio = quota > 0 ? usage / quota : 0;
                const locale = uiLocale();
                usageText.textContent = quota > 0
                    ? (locale === 'en'
                        ? `Browser storage used ${formatStorageBytes(usage)} / about ${formatStorageBytes(quota)} available (${Math.round(ratio * 100)}%); ${persisted ? 'marked as less likely to be cleared automatically' : 'regular exports are still recommended'}.`
                        : locale === 'ja'
                            ? `ブラウザ使用量 ${formatStorageBytes(usage)} / 利用可能 約 ${formatStorageBytes(quota)}（${Math.round(ratio * 100)}%）；${persisted ? '自動削除されにくい状態です' : '定期的なエクスポートをおすすめします'}。`
                            : `瀏覽器目前使用 ${formatStorageBytes(usage)} / 可用約 ${formatStorageBytes(quota)}（${Math.round(ratio * 100)}%）；${persisted ? '瀏覽器已標記為較不易自動清除' : '仍建議定期匯出備份'}。`)
                    : (locale === 'en'
                        ? `Current data size is about ${formatStorageBytes(usage)}; this browser does not report available quota.`
                        : locale === 'ja'
                            ? `現在のデータ量は約 ${formatStorageBytes(usage)} です。このブラウザは空き容量の上限を提供していません。`
                            : `目前資料量約 ${formatStorageBytes(usage)}；此瀏覽器沒有提供可用容量上限。`);
                usageText.classList.toggle('backup-warning', ratio >= 0.8);
            } catch (error) {
                usageText.textContent = uiText('暫時無法取得瀏覽器容量資訊；存檔功能仍可正常使用。');
            }

            const lastBackupValue = localStorage.getItem(LAST_BACKUP_STORAGE_KEY);
            const lastBackupTime = lastBackupValue ? Date.parse(lastBackupValue) : NaN;
            const daysSinceBackup = Number.isFinite(lastBackupTime) ? Math.floor((Date.now() - lastBackupTime) / 86400000) : null;
            const hasSaves = Object.keys(savesData).length > 0;
            const overdue = hasSaves && (daysSinceBackup === null || daysSinceBackup >= BACKUP_REMINDER_DAYS);
            const locale = uiLocale();
            backupText.textContent = !hasSaves
                ? uiText('目前沒有遊戲存檔；建立存檔後會在這裡提醒備份。')
                : daysSinceBackup === null
                    ? uiText('尚未記錄到匯出備份；建議現在按下方「匯出」。')
                    : (locale === 'en'
                        ? `Last export: ${new Date(lastBackupTime).toLocaleString()} (${daysSinceBackup === 0 ? 'today' : `${daysSinceBackup} days ago`}). ${overdue ? 'Please back up again.' : 'Backup status is OK.'}`
                        : locale === 'ja'
                            ? `最終エクスポート：${new Date(lastBackupTime).toLocaleString()}（${daysSinceBackup === 0 ? '今日' : `${daysSinceBackup} 日前`}）。${overdue ? 'もう一度バックアップしてください。' : 'バックアップ状態は正常です。'}`
                            : `最近一次匯出：${new Date(lastBackupTime).toLocaleString()}（${daysSinceBackup === 0 ? '今天' : `${daysSinceBackup} 天前`}）。${overdue ? '建議再備份一次。' : '備份狀態正常。'}`);
            backupText.classList.toggle('backup-warning', overdue);
        }
