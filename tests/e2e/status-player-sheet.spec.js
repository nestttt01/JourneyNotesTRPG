const { test, expect } = require('@playwright/test');
const { openApp } = require('./test-helpers');

test('status player sheet uses the 03 protagonist layout and K respec icon', async ({ page }) => {
    await openApp(page);
    await page.evaluate(() => {
        document.documentElement.style.setProperty('--accent-neon', '#ff78b7');
        currentSaveId = 'status-player-sheet-test';
        savesData[currentSaveId] = { respecCount: 2 };
        currentScenario = {
            playerName: '小島秀芙',
            languageMode: 'zh-tw',
            playerStats: { str: 6, dex: 8, con: 10, int: 16, wis: 16, cha: 16 },
            playerDetails: { age: '', speech: '', likes: '', dislikes: '', app: '', bg: '' },
            npcs: [],
            scenarios: []
        };
        currentScenarioIndex = 0;
        currentStorySummary = '';
        currentOpenTasks = '';
        currentRelationshipSummary = '';
        currentAdventureLog = '';
        currentFlags = ['出遊開心'];
        currentItems = ['調查筆記'];
        openStatusModal();
        switchStatusTab('settings');
    });

    const sheetState = await page.locator('.u-inline-067').evaluate(sheet => {
        const respecButton = sheet.querySelector('.u-inline-065');
        const activeTab = document.querySelector('.status-tab-btn.active');
        const saveIndicator = document.querySelector('.status-save-indicator');
        const readingText = document.querySelector('.status-detail-read-item > p');
        const matureToggle = document.getElementById('mature-mode-toggle');
        const flagTag = document.querySelector('.flag-tag');
        const itemLabel = document.querySelector('.item-tag > span');
        const growthRank = document.querySelector('.growth-rank');
        const flagWell = document.getElementById('ui-flags-container');
        const itemWell = document.getElementById('ui-items-container');
        const stats = sheet.querySelector('.u-inline-071');
        const firstStat = stats.querySelector('.status-stat-item');
        const statLabel = firstStat.querySelector('span');
        const statValue = firstStat.querySelector('strong');
        const statsBox = stats.getBoundingClientRect();
        const sheetBox = sheet.getBoundingClientRect();
        const statLabelBox = statLabel.getBoundingClientRect();
        const statValueBox = statValue.getBoundingClientRect();
        const cursor = sheet.querySelector('.status-detail-pixel-cursor');
        const sheetStyle = getComputedStyle(sheet);
        const buttonStyle = getComputedStyle(respecButton);
        const tabStyle = getComputedStyle(activeTab);
        const cursorStyle = getComputedStyle(cursor);
        const cursorPseudo = getComputedStyle(cursor, '::before');
        return {
            background: sheetStyle.backgroundColor,
            radius: sheetStyle.borderRadius,
            shadow: sheetStyle.boxShadow,
            playerPrefixCount: sheet.querySelectorAll('.status-player-console-label').length,
            playerName: sheet.querySelector('.u-inline-069').textContent.trim(),
            statLabels: Array.from(sheet.querySelectorAll('.status-stat-item > span'), item => (
                item.textContent.trim()
            )),
            statValues: Array.from(sheet.querySelectorAll('.status-stat-item > strong'), item => (
                item.textContent.trim()
            )),
            statAccents: Array.from(sheet.querySelectorAll('.status-stat-item > strong'), item => {
                const style = getComputedStyle(item, '::after');
                return {
                    width: style.width,
                    height: style.height,
                    background: style.backgroundColor
                };
            }),
            statColumns: getComputedStyle(stats).gridTemplateColumns.split(' ').length,
            statDirection: getComputedStyle(firstStat).flexDirection,
            statBefore: getComputedStyle(firstStat, '::before').content,
            statAfter: getComputedStyle(firstStat, '::after').content,
            statValueBelowLabel: statValueBox.top >= statLabelBox.bottom,
            statCenterDelta: Math.abs(
                statLabelBox.left + statLabelBox.width / 2
                - statValueBox.left - statValueBox.width / 2
            ),
            statLeftInset: statsBox.left - sheetBox.left,
            statRightInset: sheetBox.right - statsBox.right,
            statLabelFont: getComputedStyle(sheet.querySelector('.status-stat-item > span')).fontFamily,
            statValueFont: getComputedStyle(sheet.querySelector('.status-stat-item > strong')).fontFamily,
            cursorWidth: cursorStyle.width,
            cursorHeight: cursorStyle.height,
            cursorAnimation: cursorPseudo.animationName,
            cursorDuration: cursorPseudo.animationDuration,
            respecWidth: buttonStyle.width,
            respecHeight: buttonStyle.height,
            respecBackground: buttonStyle.backgroundColor,
            respecTitle: respecButton.title,
            respecIconCount: respecButton.querySelectorAll('.status-respec-icon').length,
            respecUseTarget: respecButton.querySelector('use').getAttribute('href'),
            tabFont: tabStyle.fontFamily,
            tabWeight: tabStyle.fontWeight,
            tabShadow: tabStyle.textShadow,
            saveIndicatorFont: getComputedStyle(saveIndicator).fontFamily,
            readingFont: getComputedStyle(readingText).fontFamily,
            matureToggleFont: getComputedStyle(matureToggle).fontFamily,
            flagFont: getComputedStyle(flagTag).fontFamily,
            itemFont: getComputedStyle(itemLabel).fontFamily,
            growthRankFont: getComputedStyle(growthRank).fontFamily,
            flagWellBackground: getComputedStyle(flagWell).backgroundColor,
            itemWellBackground: getComputedStyle(itemWell).backgroundColor
        };
    });
    const readingFontLoaded = await page.evaluate(async () => {
        await document.fonts.ready;
        return document.fonts.check('16px "Glow Sans TC Normal Medium"');
    });

    expect(sheetState.background).toBe('rgba(0, 0, 0, 0)');
    expect(sheetState.radius).toBe('0px');
    expect(sheetState.shadow).toBe('none');
    expect(sheetState.playerPrefixCount).toBe(0);
    expect(sheetState.playerName).toBe('小島秀芙');
    expect(sheetState.statLabels).toEqual([
        'STR 力量', 'DEX 敏捷', 'CON 體質', 'INT 智力', 'WIS 感知', 'CHA 魅力'
    ]);
    expect(sheetState.statValues).toEqual(['06', '08', '10', '16', '16', '16']);
    expect(sheetState.statColumns).toBe(3);
    expect(sheetState.statDirection).toBe('column');
    expect(sheetState.statBefore).toBe('none');
    expect(sheetState.statAfter).toBe('none');
    expect(sheetState.statValueBelowLabel).toBe(true);
    expect(sheetState.statCenterDelta).toBeLessThan(1);
    expect(sheetState.statLeftInset).toBeCloseTo(42, 1);
    expect(sheetState.statRightInset).toBeCloseTo(42, 1);
    expect(sheetState.statAccents).toEqual(Array.from({ length: 6 }, () => ({
        width: '16px',
        height: '4px',
        background: 'rgb(255, 120, 183)'
    })));
    expect(sheetState.statLabelFont).toContain('TRPG Cubic Pixel');
    expect(sheetState.statValueFont).toContain('TRPG Cubic Pixel');
    expect(sheetState.cursorWidth).toBe('14px');
    expect(sheetState.cursorHeight).toBe('19px');
    expect(sheetState.cursorAnimation).toBe('status-detail-cursor-poke');
    expect(sheetState.cursorDuration).toBe('0.9s');
    expect(sheetState.respecWidth).toBe('44px');
    expect(sheetState.respecHeight).toBe('44px');
    expect(sheetState.respecBackground).toBe('rgba(0, 0, 0, 0)');
    expect(sheetState.respecTitle).toBe('找守墓人洗點 (剩餘 2 次)');
    expect(sheetState.respecIconCount).toBe(2);
    expect(sheetState.respecUseTarget).toBe('#theme-icon-skull');
    expect(sheetState.tabFont).toContain('TRPG Cubic Pixel');
    expect(sheetState.tabWeight).toBe('400');
    expect(sheetState.tabShadow).toBe('rgb(255, 120, 183) 1px 1px 0px');
    expect(sheetState.saveIndicatorFont).toContain('TRPG Cubic Pixel');
    expect(sheetState.readingFont).toContain('Glow Sans TC Normal Medium');
    expect(sheetState.matureToggleFont).toContain('TRPG Cubic Pixel');
    expect(sheetState.flagFont).toContain('TRPG Cubic Pixel');
    expect(sheetState.itemFont).toContain('TRPG Cubic Pixel');
    expect(sheetState.growthRankFont).toContain('TRPG Cubic Pixel');
    expect(sheetState.flagWellBackground).toBe('rgba(0, 0, 0, 0)');
    expect(sheetState.itemWellBackground).toBe('rgba(0, 0, 0, 0)');
    expect(readingFontLoaded).toBe(true);

    const respecButton = page.locator('.u-inline-065');
    await respecButton.hover();
    const hoverState = await respecButton.evaluate(button => {
        const glintStyle = getComputedStyle(button.querySelector('.status-respec-icon-glint'));
        return {
            outerBackground: getComputedStyle(button, '::before').backgroundImage,
            glintOpacity: glintStyle.opacity,
            animationName: glintStyle.animationName,
            animationDuration: glintStyle.animationDuration,
            animationTiming: glintStyle.animationTimingFunction,
            animationIteration: glintStyle.animationIterationCount
        };
    });
    expect(hoverState.outerBackground).toBe('none');
    expect(hoverState.glintOpacity).toBe('1');
    expect(hoverState.animationName).toBe('status-respec-icon-scan');
    expect(hoverState.animationDuration).toBe('0.72s');
    expect(hoverState.animationTiming).toBe('linear');
    expect(hoverState.animationIteration).toBe('infinite');

    await page.evaluate(() => {
        window.__respecTestCalls = 0;
        modalRespecStats = () => {
            window.__respecTestCalls += 1;
        };
    });
    await respecButton.click();
    expect(await page.evaluate(() => window.__respecTestCalls)).toBe(1);

    await page.evaluate(() => {
        savesData[currentSaveId].respecCount = 0;
        openStatusModal();
        switchStatusTab('settings');
    });
    const disabledState = await page.locator('.u-inline-066').evaluate(control => ({
        title: control.title,
        opacity: getComputedStyle(control).opacity,
        iconCount: control.querySelectorAll('.status-respec-icon').length
    }));
    expect(disabledState.title).toBe('洗點次數已用盡');
    expect(disabledState.opacity).toBe('0.38');
    expect(disabledState.iconCount).toBe(2);
});

test('character configuration keeps one glass content layer over the panel', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await openApp(page);
    await page.evaluate(() => {
        document.documentElement.dataset.bgMode = 'image';
        openEditScenario();
        openDesktopConfigEditor('player');
    });

    const surface = await page.evaluate(() => {
        const rootStyle = getComputedStyle(document.documentElement);
        const panel = document.getElementById('desktop-config-editor');
        const form = document.querySelector('#preset-player-editor .anime-sheet');
        const field = form.querySelector('input');
        return {
            panelLayer: rootStyle.getPropertyValue('--bg-panel-glass').trim(),
            cardLayer: rootStyle.getPropertyValue('--bg-card-glass').trim(),
            panelBackground: getComputedStyle(panel).backgroundColor,
            formBackground: getComputedStyle(form).backgroundColor,
            fieldBackground: getComputedStyle(field).backgroundColor,
            playerLabels: Array.from(form.querySelectorAll('label'), label => label.textContent.trim()),
            npcLikesLabel: document.getElementById('npc-likes-0')
                ?.previousElementSibling?.textContent.trim(),
            npcDislikesLabel: document.getElementById('npc-dislikes-0')
                ?.previousElementSibling?.textContent.trim()
        };
    });

    expect(surface.panelLayer).toContain('74%');
    expect(surface.cardLayer).toContain('66%');
    expect(surface.panelBackground).not.toBe('rgba(0, 0, 0, 0)');
    expect(surface.formBackground).toBe('rgba(0, 0, 0, 0)');
    expect(surface.fieldBackground).not.toBe('rgba(0, 0, 0, 0)');
    expect(surface.playerLabels).toContain('喜好');
    expect(surface.playerLabels).toContain('厭惡');
    expect(surface.npcLikesLabel).toBe('喜好');
    expect(surface.npcDislikesLabel).toBe('厭惡');
});

async function openStatusDetailFixture(page) {
    await openApp(page);
    await page.evaluate(() => {
        currentSaveId = 'status-detail-flow-test';
        currentScenario = {
            playerName: '小島秀芙',
            languageMode: 'zh-tw',
            playerStats: { str: 6, dex: 8, con: 10, int: 16, wis: 16, cha: 16 },
            playerDetails: {
                age: '22歲 / 152cm',
                speech: '語氣輕柔',
                likes: '咖啡',
                dislikes: '爭吵',
                app: '銀白色長髮',
                bg: '習慣獨自生活'
            },
            npcs: [
                {
                    id: 'npc_sy',
                    name: 'SY',
                    affection: 68,
                    details: {
                        age: '25歲 / 178cm',
                        speech: '溫和，偶爾吐槽',
                        likes: '安靜的夜晚',
                        dislikes: '失去聯絡',
                        app: '左手纏著繃帶',
                        bg: '店內認識的朋友'
                    },
                    dynamic: {
                        mood: '平靜',
                        condition: '左手有新繃帶',
                        relationship: '願意提供協助',
                        goal: '確認玩家安全',
                        memoryNotes: ['答應在旅店會合'],
                        lastReason: '',
                        updatedAt: '',
                        isDead: false
                    }
                },
                {
                    id: 'npc_owner',
                    name: '店主',
                    affection: 12,
                    details: {
                        age: '42歲',
                        speech: '語速很快',
                        likes: '老唱片',
                        dislikes: '賒帳',
                        app: '總是繫著深色圍裙',
                        bg: '旅店的主人'
                    },
                    dynamic: {
                        mood: '忙碌',
                        condition: '',
                        relationship: '普通客人',
                        goal: '準備晚餐',
                        memoryNotes: [],
                        lastReason: '',
                        updatedAt: '',
                        isDead: false
                    }
                }
            ],
            scenarios: [
                {
                    name: '旅店',
                    lore: '安靜的老旅店',
                    npcRoles: '店主正在準備晚餐',
                    playerRole: '暫住的旅客',
                    objective: '在午夜前找到房間',
                    transitionRule: '離開大門後轉往鐘塔'
                },
                {
                    name: '鐘塔',
                    lore: '所有鐘都慢七分鐘',
                    npcRoles: '守鐘人拒絕交談',
                    playerRole: '持有舊鑰匙的訪客',
                    objective: '登上塔頂',
                    transitionRule: '敲鐘後返回旅店'
                }
            ],
            memoryNotesPaused: false
        };
        savesData[currentSaveId] = { respecCount: 2, scenario: currentScenario };
        currentScenarioIndex = 0;
        chatScripts = [[], []];
        currentStorySummary = '';
        currentOpenTasks = '';
        currentRelationshipSummary = '';
        currentAdventureLog = '';
        currentFlags = [];
        currentItems = [];
        statusDetailSelectedNpcIndex = 0;
        statusDetailSelectedScenarioIndex = -1;
        statusDetailLowerView = 'npc';
        statusDetailEditSession = null;
        statusPlayerDetailsExpanded = true;
        saveCurrentProgress = () => true;
        setUiLanguage('zh-TW', { persist: false, notify: false });
        openStatusModal();
        switchStatusTab('settings');
    });
}

test('status panel typography uses the five-level scale', async ({ page }) => {
    await openStatusDetailFixture(page);
    await page.evaluate(() => {
        currentScenario.scenarios = [{
            name: '旅店',
            lore: '安靜的老旅店',
            npcRoles: '店主正在準備晚餐',
            playerRole: '暫住的旅客',
            objective: '',
            transitionRule: ''
        }];
        currentScenarioIndex = 0;
        currentFlags = ['出遊開心'];
        currentItems = ['調查筆記'];
        itemEffects = { '調查筆記': { type: 'hp', amount: 1 } };
        currentOpenTasks = '☐ 確認旅店出口';
        openStatusModal();
        switchStatusTab('settings');
    });

    const typography = await page.evaluate(() => {
        const panel = document.getElementById('status-modal-content');
        const expected = {
            saveButton: ['#status-save-btn', '14px'],
            saveIndicator: ['.status-save-indicator', '12px'],
            saveAsButton: ['.status-save-as-btn', '12px'],
            tab: ['.status-tab-btn', '14px'],
            stateHeading: ['#status-page-state > .u-inline-013', '16px'],
            npcSummaryHeading: ['#status-summary-display .u-inline-016', '16px'],
            flag: ['.flag-tag', '12px'],
            item: ['.item-tag', '12px'],
            itemUse: ['.item-use-btn', '12px'],
            growthRank: ['.growth-rank', '14px'],
            growthPoints: ['.growth-points', '14px'],
            growthHint: ['.growth-mod-hint', '12px'],
            growthModifiers: ['.growth-mod-line', '16px'],
            logTitle: ['.status-log-view-title', '16px'],
            logDescription: ['.status-log-view-description', '10px'],
            actionNote: ['.memory-action-note', '10px'],
            memoryTitle: ['.memory-field-title', '16px'],
            memoryHint: ['.memory-field-hint', '12px'],
            storyText: ['#ui-story-summary', '14px'],
            taskText: ['.memory-task-text', '12px'],
            taskFail: ['.memory-task-fail', '14px'],
            taskRemove: ['.memory-task-remove', '10px'],
            playerName: ['.u-inline-069', '20px'],
            statLabel: ['.status-stat-item > span', '12px'],
            statValue: ['.status-stat-item > strong', '14px'],
            detailLabel: ['.status-detail-read-item > span', '10px'],
            detailText: ['.status-detail-read-item > p', '14px'],
            dossierIndex: ['.status-detail-dossier-index button', '12px'],
            dossierKicker: ['.status-detail-dossier-kicker', '10px'],
            dossierTitle: ['.status-detail-dossier-title', '16px'],
            detailTool: ['.status-detail-tool', '12px'],
            npcChoice: ['.status-detail-npc-choice', '10px'],
            npcAvatar: ['.status-detail-npc-avatar', '14px'],
            npcName: ['.status-detail-npc-name', '16px'],
            memoryLabel: ['.status-detail-memory summary > span', '10px'],
            memoryCount: ['.status-detail-memory summary > strong', '12px'],
            sceneChoice: ['.status-detail-scene-choice', '12px'],
            apiHeading: ['#status-page-api > .u-inline-013', '16px'],
            apiLabel: ['.api-stat-label', '10px'],
            apiValue: ['.api-stat-value', '16px'],
            apiNote: ['.api-stat-note', '12px'],
            apiFieldLabel: ['#status-page-api .scenario-label', '14px'],
            apiSelect: ['#status-page-api .language-mode-select', '14px'],
            matureToggle: ['.mature-toggle', '12px']
        };
        const actual = {};
        const missing = [];
        Object.entries(expected).forEach(([name, [selector]]) => {
            const element = panel.querySelector(selector);
            if (!element) {
                missing.push(selector);
                return;
            }
            actual[name] = getComputedStyle(element).fontSize;
        });
        return {
            actual,
            expected: Object.fromEntries(Object.entries(expected).map(([name, value]) => [name, value[1]])),
            missing
        };
    });

    expect(typography.missing).toEqual([]);
    expect(typography.actual).toEqual(typography.expected);
    expect([...new Set(Object.values(typography.actual))].sort()).toEqual([
        '10px', '12px', '14px', '16px', '20px'
    ]);
    expect(typography.actual.memoryTitle).toBe(typography.actual.npcSummaryHeading);
    expect(typography.actual.playerName).toBe('20px');
    expect(typography.actual.npcName).toBe('16px');

    const stateLayout = await page.evaluate(() => {
        switchStatusTab('state');
        const heading = document.querySelector('#status-page-state > .u-inline-013');
        const headingStyle = getComputedStyle(heading);
        const headingTextStart = heading.getBoundingClientRect().left
            + Number.parseFloat(headingStyle.borderLeftWidth)
            + Number.parseFloat(headingStyle.paddingLeft);
        const contentSelectors = [
            '.npc-summary-list',
            '#ui-flags-container',
            '#flags-budget-note',
            '#flag-input-area',
            '#ui-items-container',
            '#ui-growth-container'
        ];
        return {
            headingTextStart,
            contentStarts: contentSelectors.map(selector => (
                document.querySelector(selector).getBoundingClientRect().left
            ))
        };
    });
    stateLayout.contentStarts.forEach(start => {
        expect(Math.abs(start - stateLayout.headingTextStart)).toBeLessThan(1);
    });

    const systemSpacing = await page.evaluate(() => {
        switchStatusTab('api');
        const settingsHeading = document.querySelector('#status-page-api > .u-inline-013');
        const settingsContent = document.querySelector('#status-page-api > .settings-group');
        const usageHeading = document.querySelector('#status-page-api > .u-inline-016');
        const usageContent = document.querySelector('#status-page-api > .api-stat-note');
        return {
            settingsGap: settingsContent.getBoundingClientRect().top
                - settingsHeading.getBoundingClientRect().bottom,
            usageGap: usageContent.getBoundingClientRect().top
                - usageHeading.getBoundingClientRect().bottom
        };
    });
    expect(systemSpacing.settingsGap).toBeGreaterThanOrEqual(15);
    expect(systemSpacing.usageGap).toBeGreaterThanOrEqual(15);
});

test('status details are read-first and return to the overview after editing', async ({ page }) => {
    await openStatusDetailFixture(page);

    const readingSurface = await page.evaluate(() => {
        document.documentElement.dataset.bgMode = 'image';
        const modalElement = document.getElementById('status-modal-content');
        const scrollerElement = document.querySelector('#status-modal-content > .u-inline-012');
        const tabsElement = document.querySelector('#status-modal-content .status-tabs');
        const settingsElement = document.getElementById('status-page-settings');
        const modal = modalElement.getBoundingClientRect();
        const scroller = scrollerElement.getBoundingClientRect();
        const tabs = tabsElement.getBoundingClientRect();
        const modalStyle = getComputedStyle(modalElement);
        const heading = document.querySelector('#status-player-detail-section .status-detail-player-toggle');
        const playerCursor = heading.querySelector('.status-detail-pixel-cursor');
        const headingBox = heading.getBoundingClientRect();
        const headingRowBox = heading.parentElement.getBoundingClientRect();
        const detailBody = document.getElementById('status-player-detail-body').getBoundingClientRect();
        const editAction = document.querySelector(
            '#status-player-detail-section [data-status-detail-primary-action]'
        ).getBoundingClientRect();
        const label = document.querySelector('.status-detail-read-item > span');
        const content = document.querySelector('.status-detail-read-item > p');
        const mainProbe = document.createElement('span');
        const subProbe = document.createElement('span');
        mainProbe.style.color = 'var(--text-main)';
        subProbe.style.color = 'var(--text-sub)';
        document.body.append(mainProbe, subProbe);
        const mainColor = getComputedStyle(mainProbe).color;
        const subColor = getComputedStyle(subProbe).color;
        mainProbe.remove();
        subProbe.remove();
        return {
            leftGap: scroller.left - (modal.left + parseFloat(modalStyle.borderLeftWidth)),
            rightGap: modal.right - parseFloat(modalStyle.borderRightWidth) - scroller.right,
            topGap: scroller.top - tabs.bottom,
            background: getComputedStyle(scrollerElement).backgroundColor,
            pageBackground: getComputedStyle(settingsElement).backgroundColor,
            headerBackground: getComputedStyle(document.querySelector('.modal-header-sticky')).backgroundColor,
            tabsBackground: getComputedStyle(tabsElement).backgroundColor,
            tabsMarginTop: getComputedStyle(tabsElement).marginTop,
            panelLayer: getComputedStyle(document.documentElement).getPropertyValue('--bg-panel-glass').trim(),
            readingLayer: getComputedStyle(document.documentElement).getPropertyValue('--status-reading-layer').trim(),
            tabsParentId: tabsElement.parentElement.id,
            scrollerContainsTabs: scrollerElement.contains(tabsElement),
            scrollbarWidth: getComputedStyle(scrollerElement).scrollbarWidth,
            detailIndent: detailBody.left - headingBox.left,
            detailRightInset: headingRowBox.right - detailBody.right,
            editRightInset: headingRowBox.right - editAction.right,
            titleTextOffset: playerCursor.getBoundingClientRect().width
                + parseFloat(getComputedStyle(heading).columnGap),
            labelColor: getComputedStyle(label).color,
            contentColor: getComputedStyle(content).color,
            mainColor,
            subColor
        };
    });
    expect(Math.abs(readingSurface.leftGap)).toBeLessThan(1);
    expect(Math.abs(readingSurface.rightGap)).toBeLessThan(1);
    expect(Math.abs(readingSurface.topGap)).toBeLessThan(1);
    expect(readingSurface.background).not.toBe('rgba(0, 0, 0, 0)');
    expect(readingSurface.pageBackground).toBe('rgba(0, 0, 0, 0)');
    expect(readingSurface.headerBackground).toBe('rgba(0, 0, 0, 0)');
    expect(readingSurface.tabsBackground).toBe('rgba(0, 0, 0, 0)');
    expect(readingSurface.tabsMarginTop).toBe('-11px');
    expect(readingSurface.panelLayer).toContain('74%');
    expect(readingSurface.readingLayer).toContain('80%');
    expect(readingSurface.tabsParentId).toBe('status-modal-content');
    expect(readingSurface.scrollerContainsTabs).toBe(false);
    expect(readingSurface.scrollbarWidth).toBe('none');
    expect(readingSurface.detailIndent).toBeCloseTo(readingSurface.titleTextOffset, 1);
    expect(readingSurface.detailRightInset).toBeCloseTo(42, 1);
    expect(Math.abs(readingSurface.editRightInset)).toBeLessThan(1);
    expect(readingSurface.labelColor).toBe(readingSurface.mainColor);
    expect(readingSurface.contentColor).toBe(readingSurface.subColor);

    await expect(page.locator('#status-page-settings > .u-inline-016')).toHaveCount(0);
    await expect(page.locator('#status-player-detail-section h4')).toHaveCount(0);
    await expect(page.locator('#status-player-detail-section .u-inline-069')).toHaveText('小島秀芙');
    await expect(page.locator('#edit-p-age')).toHaveCount(0);
    await expect(page.locator('#status-player-detail-body')).toContainText('22歲 / 152cm');
    await expect(page.locator('.status-detail-npc-choice-label')).toHaveCount(0);
    await expect(page.locator('.status-detail-npc-choice.active')).toHaveAttribute('aria-label', 'SY');
    await expect(page.locator('.status-detail-dynamic-grid .status-detail-read-item > span')).toHaveText([
        '情緒',
        '狀態',
        '態度',
        '目標'
    ]);

    await page.locator('#status-player-detail-section .status-detail-player-toggle').click();
    await expect(page.locator('#status-player-detail-body')).toBeHidden();
    await expect(page.locator('#status-player-detail-section .u-inline-069')).toBeVisible();
    await expect(page.locator('#status-player-detail-section .u-inline-071')).toBeVisible();
    await page.locator('.status-detail-npc-choice.active').click();
    await expect(page.locator('#status-npc-detail-body')).toBeVisible();
    await expect(page.locator('.status-detail-npc-hero')).toBeVisible();
    const collapsedLayer = await page.evaluate(() => {
        const modalElement = document.getElementById('status-modal-content');
        const scrollerElement = document.querySelector('#status-modal-content > .u-inline-012');
        const modal = modalElement.getBoundingClientRect();
        const scroller = scrollerElement.getBoundingClientRect();
        const modalStyle = getComputedStyle(modalElement);
        return {
            bottomGap: modal.bottom - parseFloat(modalStyle.borderBottomWidth) - scroller.bottom,
            background: getComputedStyle(scrollerElement).backgroundColor
        };
    });
    expect(Math.abs(collapsedLayer.bottomGap)).toBeLessThan(1);
    expect(collapsedLayer.background).toBe(readingSurface.background);
    await page.locator('#status-player-detail-section .status-detail-player-toggle').click();
    await expect(page.locator('#status-player-detail-body')).toBeVisible();
    await expect(page.locator('#status-npc-detail-body')).toBeVisible();

    const playerPrimaryAction = page.locator('#status-player-detail-section [data-status-detail-primary-action]');
    const editBox = await playerPrimaryAction.boundingBox();
    await playerPrimaryAction.click();
    await expect(page.locator('#edit-p-age')).toBeVisible();
    const doneBox = await playerPrimaryAction.boundingBox();
    expect(doneBox?.x).toBeCloseTo(editBox?.x || 0, 1);
    expect(doneBox?.y).toBeCloseTo(editBox?.y || 0, 1);
    await page.locator('#edit-p-age').fill('23歲 / 153cm');
    await playerPrimaryAction.click();

    await expect(page.locator('#edit-p-age')).toHaveCount(0);
    await expect(page.locator('#status-player-detail-body')).toContainText('23歲 / 153cm');
    expect(await page.evaluate(() => currentScenario.playerDetails.age)).toBe('23歲 / 153cm');

    await page.evaluate(() => switchStatusTab('log'));
    const memorySurface = await page.evaluate(() => {
        const card = getComputedStyle(document.querySelector('.memory-brief-card'));
        const storyElement = document.getElementById('ui-story-summary');
        const relationshipElement = document.getElementById('ui-relationship-summary');
        const story = getComputedStyle(storyElement);
        const relationship = getComputedStyle(relationshipElement);
        const titles = document.querySelectorAll('.memory-field-title');
        const storyHint = storyElement.previousElementSibling;
        const organizeButton = document.getElementById('organize-summary-btn');
        const actionNote = document.querySelector('.status-log-summary-actions .memory-action-note');
        const taskInput = document.getElementById('ui-new-memory-task');
        const summaryOption = document.getElementById('status-log-summary-tab');
        const statusViewDivider = document.querySelector('.status-log-view-divider');
        const organizerIcon = getComputedStyle(organizeButton, '::before');
        const organizerDivider = getComputedStyle(organizeButton, '::after');
        const journalOrganizeButton = document.getElementById('journal-organize-btn');
        const journalOrganizerIcon = getComputedStyle(journalOrganizeButton, '::before');
        const journalOrganizerDivider = getComputedStyle(journalOrganizeButton, '::after');
        const statusViewDividerStyle = getComputedStyle(statusViewDivider);
        const titleTextStart = element => {
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            const marker = getComputedStyle(element, '::before');
            return rect.left + parseFloat(marker.width) + parseFloat(style.columnGap);
        };
        const contentTextStart = element => {
            const rect = element.getBoundingClientRect();
            return rect.left + parseFloat(getComputedStyle(element).paddingLeft);
        };
        return {
            cardBackground: card.backgroundColor,
            cardBorder: card.borderTopWidth,
            cardShadow: card.boxShadow,
            storyBackground: story.backgroundColor,
            storyRadius: story.borderRadius,
            storyShadow: story.boxShadow,
            relationshipBackground: relationship.backgroundColor,
            relationshipRadius: relationship.borderRadius,
            relationshipShadow: relationship.boxShadow,
            summaryOptionBackground: getComputedStyle(summaryOption).backgroundColor,
            summaryTitleShadow: getComputedStyle(summaryOption.querySelector('.status-log-view-title')).textShadow,
            journalTitleShadow: getComputedStyle(
                document.querySelector('#status-log-journal-tab .status-log-view-title')
            ).textShadow,
            organizerIconWidth: organizerIcon.width,
            organizerIconHeight: organizerIcon.height,
            organizerIconBackgroundSize: organizerIcon.backgroundSize,
            organizerDividerWidth: organizerDivider.width,
            organizerDividerHeight: organizerDivider.height,
            organizerDividerColor: organizerDivider.backgroundColor,
            organizerDividerOpacity: organizerDivider.opacity,
            organizerIconLeft: organizeButton.getBoundingClientRect().left
                + parseFloat(getComputedStyle(organizeButton).paddingLeft),
            journalOrganizerIconWidth: journalOrganizerIcon.width,
            journalOrganizerIconHeight: journalOrganizerIcon.height,
            journalOrganizerDividerHeight: journalOrganizerDivider.height,
            statusViewDividerColor: statusViewDividerStyle.backgroundColor,
            statusViewDividerOpacity: statusViewDividerStyle.opacity,
            organizeTextStart: contentTextStart(organizeButton),
            actionNoteTextStart: contentTextStart(actionNote),
            storyTitleMarkerLeft: titles[0].getBoundingClientRect().left,
            storyTitleTextStart: titleTextStart(titles[0]),
            storyHintTextStart: contentTextStart(storyHint),
            storyTextStart: contentTextStart(storyElement),
            taskTitleTextStart: titleTextStart(titles[1]),
            taskInputTextStart: contentTextStart(taskInput),
            taskHintCount: document.querySelectorAll('.memory-task-block > .memory-field-hint').length,
            relationshipTitleTextStart: titleTextStart(titles[2]),
            relationshipHintCount: relationshipElement.parentElement.querySelectorAll('.memory-field-hint').length,
            relationshipTextStart: contentTextStart(relationshipElement)
        };
    });
    const journalActiveTitleShadows = await page.evaluate(() => {
        syncStatusLogViewState('journal');
        return {
            summary: getComputedStyle(
                document.querySelector('#status-log-summary-tab .status-log-view-title')
            ).textShadow,
            journal: getComputedStyle(
                document.querySelector('#status-log-journal-tab .status-log-view-title')
            ).textShadow
        };
    });
    expect(memorySurface.cardBackground).toBe('rgba(0, 0, 0, 0)');
    expect(memorySurface.cardBorder).toBe('0px');
    expect(memorySurface.cardShadow).toBe('none');
    expect(memorySurface.storyBackground).toBe('rgba(0, 0, 0, 0)');
    expect(memorySurface.storyRadius).toBe('0px');
    expect(memorySurface.storyShadow).toBe('none');
    expect(memorySurface.relationshipBackground).toBe('rgba(0, 0, 0, 0)');
    expect(memorySurface.relationshipRadius).toBe('0px');
    expect(memorySurface.relationshipShadow).toBe('none');
    expect(memorySurface.summaryOptionBackground).toBe('rgba(0, 0, 0, 0)');
    expect(memorySurface.summaryTitleShadow).toContain('2px 2px 0px');
    expect(memorySurface.journalTitleShadow).toBe('none');
    expect(journalActiveTitleShadows.summary).toBe('none');
    expect(journalActiveTitleShadows.journal).toBe(memorySurface.summaryTitleShadow);
    expect(memorySurface.organizerIconWidth).toBe('14px');
    expect(memorySurface.organizerIconHeight).toBe('21px');
    expect(memorySurface.organizerIconBackgroundSize).toContain('2px 21px');
    expect(memorySurface.organizerDividerWidth).toBe('1px');
    expect(memorySurface.organizerDividerHeight).toBe(memorySurface.organizerIconHeight);
    expect(memorySurface.organizerDividerColor).toBe(memorySurface.statusViewDividerColor);
    expect(memorySurface.organizerDividerOpacity).toBe(memorySurface.statusViewDividerOpacity);
    expect(memorySurface.organizerIconLeft).toBeCloseTo(memorySurface.storyTitleMarkerLeft, 1);
    expect(memorySurface.journalOrganizerIconWidth).toBe(memorySurface.organizerIconWidth);
    expect(memorySurface.journalOrganizerIconHeight).toBe(memorySurface.organizerIconHeight);
    expect(memorySurface.journalOrganizerDividerHeight).toBe(memorySurface.organizerIconHeight);
    expect(memorySurface.actionNoteTextStart).toBeGreaterThan(memorySurface.organizeTextStart);
    expect(memorySurface.storyHintTextStart).toBeCloseTo(memorySurface.storyTitleTextStart, 1);
    expect(memorySurface.storyTextStart).toBeCloseTo(memorySurface.storyTitleTextStart, 1);
    expect(memorySurface.taskInputTextStart).toBeCloseTo(memorySurface.taskTitleTextStart, 1);
    expect(memorySurface.taskHintCount).toBe(0);
    expect(memorySurface.relationshipHintCount).toBe(0);
    expect(memorySurface.relationshipTextStart).toBeCloseTo(memorySurface.relationshipTitleTextStart, 1);
});

test('mobile status reading layer fills the panel without a visible scrollbar', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openStatusDetailFixture(page);
    await page.evaluate(() => {
        document.documentElement.dataset.bgMode = 'image';
    });
    await page.locator('#status-player-detail-section .status-detail-player-toggle').click();

    const mobileSurface = await page.evaluate(() => {
        const modalElement = document.getElementById('status-modal-content');
        const scrollerElement = document.querySelector('#status-modal-content > .u-inline-012');
        const tabsElement = document.querySelector('#status-modal-content .status-tabs');
        const overlayElement = document.getElementById('status-modal');
        const modal = modalElement.getBoundingClientRect();
        const scroller = scrollerElement.getBoundingClientRect();
        const tabs = tabsElement.getBoundingClientRect();
        const modalStyle = getComputedStyle(modalElement);
        return {
            leftGap: scroller.left - (modal.left + parseFloat(modalStyle.borderLeftWidth)),
            rightGap: modal.right - parseFloat(modalStyle.borderRightWidth) - scroller.right,
            topGap: scroller.top - tabs.bottom,
            tabsMarginTop: getComputedStyle(tabsElement).marginTop,
            bottomGap: modal.bottom - parseFloat(modalStyle.borderBottomWidth) - scroller.bottom,
            background: getComputedStyle(scrollerElement).backgroundColor,
            readingLayer: getComputedStyle(document.documentElement).getPropertyValue('--status-reading-layer').trim(),
            overlayScrollbarWidth: getComputedStyle(overlayElement).scrollbarWidth,
            horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            tabSize: getComputedStyle(document.querySelector('#status-modal-content .status-tab-btn')).fontSize,
            descriptionSize: getComputedStyle(document.querySelector('.status-log-view-description')).fontSize,
            saveIndicatorSize: getComputedStyle(document.querySelector('.status-save-indicator')).fontSize,
            inputSize: getComputedStyle(document.getElementById('ui-story-summary')).fontSize
        };
    });
    expect(Math.abs(mobileSurface.leftGap)).toBeLessThan(1);
    expect(Math.abs(mobileSurface.rightGap)).toBeLessThan(1);
    expect(Math.abs(mobileSurface.topGap)).toBeLessThan(1);
    expect(mobileSurface.tabsMarginTop).toBe('0px');
    expect(Math.abs(mobileSurface.bottomGap)).toBeLessThan(1);
    expect(mobileSurface.background).not.toBe('rgba(0, 0, 0, 0)');
    expect(mobileSurface.readingLayer).toContain('80%');
    expect(mobileSurface.overlayScrollbarWidth).toBe('none');
    expect(mobileSurface.horizontalOverflow).toBeLessThanOrEqual(1);
    expect(mobileSurface.tabSize).toBe('14px');
    expect(mobileSurface.descriptionSize).toBe('10px');
    expect(mobileSurface.saveIndicatorSize).toBe('10px');
    expect(mobileSurface.inputSize).toBe('16px');
});

test('live NPC status refreshes in read mode and merges safely during editing', async ({ page }) => {
    await openStatusDetailFixture(page);

    const moodValue = page.locator('.status-detail-dynamic .status-detail-read-item').first().locator('p');
    await expect(moodValue).toHaveText('平靜');
    await page.locator('.status-detail-npc-choice.active').focus();
    await page.evaluate(() => {
        currentScenario.npcs[0].dynamic.mood = '警戒';
        refreshOpenStatusPanel();
    });
    await expect(moodValue).toHaveText('警戒');

    await page.locator('.status-detail-npc-hero [data-status-detail-primary-action]').click();
    await page.locator('#edit-n-state-0-mood').fill('玩家指定的平靜');
    await page.evaluate(() => syncVisibleGameEditsForSave());
    expect(await page.evaluate(() => currentScenario.npcs[0].dynamic.mood)).toBe('警戒');
    await expect(page.locator('.status-tab-btn').first()).toBeDisabled();
    await expect(page.locator('.status-save-as-btn')).toBeDisabled();
    await page.evaluate(() => {
        currentScenario.npcs[0].dynamic.condition = 'AI 更新的新傷勢';
        currentScenario.npcs[0].dynamic.memoryNotes.push('AI 新增的約定');
        refreshOpenStatusPanel();
    });

    await expect(page.locator('.status-detail-live-notice')).toBeVisible();
    await expect(page.locator('#edit-n-state-0-mood')).toHaveValue('玩家指定的平靜');
    await page.locator('.status-detail-npc-hero [data-status-detail-primary-action]').click();

    const merged = await page.evaluate(() => ({
        mood: currentScenario.npcs[0].dynamic.mood,
        condition: currentScenario.npcs[0].dynamic.condition,
        notes: currentScenario.npcs[0].dynamic.memoryNotes
    }));
    expect(merged.mood).toBe('玩家指定的平靜');
    expect(merged.condition).toBe('AI 更新的新傷勢');
    expect(merged.notes).toContain('AI 新增的約定');
    await expect(page.locator('#edit-n-state-0-mood')).toHaveCount(0);
    await expect(page.locator('.status-tab-btn').first()).toBeEnabled();
});

test('NPC dossier keeps avatar-only selection above the identity row and hides secondary fields', async ({ page }) => {
    await openStatusDetailFixture(page);

    const npcChoices = page.locator('.status-detail-npc-choice');
    await expect(npcChoices).toHaveCount(2);
    await expect(npcChoices.first().locator('.status-detail-npc-avatar')).toHaveAttribute('data-initial', 'S');
    const avatarSize = await npcChoices.first().locator('.status-detail-npc-avatar').evaluate(avatar => {
        const style = getComputedStyle(avatar);
        return { width: style.width, height: style.height };
    });
    expect(avatarSize).toEqual({ width: '42px', height: '42px' });
    await expect(npcChoices.first()).toHaveAttribute('aria-label', 'SY');
    await expect(npcChoices.nth(1)).toHaveAttribute('aria-label', '店主');
    await expect(page.locator('.status-detail-npc-choice-label')).toHaveCount(0);

    const npcLayout = await page.evaluate(() => {
        const manager = document.getElementById('status-npc-manager').getBoundingClientRect();
        const menu = document.querySelector('.status-detail-npc-menu').getBoundingClientRect();
        const kicker = document.querySelector(
            '#status-npc-manager .status-detail-dossier-kicker'
        ).getBoundingClientRect();
        const hero = document.querySelector('.status-detail-npc-hero').getBoundingClientRect();
        const body = document.getElementById('status-npc-detail-body').getBoundingClientRect();
        const actions = document.querySelector(
            '.status-detail-npc-hero .status-detail-heading-actions'
        ).getBoundingClientRect();
        const firstAvatar = document.querySelector(
            '.status-detail-npc-choice .status-detail-npc-avatar'
        ).getBoundingClientRect();
        const npcName = document.querySelector('.status-detail-npc-name').getBoundingClientRect();
        return {
            menuBeforeKicker: menu.bottom <= kicker.top,
            kickerBeforeHero: kicker.bottom <= hero.top,
            avatarNameLeftDelta: Math.abs(firstAvatar.left - npcName.left),
            bodyRightInset: manager.right - body.right,
            actionRightInset: manager.right - actions.right
        };
    });
    expect(npcLayout.menuBeforeKicker).toBe(true);
    expect(npcLayout.kickerBeforeHero).toBe(true);
    expect(npcLayout.avatarNameLeftDelta).toBeLessThan(1);
    expect(npcLayout.bodyRightInset).toBeCloseTo(42, 1);
    expect(Math.abs(npcLayout.actionRightInset)).toBeLessThan(1);

    await expect(page.locator('.status-detail-npc-profile .status-detail-read-item > span')).toHaveText([
        'PROFILE',
        'SPEECH'
    ]);
    await expect(page.locator('.status-detail-dynamic-grid .status-detail-read-item > span')).toHaveText([
        '情緒',
        '狀態',
        '態度',
        '目標'
    ]);
    await expect(page.getByText('安靜的夜晚', { exact: true })).toHaveCount(0);
    await expect(page.getByText('失去聯絡', { exact: true })).toHaveCount(0);
    await expect(page.getByText('左手纏著繃帶', { exact: true })).toHaveCount(0);
    await expect(page.getByText('店內認識的朋友', { exact: true })).toHaveCount(0);

    await npcChoices.first().click();
    await expect(page.locator('#status-npc-detail-body')).toBeVisible();
    await expect(page.locator('.status-detail-npc-hero')).toBeVisible();
    await npcChoices.nth(1).click();
    await expect(page.locator('#status-npc-detail-body')).toBeVisible();
    await expect(page.locator('.status-detail-npc-name')).toHaveText('店主');
    await npcChoices.first().click();

    const actions = page.locator('.status-detail-npc-hero .status-detail-heading-actions');
    await expect(actions.locator('.status-detail-add-tool')).toHaveText('＋ 新增 NPC');
    const addBox = await actions.locator('.status-detail-add-tool').boundingBox();
    const editBox = await actions.locator('[data-status-detail-primary-action]').boundingBox();
    expect(addBox?.x || 0).toBeLessThan(editBox?.x || 0);
    expect((editBox?.x || 0) - ((addBox?.x || 0) + (addBox?.width || 0))).toBeLessThanOrEqual(8);

    const primaryAction = actions.locator('[data-status-detail-primary-action]');
    await primaryAction.click();
    await expect(page.locator('#edit-n-likes-0')).toBeVisible();
    await expect(page.locator('#edit-n-dislikes-0')).toBeVisible();
    await expect(page.locator('#edit-n-app-0')).toBeVisible();
    await expect(page.locator('#edit-n-bg-0')).toBeVisible();
    await expect(page.locator('#edit-n-state-0-memoryNotes')).toBeVisible();
    await expect(page.locator('.status-detail-delete-row .danger')).toBeVisible();
    await primaryAction.click();
    await expect(page.locator('#edit-n-likes-0')).toHaveCount(0);
    await expect(page.locator('.status-detail-delete-row .danger')).toHaveCount(0);

    await page.evaluate(() => {
        window.__addNpcCalls = 0;
        modalAddNpc = () => {
            window.__addNpcCalls += 1;
        };
    });
    await page.locator('.status-detail-npc-hero .status-detail-add-tool').click();
    expect(await page.evaluate(() => ({
        calls: window.__addNpcCalls,
        selectedIndex: statusDetailSelectedNpcIndex
    }))).toEqual({ calls: 1, selectedIndex: 2 });
});

test('03 dossier cursors match and scenario switches by 78px into a read-first editor', async ({ page }) => {
    await openStatusDetailFixture(page);

    const cursorMetrics = await page.evaluate(() => {
        const measure = element => {
            const style = getComputedStyle(element);
            const pseudo = getComputedStyle(element, '::before');
            return {
                width: style.width,
                height: style.height,
                background: pseudo.backgroundImage,
                animation: pseudo.animationName,
                duration: pseudo.animationDuration,
                timing: pseudo.animationTimingFunction
            };
        };
        return {
            player: measure(document.querySelector('.status-detail-player-toggle .status-detail-pixel-cursor')),
            dossier: measure(document.querySelector('.status-detail-dossier-cursor'))
        };
    });
    expect(cursorMetrics.player).toEqual(cursorMetrics.dossier);
    expect(cursorMetrics.player.width).toBe('14px');
    expect(cursorMetrics.player.height).toBe('19px');
    expect(cursorMetrics.player.animation).toBe('status-detail-cursor-poke');
    expect(cursorMetrics.player.duration).toBe('0.9s');
    expect(cursorMetrics.player.timing).toContain('steps(1');

    const dossierCursor = page.locator('.status-detail-dossier-cursor');
    const cursorStart = await dossierCursor.boundingBox();
    await page.locator('[data-status-detail-view="scenario"]').click();
    await expect(page.locator('#status-scenario-manager')).toBeVisible();
    await expect(page.locator('#status-npc-manager')).toBeHidden();
    await page.waitForTimeout(220);
    const cursorEnd = await dossierCursor.boundingBox();
    expect((cursorEnd?.x || 0) - (cursorStart?.x || 0)).toBeCloseTo(78, 1);

    await expect(page.locator('#status-scenario-manager .status-detail-dossier-title')).toHaveText('旅店');
    await expect(page.locator('#status-scenario-detail-body')).toHaveCSS('margin-right', '42px');
    await expect(page.locator('.status-detail-scene-choice')).toHaveCount(2);
    await expect(page.locator('.status-detail-scene-reading .status-detail-read-item > span')).toHaveText([
        '環境法則與世界觀',
        'NPC 身分／狀態',
        '玩家身分／狀態',
        '本場目標',
        '轉場規則'
    ]);
    await expect(page.locator('#status-scenario-manager input, #status-scenario-manager textarea')).toHaveCount(0);
    await expect(page.locator('#status-scenario-manager details.dark-card')).toHaveCount(0);

    await page.locator('.status-detail-scene-choice').nth(1).click();
    await expect(page.locator('#status-scenario-manager .status-detail-dossier-title')).toHaveText('鐘塔');
    await page.locator('.status-detail-scene-choice').first().click();

    const scenarioActions = page.locator(
        '#status-scenario-manager .status-detail-scenario-hero .status-detail-heading-actions'
    );
    await expect(scenarioActions.locator('.status-detail-add-tool')).toHaveText('＋ 新增情境');
    const addBox = await scenarioActions.locator('.status-detail-add-tool').boundingBox();
    const editBox = await scenarioActions.locator('[data-status-detail-primary-action]').boundingBox();
    expect(addBox?.x || 0).toBeLessThan(editBox?.x || 0);
    expect((editBox?.x || 0) - ((addBox?.x || 0) + (addBox?.width || 0))).toBeLessThanOrEqual(8);

    const primaryAction = scenarioActions.locator('[data-status-detail-primary-action]');
    await primaryAction.click();
    for (const id of [
        '#edit-scen-name-0',
        '#edit-scen-lore-0',
        '#edit-scen-npcs-0',
        '#edit-scen-player-0',
        '#edit-scen-objective-0',
        '#edit-scen-transition-0'
    ]) {
        await expect(page.locator(id)).toBeVisible();
    }
    await expect(page.locator('.status-detail-delete-row .danger')).toBeVisible();
    await page.locator('#edit-scen-objective-0').fill('在鐘響前找到房間');
    await primaryAction.click();
    await expect(page.locator('#edit-scen-name-0')).toHaveCount(0);
    await expect(page.locator('.status-detail-delete-row .danger')).toHaveCount(0);
    expect(await page.evaluate(() => currentScenario.scenarios[0].objective)).toBe('在鐘響前找到房間');

    await page.evaluate(() => {
        window.__addScenarioCalls = 0;
        modalAddScenario = () => {
            window.__addScenarioCalls += 1;
        };
    });
    await page.locator('#status-scenario-manager .status-detail-add-tool').click();
    expect(await page.evaluate(() => ({
        calls: window.__addScenarioCalls,
        selectedIndex: statusDetailSelectedScenarioIndex
    }))).toEqual({ calls: 1, selectedIndex: 2 });
});

test('scenario choices wrap at desktop and mobile widths and keep all entries selectable', async ({ page }) => {
    await page.setViewportSize({ width: 680, height: 900 });
    await openStatusDetailFixture(page);
    const longScenarioName = '第八個有很長很長名稱的測試情境';
    await page.evaluate(longName => {
        currentScenario.scenarios = Array.from({ length: 8 }, (_, index) => ({
            name: index === 7 ? longName : '情境 ' + String(index + 1).padStart(2, '0'),
            lore: '測試世界觀',
            npcRoles: '測試 NPC',
            playerRole: '測試玩家',
            objective: '完成測試',
            transitionRule: ''
        }));
        statusDetailLowerView = 'scenario';
        statusDetailSelectedScenarioIndex = 0;
        openStatusModal();
        switchStatusTab('settings');
    }, longScenarioName);

    const choices = page.locator('.status-detail-scene-choice');
    await expect(choices).toHaveCount(8);
    const readMenuMetrics = () => page.locator('.status-detail-scene-menu').evaluate(menu => {
        const menuBox = menu.getBoundingClientRect();
        const boxes = Array.from(menu.querySelectorAll('.status-detail-scene-choice'), choice => (
            choice.getBoundingClientRect()
        ));
        return {
            flexWrap: getComputedStyle(menu).flexWrap,
            overflowX: getComputedStyle(menu).overflowX,
            rowCount: new Set(boxes.map(box => Math.round(box.top))).size,
            allInside: boxes.every(box => (
                box.left >= menuBox.left - 1 && box.right <= menuBox.right + 1
            )),
            allRendered: boxes.every(box => box.width > 0 && box.height > 0),
            horizontalOverflow: menu.scrollWidth - menu.clientWidth
        };
    });

    for (const width of [680, 390]) {
        await page.setViewportSize({ width, height: 900 });
        const metrics = await readMenuMetrics();
        expect(metrics.flexWrap).toBe('wrap');
        expect(metrics.overflowX).toBe('visible');
        expect(metrics.rowCount).toBeGreaterThan(1);
        expect(metrics.allInside).toBe(true);
        expect(metrics.allRendered).toBe(true);
        expect(metrics.horizontalOverflow).toBeLessThanOrEqual(1);
        const panelOverflow = await page.locator('#status-modal-content > .u-inline-012').evaluate(
            panel => panel.scrollWidth - panel.clientWidth
        );
        expect(panelOverflow).toBeLessThanOrEqual(1);
    }

    const lastChoice = choices.nth(7);
    await expect(lastChoice).toHaveAttribute('title', longScenarioName);
    await lastChoice.click();
    await expect(page.locator('#status-scenario-manager .status-detail-dossier-title')).toHaveText(
        longScenarioName
    );
});

test('NPC memory control saves without AI and keeps its body collapsible below the goal', async ({ page }) => {
    await openStatusDetailFixture(page);

    const goalItem = page.locator('.status-detail-dynamic-grid .status-detail-read-item').last();
    const memoryPanel = page.locator('.status-detail-memory-panel');
    const memoryDetails = memoryPanel.locator('.status-detail-memory');
    const memoryLabel = memoryPanel.locator('.status-detail-memory-label');
    await expect(memoryLabel).toHaveText('全部 NPC 記憶追加');
    await page.evaluate(() => setUiLanguage('en', { persist: false }));
    await expect(memoryLabel).toHaveText('All NPC memory updates');
    await page.evaluate(() => setUiLanguage('ja', { persist: false }));
    await expect(memoryLabel).toHaveText('全NPCの記憶追加');
    await page.evaluate(() => setUiLanguage('zh-TW', { persist: false }));
    await expect(memoryLabel).toHaveText('全部 NPC 記憶追加');
    const goalBox = await goalItem.boundingBox();
    const memoryBox = await memoryPanel.boundingBox();
    expect(memoryBox?.y || 0).toBeGreaterThan(goalBox?.y || 0);
    await expect(memoryDetails.locator('summary > strong')).toHaveText('01');
    await expect(memoryDetails).not.toHaveAttribute('open', '');
    await expect(memoryDetails.locator('li')).toBeHidden();
    await memoryDetails.locator('summary').click();
    await expect(memoryDetails.locator('li')).toHaveText('答應在旅店會合');
    await expect(memoryDetails.locator('li')).toBeVisible();

    await page.evaluate(() => {
        window.__statusSaveCalls = 0;
        window.__statusAiCalls = 0;
        window.__statusSystemNotes = [];
        saveCurrentProgress = () => {
            window.__statusSaveCalls += 1;
            return true;
        };
        requestAIText = () => {
            window.__statusAiCalls += 1;
        };
        createSystemNote = note => {
            window.__statusSystemNotes.push(note);
        };
    });

    const pauseButton = page.locator('.status-detail-memory-control .status-detail-tool');
    await expect(pauseButton).toHaveText('暫停追加');
    await pauseButton.click();
    await expect(page.locator('.status-detail-memory-control > span strong')).toHaveText('PAUSED');
    await expect(pauseButton).toHaveText('恢復追加');
    expect(await page.evaluate(() => ({
        paused: currentScenario.memoryNotesPaused,
        saves: window.__statusSaveCalls,
        ai: window.__statusAiCalls,
        notes: window.__statusSystemNotes
    }))).toEqual({
        paused: true,
        saves: 1,
        ai: 0,
        notes: ['重要紀錄：已暫停 AI 自動追加（仍可在面板手動修改）']
    });

    const pausedPatch = await page.evaluate(() => {
        const npc = currentScenario.npcs[0];
        const result = applyDynamicStatePatch(npc.dynamic, {
            persistent: true,
            changes: {
                mood: '緊張',
                condition: '手臂受傷',
                relationship: '提高警戒',
                goal: '離開旅店',
                memoryNotes: ['這筆不應追加']
            }
        }, currentScenario.memoryNotesPaused !== true);
        npc.dynamic = result.state;
        return npc.dynamic;
    });
    expect(pausedPatch.mood).toBe('緊張');
    expect(pausedPatch.condition).toBe('手臂受傷');
    expect(pausedPatch.relationship).toBe('提高警戒');
    expect(pausedPatch.goal).toBe('離開旅店');
    expect(pausedPatch.memoryNotes).toEqual(['答應在旅店會合']);

    await pauseButton.click();
    await expect(page.locator('.status-detail-memory-control > span strong')).toHaveText('ON');
    expect(await page.evaluate(() => ({
        paused: currentScenario.memoryNotesPaused,
        saves: window.__statusSaveCalls,
        ai: window.__statusAiCalls,
        notes: window.__statusSystemNotes
    }))).toEqual({
        paused: false,
        saves: 2,
        ai: 0,
        notes: [
            '重要紀錄：已暫停 AI 自動追加（仍可在面板手動修改）',
            '重要紀錄：已恢復 AI 自動追加'
        ]
    });

    await page.locator('.status-detail-memory-row > .status-detail-tool').click();
    await expect(page.locator('#edit-n-state-0-memoryNotes')).toBeVisible();
    await expect(page.locator('#edit-n-state-0-memoryNotes')).toHaveValue('• 答應在旅店會合');
});

test('status detail labels render in zh-TW, en, and ja', async ({ page }) => {
    await openStatusDetailFixture(page);

    const labels = await page.evaluate(() => ['zh-TW', 'en', 'ja'].map(locale => {
        setUiLanguage(locale, { persist: false, notify: false });
        statusDetailLowerView = 'npc';
        openStatusModal();
        switchStatusTab('settings');
        const memoryLabel = document.querySelector('.status-detail-memory-control > span').cloneNode(true);
        memoryLabel.querySelector('strong')?.remove();
        return {
            locale,
            player: Array.from(
                document.querySelectorAll('.status-detail-player-facts .status-detail-read-item > span'),
                label => label.textContent.trim()
            ),
            dynamic: Array.from(
                document.querySelectorAll('.status-detail-dynamic-grid .status-detail-read-item > span'),
                label => label.textContent.trim()
            ),
            memory: memoryLabel.textContent.replace(/[：:\s]+/g, ' ').trim(),
            pause: document.querySelector('.status-detail-memory-control .status-detail-tool')
                ?.textContent.trim(),
            addNpc: document.querySelector('.status-detail-npc-hero .status-detail-add-tool')
                ?.textContent.trim(),
            scenarioTab: document.querySelector('[data-status-detail-view="scenario"]')
                ?.textContent.trim()
        };
    }));

    expect(labels).toEqual([
        {
            locale: 'zh-TW',
            player: ['體格', '語氣', '喜好', '厭惡'],
            dynamic: ['情緒', '狀態', '態度', '目標'],
            memory: '全部 NPC 記憶追加',
            pause: '暫停追加',
            addNpc: '＋ 新增 NPC',
            scenarioTab: '情境'
        },
        {
            locale: 'en',
            player: ['Build', 'Tone', 'Likes', 'Dislikes'],
            dynamic: ['Mood', 'Status', 'Attitude', 'Goal'],
            memory: 'All NPC memory updates',
            pause: 'Pause updates',
            addNpc: '+ Add NPC',
            scenarioTab: 'Scenario'
        },
        {
            locale: 'ja',
            player: ['体格', '口調', '好きなもの', '嫌いなもの'],
            dynamic: ['気分', 'ステータス', '態度', '目標'],
            memory: '全NPCの記憶追加',
            pause: '追加を一時停止',
            addNpc: '＋ NPCを追加',
            scenarioTab: 'シナリオ'
        }
    ]);
});
