# 技術債盤點清單（TECH_DEBT.md）

- 盤點日期：2026-07-11｜盤點方式：唯讀腳本掃描（Claude），未修改任何程式
- 行號基準：第二、三節仍為 `88a4e3811f265b65` 版行號（第一波清除前）；第一節已更新為 `45476f27d19cb004` 版。**style.css 一經修改行號就會漂移，動手前一律先用 selector 重新定位。**
- 使用規則：不專門大掃除；哪次任務剛好動到某區，才順帶清那一區的債。每批清完必須：桌機＋手機雙版面目視驗收、CSS 括號平衡檢查、`git diff` 小範圍可讀。
- 本檔已納入 Git 追蹤（2026-07-11 起），修改比照程式檔安全寫檔流程，版本歷史見 Git。

## 一、CSS 殭屍層（2026-07-11 第一波已清）

### 已清除（2026-07-11，7 個 selector／6 塊，-16 行）

`.setup-info-view h3`、`#status-page-settings .anime-sheet textarea`、`#status-page-settings .scenario-input`、`#status-page-settings .anime-sheet input`、`#status-page-settings .dark-card-content`、`#status-page-settings details.dark-card`、`.npc-affection.affection-full`（舊 hop 版，行內壓行規則中段移除，mood 版接手）。
清除後 style.css SHA-256 前 16 碼：`45476f27d19cb004`（本節以下行號以此版為準）。

### 第二波已清（2026-07-11，B1 全數，5 處、-10 行）

深度靜態分析證明五處皆同 selector＋同 media、屬性全被後繼覆蓋：整塊刪除 3 個（`.delete-scen-btn` 舊定位、`.avatar-preview` 方形舊版、`.anime-sheet` 舊排版），拆組手術 2 個（自 1922 六選一群組摘除 `[player] #preset-player-editor`、自 grid 群組摘除 `.game-difficulty-note`）。清除後 style.css SHA-256 前 16 碼：`ea22d3e121089060`。

### 第三波已清（2026-07-11，B2 收官）——殭屍帳清零

拆組手術 3 個：`#setup-screen .diary-title`（自 Cubic 字體群組摘除，行 3360 後繼完整重定義）、`:root[data-bg-mode="image"] #model-selection-area` 與 `#desktop-config-editor .stat-box`（自卡片玻璃群組摘除，後繼分別於「無底色」節與桌機卡片節接手）。
`.desktop-overview-add-card`：初判「非殭屍」是誤判——當時它所屬群組被一次錯誤的規則插入攔腰污染（詳見下）。群組修復後確認仍為殭屍，已完成拆組摘除。
**本節結案：全檔已無「整塊屬性被後繼覆蓋」的死層。**
事故記錄（2026-07-11 晚）：在逗號群組**中段**插入新規則會把群組攔腰切斷、前半 selector 併入新規則共用宣告；bytes 級驗證無法察覺此類 CSS 語意破壞，本次靠 Codex 唯讀複查發現（症狀：背景圖模式桌機卡片邊框消失）。**預防守則：CSS 錨點必須落在完整規則塊邊界（前一塊的 `}` 之後），插入前先確認錨點行不是某群組的中段成員；同 selector 想覆蓋請直接改原塊，不要往檔尾疊新塊。**

## 二、`!important` 清單（共 63 個）

### A. 白名單——永久保留，不得清（約 23 個）

- 行 639–645：隱藏 file input 七連發（PROJECT_MAP 白名單）
- 行 2578、2589–2592：手機 overflow／狀態面板行動版覆蓋（PROJECT_MAP 白名單）
- 行 2210、2229–2230：桌機配置切換（PROJECT_MAP 白名單）

### B. 待逐步確認（約 40 個，依肥瘦排序）

1. 行 457 `.journal-pagination`：單條規則 8 個 `!important`，最肥目標。
2. 行 2590–2592 `#status-modal-content` 系列：手機版狀態面板串（與白名單相鄰，拆時小心邊界）。
3. textarea 三胞胎：行 802–819、2350、2379、2383、2421 的 `min-height/resize/overflow` 同招重複三遍，可合併為共用 class 順帶去 `!important`。
4. 行 530 `.creator-mode-btn:not(.active)` ×3。
5. 行 589 `.btn:disabled` ×4。
6. 零星：303–304（overflow 捲動）、598（#crop-img）、890、2033、2492、2503、3343、3371、3442（diary 系）。

### 重複定義說明

同 selector 重複定義共 108 組，其中絕大多數為「基礎層＋手機 @media 覆蓋」的刻意成對設計，**不是債、不要清**。真正的死層已收進上方殭屍清單。

## 三、全域變數讀寫矩陣（2026-07-11）

危險度依「寫入者檔案數」排序。改動高危變數前，先到此確認會牽動哪些檔案。

| 變數 | 危險度 | 賦值（改指向） | 內容變異 | 讀取檔數 |
|---|---|---|---|---|
| `currentScenario` | ★★★ | backup-io、core、gameplay、preset-edit×2、saves-game、storage | config-ui、gameplay×11、memory、preset-edit、saves-game、status-journal | 12 |
| `scenarioPresets` | ★★★ | core、preset-edit、storage×3 | backup-io、gameplay、preset-edit×11、saves-game×6、status-journal、storage | 11 |
| `activePresetId` | ★★☆ | backup-io×2、core、preset-edit×4、saves-game×2、storage×2 | — | 8 |
| `currentAdventureLog` | ★★☆ | ai×8、core、gameplay、memory、scenario-state、status-journal×5 | — | 7 |
| `currentOpenTasks` | ★★☆ | ai、core、gameplay、memory×6、preset-edit、status-journal | — | 7 |
| `savesData` | ★★☆ | core、preset-edit、storage | backup-io、preset-edit、saves-game×4 | 9 |
| `currentFlags` | ★★☆ | ai×3、core、gameplay、status-journal | ai、gameplay、scenario-state、status-journal×4 | 6 |
| `chatScripts` | ★☆☆ | core、gameplay×3 | gameplay、preset-edit、saves-game | 6 |
| `currentItems` | ★☆☆ | ai、core、gameplay、status-journal | ai、gameplay、status-journal | 5 |
| `currentHp`／`currentSan` | ★☆☆ | ai×2、core、gameplay×5 | — | 5 |
| `apiKey` | ★☆☆ | api×4、core、saves-game、storage | — | 6 |
| `selectedModel` | ★☆☆ | api×3、core、storage | — | 9 |
| `currentSaveId` | ★☆☆ | backup-io、core、gameplay、preset-edit | — | 8 |
| `currentChatPageIndex` | ★☆☆ | core、gameplay×3、saves-game | — | 6 |
| `sessionApiKeys` | ☆☆☆ | core | api×3、saves-game、storage | 4 |
| `survivalGraceTurns` | ☆☆☆ | ai、gameplay×3 | — | 3 |
| `pendingLastStand` | ☆☆☆ | ai、gameplay×4 | — | 3 |

（檔名省略 `app-` 前綴與 `.js`；×N 為出現次數，無標記即 1 次。）

## 四、全域耦合的處理方針

- **只做文件與守則，暫不改架構**：classic script 共用全域是現行設計，模組化改造風險遠大於收益，不排程。
- 動 ★★★ 變數（`currentScenario`、`scenarioPresets`）前，先用本矩陣確認影響面，並在完成報告列出「碰過哪些檔案的哪些寫入點」。
- 新增功能時優先透過既有入口函式（`persistJson`、`saveCurrentProgress` 等）寫入，不要新增散落的直接賦值。
