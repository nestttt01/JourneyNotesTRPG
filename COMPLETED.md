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
