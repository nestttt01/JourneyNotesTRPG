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
                more.onclick = () => {
                    msgBox.dataset.pendingReveal = String(renderCount);
                    renderChatPage(pageIndex, renderCount + CHAT_RENDER_LIMIT, getChatScrollAnchor(msgBox));
                };
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
                        if (rawMsg.includes("解鎖") || rawMsg.includes("獲得") || rawMsg.includes("失去") || rawMsg.includes("消耗") || rawMsg.includes("好感度") || rawMsg.includes("發生改變") || rawMsg.includes("檢定") || rawMsg.includes("成就達成") || rawMsg.includes("本場目標達成") || /｜(大成功|成功|失敗|大失敗|Crit!|Success|Fail|Fumble)｜/.test(rawMsg)) {
                            const alertDiv = document.createElement('div'); alertDiv.className = 'alert-msg'; alertDiv.innerText = displayMsg;
                            decorateSystemAlert(alertDiv, rawMsg, false);
                            msgBox.appendChild(alertDiv);
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
                /* 引導教學開場鈕(2026/07/10):空情境時排在隨機開場上方;情境無關——
                   用玩家當前世界觀與 NPC 執行五步教學。點擊即記旗標,一生只出現到按過為止
                   (中途放棄不再出現屬刻意,想重跑可用預設配置的序章)。 */
                if (!localStorage.getItem('sanko_tutorial_done_v1')) {
                    const tutorialBtn = document.createElement('button');
                    tutorialBtn.className = 'opt-btn';
                    tutorialBtn.style.borderColor = 'var(--accent-neon)';
                    tutorialBtn.style.width = 'fit-content';
                    tutorialBtn.style.alignSelf = 'center';
                    tutorialBtn.textContent = window.uiMessage ? window.uiMessage('✦ 第一次跑團？從引導教學開始') : '✦ 第一次跑團？從引導教學開始';
                    tutorialBtn.onclick = () => {
                        localStorage.setItem('sanko_tutorial_done_v1', '1');
                        optArea.innerHTML = '';
                        document.getElementById('loading').style.display = 'block';
                        /* 教學守則不放這裡——放 Flag,由 getCompactSystemInstruction 條件式注入,
                           每回合都在(小模型第二回合就忘的根治法);AI 回報完成後程式自動摘旗。 */
                        if (typeof addGuaranteedFlag === 'function') addGuaranteedFlag('新手教學進行中');
                        const currentScenName = currentScenario.scenarios[currentChatPageIndex].name;
                        const prompt = `【系統啟動要求】目前視角處於「${currentScenName}」情境。新手教學開始：請依系統規則中的「新手教學模式」執行第一步，用符合世界觀的輕鬆場面開局，並讓合適的 NPC 講出第一句話。`;
                        callAI_JSON(prompt, true);
                    };
                    optArea.appendChild(tutorialBtn);
                }
const btn = document.createElement('button'); btn.className = 'opt-btn'; btn.style.borderColor = 'var(--accent-neon)'; btn.style.width = 'fit-content'; btn.style.alignSelf = 'center'; btn.textContent = window.uiMessage ? window.uiMessage('⚄ 讓 AI 根據「情境設定」隨機生成開場事件') : '⚄ 讓 AI 根據「情境設定」隨機生成開場事件';
                btn.onclick = () => {
                    optArea.innerHTML = '';
                    document.getElementById('loading').style.display = 'block';
                    const currentScenName = currentScenario.scenarios[currentChatPageIndex].name;
                    const prompt = `【系統啟動要求】目前視角處於「${currentScenName}」情境。請嚴格根據「當前場景的世界觀與物理法則」以及「NPC在此的總體身分」，隨機生成一個極具帶入感的開局事件（例如：遭遇突發危機、日常衝突、或是某個角色正在做符合他人設的行為）。請利用 narrative 豐富描寫場景氣氛，並讓合適的 NPC 講出第一句話。`;
                    callAI_JSON(prompt, true);
                };
                optArea.appendChild(btn);
            }
            /* 「載入更早」展開的舊訊息批次淡入(最多前 14 則,錯相 24ms) */
            const prevShownCount = Number(msgBox.dataset.pendingReveal);
            delete msgBox.dataset.pendingReveal;
            if (Number.isFinite(prevShownCount) && prevShownCount > 0) {
                const revealNodes = Array.from(msgBox.children).filter(el => !el.classList.contains('chat-load-earlier'));
                const revealedCount = Math.max(0, revealNodes.length - prevShownCount);
                revealNodes.slice(0, Math.min(revealedCount, 14)).forEach((el, i) => {
                    el.classList.add('msg-reveal');
                    el.style.animationDelay = (i * 24) + 'ms';
                    window.setTimeout(() => { el.classList.remove('msg-reveal'); el.style.animationDelay = ''; }, 900 + i * 24);
                });
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

        /* AI 回覆渲染完後的權威捲到底:#dialogue-box 是 scroll-behavior:smooth,
           連續 append 時每次的平滑捲動會互相打斷、常停在半路。這裡暫時關掉平滑、
           連補三幀確保吃到最終版面高度。 */
        function scrollDialogueToLatest() {
            const box = document.getElementById('dialogue-box');
            if (!box) return;
            const previousBehavior = box.style.scrollBehavior;
            box.style.scrollBehavior = 'auto';
            const toBottom = () => { box.scrollTop = box.scrollHeight; };
            toBottom();
            requestAnimationFrame(() => {
                toBottom();
                requestAnimationFrame(() => {
                    toBottom();
                    box.style.scrollBehavior = previousBehavior;
                });
            });
        }

        /* 訊息輕彈入的批次錯相(2026/07/10):AI 一回合多段訊息是同一 tick 連續 append,
           全部同時彈會糊成一團;600ms 內視為同批。節奏不規律:下一則的等待時間
           依「上一則的字數」計(220ms + 每字 14ms,單則 280ms~1.2s,整批上限 6s),
           像 DM 講完一段才接下一段。 */
        let msgEnterBatchTime = 0;
        let msgEnterBatchDelay = 0;
        function applyMsgEnter(el, textLen) {
            const now = Date.now();
            if (now - msgEnterBatchTime > 600) msgEnterBatchDelay = 0;
            msgEnterBatchTime = now;
            el.classList.add('msg-enter');
            if (msgEnterBatchDelay > 0) el.style.animationDelay = `${msgEnterBatchDelay}ms`;
            const len = Number(textLen) || 0;
            const pause = Math.max(280, Math.min(220 + len * 14, 1200));
            msgEnterBatchDelay = Math.min(msgEnterBatchDelay + pause, 6000);
        }

        function appendNarrative(text, rawLine) {
            if (!text) return; const dialogueBox = document.getElementById('dialogue-box'); const navDiv = document.createElement('div'); navDiv.className = 'msg-narrative'; navDiv.innerText = text;
            navDiv.dataset.rawLine = (rawLine !== undefined) ? rawLine : `【旁白】：${text}`;
            attachMsgMenu(navDiv, navDiv, 'narrative', '');
            dialogueBox.appendChild(navDiv);
            if (dialogueBox.dataset.renderingHistory !== '1') {
                applyMsgEnter(navDiv, text.length);   /* 輕彈入:僅 live 新訊息,依字數錯相(2026/07/10) */
                dialogueBox.scrollTop = dialogueBox.scrollHeight;
            }
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
            if (dialogueBox.dataset.renderingHistory !== '1') {
                applyMsgEnter(msgWrapper, text.length);   /* 輕彈入:僅 live 新訊息,依字數錯相,歷史重繪不套(2026/07/10) */
                dialogueBox.scrollTop = dialogueBox.scrollHeight;
            }
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
                b.onclick = () => {
                    box.dataset.pendingReveal = String(loadedCount);
                    renderChatPage(currentChatPageIndex, loadedCount + CHAT_RENDER_LIMIT, getChatScrollAnchor(box));
                };
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
            ta.className = 'msg-edit-area'; ta.value = (textEl.dataset && textEl.dataset.survivalOriginal) ? textEl.dataset.survivalOriginal : ((typeof textEl.innerText === 'string') ? textEl.innerText : textEl.textContent);
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

        function createIsolatedLegacySaveScenario(saveId, saveData) {
            const presetId = getUniquePresetId(`preset_legacy_${String(saveId || Date.now())}`);
            const presetName = valueToText(saveData?.title, uiText('未命名配置'));
            const savedPageCount = Array.isArray(saveData?.scripts)
                ? Math.min(100, saveData.scripts.length)
                : 1;
            const savedScenarioIndex = Math.max(0, Math.min(99, Math.floor(Number(saveData?.scenIndex)) || 0));
            const scenarioCount = Math.max(1, savedPageCount, savedScenarioIndex + 1);
            const preset = {
                id: presetId,
                presetName,
                playerName: uiText('玩家'),
                playerAvatar: emptyAvatar,
                playerStats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
                isLocked: false,
                statsLocked: false,
                languageMode: 'zh-tw',
                gameDifficulty: 'standard',
                playerDetails: { age: '', speech: '', likes: '', dislikes: '', app: '', bg: '' },
                npcs: [{
                    id: 'npc_legacy_recovery',
                    name: uiText('新角色'),
                    avatar: emptyAvatar,
                    details: { age: '', speech: '', likes: '', dislikes: '', app: '', bg: '' },
                    affection: Math.max(-100, Math.min(100, Math.round(Number(saveData?.love)) || 0))
                }],
                scenarios: Array.from({ length: scenarioCount }, (_, index) => ({
                    name: index === 0 ? presetName : `${presetName} ${index + 1}`,
                    lore: '',
                    npcRoles: '',
                    playerRole: '',
                    transitionRule: ''
                }))
            };
            const scenario = createFreshScenarioFromPreset(preset);
            scenario.sourcePresetId = presetId;
            scenario.id = presetId;
            return { presetId, preset, scenario };
        }

        function loadGame(id) {
            const saveData = savesData[id];
            if (!saveData || typeof saveData !== 'object' || Array.isArray(saveData)) {
                alert(uiText('這份存檔格式不正確，無法載入。'));
                return;
            }
            const scenarioMissing = saveData.scenario === undefined || saveData.scenario === null;
            if (!scenarioMissing && (typeof saveData.scenario !== 'object' || Array.isArray(saveData.scenario))) {
                alert(uiText('這份存檔格式不正確，無法載入。'));
                return;
            }
            if (scenarioMissing) {
                const originalScenario = saveData.scenario;
                const recovery = createIsolatedLegacySaveScenario(id, saveData);
                scenarioPresets[recovery.presetId] = recovery.preset;
                saveData.scenario = recovery.scenario;
                const presetSaved = persistJson('sanko_scenario_presets_v2', scenarioPresets, '角色配置');
                const saveSaved = presetSaved && persistSingleSave(id, '遊戲存檔');
                if (!presetSaved || !saveSaved) {
                    delete scenarioPresets[recovery.presetId];
                    if (originalScenario === undefined) {
                        delete saveData.scenario;
                    } else {
                        saveData.scenario = originalScenario;
                    }
                    if (presetSaved) {
                        persistJson('sanko_scenario_presets_v2', scenarioPresets, '角色配置');
                    }
                    return;
                }
                if (typeof renderPresetSelector === 'function') {
                    renderPresetSelector();
                }
                alert(uiText('這份舊紀錄缺少原始配置快照，無法還原當時的角色與情境設定。已為它建立獨立的空白配置，並保留原有對話與進度；請在角色配置中補回設定。'));
            }
            if (typeof invalidateGameAIRequestContext === 'function') {
                invalidateGameAIRequestContext();
            }
            currentSaveId = id;
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
            const savedSurvivalState = saveData.survivalState
                && typeof saveData.survivalState === 'object'
                && !Array.isArray(saveData.survivalState)
                ? saveData.survivalState
                : {};
            survivalGraceTurns = Math.max(0, Math.min(3, Math.floor(Number(savedSurvivalState.graceTurns)) || 0));
            pendingLastStand = savedSurvivalState.pendingLastStand === true && !getCurrentGameOver();
            pendingLastStandReason = pendingLastStand
                ? valueToText(savedSurvivalState.pendingLastStandReason).slice(0, 80)
                : '';
            restJustUsed = savedSurvivalState.restJustUsed === true;
            currentItems = Array.isArray(saveData.items) ? saveData.items.map(item => valueToText(item)).filter(Boolean) : [];
            itemEffects = {};
            if (saveData.itemEffects && typeof saveData.itemEffects === 'object' && !Array.isArray(saveData.itemEffects)) {
                Object.keys(saveData.itemEffects).forEach(k => {
                    const eff = sanitizeItemEffect(saveData.itemEffects[k]);
                    if (eff && currentItems.includes(k)) itemEffects[k] = eff;
                });
            }
            /* 存量道具正規化(2026/07/10):修正管線上線前入袋的「名稱帶 (SAN+N)/(HP+N)」道具——
               讀檔時剝掉標記、補上效果,讓舊道具也長出使用鈕;已有效果或改名撞名則不動。
               解析走 parseItemEffectNameTag 單一事實來源。 */
            currentItems = currentItems.map(itemName => {
                const tag = parseItemEffectNameTag(itemName);
                if (!tag) return itemName;
                const cleanName = tag.cleanName;
                if (cleanName !== itemName && currentItems.includes(cleanName)) return itemName;
                if (itemEffects[itemName] && cleanName !== itemName) {
                    itemEffects[cleanName] = itemEffects[itemName];
                    delete itemEffects[itemName];
                }
                if (!itemEffects[cleanName]) {
                    itemEffects[cleanName] = { type: tag.type, amount: tag.amount };
                }
                return cleanName;
            });
            achievementCount = Math.max(0, Math.floor(Number(saveData.achievementCount)) || 0);
            growthSpent = Math.max(0, Math.min(achievementCount, Math.floor(Number(saveData.growthSpent)) || 0));
            completedObjectives = Array.isArray(saveData.completedObjectives) ? saveData.completedObjectives.map(v => valueToText(v)).filter(Boolean) : [];
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

            document.getElementById('ui-hp').innerText = currentHp; document.getElementById('ui-san').innerText = currentSan; document.getElementById('ui-target-typing').innerText = window.uiMessage ? window.uiMessage('引擎 (DM)') : '引擎 (DM)';
            
            const locSelect = document.getElementById('btn-location'); locSelect.innerHTML = '';
            currentScenario.scenarios.forEach((sc, i) => {
                const opt = document.createElement('option'); opt.value = i; opt.innerText = `✦ ${sc.name}`;
                if(i === currentScenarioIndex) opt.selected = true; locSelect.appendChild(opt);
            });
            if (typeof appendAddScenarioOption === 'function') appendAddScenarioOption(locSelect);
            
 ensureGameModelSelectReady();
 setSelectValueWithFallback(document.getElementById('game-model-choice'), selectedModel);
 if (typeof updateGameModelIndicator === 'function') updateGameModelIndicator();
 document.getElementById('dialogue-box').innerHTML = ''; document.getElementById('options-area').innerHTML = '';
document.getElementById('setup-screen').style.display = 'none'; document.getElementById('save-menu-screen').style.display = 'none'; document.getElementById('game-container').style.display = 'flex';
            
            renderChatPage(currentChatPageIndex);
            
            const msgBox = document.getElementById('dialogue-box'); 
            const loadedText = window.uiMessage ? window.uiMessage('— 遊戲紀錄已載入 —') : '— 遊戲紀錄已載入 —';
            const sysMsg = document.createElement('div'); sysMsg.className = 'system-msg'; sysMsg.innerText = loadedText; msgBox.appendChild(sysMsg); msgBox.scrollTop = msgBox.scrollHeight;

            let loadSurvivalOutcome;
            if (pendingLastStand) {
                const reason = pendingLastStandReason || 'HP / SAN 歸零';
                renderLastStandOption(reason);
                loadSurvivalOutcome = { gameOver: false, lastStand: true, reason };
            } else {
                loadSurvivalOutcome = resolveSurvivalOutcome(null, { consumeGrace: false });
            }
            const survivalLocked = Boolean(loadSurvivalOutcome.gameOver || loadSurvivalOutcome.lastStand);
            const input = document.getElementById('player-input');
            input.disabled = survivalLocked;
            document.getElementById('send-btn').disabled = survivalLocked;
            document.getElementById('dice-btn').disabled = survivalLocked;
            if (loadSurvivalOutcome.rescued || loadSurvivalOutcome.gameOver || loadSurvivalOutcome.lastStand) {
                saveCurrentProgress();
            }
            setCreatorInputMode(false, false);
            if (!applyGameOverUi() && !survivalLocked) input.focus();
        }

        function selectOption(text, check = '', difficulty = 'normal', proficient = false) {
            const inputEl = document.getElementById('player-input');
            inputEl.value = text;
            inputEl.dataset.diceSuggestedText = text;
            inputEl.dataset.diceStat = check;
            inputEl.dataset.diceDifficulty = difficulty;
            inputEl.dataset.diceProficient = proficient === true && DICE_STATS[normalizeDiceStatKey(check)] ? '1' : '';
            adjustInputHeight();
            inputEl.focus();
        }

        function shouldApplySuggestedProficiency(inputEl, isNarratorDice = false) {
            if (isNarratorDice || inputEl?.dataset?.diceProficient !== '1') return false;
            return Array.isArray(currentScenario?.playerProficiencies)
                && currentScenario.playerProficiencies.some(value => valueToText(value).trim());
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

        /* 道具加值(2026/07/10):裝備型暫時加值——道具文字帶「+1 智力」「INT +1」這類標記時,
           持有期間該屬性骰點自動加值;失去道具即消失。全程程式判定,不動 prompt 與存檔格式。
           每件道具對同一屬性只計第一個命中;總加值 clamp ±3 防 AI 發神器失衡。 */
        /* 屬性同義詞:AI 會寫「耐力+1」「智慧+2」這類變體,一律收斂到六圍。
           數值只認 1~3(後面不能再接數字):排除「恢復體力+20」這種回復量誤判。 */
        const ITEM_DICE_STAT_NAMES = {
            str: ['STR', '力量'],
            dex: ['DEX', '敏捷', '身手'],
            con: ['CON', '體質', '耐力', '體力'],
            int: ['INT', '智力', '智慧'],
            wis: ['WIS', '感知', '意志', '精神'],
            cha: ['CHA', '魅力']
        };
        function getItemDiceModifier(statKey) {
            if (!Array.isArray(currentItems) || !currentItems.length) return 0;
            const names = ITEM_DICE_STAT_NAMES[statKey];
            if (!names) return 0;
            const patterns = [];
            names.forEach(name => {
                patterns.push(new RegExp(`${name}\\s*([+\\-＋−][1-3])(?!\\d)`, 'i'));
                patterns.push(new RegExp(`([+\\-＋−][1-3])(?!\\d)\\s*${name}`, 'i'));
            });
            let total = 0;
            currentItems.forEach(item => {
                const text = valueToText(item);
                for (const re of patterns) {
                    const match = text.match(re);
                    if (match) {
                        const num = Number(match[1].replace('＋', '+').replace('−', '-'));
                        if (Number.isFinite(num)) total += num;
                        break;
                    }
                }
            });
            return Math.max(-3, Math.min(3, total));
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
            const itemModifier = options.applyItemModifier === false ? 0 : getItemDiceModifier(statKey);
            const totalModifier = abilityModifier + survivalModifier + proficiencyModifier + itemModifier;
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
                itemModifier,
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

        /* Keep the D20 SVG intact while the button and icon animate for 0.7 seconds. */
        function playDiceRollFx() {
            const btn = document.getElementById('dice-btn');
            if (!btn || btn.dataset.rollingFx === '1') return;
            if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            btn.dataset.rollingFx = '1';
            btn.classList.add('dice-rolling');
            window.setTimeout(() => {
                btn.classList.remove('dice-rolling');
                delete btn.dataset.rollingFx;
            }, 700);
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
            playDiceRollFx();
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
                        proficient: shouldApplySuggestedProficiency(inputEl, isNarratorDice),
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
                    isNarratorDice ? { stats: neutralNpcStats, applySurvivalModifier: false, applyItemModifier: false, scope: 'narrator' } : { proficient: classification.proficient }
                );
                const signedAbility = check.abilityModifier >= 0 ? `+${check.abilityModifier}` : String(check.abilityModifier);
                const signedTotal = check.totalModifier >= 0 ? `+${check.totalModifier}` : String(check.totalModifier);
                const gameDifficultyText = check.gameDifficultyDcModifier ? `｜遊戲難度 ${check.gameDifficultyLabel}：DC +${check.gameDifficultyDcModifier}` : `｜遊戲難度 ${check.gameDifficultyLabel}`;
                const survivalText = check.survivalModifier ? `｜生存狀態修正 ${check.survivalModifier}` : '';
                const proficiencyText = check.proficiencyModifier ? `｜熟練 +${check.proficiencyModifier}` : '';
                const itemModText = check.itemModifier ? `｜道具加值 ${check.itemModifier > 0 ? '+' : ''}${check.itemModifier}` : '';
                const scopeText = isNarratorDice ? '｜NPC／旁白支線判定，不得套用玩家 HP/SAN 或好感' : '';
                const diceReason = `${classification.reason}${scopeText}`;
                classification.reason = diceReason;
                const directive = `(系統硬判定：${check.code} ${check.label}｜屬性 ${check.score}（加值 ${signedAbility}）｜行動難度 ${check.difficultyLabel}：基礎 DC ${check.difficultyDc}${gameDifficultyText}${survivalText}${proficiencyText}${itemModText}｜最終 DC ${check.dc}｜D20 ${check.roll} ${signedTotal} = ${check.total}｜結果【${check.result}】｜判定理由：${classification.reason}。此結果由程式計算，AI 不得更改。)`;
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

        function getGameInputMode() {
            if (creatorInputArmed) return 'creator';
            return getSceneParticipationMode() === 'narrator' ? 'narrator' : 'character';
        }

        function updateGameInputModeUI() {
            const activeMode = getGameInputMode();
            const modeButtons = [
                ['input-mode-character', 'character'],
                ['input-mode-narrator', 'narrator'],
                ['creator-mode-btn', 'creator']
            ];
            modeButtons.forEach(([buttonId, mode]) => {
                const button = document.getElementById(buttonId);
                if (!button) return;
                const isActive = mode === activeMode;
                button.classList.toggle('active', isActive);
                button.setAttribute('aria-pressed', String(isActive));
            });

            const creatorButton = document.getElementById('creator-mode-btn');
            if (creatorButton) {
                const title = creatorInputArmed
                    ? '關閉持續創作者指令模式'
                    : '開啟持續創作者指令模式';
                creatorButton.title = window.uiMessage ? window.uiMessage(title) : title;
            }

            const diceButton = document.getElementById('dice-btn');
            if (diceButton) {
                diceButton.classList.toggle('mode-disabled', creatorInputArmed);
                diceButton.setAttribute('aria-disabled', String(creatorInputArmed));
                diceButton.tabIndex = creatorInputArmed ? -1 : 0;
            }
        }

        function updatePlayerInputPlaceholder() {
            const input = document.getElementById('player-input');
            if (!input) return;
            let placeholder;
            if (creatorInputArmed) {
                placeholder = '輸入本回合的創作者指令...';
            } else {
                placeholder = getSceneParticipationMode() === 'narrator'
                    ? '輸入輔助旁白，或點「神」下達創作者指令...'
                    : '輸入角色行動，或點「神」下達創作者指令...';
            }
            input.placeholder = window.uiMessage ? window.uiMessage(placeholder) : placeholder;
            updateGameInputModeUI();
        }

        function setCreatorInputMode(enabled, focusInput = true) {
            creatorInputArmed = Boolean(enabled);
            updatePlayerInputPlaceholder();
            const input = document.getElementById('player-input');
            if (focusInput && input && !input.disabled) input.focus();
        }

        function setGameInputMode(mode, focusInput = true) {
            if (!['character', 'narrator', 'creator'].includes(mode)) return;
            if (document.getElementById('player-input')?.disabled) return;
            if (mode === 'creator') {
                setCreatorInputMode(true, focusInput);
                return;
            }

            const previousMode = getGameInputMode();
            const scene = currentScenario.scenarios?.[currentScenarioIndex];
            if (scene) {
                scene.runtimePlayerPresence = mode === 'narrator' ? 'absent' : 'present';
                if (mode === 'narrator') {
                    scene.runtimeGuideRole = scene.runtimeGuideRole || '輔助旁白';
                } else {
                    delete scene.runtimeGuideRole;
                }
            }

            setCreatorInputMode(false, focusInput);
            if (previousMode !== mode && currentSaveId && typeof saveCurrentProgress === 'function') {
                saveCurrentProgress();
            }
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
                delete inputEl.dataset.diceProficient;
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
                    delete inputEl.dataset.diceProficient;
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
            delete inputEl.dataset.diceProficient;
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

        /* ===== 高光演出中樞(2026/07/10):依原始訊息內容裝飾系統提示 =====
           live=true 是當下發生(播進場動畫、面板回饋);live=false 是重繪歷史
           (只套「身分樣式」:成就揭幕線、章節分隔線常駐,瞬時動畫不重播)。
           偵測用 chatScripts 內的原始字串,樣式全部走主題色票。 */
        function decorateSystemAlert(alertDiv, rawMsg, live) {
            const raw = valueToText(rawMsg);
            /* 骰點大成功/大失敗:僅 live 播閃光動畫(身分色線實測觀感不佳,已移除) */
            if (live && /｜(大成功|Crit!)｜/.test(raw)) alertDiv.classList.add('dice-crit');
            else if (live && /｜(大失敗|Fumble)｜/.test(raw)) alertDiv.classList.add('dice-fumble');
            /* 道具獲得(瞬時,僅 live):角色面板標籤點頭(2026/07/10 定案,訊息本身不加特效) */
            if (live && /^獲得道具 \[/.test(raw)) {
                const panelTab = document.getElementById('floating-menu-btn');
                if (panelTab) {
                    panelTab.classList.remove('tab-nod');
                    void panelTab.offsetWidth;
                    panelTab.classList.add('tab-nod');
                    window.setTimeout(() => panelTab.classList.remove('tab-nod'), 900);
                }
            }
            /* 成就達成(身分):F 揭幕線;live 加進場動畫,成長點數字閃一下 */
            if (/^— 成就達成：/.test(raw)) {
                alertDiv.className = 'ach-banner' + (live ? ' lit' : '');
                const title = document.createElement('span');
                title.className = 'ach-banner-title';
                title.textContent = alertDiv.innerText;
                alertDiv.innerText = '';
                alertDiv.appendChild(title);
                if (live) {
                    window.setTimeout(() => alertDiv.classList.remove('lit'), 1600);
                    const growthEl = document.querySelector('.growth-points');
                    if (growthEl) {
                        growthEl.classList.remove('growth-flash');
                        void growthEl.offsetWidth;
                        growthEl.classList.add('growth-flash');
                        window.setTimeout(() => growthEl.classList.remove('growth-flash'), 900);
                    }
                }
                return;
            }
            /* 章節收束(身分):落幕分隔線常駐;live 走「燈暗→雙線→落款→燈亮」 */
            const chapterMatch = raw.match(/^— 本場目標達成：([\s\S]*?)（章節收束/);
            if (chapterMatch) {
                const objectiveText = chapterMatch[1].trim();
                alertDiv.className = 'chapter-divider' + (live ? ' enter' : '');
                alertDiv.innerText = '';
                const t = key => (window.uiMessage ? window.uiMessage(key) : key);
                const topRule = document.createElement('span'); topRule.className = 'chapter-rule top';
                const heading = document.createElement('span'); heading.className = 'chapter-heading';
                heading.textContent = t('章節收束');
                const objective = document.createElement('span'); objective.className = 'chapter-objective';
                objective.textContent = (window.uiMessage ? window.uiMessage('本場目標達成「{text}」', { text: objectiveText }) : `本場目標達成「${objectiveText}」`);
                const grant = document.createElement('span'); grant.className = 'chapter-grant';
                grant.textContent = t('+1 成長點');
                const bottomRule = document.createElement('span'); bottomRule.className = 'chapter-rule bottom';
                alertDiv.append(topRule, heading, objective, grant, bottomRule);
                if (live) {
                    const dialogueBox = document.getElementById('dialogue-box');
                    if (dialogueBox) {
                        dialogueBox.classList.add('chapter-dim');
                        window.setTimeout(() => dialogueBox.classList.remove('chapter-dim'), 1500);
                    }
                    window.setTimeout(() => alertDiv.classList.remove('enter'), 2500);
                }
            }
        }

        function createSystemAlert(msg) {
            chatScripts[currentChatPageIndex].push(`\u3010\u7cfb\u7d71\u63d0\u793a\u3011\uff1a${msg}`);
            const displayMsg = window.uiSystemMessage ? window.uiSystemMessage(msg) : msg;
            const msgBox = document.getElementById('dialogue-box');
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert-msg';
            alertDiv.innerText = displayMsg;
            decorateSystemAlert(alertDiv, msg, true);
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
let survivalFxLastBackTextAt = 0;
let survivalFxLastSignalAt = 0;
let survivalFxHiddenCooldown = 0;
let survivalFxLastTextCorruptAt = 0;
let survivalFxActiveOption = null;
let survivalFxOptionAnimationFrame = 0;
let survivalFxOptionState = new WeakMap();
let survivalFxOptionDelegated = false;
let survivalFxPointer = { x: 0, y: 0, active: false };
let survivalFxSeenInitialSignal = false;

function getSurvivalFxState() {
    const mode = (typeof getEffectiveSurvivalFxMode === 'function') ? getEffectiveSurvivalFxMode() : 'full';
    const hp = normalizeSurvivalValue(currentHp, 100);
    const san = normalizeSurvivalValue(currentSan, 100);
    const hpSeverity = (mode !== 'off' && hp <= 20) ? Math.max(0, Math.min(1, (22 - hp) / 22)) : 0;
    const sanSeverity = (mode !== 'off' && san <= 20) ? Math.max(0, Math.min(1, (22 - san) / 22)) : 0;
    const severity = Math.max(hpSeverity, sanSeverity);
    return {
        hp,
        san,
        hpSeverity,
        sanSeverity,
        severity,
        active: severity > 0,
        zero: hp <= 0 || san <= 0,
        mode,
        reduced: mode === 'reduced'
    };
}

function getSurvivalFxFrequencyProfile(state = getSurvivalFxState()) {
 const sanTier = state.san <= 5 ? 3 : (state.san <= 10 ? 2 : (state.san <= 20 ? 1 : 0));
 if (sanTier >= 3) {
  return {
   sanTier,
   tickMin: 380,
   tickJitter: 320,
   backTextGap: 3000,
   backTextChance: 0.42,
   shardGap: 5600,
   shardChance: 0.32,
   corruptGap: 1100,
   corruptChance: 0.85,
   corruptFrames: 10,
   corruptAmount: 0.55,
   corruptStepMs: 52
  };
 }
 if (sanTier >= 2) {
  return {
   sanTier,
   tickMin: 520,
   tickJitter: 420,
   backTextGap: 4300,
   backTextChance: 0.30,
   shardGap: 7800,
   shardChance: 0.22,
   corruptGap: 1600,
   corruptChance: 0.70,
   corruptFrames: 8,
   corruptAmount: 0.42,
   corruptStepMs: 58
  };
 }
 if (sanTier === 1) {
  return {
   sanTier,
   tickMin: 780,
   tickJitter: 560,
   backTextGap: 6800,
   backTextChance: 0.18,
   shardGap: 11200,
   shardChance: 0.13,
   corruptGap: 3000,
   corruptChance: 0.45,
   corruptFrames: 5,
   corruptAmount: 0.28,
   corruptStepMs: 70
  };
 }
 return {
  sanTier,
  tickMin: 1100,
  tickJitter: 820,
  backTextGap: 9800,
  backTextChance: 0,
  shardGap: 15000,
  shardChance: 0,
  corruptGap: 5000,
  corruptChance: 0,
  corruptFrames: 4,
  corruptAmount: 0.12,
  corruptStepMs: 72
 };
}

function ensureSurvivalFxLayer() {
    let layer = document.getElementById('survival-effects-layer');
    if (!layer) {
        layer = document.createElement('div');
        layer.id = 'survival-effects-layer';
        layer.setAttribute('aria-hidden', 'true');
        layer.innerHTML = '<div class="survival-fx-darkness"></div><canvas id="survival-grain-canvas"></canvas><div class="survival-fx-scan"></div><div class="survival-fx-vignette"></div><div class="survival-fx-backtexts" id="survival-fx-backtexts"></div><div class="survival-fx-signals" id="survival-fx-signals"></div><div class="survival-fx-shards" id="survival-fx-shards"></div>';
        document.body.appendChild(layer);   /* 全螢幕層,放 body 直下(fixed 不能被 transform 祖先影響) */
    }
    return layer;
}

function resizeSurvivalGrainCanvas(canvas) {
    const scale = window.innerWidth <= 720 ? 0.20 : 0.24;
    const width = Math.max(96, Math.min(360, Math.floor(window.innerWidth * scale)));
    const height = Math.max(72, Math.min(240, Math.floor(window.innerHeight * scale)));
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
    }
}

function drawSurvivalGrain() {
    const canvas = document.getElementById('survival-grain-canvas');
    if (!canvas || !document.body.classList.contains('survival-fx-active')) {
        survivalFxGrainTimer = null;
        return;
    }
    const state = getSurvivalFxState();
    resizeSurvivalGrainCanvas(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const image = ctx.createImageData(canvas.width, canvas.height);
    const data = image.data;
    const grainChance = 0.12 + state.severity * 0.18;
    for (let i = 0; i < data.length; i += 4) {
        if (Math.random() > grainChance) {
            data[i + 3] = 0;
            continue;
        }
        const shade = 70 + Math.floor(Math.random() * 86);
        const warm = Math.random() < 0.30;
        data[i] = shade + (warm ? 8 : 0);
        data[i + 1] = shade + (warm ? 5 : 0);
        data[i + 2] = shade + Math.floor(Math.random() * 6);
        data[i + 3] = 8 + Math.floor(Math.random() * 18);
    }
    ctx.putImageData(image, 0, 0);
    const delay = document.hidden ? 900 : 210 + Math.floor(state.severity * 90);
    survivalFxGrainTimer = window.setTimeout(drawSurvivalGrain, delay);
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
    if (!state.active || state.reduced) return;
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
    const pushLines = (type, value, maxLines, maxLength) => {
        survivalFxExtractLines(value, maxLines, maxLength).forEach(text => {
            if (survivalFxIsUsefulDoubtText(text)) fragments.push({ type, text });
        });
    };
    pushLines('log', currentAdventureLog, 10, 52);
    pushLines('summary', currentStorySummary, 7, 52);
    pushLines('task', currentOpenTasks, 6, 48);
    pushLines('relationship', currentRelationshipSummary, 6, 48);
    if (Array.isArray(currentFlags)) currentFlags.forEach(flag => {
        const text = survivalFxCleanText(flag, 44);
        if (survivalFxIsUsefulDoubtText(text)) fragments.push({ type: 'flag', text });
    });
    const scene = currentScenario && currentScenario.scenarios && currentScenario.scenarios[currentScenarioIndex];
    if (scene && scene.name) {
        const text = survivalFxCleanText(scene.name, 32);
        if (survivalFxIsUsefulDoubtText(text)) fragments.push({ type: 'scene', text });
    }
    if (currentScenario && Array.isArray(currentScenario.npcs)) currentScenario.npcs.forEach(npc => {
        const name = survivalFxCleanText(npc && npc.name, 24);
        if (survivalFxIsUsefulDoubtText(name)) fragments.push({ type: 'npc', text: name });
    });
    return fragments.filter(item => item.text);
}

function survivalFxIsUsefulDoubtText(text) {
    if (!text) return false;
    return !/(SAN|HP|精神瀕臨崩潰|瀕死狀態|低 SAN|低 HP|臨界|崩潰|^無$|尚無|目前沒有|故事剛開始)/i.test(text);
}

function survivalFxUiMessage(zh, params = {}) {
    if (typeof uiMessage === 'function') return uiMessage(zh, params);
    return Object.entries(params).reduce((value, [key, replacement]) => value.replaceAll(`{${key}}`, replacement), zh);
}

function buildSurvivalDoubtText() {
    const fragments = getSurvivalDoubtFragments();
    const fallbackMemories = [
        '冒險日誌裡空白的地方',
        '你剛剛選過的路',
        '那些還沒說出口的承諾'
    ];
    const fallback = fallbackMemories[Math.floor(Math.random() * fallbackMemories.length)];
    const picked = fragments.length ? fragments[Math.floor(Math.random() * fragments.length)] : { type: 'fallback', text: survivalFxUiMessage(fallback) };
    const questions = [
        '這些回憶也變得不那麼重要了嗎…',
        '你真的還記得自己答應過什麼嗎…',
        '有些約定，不是忘記就能消失。',
        '你現在的選擇，真的接得上嗎…',
        '你是想離開它，還是只是忘了它…',
        '它還留在這裡。你也還在嗎…',
        '如果這是真的，你為什麼要往反方向走…',
        '你確定要把它留在身後嗎…',
        '那時候的你，也是這樣想的嗎…',
        '這段紀錄還相信你。你呢…',
        '你正在保護它，還是在拆掉它…',
        '別裝作沒看見。',
        '它不是自己出現在這裡的。',
        '你要把這件事也改寫掉嗎…',
        '如果這不重要，為什麼它還在這裡…',
        '你真的分得清現在和剛才嗎…',
        '這一步之後，還回得去嗎…',
        '你明明看見了。',
        '這不是別人的記憶。',
        '你要假裝它沒有重量嗎…'
    ];
    return {
        memory: picked.text,
        question: survivalFxUiMessage(questions[Math.floor(Math.random() * questions.length)])
    };
}
function survivalFxGlitchText(text, amount = 0.18) {
    const glyphs = '░▒▓█#@%&!?<>/\\|[]{}01記憶痛苦忘記NULLLOG';
    return Array.from(text).map(ch => {
        if (/\s|，|。|、|：|；|！|？/.test(ch) || Math.random() > amount) return ch;
        return glyphs[Math.floor(Math.random() * glyphs.length)];
    }).join('');
}

function survivalFxRandomGlyphs(length) {
    const glyphs = '░▒▓█#@%&!?<>/\\|[]{}01記憶痛苦忘記NULLLOG';
    return Array.from({ length: Math.max(1, length) }, () => glyphs[Math.floor(Math.random() * glyphs.length)]).join('');
}

function buildSurvivalBackTextContent() {
    const fragments = getSurvivalDoubtFragments();
    const painWords = [
        '好難過',
        '好痛',
        '好痛苦',
        '不要忘記',
        '你記得嗎',
        '不要丟下它',
        '回不去了',
        '不是假的',
        '還在這裡',
        '別裝作沒看見'
    ].map(word => survivalFxUiMessage(word));
    const usePainWord = !fragments.length || Math.random() < 0.42;
    const picked = usePainWord ? painWords[Math.floor(Math.random() * painWords.length)] : fragments[Math.floor(Math.random() * fragments.length)].text;
    const base = survivalFxCleanText(picked, Math.random() < 0.62 ? 8 : 18);
    const alternate = painWords[Math.floor(Math.random() * painWords.length)];
    const target = Math.random() < 0.52 ? alternate : survivalFxCleanText(base, Math.max(4, Math.ceil(base.length * 0.72)));
    return {
        base,
        target,
        corruptTarget: survivalFxGlitchText(target, 0.46)
    };
}

function animateSurvivalBackText(el, content, life) {
    const baseChars = Array.from(content.base || '');
    const targetChars = Array.from(content.corruptTarget || content.target || content.base || '');
    const timers = [];
    const setLater = (delay, fn) => {
        const timer = window.setTimeout(() => {
            if (!el.isConnected) return;
            fn();
        }, delay);
        timers.push(timer);
    };
    let t = 420;
    setLater(0, () => {
        el.dataset.phase = 'hold';
        el.textContent = content.base;
        el.classList.remove('is-corrupt');
    });
    for (let i = baseChars.length; i >= Math.max(1, Math.floor(baseChars.length * 0.18)); i -= 1) {
        const count = i;
        setLater(t, () => {
            el.dataset.phase = 'erase';
            el.textContent = baseChars.slice(0, count).join('');
            el.classList.toggle('is-corrupt', count % 2 === 0);
        });
        t += 68 + Math.random() * 26;
    }
    const typedLength = Math.max(2, targetChars.length);
    for (let i = 1; i <= typedLength; i += 1) {
        const count = i;
        setLater(t, () => {
            el.dataset.phase = 'type';
            const typed = targetChars.slice(0, count).join('');
            const noise = Math.random() < 0.52 ? survivalFxRandomGlyphs(Math.max(1, targetChars.length - count)).slice(0, 2) : '';
            el.textContent = typed + noise;
            el.classList.add('is-corrupt');
        });
        t += 72 + Math.random() * 34;
    }
    for (let i = 0; i < 5; i += 1) {
        setLater(t, () => {
            el.dataset.phase = 'break';
            el.textContent = Math.random() < 0.5 ? survivalFxGlitchText(content.target, 0.58) : survivalFxRandomGlyphs(targetChars.length || 4);
            el.classList.toggle('is-corrupt');
        });
        t += 110 + Math.random() * 80;
    }
    setLater(Math.min(t, life - 520), () => {
        el.dataset.phase = 'hold';
        el.textContent = Math.random() < 0.48 ? content.target : survivalFxGlitchText(content.target, 0.30);
        el.classList.add('is-corrupt');
    });
    window.setTimeout(() => timers.forEach(timer => window.clearTimeout(timer)), life + 90);
}

function createSurvivalBackText() {
    const state = getSurvivalFxState();
    if (!state.active || state.reduced) return;
    const wrap = document.getElementById('survival-fx-backtexts');
    if (!wrap) return;
    while (wrap.children.length > 2) wrap.firstElementChild.remove();
    const content = buildSurvivalBackTextContent();
    const el = document.createElement('div');
    el.className = 'survival-fx-backtext';
    el.textContent = content.base;
    if ((content.base || '').length > 6) el.classList.add('is-long');
    const x = -12 + Math.random() * 92;
    const y = -12 + Math.random() * 58;
    el.style.left = x.toFixed(1) + 'vw';
    el.style.top = y.toFixed(1) + 'vh';
    el.style.setProperty('--backtext-size', (138 + Math.random() * 62 + state.severity * 18).toFixed(0) + 'px');
    const life = 3600 + Math.random() * 1200 + state.severity * 650;
    el.style.setProperty('--backtext-life', life.toFixed(0) + 'ms');
    wrap.appendChild(el);
    animateSurvivalBackText(el, content, life);
    window.setTimeout(() => el.remove(), life + 100);
}
/* 低 SAN 環境效果:輸入框 placeholder 偶爾閃一下亂碼再復原(不動玩家輸入的內容) */
function glitchPlayerInputPlaceholder() {
 const input = document.getElementById('player-input');
 if (!input || document.activeElement === input || input.value) return;
 if (input.dataset.baseholder || Math.random() > 0.45) return;
 input.dataset.baseholder = input.placeholder;
 input.placeholder = survivalFxGlitchText(input.placeholder, 0.35);
 window.setTimeout(() => {
  if (input.dataset.baseholder) input.placeholder = input.dataset.baseholder;
  delete input.dataset.baseholder;
 }, 900);
}

function createSurvivalShard() {
 const state = getSurvivalFxState();
 if (!state.active || state.reduced) return;
 const wrap = document.getElementById('survival-fx-shards');
 if (!wrap) return;
 wrap.querySelectorAll('.survival-fx-shard').forEach(node => node.remove());
 const content = buildSurvivalDoubtText();
 const el = document.createElement('div');
 el.className = 'survival-fx-shard survival-fx-doubt';
 el.dataset.glitch = survivalFxGlitchText((content.memory + ' ' + content.question).slice(0, 44), 0.34);
 const memory = document.createElement('div');
 memory.className = 'survival-fx-memory';
 memory.textContent = content.memory;
 const question = document.createElement('div');
 question.className = 'survival-fx-question';
 question.textContent = content.question;
 el.append(memory, question);
 const width = Math.min(380, Math.max(260, window.innerWidth * 0.28));
 el.style.width = width + 'px';
 /* 出現位置全螢幕隨機(不固定角落),僅避開最邊緣 22px */
 const maxLeft = Math.max(22, window.innerWidth - width - 22);
 el.style.left = (22 + Math.random() * Math.max(0, maxLeft - 22)) + 'px';
 el.style.setProperty('--exit', (Math.random() < 0.5 ? '-10px' : '10px'));
 el.style.top = (12 + Math.random() * 58) + 'vh';
 const life = 2600 + Math.random() * 900 + state.sanSeverity * 420;
 el.style.setProperty('--survival-shard-life', life.toFixed(0) + 'ms');
 wrap.appendChild(el);
 window.setTimeout(() => el.remove(), life + 100);
}

function getSurvivalCorruptTargets() {
 const bubbleTargets = Array.from(document.querySelectorAll('#dialogue-box .msg-wrapper .msg-text'));
 const narrativeTargets = Array.from(document.querySelectorAll('#dialogue-box .msg-narrative'));
 const systemTargets = Array.from(document.querySelectorAll('#dialogue-box .system-msg'));
 return bubbleTargets.concat(narrativeTargets, systemTargets)
  .filter(el => el && el.textContent && el.textContent.trim().length >= 4 && !el.dataset.survivalOriginal && el.style.display !== 'none' && !(el.parentNode && el.parentNode.querySelector && el.parentNode.querySelector('.msg-edit-area')));
}

function corruptSurvivalTextOnce(profile = null) {
 const state = getSurvivalFxState();
 const fxProfile = profile || getSurvivalFxFrequencyProfile(state);
 if (!state.active || !fxProfile.sanTier) return;
 const targets = getSurvivalCorruptTargets();
 if (!targets.length) return;
 const recentBubbles = targets.filter(el => el.classList.contains('msg-text')).slice(-5);
 const pool = recentBubbles.length ? recentBubbles : targets.slice(-6);
 const el = pool[Math.floor(Math.random() * pool.length)];
 const original = el.textContent;
 el.dataset.survivalOriginal = original;
 el.classList.add('survival-corrupting');
 let frame = 0;
 const glyphs = '????#@%&!?<>/\|[]{}01SANNULLLOG??????';
 const frames = fxProfile.corruptFrames || 4;
 const amount = fxProfile.corruptAmount || 0.18;
 const timer = window.setInterval(() => {
  frame += 1;
  el.textContent = Array.from(original).map(ch => {
   const keepCode = ch.charCodeAt(0);
   const keepMark = keepCode === 0xff0c || keepCode === 0x3002 || keepCode === 0x3001 || keepCode === 0xff1a || keepCode === 0xff1b || keepCode === 0xff1f || keepCode === 0xff01 || keepCode === 0x300c || keepCode === 0x300d;
   if (/\s/.test(ch) || keepMark || ',.!?;:'.includes(ch) || Math.random() > amount) return ch;
   return glyphs[Math.floor(Math.random() * glyphs.length)];
  }).join('');
  if (frame >= frames) {
   window.clearInterval(timer);
   el.textContent = original;
   el.classList.remove('survival-corrupting');
   delete el.dataset.survivalOriginal;
  }
 }, fxProfile.corruptStepMs || 64);
}

function runSurvivalAmbientEffects() {
 const state = getSurvivalFxState();
 survivalFxAmbientTimer = null;
 if (!state.active || document.hidden) {
  survivalFxAmbientTimer = window.setTimeout(runSurvivalAmbientEffects, 1800);
  return;
 }
 const profile = getSurvivalFxFrequencyProfile(state);
 const now = Date.now();
 if (!survivalFxSeenInitialSignal) {
  survivalFxSeenInitialSignal = true;
  survivalFxLastSignalAt = now;
 }
 if (profile.backTextChance > 0 && now - survivalFxLastBackTextAt > profile.backTextGap && Math.random() < profile.backTextChance) {
  survivalFxLastBackTextAt = now;
  createSurvivalBackText();
 }
 if (profile.shardChance > 0 && now - survivalFxLastShardAt > profile.shardGap && Math.random() < profile.shardChance) {
  survivalFxLastShardAt = now;
  createSurvivalShard();
 }
 if (profile.corruptChance > 0 && now - survivalFxLastTextCorruptAt > profile.corruptGap && Math.random() < profile.corruptChance) {
  survivalFxLastTextCorruptAt = now;
  corruptSurvivalTextOnce(profile);
 }
 glitchPlayerInputPlaceholder();

 survivalFxAmbientTimer = window.setTimeout(runSurvivalAmbientEffects, profile.tickMin + Math.random() * profile.tickJitter);
}

function startSurvivalAmbientEffects() {
    if (!survivalFxAmbientTimer) runSurvivalAmbientEffects();
}

function stopSurvivalAmbientEffects() {
    if (survivalFxAmbientTimer) window.clearTimeout(survivalFxAmbientTimer);
    survivalFxAmbientTimer = null;
    survivalFxSeenInitialSignal = false;
    document.querySelectorAll('.survival-fx-signal,.survival-fx-shard,.survival-fx-backtext').forEach(node => node.remove());
}

function shouldApplySurvivalOptionInterference() {
    return getGameInputMode() === 'character';
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
    btn.classList.remove('survival-option-drifting', 'survival-option-corrupt', 'survival-option-mutated');
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
    if (fx.sanSeverity <= 0 || fx.reduced || !btn || !shouldApplySurvivalOptionInterference()) return;
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
    const horizontal = (strong ? 8 : 5) + Math.random() * (strong ? 8 : 5);
 const verticalPool = [-4, -2, 0, 2, 4];
 const yPick = verticalPool[Math.floor(Math.random() * verticalPool.length)] + Math.random() * 2 - 1;
 state.tx = Math.round(Math.max(-18, Math.min(18, side * horizontal * (0.72 + fx.sanSeverity * 0.12))));
 state.ty = Math.round(Math.max(-6, Math.min(6, yPick)));
 state.hover = true;
    state.nextNudge = Date.now() + 560 + Math.random() * 520;
    btn.classList.add('survival-option-drifting');
    scheduleSurvivalOptionAnimation();
    }

function buildOptionMetaRow(check = '', difficulty = 'normal', proficient = false) {
    const meta = document.createElement('span');
    meta.className = 'opt-meta';
    const statInfo = check && DICE_STATS[check] ? DICE_STATS[check] : null;
    if (statInfo) {
        const tag = document.createElement('span');
        tag.className = 'opt-tag';
        const category = DICE_CHECK_CATEGORIES[check] || '';
        const categoryWord = category && window.uiMessage ? window.uiMessage(category) : category;
        tag.textContent = categoryWord ? `${categoryWord}・${statInfo.code}` : statInfo.code;
        meta.appendChild(tag);
        const diffInfo = DICE_DIFFICULTIES[difficulty] || DICE_DIFFICULTIES.normal;
        const diff = document.createElement('span');
        diff.className = 'opt-diff';
        diff.textContent = window.uiMessage ? window.uiMessage(diffInfo.label) : diffInfo.label;
        meta.appendChild(diff);
        if (proficient === true) {
            const prof = document.createElement('span');
            prof.className = 'opt-prof';
            prof.textContent = window.uiMessage ? window.uiMessage('★熟練') : '★熟練';
            meta.appendChild(prof);
        }
    } else {
        const free = document.createElement('span');
        free.className = 'opt-diff';
        free.textContent = window.uiMessage ? window.uiMessage('自由行動') : '自由行動';
        meta.appendChild(free);
    }
    return meta;
}

function applyOptionCardContent(btn, text, check = '', difficulty = 'normal', proficient = false) {
    btn.textContent = '';
    btn.appendChild(buildOptionMetaRow(check, difficulty, proficient));
    const textSpan = document.createElement('span');
    textSpan.className = 'opt-text';
    textSpan.textContent = text;
    btn.appendChild(textSpan);
}

function getSurvivalOptionMainText(btn) {
    if (!btn) return '';
    if (btn.dataset && btn.dataset.survivalOptionText) return btn.dataset.survivalOptionText.trim();
    const clone = btn.cloneNode(true);
    clone.querySelectorAll('.opt-check-label, .opt-meta').forEach(label => label.remove());
    return clone.textContent.trim();
}

function setSurvivalOptionVisibleText(btn, text, check = '', difficulty = 'normal', proficient = false) {
    if (!btn) return;
    applyOptionCardContent(btn, text, check, difficulty, proficient === true);
}

function getSurvivalHiddenOption(btn) {
 if (!btn?.dataset?.survivalHiddenText) return null;
 const text = valueToText(btn.dataset.survivalHiddenText).trim();
 if (!text) return null;
 return {
 text,
 check: normalizeDiceStatKey(btn.dataset.survivalHiddenCheck) || 'wis',
 difficulty: normalizeDiceDifficulty(btn.dataset.survivalHiddenDifficulty || 'hard'),
 forceDice: btn.dataset.survivalHiddenForceDice === '1',
 proficient: false
 };
}

function getSurvivalOptionMutation(btn, originalText, originalCheck = '', originalDifficulty = 'normal') {
 const state = getSurvivalFxState();
 if (state.sanSeverity <= 0 || state.reduced || !btn || !shouldApplySurvivalOptionInterference()) return null;
 const original = valueToText(originalText).trim();
 const wasOnHiddenCooldown = survivalFxHiddenCooldown > 0;
 if (survivalFxHiddenCooldown > 0) survivalFxHiddenCooldown -= 1;
 const hidden = getSurvivalHiddenOption(btn);
 const hiddenChance = 0.13 + state.sanSeverity * 0.28;
 if (hidden && hidden.text !== original && !wasOnHiddenCooldown && Math.random() < hiddenChance) {
 survivalFxHiddenCooldown = 2;
 return {
 text: hidden.text,
 check: hidden.check || originalCheck || 'wis',
 difficulty: 'normal',
 proficient: false,
 forceDice: false,
 original
 };
 }
 const chance = Math.min(0.35, 0.18 + state.sanSeverity * 0.46);
 if (Math.random() > chance) return null;
 const candidates = Array.from(document.querySelectorAll('#options-area .opt-btn'))
 .filter(other => other !== btn)
 .map(other => ({
 text: getSurvivalOptionMainText(other),
 check: other.dataset.survivalOptionCheck || '',
 difficulty: other.dataset.survivalOptionDifficulty || 'normal',
 proficient: other.dataset.survivalOptionProficient === '1'
 }))
 .filter(item => item.text && item.text !== original);
 if (!candidates.length) return null;
 const picked = candidates[Math.floor(Math.random() * candidates.length)];
 return {
 text: picked.text,
 check: picked.check || originalCheck || '',
 difficulty: picked.difficulty || originalDifficulty || 'normal',
 proficient: picked.proficient === true,
 forceDice: false,
 original
 };
}

function handleSurvivalOptionClick(btn, text, check = '', difficulty = 'normal', proficient = false) {
    if (!shouldApplySurvivalOptionInterference()) {
        resetSurvivalOption(btn);
        selectOption(text, check, difficulty, proficient);
        return;
    }
    const mutation = getSurvivalOptionMutation(btn, text, check, difficulty);
    if (!mutation) {
        selectOption(text, check, difficulty, proficient);
        return;
    }
    btn.dataset.survivalGhost = mutation.original;
    btn.classList.add('survival-option-corrupt', 'survival-option-mutated');
    setSurvivalOptionVisibleText(btn, mutation.text, mutation.check, mutation.difficulty, mutation.proficient);
    nudgeSurvivalOption(btn, true);
    selectOption(mutation.text, mutation.check, mutation.difficulty, mutation.proficient);
    window.setTimeout(() => {
        if (mutation.forceDice && typeof sendDiceChoice === 'function') sendDiceChoice();
 else if (typeof sendChoice === 'function') sendChoice();
    }, 90);
}


function isPointerInsideOption(btn, pad = 8) {
    const rect = btn.getBoundingClientRect();
    return survivalFxPointer.x >= rect.left - pad && survivalFxPointer.x <= rect.right + pad && survivalFxPointer.y >= rect.top - pad && survivalFxPointer.y <= rect.bottom + pad;
}

function scheduleSurvivalOptionAnimation() {
    if (survivalFxOptionAnimationFrame) return;
    survivalFxOptionAnimationFrame = window.requestAnimationFrame(animateSurvivalOptions);
}

function animateSurvivalOptions() {
    survivalFxOptionAnimationFrame = 0;
    const btn = survivalFxActiveOption;
    if (!btn) return;
    const state = getSurvivalOptionState(btn);
    if (!state.hover) return;
    const dx = state.tx - state.x;
    const dy = state.ty - state.y;
    /* 指數緩動（原版手感）：每幀走剩餘距離的 5.8%，越接近越慢，保留「默默滑開」的黏滯感；
       距離小於 0.5px 時直接吸附到位並停止排程，避免 SAN 恢復後動畫殘留。 */
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
        state.x = state.tx;
        state.y = state.ty;
        btn.style.transform = `translate3d(${state.tx}px, ${state.ty}px, 0)`;
        return;
    }
    state.x += dx * 0.058;
    state.y += dy * 0.058;
    btn.style.transform = `translate3d(${state.x.toFixed(1)}px, ${state.y.toFixed(1)}px, 0)`;
    scheduleSurvivalOptionAnimation();
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
    if (typeof schedulePixelGlass === 'function') schedulePixelGlass(0);
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

        let survivalGraceTurns = 0;
        let pendingLastStand = false;
        let pendingLastStandReason = '';
        let restJustUsed = false;
        function resolveSurvivalOutcome(forcedRoll = null, options = {}) {
            if (getCurrentGameOver()) return { gameOver: true, existing: true };
            const zeroKinds = [];
            if (currentHp <= 0) zeroKinds.push('HP');
            if (currentSan <= 0) zeroKinds.push('SAN');
            const inSurvivalGrace = survivalGraceTurns > 0;
            if (inSurvivalGrace && options.consumeGrace !== false) {
                survivalGraceTurns -= 1;
            }

            if (!zeroKinds.length) return { gameOver: false, rescued: false, grace: inSurvivalGrace };

            const mode = getGameDifficultyInfo();
            const reason = `${zeroKinds.join(' 與 ')} 歸零`;

            if (mode.key === 'nightmare') {
                if (currentHp <= 0) currentHp = 1;
                if (currentSan <= 0) currentSan = 1;
                document.getElementById('ui-hp').innerText = currentHp;
                document.getElementById('ui-san').innerText = currentSan;
                if (inSurvivalGrace) {
                    createSystemAlert(survivalFxUiMessage('— 恢復期護盾：{reason}被硬撐住（恢復期剩 {n} 回合）—', { reason: survivalFxUiMessage(reason), n: survivalGraceTurns }));
                    return { gameOver: false, rescued: true, grace: true, reason };
                }
                beginLastStand(reason);
                return { gameOver: false, lastStand: true, reason };
            }

            let survivalRoll = null;
            /* 極限模式已在上方 early-return 進「最後掙扎」，此處只會是標準/困難模式 */
            let gameOver = false;

            if (mode.gameOver === 'possible') {
                survivalRoll = forcedRoll === null ? Math.floor(Math.random() * 20) + 1 : Math.max(1, Math.min(20, Math.round(forcedRoll)));
                gameOver = survivalRoll < 11;
            }

            if (gameOver) {
                savesData[currentSaveId].gameOver = { reason, mode: mode.key, roll: survivalRoll, at: new Date().toLocaleString() };
                createSystemAlert(`— 生死檢定失敗：D20 ${survivalRoll}，GAME OVER —`);
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

        function beginLastStand(reason) {
            pendingLastStand = true;
            pendingLastStandReason = valueToText(reason).slice(0, 80);
            const input = document.getElementById('player-input');
            const sendBtn = document.getElementById('send-btn');
            const diceBtn = document.getElementById('dice-btn');
            if (input) input.disabled = true;
            if (sendBtn) sendBtn.disabled = true;
            if (diceBtn) diceBtn.disabled = true;
            renderLastStandOption(reason);
            createSystemAlert(survivalFxUiMessage('— 瀕死！{reason}——只剩一次生死檢定（D20 ≥8 存活）—', { reason: survivalFxUiMessage(reason) }));
        }

        function renderLastStandOption(reason) {
            const optArea = document.getElementById('options-area');
            if (!optArea) return;
            optArea.innerHTML = '';
            const btn = document.createElement('button');
            btn.className = 'opt-btn last-stand-btn';
            btn.textContent = survivalFxUiMessage('生死檢定：賭一把活下去（D20 ≥8）');
            btn.style.borderColor = 'var(--accent-neon)';
            btn.style.fontWeight = '700';
            btn.onclick = () => rollLastStand(reason);
            optArea.appendChild(btn);
        }

        function rollLastStand(reason) {
            if (!pendingLastStand) return;
            pendingLastStand = false;
            pendingLastStandReason = '';
            const roll = Math.floor(Math.random() * 20) + 1;
            const survived = roll >= 8;
            const optArea = document.getElementById('options-area');
            if (optArea) optArea.innerHTML = '';
            if (!survived) {
                if (currentSaveId && savesData[currentSaveId]) {
                    savesData[currentSaveId].gameOver = { reason, mode: 'nightmare', roll, at: new Date().toLocaleString() };
                }
                createSystemAlert(survivalFxUiMessage('— 生死檢定失敗：D20 {roll}（需 ≥8），GAME OVER —', { roll }));
                applyGameOverUi();
                if (typeof saveCurrentProgress === 'function') saveCurrentProgress();
                return;
            }
            survivalGraceTurns = 3;
            const input = document.getElementById('player-input');
            const sendBtn = document.getElementById('send-btn');
            const diceBtn = document.getElementById('dice-btn');
            if (input) input.disabled = false;
            if (sendBtn) sendBtn.disabled = false;
            if (diceBtn) diceBtn.disabled = false;
            createSystemAlert(survivalFxUiMessage('— 生死檢定成功：D20 {roll}！撐住了——接下來 3 回合免於死亡，快穩住 SAN／HP —', { roll }));
            if (typeof saveCurrentProgress === 'function') saveCurrentProgress();
        }

        function restGainFromResult(result) {
            if (result === '大成功') return 22;
            if (result === '成功') return 14;
            if (result === '失敗') return 6;
            return 0;
        }
        function clearRestCooldown() {
            restJustUsed = false;
        }
        function takeBreath() {
            if (!currentSaveId || !savesData[currentSaveId]) return;
            if (typeof getCurrentGameOver === 'function' && getCurrentGameOver()) return;
            if (restJustUsed) {
                createSystemAlert(survivalFxUiMessage('— 剛喘息過，先做點別的再喘息。—'));
                return;
            }
            const hpFull = currentHp >= 50;
            const sanFull = currentSan >= 50;
            if (hpFull && sanFull) {
                createSystemAlert(survivalFxUiMessage('— 身心尚穩（HP／SAN 已達 50%），喘息幫助不大。—'));
                return;
            }
            const parts = [];
            if (!hpFull) {
                const chk = calculateDiceCheck('con', 'normal', null, { applySurvivalModifier: false });
                const before = currentHp;
                currentHp = Math.min(50, currentHp + restGainFromResult(chk.result));
                parts.push('HP +' + (currentHp - before) + '（CON ' + chk.roll + '）');
            }
            if (!sanFull) {
                const chk = calculateDiceCheck('wis', 'normal', null, { applySurvivalModifier: false });
                const before = currentSan;
                currentSan = Math.min(50, currentSan + restGainFromResult(chk.result));
                parts.push('SAN +' + (currentSan - before) + '（WIS ' + chk.roll + '）');
            }
            const hpEl = document.getElementById('ui-hp'); if (hpEl) hpEl.innerText = currentHp;
            const sanEl = document.getElementById('ui-san'); if (sanEl) sanEl.innerText = currentSan;
            restJustUsed = true;
            if (typeof syncSurvivalFlags === 'function') syncSurvivalFlags({ announce: true });
            if (typeof syncSurvivalVisualEffects === 'function') syncSurvivalVisualEffects();
            if (typeof refreshOpenStatusPanel === 'function') refreshOpenStatusPanel();
            createSystemAlert(survivalFxUiMessage('— 喘息穩住身心：{detail}（上限 50%）—', { detail: parts.join('、') }));
            if (typeof saveCurrentProgress === 'function') saveCurrentProgress();
        }

        function sanitizeItemEffect(raw) {
            if (!raw || typeof raw !== 'object') return null;
            const type = (raw.type === 'hp' || raw.type === 'san') ? raw.type : null;
            if (!type) return null;
            let amount = Math.round(Number(raw.amount));
            if (!Number.isFinite(amount)) return null;
            amount = Math.max(8, Math.min(40, amount));
            return { type, amount };
        }
        function itemEffectLabel(eff) {
            if (!eff) return '';
            const kind = eff.type === 'hp' ? 'HP' : 'SAN';
            return survivalFxUiMessage('回復 {kind} {amount}', { kind, amount: eff.amount });
        }

        /* 名稱效果標記 (SAN±N)/(HP±N) 的單一事實來源(2026/07/10):
           入袋管線(app-ai items_add)與讀檔正規化(loadGame)共用,避免三處正則各自漂移。 */
        function parseItemEffectNameTag(rawName) {
            const text = valueToText(rawName);
            const match = text.match(/[（(]\s*(SAN|HP)\s*[+＋]\s*(\d{1,3})\s*[）)]/i);
            if (!match) return null;
            return {
                type: match[1].toLowerCase() === 'hp' ? 'hp' : 'san',
                amount: Math.max(1, Math.min(40, Number.parseInt(match[2], 10) || 10)),
                cleanName: (text.replace(/[（(]\s*(SAN|HP)\s*[+＋]\s*\d{1,3}\s*[）)]/gi, '').trim() || text).trim()
            };
        }
        function useItem(index) {
            if (!Number.isInteger(index) || index < 0 || index >= currentItems.length) return;
            const name = currentItems[index];
            const eff = (itemEffects && typeof itemEffects === 'object') ? itemEffects[name] : null;
            if (!eff) return;
            let detail = '';
            if (eff.type === 'hp') {
                const before = currentHp;
                currentHp = Math.min(100, currentHp + eff.amount);
                detail = 'HP +' + (currentHp - before);
            } else {
                const before = currentSan;
                currentSan = Math.min(100, currentSan + eff.amount);
                detail = 'SAN +' + (currentSan - before);
            }
            currentItems.splice(index, 1);
            delete itemEffects[name];
            const hpEl = document.getElementById('ui-hp'); if (hpEl) hpEl.innerText = currentHp;
            const sanEl = document.getElementById('ui-san'); if (sanEl) sanEl.innerText = currentSan;
            if (typeof syncSurvivalFlags === 'function') syncSurvivalFlags({ announce: true });
            if (typeof syncSurvivalVisualEffects === 'function') syncSurvivalVisualEffects();
            if (typeof renderItems === 'function') renderItems();
            createSystemAlert(survivalFxUiMessage('— 使用了 {name}：{detail} —', { name, detail }));
            if (typeof saveCurrentProgress === 'function') saveCurrentProgress();
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
                    createSystemAlert(mode.gameOver === 'forced' ? 'HP 歸零：極限模式進入「最後掙扎」（D20 ≥ 8 存活）。' : mode.gameOver === 'possible' ? 'HP 歸零：困難模式進入致命結局判定。' : 'HP 歸零：保護機制啟動，下一回合優先演出救援。');
                }
                else if (flag === AUTO_SURVIVAL_FLAGS.hpCritical) createSystemAlert('HP 已進入重傷區間，後續行動與判定將受到影響。');
                else if (flag === AUTO_SURVIVAL_FLAGS.sanZero) {
                    const mode = getGameDifficultyInfo();
                    createSystemAlert(mode.gameOver === 'forced' ? 'SAN 歸零：極限模式進入「最後掙扎」（D20 ≥ 8 存活）。' : mode.gameOver === 'possible' ? 'SAN 歸零：困難模式進入致命結局判定。' : 'SAN 歸零：照護機制啟動，下一回合優先處理精神崩潰。');
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
