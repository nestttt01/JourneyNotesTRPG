<!-- ============================================================ -->
<!-- ⚠️ 最高優先 · 任何 AI／agent 會話開工前必讀本檔與 PROJECT_MAP.md ⚠️ -->
<!-- ============================================================ -->

# ⛔ 開工前必讀（未完成不得寫入）

**任何 AI／agent 會話開始後，在讀取或修改其他專案檔案前，必須完整閱讀本檔與 `PROJECT_MAP.md`。**
未完成閱讀不得寫入；如果工具無法遵守本檔的安全流程，只能做唯讀盤點並回報限制。
例外：符合「輕量修改快速通道」節條件的小型任務，仍須完整閱讀本檔，但 `PROJECT_MAP.md`／`TECH_DEBT.md` 可改為按需查閱（先 `rg` 定位、查對應小節）；一旦發現涉及危險區，立即回到完整流程。

## 文件角色與規則優先序

- `AGENTS.md`：唯一現行專案規則來源，Claude 與 Codex 共用。
- `PROJECT_MAP.md`：只記錄目前架構、載入順序、函式位置與危險區，不是規則替代品。
- `TECH_DEBT.md`：只記錄技術債、風險與漸進處理建議；不是現行規則來源，列出的項目也不代表可以直接刪除或重構。
- `TODO.md`：唯一現行產品待辦帳本；只代表排程與待確認事項，不代表已授權實作。
- `COMPLETED.md`：已完成且已驗證事項的歸檔帳本；不是規則來源，也不得拿來覆蓋目前程式碼。
- `PROJECT_HISTORY.md`、交接文件與盤點文件：只供查閱歷史，不得拿舊描述覆蓋現行規則或程式碼。
- `CLAUDE.md`：只負責引導 Claude 閱讀前述文件，不複製規則。
- 使用者當次任務可以縮小修改範圍；若任務、工具高層限制與本檔互相衝突，停止寫入並列出衝突，不得自行猜測或靜默降級。

## 目前環境與已知風險

專案目前位於 `D:\JourneyNotesTRPG`，是一般 D 槽資料夾，不在標準 OneDrive 路徑。安全規則仍不可移除，因為本專案已在不同環境實際發生下列事故：

- AI 工具的局部 Edit／Write／patch 寫入後，檔案被靜默截斷，甚至斷在中文字的 UTF-8 位元組中間，但工具仍回報成功。
- 同步層或 AI sandbox／workspace 掛載層可能回傳數分鐘前的舊視圖；若把舊內容寫回，會覆蓋其他剛完成的修改。
- 工具環境曾造成 Git index 損壞與大量檔案被誤記為刪除。
- Windows PowerShell 文字 cmdlet 的預設編碼可能因版本與指令而不同，造成 ANSI、UTF-16、BOM 或換行轉換。

因此，**寫入成功訊息、同一通道的寫後即讀、終端機顯示正常，都不能單獨視為驗收通過。**

## 單一寫入者與交棒制度（P0）

- 同一時段只能有一個 AI／agent 寫入專案；其他 Claude、Codex、sub-agent 或工具只能唯讀審查。
- 使用者直接要求某個 AI 修改，即視為把本次寫入權交給該 AI，不需要特定「交棒」措辭；單純轉貼審查意見、詢問結論或要求唯讀檢查，不視為寫入授權。UI／排版／視覺任務是否需要預覽，依專案主當次指示決定；專案主未要求預覽且需求簡單明確時，可在溝通確認後直接修改。
- 寫入者動工前必須宣告修改範圍；不得讓其他 agent 平行修改共用工作區。
- 寫入完成後必須列出修改檔案、每檔摘要、驗證結果、未完成事項與已知限制，並明確宣告「寫入結束、可交棒」。
- 接手者必須重新從磁碟讀取 `AGENTS.md`、`PROJECT_MAP.md`、目標檔案與最新 diff；不得沿用舊對話中快取的程式碼。
- 使用者明確交棒前，唯讀審查者不得轉為寫入者。

## 待辦帳本與專案主核准流程（P0）

### 待辦與完成帳本

- 新確認的工作先寫入 `TODO.md`，至少記錄：目標、範圍、不碰區域、驗收方式與 UI 預覽核准狀態。
- `TODO.md` 出現某項工作不等於授權實作；每次修改仍須取得專案主當次明確同意。
- 工作完成並通過驗證後，從 `TODO.md` 移除，改寫入 `COMPLETED.md`，記錄完成日期、修改檔案與驗證結果。
- `TECH_DEBT.md` 只管理技術債；產品待辦不得混入 `TECH_DEBT.md`，技術債也不得假借待辦名義直接實作。
- 移動待辦時只處理該項，不順手改寫其他未完成或已完成紀錄。

### 專案主核准與寫入邊界

- 未取得專案主明確同意前，任何 AI／agent 只能唯讀盤點、說明、建立工作區外預覽；不得修改專案檔案。
- 核准只涵蓋專案主同意的具體版本與範圍；新增內容、替代方案、順手修正或擴大修改都要重新取得同意。
- 發現需求有歧義時，先在預覽或文字中確認，不得自行選一種方案寫入專案。

### UI 預覽與瀏覽器審核規則

- 專案主主動要求查看預覽圖、預覽頁或方案比較時，AI 必須先使用瀏覽器工具建立並實際渲染 HTML/CSS 預覽，交由專案主審核；核准前不得修改專案檔案。未要求預覽時，不得自行把簡單修改升級成強制預覽流程。
- 禁止以 AI 生成圖片、程式算圖、後製拼貼、手工裁切重繪或未實際渲染的靜態示意圖作為 UI 預覽或核准依據。
- 若提供截圖，只能是該 HTML/CSS 頁面的瀏覽器直接截圖，不得後製改造；可行時應保留可檢視的實際預覽頁。
- 預覽必須依目前專案的實際字型、主題變數、配色與相關 DOM/CSS 製作；不得用不相干的字型、光暈、圓框、卡片或裝飾自行發揮。
- 預覽檔案與本機預覽服務必須位於工作區外或暫存環境，不得為了做預覽先改專案檔案。
- 預覽被否決或指出偏差時，只修正預覽並重新請求核准；不得把未核准版本寫入專案，也不得用重複解釋取代可驗證的實際畫面。

## 安全寫檔規則（P0）

### 精準修補與完整落盤

「精準修補」與「完整寫回」不是互斥規則：

- **精準修補**：邏輯與 diff 只改必要的小區塊；禁止順手重構、全檔格式化、minify、壓行或手工重建大檔。
- **完整落盤**：已知有局部落盤或舊快取風險的通道，實際寫入時仍須把「原始完整內容經精準替換後」的預期完整 bytes 寫回。
- **原生 patch 例外**：若工具依下節明確列為原生直寫例外，仍須在寫前計算預期完整 bytes，並在寫後斷言實際 bytes 與預期 bytes 完全一致。
- 修改區塊以外的 bytes 必須保持一致。尤其禁止整檔手打 `style-*.css`、`app-gameplay.js`、`i18n.js` 等大檔。

### 寫入工具依實際通道判定

工具安全性按「實際讀寫通道」判定，不只按工具名稱。未經本節明確列為例外的通道，仍採保守禁用。

- Claude Cowork、AI sandbox、同步／workspace 掛載層，或其他已知會局部落盤、可能讀到舊快取的通道，禁止使用 Edit／Write／apply_patch／patch 類工具修改本專案。
- Codex 桌面版或 CLI 若直接操作使用者本機 workspace、不經上述 sandbox／同步掛載層，其原生 `apply_patch` 可作為允許例外。
- 使用 Codex 原生 `apply_patch` 前，仍須完成寫前 bytes／SHA-256 確認、第二讀取通道比對（可取得時）；修改未追蹤／私有 MD 前另須建立工作區外交易備份，已納入 Git 的四份核心文件則依「私有 MD 的交易備份與持久歸檔」節的追蹤檔規則處理。只可精準修改必要區塊。
- 此例外不豁免單一寫入者、UTF-8／換行、預期 bytes 全等、錨點／檔尾、語法、可讀 diff、立即驗證、延遲複驗與跨通道複驗。
- Claude（Cowork）經 Windows 路徑直接讀寫本機 workspace 的 Read／Write／Edit 檔案工具，自 2026-07-16 起列為允許例外（專案主核准）。實測依據：2026-07-16 bash 掛載層回傳 Codex 寫入中的截斷舊快照時，Windows 直讀內容仍與 HEAD 完全一致。
- Claude 的 bash 掛載層（`/sessions/…`）維持禁止寫入，只可唯讀驗證與交叉比對；複驗遇到與 Windows 直讀不一致時，先等待後重讀並以 `git show HEAD:<路徑>` 比對判定，不得單方選一份覆蓋。
- Claude 使用此例外時仍須：寫前確認基準（已追蹤且乾淨的檔案以 `git show HEAD` 比對）、只精準修改必要區塊、寫後檢查修改區域與檔尾完整、對改到的 JS 跑 `node --check`；不豁免單一寫入者、UTF-8／換行、可讀 diff、立即驗證與延遲複驗。
- 若無法確認工具是否直接操作本機 workspace，或任何讀取通道的 bytes／SHA-256 不一致，立即停止寫入，不得自行選一份覆蓋。
- 禁止用 PowerShell 的 `Get-Content | Set-Content`、`Out-File`、`Add-Content`、`>`、`>>` 或其他文字管線改寫原始碼。
- PowerShell 只可用來啟動 Python／Node、執行驗證與唯讀 Git 指令；終端機顯示的文字不得作為寫回來源。
- 除本節明確列出的原生直寫例外外，若環境強制使用高風險通道、又無法執行 bytes 級完整寫回，停止修改並回報。

### 唯一建議的日常寫入流程

1. 以 Python `read_bytes()` 讀取原檔，保存原始 bytes、SHA-256、byte 數與 LF 數。
   - 若存在第二讀取通道，第一次寫入前必須重新取得目前工作區檔案的 bytes／SHA-256，與主要通道比對；不一致時立即停止，不得自行挑選一份寫回。
   - Claude 可將 Read／Grep 的 Windows 直讀與 bash 掛載層視為不同工具路徑；兩者曾實證具有不同快取行為，但這只是故障經驗，不是架構級獨立保證，回報時必須明示。
   - 已追蹤且工作區乾淨的檔案，可用唯讀 `git show HEAD:<路徑>` 作相等基準；若已有未提交修改，先檢查 `git status`／`git diff`，再比對兩通道讀到的工作區現況 bytes。HEAD 此時只供提交基準與災難救援，不得覆蓋現況。
   - 無法取得第二通道時，必須在寫入前回報限制並完成其餘交易保護；不得宣稱已完成跨通道驗證。
2. 對原始 bytes 執行嚴格 `decode("utf-8")`；解碼失敗立即停止，不得用替換字元繼續。
3. 確認舊錨點只命中一次，再於記憶體中精準取代一次。
4. 將結果 `encode("utf-8")` 為預期 bytes；不得經過 PowerShell 文字管線。
5. 依前述通道規則，以 bytes 級完整寫回或允許的原生 `apply_patch` 落盤；立刻用新的讀取重新取得實際 bytes。
6. 必須斷言實際 bytes 與預期 bytes 完全一致；失敗時立即從寫前備份恢復並停止後續修改。
7. 新檔也必須使用 UTF-8、正確換行且無 BOM；修改 `.bat` 時以 bytes 保留 CRLF，不得用文字模式自動轉換。

### 輕量修改快速通道（2026-07-17 專案主核准）

小型修改不必走完整 bytes 級儀式。**適用條件（須全部符合）：**

- 目標檔已納入 Git 追蹤，且該檔工作區乾淨（`git status` 無未提交修改；`git show HEAD:<檔>` 隨時可作還原保險）。
- 單次任務合計改動 ≤ 2 檔、≤ 30 行，且為精準修補（不重排、不重構、不整檔格式化）。
- 不涉危險區：PROJECT_MAP「危險區域清單」的函式與區域、本檔「禁止事項」、存檔格式與 `sanko_*`、備份匯出 sanitize、AI prompt 組裝、API key、儲存層。
- 使用允許的直寫通道（Codex 原生 `apply_patch`／Claude Windows 直寫）。

**仍須執行：** 修改前 `rg` 定位現有規則避免重複邏輯；寫後語法檢查（JS 跑 `node --check`；CSS 檢查 `{`／`}` 平衡與檔尾）；`git diff` 人工審查——diff 必須小且可讀，出現異常大量刪除即為截斷警訊，立即以唯讀方式核對 `git show HEAD` 並回報，不得自行覆蓋。

**可免除：** 寫前 bytes／SHA-256 確認、預期 bytes 全等斷言、跨通道比對、延遲複驗、LF 數學、工作區外交易備份（Git 即備份）。

**理由：** 截斷事故在 `git diff` 審查中必然現形（大量刪除一眼可見），已追蹤檔案隨時可由使用者還原；完整儀式保留給大改、危險區與未追蹤檔案。

### 換行與編碼

寫入前先確認根目錄 `.gitattributes` 存在。依其政策與原檔保持：

- JS、CSS、HTML、JSON、MD、YML、YAML、SVG：LF。
- BAT：CRLF。
- 圖片、字型、影片等：binary，不做文字轉換。
- 所有文字檔必須是嚴格 UTF-8、無 BOM、無 U+FFFD、無 NUL。
- 不得以「全面禁止 CRLF」誤傷 BAT；換行政策是**與 `.gitattributes` 及原檔一致**。

### 私有 MD 的交易備份與持久歸檔

`AGENTS.md`、`PROJECT_MAP.md`、`TECH_DEBT.md`、`CLAUDE.md` 自 2026-07-11 起納入 Git 追蹤。`TODO.md`、`COMPLETED.md` 自 2026-07-12 起列入 `.gitignore` 例外，應由使用者納入 Git 追蹤；首次 commit 前兩者仍是沒有 HEAD 版本的新檔。這六檔修改時比照程式檔的安全寫檔流程；已有 HEAD 版本者以 `git show HEAD:<檔>` 作寫前基準與跨通道比對，不再強制工作區外交易備份（做了更好）。
其餘 `*.md`（如 `PROJECT_HISTORY.md`）與 `_handoff/` 仍被 `.gitignore` 排除、沒有 `git show` 版本保險；以下兩種備份責任只適用於這些**未追蹤**檔案：

**每次修改的工作區外交易備份（P0）：**

- 修改任何未追蹤 MD 前，必須先把「已完成寫前交叉確認的目前原始 bytes」備份到目標 workspace 外。
- 備份 SHA-256 必須與寫前確認的工作區 bytes 相同；不可備份終端顯示文字、重新編碼內容或未確認的舊視圖。
- Claude 的 workspace 外 session output／artifact 可以作為交易備份，但必須保留至延遲驗證與交棒完成、可重新讀取並可用安全流程還原。
- 完成報告必須列出交易備份位置或 artifact 識別、SHA-256，以及它是暫存或持久保存。
- `_cleanup_bak` 等 workspace 內副本只能作附加備份，不能取代工作區外交易備份。
- 任一條件無法滿足時，該 AI 對私有 MD 維持唯讀；不得以「已回報限制」取代必要交易備份。
- 修改後使用交易備份執行 `git diff --no-index` 或等效唯讀比較。

**使用者的定期持久歸檔：**

- 持久歸檔用來防止磁碟損毀、整個 workspace 遺失與長期版本回溯，不需要每次小改都永久保存。
- 由使用者定期保存到獨立 private repository、其他磁碟或私人雲端；公開 repository 的任何 branch 都不能視為私密。
- AI 不得自行建立、提交或推送 private repository；這些 Git 寫入仍由使用者執行。

## 寫後立即驗證（每檔必做）

每寫完一個檔案，立刻完成該檔適用的所有檢查，不能等全部改完才驗證：

- 實際 bytes 必須等於預期 bytes，且嚴格 UTF-8 解碼成功。
- 無 BOM、U+FFFD、NUL；換行符合 `.gitattributes`。
- LF 數量必須符合：
  `after_LF = before_LF - old_block_LF + new_block_LF`。
- JS：立即執行 `node --check <檔>`。
- HTML：確認以 `</html>` 結尾。
- CSS：確認 `{`／`}` 數量相等且最後非空白字元為 `}`。
- 檔尾至少檢查最後 80 bytes，確認沒有斷在半句、半個中文字或未閉合區塊。
- 檢查本次未修改但理應存在的關鍵錨點，避免舊快取覆蓋中段內容。
- 比較修改前後的壓行命中：不得新增一行多敘述、完整單行控制區塊，或超過 160 字元且包含多個分號的程式碼行；長翻譯、prompt、URL、data URI 除外。
- diff 必須小範圍且可人工閱讀；若出現整檔換行變動、異常大量刪除或非預期區域變動，立即停止。

## 收工延遲與跨通道複驗（P0）

- 全部修改完成後，必須再整批複驗所有改過的檔案，不能只信同一通道的寫後即讀。
- 至少以新的 Python／Node process 重新計算 hash、嚴格解碼、檢查檔尾與語法。
- 條件允許時，使用不同讀取通道交叉比對，例如 Python 寫入後由新的 Node process、原生 bytes 讀取或另一個 AI 工具重新讀取。
- 延遲複驗不可只寫死等待秒數：先等待至少 5～10 秒，再於交棒前重讀；若已知掛載層曾延遲數分鐘，交棒審查者還要再次從磁碟讀取。
- 若無法取得第二讀取通道，必須明確回報限制，不得把同通道檢查冒充為跨通道驗證。
- 最終至少執行所有 JS 語法檢查、HTML/CSS 結構檢查、UTF-8／BOM／U+FFFD／NUL／換行檢查、hash 穩定性、`git diff --check` 與差異統計。

## Git 操作邊界（P0）

- 未取得專案主當次明確授權前，AI／工具環境只能使用唯讀 Git 指令：`git status`、`git diff`、`git log`、`git show`、`git ls-files`、`git check-ignore`。
- 專案主當次明確要求「幫我 commit」、「幫我 push」、「執行上傳流程」或指定其他 Git 寫入時，即視為已授權對當次明示範圍執行，不需要特定授權措辭或重複確認；授權不得延伸到其他 repository、branch、檔案或後續會話。
- 一般的 commit／push／上傳授權只涵蓋必要的 `add`、`commit`、`push`；`reset`、`checkout`、`switch`、`branch`、`merge`、`rebase`、`stash`、`clean`、force push 等高風險或改變歷史的操作，仍須由專案主逐項明確點名。
- Git 寫入前必須確認單一寫入者、目前 branch／remote、待提交範圍與差異統計；若存在不明 Git 程序、`.git/index.lock`、異常大量刪除或範圍不明，立即停止並回報，不得把失敗流程當成成功。
- 刪除 stale `.git/index.lock` 必須有專案主當次明確授權，且先確認沒有可能持有該 lock 的 Git 程序、lock 路徑與時間；無法排除仍被使用時不得刪除。
- 任何 commit 後必須執行 `git show --stat HEAD` 並核對新 commit；push 後必須確認目標 branch 已更新，才能回報完成。
- 唯讀救援可使用 `git show HEAD:<路徑>` 取得已追蹤檔案內容，但不得直接覆蓋工作區；先另存、比較、驗證後再由安全寫入流程恢復。
- 刪除或搬移檔案前必須取得使用者明確授權，並先確認路徑與備份。

# 專案修改規則

本專案是單頁式前端遊戲，功能集中在 `index.html`、`i18n.js`、7 個 `style-*.css`（2026-07-16 由原 `style.css` 純搬移拆分，依 `<link>` 順序載入，不得重排），以及 13 個 `app-*.js` 模組。這些模組以 classic `<script>` 標籤共用同一全域範圍，依 `index.html` 現有順序載入；**不得任意重排載入順序**。模組職責與函式對照見 `PROJECT_MAP.md`；拆分前的舊 `app.js` 已移除，如需對照只能使用唯讀 Git 歷史。

修改前先定位現有函式、CSS selector、翻譯鍵與資料流；只改相關區域，不用 hotfix 疊補丁，不順手重構或改風格。

## 程式碼排版規則（禁止壓行）

- **禁止把多行程式壓成單行。** 一行只放一個敘述；不得用分號把多個敘述、多個宣告串在同一行，也不得把 `if (...) { ... }` 整塊壓成一行。
- 修改既有程式時，**維持該檔原有的換行與縮排**（4 空格），只動需要動的行，不要順手重排周邊程式。
- 新增程式碼單行以 **120 字元**為原則上限。例外：i18n 翻譯字串、AI prompt 長文字、URL、data URI 等本質上就是長字串的行。
- 寫完自檢：比較修改前後與本次新增程式碼；超過 160 字元且含多個分號、或把完整控制區塊壓在同一行的命中數不得增加。

## 基本原則

- 使用繁體中文回報修改內容。
- 修改前先定位現有函式、CSS 規則與語言包，不要憑印象新增重複邏輯。
- 不要為了解決單一畫面跑版使用大量 `!important` 壓過既有規則。**新增任何 `!important` 都必須在完成報告中逐個列出：位置、壓的是誰、為什麼非用不可**；說不出理由就改用提高特異性或專屬 class。
- **既有代碼的壞模式不是核准樣式，不得模仿**：壓行、`!important`、同 selector 疊層重定義、textarea 尺寸三胞胎等 legacy 病灶（見 `TECH_DEBT.md`），新代碼一律不得以「跟旁邊寫法一致」為由複製；風格一致性只適用於縮排、命名與換行，不適用於已列債的寫法。
- 不要任意改動現有 UI 外觀；除非正在修正明確的跑版或衝突。
- 不要刪除疑似廢碼，除非已確認 HTML / JS 不再引用，且已說明原因。
- 優先小範圍修改，避免順手重構整個檔案。
- 修改 JS 後至少對改到的模組執行 `node --check`（例如 `node --check app-ai.js`）；若不確定改到哪些，對所有 `app-*.js` 與 `i18n.js` 逐一執行 `node --check`。
- 修改語言包後至少執行 `node --check i18n.js`。

## 禁止事項

- 不要修改、輸出、記錄、匯出 API key。
- 不要把 API key 加進備份、配置匯出、冒險日誌或 prompt。
- 不要改存檔格式版本、key 名稱或資料結構，除非任務明確要求 migration。
- 不要改動 `sanko_*` storage key 的語意，除非已列出相容策略。
- 不要用 `localStorage.clear()` 或批量清除瀏覽器資料。
- 不要用 `git reset --hard`、`git checkout --` 之類會覆蓋使用者修改的指令。
- 角色圖片可在玩家本機備份/匯出中保留，方便換裝置恢復角色；但圖片、API key、私密資訊不可送進 AI prompt 或傳給 API 廠商。
- 大型 base64 若會造成備份過大，需先說明風險；API key 與私密 token 永遠不可匯出。

## API Key 與圖片規則

- 目前支援三家供應商：Google Gemini、OpenRouter、Anthropic (Claude)。新增/修改供應商時，請同步處理：`buildAIRequest`／`getAIResponseText`／`requestAIText` 的 finishReason（app-ai.js）、模型清單 `fetch*Models()`（app-saves-game.js）、`getModelRuntimeProfile`（app-core.js）、`getApiProviderLabel()` 標籤、`index.html` 下拉。Anthropic 金鑰只放 `x-api-key` header，URL 絕不可含金鑰。
- API key UI 在 `index.html` 首頁區塊，主要元素：
  - `#api-provider`
  - `#api-key`
  - `#remember-api-key`
  - `#verify-btn`
  - `#delete-key-btn`
- API key 狀態主要在 `app-api.js`（首頁 `fetchAvailableModels()`／`fetchGoogleModels()`／`fetchOpenRouterModels()` 在 `app-saves-game.js`）：
  - `apiProvider`
  - `apiKey`
  - `rememberApiKey`
  - `sessionApiKeys`
  - `getPersistedApiKey()`
  - `getStoredApiKey()`
  - `persistApiKey()`
  - `removePersistedApiKeys()`
  - `setRememberApiKey()`
  - `fetchAvailableModels()`
  - `fetchAvailableModelsFromGame()`
- 關閉「在這台裝置保留金鑰」時，可以刪除本機已保存 key。
- 重新進頁面時，如果本機已有保存 key，不應因初始化誤判而自動清掉。
- 備份與配置匯出仍不得包含 API key。
- 角色頭像/人物圖片屬於玩家資料，可依需求包含在本機匯出備份，方便恢復角色。
- 角色頭像/人物圖片不可放入 AI prompt、不可送到 Google Gemini／OpenRouter／Anthropic 等任何 API 廠商；prompt 只能使用文字設定。

## 存檔與匯出規則

- 遊戲紀錄與配置資料使用 `sanko_*` storage key，部分大型資料會透過 IndexedDB。
- 記錄檔採「資料包」概念：每個記錄檔必須能靠自己的 `save.scenario` 快照載入，不依賴目前本機選中的配置。
- 角色配置/情境配置是開局模板，不是記錄檔唯一資料來源。
- 匯入記錄檔備份時，若只是同名同內容但原始 ID 不同，不要把 A 記錄檔偷偷合併到本機 B 配置；要保留 A 的綁定或內部快照，避免資料互相感染。
- 重複匯入同一份記錄檔備份時，應偵測內容指紋並略過重複存檔，不要一直建立同名副本。
- 修改 `buildBackupPayload()`、`sanitizeSavesCollection()`、`sanitizePresetCollection()`、`stripImagesAndPrivateData()` 前，必須先確認是否會改變匯出內容。
- `saveCurrentProgress()` 是主要保存入口，請勿把非存檔資料混進遊戲紀錄。
- 記錄檔／完整備份只保留遊戲紀錄與角色配置（含人物與情境）；不得包含頁面配色、外觀設定或 API key。匯入舊備份時即使存在 `uiTheme` 也必須忽略，保留目前裝置的外觀。
- 修改匯入流程時，避免破壞舊備份檔相容性。

## UI / CSS 規則

- 桌機與手機版共用許多 selector，新增規則前先檢查是否會互相影響。
- 側邊標籤、首頁、角色配置頁的樣式很容易互相覆蓋，改動前先查：
  - `.setup-side-tabs`
  - `.setup-side-tab`
  - `#setup-screen`
  - `#edit-scenario-screen`
  - `#save-menu-screen`
  - `#journal-screen`
- 手機版規則集中在 `@media (max-width: 600px)` 附近；桌機角色配置集中在 `#edit-scenario-screen.desktop-editor-open` 與 `.desktop-*`。
- 不要直接用全域 `button`、`select`、`input` 規則改特定畫面，除非確認所有畫面都需要。
- 修改按鈕尺寸、位置、線條粗細時，優先找該區域專屬 class，不要增加全域覆蓋。

## 語言包規則

- 可見文字要同步到 `i18n.js`。
- 新增按鈕、提示、alert、confirm、placeholder 後，檢查是否需要 `uiText()`、`uiMessage()`、`uiSystemMessage()` 或翻譯規則。
- 日文用語目前傾向：
  - 人物：`キャラクター`
  - 情境：`シナリオ`
  - 存檔/資料視情境使用 `データ`，避免全部翻成 `セーブ`
- 不要在 HTML / JS 新增只支援中文的固定提示。
- API 錯誤訊息已改走 i18n：`getFriendlyApiErrorMessage`（app-ai.js）回傳的句子用 `uiMessage` 翻譯，鍵在 `i18n.js`。新增或修改錯誤訊息時，必須同步補上 zh/en/ja，並保留 `{provider}` 參數格式；句尾的「（診斷：…）」是技術資訊，維持不翻。

## AI Prompt 規則

- AI prompt 是高風險區域，修改前先找現有規則，不要重複塞相同約束。
- 玩家行動、旁白、創作者指令三種模式要分清楚。
- 「神」/創作者指令是場外最高優先指令，不應被 NPC 當成聽見的台詞。
- 輔助旁白不是玩家角色行動，不應扣玩家 HP/SAN 或好感。
- 系統硬判定由程式算定，AI 不得改骰點結果。
- 骰點 DC 為區間隨機取值（超簡單/簡單/普通/困難/極難各有區間），非固定單值；調難度時勿改回固定值。詳見 `DICE_DIFFICULTIES`（app-core.js）與 `calculateDiceCheck`。
- 熟練加值（擅長領域）：玩家 `playerProficiencies` 由 `classifyDiceCheck` 判定、`calculateDiceCheck` 對玩家檢定 +2。它是新增的可選存檔欄位（比照既有欄位隨快照走，未改格式版本）；改骰點或存檔邏輯時勿破壞。
- 回覆長度：全域偏好 `sanko_reply_length`（short/medium/long）。`getModelRuntimeProfile` 據此設 `normalMaxTokens`（短 2500／中 4500／長 9000，雙語 ×1.5），`getCompactSystemInstruction` 加字數提示。**Anthropic 輸出上限別設太低**——太低時新模型會回 `stop_reason=max_tokens` 被判「回覆太長被截斷」。
- 冒險日誌整理不得刪除任務完成、任務失敗、成就等保護紀錄。

## 建議工作流程

1. 先用 `rg` 找現有函式 / class / 翻譯鍵（函式可能在任一個 `app-*.js`，用 `rg 函式名 app-*.js` 定位，或查 `PROJECT_MAP.md` 對照）。
2. 判斷變更屬於 UI、CSS、資料、AI prompt、語言包或存檔，對應到哪個 `app-*.js`。
3. 只改相關區域。
4. JS 修改後對改到的模組跑 `node --check`；不確定時，對所有 `app-*.js` 與 `i18n.js` 逐一檢查。
5. 語言包修改後跑 `node --check i18n.js`。
6. 回報改了哪些檔案、哪些風險區沒有碰。
7. 網站直接從**根目錄**部署，不需要任何同步動作。（舊的 `_deploy/` 重複副本已移除，請**不要**再重建它，也不用維護第二份。）
