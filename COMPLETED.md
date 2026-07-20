# 已完成事項

本檔只歸檔已完成且已驗證的工作；現行規則仍以 `AGENTS.md` 為準，實際行為仍以目前程式碼與測試為準。

## 2026-07-12

### 角色面板閱讀層與視覺整理

- [x] 角色面板分頁線以下統一為完整 80% 閱讀層，上方維持 74%。
- [x] 左右、底部與收合後空白透明度一致，並隱藏角色面板可見滾輪。
- [x] 重點劇情與整體角色關係圖移除疊卡底色。
- [x] 角色配置輸入區維持單一玻璃內容層，避免重複玻璃底。

### 文字層級與對齊

- [x] 角色面板文字收斂為五級字級，區分大標題、小標題、內文與提醒小字。
- [x] Flags、玩家道具與成長徽章使用像素字；文字型小道具類內容為 12px。
- [x] 摘要頁說明、重點劇情與角色關係內文，對齊各自小標題第一字。
- [x] 關係說明介面用語更新為「詳細 → 角色動態」，角色動態仍由 `npc.dynamic` 資料流更新。

### 摘要／冒險日誌整理控制

- [x] 「整理」改為實際 CSS 像素三角形；左側黑線 2px，三角形為 14×21px。
- [x] 整理列分隔線與摘要／冒險日誌中線使用相同顏色與透明度，並與三角形同高 21px。
- [x] 整理三角形左緣與內容區標題色條左緣對齊。
- [x] 選中的「摘要內容／冒險日誌」標題使用主題重點色 2px 硬邊陰影；未選中項目無陰影。

### 驗證

- [x] 完整 Playwright 21/21 通過。
- [x] UTF-8、LF、CSS 括號、JS 語法、`git diff --check` 與跨 Python／Node hash 複驗通過。

### 07/11–07/12 介面調整補記（v2.8 公告後）

- [x] 輸入列改版：行動／旁白／神合併為單一外框的模式籤，喘息鈕併入同列；修正旁白模式無法骰點。
- [x] 模型選單移入角色面板「系統」頁；新情境改入下拉選單；桌機 HOME 側標籤。
- [x] 設定選單統一、主題 SVG 圖示、介面主次虛線統一、多語言 Toast 整理。
- [x] 摘要與冒險日誌工具統一：底線式搜尋、純文字操作鈕（指向時重點色）、紀錄頁標題字體統一。
- [x] 確立專案兩種字型；輸入文字與模式選項改用像素字體；模式選項移除框底、目前選項採重點色硬邊陰影。
- [x] 角色面板詳細頁取消玩家與 NPC 卡片式排版、改像素風。
- [x] 匯出記錄檔不再包含外觀配色。

### 教學頁修正、三語同步與 v2.9 公告

- [x] 教學 modal 與首頁「遊戲玩法」共 5 句過時說明更新：模式籤操作、低狀態干擾與成人模式註明角色面板「系統」頁、喘息改為杯子圖示說明、「整理紀錄」改「整理冒險日誌」。
- [x] i18n 對應 5 組鍵同步替換 zh/en/ja（照專案用語：Narrator／ナレーター、Creator／神、System／システム、Catch Breath／ひと息），舊鍵已移除。
- [x] 首頁更新抽屜新增 v2.9（三條玩家向內容），v2.8 移入歷史區；版本標籤改 v2.9 · 2026/07/12；新增 4 組 i18n 鍵。
- [x] 驗證：`node --check i18n.js` 通過、教學與更新抽屜三語覆蓋 0 缺漏、UTF-8／LF／檔尾檢查、跨通道（git HEAD 重放）bytes 全等。

### 掃描後清理批次（2026-07-12）

- [x] style.css：`.desktop-game-difficulty-note` 未定義變數 `var(--text-muted)` 改為 `var(--text-sub)`（全檔唯一處，確定 bug）。
- [x] app-ai.js：背景過長錯誤訊息改用「角色面板」與「整理摘要／整理冒險日誌」現行名稱，i18n 鍵同步三語。
- [x] i18n.js：同物件重複鍵 25 組去重（移除 27 條、保留執行期實際生效的最後一筆，行為不變）。
- [x] i18n.js：日文 セーブ 6 處依情境改 データ／保存，全檔已無 セーブ。
- [x] TECH_DEBT.md：新增第五節「同 context 部分屬性衝突」9 組，供日後分批收斂。
- [x] 驗證：`node --check`（app-ai.js、i18n.js）、CSS 括號平衡、教學／API／首頁指南／更新抽屜三語覆蓋 0 缺漏、UTF-8／LF、跨通道複驗。

### CSS 同 context 衝突收斂（2026-07-12，TECH_DEBT 第五節 9 組全清）

- [x] 只刪除被後繼同 selector 同屬性覆蓋的死宣告（10 個錨點、-7 行），未合併或搬移規則塊，渲染零變化。
- [x] `#flag-input-area { margin-bottom: 25px; }` 死規則整條移除；flags／items 容器三塊收斂為各自僅存生效宣告。
- [x] 驗證：錨點唯一命中、CSS 括號平衡、LF 對帳、context 感知複掃衝突歸零（僅剩 PROJECT_MAP 白名單 #player-input 手機 16px 設計）。

### 新增擅長控制列與狀態指示條（2026-07-12）

- [x] 成長區「新增擅長領域」沿用手動新增任務的底線輸入樣式，文字按鈕改為既有主題加號 SVG。
- [x] 狀態分頁與摘要內容選項的黃色指示條保留 1px 外框，外框改為重點色並以 z-index: 1 疊在灰色分隔線上。
- [x] 修改檔案：app-status-journal.js、style.css、AGENTS.md；未改存檔格式、資料欄位、AI prompt、API key 或語言鍵。
- [x] 驗證：實際頁面計算樣式符合重點色外框方案；Playwright 21/21、JS 語法、CSS 結構、UTF-8／LF 與跨 Python／Node hash 複驗通過。

### 預覽流程規則校正與擅長輸入透明化（2026-07-12）

- [x] AGENTS.md 改為：專案主主動要求預覽時，才使用瀏覽器工具實際渲染 HTML/CSS 供審核；未要求且需求簡單明確時，可在溝通後直接修改。
- [x] TODO.md 使用流程同步新規則，並移除尚未 PUSH 完成紀錄中的舊工具硬性要求。
- [x] style.css 將 #growth-prof-input 從背景圖模式的卡片底色群組移除，保留 status-inline-input 的透明背景；其他輸入欄不受影響。
- [x] 修改檔案：AGENTS.md、TODO.md、COMPLETED.md、style.css；未改存檔格式、資料欄位、AI prompt、API key、翻譯鍵或輸入行為。
- [x] 驗證：Playwright 21/21、CSS 括號與檔尾、UTF-8／LF、無錯誤工具名稱殘留及跨 Python／Node hash 複驗通過。

## 2026-07-13

### 角色面板「詳細」頁 03 檔案索引重作

- [x] 玩家主區採唯一核准的 03：像素三角形只收合詳細內容；姓名、洗點、編輯與 3×2 六圍固定顯示，六個數值皆有 16×4px 重點短線。
- [x] 玩家閱讀層統一「體格／語氣／喜好／厭惡」，外貌與背景各自收放；外部玩家／NPC 配置同步可見欄名，不改 likes/dislikes key。
- [x] 下層以第二顆同尺寸三角形切換 NPC／情境，索引移動 78px；NPC 頭像只選角色，情境改為扁平 read-first 六欄。
- [x] NPC 閱讀顯示 PROFILE／SPEECH 與「情緒／狀態／態度／目標」；次要靜態欄只在編輯顯示。
- [x] 記憶控制置於目標下方：全 NPC ON／PAUSED、暫停／恢復、MEMORY 計數與可收放內文、管理入口；面板與聊天指令共用 setter，暫停不呼叫 AI。
- [x] `＋ 新增 NPC`、`＋ 新增情境` 各自位於編輯左側；新增／刪除／洗點與 dirty-field 安全合併保留。
- [x] 修改檔案：app-status-journal.js、app-scenario-state.js、app-gameplay.js、style.css、i18n.js、index.html、app-config-ui.js、tests/e2e/status-player-sheet.spec.js。
- [x] 未改存檔格式、資料 key、AI prompt、API key、圖片傳送規則與其他角色面板分頁。
- [x] 驗證：瀏覽器 680／420／390px 實際渲染無水平溢位；內容軸 42px、索引 78px、五級字級與 66%／80% 背景層符合規格；Playwright 23/23、JS 語法、CSS／HTML 結構、UTF-8／LF、`git diff --check`、壓行與跨 Python／Node hash 複驗通過。

### 角色詳細頁 03 版型實機回饋修正

- [x] 六圍移除方括號，改為標籤在上、數字與 16×4px 重點短線置中在下，維持 3×2。
- [x] NPC 頭像選擇列移至 FILE／名稱列上方，並移除頭像下姓名小字；按鈕保留 `aria-label`。
- [x] 玩家、NPC、情境閱讀／編輯內文左右各留 42px；新增／編輯操作仍維持右緣。
- [x] 情境選項自動換行；長名稱省略並保留完整 `title`，680／390px 下 8 個情境均可見可選且無水平溢位。
- [x] 「全部 NPC 記憶追加」拆成獨立翻譯節點，切換介面語言時立即同步 zh／en／ja。
- [x] 修改檔案：app-status-journal.js、style.css、tests/e2e/status-player-sheet.spec.js、TODO.md、COMPLETED.md。
- [x] 未改 01／02、i18n 字典、資料 key、存檔格式、AI prompt、API key、頭像資料或其他角色面板分頁。
- [x] 驗收：03 詳細頁專項 Playwright 11/11、完整 Playwright 24/24、全部 JS 語法、CSS 結構、UTF-8／LF、`git diff --check`、壓行與跨 Python／Node hash 複驗通過。

### NPC 頭像與名稱左緣對齊微調

- [x] 03 版型 NPC 選擇按鈕內容由置中改為靠左，第一個 42×42px 頭像框左緣與 NPC 名稱文字左緣對齊。
- [x] 維持按鈕 58px、頭像尺寸、NPC 間距、名稱列位置、DOM、01／02 與其他版面不變。
- [x] 修改檔案：style.css、tests/e2e/status-player-sheet.spec.js、TODO.md、COMPLETED.md。
- [x] 驗證：NPC 專項 Playwright 1/1、角色詳細頁 Playwright 11/11；瀏覽器幾何左緣誤差小於 1px，JS 語法、CSS 結構、UTF-8／LF、`git diff --check`、壓行與跨 Python／Node hash 複驗通過。

## 2026-07-14

### NPC 互動式認識流程工作區外預覽

- [x] 完成「新增 NPC → 右頁接管 → 逐題認識角色」的實際 HTML／CSS／JS 瀏覽器預覽；維持日記閱讀感，以選擇節奏而非雷射線或制式卡片建立遊戲感。
- [x] 一般選項先停在待確認狀態；缺少合適答案時可走「都不像他 → 短回答 → 原句回聲 → 就是這樣」，玩家輸入不由 AI 改寫。
- [x] 目前以「說話習慣／語氣」欄示範：只有最終確認才寫入該欄，其他五個欄位保持未知；返回、修改與取消不會誤寫正式資料。
- [x] 03 像素三角形只在 pointerdown／click 後以 150ms `steps(3, end)` 切換；hover／focus 不搶先移動，鍵盤仍可操作，並提供 `prefers-reduced-motion`。
- [x] 預覽頁隱藏所有可見的瀏覽器原生滾輪，但保留滾輪、觸控與鍵盤捲動；未以裁切內容代替捲動。
- [x] 預覽檔：`D:\_codex_preview\journey-notes-npc-state-flow\index.html`；只位於工作區外，正式專案程式未修改。
- [x] 驗證：瀏覽器 1440×900、891×1006、390×844 實際渲染；無水平溢位，手機操作目標至少 44px；嚴格 UTF-8、HTML 結尾與檔案雜湊通過。最終 SHA-256：`35acee3a1eb9ecc8051a69b3c5fc8b6645cded8e6ece9fb7c74b04472e8c5c21`。
- [x] 核准邊界：專案主回饋「效果不錯」只視為流程方向正面確認；預覽外框不是正式專案尺寸，完整欄位題目與正式程式整合仍未授權，已留在 `TODO.md`。

### 角色配置 computed style 對照與第一批字級收斂

- [x] 以瀏覽器 computed style 完成角色配置與角色面板的玩家／NPC、閱讀／編輯、桌機／手機及純色／背景圖模式對照；確認兩者的字型、字重、行高與顏色承擔不同閱讀層級，不採全面相同。
- [x] 角色配置總覽玩家姓名與工作區主標題收斂為 20px；NPC 區標題及玩家／NPC 編輯姓名為 16px；欄位內容與桌機六圍數值為 14px；次級操作與六圍標籤為 12px；欄位標籤為 10px。
- [x] 手機輸入文字是否全面保留 16px 仍待後續版面整合決定；本批未新增 16px 手機覆蓋，手機六圍數值維持原有 16px。
- [x] 修改檔案：`style.css`、`tests/e2e/status-player-sheet.spec.js`、`TODO.md`、`COMPLETED.md`。
- [x] 未改正式外框與面板尺寸、手機版結構、DOM、NPC 互動流程、資料 key、存檔格式、`sanko_*` key、AI prompt、API、圖片規則或其他頁面。
- [x] 驗證：新增桌機玩家／NPC computed style 回歸通過，完整 Playwright 25/25、14 個 JS 語法、CSS／HTML 結構、UTF-8／LF、`git diff --check`、壓行與跨 Python／Node hash 複驗通過。

### 手機角色配置沿用桌機總覽／分區編輯

- [x] 低於 1100px 的角色配置頁改為共用桌機版「總覽 → 分區編輯」資訊架構；手機／平板維持最大 550px 單欄，不把桌機雙欄外框縮小塞入。
- [x] 角色、情境、遊戲設定改用水平分類籤；玩家、NPC 與情境從總覽進入單項編輯，新增 44×44px 返回控制，切換前同步表單，返回再開啟時輸入不遺失。
- [x] 玩家與 NPC 編輯沿用已核准字級、頭像、六圍與兩欄詳細欄位；NPC／情境只顯示目前編輯項目，遊戲設定的主要操作與刪除控制至少 44px。
- [x] 內容採自然頁面高度，不以固定高度裁切；隱藏原生捲軸但保留滑鼠滾輪、觸控與 PageDown 鍵盤捲動，切換總覽／編輯時回到頁首。
- [x] 依 `emil-design-eng` 逐項判斷後，本批未新增進場、切頁或欄位動畫；高頻編輯保持即時切換，沿用既有按壓與 reduced-motion 行為。
- [x] 手機輸入文字未新增全域 16px 規則；桌機 1580px 外框、首頁、NPC 互動式認識流程、資料 key、存檔格式、`sanko_*` key、AI prompt、API key 與圖片規則均未修改。
- [x] 修改檔案：`style.css`、`app-config-ui.js`、`index.html`、`tests/e2e/status-player-sheet.spec.js`、`COMPLETED.md`。
- [x] 驗證：瀏覽器 390／600／1099px、zh-TW／en／ja、純色／背景圖模式實際渲染均無水平溢位；輸入保留、單項顯示、44px 操作與隱藏捲軸均通過；角色配置／角色面板 13/13、完整 Playwright 26/26 通過。

### 角色欄位標籤與中文斜線統一

- [x] 角色面板 NPC 閱讀模式的固定 `PROFILE`／`SPEECH` 改為既有的「體格／語氣」翻譯來源；zh-TW 顯示「體格／語氣」、en 顯示 `Build / Tone`、ja 顯示「体格／口調」。
- [x] 角色配置與角色面板編輯模式的中文欄位分隔符統一為全形 `／`；英文保留自然的半形 ` / `，日文維持全形 `／`。
- [x] 保留「閱讀模式精簡、編輯模式完整」層級；未把閱讀欄改成會在英文／日文多行換行的完整長標籤。
- [x] 確認顯示小標不進入 AI 資料：主遊戲 prompt 讀取 `playerDetails`／`npc.details`，語氣測試只序列化六個 details 值；本批未修改任何 AI prompt。
- [x] 修改檔案：`app-status-journal.js`、`app-config-ui.js`、`index.html`、`i18n.js`、`tests/e2e/status-player-sheet.spec.js`、`TODO.md`、`COMPLETED.md`。
- [x] 未改 CSS、03 版型、`details.*` key、存檔格式、`sanko_*` key、API key、圖片規則或遊戲主流程。
- [x] 驗證：專項 2/2、角色配置／角色面板 13/13、完整 Playwright 26/26 通過；JS 語法、HTML 結構、UTF-8／LF、`git diff --check` 與跨 Python／Node hash 複驗通過。

## 2026-07-15

### NPC 認識夥伴功能骨架與資料安全整合（視覺未核准）

- [x] 既有 NPC 已具備「總覽 → 唯讀資料頁 → 編輯／認識夥伴」路徑；新增 NPC 維持直接進入編輯頁，編輯表單底部可接續「認識夥伴」。
- [x] 「認識夥伴」功能已整合人物基底、預設／自訂提問、玩家原句回聲、AI 回覆、像／不像判斷、補充後重試、明確選欄與追加／取代、情境草稿與返回狀態。
- [x] AI 請求沿用既有供應商、模型、金鑰與 `requestAIText()`；只傳文字人物設定與玩家明確選定的情境，不傳圖片、不修改遊戲主流程 prompt。回傳若含 JSON，只抽取 NPC 的自然台詞，不在畫面顯示 narrative／options／原始 JSON。
- [x] AI 回覆、玩家提問與未確認補充都不會自動寫入六欄；只有玩家進入明確保存步驟並選定欄位與寫入方式後才修改目前 NPC，錯誤重試會保留同一句補充。
- [x] 桌機滑鼠／觸控板即使因縮放讓 CSS viewport 低於 1100px，角色配置仍維持等比例雙欄與 850px 面板；只有實際觸控／粗指標裝置切換最大 550px 單欄。此規則只作用於角色配置，不影響角色面板手機閱讀層。
- [x] 修改檔案：`app-config-ui.js`、`app-preset-edit.js`、`style.css`、`i18n.js`、`tests/e2e/status-player-sheet.spec.js`、`tests/e2e/npc-acquaintance-flow.spec.js`、`TODO.md`、`COMPLETED.md`。
- [x] 未改存檔格式、`sanko_*` key、API key 保存、圖片傳送／匯出規則、遊戲主流程 prompt、玩家唯讀預覽、首頁或角色面板其他分頁。
- [x] 功能驗證：曾完成瀏覽器 1440×1000、900×900 與 390×844 真觸控環境實際渲染；完整 Playwright 30/30、全部 JS 語法、CSS 結構、UTF-8／LF 與 `git diff --check` 通過。
- [x] 視覺核准更正：專案主於 2026-07-15 明確否決目前 NPC 唯讀頁、編輯頁及認識夥伴首屏排版；本項只代表功能與資料安全完成，視覺修正已重新列入 `TODO.md`，不得視為正式 UI 完成。

### 配置頁流程與新對話交接文件

- [x] 核對 `TODO.md`、`COMPLETED.md` 與目前程式 diff；沒有發現完全漏記的已完成功能，但修正了 NPC 正式整合條目過度宣稱視覺完成的狀態。
- [x] `TODO.md` 新增 NPC 唯讀預覽／新增與編輯／認識夥伴三畫面修正規格、已確認與未核准邊界、預覽優先順序、不碰區域及驗收方式；移除已被正式功能整合取代的舊預覽整合待辦。
- [x] 新增 `CONFIG_PAGE_FLOW.md`，記錄角色配置入口、畫面狀態、NPC 三畫面責任、欄位映射、認識夥伴狀態機、資料安全、響應式契約、檔案位置與下一步。
- [x] 新增 `_handoff/2026-07-15-config-page-npc-flow/CODEX_HANDOFF.md`，提供新對話可直接貼上的開工指示、必讀順序、Git 現況、被否決內容、已確認規格、視覺參考與下一個任務。
- [x] 修改檔案：`TODO.md`、`COMPLETED.md`；新增但被 `.gitignore` 忽略：`CONFIG_PAGE_FLOW.md`、`_handoff/2026-07-15-config-page-npc-flow/CODEX_HANDOFF.md`。
- [x] 未修改任何 JS、CSS、HTML、翻譯或測試程式，未執行 Git 寫入。
- [x] 工作區外交易副本：`D:\_codex_transaction_backup\JourneyNotesTRPG-20260715-config-flow\`；配置流程 SHA-256 `4fa4774963295cb657b18f556a9a27a94273cfe7434ae17015cac923952f4c01`，交接文件 SHA-256 `a7ff5fb6617fe57a90d3f4be9940e8b9515e4a37124b6eaabcdc26ecbe7e03d4`。
- [x] 驗證：四份文件皆為嚴格 UTF-8、LF、無 BOM／U+FFFD／NUL；兩份未追蹤 MD 與工作區外副本 bytes 全等，Python／Node hash、檔尾、Markdown fence、`git diff --check` 與延遲複驗通過。

### NPC 配置三畫面正式版與手機版修正

- [x] 依核准範例完成 NPC 唯讀、編輯與認識夥伴三畫面；移除 NPC 名稱、玩家角色、NPC 資料、編輯 NPC 與認識夥伴等重複小標，唯讀小標改用重點色直線。
- [x] 唯讀頁採精簡的體格／語氣／喜好／厭惡；編輯頁保留完整欄名，NPC 頭像尺寸與玩家對齊，桌機外框尺寸不隨內容或畫面切換改變。
- [x] 認識夥伴與和他說一句維持固定操作位置；長文改在保留操作區的內容層捲動，不再與按鈕重疊；對話改用遊戲頁既有玩家／NPC 訊息泡泡。
- [x] 600px 以下不再被舊的桌機 `display: grid !important` 攔截：唯讀維持雙欄、編輯與人物基底為單欄，文字保持橫排，長內容讓外框自然延伸且沒有水平溢位。
- [x] 手機唯讀與認識夥伴頁恢復既有返回控制；實際點擊可離開內頁並回到角色選擇總覽，不再卡死在 NPC 內容頁。
- [x] 修改檔案：`app-config-ui.js`、`app-preset-edit.js`、`style.css`、`i18n.js`、`tests/e2e/status-player-sheet.spec.js`、`tests/e2e/npc-acquaintance-flow.spec.js`、`TODO.md`、`COMPLETED.md`。
- [x] 未改存檔格式、`sanko_*` key、API key、圖片傳送／匯出規則、遊戲主流程 prompt、玩家唯讀預覽、首頁或角色面板其他分頁。
- [x] 驗證：桌機、553px 細指標手機、長短 NPC 內容、zh-TW／en／ja、返回操作與長文保護均經實際瀏覽器渲染；完整 Playwright 32/32 通過。

## 2026-07-16

### 情境列與 NPC 問答像素選單動效

- [x] 情境列（含新增情境）與 NPC 六組問答選項移除漸層底色；滑鼠移入時箭頭立即出現，不含淡入、水平進場或跨列上下滑動。
- [x] 每列改用自身的 12×18px 像素三角形；hover 時以 900ms `steps(1)` 在原位與右移 2px 間循環，按下整列右推 4px、放開以 100ms 強 ease-out 回位。
- [x] NPC 問答初始不預選任何選項；未選取前 hover／鍵盤聚焦哪一列，哪一列立即顯示水平待機三角形。
- [x] 一旦選中，`aria-pressed="true"` 的三角形與重點色文字陰影就鎖在該列；hover／聚焦其他列不會移走，只有實際點選另一列才會換列。
- [x] 移除 `app-config-ui.js` 兩套共享游標 DOM、垂直定位、resize 重算與 pointerover 事件；保留選取、鍵盤導覽、點擊結果、拖曳排序與問答資料流。
- [x] 依 `emil-design-eng` 將 hover 動態限制在 transform／opacity，細指標才播放待機跳動；鍵盤焦點立即靜態顯示，`prefers-reduced-motion` 停用位移。
- [x] 專案主以 `20260716-1403-24.3003208.mp4` 確認待機位移節奏，並於實際頁面確認情境列版本；另逐幀確認 `20260716-1404-41.9007610.mp4` 的多箭頭殘影來自延遲退場，本版已移除該 transition。
- [x] NPC／玩家唯讀預覽改用人物基底六欄雙欄版面；移除 NPC 問答的多餘方向確認頁，接受／略過保存後直接進情境或返回預覽。
- [x] 玩家預覽右上另存 `＋` 提升到內容層上方，中心可點範圍與可見圖示一致；NPC 刪除按鈕對齊 D1：12px、單底線、無第二層邊框。
- [x] 所有現存帶「［］」的重點按鈕統一為定案 A 類：透明底、左右括號 hover 各外彈 4px、文字 `steps(6)` 掃出、按下縮放 0.97；涵蓋隨機配置、另存配置、NPC 編輯／預覽與問答流程共用操作。
- [x] 修改檔案：`app-config-ui.js`、`style.css`、`tests/e2e/npc-acquaintance-flow.spec.js`、`tests/e2e/player-readonly-preview.spec.js`、`COMPLETED.md`；未改存檔格式、API、AI prompt、返回／刪除以外的其他按鈕分類。
- [x] 專項瀏覽器驗證：A 類 computed style／hover／active／淺色與背景圖模式 1/1；NPC 無預選、選中三角鎖列、移除確認頁 1/1；玩家預覽 `＋` 中心命中 1/1。完整規格仍有與本批無關的舊測試失敗（NPC 編輯返回幾何 3px、手機返回鈕攔截、玩家編輯返回命中），未擴大修改。

### NPC 問答返回層級去重

- [x] 移除「和他說一句」畫面底部重複的「回到人物基底」按鈕；保留全流程共用的左上「回到角色設定」與右側「就說這一句」。
- [x] 修改檔案：`app-config-ui.js`、`tests/e2e/npc-acquaintance-flow.spec.js`、`TODO.md`、`COMPLETED.md`；未改其他返回鈕、問答資料流、存檔、API 或 AI prompt。
- [x] 驗證：專項 Playwright 確認底部 `intro` 返回不存在、左上 `close` 仍可見且完整問答送出流程通過；JS 語法、UTF-8／LF、延遲 hash 與 `git diff --check` 通過。

### AI 生成 A 類按鈕對齊

- [x] 情境設定底部兩顆 AI 生成 A 類按鈕改為各自在等寬左右欄置中，並維持同一水平中心；日文長短不同時不再偏向欄位左側。
- [x] 修改檔案：`style.css`、`tests/e2e/npc-acquaintance-flow.spec.js`、`TODO.md`、`COMPLETED.md`；未改其他按鈕、A 類動態或問答流程。
- [x] 驗證：日文實際頁面兩欄中心與垂直中心幾何專項 Playwright 1/1 通過；CSS 結構、全 JS 語法、UTF-8／LF、延遲 hash 與 `git diff --check` 通過。

## 2026-07-17

### style.css 純搬移拆檔（維護性）

- [x] 原 8,447 行／327KB 單檔 `style.css` 依原檔順序 bytes 級切為 7 個 `style-*.css`；`index.html` 改為 7 個 `<link>` 依序載入；內容零改動（7 檔 concat SHA-256 與原檔全等）。
- [x] CI（static.yml）驗證改為檢查 7 檔（含「必須恰好 7 檔」守門與註解檔尾例外）；`PROJECT_MAP.md` CSS 地圖改為 7 檔對照並修正「材質在檔案最末段」過時描述；`AGENTS.md` 專案描述與手打禁令清單同步。
- [x] 切檔由專案主本機執行 `split_style.py` 完成（寫前原檔 SHA、各段 SHA、括號平衡、concat 全等四層驗證全過）；舊 `style.css`、`split_style.py`、`跑測試.bat`、`test-result.log` 已清除。
- [x] 驗證：E2E A/B 對照（拆檔前後失敗清單完全相同：8 敗 32 過，拆檔零新增失敗）；`node --check` 全過；編碼／括號／檔尾檢查全過；部署後專案主目視正常。8 個既有失敗與拆檔無關，已立 TODO 待修。
- [x] 附註：AGENTS.md 同日新增 Claude（Cowork）Windows 直讀直寫例外條款（專案主核准）；bash 掛載層當日多次實證回傳寫入中舊快照，維持禁寫。

### NPC／玩家預覽大頭貼黑圈修復

- [x] 病因：頭貼照片為 `z-index:1` 絕對定位子元素，Chrome 繪製順序蓋掉父層內縮 outline；有照片的頭貼黑圈消失、無照片（首字）正常。
- [x] 修復：`.npc-flow-intro-avatar` 與 `.desktop-npc-preview-hero-avatar` 各加 `::after` 補畫層（`z-index:2`、`inset box-shadow 2px var(--border-dark)`、`pointer-events:none`）；僅 `style-7-game.css` +22 行，未動既有規則。
- [x] 驗證：線上站覆蓋層實驗事前證明修法有效；括號平衡／UTF-8／檔尾完整；部署後專案主目視黑圈恢復。

### 角色細節輸入框共用元件整理

- [x] 只統一角色配置與角色面板中，玩家／NPC 各自對應的年齡體型、語氣、喜好、厭惡、外貌與背景六欄，共 24 個欄位；角色配置頁為外觀基準。
- [x] 新增單一 `.character-detail-control` 元件，統一底線、半透明底、字型、字重、行高、96px 長文起始高度、垂直縮放與 focus；focus 為 1px 重點色細框、2px 外距，無硬陰影與位移。
- [x] 移除配置頁與角色面板針對同一批欄位的重複外觀規則，並讓背景圖模式不再替配置頁這批欄位另加玻璃底；沒有新增 `!important`，移除本批 4 個既有 `!important`。
- [x] 保留角色配置／角色面板各自的大外框與排列，也未修改角色面板三角形、名稱、好感、六圍、NPC 動態、記憶、AI 記憶、情境欄、存檔或資料流程。
- [x] 修改檔案：`index.html`、`app-config-ui.js`、`app-status-journal.js`、`style-1-base.css`、`style-2-status.css`、`style-4-desktop-config.css`、`style-5-mobile-config.css`、`style-6-surfaces.css`、`style-7-game.css`、`COMPLETED.md`。
- [x] 瀏覽器驗證：配置玩家／配置 NPC／角色面板玩家／角色面板 NPC 四組的一般與 focus 計算樣式完全一致；1440px 純色／背景圖模式與 390px 手機均通過，手機左右 focus 外框無裁切。
- [x] 回歸驗證：完整 Playwright 32 通過／8 個既有失敗／新增失敗 0；JS 語法、CSS 結構、HTML 檔尾、嚴格 UTF-8／LF、`git diff --check` 與 Python／Node hash 複驗通過。

## 2026-07-18

### 共用小型長按刪除與功能文字字型統一

- [x] 任務 DEL、Flags、道具、擅長領域、日記單則、冒險日誌單筆，以及角色配置 NPC／情境共 8 組小型刪除鍵，統一接到同一套兩階段長按刪除控制器。
- [x] 第一次短按只進入待命；第二次持續按住 1.2 秒，紅色進度完整填滿並保留最後一格 50ms 後才刪除。提早放開、移動超過 10px、`pointercancel`、切換頁面或按鈕中途重繪都會安全取消，且不會讓舊計時誤刪新的操作。
- [x] 文字鍵統一為專案功能文字規格 `TRPG Cubic Pixel`／12px／400／1px；原字、待命灰字與紅色填滿字三層實際計算樣式一致。DEL 與 NPC 提示向右展開，情境提示向左展開，DEL 不再遮住左側驚嘆號。
- [x] `×`／`✖`／`✕`／`－` 等符號鍵全程保留原符號與原尺寸，只在符號內填入紅色進度，不改成文字；手機保留 `touch-action: manipulation`、10px 移動取消與 44px 情境觸控高度，601–1099px 粗指標平板同樣生效。
- [x] 道具刪除的 `aria-label`／`title` 改為帶 `{item}` 的中英日模板，切換語言時會刷新所有已註冊按鈕；鍵盤操作保留確認視窗，滑鼠／觸控長按不再另跳確認框。
- [x] 清除 DEL、NPC 與情境刪除的重複字型／定位覆蓋，字型只由共用 `hold-delete-text` 規則提供；沒有新增 `!important`。
- [x] 修改檔案：`app-ui-helpers.js`、`app-memory.js`、`app-status-journal.js`、`app-config-ui.js`、`i18n.js`、`style-1-base.css`、`style-4-desktop-config.css`、`style-5-mobile-config.css`、`style-6-surfaces.css`、`style-7-game.css`、`tests/e2e/status-player-sheet.spec.js`、`tests/e2e/hold-delete.spec.js`、`TODO.md`、`COMPLETED.md`。
- [x] 驗證：長按刪除專項 11/11 通過，涵蓋 8 組正式 caller、特殊字體三層、最終填滿畫面、取消競態、重繪移除、語言切換、鍵盤與粗指標平板；完整 Playwright 42 通過／8 個既有失敗／新增失敗 0。JS 語法、CSS 結構、嚴格 UTF-8／LF、`git diff --check` 與延遲 hash 複驗通過。

### NPC 認識夥伴兩步化與共用返回控制

- [x] 移除與 NPC 唯讀六欄重複的「人物基底確認」導入頁；從唯讀頁點「認識夥伴」會直接進入「和他說一句」，流程進度統一為 01／02、02／02，空白 NPC 仍會先阻擋且不送出 AI 請求。
- [x] NPC 唯讀、NPC 編輯與認識夥伴流程改為共用同一個 `#config-editor-back` DOM、同一個 `handleConfigEditorBack()` 與同一套桌機／手機樣式；按鈕為無文字的重點色 SVG，透明無框，保留 44×44px 點擊／觸控範圍。
- [x] 左上共用鍵只負責離開目前層級；「回到他的回答」「換一個情境」「再和他說一句」等流程內操作保留各自功能，沒有把不同目的地硬併成同一個返回行為。
- [x] 情境回答頁新增「完美！」，按下後回到目前 NPC 的唯讀頁；同時補上原本已渲染但未接處理器的「換一個情境」動作。
- [x] 清除已移除導入頁與舊 NPC 編輯頁首留下的無引用 CSS；人物六欄共用的 `.npc-flow-basis-*` 仍保留供 NPC／玩家唯讀頁使用，沒有新增 `!important`。
- [x] 修改檔案：`app-config-ui.js`、`index.html`、`style-7-game.css`、`i18n.js`、`tests/e2e/npc-acquaintance-flow.spec.js`、`tests/e2e/status-player-sheet.spec.js`、`TODO.md`、`COMPLETED.md`。
- [x] 未改玩家返回流程、存檔格式、`sanko_*` key、AI prompt、API key、圖片傳送／匯出規則或遠端 Git。
- [x] 驗證：1440px 桌機、553px 觸控手機與 815px 粗指標平板實際渲染均只有一顆 44×44px 共用返回鍵、無水平溢位；NPC 專項 7／7 通過；完整 Playwright 由動工前基線 43 通過／8 失敗改善為 45 通過／6 個既有失敗，新增失敗 0。

### 配置響應式分流與存檔頁跨斷點掛載修正

- [x] 保留玩家、NPC、情境共用的無文字 SVG 返回控制與 44×44px 命中區；未恢復已移除的舊返回元件。
- [x] 撤回把 601–1099px 細指標桌機強制套入手機單欄的規則；細指標維持桌機雙欄，觸控／粗指標於 ≤1099px 使用手機配置。
- [x] 存檔頁新增 1100px 斷點監聽：窄視窗開啟後拉寬會重新掛入首頁存檔容器，拉窄則回到原本獨立頁錨點；不再停留於開啟當下的 DOM 結構。
- [x] 修改檔案：`app-core.js`、`app-config-ui.js`、`style-4-desktop-config.css`、`style-5-mobile-config.css`、`style-7-game.css`、`tests/e2e/npc-acquaintance-flow.spec.js`、`tests/e2e/status-player-sheet.spec.js`、`TODO.md`、`COMPLETED.md`。
- [x] 未改存檔格式與內容、`sanko_*` key、AI prompt、API key、圖片傳送／匯出、角色／情境資料流或遠端 Git；沒有新增 `!important`。
- [x] 驗證：900px 細指標桌機雙欄、390px 觸控單欄、共用返回與存檔頁 900→1200→900→1200 重新掛載專項 4／4 通過；實際瀏覽器縮放無 console error；完整 Playwright 48 通過／4 個既有量測失敗，與動工前基線完全一致，新增失敗 0。

### 桌機專用圖片背景與窄版返回修復

- [x] 將首頁殼層、存檔頁掛載與背景能力統一到單一 `desktopShellMedia`（`>=1100px`）判斷來源，不再由各功能重複建立同一條 media query。
- [x] 圖片背景只改「有效模式」：窄版根節點固定為 `solid` 並隱藏圖片控制列，但完整保留 `uiBgMode`、`uiBgImage` 與既有儲存偏好；拉回 1100px 會自動恢復圖片與控制列。
- [x] 窄版不新增存檔／日誌／首頁的個別玻璃覆蓋；既有 `data-bg-mode="image"` 半透明規則自然失效。CSS 只補背景控制列的 `[hidden]` 狀態規則，沒有新增 `!important`。
- [x] `showHomeInfoView('main')` 改為任何寬度都可重設首頁 view，其他 API／玩法／存檔／日誌／日記在窄版仍沿用既有獨立頁／modal fallback；存檔頁按「返回大廳」不再留下空的 `saves` active view。
- [x] 最終差異：`app-core.js`、`app-saves-game.js`、`style-5-mobile-config.css`、`tests/e2e/status-player-sheet.spec.js`、`COMPLETED.md`；`TODO.md` 依流程登記後移除，最終 bytes 回到原狀。
- [x] 未改存檔內容／格式、背景圖片資料、`sanko_*` key 語意、API key、AI prompt、角色／情境資料流、翻譯或 Git 歷史。
- [x] 驗證：返回大廳＋1099／1100px 背景能力專項 2／2 通過；完整 Playwright 49 通過／4 個既有量測失敗，與動工前基線完全一致，新增失敗 0。全部 JS 語法、CSS／HTML 結構、嚴格 UTF-8／LF、預期 bytes 全等與 `git diff --check` 通過。

### 冒險日誌跨斷點掛載與現存 E2E 基線修復

- [x] 冒險日誌納入既有單一 `desktopShellMedia`／`syncDesktopShellFeatures()` 同步；窄版獨立頁拉寬會掛入桌機首頁，桌機首頁拉窄會還原到 `#journal-screen-home`，遊戲內 inline journal 由 `journalEmbedded` 排除而不受影響。
- [x] 桌機→窄版切換時先將首頁 active view 重設為 `main` 再隱藏首頁，避免窄版關閉後回到空白大廳；窄版使用日誌返回鍵，桌機內嵌版沿用既有 Home 側欄正式返回路徑。
- [x] 真正的 CSS 產品偏差只有詳細頁標題文字軸：既有 12px 游標配 28px gap 得到 40px，與內容／dossier 的 42px 縮排不一致；只將原規則改為 30px，保留語意對齊斷言。
- [x] 舊測試基線更新為既有核准 UI：玩家／dossier／organizer 游標 12×18px（organizer 另同步 2px×18px 背景量測），角色配置編輯姓名 18px；沒有為測試改動這些產品外觀。
- [x] 修改檔案：`app-core.js`、`style-3-panels.css`、`tests/e2e/status-player-sheet.spec.js`、`TODO.md`、`COMPLETED.md`；`app-status-journal.js` 僅唯讀核對，無需修改。
- [x] 未改存檔格式與內容、`sanko_*` key、API key、AI prompt、背景圖片資料、角色／情境資料流或遠端 Git；沒有新增 `!important`、media query、檔尾 hotfix 或重複 selector。
- [x] 驗證：失敗點精準複跑 2／2、`status-player-sheet.spec.js` 16／16、完整 Playwright 54／54 通過；窄版 effective background 為 solid、1100px 恢復 image、存檔頁跨斷點與返回大廳均通過。14 份 JS 語法、7 份 CSS 結構、HTML 檔尾、25 份文字檔嚴格 UTF-8／LF 與 `git diff --check` 通過。

### 配置頁窄版穿框與桌機返回鍵修復

- [x] 修正配置版型判斷：≤600px 即使是 fine pointer 也只走窄版；≥601px fine pointer 與 ≥1100px 維持既有雙欄桌機。`isDesktopConfigLayout()` 與既有桌機 CSS media query 同步，避免固定 850px 高度和窄版 `overflow: visible` 同時生效。
- [x] 553px fine-pointer 遊戲設定的最後內容、批次刪除列與匯入匯出列均留在外框內；真正桌機框維持固定尺寸，內層保留 `overflow-y: auto`。
- [x] 雙欄桌機共用返回箭頭改為隱藏；玩家／NPC／情境與認識夥伴流程改由左欄可見項目切換，390px、553px 與 coarse-pointer 窄版返回鍵保留。
- [x] 修改檔案：`app-config-ui.js`、`style-4-desktop-config.css`、`style-7-game.css`、`tests/e2e/status-player-sheet.spec.js`、`tests/e2e/npc-acquaintance-flow.spec.js`、`tests/e2e/player-readonly-preview.spec.js`、`TODO.md`、`COMPLETED.md`。
- [x] 未修改頂部分類按鈕外觀、存檔格式、`sanko_*` key、API key、AI prompt、背景圖片資料或長期知識庫；沒有新增 `!important`、media query、檔尾 hotfix 或重複 selector。
- [x] 驗證：新增回歸先紅後綠，四個受影響舊案例 4／4、完整 Playwright 55／55 通過；14 份 JS 語法、7 份 CSS 大括號、嚴格 UTF-8／LF 與 `git diff --check` 通過。

## 2026-07-19

### 手機存檔命令列、共用 SVG 返回與冒險日誌工具回饋

- [x] 手機存檔頁採精簡命令列：`DATA ACTIONS` 反白眉題、共同左軸與 48px 操作高度；只有主要操作顯示靜態像素三角形，次級操作不再增加卡片或按鈕框。
- [x] 角色配置、存檔頁、手機日記與冒險日誌返回控制引用同一個 `#theme-icon-back` SVG symbol；頁面返回共用 44×44px 透明基底，桌機配置與桌機日記仍依既有規則隱藏返回鍵。
- [x] 冒險日誌 `#journal-save-select` 改為專案常用的重點色實底、零圓角、置中選項 BAR；背景圖模式不再覆蓋成卡片底，搜尋列維持原本單底線。
- [x] 冒險日誌與角色面板的「整理」共用短促像素游標回饋：細指標 hover 位移、觸控 active 回饋、鍵盤 focus 保留可見狀態，`prefers-reduced-motion` 停用位移與轉場。
- [x] 修正冒險日誌跨斷點時舊文字寫入會清掉 SVG 子節點的問題；既有 embed／restore、桌機首頁與窄版獨立頁掛載流程維持不變。
- [x] 修正桌機內嵌日誌隱藏返回鍵後，標題誤落入 44px 圖示欄而逐字換行的回歸；桌機標題恢復橫排，選取值與展開選項統一置中。
- [x] 最終修改檔案：`index.html`、`style-1-base.css`、`style-4-desktop-config.css`、`style-6-surfaces.css`、`style-7-game.css`、`app-status-journal.js`、`i18n.js`、`tests/e2e/status-player-sheet.spec.js`、`tests/e2e/npc-acquaintance-flow.spec.js`、`COMPLETED.md`；`TODO.md` 依流程登記後移除，最終 bytes 與 HEAD 相同。
- [x] 未改存檔格式、`sanko_*` key、匯入匯出資料、AI prompt、API key、桌機存檔操作層級或其他按鈕系統；沒有新增 `!important`、重複斷點邏輯或檔尾 hotfix。
- [x] 驗證：390／600px 手機存檔命令列、手機日記 SVG 返回、1099／1100px 冒險日誌與存檔重新掛載、桌機日誌橫排標題／置中選項、窄版純色背景、返回大廳、背景圖恢復及整理動態專項通過；完整 Playwright 57／57、JS 語法、HTML／CSS 結構、嚴格 UTF-8／LF 與 `git diff --check` 通過。

### NPC 再聊一次直返與手機日誌頁首對齊

- [x] 回答判斷頁的「再和他說一句」改為點選後直接返回 01／02 提問頁；接受回答與修正語氣仍保留原本的確認步驟。
- [x] 手機日記改用與冒險日誌相同的 `screen-header` 三欄結構、共用 SVG 返回鍵與 24px 置中標題；390px 下返回鍵與標題的水平／垂直座標差異皆小於 1px，桌機日記返回鍵維持隱藏。
- [x] 本項修改檔案：`app-config-ui.js`、`index.html`、`style-5-mobile-config.css`、`style-6-surfaces.css`、`tests/e2e/npc-acquaintance-flow.spec.js`、`tests/e2e/status-player-sheet.spec.js`、`COMPLETED.md`；`TODO.md` 完成後移除本項並恢復為 HEAD 內容。
- [x] 未改括號按鈕群整體排版、存檔格式、`sanko_*` key、AI prompt、API key、匯入匯出或翻譯文字；沒有新增 `!important`、重複 media query 或檔尾 hotfix。
- [x] 驗證：新增流程直返與手機雙頁首幾何測試，修正前兩項均可重現失敗、修正後專項通過；完整 Playwright 58／58、16 個 JS／測試語法檢查、7 份 CSS 括號平衡、HTML 檔尾、嚴格 UTF-8／LF 與 `git diff --check` 通過。

### 共用主／次級命令層級與手機存檔標題

- [x] 主命令統一為常駐像素三角：待機以 900ms 階梯節奏輕推，按下時按鈕與三角形前移並顯示重點色字影；生成中／重新生成等動態文字狀態也會繼承同一回饋。
- [x] 非刪除次級命令統一為既有五級字體中的 14px、無框文字與 2px 黃芯、上下各 1px 黑邊的底線；hover 與觸控共用單一可中斷 transform transition，觸控按下保留 360ms 完整收尾，不再未跑完就跳回開頭。
- [x] 套用存檔、桌機／窄版配置、角色面板另存、隨機生成、NPC 認識夥伴流程與一般取消命令；刪除／清空、SVG 返回、頁籤、分頁、篩選、冒險日誌工具列與既有「儲存並返回」膠囊均維持原樣。
- [x] 手機存檔標題由「選擇記憶紀錄」精簡為「記憶紀錄」，同步 zh-TW／en／ja；主要命令獨占首列，兩個次級命令並列，390／600px 均維持 48px 操作高度且無水平溢位。
- [x] 最終修改檔案：`index.html`、`app-config-ui.js`、`app-ui-helpers.js`、`i18n.js`、`style-2-status.css`、`style-7-game.css`、`tests/e2e/npc-acquaintance-flow.spec.js`、`tests/e2e/status-player-sheet.spec.js`、`TODO.md`、`COMPLETED.md`。
- [x] 未改存檔格式、`sanko_*` key、匯入匯出資料、AI prompt、API key、儲存層或遠端 Git；沒有新增 `!important`、全域 `button` 覆蓋、重複 media query、檔尾 hotfix 或順手重構。
- [x] 驗證：本次命令動態／手機排列專項 2／2、舊字級斷言修正後 1／1、兩支完整 Playwright 27／27 通過；全部 `app-*.js`、`i18n.js` 與兩支測試語法、7 份 CSS 括號、HTML 檔尾、嚴格 UTF-8／LF、Python／Node hash 與 `git diff --check` 通過。

### 待辦帳本實況校正與舊項補歸檔

- [x] 玩家唯讀預覽已存在於 `#desktop-player-readonly-preview`，具「總覽 → 唯讀 → 編輯／返回」正式路徑、六欄與三語同步；本次專項 Playwright 7／7 通過。完成內容原已記於 2026-07-16 條目，本次移除 `TODO.md` 的重複舊待辦。
- [x] 新增情境同步修復確認仍在目前 `app-saves-game.js`：`openStatusScenarioEditor()` 會設定情境 view／index 並開啟 scenario 編輯；本次 dossier／情境編輯專項 Playwright 1／1 通過。原修補來自 commit `220f3a1`，本次補入完成帳本。
- [x] 存檔選單「筆記目錄風」確認仍在目前 CSS：存檔列為重點色短線＋細分隔線、hover 伸長與微縮排、拖拉把手細指標 hover 才出現，並已移除存檔列／本機資料狀態的重複玻璃卡底；原實作來自 commit `220f3a1`，本次補入完成帳本。
- [x] 手機封面透明方框舊待辦已由「桌機專用圖片背景與窄版返回修復」完成：窄版 effective background 固定為 solid，背景圖資料與偏好保留，返回大廳與跨斷點恢復已有回歸驗證；本次只移除重複待辦，不重複宣稱新實作。
- [x] 輸入框統一沒有誤判為全部完成：已完成的 24 個角色細節欄位維持既有完成歸檔，`TODO.md` 改寫為其餘長文輸入框的盤點與剩餘批次。
- [x] `TODO.md` 新增遊戲設定／系統頁重排、命令遺漏與整理字影、全站五級字體稽核、長期知識庫四組未完成事項，並明記舊設定頁預覽全部作廢。
- [x] 本次只修改 `TODO.md` 與 `COMPLETED.md`；未修改任何 JS、CSS、HTML、測試、存檔格式、`sanko_*` key、AI prompt、API key、儲存層或遠端 Git。

### 遊戲設定頁與系統頁重排（commit `6df6c3b`，本條為事後補歸檔）

- [x] 重排「遊戲設定」與角色面板「系統」頁 DOM，補齊 ARIA 與完整狀態（`index.html`）；遊戲設定桌機三區構圖與共用控制規格（`style-4-desktop-config.css`）、390px 獨立手機構圖（`style-5-mobile-config.css`）。
- [x] 系統頁欄位、統計、模型列與標題同色陰影（`style-2-status.css`）；移除統計區多餘的第二層玻璃背景（`style-6-surfaces.css`）。
- [x] 配置鎖定鏈、全選只作用於 unlocked 項目、批次刪除接上共用兩階段長按刪除（`app-config-ui.js`）；「重設統計」由圓框按鈕改接共用長按控制，共用長按文字同時支援刪除／重設語彙（`app-ui-helpers.js`）。
- [x] 系統頁 4／8 模型列、供應商資訊、統計重設與 tabs 狀態（`app-scenario-state.js`）；新增標題、難度雙行說明、供應商與費用等多語言（`i18n.js`）。
- [x] 修改檔案共 10 個：`index.html`、`app-config-ui.js`、`app-scenario-state.js`、`app-ui-helpers.js`、`i18n.js`、`style-2-status.css`、`style-4-desktop-config.css`、`style-5-mobile-config.css`、`style-6-surfaces.css`、`tests/e2e/status-player-sheet.spec.js`（新增鎖定、批次刪除、重設與尺寸驗收）。
- [x] 未新增 `!important`、全域控制項覆蓋或 media query；手機導航、`statsLocked`、存檔格式、`sanko_*` key、AI prompt、API key 均未修改。
- [x] 驗證：完整 Playwright 32／32、15 個 JS 語法檢查通過；1280／1600／390×844 驗證字級、overflow、三區軸線、手機閱讀順序與無原生滾動條；正式 10 檔與核准版本逐 byte 相同，UTF-8、CSS／HTML 結構與 `git diff --check` 通過。
- [x] 補記：Codex 完成報告時尚未執行 Git 寫入（當時 HEAD 為 `856efe4`），專案主隨後將程式碼與帳本一併提交為 `6df6c3b`，帳本漏記本項，由 Claude 於同日補齊。原同組待辦中的「整理」選取字影重疊未在本批處理，仍留 `TODO.md`。

### 背景圖模式命令按下動態修復與全站盤點

- [x] 修復背景圖模式重置規則（`style-7-game.css`）壓死按下 transform 的 bug：`:root[data-bg-mode="image"]` 基態規則特異性 (0,4,1) 蓋過 `:active` 重宣告 (0,3,1)，於兩條 `:active` 規則補背景圖 selector 升至 (0,5,1)；受影響共 6 顆（儲存／另存／匯出／匯入配置＋情境頁兩顆 AI 生成鈕）全數修復，零 `!important`。
- [x] Cascade 稽核 18 顆共用命令 × 純色／背景圖：無同族殘留；390／600／1099／1280 溢位、存檔頁與冒險日誌跨斷點重掛載、遊戲設定雙模式三語溢位全數通過，console 零錯誤。
- [x] 驗證：實機按住取樣兩模式 transform 恢復、`status-player-sheet.spec.js` 19／19。

### 桌機日記修正、手機配置分類籤重排與小標移除

- [x] 桌機日記返回鍵重現修復（`style-6-surfaces.css`）：共用 `button.page-back-button` (0,1,1) 蓋過 `.diary-back-btn` 隱藏 (0,1,0)，隱藏規則升為 `button.diary-back-btn`；`.diary-inner` translateY 52→41px，日記標題與冒險日誌同高（實測 deltaY=0）。手機 390px 返回鍵 44×44 與置中標題不受影響。
- [x] 手機配置頁四顆粗框分類鈕改為分頁籤語彙（`style-5-mobile-config.css`，經工作區外預覽三方向比較後核准方向 A）：純文字 14px＋黃指示條壓灰分隔線、HOME 改 44×44 透明 SVG、按壓 scale 回饋、hover 僅細指標、reduced-motion 關閉 transition；日文籤降 12px＋縮 gap 防 390px 溢位；DOM 與 JS 零改動，桌機直向側籤原樣。
- [x] 遊戲設定「目前配置」區塊小標移除（`index.html`）：與欄位標籤重複；section 改 `aria-label`（i18n 會翻譯 aria-label 屬性，無障礙不降級）。
- [x] 驗證：三語×多寬度溢位與切換實測、`status-player-sheet.spec.js`＋`npc-acquaintance-flow.spec.js` 27／27、E2E 19／19、CSS 括號與嚴格 UTF-8／LF、`git diff --check` 通過。

### 開機簾幕標題動畫（柔光掃過 reveal）

- [x] `#boot-curtain` 加入直排疊字「旅途／筆記」＋副標「JOURNEY NOTES」（`index.html`）：行內 vanilla 引擎（載入期即跑），柔光由左至右 smoothstep 等速掃過（1.15s），暗處為 8.5% 真字暗影、光緣字元才凝聚 ░▒▓ 亂碼（上限 ▓ 不用 █，避免實心磚；全程同時亂碼 ≤3 字）、±9% jitter＋15% 頑固字鎖上閃螢光、點燃邏輯（鎖定字固定紙色不隨光熄滅）、無回頭光暈；鎖定後壞霓虹管式偶發 flicker。經工作區外預覽多輪核准（`D:\_codex_preview\journey-notes-boot-title\`）。
- [x] 樣式（`style-3-panels.css`）：radial-gradient `background-clip: text` 柔光、點燃／flick 以宣告順序取代 `!important`；字級 66px（Cubic 11 格點 6 倍）／手機 44px（4 倍）、副標 15px，列五級字級例外白名單；字元 span 明確 `font: inherit` 避開 `*` 閱讀字型規則。
- [x] 硬約束全數保留：`dismissBootCurtain()`、8 秒保險、E2E 等待簾幕移除不動；動畫純裝飾、簾幕移除即停（`isConnected` 守衛）；reduced-motion 直接顯示靜態標題；字型就緒等待上限 150ms 不拖慢開機。
- [x] 驗證：正式引擎於正式頁面重掛實測 16/16 字元點燃、`boot-done` 收尾、手機 44px 規則生效；簾幕正常掀開移除、console 零錯誤；`status-player-sheet.spec.js` 19／19（每條測試皆含開機流程等待）。
- [x] 實機回饋修正一：最短展示——動畫開跑時設 `__bootTitleHoldUntil`（+1.5s），`dismissBootCurtain()`（`app-ui-helpers.js`）讀取並延後掀幕，載入太快也能看完掃光；載入慢於 1.5s 時零額外等待，8 秒保險與 reduced-motion 不受保底影響。
- [x] 實機回饋修正二：字體置換閃現——head 加 `Cubic_11.woff2` preload、標題於像素字就緒前 `visibility: hidden`（上限 400ms），首幀即像素字；實拍確認開場暗影階段無 FOUT。E2E 帶保底重跑 19／19（40→59s）。

### 道具使用提醒騷擾修正（prompt 反催促＋教學逃生門）

- [x] 問題一（非教學也每回合提醒用道具）：常駐規則原文「用不用由玩家在道具區的『使用』按鈕決定」被小模型轉譯成對玩家的台詞提醒。改寫該句為行為約束＋反催促（`app-saves-game.js` items_add 規則）：「不得在敘事或對白中催促、提醒或暗示玩家使用道具——玩家自會決定何時使用」，並移除介面詞彙。
- [x] 補通用規則：敘事與 NPC 對白不得後設提及遊戲介面（輸入框／按鈕／面板／道具區／擲骰）或教玩家操作，僅新手教學模式明確允許的範圍例外。
- [x] 問題二（教學旗標永不解除→無限教用道具）：`app-ai.js` 加教學逃生門——旗標存在且對話已達 16 回合（以【旁白】行數推算，免新增存檔欄位）即程式摘旗＋系統訊息「新手教學已自動結束」；舊存檔殘留旗標下一回合自動解除。原完成硬驗收流程不動。
- [x] 新系統訊息三語同步（`i18n.js`）。
- [x] 驗證：`node --check` 三檔通過、嚴格 UTF-8／LF、完整 Playwright 58／58 通過。未動存檔格式、`sanko_*` key、API key、`buildLatestActionPrompt`／`callAI_JSON` 骨架；系統提示入史行為（`createSystemAlert`）未動（盤點列為次選，影響面大暫緩）。
