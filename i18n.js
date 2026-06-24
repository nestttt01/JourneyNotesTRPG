(function () {
    'use strict';

    const UI_LANGUAGE_STORAGE_KEY = 'sanko_ui_language_v1';
    const SUPPORTED_UI_LANGUAGES = new Set(['zh-TW', 'en', 'ja']);
    const M = {
        'TRPG模擬器(測試版)': ['TRPG Simulator (Beta)', 'TRPGシミュレーター（ベータ）'],
        'TRPG模擬器 (測試)': ['TRPG Simulator (Beta)', 'TRPGシミュレーター（ベータ）'],
        '調整頭像': ['Adjust Avatar', 'アバター調整'],
        '拖曳移動；手機可雙指縮放': ['Drag to move; pinch to zoom on mobile.', 'ドラッグで移動、スマホではピンチで拡大できます。'],
        '確認': ['Confirm', '確認'], '取消': ['Cancel', 'キャンセル'],
        '🗺️ 發現新情境 / 切換空間': ['🗺️ New Scenario / Change Location', '🗺️ 新しいシナリオ／場所の切替'],
        '新情境名稱 (如: 某人的夢境)': ['Scenario name (e.g. Someone’s Dream)', 'シナリオ名（例：誰かの夢）'],
        '環境法則與世界觀': ['World Rules & Setting', '世界観と環境ルール'],
        'NPC 們在此的身分/狀態': ['NPC roles/status here', 'ここでのNPCの役割／状態'],
        '玩家專屬身分': ['Player role', 'プレイヤーの役割'],
        '轉場規則（選填）': ['Transition rules (optional)', '場面転換ルール（任意）'],
        '確認建立並傳送': ['Create and Send', '作成して送信'],
        '玩家狀態與面板': ['Status Panel', 'ステータスパネル'],
        '另存新配置': ['Save as New', '別名で保存'],
        '儲存並返回': ['Save & Return', '保存して戻る'], '儲存': ['Save', '保存'],
        '狀態': ['Status', 'ステータス'], '紀錄': ['Log', '記録'], '設定': ['Settings', '設定'],
        '狀態旗標 / Flags': ['Status Flags', '状態フラグ'],
        'AI 會依據這些狀態銜接劇情、Buff/Debuff 與長期影響。': ['AI uses these states to continue the story, buffs/debuffs, and long-term effects.', 'AIはこれらの状態を参照して物語、バフ／デバフ、長期的な影響をつなげます。'],
        '加入': ['Add', '追加'], '玩家道具': ['Player Items', 'プレイヤー所持品'],
        '目前持有、失去或劇情產生的重要物品。': ['Important items currently held, lost, or created by the story.', '現在所持・紛失、または物語で生まれた重要アイテムです。'],
        '介面語言': ['Display Language', '表示言語'], '輸出語言': ['Output Language', '出力言語'],
        '日文台詞 + 繁中翻譯': ['Japanese dialogue + Traditional Chinese translation', '日本語台詞＋繁体字中国語訳'],
        '英文台詞 + 繁中翻譯': ['English dialogue + Traditional Chinese translation', '英語台詞＋繁体字中国語訳'],
        '自動依玩家語言': ['Auto-detect player language', 'プレイヤー言語を自動判定'],
        '詳細設定': ['Details', '詳細'],
        '玩家、NPC 與情境的詳細欄位集中在這裡。跑團中只想看摘要時，回到「狀態」頁即可。': ['Detailed player, NPC, and scenario fields are here. Return to Status when you only need a summary.', 'プレイヤー、NPC、シナリオの詳細項目はこちらです。要約だけを見る場合は「ステータス」に戻ってください。'],
        '讀取摘要': ['Story Summary', '参照サマリー'],
        '每回合會自動更新重點、任務與關係；完整冒險紀錄仍保留在下方，不會自動刪除。': ['Story highlights, tasks, and relationships update each turn. The full adventure log remains below and is never deleted automatically.', '各ターンで重要事項、タスク、関係が更新されます。冒険記録は下に残り、自動削除されません。'],
        '整理摘要': ['Organize Summary', 'サマリーを整理'], '開啟完整冒險日誌': ['Show Full Log', '全ログを表示'],
        '收起完整冒險日誌': ['Hide Full Log', '全ログを閉じる'],
        '完整紀錄可直接在本分頁展開；AI 仍會讀取同一份存檔資料。': ['The full log opens in this tab and uses the same save data.', '全ログはこのタブで開き、同じセーブデータを参照します。'],
        '重點劇情': ['Story Highlights', '重要イベント'],
        '用 3～8 條保留目前劇情主線、最近重大轉折與當前場景狀況。': ['Keep 3–8 points covering the main plot, recent turning points, and current scene.', '現在の本筋、直近の転機、現在の場面を3～8項目で残します。'],
        '任務清單': ['Tasks', 'タスク'],
        '遇到新任務會新增空格；事件完成後會自動打勾，也可以手動修改。': ['New tasks are added automatically and checked when completed. You can also edit them manually.', '新しいタスクは自動で追加され、完了時にチェックされます。手動編集も可能です。'],
        '＋新增': ['＋ Add', '＋ 追加'], '整體角色關係圖': ['Relationships', '関係図'],
        '只記角色彼此之間的全局關係、重大承諾、界線與張力；每位 NPC 此刻對玩家的態度放在「設定 → 動態狀態」。': ['Record global relationships, major promises, boundaries, and tension. Each NPC’s current attitude belongs under Settings → Dynamic Status.', '全体的な関係、重要な約束、境界線、緊張感を記録します。各NPCの現在の態度は「設定 → 動的状態」にあります。'],
        'API 使用追蹤': ['API Usage', 'API使用量'],
        '只儲存在本機瀏覽器。匯出存檔時會一起保存，匯入時可恢復；清除瀏覽器資料或清除設備資料會刪除。': ['Stored only in this browser. It is included in exports and restored on import; clearing browser or device data removes it.', 'このブラウザ内だけに保存されます。エクスポート／インポートに含まれ、ブラウザまたは端末データを消去すると削除されます。'],
        '遊戲玩法與系統指南': ['Game Guide', 'ゲームガイド'],
        '第一次玩，從這裡開始': ['First time? Start here', '初めての方はこちら'],
        'API 金鑰的設定、隱私與錯誤排除請直接查看首頁說明。完成驗證並選好模型後，依序建立角色與情境、進入存檔，再輸入第一個行動即可開始。': ['See the home page for API setup, privacy, and troubleshooting. After verification, choose a model, create characters and a scenario, enter a save, and type your first action.', 'API設定、プライバシー、トラブル対処はホーム画面をご覧ください。認証後にモデルを選び、キャラクターとシナリオを作成し、セーブを開いて最初の行動を入力します。'],
        '1. 這是什麼？': ['1. What is this?', '1. これは何？'],
        '這是一個單人 AI TRPG／劇情模擬器。你可以建立自己的角色、NPC 與世界觀，讓 AI 擔任 DM、旁白及其他角色，陪你進行冒險、戀愛、日常、懸疑或任何想玩的故事。': ['A solo AI TRPG/story simulator. Create your own character, NPCs, and world, then let AI act as the GM, narrator, and other characters for adventures, romance, slice-of-life, mystery, or any story you want.', '一人用のAI TRPG／物語シミュレーターです。自分のキャラクター、NPC、世界観を作り、AIをGM・ナレーター・他の登場人物として、冒険、恋愛、日常、ミステリーなど好きな物語を楽しめます。'],
        '2. 建立角色、NPC 與情境': ['2. Create Characters, NPCs & Scenarios', '2. キャラクター、NPC、シナリオを作る'],
        '進入「劇本創角」後，使用左側的「角色設定」、「情境設定」與「遊戲設定」切換不同內容。角色設定可編輯玩家與每一位 NPC 的頭像、名稱及人物資料；情境設定用來建立世界觀、身分與轉場規則。切換標籤時，尚未離開頁面的修改不會被重置。': ['Open Character Setup and use the Character, Scenario, and Game tabs on the left. Character settings edit the player and each NPC; Scenario settings define the world, roles, and transitions. Switching tabs does not reset unsaved edits.', '「キャラクター作成」を開き、左側の「キャラクター設定」「シナリオ設定」「ゲーム設定」を切り替えます。タブを切り替えても、ページを離れるまで編集内容はリセットされません。'],
        '3. 遊戲設定與隨機生成': ['3. Game Settings & Random Generation', '3. ゲーム設定とランダム生成'],
        '遊戲設定集中管理配置名稱、輸出語言、遊戲難度與隨機生成。你可以保留人物只隨機產生情境，也可以讓 AI 將人物與情境全部隨機。生成結果會先讓你確認，不會在未套用前直接覆蓋目前內容；返回首頁時，系統會保存目前配置。': ['Game Settings manages the preset name, output language, difficulty, and random generation. Keep existing characters and generate only scenarios, or generate everything. Results are previewed before being applied, and the current preset is saved when you return home.', 'ゲーム設定では設定名、出力言語、難易度、ランダム生成を管理します。人物を残してシナリオだけ生成することも、すべて生成することもできます。結果は適用前に確認でき、ホームへ戻ると現在の設定が保存されます。'],
        '4. 怎麼玩？': ['4. How to Play', '4. 遊び方'],
        '進入遊戲後，直接在下方輸入角色想說的話或想做的事。你也可以點選 AI 提供的選項。若行動具有風險，可以使用骰子按鈕進行 D20 判定；系統會依角色能力、難度與骰點決定成功或失敗。NPC 只有在劇情明確確認時才會死亡；標準模式可由劇情或「神」復活，困難模式每次死亡只有一次復活檢定，極限模式則永久死亡。': ['Type what your character says or does, or choose an AI suggestion. Risky actions can use a D20 check based on ability, difficulty, and roll. NPC death requires explicit story confirmation; revival rules depend on game difficulty.', 'キャラクターの台詞や行動を入力するか、AIの選択肢を選びます。危険な行動は能力、難易度、出目によるD20判定が可能です。NPCの死亡は物語上の明確な確定が必要で、復活ルールは難易度で変わります。'],
        '5. 玩家、旁白與「神」模式': ['5. Player, Narrator & Creator Mode', '5. プレイヤー、ナレーター、「神」モード'],
        '一般輸入會被視為玩家角色的行動。輸入': ['Normal input is treated as the player character’s action. Enter', '通常入力はプレイヤーキャラクターの行動として扱われます。'],
        '可以改用場外視角安排環境、鏡頭與 NPC 行動；輸入': ['switches to an outside perspective for environments, camera, and NPC actions; enter', 'で場外視点から環境、カメラ、NPC行動を指定できます。'],
        '就能回到玩家角色。「神」按鈕則是創作者模式，可以直接調整場景、時間、人物或事件。神模式的內容不會被 NPC 當成玩家說出口的話。': ['to return to the player character. The Creator button directly adjusts scenes, time, people, or events; NPCs will not treat those instructions as spoken dialogue.', 'でプレイヤーに戻ります。「神」ボタンは場面、時間、人物、出来事を直接調整する作者モードで、NPCはその内容をプレイヤーの発言として扱いません。'],
        '6. 角色面板與冒險日誌': ['6. Character Panel & Adventure Log', '6. キャラクターパネルと冒険日誌'],
        '角色面板可以查看與修改玩家狀態、NPC、道具、Flags、任務、劇情摘要及角色關係；AI 每回合會參考這些重點資料來延續故事。面板內的冒險日誌只顯示目前這份遊戲紀錄，完整事件可以搜尋、分頁、編輯或整理，不會因摘要更新而自動消失。桌機版按「儲存」後面板會保持開啟，可點側邊標籤收回；手機版則使用「儲存並返回」。': ['View and edit player status, NPCs, items, flags, tasks, summaries, and relationships. The embedded adventure log belongs only to the current save. On desktop, Save keeps the panel open; use the side tab to collapse it. Mobile uses Save & Return.', 'プレイヤー状態、NPC、アイテム、フラグ、タスク、要約、関係を確認・編集できます。パネル内の日誌は現在のセーブ専用です。PC版では保存後も開いたままで、サイドタブから閉じられます。スマホ版は「保存して戻る」を使います。'],
        '7. 遊戲紀錄、配置與備份': ['7. Saves, Presets & Backups', '7. セーブ、設定、バックアップ'],
        '每份遊戲紀錄都會綁定目前使用的角色配置，彼此的摘要、任務、關係與冒險日誌會分開保存。使用「另存新配置」後，該紀錄會改綁新配置；仍被遊戲紀錄使用的配置無法直接刪除，上鎖配置也不會被遊戲內修改覆蓋。資料主要保存在目前裝置的瀏覽器，不會自動同步，請定期在存檔選單使用「匯出」備份，並在更換裝置後使用「匯入」恢復。': ['Each save is bound to its current character preset, with separate summaries, tasks, relationships, and logs. Save as New Preset changes that binding. Presets still used by saves cannot be deleted, and locked presets cannot be overwritten. Data is local to this browser, so export backups regularly and import them on a new device.', '各セーブは現在のキャラクター設定に紐づき、要約、タスク、関係、日誌は別々に保存されます。「新しい設定として保存」で紐づけが変わります。使用中の設定は削除できず、ロック中の設定は上書きされません。定期的にエクスポートし、新しい端末でインポートしてください。'],
        '💡 AI 忘記事情怎麼辦？': ['💡 What if AI forgets?', '💡 AIが忘れたら？'],
        '打開角色面板，檢查重點劇情、任務、角色關係與 Flags 是否正確。你可以手動修正，或使用「整理摘要」重新整理目前狀態。': ['Open the Character Panel and check key events, tasks, relationships, and flags. Correct them manually or use Organize Summary.', 'キャラクターパネルで重要な物語、タスク、関係、フラグを確認し、手動修正または「サマリーを整理」を使ってください。'],
        '💡 劇情重複或場景錯亂怎麼辦？': ['💡 Repeated plot or confused scenes?', '💡 展開の重複や場面の混乱は？'],
        '先確認摘要與冒險日誌是否正確。如果 AI 仍然混淆，可以開啟「神」模式，直接說明目前場景、在場角色與接下來希望聚焦的方向。': ['Check the summary and adventure log first. If confusion continues, use Creator mode to state the current scene, present characters, and desired focus.', 'まず要約と冒険日誌を確認してください。まだ混乱する場合は「神」モードで現在の場面、登場人物、今後の焦点を指定します。'],
        '我瞭解了': ['Got it', 'わかりました'],
        'API 金鑰與模型指南': ['API & Model Guide', 'API・モデルガイド'],
        '開始前先知道這些': ['Before You Begin', '始める前に'],
        '本遊戲需要使用你自己的 API Key 才能呼叫 AI。請先在首頁選擇供應商、貼上對應金鑰並完成驗證；金鑰不會包含在遊戲備份中，共用裝置也不建議開啟保存功能。': ['This game uses your own API key to call AI. Choose a provider on the home page, paste the matching key, and verify it. Keys are never included in game backups; do not save them on shared devices.', 'このゲームは自分のAPIキーでAIを呼び出します。ホームでプロバイダーを選び、対応するキーを貼り付けて認証してください。キーはバックアップに含まれず、共有端末での保存は推奨しません。'],
        '1. API Key 是什麼？': ['1. What is an API Key?', '1. APIキーとは？'],
        'API Key 是 AI 服務用來辨識使用者與計算用量的金鑰，不是遊戲帳號或遊戲密碼。請向 Google AI Studio 或 OpenRouter 申請，並妥善保管；不要把金鑰貼到公開貼文、截圖或傳給其他人。': ['An API key identifies you to an AI service and tracks usage; it is not a game account or password. Obtain one from Google AI Studio or OpenRouter and keep it private.', 'APIキーはAIサービスが利用者を識別し、使用量を計算するための鍵です。ゲームのアカウントやパスワードではありません。Google AI StudioまたはOpenRouterで取得し、公開しないでください。'],
        '2. Google Gemini 與 OpenRouter': ['2. Google Gemini & OpenRouter', '2. Google GeminiとOpenRouter'],
        '選擇 Google Gemini 時，請使用 Google AI Studio 提供的金鑰；選擇 OpenRouter 時，請使用 OpenRouter 金鑰。兩種金鑰不能互換。OpenRouter 可提供多家模型，Gemini 則直接使用 Google 模型；實際可用清單會在驗證後載入。': ['Use a Google AI Studio key for Gemini and an OpenRouter key for OpenRouter. They are not interchangeable. OpenRouter offers models from multiple providers, while Gemini uses Google models. Available models load after verification.', 'GeminiにはGoogle AI Studioのキー、OpenRouterにはOpenRouterのキーを使用します。互換性はありません。OpenRouterは複数社のモデル、GeminiはGoogleモデルを提供し、利用可能一覧は認証後に読み込まれます。'],
        '3. 模型怎麼選？': ['3. Choosing a Model', '3. モデルの選び方'],
        '輕量模型通常回覆較快、用量較省，適合測試設定或日常遊玩；較大型模型通常更擅長長篇劇情、人物語氣與複雜指令。清單中的 ★ 代表較適合目前遊戲用途的優先選項。模型表現與費用可能不同，請以供應商顯示的資訊為準。': ['Lightweight models are usually faster and cheaper, while larger models often handle long plots, character voice, and complex instructions better. ★ marks recommended choices for this game. Check the provider for current performance and pricing.', '軽量モデルは高速で使用量を抑えやすく、大型モデルは長編、口調、複雑な指示に向く傾向があります。★はこのゲーム向けの推奨です。性能と料金は各プロバイダーで確認してください。'],
        '4. 金鑰會保存在哪裡？': ['4. Where is the Key Stored?', '4. キーの保存場所'],
        '未開啟「在這台裝置保留金鑰」時，金鑰只在目前頁面使用，重新開啟後需要再次輸入；開啟後才會保存在這台裝置的瀏覽器。匯出備份不包含 API Key，因此在新裝置匯入遊戲資料後仍需重新驗證。': ['Without Keep key on this device, the key lasts only for the current page session. When enabled, it is stored in this browser. Exports never include API keys, so a new device must verify again.', '「この端末にキーを保存」を有効にしない場合、キーは現在のページだけで使用されます。有効時のみブラウザに保存されます。エクスポートには含まれないため、新しい端末では再認証が必要です。'],
        '5. 哪些資料會傳給 AI？': ['5. What Data is Sent?', '5. AIへ送信されるデータ'],
        '為了產生回覆，角色設定、目前情境、必要的劇情摘要與近期對話會送往所選供應商。角色照片與完整本機存檔不會隨一般對話請求上傳；照片與遊戲進度主要保存在目前裝置。': ['Character settings, the current scenario, necessary summaries, and recent dialogue are sent to the selected provider. Character images and complete local saves are not uploaded with normal chat requests.', '返答生成のため、キャラクター設定、現在のシナリオ、必要な要約、直近の会話が選択したサービスへ送られます。画像や完全なローカルセーブは通常の会話リクエストでは送信されません。'],
        '6. 驗證或回覆失敗怎麼辦？': ['6. Verification or Reply Failed?', '6. 認証・応答に失敗したら'],
        '請依序確認供應商是否選對、金鑰是否完整、帳戶額度與模型權限是否有效，以及網路是否正常。若只有特定模型失敗，可以改選其他模型；等待過久時可按「取消等待」，未完成的輸入會盡量放回輸入框。': ['Check the provider, key, account quota, model permission, and network. If only one model fails, choose another. Use Cancel Waiting if a request takes too long; unfinished input is restored when possible.', 'プロバイダー、キー、残高、モデル権限、ネットワークを確認してください。特定モデルだけ失敗する場合は別のモデルを選びます。長時間かかる場合は「待機を中止」を押してください。'],
        '在這台裝置保留金鑰': ['Keep key on this device', 'この端末にキーを保存'],
        '未開啟時只在本次頁面使用；共用裝置請勿開啟。': ['When off, the key is used only for this page session. Do not enable on shared devices.', 'オフの場合は現在のページだけで使用します。共有端末では有効にしないでください。'],
        '驗證金鑰': ['Verify', '確認'], '驗證中...': ['Verifying…', '確認中…'],
        '開始前請先準備 API 金鑰': ['API Key Required', 'APIキーが必要です'],
        '請選擇 Google Gemini 或 OpenRouter，貼上對應的 API Key 並完成驗證。金鑰不會包含在匯出備份中；共用裝置請勿開啟保存功能。': ['Choose Google Gemini or OpenRouter, paste the matching API key, and verify it. Keys are excluded from exports; do not save them on shared devices.', 'Google GeminiまたはOpenRouterを選び、対応するAPIキーを貼り付けて認証します。キーはバックアップに含まれません。共有端末では保存しないでください。'],
        '查看 API 詳細說明與模型選擇': ['API & Model Help', 'API・モデルのヘルプ'],
        '驗證成功。請選擇大腦核心：': ['Verified. Choose a model:', '確認完了。モデルを選択：'],
        '劇本創角': ['Character Setup', 'キャラクター設定'], '進入存檔選單': ['Saves', 'セーブ'],
        '冒險日誌': ['Adventure Log', '冒険日誌'], '閱讀遊戲玩法與系統指南': ['Game Guide', 'ゲームガイド'],
        '清除設備所有資料': ['Delete Local Data', 'ローカルデータを削除'],
        '外觀配色': ['Theme', 'テーマ'], '背景': ['Background', '背景'], '面板': ['Panel', 'パネル'],
        '線與字': ['Text & Lines', '文字と線'], '重點': ['Accent', 'アクセント'], '對話': ['Dialogue', '会話'], '恢復預設': ['Reset', 'リセット'],
        '角色設定': ['Characters', 'キャラクター設定'], '情境設定': ['Scenarios', 'シナリオ設定'], '遊戲設定': ['Game', 'ゲーム設定'],
        '玩家': ['Player', 'プレイヤー'], '登場 NPC': ['NPCs', '登場NPC'], '目前配置': ['Current Preset', '現在の設定'],
        '＋ 新增': ['＋ Add', '＋ 追加'], '配置檔案名稱': ['Preset Name', '設定名'], 'AI 隨機生成': ['AI Generator', 'AI生成'],
        '保留人物，隨機情境': ['Randomize Scenario', 'シナリオのみ生成'],
        '人物與情境全部隨機': ['Randomize All', 'すべてランダム生成'],
        '保留人物隨機情境': ['Randomize Scenario', 'シナリオのみ生成'],
        '人物情境全部隨機': ['Randomize Everything', 'すべてランダム生成'],
        '遊戲難度': ['Difficulty', '難易度'], '標準模式': ['Standard', '標準'], '困難模式': ['Hard', 'ハード'], '極限模式': ['Nightmare', 'ナイトメア'],
        '困難模式：檢定 DC +2，NPC 每次死亡只有一次復活檢定。極限模式：檢定 DC +4，歸零必定 Game Over，NPC 死亡後無法復活。': ['Hard: checks DC +2; each NPC death gets one revival check. Nightmare: checks DC +4; reaching zero causes Game Over and NPC death is permanent.', 'ハード：判定DC+2、NPC死亡ごとに復活判定は1回。極限：判定DC+4、ゼロでGame Over、NPCは復活できません。'],
        '困難模式：檢定 DC +2，NPC 每次死亡只有一次復活檢定，失敗後永久死亡。極限模式：檢定 DC +4，歸零必定 Game Over，NPC 死亡後無法復活。': ['Hard: checks DC +2; each NPC death gets one revival check, and failure is permanent. Nightmare: checks DC +4; reaching zero causes Game Over and NPC death is permanent.', 'ハード：判定DC+2、NPC死亡ごとに復活判定は1回で、失敗すると永続死亡。極限：判定DC+4、ゼロでGame Over、NPCは復活できません。'],
        '清空欄位': ['Clear', 'クリア'], '刪除配置': ['Delete Preset', '設定を削除'],
        '角色與情境的修改會保留，返回大廳時自動儲存目前配置。': ['Character and scenario edits are retained; the current preset is saved when returning home.', 'キャラクターとシナリオの編集は保持され、ホームへ戻ると現在の設定が自動保存されます。'],
        '返回': ['Back', '戻る'], '新增': ['Add', '追加'], '玩家自己設定': ['Player', 'プレイヤー'],
        '點擊更換頭像': ['Change Avatar', '画像を変更'], '玩家名稱': ['Player Name', 'プレイヤー名'],
        '基礎六圍屬性': ['Attributes', '能力値'], '🎲 隨機骰點 (4d6)': ['🎲 Roll Stats', '🎲 能力値を振る'],
        '💀 找守墓人洗點': ['💀 Respec', '💀 振り直す'],
        'STR 力量': ['STR Strength', 'STR 筋力'], 'DEX 敏捷': ['DEX Dexterity', 'DEX 敏捷'], 'CON 體質': ['CON Constitution', 'CON 体質'],
        'INT 智力': ['INT Intelligence', 'INT 知力'], 'WIS 感知': ['WIS Wisdom', 'WIS 感知'], 'CHA 魅力': ['CHA Charisma', 'CHA 魅力'],
        '詳細人物設定': ['Character Details', 'キャラクター詳細'], '年齡 / 身高 / 體型': ['Age / Height / Build', '年齢／身長／体格'],
        '說話習慣 / 語氣': ['Speech Style / Tone', '話し方／口調'], '喜歡的事物': ['Likes', '好きなもの'], '討厭的事物': ['Dislikes', '嫌いなもの'],
        '外貌特徵 / 常見穿搭': ['Appearance / Usual Outfit', '外見／普段の服装'], '核心性格 / 背景故事 (專長等)': ['Core Personality / Background', '性格／背景（特技など）'],
        '登場 NPC 列表': ['NPC List', '登場NPC一覧'], '+ 新增 NPC': ['+ Add NPC', '+ NPC追加'], '動態情境列表': ['Scenario List', 'シナリオ一覧'],
        '+ 新增情境': ['+ Add Scenario', '+ シナリオ追加'], '儲存變更': ['Save', '保存'], '另存新檔': ['Save as New', '別名で保存'], '返回選單': ['Back to Menu', 'メニューへ戻る'],
        '隨機生成': ['Randomize', 'ランダム生成'], '偏好關鍵字（可留空，AI 會自由發揮）': ['Preferences (optional)', '希望キーワード（任意）'],
        '開始生成': ['Generate', '生成'], '生成中…': ['Generating…', '生成中…'], '重新生成': ['Regenerate', '再生成'],
        '套用到表單': ['Apply', '適用'], 'AI 正在建立設定…': ['Creating preset…', '設定を作成中…'],
        '選擇記憶紀錄': ['Select Save', 'セーブを選択'], '本機資料狀態': ['Storage', 'ストレージ'], '重新計算': ['Refresh', '更新'],
        '正在計算瀏覽器儲存空間…': ['Calculating storage…', '容量を計算中…'], '尚未確認備份狀態。': ['Backup not checked.', 'バックアップ未確認'],
        '創建新紀錄': ['New Save', '新規セーブ'], '匯出': ['Export', 'エクスポート'], '匯入': ['Import', 'インポート'], '返回大廳': ['Home', 'ホーム'],
        '整理重複事件': ['Merge Duplicates', '重複を統合'], '↶ 復原上次整理': ['↶ Undo Merge', '↶ 統合を元に戻す'], '跳到最新': ['Latest', '最新へ'],
        '上一頁': ['Previous', '前へ'], '下一頁': ['Next', '次へ'], '編輯單筆冒險紀錄': ['Edit Entry', '記録を編集'], '刪除此筆': ['Delete Entry', 'この記録を削除'],
        '角色面板': ['Character', 'キャラクター'], '離開': ['Exit', '終了'], '(隊友狀態請見面板)': ['(Party status in panel)', '（仲間の状態はパネルへ）'],
        '+ 新情境': ['+ New Scenario', '+ 新シナリオ'], '神': ['Creator', '神'], '核心切換': ['Model', 'モデル'],
        '遊戲引擎 (DM)': ['Game Engine (GM)', 'ゲームエンジン (GM)'], '正在進行判定與演算...': ['Processing…', '処理中…'],
        '取消等待': ['Cancel', 'キャンセル'], '🎲 擲骰': ['🎲 Roll', '🎲 ダイス'], '發送': ['Send', '送信'],
        '刪除': ['Delete', '削除'], '編輯': ['Edit', '編集'], '完成': ['Done', '完了'], '收起': ['Collapse', '閉じる'],
        '尚未解鎖任何標籤...': ['No flags unlocked yet…', 'まだフラグはありません…'], '背包空空如也...': ['Inventory is empty…', '所持品は空です…'],
        '目前沒有任務。接到新委託時，會自動加在這裡。': ['No tasks yet. New tasks appear here automatically.', 'タスクはまだありません。新しい依頼は自動で追加されます。'],
        '目前沒有任何存檔紀錄。': ['No saves yet.', 'セーブデータはありません。'], '目前沒有存檔': ['No saves', 'セーブなし'],
        '— 遊戲紀錄已載入 —': ['— Save Loaded —', '— セーブを読み込みました —']
    };

    const ATTR_M = {
        '縮小圖片': ['Zoom out', '縮小'], '圖片縮放': ['Image zoom', '画像の拡大縮小'], '放大圖片': ['Zoom in', '拡大'],
        '關閉角色面板': ['Close character panel', 'キャラクターパネルを閉じる'],
        '新增狀態或旗標（最多 48 字）...': ['Add a status or flag (max 48 chars)…', '状態・フラグを追加（最大48文字）…'],
        '例如：\n• 秀芙與三高已確認戀人關係\n• 目前準備進入週六現實約會': ['Example:\n• Xiufu and Sangao confirmed their relationship\n• Preparing for a Saturday date in the real world', '例：\n• 秀芙と三高は恋人関係を確認した\n• 土曜日の現実世界でのデートを準備中'],
        '手動新增任務...': ['Add a task manually…', 'タスクを手動追加…'], '點擊上傳首頁照片': ['Upload home image', 'ホーム画像をアップロード'],
        '例如：\n• 秀芙與三高已成為戀人\n• SY 知道兩人關係升溫': ['Example:\n• Xiufu and Sangao are now a couple\n• SY knows their relationship is growing closer', '例：\n• 秀芙と三高は恋人になった\n• SYは二人の関係が深まっていることを知っている'],
        '請貼上你的 API Key': ['Paste your API key', 'APIキーを貼り付けてください'],
        '背景顏色': ['Background color', '背景色'], '面板顏色': ['Panel color', 'パネル色'], '線條與主要文字顏色': ['Line and main text color', '線と主要文字の色'],
        '重點顏色': ['Accent color', 'アクセント色'], 'NPC 對話顏色': ['NPC dialogue color', 'NPC会話色'],
        '角色配置總覽': ['Character preset overview', 'キャラクター設定一覧'], '配置分類': ['Preset categories', '設定カテゴリー'],
        '角色設定總覽': ['Character settings overview', 'キャラクター設定一覧'], '編輯玩家角色': ['Edit player character', 'プレイヤーを編集'],
        '情境設定總覽': ['Scenario settings overview', 'シナリオ設定一覧'], '遊戲設定總覽': ['Game settings overview', 'ゲーム設定一覧'],
        '切換配置鎖定': ['Toggle preset lock', '設定ロック切替'], '點擊切換鎖定狀態': ['Toggle lock', 'ロック切替'],
        '可填入想要的氣氛、類型、禁忌或角色關係；不填也可以。': ['Optional mood, genre, boundaries, or relationships.', '雰囲気、ジャンル、NG、関係性など（任意）。'],
        '選擇日誌存檔': ['Choose journal save', '日誌のセーブを選択'], '搜尋事件、角色或地點...': ['Search events, characters, or places…', 'イベント、人物、場所を検索…'],
        '搜尋冒險日誌': ['Search adventure log', '冒険日誌を検索'], '冒險紀錄內容': ['Adventure entry content', '冒険記録の内容'],
        '開啟或收回角色面板': ['Open or collapse character panel', 'キャラクターパネルを開閉'],
        '切換持續創作者指令模式': ['Toggle persistent Creator mode', '継続「神」モード切替'],
        '輸入你的開局動作，或點選上方選項...': ['Enter your opening action or choose an option above…', '最初の行動を入力するか、上の選択肢を選んでください…'],
        '由 AI 判斷檢定屬性後隨機擲出 D20': ['AI chooses the ability, then rolls a D20', 'AIが能力を選びD20を振ります'],
        '例如：從遊戲世界切回時視為登出並回到語音通話。': ['Example: returning from the game world logs out and returns to voice chat.', '例：ゲーム世界から戻るとログアウト扱いになり、ボイスチャットへ戻る。']
    };

    const SYSTEM_M = {
        '至少要保留一位 NPC 喔！': ['At least one NPC must remain.', 'NPCを最低1人残してください。'],
        '至少要保留一個情境喔！': ['At least one scenario must remain.', 'シナリオを最低1つ残してください。'],
        '系統至少需要保留一組配置喔！': ['At least one preset must remain.', '設定を最低1つ残してください。'],
        '確定要刪除這位 NPC 嗎？': ['Delete this NPC?', 'このNPCを削除しますか？'],
        '確定要刪除這個情境嗎？對應的對話紀錄也會被連帶刪除！': ['Delete this scenario? Its dialogue history will also be deleted.', 'このシナリオを削除しますか？対応する会話記録も削除されます。'],
        '確定要刪除這個存檔嗎？此操作無法復原。': ['Delete this save? This cannot be undone.', 'このセーブを削除しますか？元に戻せません。'],
        '確定要刪除這一筆冒險紀錄嗎？': ['Delete this adventure entry?', 'この冒険記録を削除しますか？'],
        '目前沒有資料可以匯出。': ['There is no data to export.', 'エクスポートするデータがありません。'],
        '請貼上你的 API Key！': ['Please paste your API key.', 'APIキーを貼り付けてください。'],
        '這份存檔格式不正確，無法載入。': ['This save has an invalid format and cannot be loaded.', 'このセーブ形式は正しくないため読み込めません。'],
        '找不到這名角色，頭像未變更。': ['Character not found. The avatar was not changed.', 'キャラクターが見つからないため、画像は変更されませんでした。'],
        '請先輸入你打算做什麼，再來擲骰子喔！': ['Enter what you want to do before rolling.', '先に行動を入力してからダイスを振ってください。'],
        '「神」模式是創作者指令，不使用玩家六圍。請按一般發送。': ['Creator mode does not use player attributes. Use Send instead.', '「神」モードは能力値を使いません。通常送信を使用してください。'],
        '目前是輔助旁白／創作者視角，不會使用玩家六圍擲骰。請改用一般送出。': ['Narrator/Creator view does not use player attributes. Use Send instead.', 'ナレーター／作者視点では能力値判定を行いません。通常送信を使用してください。'],
        '無法刪除當前所在的情境！請先返回遊戲切換到其他情境後，再來進行刪除。': ['You cannot delete the active scenario. Switch to another scenario first.', '現在いるシナリオは削除できません。別のシナリオへ移動してください。'],
        '這筆紀錄不能是空白；若要移除請按「刪除此筆」。': ['This entry cannot be blank. Use Delete Entry to remove it.', '記録を空欄にはできません。削除する場合は「この項目を削除」を使用してください。'],
        '整理會合併語意重複的事件。系統會先保留備份，確定要繼續嗎？': ['Organizing merges semantically duplicate events. A backup will be kept. Continue?', '整理すると意味の重複するイベントを統合します。バックアップを保存して続行しますか？'],
        '冒險紀錄已整理完成；如不滿意可按「復原上次整理」。': ['Adventure log organized. Use Undo Last Organize if needed.', '冒険記録を整理しました。必要なら「前回の整理を戻す」を使用してください。'],
        '這份存檔目前沒有可復原的整理備份。': ['This save has no organization backup to restore.', 'このセーブには復元できる整理バックアップがありません。'],
        '目前沒有可復原的整理備份。': ['There is no organization backup to restore.', '復元できる整理バックアップがありません。'],
        '已復原整理前的完整冒險紀錄。': ['The adventure log was restored.', '整理前の冒険記録を復元しました。'],
        '摘要與任務清單已整理完成。': ['Summary and task list organized.', 'サマリーとタスクリストを整理しました。'],
        '匯入失敗：備份檔超過 50MB。': ['Import failed: backup file exceeds 50 MB.', 'インポート失敗：バックアップが50MBを超えています。'],
        '洗點成功！你的能力值已重新分配。': ['Stats successfully reassigned.', '能力値を再配分しました。'],
        '極限模式的死亡永久成立，無法嘗試復活。': ['Death is permanent in Nightmare mode.', '極限モードでは死亡は永続し、復活できません。'],
        '這名 NPC 的復活檢定已經失敗，不能再次嘗試。': ['This NPC already failed their revival check.', 'このNPCは復活判定に失敗しており、再挑戦できません。'],
        '困難模式不能由「神」直接復活；必須以角色行動進行一次復活檢定。': ['Hard mode requires a character action and revival check; Creator mode cannot revive directly.', 'ハードモードではキャラクター行動による復活判定が必要です。「神」で直接復活できません。'],
        '困難模式的復活必須檢定。請按「擲骰」，成功才能復活；失敗後將永久無法再嘗試。': ['Hard mode revival requires a roll. Success revives; failure is permanent.', 'ハードモードの復活には判定が必要です。成功で復活、失敗すると再挑戦できません。']
    };

    const reverse = { en: new Map(), ja: new Map() };
    Object.entries(M).forEach(([zh, values]) => { reverse.en.set(values[0], zh); reverse.ja.set(values[1], zh); });
    const attrReverse = { en: new Map(), ja: new Map() };
    Object.entries(ATTR_M).forEach(([zh, values]) => { attrReverse.en.set(values[0], zh); attrReverse.ja.set(values[1], zh); });
    const systemReverse = { en: new Map(), ja: new Map() };
    Object.entries(SYSTEM_M).forEach(([zh, values]) => { systemReverse.en.set(values[0], zh); systemReverse.ja.set(values[1], zh); });
    const textKeys = new WeakMap();
    const attrKeys = new WeakMap();
    let currentLanguage = normalizeLanguage(localStorage.getItem(UI_LANGUAGE_STORAGE_KEY));
    let observer = null;

    function normalizeLanguage(value) {
        const raw = String(value || '').trim();
        if (/^ja/i.test(raw)) return 'ja';
        if (/^en/i.test(raw)) return 'en';
        return 'zh-TW';
    }

    function translatedValue(zh, locale = currentLanguage, dictionary = M) {
        if (locale === 'zh-TW') return zh;
        const values = dictionary[zh];
        return values ? values[locale === 'en' ? 0 : 1] : zh;
    }

    function resolveKey(value, dictionary = M, reverseMaps = reverse) {
        if (dictionary[value]) return value;
        return reverseMaps.en.get(value) || reverseMaps.ja.get(value) || '';
    }

    function shouldSkipNode(node) {
        const parent = node.parentElement;
        return !parent || Boolean(parent.closest('script, style, code, [data-no-i18n], #dialogue-box, .journal-entry-text, .save-title, .msg-text, .msg-narrative, .desktop-npc-avatar-button > span:last-child, #desktop-player-name, .summary-name, .npc-summary-name'));
    }

    function translateDynamic(value, locale) {
        const rules = [
            [/^總點數\s*(\d+)\s*\/\s*(\d+)$/, a => locale === 'en' ? `Total ${a[1]} / ${a[2]}` : locale === 'ja' ? `合計 ${a[1]} / ${a[2]}` : a[0]],
            [/^第\s*(\d+)\s*\/\s*(\d+)\s*頁$/, a => locale === 'en' ? `Page ${a[1]} / ${a[2]}` : locale === 'ja' ? `${a[1]} / ${a[2]} ページ` : a[0]],
            [/^最後遊玩：(.*)$/, a => locale === 'en' ? `Last played: ${a[1]}` : locale === 'ja' ? `最終プレイ：${a[1]}` : a[0]],
            [/^代表NPC:\s*(.*?)\s*\|\s*玩家:\s*(.*)$/, a => locale === 'en' ? `Featured NPC: ${a[1]} | Player: ${a[2]}` : locale === 'ja' ? `代表NPC：${a[1]}｜プレイヤー：${a[2]}` : a[0]],
            [/^配置：(.*)$/, a => locale === 'en' ? `Preset: ${a[1]}` : locale === 'ja' ? `設定：${a[1]}` : a[0]],
            [/^情境\s*(\d+)：(.*)$/, a => locale === 'en' ? `Scenario ${a[1]}: ${a[2]}` : locale === 'ja' ? `シナリオ ${a[1]}：${a[2]}` : a[0]]
        ];
        for (const [pattern, format] of rules) {
            const match = value.match(pattern);
            if (match) return format(match);
        }
        return value;
    }

    function translateSystemText(message) {
        const value = String(message ?? '');
        const exactKey = resolveKey(value, SYSTEM_M, systemReverse) || resolveKey(value);
        if (exactKey) return translatedValue(exactKey, currentLanguage, SYSTEM_M[exactKey] ? SYSTEM_M : M);
        if (currentLanguage === 'zh-TW') return value;
        const rules = [
            [/^請先驗證 (.+) 金鑰並選擇模型。$/, a => currentLanguage === 'en' ? `Verify your ${a[1]} key and choose a model first.` : `先に${a[1]}キーを認証し、モデルを選択してください。`],
            [/^儲存時發生錯誤：(.*)$/, a => currentLanguage === 'en' ? `Save error: ${a[1]}` : `保存エラー：${a[1]}`],
            [/^匯入失敗：(.*)$/, a => currentLanguage === 'en' ? `Import failed: ${a[1]}` : `インポート失敗：${a[1]}`],
            [/^Flags 已達 (\d+) 個，請先刪除或合併較舊項目再新增。$/, a => currentLanguage === 'en' ? `Flags reached ${a[1]}. Delete or merge older entries first.` : `フラグが${a[1]}件に達しました。古い項目を削除または統合してください。`]
        ];
        for (const [pattern, format] of rules) {
            const match = value.match(pattern);
            if (match) return format(match);
        }
        return value;
    }

    function translateTextNode(node) {
        if (!node || shouldSkipNode(node)) return;
        const raw = node.nodeValue || '';
        const trimmed = raw.trim();
        if (!trimmed) return;
        let key = textKeys.get(node);
        const variants = key && M[key] ? [key, ...M[key]] : [];
        if (!key || !variants.includes(trimmed)) key = resolveKey(trimmed);
        if (key) {
            textKeys.set(node, key);
            const next = translatedValue(key);
            if (trimmed !== next) node.nodeValue = raw.replace(trimmed, next);
            return;
        }
        const nextDynamic = translateDynamic(trimmed, currentLanguage);
        if (nextDynamic !== trimmed) node.nodeValue = raw.replace(trimmed, nextDynamic);
    }

    function translateAttributes(element) {
        if (!element || element.nodeType !== 1 || element.matches('[data-no-i18n]')) return;
        let store = attrKeys.get(element);
        if (!store) { store = {}; attrKeys.set(element, store); }
        ['placeholder', 'title', 'aria-label'].forEach(name => {
            const value = element.getAttribute(name);
            if (!value) return;
            let key = store[name];
            const variants = key && ATTR_M[key] ? [key, ...ATTR_M[key]] : [];
            if (!key || !variants.includes(value)) key = resolveKey(value, ATTR_M, attrReverse);
            if (!key) return;
            store[name] = key;
            const next = translatedValue(key, currentLanguage, ATTR_M);
            if (value !== next) element.setAttribute(name, next);
        });
    }

    function translateSubtree(root = document.body) {
        if (!root) return;
        if (root.nodeType === Node.TEXT_NODE) { translateTextNode(root); return; }
        if (root.nodeType === Node.ELEMENT_NODE) translateAttributes(root);
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
            if (node.nodeType === Node.TEXT_NODE) translateTextNode(node);
            else translateAttributes(node);
        }
    }

    function syncLanguageSelectors() {
        document.querySelectorAll('[data-ui-language-select]').forEach(select => { select.value = currentLanguage; });
    }

    function setUiLanguage(locale, options = {}) {
        currentLanguage = normalizeLanguage(locale);
        if (options.persist !== false) localStorage.setItem(UI_LANGUAGE_STORAGE_KEY, currentLanguage);
        document.documentElement.lang = currentLanguage;
        document.title = translatedValue('TRPG模擬器(測試版)');
        syncLanguageSelectors();
        translateSubtree(document.body);
        if (options.notify !== false) window.dispatchEvent(new CustomEvent('ui-language-change', { detail: { locale: currentLanguage } }));
        return currentLanguage;
    }

    function startObserver() {
        if (observer) return;
        observer = new MutationObserver(records => {
            records.forEach(record => {
                if (record.type === 'characterData') translateTextNode(record.target);
                if (record.type === 'childList') record.addedNodes.forEach(node => translateSubtree(node));
                if (record.type === 'attributes') translateAttributes(record.target);
            });
        });
        observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'title', 'aria-label'] });
    }

    window.setUiLanguage = setUiLanguage;
    window.getUiLanguage = () => currentLanguage;
    window.translateUi = translateSubtree;
    window.uiMessage = (zh, params = {}) => {
        let value = translatedValue(zh);
        Object.entries(params).forEach(([key, replacement]) => { value = value.replaceAll(`{${key}}`, replacement); });
        return value;
    };

    const nativeAlert = window.alert.bind(window);
    const nativeConfirm = window.confirm.bind(window);
    const nativePrompt = window.prompt.bind(window);
    window.alert = message => nativeAlert(translateSystemText(message));
    window.confirm = message => nativeConfirm(translateSystemText(message));
    window.prompt = (message, defaultValue) => nativePrompt(translateSystemText(message), defaultValue);

    document.addEventListener('DOMContentLoaded', () => {
        setUiLanguage(currentLanguage, { persist: false, notify: false });
        startObserver();
    });
})();
