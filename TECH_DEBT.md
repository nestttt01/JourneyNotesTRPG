# 技術債盤點清單（TECH_DEBT.md）

- 盤點日期：2026-07-11｜盤點方式：唯讀腳本掃描（Claude），未修改任何程式
- **行號基準（2026-07-17 重要更新）：`style.css` 已拆為 7 個 `style-*.css`（bytes 級純搬移，見 COMPLETED），本檔所有 style.css 行號全面作廢，僅供歷史對照。定位一律改用 `rg '<selector>' style-*.css`。**
- 2026-07-17 `!important` 現況基線（出現次數實測，非行數）：style-1-base 10、style-2-status 19、style-3-panels 4、style-4-desktop-config 11、style-5-mobile-config 18、style-6-surfaces 4、style-7-game 4，**合計 70——比 07-11 舊帳的 61 淨增 9**。07-11 後有清（如 `.creator-mode-btn` ×3）但近期 UI 工作加得更多；新增者未分類，下次動到對應區域時順帶盤點是否該進白名單或清除。第二節逐條帳未重掃，白名單分類仍有效。
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

## 二、`!important` 清單（共 61 個）

### A. 白名單——永久保留，不得清（約 23 個）

- 行 639–645：隱藏 file input 七連發（PROJECT_MAP 白名單）
- 行 2578、2589–2592：手機 overflow／狀態面板行動版覆蓋（PROJECT_MAP 白名單）
- 行 2210、2229–2230：桌機配置切換（PROJECT_MAP 白名單）

### B. 待逐步確認（約 38 個，依肥瘦排序）

1. 行 457 `.journal-pagination`：單條規則 8 個 `!important`，最肥目標。
2. 行 2590–2592 `#status-modal-content` 系列：手機版狀態面板串（與白名單相鄰，拆時小心邊界）。
3. textarea 三胞胎：行 802–819、2350、2379、2383、2421 的 `min-height/resize/overflow` 同招重複三遍，可合併為共用 class 順帶去 `!important`（07-17 又發現新副本，見「2026-07-17 新增追蹤」節）。
   **專案主裁示（2026-07-17）：三處高度（86/96/82px）不必保留差異，清理時統一為單一值（建議 96px，取最大），共用 class 單值即可、免 CSS 變數；驗收＝三處輸入框統一起始高度且 `resize: vertical` 拖拉不變。**
   **07-17 深夜偵察結果（清理前必讀）：**
   - 副本全清單：style-2-status:627–631（系統頁 86px）、style-4:945–950（外貌/背景 96px）、style-4:976–980（情境內文 82px）、style-4:982（132px 另一處）、style-7-game:981（86px）。
   - 源頭＝style-1-base:330/333 的 `.anime-sheet textarea`／`textarea.scenario-input` 基礎規則（`resize: none; overflow: hidden`，自動長高設計）。副本 selector 全都帶 id、特異性本來就贏，**`!important` 疑似全數是打錯對象的 cargo cult**——真正的對手是 `autoResize()`（app-core.js:8，inline `style.height`），而 inline height 本來就輸給 min-height、也蓋不掉 overflow/resize。
   - 彩蛋 bug：`initTextareas()` 對**全部** textarea 套 autoResize，這批「可拖拉」欄位拖完一打字就被 inline height 彈回——清理時應一併決定是否讓這批欄位跳過 autoResize（需小改 JS，例如以 class 排除）。
   - 清理方案：一條共用規則（union selector 或 class）＋ 96px 統一值，先在真實頁面驗證拆 `!important` 後 computed style 不變，再逐畫面目視；JS 排除 autoResize 由專案主另行核准。
4. 行 589 `.btn:disabled` ×4。
5. 零星：303–304（overflow 捲動）、598（#crop-img）、890、2033、2492、2503、3343、3371、3442（diary 系）。

已清：`.creator-mode-btn:not(.active)` ×3 隨單框輸入列改造移除；神模式視覺改由 `.input-mode-tab.active` 接手，不再需要 `!important`。

### 2026-07-17 新增追蹤（07-11 基線後淨增 9，實測合計 70）

以 `comm` 對比 07-11 基線（dc214d8）與現況，新增位置與初步分類：

- 疑似正當（動畫抑制家族，可能屬 reduced-motion／效能覆蓋，確認後入白名單）：style-3-panels:485–486、1190–1194（`animation/transition: none`、`opacity: 0`）。
- 疑似正當（桌機配置分區切換家族，同白名單 A 類）：style-4-desktop-config:816、835–836（`display: none`）。
- 舊債複製（textarea 尺寸三胞胎的新複製品，B3 同款）：style-2-status:629–631、style-4-desktop-config:949、978（`min-height/overflow-y/resize`）。
- 待查（硬藏元素，hotfix 嫌疑）：style-2-status:382、387、602（`display: none`／`opacity: 0`）、style-1-base:338（`overflow-y`）。
- 行號為 2026-07-17 拆檔後各新檔行號；動手前仍以 selector 重新定位。

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

## 五、同 context 部分屬性衝突（2026-07-12 掃描）——已清（同日）

**2026-07-12 已收斂：下表 9 組僅刪除「被後繼同 selector 同屬性覆蓋」的死宣告（含 `#flag-input-area` 整條死規則），未搬移或合併任何塊，計算式保證渲染零變化；context 感知複掃確認衝突歸零。**

與第一節「殭屍層」不同：這些是同 selector＋同 context 重複定義、且**部分**屬性值互相衝突（後者生效、前者該屬性成死碼），整塊仍有其他屬性生效，不能整塊刪，需逐屬性收斂。行號為 2026-07-12 掃描版，動手前先以 selector 重新定位。

| selector | context | 定義行 | 衝突屬性 |
|---|---|---|---|
| `.setup-info-grid` | top | 79 vs 5286 | gap 12px→22px |
| `.setup-info-view p` | top | 80 vs 5288 | line-height 1.7→1.9 |
| `#ui-flags-container, #ui-items-container` | top | 386／1602／1680 | padding、min-height、background、border-radius |
| `#flag-input-area` | top | 505 vs 1687 | margin-bottom 25px→16px |
| `#status-page-api … .scenario-label` | top | 1692 vs 1801 | font-size 12→14、color sub→main |
| `.desktop-workspace-view[data-workspace-view="characters"]` | ≥1100px | 3288 vs 3535 | justify-content center→flex-start |
| `#desktop-config-editor` | ≥1100px | 3410／3742／3818 | min-width 430px→0、padding |
| `#desktop-config-editor details.desktop-active-card > .foldable-content` | ≥1100px | 3516 vs 3875 | padding 0→38px 0 0 |
| `.diary-card` | top | 4878 vs 4886 | padding 14px 16px→0 |

另 16 組同 context 重複但屬性不衝突，屬純疊加，暫不列債；`#player-input` 手機 16px 為 PROJECT_MAP 白名單刻意設計，不列。
清理準則：每批 2～3 組、收斂為單一最終生效塊；收完跑 Playwright＋桌機手機目視比對，遵守第一節事故記錄的錨點守則。
