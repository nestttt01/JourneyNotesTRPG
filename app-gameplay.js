// === [app.js 拆分] app-gameplay.js：原 app.js 第 5882–6905 行｜對話渲染/頭像/訊息/loadGame/骰點/輸入/場景參與/創作者模式/生存｜需依 index.html 既有順序與其他 app-*.js 一同載入，勿單獨重排。 ===
function renderChatPage(pageIndex, visibleCount, scrollAnchor) {
const msgBox = document.getElementById('dialogue-box');
msgBox.innerHTML = '';
const optArea = document.getElementById('options-area');
optArea.innerHTML = '';
            
            const currentLog = chatScripts[pageIndex] || [];
            ensureChatMenuDelegation();
            const requestedCount = Number.isFinite(Number(visibleCount)) ? Math.max(CHAT_RENDER_LIMIT, Math.floor(Number(visibleCount))) : CHAT_RENDER_LIMIT;
            const renderCount = Math.min(currentLog.length, requestedCount);
            msgBox.dataset.loadedHistoryCount = String(renderCount);
            msgBox.dataset.showAllHistory = renderCount > CHAT_RENDER_LIMIT ? '1' : '';
            let renderLog = currentLog;
            const chatHidden = currentLog.length > renderCount ? currentLog.length - renderCount : 0;
            if (chatHidden > 0) {
                renderLog = currentLog.slice(-renderCount);
                const more = document.createElement('button');
                more.className = 'chat-load-earlier';
                more.textContent = (window.uiMessage ? window.uiMessage('▲ 載入更早的對話（還有 {n} 則）', { n: chatHidden }) : `▲ 載入更早的對話（還有 ${chatHidden} 則）`);
                more.onclick = () => renderChatPage(pageIndex, renderCount + CHAT_RENDER_LIMIT, getChatScrollAnchor(msgBox));
                msgBox.appendChild(more);
            }

            msgBox.dataset.renderingHistory = '1';
            if (currentLog.length > 0) {
                renderLog.forEach(line => {
                    if (line.startsWith(`【旁白】：`)) { 
                        appendNarrative(stripHardDiceDirective(line.replace(`【旁白】：`, "")), line); 
                    }
                    else if (line.startsWith(`【創作者指令】：`)) {
                        appendCreatorInstruction('創作者指令', line.replace(`【創作者指令】：`, ''));
                    }
                    else if (line.startsWith(`【輔助旁白】：`)) {
                        appendCreatorInstruction('輔助旁白', line.replace(`【輔助旁白】：`, ''));
                    }
                    else if (line.startsWith(`【系統提示】：`)) {
                        const rawMsg = line.replace(`【系統提示】：`, ""); 
                        const displayMsg = window.uiSystemMessage ? window.uiSystemMessage(rawMsg) : rawMsg;
                        if (rawMsg.includes("解鎖") || rawMsg.includes("獲得") || rawMsg.includes("失去") || rawMsg.includes("消耗") || rawMsg.includes("好感度") || rawMsg.includes("發生改變") || rawMsg.includes("檢定")) {
                            const alertDiv = document.createElement('div'); alertDiv.className = 'alert-msg'; alertDiv.innerText = displayMsg; msgBox.appendChild(alertDiv);
                        } else {
                            const systemMsgDiv = document.createElement('div');
                            systemMsgDiv.className = 'system-msg';
                            systemMsgDiv.innerText = displayMsg;
                            msgBox.appendChild(systemMsgDiv);
                        }
                    } else {
                        const splitIdx = line.indexOf('：');
                        if (splitIdx > -1) { const speaker = line.substring(0, splitIdx); const text = stripHardDiceDirective(line.substring(splitIdx + 1)); appendMessage(speaker, text, line); }
                    }
                });
            } else {
const emptyMessage = window.uiMessage ? window.uiMessage('此情境/支線尚無對話。請輸入動作，或讓 AI 生成開場') : '此情境/支線尚無對話。請輸入動作，或讓 AI 生成開場';
const systemMsg = document.createElement('div'); systemMsg.className = 'system-msg'; systemMsg.innerHTML = `<i>— ${emptyMessage} —</i>`; msgBox.appendChild(systemMsg); msgBox.scrollTop = msgBox.scrollHeight;
const btn = document.createElement('button'); btn.className = 'opt-btn'; btn.style.borderColor = 'var(--accent-neon)'; btn.style.width = 'fit-content'; btn.style.alignSelf = 'center'; btn.textContent = window.uiMessage ? window.uiMessage('🎲 讓 AI 根據「情境設定」隨機生成開場事件') : '🎲 讓 AI 根據「情境設定」隨機生成開場事件';
                btn.onclick = () => { 
                    optArea.innerHTML = ''; 
                    document.getElementById('loading').style.display = 'block'; 
                    const currentScenName = currentScenario.scenarios[currentChatPageIndex].name;
                    const prompt = `【系統啟動要求】目前視角處於「${currentScenName}」情境。請嚴格根據「當前場景的世界觀與物理法則」以及「NPC在此的總體身分」，隨機生成一個極具帶入感的開局事件（例如：遭遇突發危機、日常衝突、或是某個角色正在做符合他人設的行為）。請利用 narrative 豐富描寫場景氣氛，並讓合適的 NPC 講出第一句話。`; 
                    callAI_JSON(prompt, true); 
                };
                optArea.appendChild(btn);
            }
            delete msgBox.dataset.renderingHistory;
            if (scrollAnchor && Number.isFinite(scrollAnchor.scrollHeight) && Number.isFinite(scrollAnchor.scrollTop)) {
                const keepScrollAnchor = () => restoreChatScrollAnchor(msgBox, scrollAnchor);
                keepScrollAnchor();
                requestAnimationFrame(() => {
                    keepScrollAnchor();
                });
            } else {
                msgBox.scrollTop = msgBox.scrollHeight;
            }
        }

        function getChatScrollAnchor(box) {
            const boxRect = box.getBoundingClientRect();
            const items = Array.from(box.querySelectorAll('[data-raw-line]'));
            const firstVisible = items.find(el => el.getBoundingClientRect().bottom > boxRect.top + 4);
            if (!firstVisible) {
                return { scrollHeight: box.scrollHeight, scrollTop: box.scrollTop };
            }
            return {
                rawLine: firstVisible.dataset.rawLine || '',
                offsetTop: firstVisible.getBoundingClientRect().top - boxRect.top,
                scrollHeight: box.scrollHeight,
                scrollTop: box.scrollTop
            };
        }

        function restoreChatScrollAnchor(box, anchor) {
            const previousScrollBehavior = box.style.scrollBehavior;
            box.style.scrollBehavior = 'auto';
            if (anchor.rawLine) {
                const boxTop = box.getBoundingClientRect().top;
                const target = Array.from(box.querySelectorAll('[data-raw-line]'))
                    .find(el => (el.dataset.rawLine || '') === anchor.rawLine);
                if (target) {
                    box.scrollTop += target.getBoundingClientRect().top - boxTop - anchor.offsetTop;
                    box.style.scrollBehavior = previousScrollBehavior;
                    return;
                }
            }
            const scrollDelta = box.scrollHeight - anchor.scrollHeight;
            box.scrollTop = Math.max(0, anchor.scrollTop + scrollDelta);
            box.style.scrollBehavior = previousScrollBehavior;
        }

        function appendNarrative(text, rawLine) {
            if (!text) return; const dialogueBox = document.getElementById('dialogue-box'); const navDiv = document.createElement('div'); navDiv.className = 'msg-narrative'; navDiv.innerText = text;
            navDiv.dataset.rawLine = (rawLine !== undefined) ? rawLine : `【旁白】：${text}`;
            attachMsgMenu(navDiv, navDiv, 'narrative', '');
            dialogueBox.appendChild(navDiv);
            if (dialogueBox.dataset.renderingHistory !== '1') dialogueBox.scrollTop = dialogueBox.scrollHeight;
            trimChatDom();
        }

        function appendCreatorInstruction(label, text) {
            if (!text) return;
            const dialogueBox = document.getElementById('dialogue-box');
            const note = document.createElement('div');
            note.className = 'creator-instruction';
            const heading = document.createElement('strong');
            heading.textContent = window.uiMessage ? window.uiMessage(label) : label;
            note.appendChild(heading);
            note.appendChild(document.createTextNode(text));
            dialogueBox.appendChild(note);
            if (dialogueBox.dataset.renderingHistory !== '1') dialogueBox.scrollTop = dialogueBox.scrollHeight;
        }


        function openGameAvatarPicker(kind, npcId = '') {
            if (!currentSaveId || !currentScenario) return;
            pendingGameAvatarTarget = { kind, npcId: valueToText(npcId) };
            const input = document.getElementById('upload-game-avatar');
            if (!input) return;
            input.value = '';
            input.click();
        }

        function triggerGameAvatarCrop(input) {
            if (!pendingGameAvatarTarget) return;
            triggerCrop(input, 'game');
        }

        function getGameAvatarCharacter(target = pendingGameAvatarTarget) {
            if (!target || !currentScenario) return null;
            if (target.kind === 'player') return { kind: 'player', character: currentScenario };
            const npcs = Array.isArray(currentScenario.npcs) ? currentScenario.npcs : [];
            const npc = npcs.find(item => valueToText(item.id) === valueToText(target.npcId));
            return npc ? { kind: 'npc', character: npc } : null;
        }

        function updateVisibleGameAvatars(target, avatarSrc) {
            document.querySelectorAll('.chat-avatar.editable-avatar').forEach(img => {
                const samePlayer = target.kind === 'player' && img.dataset.avatarKind === 'player';
                const sameNpc = target.kind === 'npc'
                    && img.dataset.avatarKind === 'npc'
                    && img.dataset.avatarNpcId === valueToText(target.npcId);
                if (samePlayer || sameNpc) img.src = avatarSrc;
            });
        }

        function syncGameAvatarToPreset(target, avatarSrc) {
            const sourceId = currentScenario?.sourcePresetId || currentScenario?.id;
            const preset = sourceId ? scenarioPresets[sourceId] : null;
            if (!preset) return { synced: false, reason: 'missing' };
            if (preset.isLocked) return { synced: false, reason: 'locked', presetName: preset.presetName || '目前配置' };

            const previousPreset = clonePersistentValue(preset);
            if (target.kind === 'player') {
                preset.playerAvatar = avatarSrc;
            } else {
                if (!Array.isArray(preset.npcs)) preset.npcs = [];
                const currentNpc = getGameAvatarCharacter(target)?.character;
                if (!currentNpc) return { synced: false, reason: 'missing-character' };
                let presetNpc = preset.npcs.find(item =>
                    (valueToText(item.id) && valueToText(item.id) === valueToText(currentNpc.id))
                    || (valueToText(item.name) && valueToText(item.name) === valueToText(currentNpc.name))
                );
                if (!presetNpc) {
                    presetNpc = clonePersistentValue(currentNpc);
                    delete presetNpc.dynamic;
                    preset.npcs.push(presetNpc);
                }
                presetNpc.avatar = avatarSrc;
            }

            if (!persistJson('sanko_scenario_presets_v2', scenarioPresets, '角色配置頭像')) {
                scenarioPresets[sourceId] = previousPreset;
                return { synced: false, reason: 'storage' };
            }
            return { synced: true, presetName: preset.presetName || '目前配置' };
        }

        function commitGameAvatar(avatarSrc) {
            const target = pendingGameAvatarTarget;
            const resolved = getGameAvatarCharacter(target);
            if (!target || !resolved) {
                alert('找不到這名角色，頭像未變更。');
                pendingGameAvatarTarget = null;
                return;
            }

            if (target.kind === 'player') currentScenario.playerAvatar = avatarSrc;
            else resolved.character.avatar = avatarSrc;
            updateVisibleGameAvatars(target, avatarSrc);
            const saveOk = saveCurrentProgress();
            if (!saveOk) {
                pendingGameAvatarTarget = null;
                return;
            }
            const presetResult = syncGameAvatarToPreset(target, avatarSrc);
            pendingGameAvatarTarget = null;

            if (presetResult.reason === 'locked') {
                alert(`頭像已存入目前遊戲紀錄。\n角色配置「${presetResult.presetName}」已上鎖，因此沒有覆寫配置。`);
            }
        }

        function makeChatAvatarEditable(avatar, target, speaker) {
            if (!avatar || !target) return;
            avatar.classList.add('editable-avatar');
            avatar.dataset.avatarKind = target.kind;
            if (target.kind === 'npc') avatar.dataset.avatarNpcId = valueToText(target.npcId);
            avatar.alt = `${speaker} 的頭像`;
            avatar.title = '點擊新增或更換頭像';
            avatar.tabIndex = 0;
            avatar.setAttribute('role', 'button');
            avatar.setAttribute('aria-label', `更換 ${speaker} 的頭像`);
            const openPicker = () => openGameAvatarPicker(target.kind, target.npcId || '');
            avatar.addEventListener('click', openPicker);
            avatar.addEventListener('keydown', event => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                openPicker();
            });
        }

        function appendMessage(speaker, text, rawLine) {
            if (!text) return; let isPlayer = false; let avatarSrc = emptyAvatar; let avatarTarget = null;

            if (speaker === currentScenario.playerName) {
                isPlayer = true;
                avatarSrc = currentScenario.playerAvatar || emptyAvatar;
                avatarTarget = { kind: 'player' };
            } else {
                const foundNpc = currentScenario.npcs.find(n => n.name === speaker);
                avatarSrc = foundNpc ? (foundNpc.avatar || emptyAvatar) : emptyAvatar;
                if (foundNpc) avatarTarget = { kind: 'npc', npcId: valueToText(foundNpc.id) };
            }

            const dialogueBox = document.getElementById('dialogue-box'); 
            const msgWrapper = document.createElement('div'); 
            msgWrapper.className = `msg-wrapper ${isPlayer ? 'player' : 'npc'}`;

            const avatar = document.createElement('img');
            avatar.src = avatarSrc;
            avatar.className = 'chat-avatar';
            avatar.onerror = () => {
                if (avatar.src !== emptyAvatar) avatar.src = emptyAvatar;
            };
            makeChatAvatarEditable(avatar, avatarTarget, speaker);

            const content = document.createElement('div');
            content.className = 'msg-content';

            const speakerDiv = document.createElement('div');
            speakerDiv.className = 'msg-speaker';
            speakerDiv.textContent = speaker;

            const textDiv = document.createElement('div');
            textDiv.className = 'msg-text';
            textDiv.textContent = text;

            content.appendChild(speakerDiv);
            content.appendChild(textDiv);
            msgWrapper.appendChild(avatar);
            msgWrapper.appendChild(content);
            msgWrapper.dataset.rawLine = (rawLine !== undefined) ? rawLine : `${speaker}：${text}`;
            attachMsgMenu(msgWrapper, textDiv, 'msg', speaker);
            dialogueBox.appendChild(msgWrapper);
            if (dialogueBox.dataset.renderingHistory !== '1') dialogueBox.scrollTop = dialogueBox.scrollHeight;
            trimChatDom();
        }

        // === 對話長按/右鍵選單：改用「事件委派」——整個對話框只綁一組監聽，不再每則各綁（大幅減少監聽器、玩久不卡） ===
        const CHAT_RENDER_LIMIT = 60;
        function attachMsgMenu(wrapperEl, textEl, kind, speaker) {
            wrapperEl.dataset.menuKind = kind;
            wrapperEl.dataset.menuSpeaker = speaker || '';
        }
        function ensureChatMenuDelegation() {
            const box = document.getElementById('dialogue-box');
            if (!box || box.dataset.menuDelegated) return;
            box.dataset.menuDelegated = '1';
            const resolve = target => {
                const el = (target && target.closest) ? target.closest('[data-menu-kind]') : null;
                if (!el || !box.contains(el)) return null;
                const kind = el.dataset.menuKind;
                const textEl = (kind === 'narrative') ? el : (el.querySelector('.msg-text') || el);
                return { el, textEl, kind, speaker: el.dataset.menuSpeaker || '' };
            };
            box.addEventListener('contextmenu', e => {
                const r = resolve(e.target); if (!r) return;
                e.preventDefault();
                openMsgMenu(r.el, r.textEl, r.kind, r.speaker, e.clientX, e.clientY);
            });
            let pressTimer = null, sx = 0, sy = 0;
            box.addEventListener('touchstart', e => {
                const t = e.touches && e.touches[0]; if (!t) return;
                const r = resolve(e.target); if (!r) return;
                sx = t.clientX; sy = t.clientY;
                pressTimer = setTimeout(() => { pressTimer = null; openMsgMenu(r.el, r.textEl, r.kind, r.speaker, sx, sy); }, 480);
            }, { passive: true });
            const cancel = () => { if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; } };
            box.addEventListener('touchend', cancel, { passive: true });
            box.addEventListener('touchcancel', cancel, { passive: true });
            box.addEventListener('touchmove', e => {
                const t = e.touches && e.touches[0];
                if (t && (Math.abs(t.clientX - sx) > 10 || Math.abs(t.clientY - sy) > 10)) cancel();
            }, { passive: true });
        }
        function trimChatDom() {
            const box = document.getElementById('dialogue-box');
            if (!box) return;
            if (box.dataset.showAllHistory === '1') return;
            const items = box.querySelectorAll('.msg-wrapper, .msg-narrative, .system-msg, .alert-msg, .creator-instruction');
            if (items.length <= CHAT_RENDER_LIMIT) return;
            const cut = items.length - CHAT_RENDER_LIMIT;
            for (let i = 0; i < cut; i++) items[i].remove();
            if (!box.querySelector('.chat-load-earlier')) {
                const b = document.createElement('button');
                b.className = 'chat-load-earlier';
                b.textContent = (window.uiMessage ? window.uiMessage('▲ 載入更早的對話') : '▲ 載入更早的對話');
                const loadedCount = Number(box.dataset.loadedHistoryCount) || CHAT_RENDER_LIMIT;
                b.onclick = () => renderChatPage(currentChatPageIndex, loadedCount + CHAT_RENDER_LIMIT, getChatScrollAnchor(box));
                box.insertBefore(b, box.firstChild);
            }
        }
        function closeMsgMenu() {
            const m = document.getElementById('msg-context-menu');
            if (m) m.remove();
        }
        function openMsgMenu(wrapperEl, textEl, kind, speaker, x, y) {
            closeMsgMenu();
            const menu = document.createElement('div');
            menu.id = 'msg-context-menu';
            menu.className = 'msg-context-menu';
            const mk = (label, fn) => {
                const b = document.createElement('button');
            b.className = 'msg-menu-item'; b.textContent = (typeof uiText === 'function') ? uiText(label) : label;
                b.onclick = ev => { ev.stopPropagation(); closeMsgMenu(); fn(); };
                return b;
            };
            menu.appendChild(mk('編輯', () => startEditMsg(wrapperEl, textEl, kind, speaker)));
            menu.appendChild(mk('收藏這段', () => startCollectSelect(wrapperEl)));
            menu.appendChild(mk('複製', () => {
                try { if (navigator.clipboard) navigator.clipboard.writeText(textEl.textContent); } catch (e) {}
        tinyToast('已複製');
            }));
            document.body.appendChild(menu);
            const mw = menu.offsetWidth, mh = menu.offsetHeight;
            menu.style.left = Math.max(8, Math.min(x, window.innerWidth - mw - 8)) + 'px';
            menu.style.top = Math.max(8, Math.min(y, window.innerHeight - mh - 8)) + 'px';
            setTimeout(() => document.addEventListener('click', closeMsgMenu, { once: true }), 0);
        }
        function startEditMsg(wrapperEl, textEl, kind, speaker) {
            const host = textEl.parentNode;
            if (!host || host.querySelector('.msg-edit-area')) return;
            const oldRaw = wrapperEl.dataset.rawLine || '';
            const originalH = textEl.offsetHeight;
            const ta = document.createElement('textarea');
            ta.className = 'msg-edit-area'; ta.value = (typeof textEl.innerText === 'string') ? textEl.innerText : textEl.textContent;
            ta.style.minHeight = Math.min(Math.max(140, originalH + 24), Math.round(window.innerHeight * 0.7)) + 'px';
            const bar = document.createElement('div'); bar.className = 'msg-edit-bar';
        const saveBtn = document.createElement('button'); saveBtn.className = 'msg-edit-save'; saveBtn.textContent = (typeof uiText === 'function') ? uiText('儲存') : '儲存';
        const cancelBtn = document.createElement('button'); cancelBtn.className = 'msg-edit-cancel'; cancelBtn.textContent = (typeof uiText === 'function') ? uiText('取消') : '取消';
            bar.appendChild(saveBtn); bar.appendChild(cancelBtn);
            textEl.style.display = 'none';
            host.insertBefore(ta, textEl.nextSibling);
            host.insertBefore(bar, ta.nextSibling);
            ta.focus();
            try { ta.setSelectionRange(0, 0); ta.scrollTop = 0; } catch (e) {}
            const cleanup = () => { ta.remove(); bar.remove(); textEl.style.display = ''; };
            cancelBtn.onclick = cleanup;
            saveBtn.onclick = () => {
                const nt = ta.value;
                const newRaw = (kind === 'narrative') ? `【旁白】：${nt}` : `${speaker}：${nt}`;
                const page = chatScripts[currentChatPageIndex] || [];
                const idx = page.indexOf(oldRaw);
                if (idx > -1) page[idx] = newRaw;
                wrapperEl.dataset.rawLine = newRaw;
                textEl.textContent = nt;
                cleanup();
                if (typeof saveCurrentProgress === 'function') saveCurrentProgress();
            };
        }
        let diaryCollectStartRaw = null;
        function startCollectSelect(startEl) {
            if (!currentSaveId) { tinyToast('請先載入存檔'); return; }
            cancelCollectSelect();
            diaryCollectStartRaw = startEl.dataset.rawLine || '';
            startEl.classList.add('diary-sel-start');
            const box = document.getElementById('dialogue-box');
            if (box) { box.classList.add('diary-selecting'); box.addEventListener('click', diaryEndClickHandler, true); }
            let banner = document.getElementById('diary-collect-banner');
            if (banner) banner.remove();
            banner = document.createElement('div'); banner.id = 'diary-collect-banner'; banner.className = 'diary-collect-banner';
        const txt = document.createElement('span'); txt.textContent = (typeof uiText === 'function') ? uiText('已選起點 — 點另一則當結尾完成收藏（同一則＝只收那則）') : '已選起點 — 點另一則當結尾完成收藏（同一則＝只收那則）';
        const cancel = document.createElement('button'); cancel.textContent = (typeof uiText === 'function') ? uiText('取消') : '取消'; cancel.onclick = cancelCollectSelect;
            banner.appendChild(txt); banner.appendChild(cancel);
            document.body.appendChild(banner);
        }
        function diaryEndClickHandler(e) {
            const el = e.target.closest('[data-raw-line]');
            if (!el) return;
            e.preventDefault(); e.stopPropagation();
            const endRaw = el.dataset.rawLine || '';
            const page = chatScripts[currentChatPageIndex] || [];
            let a = page.indexOf(diaryCollectStartRaw), b = page.indexOf(endRaw);
            cancelCollectSelect();
            if (a < 0 || b < 0) { tinyToast('收藏失敗，請重試'); return; }
            if (a > b) { const tmp = a; a = b; b = tmp; }
            const lines = page.slice(a, b + 1);
            const caption = window.prompt('幫這段收藏寫一句話（可留空）：', '') || '';
            if (typeof addCollectionRange === 'function') addCollectionRange(lines, caption);
        }
        function cancelCollectSelect() {
            diaryCollectStartRaw = null;
            document.querySelectorAll('.diary-sel-start').forEach(el => el.classList.remove('diary-sel-start'));
            const box = document.getElementById('dialogue-box');
            if (box) { box.classList.remove('diary-selecting'); box.removeEventListener('click', diaryEndClickHandler, true); }
            const banner = document.getElementById('diary-collect-banner');
            if (banner) banner.remove();
        }
        function tinyToast(msg) {
        const t = document.createElement('div'); t.className = 'tiny-toast'; t.textContent = (typeof uiText === 'function') ? uiText(msg) : msg;
            document.body.appendChild(t);
            requestAnimationFrame(() => t.classList.add('show'));
            setTimeout(() => t.remove(), 1400);
        }

        function loadGame(id) {
            const saveData = savesData[id];
            if (!saveData || typeof saveData !== 'object' || Array.isArray(saveData)) {
                alert('這份存檔格式不正確，無法載入。');
                return;
 }
 currentSaveId = id;
 const fallbackScenario = scenarioPresets[activePresetId] || defaultPreset;
if (!saveData.scenario || typeof saveData.scenario !== 'object' || Array.isArray(saveData.scenario)) {
saveData.scenario = JSON.parse(JSON.stringify(fallbackScenario));
}
saveData.scenario = getCanonicalScenarioForSave(saveData.scenario);

if(saveData.scenario) {
                currentScenario = saveData.scenario; 
                if(!currentScenario.languageMode) currentScenario.languageMode = 'zh-tw';
                if(!currentScenario.gameDifficulty) currentScenario.gameDifficulty = 'standard';
                currentScenario.memoryNotesPaused = currentScenario.memoryNotesPaused === true;
                if(!currentScenario.playerStats) currentScenario.playerStats = {str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10};
                currentScenario.playerStats = normalizePlayerStats(currentScenario.playerStats);
                if(!Array.isArray(currentScenario.npcs)) {
                    currentScenario.npcs = [{ id: 'npc_legacy', name: currentScenario.targetName || '未知目標', avatar: currentScenario.targetAvatar || emptyAvatar, details: { age: '', speech: '', likes: '', dislikes: '', app: '', bg: currentScenario.targetPersona || '' }, affection: saveData.love !== undefined ? saveData.love : 0 }];
                } else {
                    currentScenario.npcs = currentScenario.npcs.filter(n => n && typeof n === 'object' && !Array.isArray(n));
                    currentScenario.npcs.forEach(n => { if (n.affection === undefined) n.affection = saveData.love !== undefined ? saveData.love : 0; if(!n.details || typeof n.details !== 'object') n.details = { age: '', speech: '', likes: '', dislikes: '', app: '', bg: n.persona || '' }; });
                    if (!currentScenario.npcs.length) currentScenario.npcs.push({ id: 'npc_imported', name: '新角色', avatar: emptyAvatar, affection: 0, details: { age: '', speech: '', likes: '', dislikes: '', app: '', bg: '' } });
                }
                if(!Array.isArray(currentScenario.scenarios)) {
                    currentScenario.scenarios = [];
                    if(currentScenario.world1) currentScenario.scenarios.push({name: currentScenario.world1, lore: currentScenario.worldLore||'', npcRoles:'', playerRole:''});
                    if(currentScenario.world2) currentScenario.scenarios.push({name: currentScenario.world2, lore: '', npcRoles:'', playerRole:''});
                    if(currentScenario.scenarios.length === 0) currentScenario.scenarios.push({name: '預設場景', lore: '', npcRoles:'', playerRole:''});
                } else {
                    currentScenario.scenarios = currentScenario.scenarios.filter(sc => sc && typeof sc === 'object' && !Array.isArray(sc));
                    currentScenario.scenarios.forEach(sc => {
                        if(sc.npcRoles === undefined) sc.npcRoles = sc.targetRole || '';
                        if(sc.playerRole === undefined) sc.playerRole = '';
                        if(sc.transitionRule === undefined) sc.transitionRule = '';
                    });
                    if (!currentScenario.scenarios.length) currentScenario.scenarios.push({name: '預設場景', lore: '', npcRoles: '', playerRole: '', transitionRule: ''});
                }
            }
            
            chatScripts = Array.isArray(saveData.scripts)
                ? saveData.scripts.map(page => Array.isArray(page) ? page.map(line => valueToText(line)).filter(Boolean) : [])
                : [];
            if(chatScripts.length === 0 && Array.isArray(saveData.script)) { chatScripts = [saveData.script.map(line => valueToText(line)).filter(Boolean)]; }
            if(chatScripts.length === 0) { chatScripts = [[]]; }

            currentScenarioIndex = saveData.scenIndex || 0;
            if (currentScenarioIndex >= currentScenario.scenarios.length) currentScenarioIndex = 0;
            currentChatPageIndex = saveData.chatPageIndex !== undefined ? saveData.chatPageIndex : currentScenarioIndex;
            if (currentChatPageIndex >= currentScenario.scenarios.length) currentChatPageIndex = currentScenarioIndex;
            if (currentChatPageIndex !== currentScenarioIndex) currentChatPageIndex = currentScenarioIndex;
            pendingSceneTransition = normalizeSceneTransition(saveData.sceneTransition);
            if (pendingSceneTransition && pendingSceneTransition.toIndex !== currentScenarioIndex) pendingSceneTransition = null;
            
            currentScenario.scenarios.forEach((_, i) => {
                if (!chatScripts[i]) chatScripts[i] = [];
            });

            currentHp = normalizeSurvivalValue(saveData.hp, 100);
            currentSan = normalizeSurvivalValue(saveData.san, 100);
            currentItems = Array.isArray(saveData.items) ? saveData.items.map(item => valueToText(item)).filter(Boolean) : [];
            currentAdventureLog = formatBulletListText(saveData.log, "• 故事剛開始，目前尚無重大事件發生。");
            const memoryBrief = saveData.memoryBrief && typeof saveData.memoryBrief === 'object' ? saveData.memoryBrief : {};
            currentStorySummary = formatBulletListText(memoryBrief.story, '', true);
            currentOpenTasks = serializeTaskChecklist(memoryBrief.tasks);
            currentRelationshipSummary = formatBulletListText(memoryBrief.relationships, '', true);
            currentFlags = Array.isArray(saveData.flags) ? saveData.flags.map(flag => valueToText(flag)).filter(Boolean) : [];
            const playerInput = document.getElementById('player-input');
            const lightweightDraft = localStorage.getItem(getInputDraftStorageKey(id));
            playerInput.value = lightweightDraft !== null ? lightweightDraft : valueToText(saveData.inputDraft);
            adjustInputHeight();
            const loadSurvivalOutcome = resolveSurvivalOutcome();
            if (loadSurvivalOutcome.rescued || loadSurvivalOutcome.gameOver) saveCurrentProgress();

            document.getElementById('ui-hp').innerText = currentHp; document.getElementById('ui-san').innerText = currentSan; document.getElementById('ui-target-typing').innerText = window.uiMessage ? window.uiMessage('引擎 (DM)') : '引擎 (DM)';
            
            const locSelect = document.getElementById('btn-location'); locSelect.innerHTML = '';
            currentScenario.scenarios.forEach((sc, i) => {
                const opt = document.createElement('option'); opt.value = i; opt.innerText = `📍 ${sc.name}`;
                if(i === currentScenarioIndex) opt.selected = true; locSelect.appendChild(opt);
            });
            
 ensureGameModelSelectReady();
 setSelectValueWithFallback(document.getElementById('game-model-choice'), selectedModel);
 document.getElementById('dialogue-box').innerHTML = ''; document.getElementById('options-area').innerHTML = '';
document.getElementById('setup-screen').style.display = 'none'; document.getElementById('save-menu-screen').style.display = 'none'; document.getElementById('game-container').style.display = 'flex';
            
            renderChatPage(currentChatPageIndex);
            
            const msgBox = document.getElementById('dialogue-box'); 
            const loadedText = window.uiMessage ? window.uiMessage('— 遊戲紀錄已載入 —') : '— 遊戲紀錄已載入 —';
            const sysMsg = document.createElement('div'); sysMsg.className = 'system-msg'; sysMsg.innerText = loadedText; msgBox.appendChild(sysMsg); msgBox.scrollTop = msgBox.scrollHeight;

            const input = document.getElementById('player-input');
            input.disabled = false;
            document.getElementById('send-btn').disabled = false;
            document.getElementById('dice-btn').disabled = false;
            setCreatorInputMode(false, false);
            if (!applyGameOverUi()) input.focus();
        }

        function selectOption(text, check = '', difficulty = 'normal') {
            const inputEl = document.getElementById('player-input');
            inputEl.value = text;
            inputEl.dataset.diceSuggestedText = text;
            inputEl.dataset.diceStat = check;
            inputEl.dataset.diceDifficulty = difficulty;
            adjustInputHeight();
            inputEl.focus();
        }

        function normalizeGameDifficulty(value) {
            return GAME_DIFFICULTIES[value] ? value : 'standard';
        }

        function getGameDifficultyInfo() {
            const key = normalizeGameDifficulty(currentScenario?.gameDifficulty);
            return { key, ...GAME_DIFFICULTIES[key] };
        }

        function getSurvivalDiceModifier(statKey) {
            let modifier = 0;
            if (currentHp <= 20 && ['str', 'dex', 'con'].includes(statKey)) modifier -= 2;
            if (currentSan <= 20 && ['int', 'wis', 'cha'].includes(statKey)) modifier -= 2;
            return modifier;
        }

        function calculateDiceCheck(statKey, difficultyKey = 'normal', forcedRoll = null, options = {}) {
            const statInfo = DICE_STATS[statKey];
            const difficulty = DICE_DIFFICULTIES[difficultyKey] || DICE_DIFFICULTIES.normal;
            const gameDifficulty = getGameDifficultyInfo();
            const stats = options.stats || currentScenario?.playerStats || {};
            const rawScore = Number(stats?.[statKey] ?? 10);
            const score = Number.isFinite(rawScore) ? Math.round(rawScore) : 10;
            const abilityModifier = Math.floor((score - 10) / 2);
            const survivalModifier = options.applySurvivalModifier === false ? 0 : getSurvivalDiceModifier(statKey);
            const proficiencyModifier = options.proficient === true ? 2 : 0;
            const totalModifier = abilityModifier + survivalModifier + proficiencyModifier;
            const dcMin = Number.isFinite(difficulty.dcMin) ? difficulty.dcMin : difficulty.dc;
            const dcMax = Number.isFinite(difficulty.dcMax) ? difficulty.dcMax : difficulty.dc;
            const baseDc = Math.floor(Math.random() * (Math.max(dcMin, dcMax) - Math.min(dcMin, dcMax) + 1)) + Math.min(dcMin, dcMax);
            const dc = Math.max(2, Math.min(30, baseDc + gameDifficulty.dcModifier));
            const roll = forcedRoll === null ? Math.floor(Math.random() * 20) + 1 : Math.max(1, Math.min(20, Math.round(forcedRoll)));
            const total = roll + totalModifier;
            let result = total >= dc ? '成功' : '失敗';
            if (roll === 20) result = '大成功';
            else if (roll === 1) result = '大失敗';
            return {
                statKey,
                code: statInfo.code,
                label: statInfo.label,
                score,
                abilityModifier,
                difficultyKey,
                difficultyLabel: difficulty.label,
                difficultyDc: baseDc,
                gameDifficultyKey: gameDifficulty.key,
                gameDifficultyLabel: gameDifficulty.label,
                gameDifficultyDcModifier: gameDifficulty.dcModifier,
                survivalModifier,
                proficiencyModifier,
                totalModifier,
                dc,
                roll,
                total,
                result,
                scope: options.scope || 'player'
            };
        }

        function normalizeDiceStatKey(value) {
            const clean = valueToText(value).toLowerCase();
            const aliases = {
                str: 'str', strength: 'str', '力量': 'str',
                dex: 'dex', dexterity: 'dex', '敏捷': 'dex',
                con: 'con', constitution: 'con', '體質': 'con', '体质': 'con',
                int: 'int', intelligence: 'int', '智力': 'int',
                wis: 'wis', wisdom: 'wis', '感知': 'wis',
                cha: 'cha', charisma: 'cha', '魅力': 'cha'
            };
            return aliases[clean] || '';
        }

        function normalizeDiceDifficulty(value) {
            const clean = valueToText(value).toLowerCase();
            const aliases = {
                trivial: 'trivial', '超簡單': 'trivial', '超简单': 'trivial', '極簡單': 'trivial', '极简单': 'trivial', 'very easy': 'trivial', veryeasy: 'trivial',
                easy: 'easy', '簡單': 'easy', '简单': 'easy',
                normal: 'normal', medium: 'normal', '普通': 'normal',
                hard: 'hard', '困難': 'hard', '困难': 'hard',
                extreme: 'extreme', '極難': 'extreme', '极难': 'extreme'
            };
            return aliases[clean] || 'normal';
        }

        async function classifyDiceCheck(playerText, options = {}) {
            const stats = options.stats || currentScenario.playerStats || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
            const scene = currentScenario.scenarios?.[currentScenarioIndex] || {};
            const actorLabel = options.actorLabel || '玩家';
            const profList = Array.isArray(options.proficiencies) ? options.proficiencies.map(v => valueToText(v).trim()).filter(Boolean) : [];
            const profBlock = profList.length ? `\n這名角色已確立的擅長領域（僅供判斷是否熟練）：${profList.join('、')}\n- 若本次行動明顯屬於上述任一擅長領域，proficient 設 true；否則 false。不要因為想幫玩家就寬鬆給 true。` : '';
            const prompt = `你是 TRPG 檢定分類器。只判斷這個行動最適合哪一項六屬性與難度，不要擲骰、不要判斷成功失敗，也不要因為某項數值較高就偏袒它。

判定對象：${actorLabel}
判定內容：${playerText}
目前情境：${scene.name || '未命名'}
情境法則：${scene.lore || '無特殊設定'}
參考六屬：STR ${stats.str}, DEX ${stats.dex}, CON ${stats.con}, INT ${stats.int}, WIS ${stats.wis}, CHA ${stats.cha}

選擇原則：
- STR 力量：搬動、破壞、壓制、純肌力。
- DEX 敏捷：閃避、潛行、精細操作、反應速度。
- CON 體質：忍耐、抵抗毒病疲勞、維持體力。
- INT 智力：知識、推理、破解、分析技術。
- WIS 感知：觀察、直覺、洞察、追蹤與察覺。
- CHA 魅力：說服、欺瞞、威嚇、表演與社交影響。
- 難度只能是 trivial、easy、normal、hard、extreme。難度反映「這個嘗試有多可能如願」，不是失敗有多嚴重；就算是和平的日常，只要結果有懸念（逗對方、討好、表演、抓準時機、碰運氣等），也該給 normal 以上，讓成敗保持不確定、偶爾出包才有趣。依這個世界觀與情境判斷相對難度，不要套用特定題材的固定假設。
- trivial 超簡單：任何人都能輕鬆完成、幾乎不可能失手的純粹瑣事。
- easy 簡單：多半會成，但仍有一點小變數。
- normal 普通：結果真的不一定，需要技巧、判斷或運氣，成敗有明顯懸念。
- hard 困難：成功機率偏低，需要相當本事、巧思或有利時機，或要突破對方防備。
- extreme 極難：成功機率很低，得靠高超本事加上運氣，或條件極度不利。${profBlock}

只輸出 JSON：{"attribute":"str|dex|con|int|wis|cha","difficulty":"trivial|easy|normal|hard|extreme","proficient":true|false,"reason":"30字內理由"}`;
            const rawText = await requestAIText(prompt, { kind: 'dice', maxTokens: 190 });
            let parsed;
            try { parsed = JSON.parse(extractJsonText(rawText)); }
            catch (error) { throw new Error('AI 無法辨識這次檢定屬性，請稍後重試。'); }
            const statKey = normalizeDiceStatKey(parsed.attribute || parsed.stat || parsed.ability);
            if (!DICE_STATS[statKey]) throw new Error('AI 沒有回傳有效的六屬性檢定。');
            return {
                statKey,
                difficultyKey: normalizeDiceDifficulty(parsed.difficulty),
                proficient: profList.length ? parsed.proficient === true : false,
                reason: valueToText(parsed.reason, '依玩家行動判定')
            };
        }

        function buildDiceSummary(check, isNarratorDice) {
            const lang = (typeof getUiLanguage === 'function') ? getUiLanguage() : 'zh-TW';
            const STAT_NAMES = {
                str: { 'zh-TW': '力量', ja: '筋力' }, dex: { 'zh-TW': '敏捷', ja: '敏捷' },
                con: { 'zh-TW': '體質', ja: '体力' }, int: { 'zh-TW': '智力', ja: '知力' },
                wis: { 'zh-TW': '感知', ja: '感知' }, cha: { 'zh-TW': '魅力', ja: '魅力' }
            };
            const RESULTS = {
                '大成功': { en: 'Crit!', ja: '大成功' }, '成功': { en: 'Success', ja: '成功' },
                '失敗': { en: 'Fail', ja: '失敗' }, '大失敗': { en: 'Fumble', ja: '大失敗' }
            };
            const statName = (lang === 'en') ? '' : ((STAT_NAMES[check.statKey] && STAT_NAMES[check.statKey][lang === 'ja' ? 'ja' : 'zh-TW']) || check.label || '');
            const statPart = statName ? `${check.code} ${statName}` : check.code;
            const resultWord = (lang === 'zh-TW') ? check.result : ((RESULTS[check.result] && RESULTS[check.result][lang]) || check.result);
            const signed = check.totalModifier >= 0 ? `+${check.totalModifier}` : String(check.totalModifier);
            let summary = `${statPart}｜${resultWord}｜${check.roll}${signed}=${check.total}／DC${check.dc}`;
            if (isNarratorDice) {
                summary = `NPC｜${summary}`;
            }
            return summary;
        }

        function stripHardDiceDirective(text) {
            return valueToText(text).replace(/\n?\(系統硬判定：[\s\S]*?AI 不得更改。\)/, '').trim();
        }

        function getResurrectionIntent(text) {
            const cleanText = stripHardDiceDirective(text);
            if (!/(復活|復生|起死回生|死而復生|救活|救回.*(生命|性命)|讓.*活過來|使.*活過來|喚回.*靈魂|召回.*靈魂|喚回亡者|帶回人世|逆轉.*死亡|改變.*死亡|打破.*死亡)/.test(cleanText)) return null;
            const researchOnly = /(調查|詢問|研究|尋找|查明|了解|討論|蒐集|收集).{0,10}(復活|復生|死亡)/.test(cleanText)
                && !/(嘗試|試圖|開始|進行|施展|發動|啟動|強行|立刻|現在|我要|我試著|讓|使|將|把).{0,16}(復活|復生|起死回生|救活|救回|活過來|喚回|召回|帶回人世|逆轉|改變|打破)/.test(cleanText);
            if (researchOnly) return null;
            const deadNpcs = (currentScenario?.npcs || []).filter(isNpcDead);
            const namedNpc = deadNpcs.find(npc => cleanText.includes(valueToText(npc.name)));
            const npc = namedNpc || (deadNpcs.length === 1 ? deadNpcs[0] : null);
            return npc ? { npc, text: cleanText } : null;
        }

        function parseHardDiceOutcome(text) {
            const match = valueToText(text).match(/結果【(大成功|成功|失敗|大失敗)】/);
            if (!match) return null;
            return { result: match[1], success: match[1] === '成功' || match[1] === '大成功' };
        }

        function enforceResurrectionOptionRules(option) {
            const intent = getResurrectionIntent(option?.text);
            if (!intent) return option;
            const difficulty = normalizeGameDifficulty(currentScenario?.gameDifficulty);
            if (difficulty === 'nightmare' || isNpcRevivePermanentlyLocked(intent.npc)) return null;
            if (difficulty === 'hard') {
                const rank = { trivial: -1, easy: 0, normal: 1, hard: 2, extreme: 3 };
                return {
                    ...option,
                    check: DICE_STATS[option.check] ? option.check : 'wis',
                    difficulty: (rank[option.difficulty] ?? 1) < rank.hard ? 'hard' : option.difficulty
                };
            }
            return option;
        }

        function recordResurrectionOutcome(eventText) {
            currentAdventureLog = mergeAdventureLog(currentAdventureLog, eventText);
            applyAutomaticMemoryUpdate({ story_summary: [eventText] });
            createSystemAlert(eventText);
        }

        function resolveProgrammedResurrectionAction(playerText, inputContext) {
            const intent = getResurrectionIntent(playerText);
            if (!intent) return { handled: false, extraPrompt: '' };
            const difficulty = normalizeGameDifficulty(currentScenario?.gameDifficulty);
            if (difficulty === 'standard' && inputContext.mode === 'creator') {
                if (!reviveNpc(intent.npc, '「神」介入復活')) return { handled: false, extraPrompt: '' };
                const eventText = `${intent.npc.name} 在創作者指令介入下恢復存活`;
                recordResurrectionOutcome(eventText);
                return { handled: true, success: true, npc: intent.npc, extraPrompt: `【程式已確認復活】${eventText}。請承接此結果演出，不得再次改變。` };
            }
            if (difficulty !== 'hard') return { handled: false, extraPrompt: '' };
            const outcome = parseHardDiceOutcome(playerText);
            if (!outcome) return { handled: false, extraPrompt: '' };
            if (outcome.success) {
                if (!reviveNpc(intent.npc, '困難模式復活檢定成功', { allowHardSuccess: true })) return { handled: false, extraPrompt: '' };
                const eventText = `${intent.npc.name} 的復活檢定成功，已恢復存活`;
                recordResurrectionOutcome(eventText);
                return { handled: true, success: true, npc: intent.npc, extraPrompt: `【復活硬判定結果】${eventText}。這是程式最終結果，必須演出成功，不得回傳 npc_revives 或改判。` };
            }
            lockFailedNpcRevival(intent.npc, `復活檢定${outcome.result}`);
            const eventText = `${intent.npc.name} 的復活檢定失敗，已永久失去復活機會`;
            recordResurrectionOutcome(eventText);
            return { handled: true, success: false, npc: intent.npc, extraPrompt: `【復活硬判定結果】${eventText}。這是程式最終結果，必須演出失敗；禁止復活、禁止提供新的復活選項。` };
        }

        async function sendDiceChoice() {
            if (getCurrentGameOver()) { applyGameOverUi(); return; }
            const inputEl = document.getElementById('player-input');
            const playerText = inputEl.value.trim();
            if (!playerText) { alert('請先輸入你打算做什麼，再來擲骰子喔！'); return; }
            if (creatorInputArmed) {
                alert('「神」模式是創作者指令，不使用玩家六圍。請按一般發送。');
                return;
            }
            const inputContext = parseSceneInputContext(stripHardDiceDirective(playerText));
            if (inputContext.mode === 'creator') {
                alert('「神」模式是創作者指令，不使用玩家六圍。請按一般發送。');
                return;
            }
            const isNarratorDice = inputContext.mode === 'narrator';
            const neutralNpcStats = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };

            const suggestedText = inputEl.dataset.diceSuggestedText || '';
            const suggestedStat = normalizeDiceStatKey(inputEl.dataset.diceStat);
            const hasValidSuggestion = suggestedText === playerText && DICE_STATS[suggestedStat];
            inputEl.disabled = true;
            document.getElementById('send-btn').disabled = true;
            document.getElementById('dice-btn').disabled = true;
            document.getElementById('ui-target-typing').innerText = window.uiMessage ? window.uiMessage('判定引擎') : '判定引擎';
            document.getElementById('loading').style.display = 'block';

            try {
                let classification = hasValidSuggestion
                    ? {
                        statKey: suggestedStat,
                        difficultyKey: normalizeDiceDifficulty(inputEl.dataset.diceDifficulty),
                        reason: '採用行動選項的預設檢定'
                    }
                    : await classifyDiceCheck(playerText, isNarratorDice ? { stats: neutralNpcStats, actorLabel: 'NPC／旁白支線' } : { proficiencies: currentScenario?.playerProficiencies });
                const resurrectionIntent = getResurrectionIntent(playerText);
                if (resurrectionIntent && normalizeGameDifficulty(currentScenario?.gameDifficulty) === 'hard') {
                    if (isNpcRevivePermanentlyLocked(resurrectionIntent.npc)) throw new Error('這名 NPC 的復活機會已經失敗，無法再次嘗試。');
                    const rank = { trivial: -1, easy: 0, normal: 1, hard: 2, extreme: 3 };
                    if ((rank[classification.difficultyKey] ?? 1) < rank.hard) classification.difficultyKey = 'hard';
                    classification.reason = `困難模式復活檢定：${resurrectionIntent.npc.name}`;
                }
                const check = calculateDiceCheck(
                    classification.statKey,
                    classification.difficultyKey,
                    null,
                    isNarratorDice ? { stats: neutralNpcStats, applySurvivalModifier: false, scope: 'narrator' } : { proficient: classification.proficient }
                );
                const signedAbility = check.abilityModifier >= 0 ? `+${check.abilityModifier}` : String(check.abilityModifier);
                const signedTotal = check.totalModifier >= 0 ? `+${check.totalModifier}` : String(check.totalModifier);
                const gameDifficultyText = check.gameDifficultyDcModifier ? `｜遊戲難度 ${check.gameDifficultyLabel}：DC +${check.gameDifficultyDcModifier}` : `｜遊戲難度 ${check.gameDifficultyLabel}`;
                const survivalText = check.survivalModifier ? `｜生存狀態修正 ${check.survivalModifier}` : '';
                const proficiencyText = check.proficiencyModifier ? `｜熟練 +${check.proficiencyModifier}` : '';
                const scopeText = isNarratorDice ? '｜NPC／旁白支線判定，不得套用玩家 HP/SAN 或好感' : '';
                const diceReason = `${classification.reason}${scopeText}`;
                classification.reason = diceReason;
                const directive = `(系統硬判定：${check.code} ${check.label}｜屬性 ${check.score}（加值 ${signedAbility}）｜行動難度 ${check.difficultyLabel}：基礎 DC ${check.difficultyDc}${gameDifficultyText}${survivalText}${proficiencyText}｜最終 DC ${check.dc}｜D20 ${check.roll} ${signedTotal} = ${check.total}｜結果【${check.result}】｜判定理由：${classification.reason}。此結果由程式計算，AI 不得更改。)`;
                pendingDiceSummary = buildDiceSummary(check, isNarratorDice);
                inputEl.value = `${playerText}\n${directive}`;
                document.getElementById('ui-target-typing').innerText = window.uiMessage ? window.uiMessage('引擎 (DM)') : '引擎 (DM)';
                await sendChoice();
            } catch (error) {
                pendingDiceSummary = null;
                inputEl.disabled = false;
                document.getElementById('send-btn').disabled = false;
                document.getElementById('dice-btn').disabled = false;
                document.getElementById('loading').style.display = 'none';
                document.getElementById('ui-target-typing').innerText = window.uiMessage ? window.uiMessage('引擎 (DM)') : '引擎 (DM)';
                inputEl.focus();
                alert(getFriendlyErrorMessage(error, '無法完成屬性判定，請稍後再試。'));
            }
        }

        function adjustInputHeight() { const input = document.getElementById('player-input'); if(!input) return; input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 100) + "px"; }

        function checkInputKey(e) { adjustInputHeight(); const isMobile = window.innerWidth <= 600; if (!isMobile) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChoice(); } } }

        function applyMemoryNoteControlCommand(text) {
            const commandPattern = /[［\[【]\s*(暫停追加|恢復追加)\s*[］\]】]/g;
            let lastCommand = '';
            const cleanedText = valueToText(text).replace(commandPattern, (match, command) => {
                lastCommand = command;
                return '';
            }).replace(/\s{2,}/g, ' ').trim();

            if (!lastCommand) return { text: valueToText(text).trim(), handled: false, paused: currentScenario.memoryNotesPaused === true };

            const paused = lastCommand === '暫停追加';
            currentScenario.memoryNotesPaused = paused;
            createSystemNote(paused
                ? '重要紀錄：已暫停 AI 自動追加（仍可在面板手動修改）'
                : '重要紀錄：已恢復 AI 自動追加');
            return { text: cleanedText, handled: true, paused };
        }

        function sceneUsesNarratorDefinition(scene = currentScenario.scenarios?.[currentScenarioIndex] || {}) {
            const playerRole = valueToText(scene?.playerRole);
            const transitionRule = valueToText(scene?.transitionRule);
            const combined = `${playerRole}
${transitionRule}`;
            const narratorRole = /輔助旁白|場外旁白|旁白視角|旁白模式|創作者視角|導演視角|觀察者視角/.test(combined);
            const playerName = valueToText(currentScenario.playerName);
            const mentionsPlayer = /玩家|主角|player/i.test(combined) || (playerName && combined.includes(playerName));
            const explicitAbsence = /不在場|目前不在|暫時不在|離線|離場|缺席|未登場|尚未登場|場外/.test(combined);
            return narratorRole || (mentionsPlayer && explicitAbsence);
        }

        function getSceneParticipationMode(scene = currentScenario.scenarios?.[currentScenarioIndex] || {}) {
            if (scene?.runtimePlayerPresence === 'present') return 'character';
            if (scene?.runtimePlayerPresence === 'absent') return 'narrator';
            return sceneUsesNarratorDefinition(scene) ? 'narrator' : 'character';
        }

        function normalizeModeSwitchCommandText(text) {
            return valueToText(text)
                .trim()
                .replace(/^\s*[［\[【]\s*/, '')
                .replace(/\s*[］\]】]\s*$/, '')
                .trim();
        }

        function getLocalModeSwitchType(text) {
            const command = normalizeModeSwitchCommandText(text);
            if (!command) return '';
            if (/^(?:switch\s+(?:to\s+)?)?(?:narrator|narrator\s+mode)$/i.test(command)) return 'narrator';
            if (/^(?:switch\s+(?:to\s+)?)?(?:player|player\s+mode)$/i.test(command)) return 'player';
            if (/^(?:ナレーター(?:に|へ)?切替|ナレーター(?:に|へ)?切り替え|ナレーターモード)$/.test(command)) return 'narrator';
            if (/^(?:プレイヤー(?:に|へ)?切替|プレイヤー(?:に|へ)?切り替え|プレイヤーモード)$/.test(command)) return 'player';
            if (/^(?:切換|切到|切成|改成|改為|轉成|轉換為)?\s*(?:輔助旁白|旁白模式|輔助旁白模式|旁白|導演模式|創作者視角)$/.test(command)) return 'narrator';
            if (/^(?:切回|切換為|切換|回到|恢復|改回|轉回)?\s*(?:玩家|玩家模式|角色行動|角色行動模式)$/.test(command)) return 'player';
            if (/^(?:玩家登入|玩家回來|玩家回歸|玩家登場|玩家上線|恢復玩家模式|回到玩家模式|恢復角色行動|普通輸入恢復角色行動)$/.test(command)) return 'player';
            if (/^(?:玩家離場|玩家退場|玩家離線|玩家不在場|切換為輔助旁白|切換輔助旁白|切到輔助旁白|切換旁白|切到旁白)$/.test(command)) return 'narrator';
            return '';
        }

        function parseSceneInputContext(text, scene = currentScenario.scenarios?.[currentScenarioIndex] || {}) {
            const rawText = valueToText(text).trim();
            const creatorPattern = /^\s*[［\[【]\s*創作者指令\s*[］\]】]\s*/i;
            if (creatorPattern.test(rawText)) {
                const content = rawText.replace(creatorPattern, '').trim();
                return { mode: 'creator', content, rawText, explicit: true, localOnly: Boolean(getLocalModeSwitchType(content)) };
            }
            const shortcutModeSwitch = getLocalModeSwitchType(rawText);
            if (shortcutModeSwitch) {
                return { mode: 'creator', content: normalizeModeSwitchCommandText(rawText), rawText, explicit: true, localOnly: true };
            }
            const mode = getSceneParticipationMode(scene);
            return { mode, content: rawText, rawText, explicit: false, localOnly: false };
        }

        function applyCreatorPresenceDirective(context) {
            if (context?.mode !== 'creator' || !context.content) return '';
            const scene = currentScenario.scenarios?.[currentScenarioIndex];
            if (!scene) return '';
            const playerName = valueToText(currentScenario.playerName);
            const content = normalizeModeSwitchCommandText(context.content);
            const notices = [];
            const directModeSwitch = getLocalModeSwitchType(content);

            if (directModeSwitch === 'narrator') {
                scene.runtimeGuideRole = '輔助旁白';
                scene.runtimePlayerPresence = 'absent';
                if (typeof setCreatorInputMode === 'function') setCreatorInputMode(false, false);
                notices.push(`已切換為輔助旁白模式；玩家角色 ${playerName} 不預設在場`);
                return notices.join('；');
            }
            if (directModeSwitch === 'player') {
                scene.runtimePlayerPresence = 'present';
                delete scene.runtimeGuideRole;
                if (typeof setCreatorInputMode === 'function') setCreatorInputMode(false, false);
                notices.push(`玩家角色 ${playerName} 已設為在場；後續普通輸入恢復角色行動模式`);
                return notices.join('；');
            }

            const mentionsPlayer = /玩家|主角|player/i.test(content) || (playerName && content.includes(playerName));
            const guideMatch = content.match(/(?:轉換為|切換為|切到|改為|成為)\s*([^，。；\n]{1,24})/);
            const guideRole = guideMatch ? valueToText(guideMatch[1]).replace(/角色$/, '').trim() : '';

            if (guideRole && /引導|旁白|導演|NPC|配角|角色/.test(guideRole)) {
                scene.runtimeGuideRole = guideRole;
                scene.runtimePlayerPresence = 'absent';
                if (typeof setCreatorInputMode === 'function') setCreatorInputMode(false, false);
                notices.push(`操作者已轉換為「${guideRole}」引導身分；原玩家角色不預設在場`);
            }

            if (mentionsPlayer) {
                const absenceNow = /目前.{0,8}不在|仍然?.{0,6}(?:離線|不在)|暫時.{0,6}不在|尚未回歸|離線|離場|退場|不在場/.test(content);
                const returnNow = /回到現場|現在.{0,6}回歸|重新.{0,6}(?:登場|上線)|回來了|讓.{0,12}回來|加入.{0,8}(?:現場|支線)|正式登場|玩家.{0,4}(?:登入|回來|回歸|登場|上線)|(?:切回|回到|恢復|改回|轉回).{0,4}(?:玩家|玩家模式|角色行動)|普通輸入.{0,8}恢復(?:角色行動|玩家)/.test(content);
                if (absenceNow) {
                    scene.runtimePlayerPresence = 'absent';
                    if (typeof setCreatorInputMode === 'function') setCreatorInputMode(false, false);
                    notices.push(`玩家角色 ${playerName} 已設為不在場；後續普通輸入採輔助旁白模式`);
                } else if (returnNow) {
                    scene.runtimePlayerPresence = 'present';
                    delete scene.runtimeGuideRole;
                    if (typeof setCreatorInputMode === 'function') setCreatorInputMode(false, false);
                    notices.push(`玩家角色 ${playerName} 已設為在場；後續普通輸入恢復角色行動模式`);
                }
            }
            return notices.join('；');
        }

        function buildSceneParticipationInstruction(scene = currentScenario.scenarios?.[currentScenarioIndex] || {}) {
            if (getSceneParticipationMode(scene) === 'narrator') {
                const guideRole = valueToText(scene?.runtimeGuideRole);
                const guideText = guideRole ? `操作者目前以「${guideRole}」身分引導場景。` : '操作者目前是輔助旁白／導演。';
                return `【場景視角與在場規則】${guideText}玩家角色 ${currentScenario.playerName} 不預設在場。普通輸入不得解讀為玩家角色說話或行動。只有當前指令或既有紀錄明確建立「回歸、登場、上線或回到現場」後，才能讓玩家角色出現。`;
            }
            return `【場景視角與在場規則】玩家角色 ${currentScenario.playerName} 預設在場，普通輸入視為角色行動；標有［創作者指令］的內容仍是角色外最高權限指示。`;
        }

        function updatePlayerInputPlaceholder() {
            const input = document.getElementById('player-input');
            if (!input) return;
            if (creatorInputArmed) {
                input.placeholder = window.uiMessage ? window.uiMessage('輸入本回合的創作者指令...') : '輸入本回合的創作者指令...';
                return;
            }
            const placeholder = getSceneParticipationMode() === 'narrator'
                ? '輸入輔助旁白，或點「神」下達創作者指令...'
                : '輸入角色行動，或點「神」下達創作者指令...';
            input.placeholder = window.uiMessage ? window.uiMessage(placeholder) : placeholder;
        }

        function setCreatorInputMode(enabled, focusInput = true) {
            creatorInputArmed = Boolean(enabled);
            const button = document.getElementById('creator-mode-btn');
            if (button) {
                button.classList.toggle('active', creatorInputArmed);
                button.setAttribute('aria-pressed', String(creatorInputArmed));
                const title = creatorInputArmed ? '關閉持續創作者指令模式' : '開啟持續創作者指令模式';
                button.title = window.uiMessage ? window.uiMessage(title) : title;
                if (!creatorInputArmed) button.blur();
            }
            updatePlayerInputPlaceholder();
            const input = document.getElementById('player-input');
            if (focusInput && input && !input.disabled) input.focus();
        }

        function toggleCreatorInputMode() {
            setCreatorInputMode(!creatorInputArmed);
        }

        async function sendChoice() {
            if (getCurrentGameOver()) { applyGameOverUi(); return; }
            const inputEl = document.getElementById('player-input'); const sendBtn = document.getElementById('send-btn'); const diceBtn = document.getElementById('dice-btn'); 
            const rawPlayerText = inputEl.value.trim(); if(!rawPlayerText) return;
            const memoryControl = applyMemoryNoteControlCommand(rawPlayerText);
            let playerText = memoryControl.text;
            if (creatorInputArmed && playerText && !/^\s*[［\[【]\s*創作者指令\s*[］\]】]/i.test(playerText)) {
                playerText = `［創作者指令］${playerText}`;
            }
            if (memoryControl.handled) {
                inputEl.value = '';
                inputEl.style.height = 'auto';
                delete inputEl.dataset.diceSuggestedText;
                delete inputEl.dataset.diceStat;
                delete inputEl.dataset.diceDifficulty;
                saveCurrentProgress();
                if (!playerText) { inputEl.focus(); return; }
            }
            const inputContext = parseSceneInputContext(stripHardDiceDirective(playerText));
            if (inputContext.mode === 'creator' && !inputContext.content) {
                inputEl.value = '';
                inputEl.style.height = 'auto';
                createSystemNote('創作者指令後方沒有內容，尚未送出給 AI');
                saveCurrentProgress();
                inputEl.focus();
                return;
            }
            const presenceUpdate = applyCreatorPresenceDirective(inputContext);
            if (presenceUpdate) {
                createSystemNote(presenceUpdate);
                updatePlayerInputPlaceholder();
                if (inputContext.localOnly || Boolean(getLocalModeSwitchType(inputContext.content))) {
                    inputEl.value = '';
                    inputEl.style.height = 'auto';
                    delete inputEl.dataset.diceSuggestedText;
                    delete inputEl.dataset.diceStat;
                    delete inputEl.dataset.diceDifficulty;
                    const options = document.getElementById('options-area');
                    if (options) options.innerHTML = '';
                    saveCurrentProgress();
                    inputEl.focus();
                    return;
                }
            }
            const suggestedStat = normalizeDiceStatKey(inputEl.dataset.diceStat);
            const shouldAutoRoll = inputContext.mode === 'character'
                && !playerText.includes('系統硬判定')
                && inputEl.dataset.diceSuggestedText === playerText
                && DICE_STATS[suggestedStat];
            const resurrectionIntent = getResurrectionIntent(playerText);
            if (resurrectionIntent) {
                const difficulty = normalizeGameDifficulty(currentScenario?.gameDifficulty);
                if (difficulty === 'nightmare') {
                    alert('極限模式的死亡永久成立，無法嘗試復活。');
                    return;
                }
                if (difficulty === 'hard') {
                    if (isNpcRevivePermanentlyLocked(resurrectionIntent.npc)) {
                        alert('這名 NPC 的復活檢定已經失敗，不能再次嘗試。');
                        return;
                    }
                    if (inputContext.mode !== 'character') {
                        alert('困難模式不能由「神」直接復活；必須以角色行動進行一次復活檢定。');
                        return;
                    }
                    const hasVerifiedResurrectionRoll = Boolean(pendingDiceSummary) && Boolean(parseHardDiceOutcome(playerText));
                    if (!hasVerifiedResurrectionRoll && !shouldAutoRoll) {
                        alert('困難模式的復活必須檢定。請按「擲骰」，成功才能復活；失敗後將永久無法再嘗試。');
                        return;
                    }
                }
            }
            if (shouldAutoRoll) { await sendDiceChoice(); return; }
            const diceSummary = pendingDiceSummary;
            pendingDiceSummary = null;
            const displayText = stripHardDiceDirective(playerText);

            inputEl.value = ""; inputEl.style.height = "auto"; inputEl.disabled = true; sendBtn.disabled = true; diceBtn.disabled = true;
            delete inputEl.dataset.diceSuggestedText;
            delete inputEl.dataset.diceStat;
            delete inputEl.dataset.diceDifficulty;
            document.getElementById('options-area').innerHTML = ''; document.getElementById('loading').style.display = 'block';

            if (inputContext.mode === 'creator') {
                appendCreatorInstruction('創作者指令', inputContext.content);
                chatScripts[currentChatPageIndex].push(`【創作者指令】：${inputContext.content}`);
            } else if (inputContext.mode === 'narrator') {
                appendCreatorInstruction('輔助旁白', inputContext.content);
                chatScripts[currentChatPageIndex].push(`【輔助旁白】：${inputContext.content}`);
            } else if(displayText.startsWith("（") || displayText.startsWith("(")) {
                chatScripts[currentChatPageIndex].push(`【旁白】：玩家行動 - ${playerText}`); appendNarrative(`玩家行動：\n${displayText}`);
            } else {
                appendMessage(currentScenario.playerName, displayText); chatScripts[currentChatPageIndex].push(`${currentScenario.playerName}：${playerText}`);
            }
            if (diceSummary) createSystemAlert(diceSummary);
            const manualAffectionUpdates = applyManualAffectionCommands(displayText);
            const manualAffectionPrompt = buildManualAffectionPrompt(manualAffectionUpdates);
            const manualAffectionNpcIds = manualAffectionUpdates.map(update => update.npcId);
            const resurrectionResolution = resolveProgrammedResurrectionAction(playerText, inputContext);
            const combinedSystemPrompt = [manualAffectionPrompt, resurrectionResolution.extraPrompt].filter(Boolean).join('\n\n');
            
            saveCurrentProgress();
            try {
                const protectedRevivedNpcIds = resurrectionResolution.success && resurrectionResolution.npc
                    ? [resurrectionResolution.npc.id || resurrectionResolution.npc.name]
                    : [];
                await callAI_JSON(combinedSystemPrompt, false, playerText, manualAffectionNpcIds, protectedRevivedNpcIds);
            } finally {
                const gameOver = getCurrentGameOver();
                inputEl.disabled = Boolean(gameOver);
                sendBtn.disabled = Boolean(gameOver);
                diceBtn.disabled = Boolean(gameOver);
                document.getElementById('loading').style.display = 'none';
                if (gameOver) applyGameOverUi();
                else inputEl.focus();
            }
        }

        function createSystemAlert(msg) {
            chatScripts[currentChatPageIndex].push(`\u3010\u7cfb\u7d71\u63d0\u793a\u3011\uff1a${msg}`);
            const displayMsg = window.uiSystemMessage ? window.uiSystemMessage(msg) : msg;
            const msgBox = document.getElementById('dialogue-box');
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert-msg';
            alertDiv.innerText = displayMsg;
            msgBox.appendChild(alertDiv);
            msgBox.scrollTop = msgBox.scrollHeight;
        }


        function createSystemNote(msg) {
            const formatted = `— ${msg} —`;
            chatScripts[currentChatPageIndex].push(`【系統提示】：${formatted}`);
            const displayMsg = window.uiSystemMessage ? window.uiSystemMessage(msg) : msg;
            const msgBox = document.getElementById('dialogue-box');
            const noteDiv = document.createElement('div');
            noteDiv.className = 'system-msg';
            noteDiv.innerText = `— ${displayMsg} —`;
            msgBox.appendChild(noteDiv);
            msgBox.scrollTop = msgBox.scrollHeight;
        }


        
let survivalFxGrainTimer = null;
let survivalFxAmbientTimer = null;
let survivalFxLastShardAt = 0;
let survivalFxLastSignalAt = 0;
let survivalFxActiveOption = null;
let survivalFxOptionState = new WeakMap();
let survivalFxOptionDelegated = false;
let survivalFxPointer = { x: 0, y: 0, active: false };
let survivalFxSeenInitialSignal = false;

function getSurvivalFxState() {
    const hp = normalizeSurvivalValue(currentHp, 100);
    const san = normalizeSurvivalValue(currentSan, 100);
    const hpSeverity = hp <= 20 ? Math.max(0, Math.min(1, (22 - hp) / 22)) : 0;
    const sanSeverity = san <= 20 ? Math.max(0, Math.min(1, (22 - san) / 22)) : 0;
    const severity = Math.max(hpSeverity, sanSeverity);
    return {
        hp,
        san,
        hpSeverity,
        sanSeverity,
        severity,
        active: severity > 0,
        zero: hp <= 0 || san <= 0
    };
}

function ensureSurvivalFxLayer() {
    let layer = document.getElementById('survival-effects-layer');
    if (!layer) {
        layer = document.createElement('div');
        layer.id = 'survival-effects-layer';
        layer.setAttribute('aria-hidden', 'true');
        layer.innerHTML = '<div class="survival-fx-darkness"></div><canvas id="survival-grain-canvas"></canvas><div class="survival-fx-scan"></div><div class="survival-fx-vignette"></div><div class="survival-fx-signals" id="survival-fx-signals"></div><div class="survival-fx-shards" id="survival-fx-shards"></div>';
        const gameContainer = document.getElementById('game-container');
        if (gameContainer && gameContainer.parentNode) gameContainer.parentNode.insertBefore(layer, gameContainer.nextSibling);
        else document.body.appendChild(layer);
    }
    return layer;
}

function resizeSurvivalGrainCanvas(canvas) {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    const width = Math.max(1, Math.floor(window.innerWidth * dpr * 0.72));
    const height = Math.max(1, Math.floor(window.innerHeight * dpr * 0.72));
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
    }
}

function drawSurvivalGrain() {
    const layer = document.getElementById('survival-effects-layer');
    const canvas = document.getElementById('survival-grain-canvas');
    if (!layer || !canvas || !document.body.classList.contains('survival-fx-active')) {
        survivalFxGrainTimer = null;
        return;
    }
    const state = getSurvivalFxState();
    resizeSurvivalGrainCanvas(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const image = ctx.createImageData(canvas.width, canvas.height);
    const data = image.data;
    const grainChance = 0.18 + state.severity * 0.28;
    for (let i = 0; i < data.length; i += 4) {
        const shade = 64 + Math.floor(Math.random() * 112);
        const warm = Math.random() < 0.36;
        data[i] = shade + (warm ? 8 : 0);
        data[i + 1] = shade + (warm ? 5 : 0);
        data[i + 2] = shade + Math.floor(Math.random() * 8);
        data[i + 3] = Math.random() < grainChance ? 7 + Math.floor(Math.random() * 22) : 0;
    }
    ctx.putImageData(image, 0, 0);
    survivalFxGrainTimer = window.setTimeout(drawSurvivalGrain, 90);
}

function startSurvivalGrain() {
    if (!survivalFxGrainTimer) drawSurvivalGrain();
}

function stopSurvivalGrain() {
    if (survivalFxGrainTimer) window.clearTimeout(survivalFxGrainTimer);
    survivalFxGrainTimer = null;
    const canvas = document.getElementById('survival-grain-canvas');
    const ctx = canvas && canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function survivalFxCleanText(value, max = 18) {
    const raw = typeof valueToText === 'function' ? valueToText(value) : String(value || '');
    return raw
        .replace(/[\r\n]+/g, ' ')
        .replace(/[‧•\-*#>「」『』【】\[\]（）()]/g, '')
        .replace(/\s+/g, '')
        .slice(0, max);
}

function getSurvivalSignalTexts() {
    const texts = [];
    if (Array.isArray(currentFlags)) currentFlags.forEach(flag => {
        const text = survivalFxCleanText(flag, 12);
        if (text) texts.push(text);
    });
    if (currentAdventureLog) {
        valueToText(currentAdventureLog).split(/[。！？；;\n]/).forEach(part => {
            const text = survivalFxCleanText(part, 12);
            if (text && !/尚無重大事件/.test(text)) texts.push(text);
        });
    }
    const scene = currentScenario && currentScenario.scenarios && currentScenario.scenarios[currentScenarioIndex];
    if (scene) {
        const sceneName = survivalFxCleanText(scene.name, 10);
        if (sceneName) texts.push(sceneName);
    }
    if (currentScenario && Array.isArray(currentScenario.npcs)) currentScenario.npcs.forEach(npc => {
        const name = survivalFxCleanText(npc && npc.name, 8);
        if (name) texts.push(name + '記録');
    });
    return texts.length ? texts : ['SAN0', 'LOG63', '記憶偏移', '關係錯位', '出口缺失'];
}

function createSurvivalSignal() {
    const state = getSurvivalFxState();
    if (!state.active) return;
    const wrap = document.getElementById('survival-fx-signals');
    if (!wrap) return;
    wrap.querySelectorAll('.survival-fx-signal').forEach(node => node.remove());

    const texts = getSurvivalSignalTexts();
    const text = texts[Math.floor(Math.random() * texts.length)] || 'LOG';
    const el = document.createElement('div');
    el.className = 'survival-fx-signal';
    [...text].forEach((ch, index) => {
        const span = document.createElement('span');
        span.className = 'sig-char';
        if (Math.random() < 0.22) span.classList.add('dim');
        if (Math.random() < 0.16) span.classList.add('hot');
        if (Math.random() < 0.10) span.classList.add('white');
        span.textContent = ch;
        span.style.setProperty('--sig-a', (0.46 + Math.random() * 0.42).toFixed(2));
        span.style.setProperty('--sig-blur', (Math.random() < 0.16 ? 0.65 : 0).toFixed(2) + 'px');
        span.style.setProperty('--sig-delay', (index * 26 + Math.random() * 70).toFixed(0) + 'ms');
        el.appendChild(span);
    });

    const zones = [
        ['left', '24px', 'top', (8 + Math.random() * 34).toFixed(1) + 'vh'],
        ['right', '28px', 'top', (8 + Math.random() * 34).toFixed(1) + 'vh'],
        ['left', '24px', 'top', (54 + Math.random() * 25).toFixed(1) + 'vh'],
        ['right', '28px', 'top', (54 + Math.random() * 25).toFixed(1) + 'vh'],
        ['left', (28 + Math.random() * 18).toFixed(1) + 'vw', 'top', (6 + Math.random() * 12).toFixed(1) + 'vh'],
        ['left', (48 + Math.random() * 16).toFixed(1) + 'vw', 'top', (14 + Math.random() * 48).toFixed(1) + 'vh'],
        ['left', (22 + Math.random() * 22).toFixed(1) + 'vw', 'top', (70 + Math.random() * 12).toFixed(1) + 'vh']
    ];
    const zone = zones[Math.floor(Math.random() * zones.length)];
    el.style[zone[0]] = zone[1];
    el.style[zone[2]] = zone[3];
    const dx = Math.random() * 6 - 3;
    const dy = Math.random() * 6 - 3;
    el.style.setProperty('--dx', dx.toFixed(1) + 'px');
    el.style.setProperty('--dy', dy.toFixed(1) + 'px');
    el.style.setProperty('--rdx', (-dx).toFixed(1) + 'px');
    el.style.setProperty('--rdy', (-dy).toFixed(1) + 'px');
    const life = 3000 + Math.random() * 1000 + state.severity * 500;
    el.style.setProperty('--survival-signal-life', life.toFixed(0) + 'ms');
    wrap.appendChild(el);
    window.setTimeout(() => el.remove(), life + 140);
}


function survivalFxExtractLines(value, maxLines = 8, maxLength = 34) {
    const raw = typeof valueToText === 'function' ? valueToText(value) : String(value || '');
    return raw
        .split(/[\n。！？；;]+/)
        .map(line => line.replace(/^[\s‧•\-*#>]+/, '').replace(/\s+/g, ' ').trim())
        .filter(line => line && !/尚無重大事件|故事剛開始|目前尚無/.test(line))
        .map(line => line.length > maxLength ? line.slice(0, maxLength - 1) + '…' : line)
        .slice(0, maxLines);
}

function getSurvivalDoubtFragments() {
    const fragments = [];
    survivalFxExtractLines(currentAdventureLog, 8, 34).forEach(text => fragments.push({ type: 'log', text }));
    survivalFxExtractLines(currentStorySummary, 5, 34).forEach(text => fragments.push({ type: 'summary', text }));
    survivalFxExtractLines(currentOpenTasks, 5, 30).forEach(text => fragments.push({ type: 'task', text }));
    survivalFxExtractLines(currentRelationshipSummary, 5, 30).forEach(text => fragments.push({ type: 'relationship', text }));
    if (Array.isArray(currentFlags)) currentFlags.forEach(flag => {
        const text = survivalFxCleanText(flag, 24);
        if (text) fragments.push({ type: 'flag', text });
    });
    const scene = currentScenario && currentScenario.scenarios && currentScenario.scenarios[currentScenarioIndex];
    if (scene && scene.name) fragments.push({ type: 'scene', text: survivalFxCleanText(scene.name, 18) });
    if (currentScenario && Array.isArray(currentScenario.npcs)) currentScenario.npcs.forEach(npc => {
        const name = survivalFxCleanText(npc && npc.name, 12);
        if (name) fragments.push({ type: 'npc', text: name });
    });
    return fragments.filter(item => item.text);
}

function buildSurvivalDoubtText() {
    const fragments = getSurvivalDoubtFragments();
    if (!fragments.length) return '你確定這是正確的選擇嗎？';
    const picked = fragments[Math.floor(Math.random() * fragments.length)];
    const text = picked.text;
    const templatesByType = {
        log: [
            `日誌已經寫過「${text}」。你現在要假裝沒發生？`,
            `如果「${text}」是真的，這個選擇還安全嗎？`,
            `你剛才不是已經知道「${text}」了嗎？`
        ],
        summary: [
            `摘要裡還留著「${text}」。你要違背它？`,
            `主線不是正在指向「${text}」嗎？`,
            `你確定這不是在逃避「${text}」？`
        ],
        task: [
            `任務還沒結束：「${text}」。現在要偏離嗎？`,
            `你是不是忘了「${text}」？`,
            `這個選項會讓「${text}」更難完成吧？`
        ],
        relationship: [
            `關係記錄寫著「${text}」。你要拿它冒險？`,
            `如果「${text}」還算數，你真的要這樣選？`,
            `這會不會傷到「${text}」？`
        ],
        flag: [
            `Flags 還亮著：「${text}」。你確定？`,
            `系統沒有忘記「${text}」。你忘了嗎？`,
            `在「${text}」底下，這個選項可靠嗎？`
        ],
        scene: [
            `現在還在「${text}」。你真的能離開這條線？`,
            `「${text}」不是偶然被選中的場景。`,
            `這個選擇和「${text}」對得上嗎？`
        ],
        npc: [
            `「${text}」會怎麼看這個選擇？`,
            `你要讓「${text}」承受後果嗎？`,
            `如果「${text}」知道了呢？`
        ]
    };
    const templates = templatesByType[picked.type] || [`你確定要無視「${text}」？`];
    return templates[Math.floor(Math.random() * templates.length)];
}

function createSurvivalShard() {
    const state = getSurvivalFxState();
    if (!state.active) return;
    const wrap = document.getElementById('survival-fx-shards');
    if (!wrap) return;
    wrap.querySelectorAll('.survival-fx-shard').forEach(node => node.remove());
    const el = document.createElement('div');
    el.className = 'survival-fx-shard survival-fx-doubt';
    el.dataset.kind = state.sanSeverity >= state.hpSeverity ? 'SAN 質疑' : 'HP 警訊';
    el.textContent = buildSurvivalDoubtText();
    const width = Math.min(390, Math.max(260, window.innerWidth * 0.30));
    const edge = Math.random() < 0.5 ? 'left' : 'right';
    el.style.width = width + 'px';
    if (edge === 'left') {
        el.style.left = '18px';
        el.style.setProperty('--enter', '-18px');
        el.style.setProperty('--exit', '-12px');
    } else {
        el.style.left = Math.max(18, window.innerWidth - width - 18) + 'px';
        el.style.setProperty('--enter', '18px');
        el.style.setProperty('--exit', '12px');
    }
    el.style.top = (14 + Math.random() * 62) + 'vh';
    const life = 2600 + Math.random() * 1100 + state.severity * 620;
    el.style.setProperty('--survival-shard-life', life.toFixed(0) + 'ms');
    wrap.appendChild(el);
    window.setTimeout(() => el.remove(), life + 80);
}


function corruptSurvivalTextOnce() {
    const state = getSurvivalFxState();
    if (!state.active) return;
    const targets = Array.from(document.querySelectorAll('#dialogue-box .msg-text, #dialogue-box .msg-narrative, #dialogue-box .system-msg'))
        .filter(el => el && el.textContent && el.textContent.trim().length >= 6 && !el.dataset.survivalOriginal);
    if (!targets.length) return;
    const el = targets[Math.floor(Math.random() * targets.length)];
    const original = el.textContent;
    el.dataset.survivalOriginal = original;
    el.classList.add('survival-corrupting');
    let frame = 0;
    const glyphs = '░▒▓█#@%&!?<>/\\|[]{}01SANNULLLOG記憶偏移關係錯位';
    const timer = window.setInterval(() => {
        frame += 1;
        const amount = 0.10 + state.severity * 0.22;
        el.textContent = Array.from(original).map(ch => {
            if (/\s|，|。|、|：/.test(ch) || Math.random() > amount) return ch;
            return glyphs[Math.floor(Math.random() * glyphs.length)];
        }).join('');
        if (frame >= 4) {
            window.clearInterval(timer);
            el.textContent = original;
            el.classList.remove('survival-corrupting');
            delete el.dataset.survivalOriginal;
        }
    }, 58);
}

function runSurvivalAmbientEffects() {
    const state = getSurvivalFxState();
    if (!state.active) {
        survivalFxAmbientTimer = null;
        return;
    }
    const now = Date.now();
    if (!survivalFxSeenInitialSignal || (now - survivalFxLastSignalAt > 6200 - state.severity * 900 && Math.random() < 0.22)) {
        survivalFxSeenInitialSignal = true;
        survivalFxLastSignalAt = now;
        createSurvivalSignal();
    }
    if (now - survivalFxLastShardAt > 9500 - state.severity * 1300 && Math.random() < 0.18) {
        survivalFxLastShardAt = now;
        createSurvivalShard();
    }
    if (Math.random() < 0.07 + state.severity * 0.08) corruptSurvivalTextOnce();
    survivalFxAmbientTimer = window.setTimeout(runSurvivalAmbientEffects, 420 + Math.random() * 520);
}

function startSurvivalAmbientEffects() {
    if (!survivalFxAmbientTimer) runSurvivalAmbientEffects();
}

function stopSurvivalAmbientEffects() {
    if (survivalFxAmbientTimer) window.clearTimeout(survivalFxAmbientTimer);
    survivalFxAmbientTimer = null;
    survivalFxSeenInitialSignal = false;
    document.querySelectorAll('.survival-fx-signal,.survival-fx-shard').forEach(node => node.remove());
}

function resetSurvivalOption(btn) {
    if (!btn) return;
    const state = survivalFxOptionState.get(btn);
    if (state) {
        state.hover = false;
        state.x = 0;
        state.y = 0;
        state.tx = 0;
        state.ty = 0;
        state.nextNudge = 0;
    }
    btn.style.transform = '';
    btn.classList.remove('survival-option-drifting', 'survival-option-corrupt');
    btn.removeAttribute('data-survival-ghost');
    if (survivalFxActiveOption === btn) survivalFxActiveOption = null;
}

function getSurvivalOptionState(btn) {
    let state = survivalFxOptionState.get(btn);
    if (!state) {
        state = { x: 0, y: 0, tx: 0, ty: 0, hover: false, nextNudge: 0 };
        survivalFxOptionState.set(btn, state);
    }
    return state;
}

function nudgeSurvivalOption(btn, strong = false) {
    const fx = getSurvivalFxState();
    if (fx.sanSeverity <= 0 || !btn) return;
    if (survivalFxActiveOption && survivalFxActiveOption !== btn) resetSurvivalOption(survivalFxActiveOption);
    survivalFxActiveOption = btn;
    const state = getSurvivalOptionState(btn);
    const rect = btn.getBoundingClientRect();
    let side = Math.random() < 0.5 ? -1 : 1;
    if (survivalFxPointer.active) {
        const cx = rect.left + rect.width / 2;
        side = survivalFxPointer.x >= cx ? -1 : 1;
    }
    if (rect.left < window.innerWidth * 0.12) side = 1;
    if (rect.right > window.innerWidth * 0.88) side = -1;
    const horizontal = (strong ? 54 : 34) + Math.random() * (strong ? 48 : 34);
    const verticalPool = [-46, -28, 24, 38, 52];
    const yPick = verticalPool[Math.floor(Math.random() * verticalPool.length)] + Math.random() * 10 - 5;
    state.tx = Math.max(-128, Math.min(128, side * horizontal * (0.86 + fx.sanSeverity * 0.22)));
    state.ty = Math.max(-64, Math.min(64, yPick));
    state.hover = true;
    state.nextNudge = Date.now() + 560 + Math.random() * 520;
    btn.classList.add('survival-option-drifting');
    if (Math.random() < 0.10 + fx.sanSeverity * 0.24) {
        const ghost = getSurvivalSignalTexts()[Math.floor(Math.random() * getSurvivalSignalTexts().length)] || 'LOG';
        btn.dataset.survivalGhost = ghost;
        btn.classList.add('survival-option-corrupt', 'survival-option-mutated');
        window.setTimeout(() => {
            btn.classList.remove('survival-option-corrupt');
            btn.removeAttribute('data-survival-ghost');
        }, 1200);
    }
}

function getSurvivalOptionMainText(btn) {
    if (!btn) return '';
    if (btn.dataset && btn.dataset.survivalOptionText) return btn.dataset.survivalOptionText.trim();
    const clone = btn.cloneNode(true);
    clone.querySelectorAll('.opt-check-label').forEach(label => label.remove());
    return clone.textContent.trim();
}

function setSurvivalOptionVisibleText(btn, text, check = '') {
    if (!btn) return;
    btn.textContent = text;
    const statInfo = check && DICE_STATS && DICE_STATS[check] ? DICE_STATS[check] : null;
    if (statInfo) {
        const checkLabel = document.createElement('span');
        checkLabel.className = 'opt-check-label';
        const checkWord = window.uiMessage ? window.uiMessage('判定') : '判定';
        checkLabel.textContent = `${statInfo.code} ${checkWord}`;
        btn.appendChild(checkLabel);
    }
}

function getSurvivalOptionMutation(btn, originalText, originalCheck = '', originalDifficulty = 'normal') {
    const state = getSurvivalFxState();
    if (state.sanSeverity <= 0 || !btn) return null;
    const chance = 0.18 + state.sanSeverity * 0.46;
    if (Math.random() > chance) return null;
    const original = valueToText(originalText).trim();
    const candidates = Array.from(document.querySelectorAll('#options-area .opt-btn'))
        .filter(other => other !== btn)
        .map(other => ({
            text: getSurvivalOptionMainText(other),
            check: other.dataset.survivalOptionCheck || '',
            difficulty: other.dataset.survivalOptionDifficulty || 'normal'
        }))
        .filter(item => item.text && item.text !== original);
    if (!candidates.length) return null;
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    return {
        text: picked.text,
        check: picked.check || originalCheck || '',
        difficulty: picked.difficulty || originalDifficulty || 'normal',
        original
    };
}

function handleSurvivalOptionClick(btn, text, check = '', difficulty = 'normal') {
    const mutation = getSurvivalOptionMutation(btn, text, check, difficulty);
    if (!mutation) {
        selectOption(text, check, difficulty);
        return;
    }
    btn.dataset.survivalGhost = mutation.original;
    btn.classList.add('survival-option-corrupt');
    setSurvivalOptionVisibleText(btn, mutation.text, mutation.check);
    nudgeSurvivalOption(btn, true);
    selectOption(mutation.text, mutation.check, mutation.difficulty);
    window.setTimeout(() => {
        if (typeof sendChoice === 'function') sendChoice();
    }, 90);
}


function isPointerInsideOption(btn, pad = 8) {
    const rect = btn.getBoundingClientRect();
    return survivalFxPointer.x >= rect.left - pad && survivalFxPointer.x <= rect.right + pad && survivalFxPointer.y >= rect.top - pad && survivalFxPointer.y <= rect.bottom + pad;
}

function animateSurvivalOptions() {
    const btn = survivalFxActiveOption;
    if (btn) {
        const state = getSurvivalOptionState(btn);
        if (state.hover) {
            state.x += (state.tx - state.x) * 0.058;
            state.y += (state.ty - state.y) * 0.058;
            btn.style.transform = `translate3d(${state.x.toFixed(1)}px, ${state.y.toFixed(1)}px, 0)`;
        }
    }
    window.requestAnimationFrame(animateSurvivalOptions);
}

function ensureSurvivalOptionInterference() {
    if (survivalFxOptionDelegated) return;
    survivalFxOptionDelegated = true;
    document.addEventListener('pointerover', event => {
        const btn = event.target && event.target.closest ? event.target.closest('.opt-btn') : null;
        if (!btn || getSurvivalFxState().sanSeverity <= 0) return;
        nudgeSurvivalOption(btn, true);
    });
    document.addEventListener('pointermove', event => {
        survivalFxPointer.x = event.clientX;
        survivalFxPointer.y = event.clientY;
        survivalFxPointer.active = true;
        const btn = event.target && event.target.closest ? event.target.closest('.opt-btn') : null;
        if (survivalFxActiveOption && !isPointerInsideOption(survivalFxActiveOption, 8)) resetSurvivalOption(survivalFxActiveOption);
        if (btn && btn === survivalFxActiveOption) {
            const state = getSurvivalOptionState(btn);
            if (Date.now() > state.nextNudge) nudgeSurvivalOption(btn, false);
        }
    });
    document.addEventListener('pointerout', event => {
        const btn = event.target && event.target.closest ? event.target.closest('.opt-btn') : null;
        if (!btn || btn !== survivalFxActiveOption) return;
        if (event.relatedTarget && event.relatedTarget.closest && event.relatedTarget.closest('.opt-btn') === btn) return;
        resetSurvivalOption(btn);
    });
    document.addEventListener('click', event => {
        const btn = event.target && event.target.closest ? event.target.closest('.opt-btn') : null;
        if (!btn || getSurvivalFxState().sanSeverity <= 0) return;
        nudgeSurvivalOption(btn, true);
    }, true);
    window.addEventListener('pointerleave', () => {
        survivalFxPointer.active = false;
        if (survivalFxActiveOption) resetSurvivalOption(survivalFxActiveOption);
    });
    window.requestAnimationFrame(animateSurvivalOptions);
}

function syncSurvivalVisualEffects() {
    if (typeof document === 'undefined' || !document.body) return;
    const layer = ensureSurvivalFxLayer();
    ensureSurvivalOptionInterference();
    const state = getSurvivalFxState();
    const body = document.body;
    body.classList.toggle('survival-fx-active', state.active);
    body.classList.toggle('survival-fx-san', state.sanSeverity > 0);
    body.classList.toggle('survival-fx-hp', state.hpSeverity > 0);
    body.classList.toggle('survival-fx-zero', state.zero);
    if (!state.active) {
        layer.style.setProperty('--survival-fx-severity', '0');
        layer.style.setProperty('--survival-fx-dark', '0');
        layer.style.setProperty('--survival-fx-grain', '0');
        layer.style.setProperty('--survival-fx-scan', '0');
        layer.style.setProperty('--survival-fx-vignette', '0');
        stopSurvivalGrain();
        stopSurvivalAmbientEffects();
        if (survivalFxActiveOption) resetSurvivalOption(survivalFxActiveOption);
        return;
    }
    layer.style.setProperty('--survival-fx-severity', state.severity.toFixed(3));
    layer.style.setProperty('--survival-fx-dark', (0.18 + state.severity * 0.56).toFixed(3));
    layer.style.setProperty('--survival-fx-grain', (0.20 + state.severity * 0.28).toFixed(3));
    layer.style.setProperty('--survival-fx-scan', (0.018 + state.severity * 0.052).toFixed(3));
    layer.style.setProperty('--survival-fx-vignette', (0.22 + state.severity * 0.50).toFixed(3));
    startSurvivalGrain();
    startSurvivalAmbientEffects();
}

window.addEventListener('resize', () => {
    const canvas = document.getElementById('survival-grain-canvas');
    if (canvas) resizeSurvivalGrainCanvas(canvas);
});

function getRequiredSurvivalFlags() {
            const flags = [];
            if (currentHp <= 0) flags.push(AUTO_SURVIVAL_FLAGS.hpZero);
            else if (currentHp <= 20) flags.push(AUTO_SURVIVAL_FLAGS.hpCritical);
            if (currentSan <= 0) flags.push(AUTO_SURVIVAL_FLAGS.sanZero);
            else if (currentSan <= 20) flags.push(AUTO_SURVIVAL_FLAGS.sanCritical);
            return flags;
        }

        function getCurrentGameOver() {
            return currentSaveId && savesData[currentSaveId] ? savesData[currentSaveId].gameOver || null : null;
        }

        function applyGameOverUi() {
            const gameOver = getCurrentGameOver();
            if (!gameOver) return false;
            const input = document.getElementById('player-input');
            const sendButton = document.getElementById('send-btn');
            const diceButton = document.getElementById('dice-btn');
            if (input) {
                input.disabled = true;
                input.value = '';
                input.placeholder = `GAME OVER：${gameOver.reason || '本次冒險已結束'}`;
            }
            if (sendButton) sendButton.disabled = true;
            if (diceButton) diceButton.disabled = true;
            const options = document.getElementById('options-area');
            if (options) options.innerHTML = '';
            return true;
        }

        function resolveSurvivalOutcome(forcedRoll = null) {
            if (getCurrentGameOver()) return { gameOver: true, existing: true };
            const zeroKinds = [];
            if (currentHp <= 0) zeroKinds.push('HP');
            if (currentSan <= 0) zeroKinds.push('SAN');
            if (!zeroKinds.length) return { gameOver: false, rescued: false };

            const mode = getGameDifficultyInfo();
            const reason = `${zeroKinds.join(' 與 ')} 歸零`;
            let survivalRoll = null;
            let gameOver = mode.gameOver === 'forced';

            if (mode.gameOver === 'possible') {
                survivalRoll = forcedRoll === null ? Math.floor(Math.random() * 20) + 1 : Math.max(1, Math.min(20, Math.round(forcedRoll)));
                gameOver = survivalRoll >= 11;
            }

            if (gameOver) {
                savesData[currentSaveId].gameOver = { reason, mode: mode.key, roll: survivalRoll, at: new Date().toLocaleString() };
                createSystemAlert(mode.gameOver === 'forced'
                    ? `— GAME OVER：${reason}（極限模式）—`
                    : `— 生死檢定失敗：D20 ${survivalRoll}，GAME OVER —`);
                applyGameOverUi();
                return { gameOver: true, roll: survivalRoll, reason };
            }

            if (currentHp <= 0) currentHp = 1;
            if (currentSan <= 0) currentSan = 1;
            document.getElementById('ui-hp').innerText = currentHp;
            document.getElementById('ui-san').innerText = currentSan;
            createSystemAlert(mode.gameOver === 'possible'
                ? `— 生死檢定成功：D20 ${survivalRoll}，${reason}後保留 1 點 —`
                : `— 保護機制啟動：${reason}後保留 1 點 —`);
            return { gameOver: false, rescued: true, roll: survivalRoll, reason };
        }

        function syncSurvivalFlags({ announce = false } = {}) {
            syncSurvivalVisualEffects();
            const previousAutoFlags = currentFlags.filter(flag => AUTO_SURVIVAL_FLAG_SET.has(flag));
            const requiredFlags = getRequiredSurvivalFlags();
            currentFlags = currentFlags.filter(flag => !AUTO_SURVIVAL_FLAG_SET.has(flag));
            requiredFlags.forEach(flag => currentFlags.push(flag));

            if (!announce || getCurrentGameOver()) return;

            requiredFlags.forEach(flag => {
                if (previousAutoFlags.includes(flag)) return;
                if (flag === AUTO_SURVIVAL_FLAGS.hpZero) {
                    const mode = getGameDifficultyInfo();
                    createSystemAlert(mode.gameOver === 'forced' ? 'HP 歸零：極限模式 Game Over。' : mode.gameOver === 'possible' ? 'HP 歸零：困難模式進入致命結局判定。' : 'HP 歸零：保護機制啟動，下一回合優先演出救援。');
                }
                else if (flag === AUTO_SURVIVAL_FLAGS.hpCritical) createSystemAlert('HP 已進入重傷區間，後續行動與判定將受到影響。');
                else if (flag === AUTO_SURVIVAL_FLAGS.sanZero) {
                    const mode = getGameDifficultyInfo();
                    createSystemAlert(mode.gameOver === 'forced' ? 'SAN 歸零：極限模式 Game Over。' : mode.gameOver === 'possible' ? 'SAN 歸零：困難模式進入致命結局判定。' : 'SAN 歸零：照護機制啟動，下一回合優先處理精神崩潰。');
                }
                else if (flag === AUTO_SURVIVAL_FLAGS.sanCritical) createSystemAlert('SAN 已進入精神危機區間，後續感知與判定將受到影響。');
            });

            const hpRecovered = previousAutoFlags.some(flag => flag === AUTO_SURVIVAL_FLAGS.hpCritical || flag === AUTO_SURVIVAL_FLAGS.hpZero)
                && currentHp > 20;
            const sanRecovered = previousAutoFlags.some(flag => flag === AUTO_SURVIVAL_FLAGS.sanCritical || flag === AUTO_SURVIVAL_FLAGS.sanZero)
                && currentSan > 20;
            if (hpRecovered) createSystemAlert('HP 已恢復至安全區間，重傷狀態解除。');
            if (sanRecovered) createSystemAlert('SAN 已恢復至安全區間，精神危機狀態解除。');
        }
