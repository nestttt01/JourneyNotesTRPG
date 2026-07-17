# 待辦事項

本檔只記錄尚未完成的產品工作與核准狀態。列在這裡不代表已授權修改；每次實作仍須取得專案主當次明確同意。

## 使用流程

1. 先記錄目標、範圍、不碰區域與驗收方式。
2. UI／排版工作若專案主明確要求預覽，先以瀏覽器實際渲染的 HTML/CSS 頁面供核准；未要求且需求簡單明確時，可在溝通確認後直接實作。
3. 實作與驗證完成後，從本檔移除該項，移入 `COMPLETED.md`。

## 未完成事項

### 下一階段：玩家唯讀預覽

- [ ] 下一輪：把玩家預覽改為角色面板「詳細」分頁的唯讀排版與顯示方式。
  - 目標：玩家在角色配置總覽點擊玩家角色時，先看到與遊戲內角色面板「詳細」一致的資料閱讀頁，不在外層顯示任何輸入框或文字編輯欄位。
  - 流程：既有玩家先進唯讀預覽，再由明確操作進入編輯；玩家預覽完成後仍須能回到人物列表。這一輪 NPC 工作不得順手實作玩家預覽。
  - 正式範圍：預計涉及 `app-config-ui.js`、`style.css`、`i18n.js` 與專項測試；以現有角色面板「詳細」DOM／CSS 為直接參考，不另創卡片式表單。
  - 不碰區域：NPC 認識夥伴流程、存檔格式與 `sanko_*` key、AI prompt、API key、圖片傳送／匯出規則、首頁與遊戲主流程。
  - 驗收：桌機固定雙欄與實際觸控手機單欄皆正確；唯讀頁內沒有 `input`、`textarea` 或可編輯元素；zh／en／ja、鍵盤焦點、返回與進入編輯均可用。
  - 預覽核准狀態：專案主已於 2026-07-15 明確指定方向；正式排版與實作留待下一輪處理。

### 後續：配置表面、整站一致性與紙娃娃

- [ ] NPC 互動流程穩定後，再整理右側角色配置／情境填寫版面。
  - 目標：減少重複玻璃底與卡片層，但保留清楚的編輯區域與資料連動。
  - 順序：不與 NPC 互動流程同批修改；先盤點現況，再做工作區外瀏覽器預覽。
  - 不碰區域：不順手改首頁、遊戲頁、存檔資料或角色面板其他分頁。
  - 驗收：角色與情境欄位不遺失、桌機／手機無溢位、透明度層級一致。
  - 預覽核准狀態：尚未製作新版預覽，未授權正式實作。

- [ ] 最終盤點三種表面規則：紀錄選擇項、遊戲輸入框、角色配置輸入欄。
  - 目標：確認各自承接的閱讀層／面板層，避免重複玻璃底與不必要的全域覆蓋。
  - 視覺方向：保留日記感；潮感與遊戲感由字級、留白、選擇節奏及既有三角形建立，避免雷射線、透明度不一致、制式卡片與通用儀表板感。
  - 配套條件：若角色配置的新視覺語彙要擴及全站，先提供角色配置與首頁的成對預覽；未核准前不大改首頁。
  - 限制：不可用全域 `button`、`input`、`select` 規則直接壓過特定畫面。
  - 驗收：整理成可對照的表面／透明度／邊框規則，並以實際頁面驗證，不只看獨立樣張。
  - 預覽核准狀態：方向已確認，完整配套尚未核准。

- [ ] 紙娃娃系統先做前期規格與可行性預覽，與 NPC 互動流程分開排程。
  - 目標：確認紙娃娃是否能成為角色配置的長期視覺核心，而不是用來補救尚未統一的版面。
  - 範圍：先定義圖層類別與順序、畫布尺寸、素材格式、換裝操作、頭像輸出、儲存容量、匯出／匯入與無素材 fallback；本項不直接實作正式系統。
  - 不碰區域：未核准前不改存檔格式、不建立 migration、不把角色圖片送進 AI prompt 或任何 API，也不連動首頁改版。
  - 驗收：完成規格清單、容量與相容風險盤點，以及依專案現行風格實際渲染的工作區外預覽。
  - 預覽核准狀態：概念保留，素材方向、資料方案與正式實作均未核准。

### 角色面板收尾

- [ ] 繼續檢查角色面板其他小標題下方內容，是否遵守相同的第一字對齊規則。
  - 驗收：標題色條、標題第一字、說明與內文的起點有明確且一致的關係。

### 教學與多語言（2026-07-12 已完成大半，見 COMPLETED.md）

- [ ] 日文「人物→キャラクター」用語裁量。
  - 現況：全 ja 約 12 處含「人物」，多數（如「登場人物」）為自然日語建議保留；真正指遊戲角色需改的約 3～4 處。
  - 流程：AI 先列逐句清單與建議，專案主逐句核准後才改；不做整批機械替換。
- [ ] i18n 未引用舊鍵盤點（翻譯債）。
  - 例：API 指南留有「2. Google Gemini 與 OpenRouter」等兩家供應商時代的舊句（去重後各留一份，現行頁面已不引用）。
  - 原則：逐鍵確認 HTML／JS 均無引用才可刪，比照廢碼處理，不可只看目前 UI。

### 維護性拆檔與流程減稅（2026-07-16 排程）

- [ ] 修復 8 個既有 E2E 失敗（與 CSS 拆檔無關，A/B 已證明；HEAD d915fb1 原生單檔 CSS 即失敗）。
  - 範圍：`npc-acquaintance-flow.spec.js`（:140、:465）、`player-readonly-preview.spec.js`（:30）、`status-player-sheet.spec.js`（:4、:295、:353、:785、:1221）。
  - 症狀：UI 度量斷言（returnTop 對齊、cursor 14px/19px、字型、typography scale）不符與一次 ERR_NO_BUFFER_SPACE。
  - 建議交 Codex 處理（其最後一輪 NPC／玩家預覽工作的斷言與實作不一致）。

- [ ] app-gameplay.js（2,704 行）與 app-status-journal.js（2,464 行）再拆一輪（P2）。
  - 比照 app.js→13 模組的純搬移前例：不改邏輯、不改全域行為、載入順序接原位。
  - 驗收：`node --check` 全過、全部 E2E 通過、`PROJECT_MAP.md` 同步。
  - 核准狀態：方向同意，切法未核准；style.css 拆完再排。

### 明日排程（2026-07-17 凌晨由專案主口頭指示記錄）

- [ ] 遊戲整體按鈕調整。
  - 目標：待專案主給具體方向（哪些畫面、視覺或行為層面）後補記範圍與驗收。
  - 核准狀態：僅記錄方向，未核准實作。
- [ ] 修復：新增情境後，編輯中的角色面板不會帶入新情境。
  - 症狀：新增情境會出現在 NPC 區，但情境編輯頁不會帶到編輯中的新情境。
  - 範圍預估：`app-config-ui.js`（`renderScenarioList()`／概覽同步）與 `app-preset-edit.js` 的編輯資料同步；不動存檔格式與 `sanko_*` key。
  - 驗收：新增情境後不重整頁面，情境編輯頁立即出現且可編輯新情境；NPC 區行為維持不變。
  - 核准狀態：bug 已由專案主確認，動工前仍須當次同意。
  - 狀態（2026-07-17 排程 session）：**已修待專案主驗證**。根因在 `app-saves-game.js` 的 `openStatusScenarioEditor()`（場景下拉＋新增情境路徑）：settings 頁改版成 NPC／情境 dossier 後未同步，落在 NPC 區且從未開編輯 session；已補 `statusDetailLowerView`／`statusDetailSelectedScenarioIndex`／`beginStatusDetailEdit('scenario')` 三行（+3 行、1 檔）。jsdom 重現驗證通過、`node --check` 通過。
  - 狀態補記（2026-07-17 深夜 session）：**已過 E2E**——含此修復的工作區副本全套 E2E 通過 32、失敗僅既有 8 個 baseline、新增失敗 0。
- [ ] 手機版封面方框透明度破圖感修正。
  - 症狀：手機版封面出現透明度落差的方框，觀感像破圖。
  - 範圍預估：先以實機截圖定位元素，再查 `style-1-base.css`（封面）與 `style-6-surfaces.css`（背景圖模式）對應規則；小範圍修。
  - 驗收：手機寬度封面無突兀方框；桌機版不受影響。
  - 核准狀態：待實機截圖確認後動工。
  - 狀態（2026-07-17 排程 session）：唯讀調查報告已產出（本次 Cowork session 附件 `report-B-mobile-cover-box.md`）。主嫌：背景圖模式 `.setup-home-panel` 74% 玻璃在手機寬度無框線配套；次嫌 `.api-home-guide` 實心卡。含三個修法選項，未動專案檔。
- [ ] 開遊戲檔（存檔選單）風格調整：卡片感過重。
  - 目標：往日記感方向減卡片框，與「三種表面規則」盤點方向一致（見上方既有待辦）。
  - 流程：屬 UI 視覺改版——先做工作區外瀏覽器實際渲染預覽供核准，未核准不動專案檔。
  - 核准狀態：方向已表達，預覽與實作均未核准。
  - 狀態（2026-07-17 排程 session）：草案 2「筆記目錄風」（`save-menu-draft-2-ledger.html`）經專案主線上迭代後**方向已核可**：存檔列＝黃色 16×4 螢光短線＋細實線（hover 短線伸長、微縮排）、☰ 拖拉把手 hover 才浮現、動作列＝B3 選單游標款（v7 定案 2px 磚格三角）、「返回大廳」僅手機寬度（≤600px）顯示（桌機走側標籤）。正式實作仍待專案主當次同意後另行排程。未動專案檔。
  - 狀態（2026-07-17 深夜 session，專案主已核准實作）：**已實作待專案主目視驗證（含 E2E 結果）**。改動：style-1-base（.save-slot 目錄行＋::before 短線、.storage-health-card 頁邊註、#save-list gap 0）、style-4（#setup-screen #save-list gap 0）、style-5（工具列收線＋刪除鈕純文字款、移除 .save-slot:hover .save-title-input 死規則）、style-6（玻璃群組摘除 .save-slot/.storage-health-card、#save-list 把手 hover 浮現）、style-7 檔尾（動作列 B3 全套＋主鍵放大＋返回大廳 ≥1100 隱藏）。JS 零改動（renderSaveList 的 DOM/class 原樣可用）。E2E：通過 32／既有失敗 8／新增失敗 0。歧義備註：「返回大廳」在 601–1099px 仍顯示（該寬度無側標籤，藏掉會無路可退），僅 ≥1100px 隱藏；請專案主目視驗證桌機＋手機＋背景圖模式。

### 輸入框統一（2026-07-17 專案主指示必須做；規格已於同日圈定）

- [ ] 大輸入框統一為「角色編輯款」＋focus 語彙定案。
  - 規格（專案主 2026-07-17 核定）：多行 textarea／長文欄一律改角色設定編輯框樣式——標籤在上、底線 `text-sub`、`color-mix(in srgb, var(--card-bg) 30%, transparent)` 半透底、無外框無圓角；focus＝底線變黑＋`outline: 1px solid var(--accent-neon)` offset 2（升格為大輸入框官方 focus）。底線＋螢光下影留給單行行內欄（改名、搜尋）。
  - 套用範圍（第一批優先角色面板——專案主觀察卡片硬陰影框最集中處）：`#status-page-settings` 編輯欄（86px 三胞胎那批）→ 桌機配置編輯抽屜（`#desktop-config-editor` .anime-sheet textarea／情境欄）→ 手機配置頁同組 → 隨機生成面板長文欄。
  - 作法：抽單一共用規則（class 或 union selector），不得逐區複製；同批執行 TECH_DEBT B3 的 `min-height: 96px` 統一與 `!important` 拆除；配套 JS 小改（autoResize 排除 class，防止拖拉後打字彈回）。順帶清三債：`#desktop-preset-name-input` 死碼第一版（style-4:653）、`#desktop-config-editor` 寫死色碼（#808080/#BFB3B8）、此批欄位殘留的 2px/4px focus 影。
  - 不碰：`#player-input`（外框發光＋16px 白名單）、首頁 key/BAR、單行小欄與 select（留第二批）、存檔格式、AI prompt、危險區。
  - 驗收：桌機＋手機逐畫面 focus 目視無 UA ring；三胞胎欄位起始高度 96px 且 `resize: vertical` 拖拉後不彈回；CSS 括號平衡；`git diff` 小範圍可讀（錨點守則：只在完整規則塊邊界插入）。
  - 盤點依據：`input-field-inventory.html`（2026-07-17 session 附件，三家族×四種 focus 對照表）。
  - 核准狀態：規格已核定；動工仍待專案主當次同意後排批次。
  - 狀態（2026-07-17 深夜 session，第一批已完成）：範圍＝`#status-page-settings` 全部編輯欄（.status-detail-editor input/textarea＋.anime-sheet/.scenario-input 那批＋動態狀態欄）。作法＝style-2-status 單一 union 共用規則（底線款＋官方 focus＋96px/resize:vertical，`!important` 三連拆除）；style-3-panels 原塊只留字型；style-6 玻璃群組摘除該批兩個 selector；JS 配套＝autoResize 加 `.no-auto-resize` 排除（app-core.js）＋批內 11 個 textarea 加 class（app-status-journal.js×9、app-scenario-state.js×2）。三債順帶清畢：`#desktop-preset-name-input` 死碼第一版拆組摘除（color/font-size/font-weight/min-width 四宣告原本仍生效，已搬入第二版塊保持視覺等值）、`#desktop-config-editor` 寫死色碼改變數（#808080→--text-sub、#BFB3B8→--accent-gray、color:#282828→--text-main 同值）、批內 2px/3px/4px focus 影全數被新 focus 蓋除。E2E：通過 32／既有失敗 8／新增失敗 0。桌機配置抽屜與手機配置頁依「寧可小而乾淨」留待第二批。請專案主目視驗證角色面板編輯欄 focus 與拖拉高度不彈回。
  - 狀態補記（2026-07-17 Codex 修正批，專案主已核准）：**已修待專案主目視／PUSH**。
    - 修正範圍：保留角色面板 `!important` 清理，移除手機後置衝突，撤回半套 `.no-auto-resize`，並以角色配置頁對齊字型、字重、行高與 focus 動態。
    - 不碰：配置頁第二批、`#player-input`、存檔格式、AI prompt、API key 與其他危險區。
    - 驗收：桌機／手機不裁切長內容、欄位可自動長高、角色面板各編輯欄 focus 一致、無新增 `!important`、E2E 不新增既有基線外失敗。
    - 根因修正：將 `#status-modal-content` 共用 focus selector 降為 `:where(...)`，讓角色編輯欄的 `box-shadow: none` 真正生效；玩家編輯展開態改 `overflow: visible`，避免 2px 外移 outline 被裁切。
    - 驗證：完整角色面板 `#edit-p-likes` 實測為 `box-shadow: none`、`outline: 1px`、`overflow: visible`；E2E 通過 32／既有失敗 8／新增失敗 0。
    - 後續：本批先 PUSH；輸入框共用元件與移除跨頁覆蓋流另開大整理，不在本批擴作。

### 帳本維護

- [ ] 每隔一個大版本（如 v3.0）把 `COMPLETED.md` 的舊條目剪去 `PROJECT_HISTORY.md` 歸檔，`COMPLETED.md` 只留最近一個版本週期。
  - 目的：控制開工必讀成本，防止帳本無限膨脹。
  - 注意：`PROJECT_HISTORY.md` 未入 Git 追蹤，修改前依 `AGENTS.md` 先做工作區外交易備份；搬移時逐條剪貼、不改寫內容。
