(function () {
    'use strict';

    const UI_LANGUAGE_STORAGE_KEY = 'sanko_ui_language_v1';
    const SUPPORTED_UI_LANGUAGES = new Set(['zh-TW', 'en', 'ja']);
    const M = {
"完成 API 驗證並選好模型後，建立角色與情境、進入存檔，輸入第一個行動就能開始。（金鑰設定與錯誤排除看首頁說明。）": ["Once you've verified your API key and picked a model, build your characters and scenario, enter a save, and type your first action to begin. (See the home page for key setup and troubleshooting.)", "API キーを認証してモデルを選んだら、キャラとシナリオを作り、データに入って最初の行動を入力すれば開始です。（キー設定と対処法はホーム参照。）"],
"在「劇本創角」裡設定角色、NPC、情境與遊戲選項；情境也可交給 AI 隨機生成。": ["In \"Create Scenario\" you set up characters, NPCs, the scenario and game options; scenarios can also be randomized by the AI.", "「シナリオ作成」でキャラ・NPC・シナリオ・ゲーム設定を行います。シナリオは AI にランダム生成させることもできます。"],
"核心準則：寫進去的鐵則 AI 每回合優先讀取、不會違反。適合固定世界觀、人物設定，或鎖定場景（例如寫「B 目前不在此情境」擋掉不在場的 NPC）。": ["Core Rules: iron rules you write here are read first every turn and never broken. Good for fixing the world or a character, or locking a scene (e.g. write \"B is not in this scene right now\" to keep an absent NPC out).", "コアルール：書いた鉄則は毎ターン最優先で読まれ、破られません。世界観や人物の固定、場面の固定に便利（例：「B は今この場面にいない」と書けば不在の NPC を出さない）。"],
"本場目標：替情境設一個目標，DM 會自然朝它推進，達成會觸發章節收束；留空則自由發展。": ["Scene Goal: set a goal for a scenario and the GM steers toward it naturally; reaching it triggers a chapter close. Leave it blank for free play.", "本場の目標：シナリオに目標を設定すると GM が自然にそこへ導き、達成で章の締めくくりが発生します。空欄なら自由展開。"],
"在輸入框打角色想說或想做的事，或點 AI 給的選項；有風險的行動用骰子按鈕做 D20 判定。": ["Type what your character says or does in the box, or click one of the AI's options; for risky actions use the dice button for a D20 check.", "入力欄にキャラのセリフや行動を打つか、AI の選択肢を選びます。危険な行動はダイスボタンで D20 判定。"],
"想安排環境、鏡頭或讓 NPC 行動，點輸入框上方的「旁白」籤；點「行動」籤回到玩家角色；想直接改場景、時間、人物，切到「神」籤。旁白與神的內容都不會被當成玩家發言。": ["To arrange the environment, camera, or NPC actions, tap the \"Narrator\" tab above the input box; tap \"Action\" to return to your character; to directly change the scene, time, or characters, switch to the \"Creator\" tab. Narrator and Creator input never counts as the player speaking.", "環境・カメラ・NPC の行動を指定するには入力欄上の「ナレーター」タブ、プレイヤーキャラクターに戻るには「行動」タブ、場面・時間・キャラクターを直接変えるには「神」タブに切り替えます。ナレーターと神の内容はプレイヤーの発言として扱われません。"],
"已送出的文字要修改、複製或收藏，桌機右鍵、手機長按開選單。": ["To edit, copy or clip already-sent text, right-click (desktop) or long-press (mobile) to open a menu.", "送信済みテキストの修正・コピー・保存は、PC は右クリック、スマホは長押しでメニューを開きます。"],
"HP 或 SAN 偏低會進入危機：檢定變難，畫面也會出現暗角、雜訊等干擾，越接近歸零越強烈。": ["When HP or SAN runs low you enter crisis: checks get harder and the screen shows vignetting, noise and other interference that intensifies toward zero.", "HP か SAN が低くなると危機に入り、判定が難しくなり、画面にビネットやノイズなどの演出が現れ、ゼロに近づくほど強くなります。"],
"覺得干擾太多，可在角色面板「系統」頁的「顯示與輸出設定 → 低狀態干擾」調成減弱或關閉。": ["If it's too much, open the character panel's \"System\" tab and set \"Display & Output → Low HP/SAN effects\" to Reduced or Off.", "演出が多すぎる場合は、キャラクターパネルの「システム」タブにある「表示と出力 → 低HP/SAN演出」を控えめかオフにできます。"],
"SAN 很低時 AI 選項可能被污染：點下去有機率變成隱藏的失控行動並直接送出。": ["At very low SAN the AI's options can be corrupted: clicking one may turn it into a hidden loss-of-control action that's sent immediately.", "SAN が非常に低いと AI の選択肢が汚染されることがあり、押すと隠れた制御喪失行動に変わって即送信される場合があります。"],
"三種難度：標準歸零不會結束；困難歸零要擲生死檢定保命，NPC 只有一次復活；極限最難，NPC 死亡無法復活。": ["Three difficulties: Standard never ends at zero; Hard rolls a life-or-death check at zero and gives an NPC only one revival; Extreme is hardest and NPC deaths are permanent.", "3つの難易度：標準はゼロでも終わらない。困難はゼロで生死判定、NPC の蘇生は1回のみ。極限は最難で NPC の死は永久。"],
"極限模式歸零會觸發「最後掙扎」，擲生死檢定通過就撐住，並拿到幾回合護盾。": ["In Extreme, hitting zero triggers a \"last stand\": pass the life-or-death check to hold on and gain a few turns of shield.", "極限ではゼロで「最後の抵抗」が発生し、生死判定に通れば持ちこたえ、数ターンのシールドを得ます。"],
"輸入列的杯子圖示是「喘息」：主動擲檢定回一點 HP／SAN，用來脫離死亡螺旋（回復上限為 HP／SAN 總量的 50%，不能連按）。": ["The cup icon on the input row is \"Catch Breath\": roll a check to restore some HP/SAN and escape a death spiral (capped at 50% of max, no consecutive use).", "入力欄のカップアイコンは「ひと息」：判定で HP／SAN を少し回復し、死のスパイラルから抜けます（上限は最大値の50%、連続使用不可）。"],
"部分劇情道具有回復效果，在角色面板道具區按「使用」。": ["Some story items have a restore effect. Press \"Use\" in the items area of the character panel.", "一部の物語アイテムには回復効果があり、キャラパネルの所持品欄で「使う」を押します。"],
"達成重大成就會拿到成長點，可在「角色成長」區提升屬性或新增擅長領域，稱號隨成就升階。": ["Major achievements grant growth points to raise stats or add an area of expertise in the \"Character Growth\" area; your title ranks up with achievements.", "重大な実績で成長ポイントを得て、「キャラ成長」欄で能力値強化や得意分野の追加ができます。称号は実績で昇格します。"],
"達成情境的「本場目標」會觸發章節收束，由 AI 收尾並給成長點。": ["Reaching a scenario's \"Scene Goal\" triggers a chapter close, with the AI wrapping up and granting a growth point.", "シナリオの「本場の目標」達成で章の締めくくりが発生し、AI が締めて成長ポイントを付与します。"],
"NPC 好感滿值、關係破裂或死亡等重大節點，系統會自動記進 Flags 與冒險日誌；好感跌到谷底（−100）會解鎖特殊成就。": ["Major beats like an NPC's affection maxing out, a relationship breaking, or a death are logged automatically into Flags and the adventure log; hitting rock bottom (−100) unlocks a special achievement.", "NPC の好感度満タン・関係決裂・死亡などの重要な節目は、自動で Flags と冒険日誌に記録されます。好感度がどん底（−100）まで落ちると特別な実績が解除されます。"],
"面板上的像素愛心會隨好感改變動作：越愛越活潑，滿值會發光跳躍，觸底則整顆倒下。": ["The pixel heart on the panel moves with affection: the closer the bond, the livelier it gets; it glows and leaps at max, and topples over at rock bottom.", "パネルのピクセルハートは好感度で動きが変わります：仲良くなるほど元気になり、満タンで光って跳ね、どん底では倒れてしまいます。"],
"冒險日誌記完整事件；想收藏對話用日記（泡泡右鍵、長按選「收藏這段」），在日記頁面對翻頁列桌機右鍵、手機長按可把整篇存成長圖。": ["The adventure log records full events; to save conversations use the diary (right-click or long-press a bubble and choose \"Clip this\"). On the diary page, right-click or long-press the pager to export the whole thing as a long image.", "冒険日誌は出来事を記録。会話は日記に保存（吹き出しを右クリック／長押しで「この範囲を保存」）。日記ページでページャーを右クリック／長押しすると全体を長い画像に書き出せます。"],
"故事變長後 AI 可能變鈍，這是模型限制。可以換標有 ▪ 的模型、多用「整理摘要／整理冒險日誌」壓縮記憶，或開「神」模式直接說明目前場景與重點。": ["As the story grows the AI may dull, a model limit. Switch to a ▪-marked model, use \"Organize summary / Organize adventure log\" often to compress memory, or use \"Creator\" mode to state the current scene and key points.", "物語が長くなると AI が鈍ることがあります（モデルの限界）。▪ 付きモデルに変える、「要約整理／冒険日誌整理」で記憶を圧縮する、または「神」モードで現在の場面と要点を伝えます。"],
"每份遊戲紀錄綁定一份配置；另存新檔會複製紀錄並建立專屬配置。": ["Each save binds to one preset; \"save as new\" copies the save and creates its own preset.", "各データは1つのプリセットに紐づき、「新規保存」はデータを複製して専用プリセットを作ります。"],
"匯出備份會保存紀錄、配置與頭像（不含 API Key），方便換裝置或還原。": ["Exporting a backup saves records, presets and avatars (not the API key) for moving devices or restoring.", "バックアップは記録・プリセット・アイコンを保存（API キーは除く）、機種変更や復元に便利です。"],
"成人模式在角色面板「系統」頁開關（預設關），開啟後 AI 會在角色皆成年且合意的前提下更自然承接親密場景，實際尺度仍取決於所選模型。": ["Mature mode toggles in the character panel's \"System\" tab (off by default); when on, the AI handles intimate scenes more naturally on the premise that all characters are consenting adults, though the actual explicitness depends on the model.", "成人モードはキャラクターパネルの「システム」タブで切替（既定オフ）。オンにすると全員が成人かつ合意の前提で AI が親密シーンをより自然に扱いますが、描写度合いはモデル次第です。"],
"角色成長": ["Character Growth", "キャラ成長"],
"喘息穩住身心：擲檢定回復 HP／SAN（上限 50%，不能連續使用）": ["Catch your breath: roll to restore HP/SAN (cap 50%, no consecutive use)", "ひと息ついて立て直す：判定で HP／SAN を回復（上限50%・連続使用不可）"],
"建立你的故事：角色、情境與規則": ["Build your story: characters, scenarios, rules", "物語を作る：キャラ・シナリオ・ルール"],
"怎麼玩：行動、選項與模式": ["How to play: actions, options, modes", "遊び方：行動・選択肢・モード"],
"生存與危機：HP／SAN": ["Survival & crisis: HP / SAN", "生存と危機：HP／SAN"],
"難度、死亡與收束": ["Difficulty, death & closure", "難易度・死亡・締めくくり"],
"成長與里程碑": ["Growth & milestones", "成長とマイルストーン"],
"讓 AI 不忘記、不跳針": ["Keeping the AI on track", "AI を脱線させない"],
"存檔、備份與成人模式": ["Saves, backups & mature mode", "データ・バックアップ・成人モード"],
'v2.7 更新（07/10）': ['v2.7 update (07/10)', 'v2.7 アップデート（07/10）'],
"v2.9 更新（07/12）": ["v2.9 update (07/12)", "v2.9 アップデート（07/12）"],
"行動／旁白／神合併為輸入框上方的模式籤，喘息鈕併入同一列；並修正旁白模式無法骰點的問題。": ["Action / Narrator / Creator are now mode tabs above the input box, with the Catch Breath button on the same row; also fixed dice rolls not working in Narrator mode.", "行動／ナレーター／神を入力欄上のモードタブに統合し、「ひと息」ボタンも同じ列に配置。ナレーターモードでダイスが振れない問題も修正しました。"],
"模型選單移入「系統」頁。": ["The model selector moved to the \"System\" tab.", "モデル選択を「システム」タブへ移動しました。"],
"匯出記錄檔不再包含外觀配色。": ["Exported save data no longer includes the UI color theme.", "書き出したデータにテーマ配色を含めなくなりました。"],
'v2.8 更新（07/11）': ['v2.8 update (07/11)', 'v2.8 アップデート（07/11）'],
'行動選項改為卡片式：顯示檢定類別（觀察・WIS 等）與行動難度，符合擅長領域的行動會掛上「★熟練」徽章；桌機並排顯示、手機直疊。': ['Action options are now cards showing the check category (e.g. Observe / WIS) and difficulty; actions matching your proficiencies get a ★ Proficient badge. Cards sit side by side on desktop and stack on mobile.', '行動選択肢がカード式になり、判定カテゴリ（観察・WIS など）と難易度を表示。得意分野に合致する行動には「★得意」バッジが付きます。PCでは横並び、スマホでは縦積みです。'],
'冒險日誌新增「只看★」篩選；標記重要（★）的紀錄在 AI 整理時會原文保留並留在原位置，不再被合併或搬動。': ['The adventure log gains a ★ Only filter. Starred entries are kept verbatim and in place during AI organizing, no longer merged or moved.', '冒険日誌に「★のみ」フィルタを追加。★を付けた記録はAI整理時に原文のまま元の位置に保持され、統合や移動はされません。'],
'匯入與本機完全相同的配置檔時會先詢問，不再無條件建立「（匯入）」副本。': ['Importing a preset identical to one on this device now asks first instead of always creating an imported copy.', 'この端末と完全に同じ設定ファイルをインポートする際は先に確認し、無条件に複製を作らなくなりました。'],
'極限模式歸零的提示改為「最後掙扎」說明（D20 ≥ 8 存活），與實際機制一致。': ['Nightmare-mode zero messages now describe the actual Last Stand rule (survive on D20 of 8 or higher).', 'ナイトメアモードでゼロになった際の表示を実際の「最後の抵抗」ルール（D20が8以上で生存）に合わせました。'],
'任務失敗會連同原因寫入冒險日誌；任務刪除鈕改為 DEL。': ['Failed tasks are logged together with the reason; the task delete button is now DEL.', 'タスク失敗は理由と一緒に冒険日誌へ記録されます。タスク削除ボタンはDELになりました。'],
'細節：載入缺少配置快照的舊存檔會自動建立獨立空白配置、角色面板不再於 AI 回合後彈回拖曳前位置、低 SAN 選項漂移恢復緩動手感、更新內容與核心準則抽屜的閱讀透明度統一。': ['Details: legacy saves missing a preset snapshot get their own blank preset, the character panel no longer snaps back after AI turns, low-SAN option drift is smooth again, and the update and core-rules drawers share the same reading transparency.', '細部：設定スナップショットのない古いデータは専用の空設定を自動作成。キャラクターパネルはAIターン後に元の位置へ戻らなくなり、低SAN時の選択肢の漂いも滑らかに。更新内容とコアルールの透明度も統一しました。'],
'愛心大改版：面板像素愛心換成圓滾滾的糰子造型（與彈出小愛心同款），並會隨好感改變動作，從微微呼吸、雀躍蹦跳到滿值的發光麻糬彈跳；關係惡化會垂頭喪氣，跌到谷底整顆倒下。': ['Heart makeover: the panel heart is now the same chubby dango as the pop-up hearts, and it moves with affection, from gentle breathing and happy hops to a glowing mochi bounce at max; souring bonds droop, and at rock bottom the heart topples over.', 'ハート大改修：パネルのハートがポップアップと同じまんまる団子に。好感度で動きも変わり、静かな呼吸から嬉しい跳ねまで、満タンでは光るもちもちバウンド。関係が悪化するとうなだれ、どん底では倒れてしまいます。'],
'新成就「我們地獄見」：好感跌到谷底（−100）自動解鎖，並跳出恩斷義絕提示。': ['New achievement "See You in Hell": unlocked automatically when affection hits rock bottom (−100), with a dramatic on-screen notice.', '新実績「地獄で会おう」：好感度がどん底（−100）まで落ちると自動で解除され、縁切りの通知が表示されます。'],
'道具加值：名稱帶屬性標記的裝備道具（如「幸運硬幣（智力+1）」）持有期間骰點自動加值、明細會標示，失去道具即失效。': ['Item bonuses: gear with a stat tag in its name (like "Lucky Coin (INT+1)") automatically boosts matching dice checks while held, shown in the roll breakdown; lose the item and the bonus is gone.', 'アイテムボーナス：名前に能力タグ付きの装備（例「幸運のコイン（知力+1）」）は所持中、対応する判定に自動でボーナスが乗り、内訳にも表示。失うと消えます。'],
'動態補完：AI 回覆逐則彈入（依字數決定節奏）、擲骰時骰面翻轉。': ['Motion polish: AI replies now pop in one by one (paced by text length), and the die face tumbles when you roll.', '演出追加：AI の返答が一件ずつポップイン（文字数でテンポが変化）、ダイスを振ると出目がコロコロ回転。'],
'面板整理：顯示與輸出設定移至「系統」頁（原 API 頁）並縮小追蹤格；角色成長平時改顯示六圍「判定加值總覽」（含道具加值與低狀態懲罰，即時計算），拿到成長點時才展開升級按鈕。': ['Panel cleanup: display & output settings moved to the "System" tab (formerly API) with compact usage cards; character growth now shows a live "check modifiers" overview of all six stats (item bonuses and low-state penalties included), expanding into upgrade buttons only when you have growth points.', 'パネル整理：表示・出力設定を「システム」タブ（旧 API）へ移動し、使用状況カードをコンパクト化。キャラ成長は普段は六能力の「判定ボーナス一覧」（アイテムボーナス・低状態ペナルティ込みでリアルタイム計算）を表示し、成長ポイントがある時だけ強化ボタンを展開。'],
'細節：修正像素愛心放大顯示時的髮絲細縫；修正大成功／大失敗通知被壓成細條；「遊戲玩法」補上愛心動態與觸底成就說明。': ['Details: fixed hairline seams on the pixel heart at large sizes; fixed crit/fumble notices getting squashed; the how-to-play guide now covers heart moods and the rock-bottom achievement.', '細部：ピクセルハート拡大表示時の細い隙間を修正。クリティカル／ファンブル通知が潰れる問題を修正。遊び方ガイドにハートの動きとどん底実績の説明を追加。'],
'名稱帶屬性標記的裝備道具（例如「幸運硬幣（智力+1）」）持有期間會自動加進對應骰點，失去道具即失效。': ['Gear with a stat tag in its name (like "Lucky Coin (INT+1)") automatically adds to matching dice checks while held; lose the item and the bonus is gone.', '名前に能力タグ付きの装備（例「幸運のコイン（知力+1）」）は所持中、対応する判定に自動で加算されます。失うと無効になります。'],
'日常劇情也能回復：充分休息、過夜、接受治療或被安撫時，AI 會依事件小幅回復 HP／SAN（重複躺著刷不了血）。': ['Everyday scenes heal too: proper rest, a full night\'s sleep, treatment, or being comforted lets the AI restore a little HP/SAN based on the event (no farming by napping repeatedly).', '日常シーンでも回復：十分な休息、一晩の睡眠、治療、慰めなどの出来事に応じて AI が HP／SAN を少し回復させます（寝続けて稼ぐことはできません）。'],
'屬性點滿 20 後，該屬性按鈕會轉為鍛造：花 2 成長點兌換「成長結晶」（該屬性判定 +1，與裝備共用 +3 上限）；結晶是道具，可能因劇情失去。': ['Once a stat hits the 20 cap, its button turns into forging: spend 2 growth points for a "Growth Crystal" (+1 to that stat\'s checks, sharing the +3 item cap); crystals are items and can be lost to the story.', '能力値が上限 20 に達すると、そのボタンは鍛造に変わります：成長ポイント 2 で「成長結晶」と交換（その能力の判定 +1、装備と共通の上限 +3）。結晶はアイテムなので、物語の中で失うこともあります。'],
'成長結晶：屬性點滿 20 後可花 2 成長點鍛造「成長結晶」，該屬性判定 +1（與裝備共用 +3 上限），點滿後的成長點有了去處。': ['Growth Crystals: once a stat hits the 20 cap you can forge a "Growth Crystal" for 2 growth points, +1 to that stat\'s checks (sharing the +3 item cap), giving late-game points somewhere to go.', '成長結晶：能力値が上限 20 に達したら、成長ポイント 2 で「成長結晶」を鍛造可能。その能力の判定 +1（装備と共通の上限 +3）。カンスト後のポイントに使い道ができました。'],
'第一次跑團嗎？首頁側邊的「遊戲玩法」有完整指南；想被牽著走一遍基本操作，可改用預設配置的「序章：出門前的小演練」。': ['First time at the table? The "How to Play" side tab on the home page has the full guide; for a hands-on walkthrough, try the default preset\'s "Prologue: A Little Warm-up Before Heading Out."', '初めてのセッションですか？ホーム画面サイドの「遊び方」に完全ガイドがあります。手を引いてほしい場合は、デフォルト設定の「序章：出かける前の小さな練習」をどうぞ。'],
'新手教學情境：預設配置新增「序章：出門前的小演練」，由 DM 在劇情裡一步步帶你熟悉輸入、擲骰、道具使用與好感互動，完成後自然銜接正篇。': ['Tutorial scenario: the default preset now opens with "Prologue: A Little Warm-up Before Heading Out," where the DM teaches input, dice, item use and affection through the story itself, flowing straight into the main chapters.', 'チュートリアルシナリオ：デフォルト設定に「序章：出かける前の小さな練習」を追加。DM が物語の中で入力・ダイス・アイテム使用・好感度を一歩ずつ案内し、そのまま本編へ続きます。'],
'v2.6 更新（07/10）': ['v2.6 update (07/10)', 'v2.6 アップデート（07/10）'],
'好感回饋：好感增減時，NPC 對話泡泡旁會彈出小愛心與增減值；愛心顏色可在「外觀配色」自訂，面板愛心也新增光澤與星塵（越愛越閃）。': ['Affection feedback: when affection changes, a small heart and the amount pop up beside the NPC\'s bubble; heart color is customizable in Theme, and panel hearts now have shine and stardust (the more love, the more sparkle).', '好感度フィードバック：増減時に NPC の吹き出し横へ小さなハートと数値がポップ。ハートの色はテーマで変更でき、パネルのハートにも光沢と星屑を追加（愛が深いほど輝く）。'],
'高光演出：擲出大成功／大失敗、獲得道具、成就達成（揭幕線）、章節收束（落幕分隔線，會永久留在紀錄裡分章）都有專屬演出。': ['Highlight moments: crits and fumbles, item pickups, achievements (reveal underline) and chapter closes (a curtain divider that stays in the log, splitting your story into chapters) each get their own staging.', 'ハイライト演出：クリティカル／ファンブル、アイテム入手、実績達成（アンダーライン）、章の締めくくり（ログに残る幕引きラインで物語を章分け）に専用演出を追加。'],
'HP／SAN 改為細格血條：扣血格子閃爍熄滅、回復逐格亮起並掃過柔光，傷害與回復會跳出像素數字。': ['HP/SAN are now segmented pixel bars: cells blink out on damage, refill one by one with a soft sweep on recovery, and pixel numbers pop for damage and healing.', 'HP／SAN はセル式バーに：ダメージでセルが点滅して消え、回復では一つずつ灯って光が走り、増減のピクセル数字がポップします。'],
'場景切換改翻頁式轉場；AI 回覆後畫面自動帶到最新對話。': ['Scene switching now uses a page-turn transition, and the view auto-scrolls to the latest dialogue after each AI reply.', 'シナリオ切替はページめくり式に。AI の返答後は最新の会話まで自動スクロールします。'],
'首頁標題霓虹化：載入時逐字點燈，待機時偶發故障閃爍。': ['The home title is now a neon sign: characters light up one by one on load, with occasional flickers while idle.', 'ホームタイトルがネオンサインに：起動時に一文字ずつ点灯し、待機中はときどき明滅します。'],
'細節：AI 選項逐顆入場、主要按鈕金屬光澤、判定中像素讀取動畫、低 SAN 時輸入框提示偶爾亂碼、存檔成功右下角落印、NPC 死亡頭像轉灰、對話泡泡尖角方向修正、骰子與情境圖示改用像素符號。': ['Details: options enter one by one, primary buttons gained a metallic shine, a pixel loader during checks, the input placeholder occasionally glitches at low SAN, a save pip in the corner, avatars grey out on NPC death, bubble tails now point the right way, and dice/scene icons use pixel glyphs.', '細部：選択肢の順次登場、主要ボタンのメタリックシャイン、判定中のピクセルローダー、低 SAN 時の入力欄ノイズ、保存成功の隅ランプ、NPC 死亡時のアバターグレー化、吹き出しの尻尾の向き修正、ダイス／シナリオ記号のピクセル化。'],
'v2.5 更新（07/09）': ['v2.5 update (07/09)', 'v2.5 アップデート（07/09）'],
'清單拖曳排序：存檔紀錄、NPC、情境與日記收藏都能按住拖曳調整順序；桌機直接拖頭像或卡片，手機用 ☰ 把手。': ['Drag-to-reorder lists: saves, NPCs, scenarios and diary clips can all be reordered by holding and dragging; on desktop drag the avatar or card directly, on mobile use the ☰ handle.', 'リストのドラッグ並べ替え：データ・NPC・シナリオ・日記の収蔵を長押しドラッグで並べ替えできます。PC はアバターやカードを直接、スマホは ☰ ハンドルで。'],
'面板自由拖動：桌機可拖動狀態面板與遊戲對話介面（抓標題列、角色面板標籤或介面留白處），拖回原位附近會自動吸回。': ['Free panel dragging: on desktop you can drag the status panel and the game dialogue view (grab the title bar, the panel tab, or empty chrome); dragging back near the original spot snaps it home.', 'パネルの自由移動：PC ではステータスパネルと会話画面をドラッグできます（タイトルバー・パネルタブ・余白をつかむ）。元の位置付近に戻すと自動で吸着します。'],
'「角色面板」標籤現在會跟著面板一起移動，不再和面板分離或被其他視窗遮住。': ['The "Panel" tab now moves together with the status panel, no longer separating from it or hiding behind other views.', '「キャラクターパネル」タブはパネルと一緒に動くようになり、分離したり他のウィンドウに隠れたりしません。'],
'v2.4 更新（07/08）': ['v2.4 update (07/08)', 'v2.4 アップデート（07/08）'],
'v2.3 更新': ['v2.3 update', 'v2.3 アップデート'],
'新增「喘息」：遊戲頁可主動擲檢定回復 HP／SAN（有上限、不能連按），用來脫離死亡螺旋。': ['Added "Catch Breath": actively roll on the game screen to restore HP/SAN (capped, no chaining) to escape a death spiral.', '「ひと息」を追加：ゲーム画面で判定して HP／SAN を回復（上限あり・連続不可）、死のスパイラルから抜けます。'],
'恢復道具：劇情中獲得的補給可能帶有回復效果，可在角色面板道具區「使用」補血或理智。': ['Recovery items: story supplies may carry a restore effect; "Use" them in the items area of the panel to restore HP or SAN.', '回復アイテム：物語の補給品が回復効果を持つことがあり、パネルの所持品欄で「使う」と HP や SAN を回復します。'],
'極限模式「最後掙扎」：歸零時會強制一次生死檢定，通過就撐住並獲得幾回合的恢復期護盾，可重複觸發。': ['Extreme "last stand": at zero you’re forced into a life-or-death check; pass to hold on and gain a few turns of recovery shield. Can repeat.', '極限「最後の抵抗」：ゼロで生死判定が強制され、通れば踏みとどまり数ターンの回復シールドを獲得。繰り返し発生します。'],
'新增「角色成長」：達成重大成就可獲得成長點，用來提升屬性或新增擅長領域，稱號依累積成就自動升階。': ['Added "Character Growth": major achievements grant growth points to raise stats or add expertise; your title auto-ranks by total achievements.', '「キャラ成長」を追加：重大な実績で成長ポイントを得て能力値強化や得意分野追加が可能、称号は累積実績で自動昇格。'],
'達成情境「本場目標」會觸發章節收束：寫下收束敘事並給成長點，讓一局能漂亮收尾。': ['Reaching a scenario’s "Scene Goal" triggers a chapter close: a closing narrative plus a growth point, so a run can end well.', 'シナリオの「本場の目標」達成で章の締めくくりが発生：締めの叙述と成長ポイントで、一局を綺麗に終えられます。'],
'低狀態干擾新增更劇烈的第三階，並可在「顯示與輸出設定」切換完整／減弱／關閉。': ['Low-state interference gained a more intense third tier, and can be switched Full / Reduced / Off under "Display & Output".', '低ステート演出により激しい第3段階を追加、「表示と出力設定」でフル／控えめ／オフを切替可能。'],
'生死檢定：賭一把活下去（D20 ≥8）': ['Life-or-Death Check: gamble to survive (D20 ≥8)', '生死判定：賭けて生き延びる（D20 ≥8）'],
'— 瀕死！{reason}——只剩一次生死檢定（D20 ≥8 存活）—': ['— On the brink! {reason} — one Life-or-Death Check left (D20 ≥8 to live) —', '— 瀕死！{reason}——生死判定は一度きり（D20 ≥8 で生存）—'],
'— 恢復期護盾：{reason}被硬撐住（恢復期剩 {n} 回合）—': ['— Recovery shield: {reason} was held off (recovery: {n} turns left) —', '— 回復シールド：{reason}を耐え抜いた（回復残り {n} ターン）—'],
'— 生死檢定失敗：D20 {roll}（需 ≥8），GAME OVER —': ['— Life-or-Death Check failed: D20 {roll} (need ≥8), GAME OVER —', '— 生死判定失敗：D20 {roll}（≥8 必要）、GAME OVER —'],
'— 生死檢定成功：D20 {roll}！撐住了——接下來 3 回合免於死亡，快穩住 SAN／HP —': ['— Life-or-Death Check passed: D20 {roll}! You held on — no death for the next 3 turns, stabilize SAN/HP —', '— 生死判定成功：D20 {roll}！耐えた——今後3ターンは死亡なし、SAN／HPを立て直せ —'],
'HP 歸零': ['HP depleted', 'HPがゼロ'],
'SAN 歸零': ['SAN depleted', 'SANがゼロ'],
'喘息': ['Catch Breath', 'ひと息'],
'使用': ['Use', '使う'],
'初心': ['Novice', '初心'],
'初露鋒芒': ['Promising', '芽が出た'],
'略有歷練': ['Seasoned', 'いくらか熟練'],
'老練': ['Veteran', '老練'],
'資深': ['Senior', 'ベテラン'],
'卓越': ['Distinguished', '卓越'],
'傳奇': ['Legendary', '伝説'],
'可用成長點': ['Growth points', '成長ポイント'],
'累積成就': ['Achievements', '実績'],
'花 1 點提升此屬性': ['Spend 1 point to raise this stat', '1ポイントで能力値を上げる'],
'新擅長領域（最多16字）': ['New expertise (max 16 chars)', '新しい得意分野（16字まで）'],
'確定刪除這個擅長領域？（用成長點新增的不會退還點數）': ['Delete this proficiency? (Growth points spent on it will not be refunded)', 'この得意分野を削除しますか？（成長ポイントで追加した分は返還されません）'],
'擅長領域最多 4 個，請先刪除一個再新增。': ['You can have at most 4 proficiencies; delete one before adding another.', '得意分野は最大 4 つです。先に 1 つ削除してから追加してください。'],
'屬性已達上限：花 2 點兌換成長結晶（該屬性判定 +1）': ['Stat at cap: spend 2 points to forge a Growth Crystal (+1 to this stat\'s checks)', '能力値が上限：2ポイントで成長結晶と交換（この能力の判定 +1）'],
'此屬性的道具加值已達上限 +3': ['Item bonuses for this stat are already at the +3 cap', 'この能力のアイテムボーナスは上限 +3 に達しています'],
'兌換成長結晶（成長點 -2）': ['Forged a Growth Crystal (-2 growth points)', '成長結晶と交換（成長ポイント -2）'],
'確定刪除這個道具？（成長結晶或劇情道具刪除後不會補償）': ['Delete this item? (Growth crystals and story items are not refunded)', 'このアイテムを削除しますか？（成長結晶やストーリーアイテムは補償されません）'],
'新增熟練': ['Add expertise', '得意分野を追加'],
'— 成就達成：{text}（+1 成長點）—': ['— Achievement: {text} (+1 growth point) —', '— 実績達成：{text}（+1 成長ポイント）—'],
'— 成就達成：{text} —': ['— Achievement: {text} —', '— 実績達成：{text} —'],
'我們地獄見（{npc}）': ['See You in Hell ({npc})', '地獄で会おう（{npc}）'],
'與 {npc} 恩斷義絕，地獄見': ['All ties with {npc} are severed. See you in hell.', '{npc}との縁は断たれた。地獄で会おう'],
'跟 {npc} 的距離拉近了一點': ['You feel a little closer to {npc}', '{npc}との距離が少し縮まった'],
'{npc} 對你多了一點好感': ['{npc} likes you a bit more', '{npc}の好感度が少し上がった'],
'跟 {npc} 感情變好了': ['Your bond with {npc} is growing', '{npc}との仲が良くなった'],
'{npc} 開始更信任你了': ['{npc} is starting to trust you more', '{npc}はあなたをより信頼し始めた'],
'跟 {npc} 變得更加親近': ['You and {npc} have grown much closer', '{npc}ともっと親密になった'],
'{npc} 對你抱有深厚情感': ['{npc} holds deep feelings for you', '{npc}はあなたに深い想いを抱いている'],
'跟 {npc} 締結了至深羈絆': ['You and {npc} share an unbreakable bond', '{npc}と深い絆で結ばれた'],
'跟 {npc} 的關係變得有些緊張': ['Things are getting tense with {npc}', '{npc}との関係が少し緊張してきた'],
'{npc} 對你的敵意加深了': ["{npc}'s hostility toward you deepens", '{npc}の敵意が深まった'],
'章節收束': ['Chapter Close', '章の締めくくり'],
'本場目標達成「{text}」': ['Objective complete: "{text}"', '目標達成「{text}」'],
'+1 成長點': ['+1 growth point', '+1 成長ポイント'],
'— 本場目標達成：{text}（章節收束 · +1 成長點）—': ['— Objective complete: {text} (chapter closes · +1 growth point) —', '— 目標達成：{text}（章の締めくくり · +1 成長ポイント）—'],
'— {stat} +1（成長點 -1）—': ['— {stat} +1 (-1 growth point) —', '— {stat} +1（成長ポイント -1）—'],
'— 新增擅長領域：{text}（成長點 -1）—': ['— Added expertise: {text} (-1 growth point) —', '— 得意分野を追加：{text}（成長ポイント -1）—'],
'回復 {kind} {amount}': ['Restore {kind} {amount}', '{kind} を {amount} 回復'],
'— 使用了 {name}：{detail} —': ['— Used {name}: {detail} —', '— {name} を使った：{detail} —'],
'— 喘息穩住身心：{detail}（上限 50%）—': ['— Catch your breath: {detail} (cap 50%) —', '— ひと息ついて立て直す：{detail}（上限50%）—'],
'— 剛喘息過，先做點別的再喘息。—': ['— You just caught your breath; do something else first. —', '— 今ひと息ついたばかり。まず何かしてから。—'],
'— 身心尚穩（HP／SAN 已達 50%），喘息幫助不大。—': ['— Stable enough (HP/SAN >= 50%); resting barely helps. —', '— まだ安定している（HP/SAN 50%以上）。休んでも効果は薄い。—'],
'好難過': ['It hurts so much', 'つらい'],
'好痛': ['It hurts', '痛い'],
'好痛苦': ['So much pain', '苦しい'],
'不要忘記': ['Do not forget', '忘れないで'],
'你記得嗎': ['Do you remember', '覚えてる？'],
'不要丟下它': ['Do not leave it behind', '置いていかないで'],
'回不去了': ['No way back', 'もう戻れない'],
'不是假的': ['It is not fake', '嘘じゃない'],
'還在這裡': ['Still here', 'まだここにいる'],
'別裝作沒看見': ['Do not pretend you did not see', '見なかったふりをしないで'],
'低狀態干擾': ['Low HP/SAN effects', '低HP/SAN演出'],
'完整效果': ['Full', 'フル'],
'減弱效果': ['Reduced', '控えめ'],
'關閉效果': ['Off', 'オフ'],
'冒險日誌裡空白的地方': ['the blank space in the adventure log', '冒険日誌の空白'],
'你剛剛選過的路': ['the path you just chose', 'さっき選んだ道'],
'那些還沒說出口的承諾': ['the promises you never said aloud', 'まだ口にしていない約束'],
'這些回憶也變得不那麼重要了嗎…': ['Do these memories matter less now…', 'この記憶も、もう大事ではなくなったのですか…'],
'你真的還記得自己答應過什麼嗎…': ['Do you really remember what you promised…', '自分が何を約束したか、本当に覚えていますか…'],
'有些約定，不是忘記就能消失。': ['Some promises do not disappear just because you forget them.', '忘れたからといって、消える約束ばかりではありません。'],
'你現在的選擇，真的接得上嗎…': ['Does your choice now really connect to this…', '今の選択は、本当にこれにつながっていますか…'],
'你是想離開它，還是只是忘了它…': ['Are you trying to leave it behind, or did you only forget it…', 'それを置いていきたいのですか、それともただ忘れただけですか…'],
'它還留在這裡。你也還在嗎…': ['It is still here. Are you…', 'それはまだここにあります。あなたも、まだここにいますか…'],
'如果這是真的，你為什麼要往反方向走…': ['If this is true, why are you walking the other way…', 'これが本当なら、なぜ逆へ進むのですか…'],
'你確定要把它留在身後嗎…': ['Are you sure you want to leave it behind…', '本当にそれを置いていくのですか…'],
'那時候的你，也是這樣想的嗎…': ['Did the you back then think this way too…', 'あの時のあなたも、そう考えていましたか…'],
'這段紀錄還相信你。你呢…': ['This record still believes you. Do you…', 'この記録はまだあなたを信じています。あなたは…'],
'你正在保護它，還是在拆掉它…': ['Are you protecting it, or taking it apart…', 'それを守っているのですか、それとも壊しているのですか…'],
'別裝作沒看見。': ['Do not pretend you did not see it.', '見なかったふりをしないで。'],
'它不是自己出現在這裡的。': ['It did not appear here by itself.', 'それは勝手にここへ現れたわけではありません。'],
'你要把這件事也改寫掉嗎…': ['Are you going to rewrite this too…', 'これも書き換えるつもりですか…'],
'如果這不重要，為什麼它還在這裡…': ['If it does not matter, why is it still here…', '大事ではないなら、なぜまだここにあるのですか…'],
'你真的分得清現在和剛才嗎…': ['Can you really tell now apart from a moment ago…', '今とさっきの区別が、本当についていますか…'],
'這一步之後，還回得去嗎…': ['After this step, can you still go back…', 'この一歩のあと、まだ戻れますか…'],
'你明明看見了。': ['You saw it.', 'あなたは確かに見ました。'],
'這不是別人的記憶。': ['This is not someone else’s memory.', 'これは他人の記憶ではありません。'],
'你要假裝它沒有重量嗎…': ['Are you going to pretend it has no weight…', 'それに重さがないふりをするのですか…'],'\u8ddf {npc} \u7684\u8ddd\u96e2\u62c9\u8fd1\u4e86\u4e00\u9ede': ['You feel a little closer to {npc}.', '{npc}\u3068\u306e\u8ddd\u96e2\u304c\u5c11\u3057\u7e2e\u307e\u3063\u305f'],
'{npc} \u5c0d\u4f60\u591a\u4e86\u4e00\u9ede\u597d\u611f': ['{npc} seems to like you a little more.', '{npc}\u306f\u3042\u306a\u305f\u306b\u5c11\u3057\u597d\u610f\u3092\u62b1\u3044\u305f'],
'\u8ddf {npc} \u611f\u60c5\u8b8a\u597d\u4e86': ['Your bond with {npc} has grown warmer.', '{npc}\u3068\u306e\u4ef2\u304c\u6df1\u307e\u3063\u305f'],
'{npc} \u958b\u59cb\u66f4\u4fe1\u4efb\u4f60\u4e86': ['{npc} is beginning to trust you more.', '{npc}\u306f\u3042\u306a\u305f\u3092\u3088\u308a\u4fe1\u983c\u3057\u59cb\u3081\u305f'],
'\u8ddf {npc} \u8b8a\u5f97\u66f4\u52a0\u89aa\u8fd1': ['You have grown much closer with {npc}.', '{npc}\u3068\u3055\u3089\u306b\u89aa\u3057\u304f\u306a\u3063\u305f'],
'{npc} \u5c0d\u4f60\u62b1\u6709\u6df1\u539a\u60c5\u611f': ['{npc} holds deep feelings for you.', '{npc}\u306f\u3042\u306a\u305f\u306b\u6df1\u3044\u60f3\u3044\u3092\u62b1\u3044\u3066\u3044\u308b'],
'\u8ddf {npc} \u7de0\u7d50\u4e86\u81f3\u6df1\u7f88\u7d46': ['You have formed a profound bond with {npc}.', '{npc}\u3068\u6df1\u3044\u7d46\u3067\u7d50\u3070\u308c\u305f'],
'\u8ddf {npc} \u7684\u95dc\u4fc2\u8b8a\u5f97\u6709\u4e9b\u7dca\u5f35': ['Things have grown a little tense with {npc}.', '{npc}\u3068\u306e\u95a2\u4fc2\u304c\u5c11\u3057\u304e\u304f\u3057\u3083\u304f\u3057\u3066\u304d\u305f'],
'{npc} \u5c0d\u4f60\u7684\u6575\u610f\u52a0\u6df1\u4e86': ["{npc}'s hostility toward you has deepened.", '{npc}\u306e\u3042\u306a\u305f\u3078\u306e\u6575\u610f\u304c\u6df1\u307e\u3063\u305f'],

        '角色': ['Character', 'キャラクター'],
        '新角色': ['New Character', '新キャラクター'],
'未知': ['Unknown', '不明'],
'未命名存檔': ['Untitled Save', '無題のデータ'],
'未命名紀錄': ['Untitled Log', '無題の記録'],
'未知時間': ['Unknown time', '時刻不明'],
'第 1 / 1 頁': ['Page 1 / 1', '1 / 1 ページ'],
'日記': ['Diary', '日記'],
'複製': ['Copy', 'コピー'],
'已複製': ['Copied', 'コピーしました'],
'收藏這段': ['Add to Diary', '日記に追加'],
'已收藏 ♥': ['Saved ♥', '保存しました ♥'],
'請先載入存檔': ['Load a save first.', '先にデータを読み込んでください。'],
'收藏失敗，請重試': ['Save failed. Please try again.', '保存に失敗しました。もう一度お試しください。'],
'已選起點 — 點另一則當結尾完成收藏（同一則＝只收那則）': ['Start selected — choose another message as the end for this Diary entry. Same message saves only that one.', '始点を選択しました — 終点にする別の発言を選ぶと日記に保存します。同じ発言ならそれだけ保存します。'],
'幫這段收藏寫一句話（可留空）：': ['Write a note for this Diary entry (optional):', 'この日記に一言メモ（任意）：'],
'刪除目前這則收藏？': ['Delete this saved diary entry?', 'この保存を削除しますか？'],
'這份存檔還沒有收藏。遊戲中右鍵（手機長按）對話 →「收藏這段」，選一段連續對話收起來。': ['This save has no Diary entries yet. In game, right-click a message (long-press on mobile), choose "Add to Diary", then select a continuous range.', 'このデータにはまだ日記がありません。ゲーム中に発言を右クリック（スマホでは長押し）して「日記に追加」を選び、連続した範囲を選択してください。'],
'（點這裡寫一句話）': ['(Click here to write a note)', '（ここをクリックして一言を書く）'],
'點擊編輯一句話': ['Click to edit note', 'クリックして一言を編集'],
'v2.1 更新': ['v2.1 Update', 'v2.1 更新'],
'v2.2 更新': ['v2.2 Update', 'v2.2 更新'],
"▲ 載入更早的對話（還有 {n} 則）": ['▲ Load earlier ({n} more)', '▲ 以前の会話を読み込む（残り {n} 件）'],
'▲ 載入更早的對話': ['▲ Load earlier messages', '▲ 以前の会話を読み込む'],
'保存圖片': ['Save as image', '画像として保存'],
'右鍵（手機長按）可存成圖片': ['Right-click (long-press on mobile) to save as image', '右クリック（スマホは長押し）で画像として保存'],
'圖片元件還在載入，請稍等幾秒再試一次。': ['The image tool is still loading. Please wait a few seconds and try again.', '画像ツールを読み込み中です。数秒待ってからもう一度お試しください。'],
'這一篇日記沒有可存的對話內容。': ['This diary entry has no dialogue to save.', 'この日記には保存できる会話がありません。'],
'產生圖片中…': ['Generating image…', '画像を生成中…'],
'存成圖片失敗：': ['Failed to save image: ', '画像の保存に失敗しました：'],
'日記可存成長圖：在日記翻頁列（1／2）按右鍵、手機長按即可把整篇日記存成圖片；內容過長會自動分頁，且不會把對話或旁白切成兩半。': ['Save Diary as an image: right-click the page switcher (1／2), or long-press on mobile, to save the whole entry as an image; long entries split into multiple images automatically, without cutting any message in half.', '日記を画像として保存：ページ切り替え（1／2）を右クリック（スマホは長押し）すると、その日記全体を画像として保存できます。長い場合は自動的に複数枚に分割され、会話が途中で切れません。'],
'新增低 HP／低 SAN 干擾：狀態進入危機區間時，畫面會出現暗角、顆粒、掃描線、短暫亂碼與狀態訊號，且配色會跟著目前介面主題變化。': ['Added low-HP / low-SAN interference: when survival status enters the crisis range, the screen shows vignette, grain, scan lines, brief text corruption, and status signals, with colors following the current UI theme.', '低HP／低SAN干渉を追加：生存状態が危機域に入ると、画面に暗い縁取り、粒子、走査線、一時的な文字化け、状態シグナルが現れ、配色は現在のUIテーマに連動します。'], '低 SAN 選項會變得不可靠：點選時可能變色並改成 AI 產生的隱藏失控選項，系統會直接送出並進行檢定。': ['Low-SAN options become unreliable: clicking one may change its color, turn into an AI-written hidden loss-of-control option, and immediately submit it with a check.', 'SANが低いと選択肢が不安定になります：クリックした瞬間に色が変わり、AIが生成した非表示の暴走選択肢に書き換わり、その内容が判定つきで送信されることがあります。'], '新增對話右鍵／手機長按選單：可編輯已送出的文字、複製對話，或把片段收藏到日記。': ['Added message right-click / mobile long-press menu: edit sent text, copy dialogue, or add a scene to Diary.', '発言の右クリック／スマホ長押しメニューを追加：送信済みテキストの編集、会話のコピー、場面を日記に保存できます。'],
'日記可收藏連續對話，補一句話備註、翻頁查看，也能刪除單則收藏。': ['Diary can save continuous dialogue, add a short note, flip through entries, and delete individual entries.', '日記では連続した会話を保存し、一言メモを添え、ページ送りで確認し、個別に削除できます。'],
'補齊日記相關中英日介面文字，日期與提示也會跟著語言切換。': ['Added Chinese, English, and Japanese UI text for Diary; dates and prompts now follow the display language.', '日記関連の中英日UI文言を追加し、日付やヒントも表示言語に合わせて切り替わります。'],
'更新內容': ['Update Notes', '更新内容'],
'查看更早的更新紀錄': ['View earlier update history', '以前の更新履歴を見る'],
        'v2.0 更新': ['v2.0 Update', 'v2.0 更新'],
        '新增「關係里程碑標籤」：NPC 好感度達到滿值、關係徹底破裂，或 NPC 死亡時，系統會自動在 Flags 留下里程碑標籤，重大關係節點不再漏掉。': ['Added Relationship Milestone Flags: when an NPC reaches max affection, the relationship fully breaks down, or an NPC dies, the system automatically records a milestone flag, so major relationship moments are no longer missed.', '「関係マイルストーンフラグ」を追加：NPCの好感度が最大に達したとき、関係が完全に決裂したとき、またはNPCが死亡したとき、システムが自動的にマイルストーンフラグを残し、重要な関係の節目が漏れなくなります。'],
        '強化冒險日誌：重要事件更不易漏記；即使 AI 當回合沒特別說明，獲得／失去重要道具、場景移動也會自動補進日誌。': ['Improved the Adventure Log: important events are less likely to be missed; even when the AI does not mention it, gaining or losing key items and location changes are added to the log automatically.', '冒険日誌を強化：重要な出来事が漏れにくくなりました。AIがそのターンで特に触れなくても、重要アイテムの入手や喪失、場所の移動が自動的に日誌へ追加されます。'],
        '模型清單分類：驗證後會把大廠通用優質模型標 ▪ 並排在前面，方便挑選。': ['Model list marks: after verification, premium general models from major providers are marked ▪ and shown first.', 'モデル一覧の表示：認証後、大手の汎用高品質モデルに▪を付けて前方に表示し、選びやすくします。'],
        '輕量模型通常回覆較快、用量較省，適合測試設定或日常遊玩；較大型模型通常更擅長長篇劇情、人物語氣與複雜指令。清單中標 ▪ 的是大廠通用優質模型，會排在前面方便挑選。模型表現與費用可能不同，請以供應商顯示的資訊為準。': ['Lightweight models usually respond faster and use less quota, suitable for testing settings or everyday play; larger models are usually better at long stories, character voice, and complex instructions. The list marks ▪ premium general models from major providers, shown first for easy picking. Model performance and cost may vary; check the provider information.', '軽量モデルは通常、応答が速く使用量も少ないため、設定テストや日常プレイに向いています。大型モデルは長編、口調、複雑な指示を扱いやすい傾向があります。一覧では▪の大手汎用高品質モデルが前方にまとまって表示され、選びやすくなっています。性能や費用は異なる場合があるため、プロバイダー側の表示を確認してください。'],
        '驗證後的模型清單會把大廠通用優質模型（Gemini、Claude、GPT、DeepSeek 等）標上 ▪ 並排在前面，這些模型穩定、擅長長篇與複雜指令。測試設定可先用較快、較省的；長篇或複雜劇情建議選標 ▪ 的模型。模型可在遊戲內隨時切換。': ['After verification the model list marks ▪ premium general models from major providers (Gemini, Claude, GPT, DeepSeek, etc.), which are stable and good at long or complex instructions, and shows them first. Use a faster, cheaper model while testing; pick ▪ models for long or complex stories. Models can be switched anytime in game.', '認証後、モデル一覧は大手の汎用高品質モデル（Gemini、Claude、GPT、DeepSeekなど）に▪を付けて前方に表示します。これらは安定し長編や複雑な指示に強いです。設定を試す間は高速で軽いモデルを使い、長編や複雑な物語には▪のモデルを選んでください。モデルはゲーム内でいつでも切り替えられます。'],
'新增「核心準則」：可設定 AI 每回合必讀、不可違反的鐵則（世界觀或人物設定），角色設定頁與遊戲頁皆可調整、兩邊同步。': ['Added "Core Rules": set inviolable rules the AI reads every turn (world facts or character musts); editable on both the character config page and the game page, kept in sync.', '「コアルール」を追加：AIが毎ターン読み、破れない絶対ルール（世界観やキャラクターの決まり）を設定できます。キャラクター設定ページとゲーム画面の両方で編集でき、同期されます。'],
'新增情境「本場目標」：每個情境可選填目標，DM 會自然朝它推進，但不會硬拉玩家。': ['Added scene "Scene Goal": each scenario can set an optional goal that the DM steers toward naturally, without forcing the player.', 'シナリオに「この場の目標」を追加：各シナリオに任意の目標を設定でき、DMが自然にそこへ導きます（プレイヤーを強制はしません）。'],
'強化錯誤提示：AI 無法回覆時會標出供應商、原因與診斷資訊，更好判斷問題。': ['Improved error messages: when the AI cannot respond, it now shows the provider, the cause, and diagnostic info so problems are easier to identify.', 'エラー表示を強化：AIが応答できないとき、プロバイダー・原因・診断情報を表示し、問題を特定しやすくしました。'],
'2. Google Gemini、OpenRouter 與 Anthropic': ['2. Google Gemini, OpenRouter, and Anthropic', '2. Google Gemini・OpenRouter・Anthropic'],
'2. Gemini、OpenRouter 與 Anthropic': ['2. Gemini, OpenRouter, and Anthropic', '2. Gemini・OpenRouter・Anthropic'],
'選擇 Google Gemini 用 Google AI Studio 的金鑰；選擇 OpenRouter 用 OpenRouter 金鑰（可跨多家模型）；選擇 Anthropic（Claude）用 Anthropic 官方金鑰（直接使用 Claude 模型）。三種金鑰不能互換，可用模型清單會在驗證後載入。': ['For Google Gemini use a Google AI Studio key; for OpenRouter use an OpenRouter key (covers many models); for Anthropic (Claude) use an official Anthropic key (uses Claude models directly). The three keys are not interchangeable, and the available model list loads after verification.', 'Google Gemini は Google AI Studio のキー、OpenRouter は OpenRouter のキー（多数のモデルに対応）、Anthropic（Claude）は Anthropic 公式キー（Claude モデルを直接利用）を使います。3種類のキーに互換性はなく、利用可能なモデル一覧は認証後に読み込まれます。'],
'API Key 是 AI 服務用來辨識使用者與計算用量的金鑰，不是遊戲帳號或遊戲密碼。請向 Google AI Studio、OpenRouter 或 Anthropic Console 申請，並妥善保管；不要把金鑰貼到公開貼文、截圖或傳給其他人。': ['An API key is what an AI service uses to identify the user and meter usage; it is not a game account or password. Apply for one at Google AI Studio, OpenRouter, or Anthropic Console, and keep it safe; do not post it publicly, screenshot it, or share it with others.', 'APIキーはAIサービスが利用者の識別と使用量の計算に使う鍵であり、ゲームのアカウントやパスワードではありません。Google AI Studio・OpenRouter・Anthropic Console で取得し、大切に保管してください。公開投稿やスクリーンショット、他人への共有は避けてください。'],
'API Key 是 AI 服務用來辨識使用者與計算用量的金鑰，不是遊戲帳號或遊戲密碼。請向 Google AI Studio、OpenRouter 或 Anthropic Console 申請，並妥善保管。': ['An API key is what an AI service uses to identify the user and meter usage; it is not a game account or password. Apply for one at Google AI Studio, OpenRouter, or Anthropic Console, and keep it safe.', 'APIキーはAIサービスが利用者の識別と使用量の計算に使う鍵であり、ゲームのアカウントやパスワードではありません。Google AI Studio・OpenRouter・Anthropic Console で取得し、大切に保管してください。'],
'核心準則': ['Core Rules', 'コアルール'],
'AI 每回合必讀、不會遺忘也不可違反的設定。可寫世界觀（例：這世界沒有魔法），或人物鐵律（例：主角必須一直戴著面具）。': ['Rules the AI reads every turn and can never forget or break. Write world rules (e.g., this world has no magic) or character musts (e.g., the protagonist must always wear a mask).', 'AIが毎ターン必ず読み、忘れることも破ることもできない設定。世界観（例：この世界に魔法はない）やキャラクターの絶対ルール（例：主人公は常に仮面をつけている）を書けます。'],
'本場目標（選填，DM 會朝此推進）': ['Scene goal (optional; the DM steers toward it)', 'この場の目標（任意・DMがこれに向けて進めます）'],
'例如：讓玩家在天黑前找到出口。': ['e.g., Have the player find the exit before nightfall.', '例：日が暮れる前にプレイヤーが出口を見つける。'],
'診斷': ['Diagnostics', '診断'],
'{provider} 金鑰無效或沒有使用權限，請回首頁重新貼上並驗證金鑰。': ['{provider} key is invalid or lacks permission. Go back to the home screen, re-enter your key, and verify it.', '{provider} のキーが無効か権限がありません。ホームに戻ってキーを貼り直し、再認証してください。'],
'OpenRouter 餘額不足（可能是 $0 或負值）。請到 openrouter.ai 的 Credits 頁儲值，或改用 Google Gemini。': ['OpenRouter balance is insufficient (possibly $0 or negative). Add credits on the openrouter.ai Credits page, or switch to Google Gemini.', 'OpenRouter の残高が不足しています（$0 またはマイナスの可能性）。openrouter.ai の Credits ページでチャージするか、Google Gemini に切り替えてください。'],
'{provider} 因額度或付款問題拒絕了這次請求，請確認帳戶狀態或改用其他供應商。': ['{provider} rejected this request due to a quota or payment issue. Check your account status or switch providers.', '{provider} が残高または支払いの問題でこのリクエストを拒否しました。アカウント状況を確認するか、別のプロバイダーに切り替えてください。'],
'{provider} 請求太頻繁或額度已達上限，請稍候再試或改用其他模型。': ['{provider} requests are too frequent or the quota is reached. Wait a moment and retry, or switch models.', '{provider} へのリクエストが多すぎるか、上限に達しました。少し待ってから再試行するか、別のモデルに切り替えてください。'],
"送給 AI 的背景資料太長，請先用角色面板的「整理摘要／整理冒險日誌」壓縮後再試。": ["The background sent to the AI is too long. Use \"Organize summary / Organize adventure log\" in the character panel to compress it first.", "AIに送る背景情報が長すぎます。キャラクターパネルの「要約整理／冒険日誌整理」で圧縮してから再試行してください。"],
'AI 回覆格式異常，本次內容沒有套用，請重新發送一次。': ['The AI reply was malformed and was not applied. Please send again.', 'AIの応答形式が不正だったため、今回の内容は適用されませんでした。もう一度送信してください。'],
'{provider} 因內容安全限制沒有回覆，請調整本回合的文字後再試。': ['{provider} returned no reply due to a content safety filter. Adjust this turn’s text and try again.', '{provider} がコンテンツ安全制限のため応答しませんでした。今回の文章を調整して再試行してください。'],
'{provider} 這次沒有回傳內容（常見於安全機制或模型暫時不穩），通常再送一次就會好。': ['{provider} returned no content this time (often a safety filter or a temporary model glitch). Sending again usually works.', '{provider} は今回内容を返しませんでした（安全制限やモデルの一時的な不安定が多いです）。もう一度送ればたいてい成功します。'],
'找不到或無法使用所選模型，請回首頁重新選擇模型（{provider}）。': ['The selected model can’t be found or used. Go back to the home screen and choose a model again ({provider}).', '選択したモデルが見つからないか利用できません。ホームに戻ってモデルを選び直してください（{provider}）。'],
'AI 回覆逾時，請稍後再試；網路較慢時可改用較快的模型。': ['The AI reply timed out. Please retry; on a slow network, try a faster model.', 'AIの応答がタイムアウトしました。再試行してください。回線が遅い場合は速いモデルをお試しください。'],
'{provider} 服務暫時忙碌或過載，請稍後再試。': ['{provider} is temporarily busy or overloaded. Please try again later.', '{provider} のサービスが一時的に混雑または過負荷です。しばらくしてから再試行してください。'],
'連線失敗，請確認網路後再試（手機切換 Wi-Fi／行動網路時容易中斷）。': ['Connection failed. Check your network and retry (switching between Wi-Fi and cellular on mobile can drop the request).', '接続に失敗しました。ネットワークを確認して再試行してください（スマホのWi-Fi／モバイル回線の切り替えで途切れることがあります）。'],
'AI 暫時無法完成這次回覆；請看下方診斷資訊判斷原因，或稍後再試。': ['The AI couldn’t complete this reply. Check the diagnostics below for the cause, or try again later.', 'AIは今回の応答を完了できませんでした。下の診断情報で原因を確認するか、後で再試行してください。'],
'關閉更新內容': ['Close update notes', '更新内容を閉じる'],
'v1.5 更新': ['v1.5 Update', 'v1.5 更新'],
'v1.7 更新': ['v1.7 Update', 'v1.7 更新'],
'v1.8 更新': ['v1.8 Update', 'v1.8 更新'],
'v1.9 更新': ['v1.9 Update', 'v1.9 更新'],
'新增「回覆長度」設定（短／中／長）：可調整 AI 每回合回覆的詳細程度。': ['Added a Reply Length setting (Short/Medium/Long) to adjust how detailed each AI reply is.', '「返信の長さ」設定（短／中／長）を追加し、AIの返信の詳しさを調整できます。'],
'修正部分 Claude 新模型（例如 Sonnet 5）第一則訊息就出現「回覆太長」錯誤的問題。': ['Fixed newer Claude models (e.g. Sonnet 5) erroring with reply-too-long on the very first message.', '一部の新しいClaudeモデル（例：Sonnet 5）で最初のメッセージから「返信が長すぎる」エラーが出る問題を修正しました。'],
'骰點結果會依介面語言顯示（中／英／日）。': ['Dice results now display in the interface language (ZH/EN/JA).', 'ダイス結果がUI言語（中／英／日）で表示されるようになりました。'],
'骰點難度重新平衡、更有成敗張力；狀態旗標（Flags）加入嚴格判定，不再把瑣事都寫成標籤。': ['Rebalanced dice difficulty for real win/lose tension; status Flags now use stricter rules so trivial events are no longer tagged.', 'ダイス難易度を再調整して成否の緊張感を強化。ステータスフラグ（Flags）に厳格な判定を導入し、些細な出来事はタグ化されなくなりました。'],
'擅長領域': ['Proficiencies', '得意分野'],
'依角色的性格 / 背景生成的專長，判定符合時 +2。可刪除不合適的項目。': ['Proficiencies generated from the character personality and background; matching checks get +2. Remove any that do not fit.', 'キャラクターの性格・背景から生成した得意分野。合致する判定は +2。合わないものは削除できます。'],
'角色專屬的魔法': ['Character-only magic', 'このキャラだけの魔法'],
'顯示與輸出設定': ['Display & Output', '表示と出力'],
'回覆長度': ['Reply length', '返信の長さ'],
        '成人模式': ['Mature Mode', '成人モード'],
        '新增「成人模式」開關（預設關）：開啟後放寬性內容過濾並提示 AI 自然演出親密情節，放寬條件為角色皆成年且合意，可隨時關閉。': ['Added a Mature Mode toggle (off by default): when on, it relaxes the sexual-content filter and prompts the AI to portray intimate scenes naturally, on the condition that all characters are adults and consenting, and it can be turned off anytime.', '「成人モード」切替を追加（既定はオフ）：オンにすると性的表現のフィルターを緩和し、AIに親密な場面を自然に演じるよう促します。緩和の条件は登場人物がすべて成人かつ合意の上であることで、いつでもオフにできます。'],
'短（精簡）': ['Short (concise)', '短め（簡潔）'],
'中（適中）': ['Medium', '普通'],
'長（詳細）': ['Long (detailed)', '長め（詳細）'],
'尚未生成擅長領域。': ['No proficiencies yet.', 'まだ得意分野がありません。'],
'請先在「核心性格／背景故事」填寫角色設定，再生成擅長。': ['Fill in the personality / background first, then generate proficiencies.', '先に「性格・背景」を記入してから得意分野を生成してください。'],
'AI 無法生成擅長領域，請稍後再試。': ['The AI could not generate proficiencies. Please try again later.', 'AIが得意分野を生成できませんでした。しばらくしてからお試しください。'],
'目前這個配置已上鎖，無法修改。': ['This preset is locked and cannot be edited.', 'この設定はロックされているため編集できません。'],
'骰點難度改為範圍隨機：同一種難度每次的目標值（DC）會在區間內浮動，不再固定同一個數字，判定更有變化。': ['Dice check difficulty is now randomized within a range: each check\'s target number (DC) varies within a band instead of always being the same fixed value, making rolls feel more dynamic.', 'ダイス判定の難易度が範囲内でランダムに：同じ難易度でも目標値（DC）が一定の幅で変動し、毎回同じ固定値ではなくなったため、判定により変化が出ます。'],
'新增「超簡單」檢定：理所當然的小動作幾乎必過，但骰到大失敗時仍可能意外出包。': ['Added a "Very Easy" check: trivial, obvious actions almost always succeed, but a critical failure can still trip you up.', '「超かんたん」判定を追加：当たり前のささいな行動はほぼ必ず成功しますが、クリティカル失敗が出るとまさかの失敗もあり得ます。'],
'新增 Anthropic Claude Sonnet 5，可直接在模型清單選用。': ['Added Anthropic Claude Sonnet 5, selectable directly from the model list.', 'Anthropic Claude Sonnet 5 を追加し、モデル一覧から直接選べるようになりました。'],
'模型清單自動濾除程式碼、語音、審查等非寫作用途的模型，選單更精簡。': ['The model list now automatically hides non-writing models (code, speech, moderation, etc.) for a cleaner menu.', 'モデル一覧から、コード・音声・モデレーションなど文章作成向けでないモデルを自動的に除外し、メニューをすっきりさせました。'],
'新增「擅長領域」：角色設定頁可依角色性格與背景生成專長並鎖定，判定符合時 +2，讓你怎麼寫角色會影響骰點。': ['Added "Proficiencies": on the character setup page you can generate and lock a list of the character strengths from their personality and background; matching checks get +2, so how you write your character affects the dice.', '「得意分野」を追加：キャラクター設定ページで、性格や背景から得意なことを生成してロックできます。合致する判定は +2 され、キャラクターの書き方がダイスに影響します。'],
'新增 Anthropic（Claude）供應商：首頁可選 Anthropic，貼上官方金鑰即可遊玩。': ['Added an Anthropic (Claude) provider: choose Anthropic on the home screen and paste an official key to play.', 'Anthropic (Claude) プロバイダーを追加：ホームで Anthropic を選び、公式キーを貼り付ければプレイできます。'],
'強化 AI 場景記憶：每個情境會記住目前地點、時間與在場角色，減少切換或多回合後 AI 忘記時空與 NPC 的情況。': ['Improved AI scene memory: each scenario now remembers the current place, time, and who is present, so the AI is less likely to forget the setting and NPCs after scene changes or several turns.', 'AIの場面記憶を強化しました。各シナリオが現在の場所・時間・その場にいるキャラクターを記憶し、場面の切り替えや数ターン後でも設定やNPCを忘れにくくなりました。'],
'角色配置與遊戲紀錄綁定後，角色資料會雙向同步。': ['After a character preset is bound to a game record, character data syncs both ways.', 'キャラクター設定とゲームデータを連携したあと、キャラクターデータが双方向に同期されるようになりました。'],
'遊戲內角色面板與角色配置頁共用好感度等角色設定。': ['The in-game character panel and character preset page share affection and other character settings.', 'ゲーム内のキャラクターパネルとキャラクター設定ページで、好感度などのキャラクター設定を共有します。'],
'匯出記憶紀錄會保存遊戲紀錄、角色配置、情境配置與角色頭像，不包含 API Key。': ['Exported data saves game records, character presets, scenario presets, and character avatars, but does not include API keys.', 'データのエクスポートでは、ゲームデータ、キャラクター設定、シナリオ設定、キャラクター画像が保存されます。APIキーは含まれません。'],
'修正選擇存檔畫面部分文字切換語言時未更新的問題。': ['Fixed some text on the Select Save screen not updating when switching languages.', 'データ選択画面の一部の文言が、言語切り替え時に更新されない問題を修正しました。'],
        '新增純色／自訂背景切換功能，使用自訂背景時面板會自動轉為半透明。': ['Added a solid-color / custom background toggle; panels turn semi-transparent automatically when a custom background is in use.', 'ベタ塗り／カスタム背景の切り替え機能を追加しました。カスタム背景を使用すると、パネルが自動的に半透明になります。'],
'整理中…': ['Organizing…', '整理中…'],
'整理中 {current}/{total}': ['Organizing {current}/{total}', '整理中 {current}/{total}'],
'AI 沒有回傳可用的冒險紀錄。': ['AI did not return a usable adventure log.', 'AIから使用できる冒険記録が返りませんでした。'],
'冒險紀錄內容': ['Adventure log entry', '冒険記録の内容'],
'確定要刪除這筆冒險紀錄嗎？': ['Delete this adventure log entry?', 'この冒険記録を削除しますか？'],
'標記任務失敗': ['Mark Task Failed', 'タスクを失敗にする'],
'取消失敗標記': ['Clear Failed Status', '失敗マークを解除'],
'刪除任務': ['Delete Task', 'タスクを削除'],
'未命名配置': ['Untitled Preset', '無題の設定'],
'測試語氣': ['Test Voice', '口調テスト'],
'生成中...': ['Generating...', '生成中...'],
'沒有取得測試內容。': ['No test line returned.', 'テスト内容を取得できませんでした。'],
'暫時無法測試語氣。': ['Voice test is temporarily unavailable.', '現在、口調テストを利用できません。'],
'認識夥伴': ['Meet This Companion', '仲間を知る'],
'NPC 資料': ['NPC Profile', 'NPC 詳細'],
'新增 NPC': ['Add NPC', 'NPC を追加'],
'編輯 NPC': ['Edit NPC', 'NPC を編集'],
'返回 NPC 預覽': ['Back to NPC Profile', 'NPC 詳細へ戻る'],
'返回玩家預覽': ['Back to Player Profile', 'プレイヤー詳細へ戻る'],
'長按以刪除': ['Hold to delete', '長押しで削除'],
'輸入名稱': ['Enter a name', '名前を入力'],
'刪除 NPC': ['Delete NPC', 'NPC を削除'],
'查看人物資料': ['View Character Details', '人物データを見る'],
'查看玩家資料': ['View Player Details', 'プレイヤーデータを見る'],
'回到人物列表': ['Back to Character List', '人物一覧に戻る'],
'編輯角色設定': ['Edit Character Settings', 'キャラクター設定を編集'],
'先確認人物基底': ['Confirm the Character Foundation', '人物の基礎を確認'],
'只顯示玩家已明確填寫的內容；不知道的部分維持未知，不交給 AI 猜測。': ['Only details explicitly provided by the player are shown. Unknowns stay unknown and are never left for AI to guess.', 'プレイヤーが明記した内容だけを表示します。不明な部分は不明のままにし、AI に推測させません。'],
'人物基底已有玩家提供的內容，可以進入對話驗證；對話本身不會改寫人設。': ['The player has provided enough foundation to test the voice. The conversation itself will not rewrite the character.', 'プレイヤーが人物の基礎を入力済みです。会話で口調を確かめても、人物設定そのものは書き換わりません。'],
'玩家已填寫的人物基底': ['Character details provided by the player', 'プレイヤーが入力した人物の基礎'],
'這次只確認對話方向，不會自動修改人物資料。': ['This only checks the direction of the dialogue. Character data will not be changed automatically.', '今回は会話の方向性だけを確認します。人物データは自動で変更されません。'],
'請先填寫至少一項人物基底，再開始認識夥伴。': ['Fill in at least one character detail before starting.', '人物の基礎項目を1つ以上入力してから始めてください。'],
'和他說一句': ['Say Something to Them', 'ひとこと話しかける'],
'回到角色設定': ['Back to Character Settings', 'キャラクター設定に戻る'],
'我可以相信你嗎？': ['Can I trust you?', 'あなたを信じてもいい？'],
'你現在最在意的是什麼？': ['What matters most to you right now?', '今いちばん気にかけていることは？'],
'如果我現在需要你幫忙，你會答應嗎？': ['If I needed your help right now, would you say yes?', '今あなたの助けが必要だと言ったら、応じてくれる？'],
'你總是這麼安靜嗎？': ['Are you always this quiet?', 'いつもそんなに静かなの？'],
'我想自己跟他說': ['I want to write my own line', '自分の言葉で話しかける'],
'選一句話，或自己輸入想對他說的內容。': ['Choose a line, or enter what you want to say.', 'ひとこと選ぶか、話したい内容を自分で入力してください。'],
'我想說': ['I want to say', '伝えたいこと'],
'輸入想對他說的話': ['Enter what you want to say', '話しかけたい言葉を入力'],
'回到人物基底': ['Back to Character Basics', '人物の基礎に戻る'],
'就說這一句': ['Say This Line', 'この言葉を伝える'],
'正在聽他回答...': ['Listening for their reply...', '返事を待っています...'],
'人物資料不會在等待時被修改。': ['Character data will not change while you wait.', '待機中に人物データが変更されることはありません。'],
'取消等待': ['Cancel Waiting', '待機をやめる'],
'暫時沒有聽到回答': ['No Reply Yet', 'まだ返事がありません'],
'回到上一頁': ['Back to Previous Step', '前の手順に戻る'],
'再試一次': ['Try Again', 'もう一度試す'],
'聽聽看，這像他嗎？': ['Does This Sound Like Them?', 'この返事はこの人物らしい？'],
'你': ['You', 'あなた'],
'像他，先記住這個方向': ['That sounds right; keep this direction', 'この人物らしい。この方向を覚えておく'],
'有點不像': ['It does not quite sound right', '少しこの人物らしくない'],
'再和他說一句': ['Say Something Else', 'もうひとこと話す'],
'哪裡不像他？': ['What Feels Off?', 'どこがこの人物らしくない？'],
'這句提醒只會用於下一次回覆；確認後才可以另選欄位寫入。': ['This note is used only for the next reply. You can choose whether to save it to a field after confirming.', 'このメモは次の返事だけに使われます。確認後に、別の項目へ保存するか選べます。'],
'他不會說得這麼直接。': ['They would not say it so directly.', 'この人物はそんなに直接的には言わない。'],
'動作描寫太多了。': ['There is too much action description.', '動作の描写が多すぎる。'],
'語氣應該再冷一點。': ['The tone should be a little colder.', '口調をもう少し冷たくしてほしい。'],
'我想自己寫提醒': ['I want to write my own note', '自分でメモを書く'],
'補充提醒': ['Adjustment Note', '補足メモ'],
'用你自己的話寫下哪裡不像他': ['Describe what feels wrong in your own words', 'どこが違うのか、自分の言葉で入力'],
'回到他的回答': ['Back to Their Reply', '返事に戻る'],
'帶著提醒再試一次': ['Try Again with This Note', 'メモを反映してもう一度'],
'要保留這句補充嗎？': ['Keep This Adjustment?', 'この補足を残しますか？'],
'只有下方這句玩家補充可以寫入；問題與 AI 回答都不會自動保存。': ['Only the player note below can be saved. The question and AI reply are never saved automatically.', '保存できるのは下のプレイヤーメモだけです。質問とAIの返事は自動保存されません。'],
'選擇寫入欄位': ['Choose a Field', '保存先の項目を選ぶ'],
'選擇寫入方式': ['Choose How to Write It', '保存方法を選ぶ'],
'追加在原本內容後面': ['Append after the current content', '現在の内容の後ろに追加'],
'用這句取代原本內容': ['Replace the current content with this note', '現在の内容をこのメモで置き換える'],
'目前內容': ['Current Content', '現在の内容'],
'尚未填寫': ['Not filled in', '未入力'],
'確認後將變成': ['After Confirmation', '確認後の内容'],
'請先選擇欄位與寫入方式': ['Choose a field and write method first', '保存先と保存方法を選んでください'],
'這次不要寫入': ['Do Not Save This Time', '今回は保存しない'],
'寫入這個欄位': ['Write to This Field', 'この項目に保存'],
'已寫入': ['Saved to', '保存先'],
'方向確認': ['DIRECTION SET', '方向確認'],
'這次聽起來像他': ['This Sounds Like Them', '今回はこの人物らしい'],
'看看情境中的他': ['See Them in a Scenario', 'シナリオの中で確認する'],
'選一個情境，再跟他說一句': ['Choose a Scenario, Then Say Something', 'シナリオを選んで話しかける'],
'只有你明確選中的情境會提供給 AI；切換情境時會保留各自草稿。': ['Only the scenario you explicitly choose is sent to the AI. Each scenario keeps its own draft when you switch.', 'AIに渡されるのは明示的に選んだシナリオだけです。切り替えても各シナリオの下書きは残ります。'],
'在這個情境中，我想說': ['In this scenario, I want to say', 'このシナリオで伝えたいこと'],
'回到確認結果': ['Back to Confirmation', '確認結果に戻る'],
'對他說這句話': ['Say This to Them', 'この言葉を伝える'],
'情境中的他這樣回答': ['Their Reply in This Scenario', 'シナリオの中ではこう答えた'],
'換一個情境': ['Choose Another Scenario', '別のシナリオを選ぶ'],
'找不到目前的 NPC。': ['The current NPC could not be found.', '現在のNPCが見つかりません。'],
'沒有取得回應。': ['No reply was returned.', '返事を取得できませんでした。'],
'暫時無法取得回應，請稍後再試。': ['A reply is temporarily unavailable. Please try again later.', '現在は返事を取得できません。しばらくしてからもう一度お試しください。'],
'匯出目前配置': ['Export Current Preset', '現在の設定をエクスポート'],
'匯入配置': ['Import Preset', '設定をインポート'],
'儲存配置': ['Save Preset', '設定を保存'],
'另存配置': ['Save Preset As', '設定を別名保存'],
'另存配置：請輸入新的配置檔名': ['Save Preset As: enter a new preset name', '設定を別名保存：新しい設定名を入力してください'],
'另存新檔：請輸入新的紀錄檔名': ['Save New File: enter a new save name', '新規データとして保存：新しいデータ名を入力してください'],
'綁定紀錄': ['Bound Save', '紐づくデータ'],
'無': ['None', 'なし'],
'此配置目前綁定「{saveName}」遊戲紀錄。刪除配置會一起刪除此紀錄，確定要刪除嗎？': ['This preset is currently bound to “{saveName}”. Deleting the preset will also delete that save. Continue?', 'この設定は現在「{saveName}」のデータに紐づいています。設定を削除すると、このデータも削除されます。削除しますか？'],
'確定要刪除「{presetName}」這個配置嗎？': ['Delete preset “{presetName}”?', '設定「{presetName}」を削除しますか？'],
'已另存配置「{presetName}」。': ['Saved preset as “{presetName}”.', '設定「{presetName}」として保存しました。'],
'人物': ['Characters', 'キャラクター'],
'人物/情境': ['Characters / Scenario', 'キャラクター／シナリオ'],
'全選': ['Select All', 'すべて選択'],
'找到 {filtered} / {total} 條紀錄': ['Found {filtered} / {total} entries', '見つかった記録：{filtered} / {total} 件'],
'共 {total} 條紀錄；每頁最多 {pageSize} 條': ['{total} entries; up to {pageSize} per page', '全{total}件・1ページ最大{pageSize}件'],
'刪除選取配置': ['Delete Selected Presets', '選択した設定を削除'],
'確定要刪除 {count} 個配置嗎？': ['Delete {count} presets?', '{count} 個の設定を削除しますか？'],
'已刪除 {count} 個配置。': ['Deleted {count} presets.', '{count} 個の設定を削除しました。'],
'目前使用中': ['In Use', '使用中'],
'已上鎖': ['Locked', 'ロック中'],
'綁定': ['Bound to', '紐づけ'],
'請先勾選要刪除的配置。': ['Select presets to delete first.', '削除する設定を先に選択してください。'],
'勾選的配置目前都不能刪除。': ['The selected presets cannot be deleted right now.', '選択した設定は現在削除できません。'],
'請先勾選要刪除的記憶紀錄。': ['Select memory records to delete first.', '削除する記憶記録を先に選択してください。'],
'目前沒有資料可以匯出。': ['There is no data to export.', '書き出せるデータがありません。'],
'已匯出 {count} 份資料。': ['Exported {count} data item(s).', '{count}件のデータを書き出しました。'],
'已匯入 {count} 個配置。': ['Imported {count} preset(s).', '{count}件の設定をインポートしました。'],
'匯入完成：{saveCount} 個存檔、{presetCount} 個角色配置。{skippedText}': ['Import complete: {saveCount} save(s), {presetCount} preset(s). {skippedText}', 'インポート完了：データ{saveCount}件、設定{presetCount}件。{skippedText}'],
'略過 {count} 個重複存檔。': ['Skipped {count} duplicate save(s).', '重複したデータ{count}件をスキップしました。'],
'沒有新增資料，已略過 {count} 個重複存檔。': ['No new data was added. Skipped {count} duplicate save(s).', '新しいデータは追加されませんでした。重複したデータ{count}件をスキップしました。'],
'確定要刪除 {count} 個記憶紀錄嗎？此操作無法復原。': ['Delete {count} memory records? This cannot be undone.', '{count}件の記憶記録を削除しますか？この操作は元に戻せません。'],
'修改記憶紀錄檔名': ['Rename memory record', '記憶記録名を変更'],
'選取此記憶紀錄': ['Select this memory record', 'この記憶記録を選択'],
'配置匯入匯出': ['Preset import/export', '設定のインポート／エクスポート'],
'標記為重要': ['Mark Important', '重要にする'],
'取消重要標記': ['Unmark Important', '重要を解除'],
'保留人物，隨機世界／情境': ['Keep Characters, Randomize Scenario', 'キャラクターを残してシナリオ生成'],
 '人物與世界全部隨機': ['Randomize Everything', 'キャラクターと世界をすべてランダム生成'],
        '保留目前玩家與 NPC 設定，只產生適合這些人物的世界觀與情境。': ['Keep the current player and NPC settings, and generate a world/scenario suited to them.', '現在のプレイヤーとNPC設定を残し、その人物に合う世界観とシナリオだけを生成します。'],
        'AI 會重新產生玩家設定、NPC 與情境；頭像不會傳給 AI，套用前可先預覽。': ['AI regenerates the player, NPCs, and scenario. Images are not sent to AI, and you can preview before applying.', 'AIがプレイヤー、NPC、シナリオを再生成します。画像はAIに送信されず、適用前にプレビューできます。'],
        '暫時無法取得瀏覽器容量資訊；存檔功能仍可正常使用。': ['Storage details are temporarily unavailable; data still works.', '容量情報を一時的に取得できませんが、データ機能は通常どおり使えます。'],
        '目前沒有遊戲存檔；建立存檔後會在這裡提醒備份。': ['No game data yet. Backup reminders appear here after you create one.', 'ゲームデータはまだありません。作成後、ここにバックアップ通知が表示されます。'],
        '尚未記錄到匯出備份；建議現在按下方「匯出」。': ['No export backup has been recorded yet. Use Export below now.', 'エクスポート済みバックアップはまだ記録されていません。下の「エクスポート」を押してください。'],
        '目前沒有可查看的冒險紀錄。': ['No adventure log entries to view.', '表示できる冒険ログはありません。'],
        '請先建立遊戲存檔。': ['Create game data first.', '先にゲームデータを作成してください。'],
        '第 0 / 0 頁': ['Page 0 / 0', '0 / 0 ページ'],
        '沒有符合搜尋條件的紀錄。': ['No entries match your search.', '検索条件に一致する記録はありません。'],
        '故事剛開始，目前尚無重大事件發生。': ['The story has just begun. No major events have happened yet.', '物語は始まったばかりで、重大な出来事はまだ起きていません。'],
        '旅途筆記': ['Journey Notes', '旅ノート'],
        'API說明': ['API', 'API説明'],
        '遊戲玩法': ['Guide', '遊び方'],
        '角色配置': ['Characters', 'キャラクター'],
        '存檔': ['Data', 'データ'],
        '語言切換': ['Language', '言語切替'],
        'API 說明': ['API Guide', 'API説明'],
        '這個遊戲會用你的 API Key 呼叫 AI。請先選擇服務商、貼上對應金鑰並完成驗證；金鑰不會被放進遊戲備份。': ['This game calls AI with your API key. Choose a provider, paste the matching key, and verify it; keys are not included in game backups.', 'このゲームはあなたのAPIキーでAIを呼び出します。サービスを選び、対応するキーを貼り付けて認証してください。キーはゲームのバックアップに含まれません。'],
        '1. API 金鑰': ['1. API Key', '1. APIキー'],
        '輕量模型通常回覆較快、用量較省，適合測試設定或日常遊玩；較大型模型通常更擅長長篇劇情、人物語氣與複雜指令。': ['Lightweight models are usually faster and cheaper; larger models often handle long stories, character voices, and complex instructions better.', '軽量モデルは高速で使用量を抑えやすく、大型モデルは長編、口調、複雑な指示に向く傾向があります。'],
        '4. 金鑰保存': ['4. Key Storage', '4. キーの保存'],
        '未開啟「在這台裝置保留金鑰」時，金鑰只在目前頁面使用。共用裝置請勿開啟保存功能；匯出備份不包含 API Key。': ['When “Keep key on this device” is off, the key is used only for this page session. Do not enable it on shared devices; exported backups do not include API keys.', '「この端末にキーを保存」をオフにすると、キーは現在のページだけで使用されます。共有端末では有効にしないでください。エクスポートにはAPIキーは含まれません。'],
        '5. 驗證失敗時': ['5. If Verification Fails', '5. 認証に失敗したとき'],
        '請先確認服務商與金鑰來源一致，再檢查金鑰是否完整貼上、是否有多餘空白、帳號是否已開通 API 權限。模型清單會依帳號與服務狀態變動。': ['First confirm that the provider matches the key source, then check that the key was pasted completely, has no extra spaces, and that the account has API access enabled. Model lists can change by account and service status.', 'まずサービス提供元とキーの発行元が一致しているか確認し、キーが完全に貼り付けられているか、余分な空白がないか、アカウントでAPI権限が有効か確認してください。モデル一覧はアカウントやサービス状態で変わることがあります。'],
        '6. 使用量與隱私': ['6. Usage & Privacy', '6. 使用量とプライバシー'],
        '遊戲會把劇情上下文送到你選擇的 AI 服務商，用量與費用由該服務商計算。匯出遊戲備份不會包含 API Key；換裝置後需要重新驗證。': ['The game sends story context to the AI provider you choose. Usage and cost are calculated by that provider. Exported backups do not include the API key; verify again after switching devices.', 'ゲームは選択したAIサービスへ物語の文脈を送信します。使用量と費用はそのサービス側で計算されます。エクスポートしたバックアップにAPIキーは含まれません。端末を変えた場合は再認証が必要です。'],
        '7. 模型建議': ['7. Model Suggestions', '7. モデルのおすすめ'],
'角色與情境的修改會保留，返回首頁時自動儲存目前配置。': ['Character and scenario changes are kept, and the current preset is saved automatically when you return home.', 'キャラクターとシナリオの変更は保持され、ホームへ戻ると現在の設定が自動保存されます。'],
'調整頭像': ['Adjust Avatar', 'アバター調整'],
        '拖曳移動；手機可雙指縮放': ['Drag to move; pinch to zoom on mobile.', 'ドラッグで移動、スマホではピンチで拡大できます。'],
        '確認': ['Confirm', '確認'], '取消': ['Cancel', 'キャンセル'],
'🗺️ 發現新情境 / 切換空間': ['🗺️ New Scenario / Change Location', '🗺️ 新しいシナリオ／場所の切替'],
'新情境名稱 (如: 某人的夢境)': ['Scenario name (e.g. Someone’s Dream)', 'シナリオ名（例：誰かの夢）'],
'例如：切回此情境時視為夢醒。': ['Example: When returning to this scenario, treat it as waking from a dream.', '例：このシナリオへ戻る時、夢から覚めた扱いにする。'],
        '環境法則與世界觀': ['World Rules & Setting', '世界観と環境ルール'],
        'NPC 們在此的身分/狀態': ['NPC roles/status here', 'ここでのNPCの役割／状態'],
        '玩家專屬身分': ['Player role', 'プレイヤーの役割'],
        '轉場規則（選填）': ['Transition rules (optional)', '場面転換ルール（任意）'],
        '確認建立並傳送': ['Create and Send', '作成して送信'],
        '已自動儲存': ['Auto-saved', '自動保存済み'],
        '儲存並返回': ['Save & Return', '保存して戻る'], '儲存': ['Save', '保存'],
        '狀態': ['Status', 'ステータス'], '紀錄': ['Log', '記録'], '設定': ['Settings', '設定'], '詳細': ['Details', '詳細'], '系統': ['System', 'システム'],
        '判定加值總覽': ['Check modifiers', '判定ボーナス一覧'], '擲骰時自動計入': ['auto-applied to rolls', 'ダイス時に自動適用'], '判定符合時另 +2': ['+2 when relevant', '該当判定で +2'],
        '情境': ['Scenario', 'シナリオ'], '當前': ['Current', '現在'], 'NPC 好感摘要': ['NPC Affection', 'NPC好感度'], '尚未設定 NPC。': ['No NPCs yet.', 'NPCはまだいません。'],
        '狀態旗標 / Flags': ['Status Flags', '状態フラグ'],
        '加入': ['Add', '追加'], '玩家道具': ['Player Items', 'プレイヤー所持品'],
        '介面語言': ['Display Language', '表示言語'], '輸出語言': ['Output Language', '出力言語'], '繁體中文': ['Traditional Chinese', '繁体字（台湾）'],
        '日文台詞 + 繁中翻譯': ['Japanese dialogue + Traditional Chinese translation', '日本語台詞＋繁体字訳'],
        '英文台詞 + 繁中翻譯': ['English dialogue + Traditional Chinese translation', '英語台詞＋繁体字訳'],
        '自動依玩家語言': ['Auto-detect player language', 'プレイヤー言語を自動判定'],
        '詳細設定': ['Detailed settings', '詳細設定'],
        '玩家細節': ['Player Details', 'プレイヤー詳細'], '角色動態': ['Live Character Status', 'キャラクターの動的状態'],
        '重要紀錄': ['Important Notes', '重要記録'], '尚未設定': ['Not set', '未設定'],
        '玩家六圍屬性': ['Player attributes', 'プレイヤー能力値'],
        '體格': ['Build', '体格'], '語氣': ['Tone', '口調'],
        '喜好': ['Likes', '好きなもの'], '厭惡': ['Dislikes', '嫌いなもの'],
        '外貌與穿搭': ['Appearance & Outfit', '外見と服装'],
        '核心性格與背景': ['Core Personality & Background', '性格と背景'],
        '情緒': ['Mood', '気分'], '態度': ['Attitude', '態度'], '目標': ['Goal', '目標'],
        '全部 NPC 記憶追加': ['All NPC memory updates', '全NPCの記憶追加'],
        '暫停追加': ['Pause updates', '追加を一時停止'], '恢復追加': ['Resume updates', '追加を再開'],
        '管理': ['Manage', '管理'], '檔案索引': ['File index', 'ファイル索引'],
        '尚未設定情境。': ['No scenarios yet.', 'シナリオはまだ設定されていません。'],
        'NPC 身分／狀態': ['NPC Roles / Status', 'NPCの身分／状態'],
        '玩家身分／狀態': ['Player Role / Status', 'プレイヤーの身分／状態'],
        '本場目標': ['Scene Goal', 'この場面の目標'], '轉場規則': ['Transition Rules', '場面転換ルール'],
        '＋ 新增 NPC': ['+ Add NPC', '＋ NPCを追加'],
        '與外部角色配置逐項對應，保存時仍維持六個獨立欄位。': ['Matches the external character setup field by field; all six fields remain separate when saved.', '外部のキャラクター設定と項目ごとに対応し、保存時も6項目を個別に保持します。'],
        '角色設定與角色動態分開保存。': ['Character settings and live status are saved separately.', 'キャラクター設定と動的状態は別々に保存されます。'],
        '與外部情境配置逐項對應；本場目標與轉場規則仍分開保存。': ['Matches the external scenario setup field by field; the scene goal and transition rules remain separate.', '外部のシナリオ設定と項目ごとに対応し、この場面の目標と場面転換ルールは別々に保存されます。'],
        '背景有新的角色動態，完成時將安全合併。': ['Character status changed in the background. Your edits will be merged safely when done.', 'バックグラウンドでキャラクター状態が更新されました。完了時に安全に統合します。'],
        '情境空間管理': ['Manage Scenes', 'シナリオ管理'],
        '角色名稱': ['Character Name', 'キャラクター名'], '目前好感度': ['Current Affection', '現在の好感度'], '目前好感度（死亡後停止）': ['Current Affection (locked after death)', '現在の好感度（死亡後は固定）'],
        '已死亡': ['Deceased', '死亡'], '已死亡・復活失敗': ['Deceased · Revival Failed', '死亡・復活失敗'],
        '動態狀態': ['Dynamic Status', '動的ステータス'], '當前情緒': ['Current Mood', '現在の気分'],
        '身體／外觀狀態': ['Physical / Appearance', '身体／外見の状態'], '此刻對玩家／隊伍的個人態度': ['Current Attitude to Player / Party', 'プレイヤー／仲間への現在の態度'],
        '當前目標': ['Current Goal', '現在の目標'], '角色專屬約定／秘密（完整保留；每行一個短標題）': ['Character Promises / Secrets (one short title per line)', 'キャラクター固有の約束／秘密（1行に短い見出し1件）'],
        'AI 重要紀錄追加已暫停；仍可手動修改': ['Automatic memory updates are paused; manual edits are still available.', '重要記録の自動追加は一時停止中です。手動編集は可能です。'],
        '使用整理鍵時AI會統合重複的紀錄。': ['When you use Organize, the AI merges duplicate records.', '「整理」ボタンを使うと、AIが重複した記録を統合します。'],
        '摘要內容': ['Summary', 'サマリー'],
        '重點／任務／關係': ['Highlights / Tasks / Relationships', '重要事項／タスク／関係'],
        '所有事件紀錄': ['All event entries', 'すべてのイベント記録'],
        '整理摘要': ['Organize Summary', 'サマリーを整理'],
        '整理': ['Organize', '整理'], '還原': ['Undo', '元に戻す'], '最新': ['Latest', '最新'],
        '重點劇情': ['Story Highlights', '重要イベント'],
        '用 3～8 條保留目前劇情主線、最近重大轉折與當前場景狀況。': ['Keep 3–8 points covering the main plot, recent turning points, and current scene.', '現在の本筋、直近の転機、現在の場面を3～8項目で残します。'],
        '任務清單': ['Tasks', 'タスク'],
        '整體角色關係圖': ['Relationships', '関係図'],
        'API 使用追蹤': ['API Usage', 'API使用量'],
        '只儲存在這台裝置目前使用的瀏覽器設定檔，不會隨備份匯出或匯入；清除瀏覽器或設備資料時會一併刪除。': ['Stored only in the current browser profile on this device. It is not exported or imported with backups; clearing browser or device data deletes it.', 'この端末で現在使用中のブラウザプロファイルにのみ保存されます。バックアップのエクスポート／インポートには含まれず、ブラウザまたは端末のデータを消去すると一緒に削除されます。'],
        '遊戲玩法與系統指南': ['Game Guide', 'ゲームガイド'],
        '第一次玩，從這裡開始': ['First time? Start here', '初めての方はこちら'],
        '我瞭解了': ['Got it', 'わかりました'],
 'API 金鑰與模型指南': ['API Key & Model Guide', 'APIキーとモデルガイド'],
 '開始前先知道這些': ['Before You Begin', '始める前に'],
 '本遊戲需要使用你自己的 API Key 才能呼叫 AI。請先在首頁選擇供應商、貼上對應金鑰並完成驗證；金鑰不會包含在遊戲備份中，共用裝置也不建議開啟保存功能。': ['This game needs your own API key to call AI. Choose a provider on the home page, paste the matching key, and verify it. The key is not included in game backups, and saving it is not recommended on shared devices.', 'このゲームでAIを呼び出すには、自分のAPIキーが必要です。ホームでプロバイダーを選び、対応するキーを貼り付けて認証してください。キーはゲームのバックアップに含まれず、共有端末での保存も推奨しません。'],
 '1. API Key 是什麼？': ['1. What Is an API Key?', '1. APIキーとは？'],
 '3. 模型怎麼選？': ['3. How Should I Choose a Model?', '3. モデルの選び方'],
 '4. 金鑰會保存在哪裡？': ['4. Where Is the Key Saved?', '4. キーはどこに保存されますか？'],
 '未開啟「在這台裝置保留金鑰」時，金鑰只在目前頁面使用，重新開啟後需要再次輸入；開啟後才會保存在這台裝置的瀏覽器。匯出備份不包含 API Key，因此在新裝置匯入遊戲資料後仍需重新驗證。': ['If “Keep key on this device” is off, the key is used only on the current page and must be entered again after reopening. It is saved in this device browser only when that option is enabled. Exported backups do not include the API key, so you must verify again after importing game data on a new device.', '「この端末にキーを保存」をオフにしている場合、キーは現在のページでのみ使用され、再度開いたときは入力し直す必要があります。オンにした場合だけ、この端末のブラウザに保存されます。エクスポートしたバックアップにAPIキーは含まれないため、新しい端末でゲームデータをインポートした後も再認証が必要です。'],
 '5. 哪些資料會傳給 AI？': ['5. What Data Is Sent to AI?', '5. AIに送信されるデータ'],
 '為了產生回覆，角色設定、目前情境、必要的劇情摘要與近期對話會送往所選供應商。角色照片與完整本機存檔不會隨一般對話請求上傳；照片與遊戲進度主要保存在目前裝置。': ['To generate responses, character settings, the current scenario, necessary story summaries, and recent dialogue are sent to the selected provider. Character images and full local saves are not uploaded with normal chat requests; images and game progress are mainly stored on the current device.', '返答を生成するため、キャラクター設定、現在のシナリオ、必要なストーリー要約、直近の会話が選択したプロバイダーへ送信されます。キャラクター画像や完全なローカルデータは、通常の会話リクエストではアップロードされません。画像とゲーム進行は主に現在の端末に保存されます。'],
 '6. 驗證或回覆失敗怎麼辦？': ['6. What If Verification or Replies Fail?', '6. 認証や応答に失敗したら'],
 '請依序確認供應商是否選對、金鑰是否完整、帳戶額度與模型權限是否有效，以及網路是否正常。若只有特定模型失敗，可以改選其他模型；等待過久時可按「取消等待」，未完成的輸入會盡量放回輸入框。': ['Check whether the provider is correct, the key is complete, the account quota and model permissions are valid, and the network is working. If only one model fails, choose another model. If the wait is too long, press “Cancel Waiting”; unfinished input will be restored to the input box when possible.', 'プロバイダーが正しいか、キーが完全か、アカウントの残高とモデル権限が有効か、ネットワークが正常かを順番に確認してください。特定のモデルだけ失敗する場合は、別のモデルを選んでください。待ち時間が長すぎる場合は「待機をキャンセル」を押してください。未完了の入力は可能な限り入力欄に戻されます。'],
 '在這台裝置保留金鑰': ['Keep key on this device', 'この端末にキーを保存'],
        '未開啟時只在本次頁面使用；共用裝置請勿開啟。': ['When off, the key is used only for this page session. Do not enable on shared devices.', 'オフの場合は現在のページだけで使用します。共有端末では有効にしないでください。'],
        '驗證金鑰': ['Verify', '確認'], '驗證中...': ['Verifying…', '確認中…'],
        '開始前請先準備 API 金鑰': ['API Key Required', 'APIキーが必要です'],
        '請選擇 Google Gemini 或 OpenRouter，貼上對應的 API Key 並完成驗證。金鑰不會包含在匯出備份中；共用裝置請勿開啟保存功能。': ['Choose Google Gemini or OpenRouter, paste the matching API key, and verify it. Keys are excluded from exports; do not save them on shared devices.', 'Google GeminiまたはOpenRouterを選び、対応するAPIキーを貼り付けて認証します。キーはバックアップに含まれません。共有端末では保存しないでください。'],
        '查看 API 詳細說明與模型選擇': ['API & Model Help', 'API・モデルのヘルプ'],
        '驗證成功。請選擇大腦核心：': ['Verified. Choose a model:', '確認完了。モデルを選択：'],
        '劇本創角': ['Character Setup', 'キャラクター'], '進入存檔選單': ['Saves', 'データ'],
        '冒險日誌': ['Adventure Log', '冒険日誌'], '閱讀遊戲玩法與系統指南': ['Game Guide', 'ゲームガイド'],
        '清除設備所有資料': ['Delete Local Data', 'ローカルデータを削除'],
        '外觀配色': ['Theme', 'テーマ'], '背景': ['Background', '背景'], '紙張': ['Paper', '用紙'], '面板': ['Panel', 'パネル'],
        '線與字': ['Text & Lines', '文字と線'], '重點': ['Accent', 'アクセント'], '對話': ['Dialogue', '会話'], '愛心': ['Heart', 'ハート'], '恢復預設': ['Reset', 'リセット'],
        '背景樣式': ['Background', '背景'], '純色': ['Solid', '単色'], '圖片': ['Image', '画像'], '上傳背景圖': ['Upload Image', '画像をアップロード'], '清除背景圖': ['Clear Image', '画像をクリア'],
        '角色設定': ['Characters', 'キャラクター設定'], '情境設定': ['Scenarios', 'シナリオ設定'], '遊戲設定': ['Game', 'ゲーム設定'],
        '玩家': ['Player', 'プレイヤー'], '登場 NPC': ['NPCs', '登場NPC'], '目前配置': ['Current Preset', '現在の設定'],
 '＋ 新增': ['＋ Add', '＋ 追加'], '配置檔案名稱': ['Preset Name', '設定名'], 'AI 隨機生成': ['AI Generator', 'AI生成'],
        '保留人物，隨機情境': ['Randomize Scenario', 'シナリオのみ生成'],
        '人物與情境全部隨機': ['Randomize All', 'すべてランダム生成'],
        '遊戲難度': ['Difficulty', '難易度'], '標準模式': ['Standard', '標準'], '困難模式': ['Hard', 'ハード'], '極限模式': ['Nightmare', 'ナイトメア'],
        '困難模式：檢定 DC +2，NPC 每次死亡只有一次復活檢定。極限模式：檢定 DC +3，歸零會觸發「最後掙扎」，生死檢定 D20 ≥ 8 才能存活；NPC 死亡後無法復活。': ['Hard: checks DC +2; each NPC death gets one revival check. Nightmare: checks DC +3; reaching zero triggers a last stand, and you survive on a D20 roll of 8 or higher; NPC death is permanent.', 'ハード：判定DC+2、NPC死亡ごとに復活判定は1回。ナイトメア：判定DC+3、ゼロになると「最後の抵抗」が発生し、生死判定でD20が8以上なら生存。NPCは死亡後に復活できません。'],
        '困難模式：檢定 DC +2，NPC 每次死亡只有一次復活檢定，失敗後永久死亡。極限模式：檢定 DC +3，歸零會觸發「最後掙扎」，生死檢定 D20 ≥ 8 才能存活；NPC 死亡後無法復活。': ['Hard: checks DC +2; each NPC death gets one revival check, and failure is permanent. Nightmare: checks DC +3; reaching zero triggers a last stand, and you survive on a D20 roll of 8 or higher; NPC death is permanent.', 'ハード：判定DC+2、NPC死亡ごとに復活判定は1回で、失敗すると永続死亡。ナイトメア：判定DC+3、ゼロになると「最後の抵抗」が発生し、生死判定でD20が8以上なら生存。NPCは死亡後に復活できません。'],
        '清空欄位': ['Clear', 'クリア'], '刪除配置': ['Delete Preset', '設定を削除'],
        '返回': ['Back', '戻る'], '新增': ['Add', '追加'], '玩家自己設定': ['Player', 'プレイヤー'],
        '點擊更換頭像': ['Change Avatar', '画像を変更'], '玩家名稱': ['Player Name', 'プレイヤー名'],
        '基礎六圍屬性': ['Attributes', '能力値'], '⚄ 隨機骰點 (4d6)': ['⚄ Roll Stats', '⚄ 能力値を振る'],
        '💀 找守墓人洗點': ['💀 Respec', '💀 振り直す'],
        'STR 力量': ['STR Strength', 'STR 筋力'], 'DEX 敏捷': ['DEX Dexterity', 'DEX 敏捷'], 'CON 體質': ['CON Constitution', 'CON 体質'],
        'INT 智力': ['INT Intelligence', 'INT 知力'], 'WIS 感知': ['WIS Wisdom', 'WIS 感知'], 'CHA 魅力': ['CHA Charisma', 'CHA 魅力'],
        '詳細人物設定': ['Character Details', 'キャラクター詳細'], '核心性格／背景故事': ['Core Personality / Background', '性格／背景'], '年齡／身高／體型': ['Age / Height / Build', '年齢／身長／体格'],
        '說話習慣／語氣': ['Speech Style / Tone', '話し方／口調'], '喜歡的事物': ['Likes', '好きなもの'], '討厭的事物': ['Dislikes', '嫌いなもの'],
        '外貌特徵／常見穿搭': ['Appearance / Usual Outfit', '外見／普段の服装'], '核心性格／背景故事 (專長等)': ['Core Personality / Background', '性格／背景（特技など）'],
        '登場 NPC 列表': ['NPC List', '登場NPC一覧'], '+ 新增 NPC': ['+ Add NPC', '+ NPC追加'], '動態情境列表': ['Scenario List', 'シナリオ一覧'],
        'NPC 名稱': ['NPC Name', 'NPC名'], '開局好感': ['Starting Affection', '初期好感度'], 'NPC:': ['NPC:', 'NPC：'], '情境:': ['Scenario:', 'シナリオ：'],
        '情境名稱': ['Scenario Name', 'シナリオ名'], '該情境下的物理法則與世界觀': ['World Rules & Setting', 'このシナリオの世界観とルール'],
        'NPC 們在此情境下的總體身分/狀態': ['NPC Roles / Status', 'このシナリオでのNPCの役割／状態'], '玩家在此的專屬身份/狀態': ['Player Role / Status', 'このシナリオでのプレイヤーの役割／状態'],
        '玩家在此的身分/狀態': ['Player Role / Status', 'プレイヤーの役割／状態'], '新增情境': ['Add Scenario', 'シナリオ追加'], '建立新的世界或場景': ['Create a new world or scene', '新しい世界や場面を作成'],
'+ 新增情境': ['+ Add Scenario', '+ シナリオ追加'], '儲存變更': ['Save', '保存'], '另存新檔': ['Save New File', '新規データとして保存'], '返回選單': ['Back to Menu', 'メニューへ戻る'],
        '隨機生成': ['Randomize', 'ランダム生成'], '偏好關鍵字（可留空，AI 會自由發揮）': ['Preferences (optional)', '希望キーワード（任意）'],
        '開始生成': ['Generate', '生成'], '生成中…': ['Generating…', '生成中…'], '重新生成': ['Regenerate', '再生成'],
        '套用到表單': ['Apply', '適用'], 'AI 正在建立設定…': ['Creating preset…', '設定を作成中…'],
        '選擇記憶紀錄': ['Select Save', 'データを選択'], '本機資料狀態': ['Storage', 'ストレージ'], '重新計算': ['Refresh', '更新'],
        '今日呼叫': ['Today', '今日の呼び出し'], '本月呼叫': ['This Month', '今月の呼び出し'], 'JSON 修復': ['JSON Repairs', 'JSON修復'], '總呼叫': ['Total', '合計'],
        '模型使用次數': ['Model Usage', 'モデル使用回数'], '尚未有模型使用紀錄。': ['No model usage yet.', 'モデル使用履歴はまだありません。'],
        '尚未選擇': ['Not selected', '未選択'], '尚未使用': ['Not used yet', '未使用'], '實際費用仍以 OpenRouter / Google 後台為準。': ['Check OpenRouter / Google for actual costs.', '実際の料金はOpenRouter／Googleで確認してください。'], '重設統計': ['Reset Stats', '統計をリセット'],
        '正在計算瀏覽器儲存空間…': ['Calculating storage…', '容量を計算中…'], '尚未確認備份狀態。': ['Backup not checked.', 'バックアップ未確認'],
        '創建新紀錄': ['New Save', '新規データ'], '匯出': ['Export', 'エクスポート'], '匯入': ['Import', 'インポート'], '返回大廳': ['Home', 'ホーム'],
        '跳到最新': ['Latest', '最新へ'],
        '只看★': ['★ Only', '★のみ'],
        '＋ 新增情境': ['+ New Scenario', '＋ 新シナリオ'], '模型': ['Model', 'モデル'],
        '行動': ['Action', '行動'], '旁白': ['Narrator', 'ナレーター'], '擲骰': ['Roll', 'ダイス'],
        '所有紀錄都已標記為重要（★），沒有需要 AI 整理的內容。': ['Every entry is starred as important, so there is nothing for the AI to organize.', 'すべての記録が重要（★）としてマークされているため、AIが整理できる内容はありません。'],
        '本機已有內容完全相同的配置「{presetName}」。仍要另外建立一份匯入副本嗎？': ['A preset with identical content, "{presetName}", already exists on this device. Create another imported copy anyway?', '同じ内容の設定「{presetName}」がすでにこの端末にあります。それでもインポート用の複製を作成しますか？'],
        '上一頁': ['Previous', '前へ'], '下一頁': ['Next', '次へ'], '刪除此筆': ['Delete Entry', 'この記録を削除'],
        '角色面板': ['Character', 'キャラクター'], '離開': ['Exit', '終了'],
        '神': ['Creator', '神'], '核心切換': ['Model', 'モデル'],
        '遊戲引擎 (DM)': ['Game Engine (GM)', 'ゲームエンジン (GM)'], '正在進行判定與演算...': ['Processing…', '処理中…'],
        '取消等待': ['Cancel', 'キャンセル'], '⚄ 擲骰': ['⚄ Roll', '⚄ ダイス'], '發送': ['Send', '送信'],
        '刪除': ['Delete', '削除'], '編輯': ['Edit', '編集'], '完成': ['Done', '完了'], '收起': ['Collapse', '閉じる'],
        '尚未解鎖任何標籤...': ['No flags unlocked yet…', 'まだフラグはありません…'], '背包空空如也...': ['Inventory is empty…', '所持品は空です…'],
        '目前沒有任務。接到新委託時，會自動加在這裡。': ['No tasks yet. New tasks appear here automatically.', 'タスクはまだありません。新しい依頼は自動で追加されます。'],
        '目前沒有任何存檔紀錄。': ['No saves yet.', 'データデータはありません。'], '目前沒有存檔': ['No saves', 'データなし'],
        '— 遊戲紀錄已載入 —': ['— Save Loaded —', '— データを読み込みました —'],
        '遊戲紀錄已載入': ['Save Loaded', 'データを読み込みました'],
        '輔助旁白': ['Narrator', 'ナレーター'], '創作者指令': ['Creator Instruction', '作者指示'],
        '引擎 (DM)': ['Engine (GM)', 'エンジン (GM)'], '判定引擎': ['Check Engine', '判定エンジン'], '判定': ['Check', '判定'],
        '強行': ['Force', '力尽く'], '身手': ['Agility', '身のこなし'], '硬撐': ['Endure', '踏ん張り'],
        '調查': ['Investigate', '調査'], '觀察': ['Observe', '観察'], '交涉': ['Negotiate', '交渉'],
        '自由行動': ['Free action', '自由行動'], '★熟練': ['★ Proficient', '★得意'],
        '超簡單': ['Trivial', '超簡単'], '簡單': ['Easy', '簡単'], '普通': ['Normal', '普通'],
        '困難': ['Hard', '困難'], '極難': ['Extreme', '極難'],
        '此情境/支線尚無對話。請輸入動作，或讓 AI 生成開場': ['No dialogue in this scenario yet. Enter an action or let AI generate an opening.', 'このシナリオにはまだ会話がありません。行動を入力するか、AIに導入を生成させてください。'],
        '⚄ 讓 AI 根據「情境設定」隨機生成開場事件': ['⚄ Generate an Opening from the Scenario', '⚄ シナリオ設定から導入を生成'],
        '✦ 第一次跑團？從引導教學開始': ['✦ First session? Start with the guided tutorial', '✦ 初セッション？ガイド付きチュートリアルから'],
        '新手教學結束，祝旅途愉快！': ['Tutorial complete. Enjoy the journey!', 'チュートリアル終了。良い旅を！'],
        '新手教學進行中': ['Tutorial in progress', 'チュートリアル進行中'],
        '新手教學完成': ['Tutorial complete', 'チュートリアル完了'],
        '同時刪除 {count} 個不再使用的專屬配置嗎？': ['Also delete {count} dedicated presets that are no longer in use?', '使われなくなった専用設定 {count} 件も削除しますか？'],
        '拖曳排序': ['Drag to reorder', 'ドラッグで並べ替え'],
        '力量': ['Strength', '筋力'], '敏捷': ['Dexterity', '敏捷'], '體質': ['Constitution', '体質'],
        '智力': ['Intelligence', '知力'], '感知': ['Wisdom', '感知'], '魅力': ['Charisma', '魅力'],
        '大成功': ['Critical Success', '大成功'], '成功': ['Success', '成功'], '失敗': ['Failure', '失敗'], '大失敗': ['Critical Failure', '大失敗']
    };

    const ATTR_M = {
        "喘息穩住身心：擲檢定回復 HP／SAN（上限 50%，不能連續使用）": ["Catch your breath: roll to restore HP/SAN (cap 50%, no consecutive use)", "ひと息ついて立て直す：判定で HP／SAN を回復（上限50%・連続使用不可）"],
        "新擅長領域（最多16字）": ["New expertise (max 16 chars)", "新しい得意分野（16字まで）"],
        "花 1 點提升此屬性": ["Spend 1 point to raise this stat", "1ポイントでこの能力値を上げる"],
        '縮小圖片': ['Zoom out', '縮小'], '圖片縮放': ['Image zoom', '画像の拡大縮小'], '放大圖片': ['Zoom in', '拡大'],
        '關閉角色面板': ['Close character panel', 'キャラクターパネルを閉じる'],
        '紀錄內容': ['Log content', '記録内容'],
        '新增狀態旗標': ['Add status flag', '状態フラグを追加'], '新增任務': ['Add task', 'タスクを追加'],
        '回到首頁': ['Back to home', 'ホームへ戻る'],
        '模型設定已移至角色面板的「系統」頁': ['Model settings now live in the System tab of the character panel', 'モデル設定はキャラクターパネルの「システム」タブに移動しました'],
        '輸入模式': ['Input mode', '入力モード'], '擲骰': ['Roll dice', 'ダイスを振る'], '發送': ['Send', '送信'],
        '儲存並回到首頁': ['Save and return home', '保存してホームへ戻る'],
        '另存配置': ['Save Preset As', '設定を別名保存'],
        '配置匯入匯出': ['Preset import/export', '設定のインポート／エクスポート'],
        '修改記憶紀錄檔名': ['Rename memory record', '記憶記録名を変更'],
        '選取此記憶紀錄': ['Select this memory record', 'この記憶記録を選択'],
        '新增狀態或旗標（最多 48 字）...': ['Add a status or flag (max 48 chars)…', '状態・フラグを追加（最大48文字）…'],
'例如：\n• 玩家與 NPC 已確認合作關係\n• 目前準備前往下一個場景': ['Example:\n• Player and NPC confirmed their cooperation\n• Preparing to move to the next scene', '例：\n• プレイヤーとNPCは協力関係を確認した\n• 次の場面へ向かう準備をしている'],
        '手動新增任務...': ['Add a task manually…', 'タスクを手動追加…'], '點擊上傳首頁照片': ['Upload home image', 'ホーム画像をアップロード'],
'例如：\n• 玩家與 NPC 已建立信任\n• NPC 知道玩家正在承擔風險': ['Example:\n• Player and NPC have built trust\n• NPC knows Player is taking a risk', '例：\n• プレイヤーとNPCは信頼関係を築いた\n• NPCはプレイヤーがリスクを負っていることを知っている'],
        '請貼上你的 API Key': ['Paste your API key', 'APIキーを貼り付けてください'],
        '背景顏色': ['Background color', '背景色'], '紙張顏色': ['Paper color', '用紙色'], '面板顏色': ['Panel color', 'パネル色'], '線條與主要文字顏色': ['Line and main text color', '線と主要文字の色'],
        '重點顏色': ['Accent color', 'アクセント色'], 'NPC 對話顏色': ['NPC dialogue color', 'NPC会話色'], '愛心顏色': ['Heart color', 'ハート色'],
        '角色配置總覽': ['Character preset overview', 'キャラクター設定一覧'], '配置分類': ['Preset categories', '設定カテゴリー'],
        '角色設定總覽': ['Character settings overview', 'キャラクター設定一覧'], '編輯玩家角色': ['Edit player character', 'プレイヤーを編集'],
        '情境設定總覽': ['Scenario settings overview', 'シナリオ設定一覧'], '遊戲設定總覽': ['Game settings overview', 'ゲーム設定一覧'],
        '切換配置鎖定': ['Toggle preset lock', '設定ロック切替'], '點擊切換鎖定狀態': ['Toggle lock', 'ロック切替'],
        '可填入想要的氣氛、類型、禁忌或角色關係；不填也可以。': ['Optional mood, genre, boundaries, or relationships.', '雰囲気、ジャンル、NG、関係性など（任意）。'],
        '選擇日誌存檔': ['Choose journal save', '日誌のデータを選択'], '搜尋事件、角色或地點...': ['Search events, characters, or places…', 'イベント、人物、場所を検索…'],
        '搜尋冒險日誌': ['Search adventure log', '冒険日誌を検索'], '冒險紀錄內容': ['Adventure entry content', '冒険記録の内容'],
        '整理摘要': ['Organize summary', 'サマリーを整理'], '整理冒險日誌': ['Organize adventure log', '冒険日誌を整理'],
        '還原上次整理': ['Undo last organization', '前回の整理を元に戻す'], '跳到最新': ['Jump to latest', '最新へ移動'],
        '只看重要標記': ['Show starred entries only', '★付きのみ表示'],
        '開啟或收回角色面板': ['Open or collapse character panel', 'キャラクターパネルを開閉'],
        '切換持續創作者指令模式': ['Toggle persistent Creator mode', '継続「神」モード切替'],
        '輸入你的開局動作，或點選上方選項...': ['Enter your opening action or choose an option above…', '最初の行動を入力するか、上の選択肢を選んでください…'],
        '由 AI 判斷檢定屬性後隨機擲出 D20': ['AI chooses the ability, then rolls a D20', 'AIが能力を選びD20を振ります'],
'例如：切回此情境時視為夢醒。': ['Example: When returning to this scenario, treat it as waking from a dream.', '例：このシナリオへ戻る時、夢から覚めた扱いにする。'],
        '輸入本回合的創作者指令...': ['Enter a Creator instruction for this turn…', 'このターンの作者指示を入力…'],
        '輸入輔助旁白，或點「神」下達創作者指令...': ['Enter narrator direction, or use Creator for a stage instruction…', 'ナレーター指示を入力するか、「神」で作者指示を出してください…'],
        '輸入角色行動，或點「神」下達創作者指令...': ['Enter your character’s action, or use Creator for a stage instruction…', 'キャラクターの行動を入力するか、「神」で作者指示を出してください…'],
        '開啟持續創作者指令模式': ['Enable persistent Creator mode', '継続「神」モードをオン'],
        '關閉持續創作者指令模式': ['Disable persistent Creator mode', '継続「神」モードをオフ']
    };

    const SYSTEM_M = {
        '至少要保留一位 NPC 喔！': ['At least one NPC must remain.', 'NPCを最低1人残してください。'],
        '至少要保留一個情境喔！': ['At least one scenario must remain.', 'シナリオを最低1つ残してください。'],
        '系統至少需要保留一組配置喔！': ['At least one preset must remain.', '設定を最低1つ残してください。'],
        '確定要刪除這位 NPC 嗎？': ['Delete this NPC?', 'このNPCを削除しますか？'],
        '確定要刪除這個情境嗎？對應的對話紀錄也會被連帶刪除！': ['Delete this scenario? Its dialogue history will also be deleted.', 'このシナリオを削除しますか？対応する会話記録も削除されます。'],
        '確定要刪除這個存檔嗎？此操作無法復原。': ['Delete this save? This cannot be undone.', 'このデータを削除しますか？元に戻せません。'],
        '確定要刪除這一筆冒險紀錄嗎？': ['Delete this adventure entry?', 'この冒険記録を削除しますか？'],
        '目前沒有資料可以匯出。': ['There is no data to export.', 'エクスポートするデータがありません。'],
        '請貼上你的 API Key！': ['Please paste your API key.', 'APIキーを貼り付けてください。'],
        '這份存檔格式不正確，無法載入。': ['This save has an invalid format and cannot be loaded.', 'このデータ形式は正しくないため読み込めません。'],
        '這份舊紀錄缺少原始配置快照，無法還原當時的角色與情境設定。已為它建立獨立的空白配置，並保留原有對話與進度；請在角色配置中補回設定。': ['This legacy save is missing its original preset snapshot, so its previous character and scenario settings cannot be restored. A separate blank preset was created for this save, while its dialogue and progress were preserved. Re-enter the missing settings in Presets.', 'この古いデータには元の設定スナップショットがないため、当時のキャラクターとシナリオ設定は復元できません。このデータ専用の空の設定を作成し、会話と進行状況は保持しました。設定画面で不足している内容を補ってください。'],
        '請先輸入你打算做什麼，再來擲骰子喔！': ['Enter what you want to do before rolling.', '先に行動を入力してからダイスを振ってください。'],
        '「神」模式是創作者指令，不使用玩家六圍。請按一般發送。': ['Creator mode does not use player attributes. Use Send instead.', '「神」モードは能力値を使いません。通常送信を使用してください。'],
        '目前是輔助旁白／創作者視角，不會使用玩家六圍擲骰。請改用一般送出。': ['Narrator/Creator view does not use player attributes. Use Send instead.', 'ナレーター／作者視点では能力値判定を行いません。通常送信を使用してください。'],
        '這筆紀錄不能是空白；若要移除請按「刪除此筆」。': ['This entry cannot be blank. Use Delete Entry to remove it.', '記録を空欄にはできません。削除する場合は「この項目を削除」を使用してください。'],
        '整理會合併語意重複的事件。系統會先保留備份，確定要繼續嗎？': ['Organizing merges semantically duplicate events. A backup will be kept. Continue?', '整理すると意味の重複するイベントを統合します。バックアップを保存して続行しますか？'],
        '冒險紀錄已整理；若結果不如預期，可按「還原」。': ['Adventure log organized. If the result is not as expected, press “Undo”.', '冒険日誌を整理しました。結果が期待どおりでない場合は「元に戻す」を押してください。'],
        '這份存檔目前沒有可復原的整理備份。': ['This save has no organization backup to restore.', 'このデータには復元できる整理バックアップがありません。'],
        '目前沒有可復原的整理備份。': ['There is no organization backup to restore.', '復元できる整理バックアップがありません。'],
        '已復原整理前的完整冒險紀錄。': ['The adventure log was restored.', '整理前の冒険記録を復元しました。'],
        '摘要與任務清單已整理完成。': ['Summary and task list organized.', 'サマリーとタスクリストを整理しました。'],
        '匯入失敗：備份檔超過 50MB。': ['Import failed: backup file exceeds 50 MB.', 'インポート失敗：バックアップが50MBを超えています。'],
        '【系統提示：靈魂重鑄】\n\n「命運的絲線又糾纏在一起了嗎...？」\n\n確定要重新洗點嗎？原本被鎖定的基礎六圍將會強制解鎖！': ['[System: Soul Reforge]\n\n“Have the threads of fate tangled again…?”\n\nReroll your stats? This will unlock and replace the current base attributes.', '【システム：魂の再鋳造】\n\n「運命の糸がまた絡み合ったのですか……？」\n\n能力値を振り直しますか？ロック中の基本能力値は解除され、新しい値に置き換わります。'],
        '洗點成功！你的能力值已重新分配。': ['Stats successfully reassigned.', '能力値を再配分しました。'],
        '極限模式的死亡永久成立，無法嘗試復活。': ['Death is permanent in Nightmare mode.', '極限モードでは死亡は永続し、復活できません。'],
        '這名 NPC 的復活檢定已經失敗，不能再次嘗試。': ['This NPC already failed their revival check.', 'このNPCは復活判定に失敗しており、再挑戦できません。'],
        '困難模式不能由「神」直接復活；必須以角色行動進行一次復活檢定。': ['Hard mode requires a character action and revival check; Creator mode cannot revive directly.', 'ハードモードではキャラクター行動による復活判定が必要です。「神」で直接復活できません。'],
        '困難模式的復活必須檢定。請按「擲骰」，成功才能復活；失敗後將永久無法再嘗試。': ['Hard mode revival requires a roll. Success revives; failure is permanent.', 'ハードモードの復活には判定が必要です。成功で復活、失敗すると再挑戦できません。'],
        '確定要清除本機 API 使用統計嗎？遊戲存檔不會被刪除。': ['Reset local API usage stats? Game saves will not be deleted.', 'ローカルのAPI使用統計をリセットしますか？データデータは削除されません。'],
        '🔒 此配置已受玩家保護，無法洗點！請先點擊上方解鎖。': ['🔒 This preset is locked. Unlock it before rerolling stats.', '🔒 この設定はロックされています。能力値を振り直す前にロックを解除してください。'],
        '🔒 此配置已受玩家保護，為防誤刪無法進行操作！\n若確定要刪除，請先點擊上方解鎖。': ['🔒 This preset is locked to prevent accidental deletion. Unlock it first if you want to delete it.', '🔒 誤削除防止のため、この設定はロックされています。削除する場合は先にロックを解除してください。'],
        '🔒 此配置已受玩家保護，無法進行覆蓋儲存！\n若要修改，請先點擊上方解鎖。': ['🔒 This preset is locked and cannot be overwritten. Unlock it before saving changes.', '🔒 この設定はロックされているため上書きできません。変更を保存する前にロックを解除してください。'],
        '確定要清空當前所有輸入框的資料嗎？這將讓你獲得一張白紙來重新填寫！\n(尚未點擊儲存前，原本的配置不會被覆蓋)': ['Clear all current fields and start with a blank form? The saved preset will not be overwritten until you save.', '現在の入力欄をすべて消去して白紙から始めますか？保存するまで元の設定は上書きされません。'],
        '已清空所有欄位！請開始創作；返回大廳時會自動儲存目前配置。': ['All fields cleared. Your current preset will be saved automatically when you return home.', 'すべての欄を消去しました。ホームへ戻ると現在の設定が自動保存されます。'],
        '當前配置變更已成功儲存！基礎屬性已被鎖定！': ['Preset changes saved. Base attributes are now locked.', '設定を保存しました。基本能力値はロックされました。'],
        '請輸入新的劇本配置名稱：': ['Enter a name for the new preset:', '新しい設定名を入力してください：'],
        '請為這份新的系統大廳配置命名：': ['Name this new lobby preset:', '新しいホーム設定に名前を付けてください：'],
        '準備進入遊戲！請為這次存檔命名：': ['Ready to play! Name this save:', 'ゲームを始めます。このデータに名前を付けてください：'],
        '警告：這將會清除設備上儲存的 API 金鑰、照片設定與所有劇本存檔！\n此操作無法復原！': ['Warning: this deletes saved API keys, image settings, and all saves on this device. This cannot be undone.', '警告：この端末のAPIキー、画像設定、すべてのデータを削除します。元に戻せません。'],
        '無法刪除當前所在的情境！請先返回遊戲切換到其他情境後，再來進行刪除。': ['The active scenario cannot be deleted. Return to the game and switch scenarios first.', '現在のシナリオは削除できません。ゲームに戻って別のシナリオへ切り替えてください。'],
        '找不到這名角色，頭像未變更。': ['Character not found. Avatar unchanged.', 'キャラクターが見つかりません。画像は変更されませんでした。'],
        '創作者指令後方沒有內容，尚未送出給 AI': ['The Creator instruction was empty and was not sent to AI.', '作者指示が空のため、AIには送信されませんでした。']
        ,'整理完整冒險紀錄會合併重複事件。系統會先保留備份，確定要繼續嗎？': ['Organizing the full adventure log merges duplicate events. A backup will be kept. Continue?', '冒険記録全体を整理すると重複イベントを統合します。バックアップを保存して続行しますか？'],
        'HP 歸零：極限模式進入「最後掙扎」（D20 ≥ 8 存活）。': ['HP reached zero: entering a last stand in Nightmare mode (D20 roll of 8 or higher required to survive).', 'HPが0になりました：ナイトメアモードの「最後の抵抗」に入ります（D20が8以上なら生存）。'],
        'HP 歸零：困難模式進入致命結局判定。': ['HP reached zero: starting a fatal-outcome check in Hard mode.', 'HPが0になりました：ハードモードの致命的結末判定に入ります。'],
        'HP 歸零：保護機制啟動，下一回合優先演出救援。': ['HP reached zero: safety protection activated; rescue takes priority next turn.', 'HPが0になりました：保護機能が作動し、次のターンは救助を優先します。'],
        'SAN 歸零：極限模式進入「最後掙扎」（D20 ≥ 8 存活）。': ['SAN reached zero: entering a last stand in Nightmare mode (D20 roll of 8 or higher required to survive).', 'SANが0になりました：ナイトメアモードの「最後の抵抗」に入ります（D20が8以上なら生存）。'],
        'SAN 歸零：困難模式進入致命結局判定。': ['SAN reached zero: starting a fatal-outcome check in Hard mode.', 'SANが0になりました：ハードモードの致命的結末判定に入ります。'],
        'SAN 歸零：照護機制啟動，下一回合優先處理精神崩潰。': ['SAN reached zero: care protection activated; the breakdown takes priority next turn.', 'SANが0になりました：ケア機能が作動し、次のターンは精神崩壊への対処を優先します。'],
        'HP 已進入重傷區間，後續行動與判定將受到影響。': ['HP is in the critical-injury range; later actions and checks will be affected.', 'HPが重傷域に入り、以後の行動と判定に影響します。'],
        'SAN 已進入精神危機區間，後續感知與判定將受到影響。': ['SAN is in the mental-crisis range; later perception and checks will be affected.', 'SANが精神危機域に入り、以後の感知と判定に影響します。'],
        'HP 已恢復至安全區間，重傷狀態解除。': ['HP returned to a safe range; critical injury removed.', 'HPが安全域に戻り、重傷状態を解除しました。'],
        'SAN 已恢復至安全區間，精神危機狀態解除。': ['SAN returned to a safe range; mental crisis removed.', 'SANが安全域に戻り、精神危機状態を解除しました。']
    };

    const reverse = { en: new Map(), ja: new Map() };
    Object.entries(M).forEach(([zh, values]) => { reverse.en.set(values[0], zh); reverse.ja.set(values[1], zh); });
    const attrReverse = { en: new Map(), ja: new Map() };
    Object.entries(ATTR_M).forEach(([zh, values]) => { attrReverse.en.set(values[0], zh); attrReverse.ja.set(values[1], zh); });
    const systemReverse = { en: new Map(), ja: new Map() };
    Object.entries(SYSTEM_M).forEach(([zh, values]) => { systemReverse.en.set(values[0], zh); systemReverse.ja.set(values[1], zh); });
    const textKeys = new WeakMap();
    const dynamicTextKeys = new WeakMap();
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
        return !parent || Boolean(parent.closest('script, style, [data-no-i18n], #dialogue-box, .journal-entry-text, .save-title, .msg-text, .msg-narrative, .desktop-npc-avatar-button > span:last-child, #desktop-player-name, .npc-summary-name'));
    }

    function translateDynamic(value, locale) {
        const rules = [
            [/^系統捕捉到隱藏錯誤，請截圖這段文字：\n([\s\S]*)\n行號：(.*)$/, a => currentLanguage === 'en' ? `A hidden error was caught. Please screenshot this message:\n${a[1]}\nLine: ${a[2]}` : `非表示のエラーを検出しました。このメッセージをスクリーンショットしてください：\n${a[1]}\n行：${a[2]}`],
            [/^(.+)無法寫入瀏覽器資料庫。請先匯出備份，並確認瀏覽器沒有封鎖本機儲存。$/, a => currentLanguage === 'en' ? `${a[1]} could not be written to browser storage. Export a backup and make sure browser storage is allowed.` : `${a[1]}をブラウザの保存領域に書き込めません。バックアップを出力し、ブラウザの保存が許可されているか確認してください。`],
            [/^總點數\s*(\d+)\s*\/\s*(\d+)$/, a => locale === 'en' ? `Total ${a[1]} / ${a[2]}` : locale === 'ja' ? `合計 ${a[1]} / ${a[2]}` : a[0]],
            [/^第\s*(\d+)\s*\/\s*(\d+)\s*頁$/, a => locale === 'en' ? `Page ${a[1]} / ${a[2]}` : locale === 'ja' ? `${a[1]} / ${a[2]} ページ` : a[0]],
            [/^最後遊玩：(.*)$/, a => locale === 'en' ? `Last played: ${a[1]}` : locale === 'ja' ? `最終プレイ：${a[1]}` : a[0]],
            [/^代表NPC:\s*(.*?)\s*\|\s*玩家:\s*(.*)$/, a => locale === 'en' ? `Featured NPC: ${a[1]} | Player: ${a[2]}` : locale === 'ja' ? `代表NPC：${a[1]}｜プレイヤー：${a[2]}` : a[0]],
            [/^配置：(.*)$/, a => locale === 'en' ? `Preset: ${a[1]}` : locale === 'ja' ? `設定：${a[1]}` : a[0]],
            [/^情境\s*(\d+)：(.*)$/, a => locale === 'en' ? `Scenario ${a[1]}: ${a[2]}` : locale === 'ja' ? `シナリオ ${a[1]}：${a[2]}` : a[0]],
            [/^玩家：(.+)$/, a => locale === 'en' ? `Player: ${a[1]}` : locale === 'ja' ? `プレイヤー：${a[1]}` : a[0]],
            [/^目前：(.*)$/, a => locale === 'en' ? `Current: ${a[1]}` : locale === 'ja' ? `現在：${a[1]}` : a[0]],
            [/^情境：(.*)$/, a => locale === 'en' ? `Scenario: ${a[1]}` : locale === 'ja' ? `シナリオ：${a[1]}` : a[0]],
            [/^♥好感:\s*(-?\d+)$/, a => locale === 'en' ? `♥ Affection: ${a[1]}` : locale === 'ja' ? `♥ 好感度：${a[1]}` : a[0]],
            [/^\[力量STR:\s*(.*?)\]$/, a => locale === 'en' ? `[STR Strength: ${a[1]}]` : locale === 'ja' ? `[STR 筋力：${a[1]}]` : a[0]],
            [/^\[敏捷DEX:\s*(.*?)\]$/, a => locale === 'en' ? `[DEX Dexterity: ${a[1]}]` : locale === 'ja' ? `[DEX 敏捷：${a[1]}]` : a[0]],
            [/^\[體質CON:\s*(.*?)\]$/, a => locale === 'en' ? `[CON Constitution: ${a[1]}]` : locale === 'ja' ? `[CON 体質：${a[1]}]` : a[0]],
            [/^\[智力INT:\s*(.*?)\]$/, a => locale === 'en' ? `[INT Intelligence: ${a[1]}]` : locale === 'ja' ? `[INT 知力：${a[1]}]` : a[0]],
            [/^\[感知WIS:\s*(.*?)\]$/, a => locale === 'en' ? `[WIS Wisdom: ${a[1]}]` : locale === 'ja' ? `[WIS 感知：${a[1]}]` : a[0]],
            [/^\[魅力CHA:\s*(.*?)\]$/, a => locale === 'en' ? `[CHA Charisma: ${a[1]}]` : locale === 'ja' ? `[CHA 魅力：${a[1]}]` : a[0]],
            [/^只有重大約定／秘密才會追加；AI 每回合讀最近\s*(\d+)\s*筆$/, a => locale === 'en' ? `Only major promises or secrets are added; the latest ${a[1]} are used each turn.` : locale === 'ja' ? `重要な約束や秘密のみ追加され、各ターンで最新${a[1]}件を参照します。` : a[0]],
            [/^查看／編輯全部\s*(\d+)\s*筆紀錄$/, a => locale === 'en' ? `View / Edit All ${a[1]} Notes` : locale === 'ja' ? `${a[1]}件すべて表示／編集` : a[0]],
            [/^最近更新：(.*)$/, a => locale === 'en' ? `Last updated: ${a[1]}` : locale === 'ja' ? `最終更新：${a[1]}` : a[0]],
            [/^(\d+)\s*\/\s*修復\s*(\d+)$/, a => locale === 'en' ? `${a[1]} / Repairs ${a[2]}` : locale === 'ja' ? `${a[1]}／修復 ${a[2]}` : a[0]],
            [/^目前供應商：(.*)$/, a => locale === 'en' ? `Provider: ${a[1]}` : locale === 'ja' ? `プロバイダー：${a[1]}` : a[0]],
            [/^目前模型：(.*)$/, a => locale === 'en' ? `Model: ${a[1]}` : locale === 'ja' ? `モデル：${a[1]}` : a[0]],
            [/^最後使用：(.*)$/, a => locale === 'en' ? `Last used: ${a[1]}` : locale === 'ja' ? `最終使用：${a[1]}` : a[0]],
            [/^已保存\s*(\d+)\s*\/\s*(\d+)\s*個 Flags；目前全部都會提供給 AI。$/, a => locale === 'en' ? `${a[1]} / ${a[2]} flags saved; all are currently shared with AI.` : locale === 'ja' ? `${a[1]}／${a[2]}件のフラグを保存中。現在はすべてAIに共有されます。` : a[0]],
            [/^已保存\s*(\d+)\s*個 Flags；AI 每回合優先讀取\s*(\d+)\s*個（含生存狀態、最早重要項目與最近項目），其餘仍完整保留。$/, a => locale === 'en' ? `${a[1]} flags saved; AI prioritizes ${a[2]} each turn and keeps the rest.` : locale === 'ja' ? `${a[1]}件のフラグを保存中。各ターンで${a[2]}件を優先し、残りも保持されます。` : a[0]]
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
            [/^確定要刪除「(.+)」這個配置嗎？$/, a => currentLanguage === 'en' ? `Delete the preset “${a[1]}”?` : `設定「${a[1]}」を削除しますか？`],
            [/^已另存新檔為「(.+)」！基礎屬性已被鎖定！$/, a => currentLanguage === 'en' ? `Saved as “${a[1]}”. Base attributes are now locked.` : `「${a[1]}」として保存しました。基本能力値はロックされました。`],
            [/^【系統提醒】\n因為大廳的配置 \[(.+)\] 已上鎖 \(🔒\)，\n本次變更僅儲存於「當前遊戲紀錄」中，不會覆蓋回大廳。\n\(若要備份目前設定，請使用另存配置；若要覆蓋回大廳，請先至大廳解鎖\)$/, a => currentLanguage === 'en' ? `[System Notice]\nThe lobby preset [${a[1]}] is locked (🔒).\nThese changes were saved only to the current game save and did not overwrite the lobby preset.\n(Use Save Preset As to back up the current settings; unlock the lobby preset before overwriting it.)` : `【システム通知】\nホームの設定［${a[1]}］はロックされています（🔒）。\n今回の変更は現在のデータにのみ保存され、ホームの設定には上書きされません。\n（現在の設定をバックアップするには設定を別名保存を使い、上書きするには先にホームの設定を解除してください。）`],
            [/^(.+)\n原本內容沒有被刪除。$/, a => currentLanguage === 'en' ? `${a[1]}\nThe original content was not deleted.` : `${a[1]}\n元の内容は削除されていません。`],
            [/^(.+)\n原本的內容沒有被刪除。$/, a => currentLanguage === 'en' ? `${a[1]}\nThe original content was not deleted.` : `${a[1]}\n元の内容は削除されていません。`],
            [/^要復原 (.+) 整理前的冒險紀錄嗎？$/, a => currentLanguage === 'en' ? `Restore the adventure log from before the ${a[1]} organization?` : `${a[1]}の整理前の冒険記録を復元しますか？`],
            [/^要復原 (.+) 整理前的完整冒險紀錄嗎？$/, a => currentLanguage === 'en' ? `Restore the full adventure log from before the ${a[1]} organization?` : `${a[1]}の整理前の冒険記録全体を復元しますか？`],
            [/^匯入完成：(\d+) 個存檔、(\d+) 個角色配置(?:，(\d+) 個同 ID 資料已自動改名)?。$/, a => currentLanguage === 'en' ? `Import complete: ${a[1]} save(s), ${a[2]} preset(s)${a[3] ? `; ${a[3]} duplicate ID(s) were renamed` : ''}.` : `インポート完了：データ${a[1]}件、設定${a[2]}件${a[3] ? `、同一IDのデータ${a[3]}件を自動改名` : ''}。`],
            [/^頭像已存入目前遊戲紀錄。\n角色配置「(.+)」已上鎖，因此沒有覆寫配置。$/, a => currentLanguage === 'en' ? `The avatar was saved to the current game save.\nPreset “${a[1]}” is locked, so it was not overwritten.` : `画像を現在のデータに保存しました。\n設定「${a[1]}」はロック中のため上書きされませんでした。`],
            [/^無法寫入瀏覽器資料庫。/, a => currentLanguage === 'en' ? value.replace('無法寫入瀏覽器資料庫。', 'Could not write to browser storage.').replace('請先匯出備份，並確認瀏覽器沒有封鎖本機儲存。', 'Export a backup and make sure browser storage is allowed.') : value.replace('無法寫入瀏覽器資料庫。', 'ブラウザの保存領域に書き込めません。').replace('請先匯出備份，並確認瀏覽器沒有封鎖本機儲存。', 'バックアップを出力し、ブラウザの保存が許可されているか確認してください。')],
            [/^請先驗證 (.+) 金鑰並選擇模型。$/, a => currentLanguage === 'en' ? `Verify your ${a[1]} key and choose a model first.` : `先に${a[1]}キーを認証し、モデルを選択してください。`],
            [/^儲存時發生錯誤：(.*)$/, a => currentLanguage === 'en' ? `Save error: ${a[1]}` : `保存エラー：${a[1]}`],
            [/^匯入失敗：(.*)$/, a => currentLanguage === 'en' ? `Import failed: ${a[1]}` : `インポート失敗：${a[1]}`],
            [/^Flags 已達 (\d+) 個，請先刪除或合併較舊項目再新增。$/, a => currentLanguage === 'en' ? `Flags reached ${a[1]}. Delete or merge older entries first.` : `フラグが${a[1]}件に達しました。古い項目を削除または統合してください。`],
            [/^【系統提示：靈魂重鑄】\n\n確定要重新隨機洗點嗎？\n注意：此存檔目前剩餘 (\d+) 次洗點機會！$/, a => currentLanguage === 'en' ? `[System: Soul Reforge]\n\nReroll your stats?\nRerolls remaining for this save: ${a[1]}.` : `【システム：魂の再鋳造】\n\n能力値を振り直しますか？\nこのデータで残っている振り直し回数：${a[1]}回。`],
            [/^— (.+) 的好感度 (-?\d+) → (-?\d+) —$/, a => currentLanguage === 'en' ? `— ${a[1]} Affection ${a[2]} → ${a[3]} —` : `— ${a[1]}の好感度 ${a[2]} → ${a[3]} —`],
            [/^☠ (.+) 已死亡(?::|：)?(.*)$/, a => currentLanguage === 'en' ? `☠ ${a[1]} has died${a[2] ? `: ${a[2]}` : ''}` : `☠ ${a[1]}は死亡しました${a[2] ? `：${a[2]}` : ''}`],
            [/^✦ (.+) 已恢復存活$/, a => currentLanguage === 'en' ? `✦ ${a[1]} has been revived` : `✦ ${a[1]}は復活しました`],
            [/^— 新登場 NPC \[ (.+) \] 已加入角色面板 —$/, a => currentLanguage === 'en' ? `— New NPC [ ${a[1]} ] added to the Character Panel —` : `— 新しいNPC［${a[1]}］をキャラクターパネルに追加しました —`],
            [/^獲得道具 \[ (.+) \]$/, a => currentLanguage === 'en' ? `Item obtained [ ${a[1]} ]` : `アイテム入手［${a[1]}］`],
            [/^可使用道具 \[ (.+) \]：(.*)$/, a => currentLanguage === 'en' ? `Usable item [ ${a[1]} ]: ${a[2]}` : `使用可能アイテム［${a[1]}］：${a[2]}`],
            [/^失去道具 \[ (.+) \]$/, a => currentLanguage === 'en' ? `Item lost [ ${a[1]} ]` : `アイテム喪失［${a[1]}］`],
            [/^新增狀態 \[ (.+) \]$/, a => { const inner = (typeof uiText === 'function') ? uiText(a[1]) : a[1]; return currentLanguage === 'en' ? `Status added [ ${inner} ]` : `状態を追加［${inner}］`; }],
            [/^Flags 已達 (\d+) 個上限；新項目未加入，請至角色面板整理。$/, a => currentLanguage === 'en' ? `Flag limit (${a[1]}) reached. The new flag was not added; manage flags in the Character Panel.` : `フラグ上限（${a[1]}件）に達しました。新しい項目は追加されていません。キャラクターパネルで整理してください。`],
            [/^已切換為輔助旁白模式；玩家角色 (.+) 不預設在場$/, a => currentLanguage === 'en' ? `Switched to Narrator mode; ${a[1]} is not assumed to be present.` : `ナレーターモードに切り替えました。プレイヤーキャラクター「${a[1]}」は不在扱いです。`],
            [/^玩家角色 (.+) 已設為在場；後續普通輸入恢復角色行動模式$/, a => currentLanguage === 'en' ? `${a[1]} is now present; normal input has returned to Player mode.` : `プレイヤーキャラクター「${a[1]}」を登場状態にしました。通常入力はプレイヤーモードに戻ります。`],
            [/^玩家角色 (.+) 已設為不在場；後續普通輸入採輔助旁白模式$/, a => currentLanguage === 'en' ? `${a[1]} is now absent; normal input will use Narrator mode.` : `プレイヤーキャラクター「${a[1]}」を不在状態にしました。通常入力はナレーターモードになります。`],
            [/^操作者已轉換為「(.+)」引導身分；原玩家角色不預設在場$/, a => currentLanguage === 'en' ? `Operator role changed to “${a[1]}”; the player character is not assumed to be present.` : `操作役を「${a[1]}」に変更しました。プレイヤーキャラクターは不在扱いです。`],
            [/^— GAME OVER：(.+)（極限模式）—$/, a => currentLanguage === 'en' ? `— GAME OVER: ${a[1]} (Nightmare mode) —` : `— GAME OVER：${a[1]}（極限モード）—`],
            [/^— 生死檢定失敗：D20 (\d+)，GAME OVER —$/, a => currentLanguage === 'en' ? `— Survival check failed: D20 ${a[1]}, GAME OVER —` : `— 生死判定失敗：D20 ${a[1]}、GAME OVER —`],
            [/^— 生死檢定成功：D20 (\d+)，(.+)後保留 1 點 —$/, a => currentLanguage === 'en' ? `— Survival check succeeded: D20 ${a[1]}; ${a[2]}, 1 point remains —` : `— 生死判定成功：D20 ${a[1]}、${a[2]}後に1点残ります —`],
            [/^— 保護機制啟動：(.+)後保留 1 點 —$/, a => currentLanguage === 'en' ? `— Safety protection activated: ${a[1]}, 1 point remains —` : `— 保護機能作動：${a[1]}後に1点残ります —`],
            [/^重要紀錄：已暫停 AI 自動追加（仍可在面板手動修改）$/, a => currentLanguage === 'en' ? 'Memory updates paused (manual editing remains available).' : '重要記録の自動追加を一時停止しました（手動編集は可能です）。'],
            [/^重要紀錄：已恢復 AI 自動追加$/, a => currentLanguage === 'en' ? 'Memory updates resumed.' : '重要記録の自動追加を再開しました。'],
            [/^— (.+) —$/, a => {
                const inner = translateSystemText(a[1]);
                return `— ${inner} —`;
            }],
            [/^(STR|DEX|CON|INT|WIS|CHA)\s+(力量|敏捷|體質|智力|感知|魅力)｜(大成功|成功|失敗|大失敗)｜(.+)$/, a => {
                const stat = { 力量:['Strength','筋力'], 敏捷:['Dexterity','敏捷'], 體質:['Constitution','体質'], 智力:['Intelligence','知力'], 感知:['Wisdom','感知'], 魅力:['Charisma','魅力'] }[a[2]];
                const result = { 大成功:['Critical Success','大成功'], 成功:['Success','成功'], 失敗:['Failure','失敗'], 大失敗:['Critical Failure','大失敗'] }[a[3]];
                const index = currentLanguage === 'en' ? 0 : 1;
                return `${a[1]} ${stat[index]} | ${result[index]} | ${a[4]}`;
            }]
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
        let dynamicSource = dynamicTextKeys.get(node);
        if (dynamicSource) {
            const knownVariants = [dynamicSource, translateDynamic(dynamicSource, 'en'), translateDynamic(dynamicSource, 'ja')];
            if (!knownVariants.includes(trimmed)) {
                dynamicTextKeys.delete(node);
                dynamicSource = '';
            }
        }
        dynamicSource ||= trimmed;
        const nextDynamic = translateDynamic(dynamicSource, currentLanguage);
        if (nextDynamic !== dynamicSource || dynamicTextKeys.has(node)) {
            if (!dynamicTextKeys.has(node)) dynamicTextKeys.set(node, dynamicSource);
            if (nextDynamic !== trimmed) node.nodeValue = raw.replace(trimmed, nextDynamic);
        }
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
        document.title = translatedValue('旅途筆記');
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
    window.uiSystemMessage = translateSystemText;

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
