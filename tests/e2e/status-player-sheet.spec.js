const { test, expect } = require('@playwright/test');
const { openApp } = require('./test-helpers');

test('status player sheet uses the flat G layout and K respec icon', async ({ page }) => {
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
        const sheetStyle = getComputedStyle(sheet);
        const buttonStyle = getComputedStyle(respecButton);
        const tabStyle = getComputedStyle(activeTab);
        return {
            background: sheetStyle.backgroundColor,
            radius: sheetStyle.borderRadius,
            shadow: sheetStyle.boxShadow,
            playerLabel: sheet.querySelector('.status-player-console-label').textContent.trim(),
            playerName: sheet.querySelector('.u-inline-069').textContent.trim(),
            statLabels: Array.from(sheet.querySelectorAll('.status-stat-item > span'), item => item.textContent.trim()),
            statValues: Array.from(sheet.querySelectorAll('.status-stat-item > strong'), item => item.textContent.trim()),
            statLabelFont: getComputedStyle(sheet.querySelector('.status-stat-item > span')).fontFamily,
            statValueFont: getComputedStyle(sheet.querySelector('.status-stat-item > strong')).fontFamily,
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
    expect(sheetState.playerLabel).toBe('[ PLAYER ]');
    expect(sheetState.playerName).toBe('小島秀芙');
    expect(sheetState.statLabels).toEqual([
        'STR 力量', 'DEX 敏捷', 'CON 體質', 'INT 智力', 'WIS 感知', 'CHA 魅力'
    ]);
    expect(sheetState.statValues).toEqual(['06', '08', '10', '16', '16', '16']);
    expect(sheetState.statLabelFont).toContain('TRPG Cubic Pixel');
    expect(sheetState.statValueFont).toContain('TRPG Cubic Pixel');
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
            fieldBackground: getComputedStyle(field).backgroundColor
        };
    });

    expect(surface.panelLayer).toContain('74%');
    expect(surface.cardLayer).toContain('66%');
    expect(surface.panelBackground).not.toBe('rgba(0, 0, 0, 0)');
    expect(surface.formBackground).toBe('rgba(0, 0, 0, 0)');
    expect(surface.fieldBackground).not.toBe('rgba(0, 0, 0, 0)');
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
            scenarios: [],
            memoryNotesPaused: false
        };
        savesData[currentSaveId] = { respecCount: 2, scenario: currentScenario };
        currentScenarioIndex = 0;
        currentStorySummary = '';
        currentOpenTasks = '';
        currentRelationshipSummary = '';
        currentAdventureLog = '';
        currentFlags = [];
        currentItems = [];
        statusDetailSelectedNpcIndex = 0;
        statusDetailEditSession = null;
        statusPlayerDetailsExpanded = true;
        statusNpcDetailsExpanded = true;
        saveCurrentProgress = () => true;
        setUiLanguage('zh-TW', { persist: false, notify: false });
        openStatusModal();
        switchStatusTab('settings');
    });
}

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
        const heading = document.querySelector('#status-player-detail-section h4');
        const detailBody = document.getElementById('status-player-detail-body').getBoundingClientRect();
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
            panelLayer: getComputedStyle(document.documentElement).getPropertyValue('--bg-panel-glass').trim(),
            readingLayer: getComputedStyle(document.documentElement).getPropertyValue('--status-reading-layer').trim(),
            tabsParentId: tabsElement.parentElement.id,
            scrollerContainsTabs: scrollerElement.contains(tabsElement),
            scrollbarWidth: getComputedStyle(scrollerElement).scrollbarWidth,
            detailIndent: detailBody.left - heading.getBoundingClientRect().left,
            titleTextOffset: parseFloat(getComputedStyle(heading, '::before').width)
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
    expect(readingSurface.panelLayer).toContain('74%');
    expect(readingSurface.readingLayer).toContain('80%');
    expect(readingSurface.tabsParentId).toBe('status-modal-content');
    expect(readingSurface.scrollerContainsTabs).toBe(false);
    expect(readingSurface.scrollbarWidth).toBe('none');
    expect(readingSurface.detailIndent).toBeCloseTo(readingSurface.titleTextOffset, 1);
    expect(readingSurface.labelColor).toBe(readingSurface.mainColor);
    expect(readingSurface.contentColor).toBe(readingSurface.subColor);

    await expect(page.locator('#status-player-detail-section h4')).toHaveText('玩家細節');
    await expect(page.locator('#edit-p-age')).toHaveCount(0);
    await expect(page.locator('#status-player-detail-body')).toContainText('22歲 / 152cm');
    await expect(page.locator('.status-detail-npc-choice.active .status-detail-npc-choice-label')).toHaveText('SY');
    await expect(page.locator('.status-detail-dynamic-heading strong')).toHaveText('角色動態');

    await page.locator('#status-player-detail-section .status-detail-heading-toggle').click();
    await expect(page.locator('#status-player-detail-body')).toBeHidden();
    await page.locator('.status-detail-npc-choice.active').click();
    await expect(page.locator('#status-npc-detail-body')).toBeHidden();
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
    await page.locator('#status-player-detail-section .status-detail-heading-toggle').click();
    await page.locator('.status-detail-npc-choice.active').click();
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
        const summaryOption = document.getElementById('status-log-summary-tab');
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
            organizeTextStart: contentTextStart(organizeButton),
            actionNoteTextStart: contentTextStart(actionNote),
            storyTitleTextStart: titleTextStart(titles[0]),
            storyHintTextStart: contentTextStart(storyHint),
            storyTextStart: contentTextStart(storyElement),
            taskHintCount: document.querySelectorAll('.memory-task-block > .memory-field-hint').length,
            relationshipTitleTextStart: titleTextStart(titles[2]),
            relationshipHintCount: relationshipElement.parentElement.querySelectorAll('.memory-field-hint').length,
            relationshipTextStart: contentTextStart(relationshipElement)
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
    expect(memorySurface.actionNoteTextStart).toBeCloseTo(memorySurface.organizeTextStart, 1);
    expect(memorySurface.storyHintTextStart).toBeCloseTo(memorySurface.storyTitleTextStart, 1);
    expect(memorySurface.storyTextStart).toBeCloseTo(memorySurface.storyTitleTextStart, 1);
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
    await page.locator('#status-player-detail-section .status-detail-heading-toggle').click();
    await page.locator('.status-detail-npc-choice.active').click();

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
            bottomGap: modal.bottom - parseFloat(modalStyle.borderBottomWidth) - scroller.bottom,
            background: getComputedStyle(scrollerElement).backgroundColor,
            readingLayer: getComputedStyle(document.documentElement).getPropertyValue('--status-reading-layer').trim(),
            overlayScrollbarWidth: getComputedStyle(overlayElement).scrollbarWidth,
            horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
        };
    });
    expect(Math.abs(mobileSurface.leftGap)).toBeLessThan(1);
    expect(Math.abs(mobileSurface.rightGap)).toBeLessThan(1);
    expect(Math.abs(mobileSurface.topGap)).toBeLessThan(1);
    expect(Math.abs(mobileSurface.bottomGap)).toBeLessThan(1);
    expect(mobileSurface.background).not.toBe('rgba(0, 0, 0, 0)');
    expect(mobileSurface.readingLayer).toContain('80%');
    expect(mobileSurface.overlayScrollbarWidth).toBe('none');
    expect(mobileSurface.horizontalOverflow).toBeLessThanOrEqual(1);
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
    await page.locator('#status-npc-detail-body [data-status-detail-primary-action]').click();

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

test('NPC avatars select and collapse the entire detail body without exposing delete under Done', async ({ page }) => {
    await openStatusDetailFixture(page);

    const npcChoices = page.locator('.status-detail-npc-choice');
    await expect(npcChoices).toHaveCount(2);
    await expect(npcChoices.first().locator('.status-detail-npc-avatar')).toHaveAttribute('data-initial', 'S');

    await npcChoices.first().click();
    await expect(page.locator('#status-npc-detail-body')).toBeHidden();
    await expect(page.locator('.status-detail-npc-hero')).toBeHidden();

    await npcChoices.nth(1).click();
    await expect(page.locator('#status-npc-detail-body')).toBeVisible();
    await expect(page.locator('.status-detail-npc-name')).toHaveText('店主');

    const primaryAction = page.locator('.status-detail-npc-hero [data-status-detail-primary-action]');
    await primaryAction.scrollIntoViewIfNeeded();
    const editBox = await primaryAction.boundingBox();
    await primaryAction.click();
    const doneBox = await primaryAction.boundingBox();
    expect(doneBox?.x).toBeCloseTo(editBox?.x || 0, 1);
    expect(doneBox?.y).toBeCloseTo(editBox?.y || 0, 1);
    await primaryAction.click();

    const returnedEditBox = await primaryAction.boundingBox();
    expect(returnedEditBox?.x).toBeCloseTo(doneBox?.x || 0, 1);
    expect(returnedEditBox?.y).toBeCloseTo(doneBox?.y || 0, 1);
    const deleteBox = await page.locator('.status-detail-delete-row .danger').boundingBox();
    expect(Math.abs((deleteBox?.y || 0) - (returnedEditBox?.y || 0))).toBeGreaterThan(100);
});

test('status detail labels render in zh-TW, en, and ja', async ({ page }) => {
    await openStatusDetailFixture(page);

    const labels = await page.evaluate(() => ['zh-TW', 'en', 'ja'].map(locale => {
        setUiLanguage(locale, { persist: false, notify: false });
        openStatusModal();
        switchStatusTab('settings');
        return {
            locale,
            player: document.querySelector('#status-player-detail-section h4')?.textContent.trim(),
            dynamic: document.querySelector('.status-detail-dynamic-heading strong')?.textContent.trim(),
            dynamicNote: document.querySelector('.status-detail-dynamic-heading > span')?.textContent.trim() || '',
            memory: document.querySelector('.status-detail-memory summary')?.childNodes[0]?.textContent.trim(),
            actionNote: document.querySelector('.status-log-summary-actions .memory-action-note')?.textContent.trim()
        };
    }));

    expect(labels).toEqual([
        {
            locale: 'zh-TW',
            player: '玩家細節',
            dynamic: '角色動態',
            dynamicNote: '',
            memory: '重要紀錄',
            actionNote: '使用整理鍵時AI會統合重複的紀錄。'
        },
        {
            locale: 'en',
            player: 'Player Details',
            dynamic: 'Live Character Status',
            dynamicNote: '',
            memory: 'Important Notes',
            actionNote: 'When you use Organize, the AI merges duplicate records.'
        },
        {
            locale: 'ja',
            player: 'プレイヤー詳細',
            dynamic: 'キャラクターの動的状態',
            dynamicNote: '',
            memory: '重要記録',
            actionNote: '「整理」ボタンを使うと、AIが重複した記録を統合します。'
        }
    ]);
});
