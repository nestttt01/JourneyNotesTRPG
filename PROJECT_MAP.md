# 專案地圖

本專案是純前端單頁遊戲。`index.html`、`i18n.js` 維持單檔；原本的 `app.js` 已依功能拆成 13 個 `app-*.js` 模組（純搬移、無邏輯改動），2026-07-24 再新增獨立的 `app-dice-effects.js`，目前共 14 個模組。全部以 classic `<script>` 標籤共用同一個全域範圍，依 `index.html` 既有順序載入；`app-dice-effects.js` 必須位於 `app-gameplay.js` 前。原本的 `style.css` 已於 2026-07-16 依原檔順序純搬移拆成 7 個 `style-*.css`（bytes 級切片、內容零改動），依 `index.html` 的 `<link>` 順序載入（等同原檔由上而下）。**`<script>` 與 `<link>` 載入順序都不可任意重排。**

- `index.html`：畫面結構、主要 modal、各頁 DOM 節點、按鈕事件入口。
- `style-1-base.css` ～ `style-7-game.css`：全站樣式（原單檔 `style.css` 依序切成 7 檔），分工見下方「CSS 區域地圖」。
- `i18n.js`：UI 多語言字典、動態訊息翻譯、語言切換。
- `package.json`／`package-lock.json`：鎖定 Playwright 測試依賴與 `npm test` 指令。
- `playwright.config.js`：以本機 HTTP server 啟動真頁面，單一 Chromium worker 執行 E2E。
- `tests/e2e/`：Playwright 回歸測試；fixture 全為合成資料。`dice-visual.spec.js` 鎖定 B／D／D／C、0.5 倍速、旋轉同態、自然 1 垂直接地、reduced-motion 與硬判定揭示順序。

- 拆分前的舊單檔 `app.js` 已移除；如需對照原始碼，請查 git 歷史。

正式 JS 模組（依載入順序）：

- `app-core.js`：啟動、`window.onerror`、全域狀態變數、`getModelRuntimeProfile()`、首頁導覽外殼、UI 主題、材質切換（Classic/Liquid Glass）。
- `app-storage.js`：IndexedDB／localStorage 持久化層、兩階段舊資料遷移、`window.onload` 主載入與損壞配置修復。
- `app-ui-helpers.js`：`loadPic`、首頁語言切換、玩家屬性骰點、頭像裁切 modal。
- `app-backup-io.js`：匯出匯入、sanitize、`buildBackupPayload()`、`validateImportCollections()`、存檔選取、`importPresetConfig()`。
- `app-memory.js`：語言指令、API 用量統計、`uiText` 系列、冒險日誌／記憶／任務清單輔助。
- `app-scenario-state.js`：`persistJson()`、情境快照、動態狀態、NPC 死亡與好感、狀態摘要渲染。
- `app-api.js`：API key 與模型（危險區）。
- `app-config-ui.js`：桌機角色配置 UI、配置概覽、NPC 與情境列表、`syncEditingDataFromDOM()`。
- `app-preset-edit.js`：語音測試（文字欄位白名單）、AI 隨機生成、配置表單與儲存／刪除、modal NPC／情境。
- `app-status-journal.js`：狀態面板、Flags、道具、冒險日誌頁、日記收藏頁（英文介面顯示 Diary）與整理 prompt。
- `app-saves-game.js`：存檔選單與列表、驗證後匯入、`saveCurrentProgress()`（含可選 `survivalState`）、情境管理、`getCompactSystemInstruction()`、場景切換、模型清單載入。
- `app-dice-effects.js`：正式 3D 像素 D20 幾何、B／D／D／C 結果演出、自然 1 介面接地、reduced-motion 與重入／取消清理；只呈現 `check`，不參與硬判定。
- `app-gameplay.js`：對話渲染、頭像、訊息右鍵/長按選單、日記範圍收藏、`loadGame`（含生存狀態還原）、骰點、輸入、場景參與、創作者模式、生存。
- `app-ai.js`：AI 請求、請求情境失效檢查、JSON 解析與修復、語言修復、記憶整理 prompt、`buildLatestActionPrompt()`／`buildGamePrompt()`／`callAI_JSON()`（危險區）。

> 下方各區段沿用原本依功能分類的整理，函式所在模組已標在每個小節標題後（格式：`〔模組：app-xxx.js〕`）。同一功能可能跨兩個模組，會一併列出。

> 本檔只記錄目前架構；版本與事故沿革已移至私有的 `PROJECT_HISTORY.md`，歷史描述不得覆蓋現行程式碼。

## 主要 HTML 區域

`index.html`

- 首頁 / API：
  - `#setup-screen`
  - `#api-provider`
  - `#api-key`
  - `#remember-api-key`
  - `#verify-btn`
  - `#delete-key-btn`
  - `#model-selection-area`
- 角色與情境配置：
  - `#edit-scenario-screen`
  - `#desktop-config-overview`
  - `#desktop-config-editor`
  - `#preset-player-editor`
  - `#npc-list-container`
  - `#scenario-list-container`
  - `#desktop-game-difficulty`
- 存檔：
  - `#save-menu-screen`
  - `#save-list`
  - `#storage-health-card`
- 冒險日誌：
  - `#journal-screen`
  - `#journal-save-select`
  - `#journal-search`
  - `#journal-entry-list`
  - `#journal-prev-btn`
  - `#journal-next-btn`
  - `#journal-page-label`
- 遊戲主畫面：
  - `#game-container`
  - `#dialogue-box`
  - `#options-area`
  - `#input-area`
  - `#input-mode-character`
  - `#input-mode-narrator`
  - `#creator-mode-btn`
  - `#player-input`
  - `#send-btn`
  - `#dice-btn`
  - `#dice-result-overlay`（`#game-container` 的 body sibling；介面震動時保持螢幕定位）
  - `#dice-result-card`
  - `#survival-effects-layer`（body 直屬 fixed layer；離開遊戲時暫停，讀檔後依目前 HP／SAN 重建）
- 狀態面板：
  - `#status-modal`
  - `#status-modal-content`
  - `#status-page-state`
  - `#status-page-log`
  - `#status-page-api`

## 主要 JS 區域（原 `app.js`，現分散於 `app-*.js`）

### 初始化與全域狀態　〔模組：app-core.js；`window.onload` 在 app-storage.js〕

- `window.onload`：載入主流程，包含 theme、IndexedDB/localStorage、API provider/key、配置、存檔、語言等。
- `getModelRuntimeProfile()`：依模型選擇 prompt 長度、NPC 數、記憶筆數等 runtime profile。
- 全域狀態包含：
  - `apiProvider`
  - `apiKey`
  - `rememberApiKey`
  - `selectedModel`
  - `scenarioPresets`
  - `activePresetId`
  - `savesData`
  - `currentSaveId`
  - `currentScenario`
  - `currentHp`
  - `currentSan`
  - `currentItems`
  - `currentFlags`
  - `currentAdventureLog`
  - `survivalGraceTurns`
  - `pendingLastStand`
  - `pendingLastStandReason`
  - `restJustUsed`

### 本機儲存 / IndexedDB / localStorage　〔模組：app-storage.js；`persistJson()` 在 app-scenario-state.js〕

- `initializePersistentStorage()`：初始化 IndexedDB；遷移舊 localStorage 大型資料時，先確認全部 IndexedDB 寫入成功，再移除原 key。
- `readPersistentValue()`：讀取 IndexedDB 或 localStorage。
- `persistLargeValue()`：寫入大型資料，IndexedDB 可用時走 queue。
- `queueIndexedWrite()` / `queueIndexedDelete()`：IndexedDB 延遲寫入/刪除。
- `loadSaveCollection()`：載入存檔集合。
- `persistJson()`：保存 JSON 類資料。
- `persistPresetDeletionTransaction()`：刪除配置＋綁定存檔的原子交易（IndexedDB 單一 transaction，或 localStorage 後備寫入＋失敗還原）；共用入口為 `deletePresetsAndBoundSaves()`（app-preset-edit.js）。
- `buildSaveIndexPayload()`：存檔索引。
- `window.onload` 載入配置時會剔除無效項目、正規化玩家資料、過濾壞 NPC／場景，並在集合為空時補入安全預設值。

危險點：這區會影響所有存檔、配置與大型資料，不要任意改 key 或資料格式。

### API Key / 模型　〔模組：app-api.js；`fetchGoogleModels()`／`fetchOpenRouterModels()`／`fetchAnthropicModels()`／首頁 `fetchAvailableModels()`／`populateModelSelects()` 在 app-saves-game.js〕

- `getPersistedApiKey()`：讀取本機保存 key。
- `getStoredApiKey()`：依 `rememberApiKey` 與 session 狀態取得 key。
- `persistApiKey()`：保存 key。
- `removePersistedApiKeys()`：刪除本機保存 key。
- `setRememberApiKey()`：切換「在這台裝置保留金鑰」。
- `changeApiProvider()`：切換 Google Gemini／OpenRouter／Anthropic。
- `fetchAvailableModels()`：首頁驗證 key、載入模型。
- `fetchAvailableModelsFromGame()`：遊戲內載入模型。
- `fetchGoogleModels()`／`fetchOpenRouterModels()`／`fetchAnthropicModels()`：模型清單 API。
- Anthropic 手動或靜默驗證使用 `fetchAnthropicModels({ allowFallback: false })`，網路失敗不得誤判為 key 驗證成功；遊戲內模型選單仍可使用後備清單。

危險點：不要把 key 寫入備份、prompt、日誌、匯出檔或 console。角色圖片可匯出給玩家本機備份，但不可送進 prompt 或 API request。

### 角色配置 / 情境配置　〔模組：app-config-ui.js（概覽、列表、selector）＋ app-preset-edit.js（表單、儲存／刪除、隨機生成）〕

- `renderPresetSelector()`：配置下拉與選擇。
- `loadPresetToForm()`：把配置載入表單。
- `syncEditingDataFromDOM()`：將 DOM 表單內容同步回資料。
- `saveCurrentPreset()`：儲存目前配置。
- `saveAsNewPreset()`：另存新配置。
- `deleteSelectedPresets()`：批次刪除配置。
- `renderDesktopPresetOverview()`：桌機角色配置概覽。
- `renderDesktopGameSettings()`：桌機遊戲設定區塊。
- `renderNpcList()` / `renderScenarioList()`：NPC 與情境列表。
- 隨機生成：`openRandomGenerator()`／`buildRandomGeneratorPrompt()`／`applyRandomPresetPreview()` 等 `*RandomGenerator*` 系列（行內隨機面板）。
- `testCharacterVoice()`：角色語氣測試；prompt 只組合核准的文字欄位，不得序列化頭像、base64、動態資料或未知欄位。

危險點：角色配置會和遊戲存檔綁定。刪除配置、另存配置、匯入配置都可能影響目前存檔綁定。

### 存檔 / 匯入匯出　〔模組：app-saves-game.js（存檔列表、`saveCurrentProgress()`、`exportSaves()`／`importSaves()`）＋ app-backup-io.js（`buildBackupPayload()`、sanitize、`importPresetConfig()`、刪除存檔）〕

- `saveCurrentProgress()`：保存目前遊戲進度的主入口；以可選 `survivalState` 保存寬限回合、瀕死選擇與休息狀態，舊存檔缺欄位時安全預設。
- `renderSaveList()`：存檔列表。
- `createNewSave()`：建立新紀錄。
- `loadSave()`：載入紀錄。
- `deleteSelectedSaves()`：刪除選取紀錄。
- `buildBackupPayload()`：組合完整備份資料，只包含遊戲紀錄、角色配置與必要識別資訊；不得包含 `uiTheme` 或 API key。
- `sanitizeSavesCollection()`：匯出前清理存檔。
- `sanitizePresetCollection()`：匯出前清理配置。
- `exportSaves()`：匯出備份。
- `importSaves()`：匯入備份。
- `exportCurrentPreset()`：匯出目前配置。
- `importPresetConfig()`：匯入配置。
- `validateImportedPresetShape()`／`validateImportedSaveShape()`／`validateImportCollections()`：在任何本機資料變更或持久化前，驗證配置、NPC、場景、存檔與腳本的巢狀結構。
- `createIsolatedLegacySaveScenario()`（app-gameplay.js）：載入缺 `save.scenario` 快照的舊存檔時，建立該存檔專屬的空白配置與快照，不再回退複製目前配置（避免資料污染）。

危險點：`buildBackupPayload()` 與 sanitize 函式會決定匯出是否包含圖片/私密資料。角色圖片可作為玩家本機備份資料保留，但 API key 與私密 token 絕不可被加入。圖片也不可進入 AI prompt 或送往 API 廠商。

目前採用「資料包」管理規則：

- 每個記錄檔以 `save.scenario` 快照自帶角色/情境/動態狀態。
- `scenarioPresets` 是模板集合，用於開新局或另存配置。
- 匯入記錄檔時，原始配置 ID 相同且內容相同才重用既有配置。
- 只是同名同內容但原始 ID 不同時，不應合併到本機其他配置，以免不同記錄檔互相感染。
- 匯入同一份備份時，`getSaveImportSignature()`／`findExistingSaveForImport()` 會略過重複存檔。
- 完整備份匯入配置時，只在原始 ID 與內容簽章相符時重用；衝突時建立獨立快照並重新綁定，避免覆寫本機同 ID 配置。
- 直接匯入配置檔（`importPresetConfig()`）一律建立獨立副本：ID 或名稱碰撞時自動改名「（匯入N）」；內容完全相同時先 confirm，取消則沿用既有配置不建副本（`forceCopy`／`confirmIdenticalReuse` 選項）。
- 完整備份不得保存或還原頁面配色；匯入舊備份時必須忽略 `uiTheme` 並保留目前裝置外觀。持久化回報失敗時匯入必須中止並顯示錯誤。

### AI Prompt / 回覆解析　〔模組：app-ai.js（`buildLatestActionPrompt()`／`buildGamePrompt()`／`callAI_JSON()`／`requestAIText()`／JSON 修復／語言修復）；`getCompactSystemInstruction()`／`buildSceneTransitionPrompt()` 在 app-saves-game.js〕

- `getCompactSystemInstruction()`：主系統 prompt，包含角色、NPC、場景、狀態、規則。
- `buildLatestActionPrompt()`：依本回合輸入模式組裝玩家/旁白/創作者指令。
- `buildGamePrompt()`：組合完整 prompt。
- `callAI_JSON()`：主流程骨架（捕捉請求情境→呼叫 AI→解析→拍快照→套用與渲染→出錯回滾）。若存檔、場景或對話情境已改變，舊回覆與舊錯誤復原必須靜默失效。
- `invalidateGameAIRequestContext()`／`captureGameAIRequestContext()`／`isGameAIRequestContextCurrent()`：防止跨存檔、跨場景的過期 AI 回覆套用。
- `applyAIStateChanges()`／`renderAIResponse()`／`recoverFromAIFailure()`：分別負責狀態套用、畫面渲染與錯誤復原；回滾快照包含生存相關狀態。
- `requestAIText()`：實際送出 API request。
- `parseAIJsonWithRepair()`：JSON 修復。
- `repairVisibleResponseLanguage()`：修正 AI 可見文字語言。
- `buildSceneTransitionPrompt()`：場景切換提示。

危險點：prompt 區互相依賴，新增規則前先找是否已有同義規則。不要把同一限制散落三四處。

### 骰點 / 難度 / 生存　〔模組：app-dice-effects.js、app-gameplay.js〕

- `DICE_STATS`：六屬性定義。
- `DICE_DIFFICULTIES`：行動難度 DC。每檔為區間，每次檢定在區間內隨機取值：超簡單 3–5、簡單 9–11、普通 12–14、困難 16–18、極難 20–22。
- `GAME_DIFFICULTIES`：標準/困難/極限模式。
- `calculateDiceCheck()`：計算 D20 結果。
- `classifyDiceCheck()`：AI 分類檢定屬性與難度。
- `sendDiceChoice()`：骰點按鈕入口。
- `playDiceResultPresentation(check)`：接收硬判定後的 `roll`／`result`，播放正式大骰子並在數字揭示後解除 `sendChoice()` 等待。
- `cancelDiceResultPresentation()`：離開遊戲或新演出取代舊演出時清除 RAF、timer、overlay 與介面衝擊 class。
- `suspendSurvivalVisualEffects()`：離開遊戲時清除 body 生存特效 class、grain／ambient timer 與暫時節點；`loadGame()` 會重新同步目前狀態。
- `setGameInputMode()`：切換行動／旁白／神輸入模式；行動與旁白同步目前場景參與狀態，神模式沿用創作者指令武裝。
- `resolveSurvivalOutcome()`：處理 HP／SAN 歸零、困難模式生死檢定、極限模式瀕死選擇與恢復期；讀檔可用 `consumeGrace: false` 還原而不消耗寬限回合。

目前規則：

- 遊戲輸入列採單一外框：上層為行動／旁白／神模式籤，下層為輸入框與圖示化骰點／發送鈕；手機模式籤與操作鈕至少 44px。
- 神模式會將骰點鈕反灰並停用滑鼠／觸控操作；`parseSceneInputContext()` 的既有文字模式指令仍保持相容。
- 玩家角色行動使用玩家六圍與 HP/SAN 修正。
- 旁白 / NPC 支線手動骰點使用中性六圍，不套用玩家 HP/SAN。
- 困難模式 DC +2；HP／SAN 歸零時 D20 ≥11 存活，D20 1 必定失敗、D20 20 可存活。
- 極限模式 DC +3；HP／SAN 歸零時先進入瀕死選擇，生死檢定 D20 ≥8 存活，恢復期可暫時保護。
- 標準模式 HP／SAN 歸零時保護至 1 點，不直接 Game Over。
- `survivalState` 隨存檔保存；載入瀕死存檔會鎖定輸入並重建選項，且不消耗寬限回合。
- DC 不再固定單值：每檔在區間內隨機取值（見上），再疊難度模式加成與生存懲罰，最後夾 2–30。硬判定訊息顯示「基礎 DC（本次取值）」與「最終 DC」。
- 熟練（擅長領域）：`currentScenario.playerProficiencies`（角色設定頁生成並鎖定的專長清單）。玩家自行輸入的行動由 `classifyDiceCheck` 判定 `proficient`；AI 產生的行動選項會在同一次回覆填 `options[].proficient`，不增加 API 請求。`calculateDiceCheck` 對熟練的玩家檢定 +2（最多一個、不疊加），硬判定訊息顯示「熟練 +2」；NPC／旁白骰不套用。
- 正式 D20 規格：自然 20＝B、一般成功＝D、一般失敗＝D、自然 1＝C；四種結果旋轉階段同態且不顯示數字，固定 0.5 倍速。外層位移保留 `steps(14)` 像素節奏，3D 幾何須逐 RAF 套用 ease-out，不得再次量化為 14 格。自然 1 在接地點觸發 280ms 純垂直介面阻尼，骰子 overlay 不跟著介面位移。

### 冒險日誌　〔模組：app-status-journal.js；任務清單序列化 `parseTaskChecklist()`／`serializeTaskChecklist()` 在 app-memory.js〕

- `renderAdventureJournalSaveSelector()`：冒險日誌存檔選擇。
- `renderAdventureJournal()`：冒險日誌列表、搜尋、分頁。
- `toggleJournalEntryImportant()`：重要標記。
- `saveJournalEntryInlineEdit()` / `deleteJournalEntryInline()`：行內編輯與刪除紀錄。
- `chunkAdventureLog()`：整理時切分長日誌。
- `isProtectedAdventureLogEntry()`：保護任務完成/失敗/成就等紀錄。
- `restoreProtectedAdventureLogEntries()`：AI 整理後補回被刪掉的保護紀錄。
- `buildSelectedJournalOrganizerPrompt()`：冒險日誌整理 prompt。
- `organizeSelectedJournalLog()`（日誌頁入口）＋`organizeAdventureLogWithAI()`（分段送 AI）：整理完整日誌。
- 重要標記（★）：`save.importantJournalEntries` 存條目索引。`getImportantAdventureLogEntries()` 取出條目（含原始位置）；整理時星號條目不送 AI（`organizeAdventureLogWithAI` 先過濾，全部星號時以友善錯誤中止）；整理後先 `restoreImportantAdventureLogEntries()` 按原始位置插回、再補保護紀錄，最後 `remapImportantJournalEntries()` 重算索引。
- 「只看★」篩選：`toggleJournalImportantFilter()`／全域 `journalImportantOnly`（宣告於 app-core.js），開啟日誌頁時重置；`jumpAdventureJournalToLatest()` 同步吃篩選。

危險點：AI 整理不可刪除「任務完成」、「任務失敗」、「成就」等紀錄。分頁 CSS 有 `display:grid`，隱藏時需同時注意 `hidden` 與 `display`。

### 日記收藏 / 對話選單 〔模組：app-gameplay.js ＋ app-status-journal.js；文字：i18n.js；樣式：style.css〕

- `app-gameplay.js` 在 `appendMessage()` / `appendNarrative()` 產生訊息時掛上 `data-raw-line`；選單改**事件委派**（`ensureChatMenuDelegation()`：`#dialogue-box` 單一組桌機右鍵／手機長按），`attachMsgMenu()` 只記 `menuKind`／`menuSpeaker`。畫面只渲染最近 60 則（`CHAT_RENDER_LIMIT`），其餘由頂端「載入更早」展開；`appendMessage`／`appendNarrative` 後 `trimChatDom()` 修剪舊 DOM。
- 對話選單包含：`編輯`（`startEditMsg()` 直接改已送出訊息並回寫 `chatScripts[currentChatPageIndex]`）、`複製`（clipboard + `tinyToast()`）、`收藏這段`（`startCollectSelect()` 進入範圍選取）。編輯讀回用 `innerText` 保留空行；編輯中角色泡泡加寬到 `min(600px, 84vw)`。
- 日記範圍收藏流程：選起點後顯示 `#diary-collect-banner`，再點另一則當結尾；同一則可只收藏單則。完成後呼叫 `addCollectionRange(lines, caption)` 寫入目前存檔的 `collections`。
- `app-status-journal.js` 管理日記：`getCollections()`、`addCollectionRange()`、`removeCollection()`、`openDiary()`、`renderDiary()`、`renderDiaryLines()`、`beginDiaryCaptionEdit()`。
- 日記資料跟著存檔保存：每則 `{ lines, caption, date, dateMs }`。`dateMs` 供語言切換時重新格式化日期；舊資料只有 `date` 時會保留原字串並替換上午/下午。
- 底部一句話用 `contentEditable` 直接在原位置編輯，不跳 `prompt()`；Enter 儲存、Esc 取消、失焦儲存。
- i18n 注意：英文介面稱 `Diary`；中文與日文都顯示「日記」。右鍵選單、toast、刪除確認、空日記文案、日期提示、日記標題/側標籤都要補中英日。
- CSS 注意：`.home-diary-tab` 在右側，英文模式用 `sideways-rl`；左側一般英文標籤仍用 `sideways-lr`，兩邊方向不要混用。

### 狀態面板 / 記憶　〔模組：app-status-journal.js（面板渲染、Flags、道具）；記憶／任務輔助在 app-memory.js；`buildMemoryOrganizerPrompt()` 等 AI 整理 prompt 在 app-ai.js〕

- `openStatusModal()`：狀態面板主渲染（摘要、任務、關係、Flags、道具）；`refreshOpenStatusPanel()` 於 AI 回合後刷新，不重置拖曳位置。
- `renderStatusSummary()`／`renderFlags()`／`renderItems()`／`renderGrowth()`：面板各區塊渲染。
- `buildMemoryOrganizerPrompt()`：狀態摘要整理 prompt。
- `organizeMemoryWithAI(kind)`（app-ai.js）：AI 整理狀態摘要（kind='summary'）與冒險日誌（kind='log'）的共用入口。
- `parseTaskChecklist()` / `serializeTaskChecklist()`：任務清單格式。
- `applyTaskUpdates()`（app-memory.js）：AI `task_updates` 的 action 限 add／complete／fail／reopen／remove；`fail` 必附 reason 否則拒用；已完成或已失敗的任務只能經 `reopen` 翻轉。`failTasksRelatedToNpcEvents()` 已移除，NPC 死亡不再自動判任務失敗（改由 prompt 規則約束）。

危險點：狀態摘要不是完整日誌，不能把完成任務或成就當作一般小事刪除。

### Flags / 狀態旗標　〔常數：app-core.js；面板／prompt：app-status-journal.js；套用：app-ai.js；生存旗標：app-gameplay.js〕

- 儲存於 `currentFlags`（字串陣列，隨存檔）。上限 `MAX_STORED_FLAGS = 80`、單則 `MAX_FLAG_CHARS = 48` 字、每回合送 AI `MAX_FLAGS_FOR_PROMPT = 32` 個（皆定義於 app-core.js）。
- 新增：AI 走 JSON `changes.flags_add`（舊版相容 `new_flags`），經 `normalizeFlagText()` 正規化（去 `[…]`／`狀態：` 前綴、壓空白、截 48 字）＋去重，未達 80 才加；手動走 `manualAddFlag()`。
- **AI 只能加、不能刪**：apply 邏輯沒有 `flags_remove`，JSON 範本也只有 `flags_add`，所以一般 flag 只增不減，靠 80 上限＋玩家手動 `removeFlag()` 清理。
- prompt 硬規則（app-ai.js）：只有指令明確要求時才可增減 Flags，否則不得擅動。
- flag 觸發規則（getCompactSystemInstruction 內【狀態旗標（flags_add）判定】）：只有持久身分/處境、稱號、關係里程碑（含好感滿值 100）、契約/詛咒/印記/後遺症才可加；普通對話、短暫情緒、好感小幅變化、單次小事、一般任務進度不得加。預設不加、每回合最多 1～2 個。
- 自動生存旗標（`AUTO_SURVIVAL_FLAGS`，程式管、非 AI）：重傷(HP≤20)、生命歸零(HP≤0)、精神瀕臨崩潰(SAN≤20)、精神歸零(SAN≤0)。每回合 `syncSurvivalFlags()` 依 HP/SAN 重算，是唯一會自動加／移除的 flag，進入或恢復臨界時發系統提示。
- 送 AI 的挑選（`getFlagsForPrompt()`）：≤32 全送；>32 時＝生存旗標＋最早 4 個＋最近若干，湊滿 32，並附「另有 N 個較舊 Flags 完整保留於面板」。輸出僅列內容（不再加 `[狀態/成就]` 前綴）。
- 面板（`renderFlags()`）：顯示「已保存 X / 80」，超額轉警告樣式；每次 render 會順手去重清理 `currentFlags`。

## CSS 區域地圖

原 `style.css` 已依原檔順序切成 7 檔（2026-07-16，bytes 級純搬移、內容零改動）。切點是位置切片、不是嚴格語意分類；找 selector 時先 `rg <selector> style-*.css` 定位，不要憑檔名猜。

- `style-1-base.css`（原 1–1075 行）：`:root` 變數、字型（Cubic 11）、基礎版面、首頁、遊戲內深色卡片 UI 前段。
- `style-2-status.css`（原 1076–1939 行）：狀態列、狀態面板、API 統計頁。
- `style-3-panels.css`（原 1940–3192 行）：consolidated inline styles、角色面板詳細頁、開機畫面。
- `style-4-desktop-config.css`（原 3193–4178 行）：桌機角色面板右側抽屜、創角桌機版。
- `style-5-mobile-config.css`（原 4179–5735 行）：`min-width:1100px` 版面、手機／平板角色配置、手機日記。
- `style-6-surfaces.css`（原 5736–6623 行）：大面板／視窗、背景圖模式、材質（Liquid Glass，`:root[data-surface-style="glass"]`，以屬性選擇器提高特異性、未使用 `!important`）、Diary 收藏。（修正舊描述：材質規則實際在此檔，不在檔案最末段。）
- `style-7-game.css`（原 6624–8447 行）：存檔印記、遊戲玩法可讀性、面板拖動、NPC 流程、正式 D20 overlay 與結果演出等後期新增區。
- 手機版 `@media (max-width: 600px)` 覆蓋與「基礎＋手機成對」規則散佈於各檔對應區域，成對關係不變。
- 注意：`TECH_DEBT.md` 的舊行號以單檔 `style.css` 為基準；拆檔後一律改用 selector 重新定位。

## 疑似重複或需整理 CSS

2026/07/10 整理債清理（詳見 `_handoff/2026-07-09-reorder-drag-glass/CLAUDE_HANDOFF.md`；整理前完整備份在 `_cleanup_bak/style_pre_css_debt_2026-07-10.css`）：

已清（共 19 處、約 -3.5KB）：

- ~~`#status-page-state .language-mode-select` 重複定義~~ → 設定區已搬「系統」頁，狀態頁殘留 2 塊死碼已刪（其餘同日改名時已轉 `#status-page-api`）。
- ~~`.quick-status-*` 多次定義~~ → 該 UI 被 `display:none` 永久隱藏，樣式群（桌機+手機共 11 規則）已清、保留一條隱藏規則；JS 仍輸出隱藏 markup（未動）。
- ~~`#status-modal-content .status-tab-btn` 四輪 polish 疊層~~ → 合併為單一最終生效塊；`.status-tabs` 塊內矛盾宣告整併並去除 `!important`。
- ~~`#status-summary-display` 三連定義、其 `.u-inline-016` 三連定義~~ → 各保留最終生效塊。
- ~~舊版 `.home-diary-tab` 基礎塊~~ → 被後方新版逐屬性完全覆蓋，連同重複的 display:block 已刪。

維持現狀（判定為刻意分層，非垃圾，勿當死碼刪）：

- `#desktop-config-editor` 與 `data-editor-section` 疊加：分區切換設計。
- `#player-input` 手機 `font-size: 16px` 後置規則：防行動瀏覽器自動放大。
- `.journal-entry` 系、`#setup-screen`/`#journal-screen`/`#model-selection-area`：基礎+手機成對，需避免新增全域覆蓋。
- 其餘 `!important`（隱藏 file input、mobile overflow、桌機配置切換）：未動，日後逐步確認。

## 疑似廢碼 / 需確認

以下僅供日後整理，不代表可刪：

- 舊版 `targetName` / `targetPersona` / `targetAvatar` 相容欄位仍在匯入與 migrate 中出現，可能是舊存檔相容需求。
- `sanko_api_key` 舊 key 與 `sanko_api_key_${provider}` 新 key 同時存在，是相容舊版本，不可直接刪。
- `setup` 嵌入 save/journal 的 DOM 移動函式與獨立頁函式並存，應先確認桌機/手機流程再整理。
- 多個語言修復 regex 在 `i18n.js` 後段，可能對舊訊息仍有效，不可只看目前 UI 就刪。

（備註：先前盤點出 9 個確定未被呼叫的函式已於主資料夾移除並備份於 `_cleanup_bak/`。）

## 危險區域清單

- API key（app-api.js；首頁 `fetchAvailableModels()` 在 app-saves-game.js）：
  - `getPersistedApiKey()`
  - `persistApiKey()`
  - `removePersistedApiKeys()`
  - `setRememberApiKey()`
  - `fetchAvailableModels()`
  - `fetchAnthropicModels()`
- localStorage / IndexedDB（app-storage.js；`persistJson()` 在 app-scenario-state.js）：
  - `initializePersistentStorage()`
  - `readPersistentValue()`
  - `persistLargeValue()`
  - `loadSaveCollection()`
  - `persistJson()`
  - `persistPresetDeletionTransaction()`
- 存檔格式（`saveCurrentProgress()`／`importSaves()` 在 app-saves-game.js；`buildBackupPayload()`／`importPresetConfig()` 在 app-backup-io.js）：
  - `buildBackupPayload()`
  - `saveCurrentProgress()`
  - `importSaves()`
  - `importPresetConfig()`
  - `validateImportedPresetShape()`
  - `validateImportedSaveShape()`
  - `validateImportCollections()`
- AI prompt（app-ai.js；`getCompactSystemInstruction()` 在 app-saves-game.js）：
  - `getCompactSystemInstruction()`
  - `buildLatestActionPrompt()`
  - `buildGamePrompt()`
  - `callAI_JSON()`
  - `invalidateGameAIRequestContext()`
  - `applyAIStateChanges()`
  - `recoverFromAIFailure()`
- 角色文字 prompt（app-preset-edit.js）：
  - `testCharacterVoice()`
- 生存與讀檔（app-gameplay.js；保存入口在 app-saves-game.js）：
  - `loadGame()`
  - `saveCurrentProgress()`
  - `resolveSurvivalOutcome()`
  - `beginLastStand()`
- 冒險日誌整理（app-status-journal.js）：
  - `buildSelectedJournalOrganizerPrompt()`
  - `restoreProtectedAdventureLogEntries()`
  - `organizeSelectedJournalLog()`／`organizeAdventureLogWithAI()`
- 手機/桌機互相影響：
  - `#setup-screen`
  - `#edit-scenario-screen`
  - `.setup-side-tab`
  - `.desktop-*`
  - `@media (max-width: 600px)`

## 建議之後怎麼下修改指令

為了避免又疊 hotfix，建議每次指令包含：

- 要改的畫面：例如「桌機角色配置 / 手機首頁 / 冒險日誌 / 狀態面板」。
- 要改的行為或樣式：例如「只改按鈕寬度，不改高度」、「只改日文文案」。
- 不要碰的區域：例如「不要改存檔格式」、「不要動 prompt」、「不要改手機版」。
- 驗收方式：例如「3440x1440 桌機不跑版」、「手機版維持舊排版」、「語言切換後同步」。

範例：

> 請只改桌機角色配置的配置列表排版。不要動存檔格式、AI prompt、手機版。改完請列出 CSS selector，並對你改到的 `app-*.js` 跑 `node --check`（例如 `node --check app-config-ui.js`）/ `node --check i18n.js`。

> 請整理冒險日誌分頁按鈕，不新增功能。保留任務完成與成就保護規則。不要改備份匯出。
