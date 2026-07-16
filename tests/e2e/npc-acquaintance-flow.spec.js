const { test, expect } = require('@playwright/test');
const { openApp } = require('./test-helpers');

async function openCharacterConfig(page, width = 1440, height = 1000) {
    await page.setViewportSize({ width, height });
    await openApp(page);
    await page.evaluate(() => openEditScenario());
}

async function readDualPanelLayout(page) {
    return page.evaluate(() => {
        const readBox = element => {
            const box = element.getBoundingClientRect();
            return {
                x: box.x,
                y: box.y,
                width: box.width,
                height: box.height,
                display: getComputedStyle(element).display
            };
        };
        return {
            desktopMedia: matchMedia('(min-width: 1100px), (hover: hover) and (pointer: fine)').matches,
            screen: readBox(document.getElementById('edit-scenario-screen')),
            overview: readBox(document.getElementById('desktop-config-overview')),
            editor: readBox(document.getElementById('desktop-config-editor')),
            horizontalOverflow: document.documentElement.scrollWidth - innerWidth
        };
    });
}

async function waitForEqualPanels(page) {
    await expect.poll(() => page.evaluate(() => {
        const overview = document.getElementById('desktop-config-overview').getBoundingClientRect();
        const editor = document.getElementById('desktop-config-editor').getBoundingClientRect();
        return Math.abs(overview.width - editor.width);
    })).toBeLessThan(1);
}

test('approved A bracket buttons pop open without card styling', async ({ page }) => {
    await openCharacterConfig(page);
    await page.locator('.desktop-npc-avatar-button:not(.desktop-npc-add-button)').first().click();

    const bracketButton = page.locator('#desktop-npc-readonly-preview .npc-flow-bracket-action');
    await expect(bracketButton).toBeVisible();
    const rest = await bracketButton.evaluate(button => ({
        backgroundColor: getComputedStyle(button).backgroundColor,
        borderTopWidth: getComputedStyle(button).borderTopWidth,
        boxShadow: getComputedStyle(button).boxShadow,
        beforeContent: getComputedStyle(button, '::before').content,
        afterContent: getComputedStyle(button, '::after').content
    }));
    expect(rest).toEqual({
        backgroundColor: 'rgba(0, 0, 0, 0)',
        borderTopWidth: '0px',
        boxShadow: 'none',
        beforeContent: '"\uFF3B"',
        afterContent: '"\uFF3D"'
    });

    await bracketButton.hover();
    await page.waitForTimeout(300);
    const hover = await bracketButton.evaluate(button => ({
        beforeTransform: getComputedStyle(button, '::before').transform,
        afterTransform: getComputedStyle(button, '::after').transform,
        labelClipPath: getComputedStyle(button.querySelector('.npc-flow-bracket-label'), '::after').clipPath
    }));
    expect(hover.beforeTransform).toBe('matrix(1, 0, 0, 1, -4, 0)');
    expect(hover.afterTransform).toBe('matrix(1, 0, 0, 1, 4, 0)');
    expect(['inset(0px)', 'inset(0px 0px 0px 0px)']).toContain(hover.labelClipPath);

    await page.mouse.down();
    await page.waitForTimeout(180);
    expect(await bracketButton.evaluate(button => getComputedStyle(button).transform))
        .toBe('matrix(0.97, 0, 0, 0.97, 0, 0)');
    await page.mouse.up();

    const staticBracketStyles = await page.evaluate(() => {
        const root = document.documentElement;
        const originalMode = root.dataset.bgMode;
        const selector = [
            '.desktop-game-two-buttons button.npc-flow-bracket-action',
            '.desktop-game-management-actions button.npc-flow-bracket-action'
        ].join(',');
        const read = () => Array.from(document.querySelectorAll(selector)).map(button => ({
            backgroundColor: getComputedStyle(button).backgroundColor,
            borderTopWidth: getComputedStyle(button).borderTopWidth,
            boxShadow: getComputedStyle(button).boxShadow
        }));
        const light = read();
        root.dataset.bgMode = 'image';
        const image = read();
        if (originalMode === undefined) delete root.dataset.bgMode;
        else root.dataset.bgMode = originalMode;
        return { light, image };
    });
    expect(staticBracketStyles.light.length).toBe(3);
    expect(staticBracketStyles.light).toEqual(staticBracketStyles.image);
    expect(staticBracketStyles.light.every(style => (
        style.backgroundColor === 'rgba(0, 0, 0, 0)'
        && style.borderTopWidth === '0px'
        && style.boxShadow === 'none'
    ))).toBe(true);

    await page.evaluate(() => {
        setUiLanguage('ja', { persist: false, notify: false });
        switchDesktopConfigWorkspace('scenarios');
    });
    const randomActions = page.locator('.desktop-scenario-random-actions');
    await expect(randomActions).toBeVisible();
    const randomActionLayout = await randomActions.evaluate(container => {
        const buttons = Array.from(container.querySelectorAll('button'));
        const containerBox = container.getBoundingClientRect();
        const firstBox = buttons[0].getBoundingClientRect();
        const secondBox = buttons[1].getBoundingClientRect();
        const style = getComputedStyle(container);
        const gap = parseFloat(style.columnGap);
        const columnWidth = (containerBox.width - gap) / 2;
        return {
            buttonCount: buttons.length,
            columnCount: style.gridTemplateColumns.split(' ').filter(Boolean).length,
            justifyItems: style.justifyItems,
            firstCenter: firstBox.left - containerBox.left + firstBox.width / 2,
            firstTarget: columnWidth / 2,
            secondCenter: secondBox.left - containerBox.left + secondBox.width / 2,
            secondTarget: columnWidth + gap + columnWidth / 2,
            verticalCenterDelta: Math.abs(
                firstBox.top + firstBox.height / 2 - secondBox.top - secondBox.height / 2
            )
        };
    });
    expect(randomActionLayout.buttonCount).toBe(2);
    expect(randomActionLayout.columnCount).toBe(2);
    expect(randomActionLayout.justifyItems).toBe('center');
    expect(Math.abs(randomActionLayout.firstCenter - randomActionLayout.firstTarget)).toBeLessThan(1);
    expect(Math.abs(randomActionLayout.secondCenter - randomActionLayout.secondTarget)).toBeLessThan(1);
    expect(randomActionLayout.verticalCenterDelta).toBeLessThan(1);
});

test('existing NPC opens a read-only detail sheet before acquaintance', async ({ page }) => {
    await openCharacterConfig(page);
    const playerMetrics = await page.evaluate(() => {
        openDesktopConfigEditor('player');
        const panel = document.getElementById('desktop-config-editor').getBoundingClientRect();
        const avatar = document.getElementById('preview-player').getBoundingClientRect();
        const metrics = {
            avatarTop: avatar.top - panel.top,
            avatarSize: avatar.width
        };
        switchDesktopConfigWorkspace('characters');
        return metrics;
    });
    expect(playerMetrics).toEqual({ avatarTop: 82, avatarSize: 104 });
    await expect(page.locator('.desktop-overview-heading')).toHaveCSS('border-bottom-width', '0px');

    const npcButtons = page.locator('.desktop-npc-avatar-button:not(.desktop-npc-add-button)');
    expect(await npcButtons.count()).toBeGreaterThan(0);
    await npcButtons.first().click();
    await waitForEqualPanels(page);

    const preview = page.locator('#desktop-npc-readonly-preview');
    await expect(preview).toBeVisible();
    await expect(preview.locator('.desktop-npc-preview-page-header')).toHaveCount(0);
    await expect(preview.locator('.desktop-npc-preview-hero-avatar')).toHaveCount(1);
    await expect(preview.locator('.desktop-npc-preview-tool')).toHaveText('編輯');
    await expect(preview.locator('.desktop-npc-preview-topbar')).toHaveCount(0);
    await expect(preview.locator('.desktop-npc-preview-menu')).toHaveCount(0);
    await expect(preview.locator('.desktop-npc-preview-kicker')).toHaveCount(0);
    await expect(preview.locator('.desktop-character-preview-basis .npc-flow-basis-row')).toHaveCount(6);
    await expect(preview.locator('.desktop-character-preview-basis .npc-flow-basis-row > span')).toHaveText([
        '體格',
        '語氣',
        '喜好',
        '厭惡',
        '外貌與穿搭',
        '核心性格與背景'
    ]);
    await expect(preview.locator('.desktop-npc-preview-read-grid, .desktop-npc-preview-chapters')).toHaveCount(0);
    await expect(preview.locator('input, textarea, [contenteditable="true"]')).toHaveCount(0);

    const approvedPreviewStyle = await preview.evaluate(root => {
        const grid = root.querySelector('.desktop-character-preview-basis');
        const row = root.querySelector('.desktop-character-preview-basis .npc-flow-basis-row');
        const actions = root.querySelector('.desktop-npc-preview-actions');
        const heroAvatar = root.querySelector('.desktop-npc-preview-hero-avatar');
        const panel = document.getElementById('desktop-config-editor').getBoundingClientRect();
        const gridBox = grid.getBoundingClientRect();
        const avatarBox = heroAvatar.getBoundingClientRect();
        const actionBox = actions.querySelector('button').getBoundingClientRect();
        return {
            columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
            gridLeft: gridBox.left - panel.left,
            gridWidth: gridBox.width,
            labelAccentWidth: getComputedStyle(row, '::before').width,
            actionsBorderTop: getComputedStyle(actions).borderTopWidth,
            heroAvatarSize: avatarBox.width,
            heroAvatarTop: avatarBox.top - panel.top,
            actionRightGap: panel.right - actionBox.right,
            actionBottomGap: panel.bottom - actionBox.bottom
        };
    });
    expect(approvedPreviewStyle.gridLeft).toBeGreaterThan(0);
    expect(approvedPreviewStyle.gridWidth).toBeGreaterThan(0);
    expect(approvedPreviewStyle).toMatchObject({
        columns: 2,
        labelAccentWidth: '3px',
        actionsBorderTop: '0px',
        heroAvatarSize: 104,
        heroAvatarTop: 82,
        actionRightGap: 45,
        actionBottomGap: 32
    });

    const previewState = await page.evaluate(() => {
        const screen = document.getElementById('edit-scenario-screen');
        const previewRoot = document.getElementById('desktop-npc-readonly-preview');
        return {
            previewOpen: screen.classList.contains('npc-preview-open'),
            acquaintanceOpen: screen.classList.contains('npc-acquaintance-open'),
            previewHidden: previewRoot.hidden,
            editorFieldsVisible: Array.from(
                document.querySelectorAll('#npc-list-container input, #npc-list-container textarea')
            ).some(field => field.getClientRects().length > 0)
        };
    });
    expect(previewState).toEqual({
        previewOpen: true,
        acquaintanceOpen: false,
        previewHidden: false,
        editorFieldsVisible: false
    });

    const previewLayout = await readDualPanelLayout(page);
    expect(previewLayout.desktopMedia).toBe(true);
    expect(previewLayout.overview.display).toBe('flex');
    expect(previewLayout.editor.display).toBe('flex');
    expect(Math.abs(previewLayout.overview.width - previewLayout.editor.width)).toBeLessThan(1);
    expect(Math.abs(previewLayout.overview.height - previewLayout.editor.height)).toBeLessThan(1);
    expect(Math.abs(previewLayout.overview.y - previewLayout.editor.y)).toBeLessThan(1);
    expect(previewLayout.horizontalOverflow).toBeLessThanOrEqual(0);

    await page.evaluate(() => {
        setUiLanguage('ja', { persist: false, notify: false });
        renderDesktopNpcPreview();
    });
    await expect(preview.locator('.desktop-character-preview-basis .npc-flow-basis-row > span')).toHaveText([
        '体格',
        '口調',
        '好きなもの',
        '嫌いなもの',
        '外見と服装',
        '性格と背景'
    ]);

    const longProfileText = 'Long profile text. '.repeat(120);
    await page.evaluate(text => {
        const details = editingNpcs[desktopNpcPreviewIndex].details;
        details.app = text;
        details.bg = text;
        renderDesktopNpcPreview();
    }, longProfileText);
    const previewOverflowProtection = await page.evaluate(() => {
        const content = document.querySelector('.desktop-character-preview-basis');
        const action = document.querySelector('.desktop-npc-preview-actions button');
        const contentBox = content.getBoundingClientRect();
        const actionBox = action.getBoundingClientRect();
        return {
            gap: actionBox.top - contentBox.bottom,
            clientHeight: content.clientHeight,
            scrollHeight: content.scrollHeight
        };
    });
    expect(previewOverflowProtection.gap).toBeGreaterThanOrEqual(24);
    expect(previewOverflowProtection.scrollHeight).toBeGreaterThan(previewOverflowProtection.clientHeight);

    await preview.locator('.desktop-npc-preview-actions .npc-flow-bracket-action').click();
    await expect(page.locator('#npc-acquaintance-flow')).toBeVisible();
    await expect(page.locator('.npc-flow-intro-page-title')).toHaveCount(0);
    await expect(page.locator('[data-flow-view="intro"] .npc-flow-title')).toHaveText('人物の基礎を確認');
    await expect(page.locator('.npc-flow-intro-nameplate')).toBeVisible();
    const approvedIntroStyle = await page.evaluate(() => {
        const subtitle = document.querySelector('[data-flow-view="intro"] .npc-flow-title');
        const avatar = document.querySelector('.npc-flow-intro-avatar');
        const basis = document.querySelector('#npc-acquaintance-flow .npc-flow-basis-list');
        const row = document.querySelector('#npc-acquaintance-flow .npc-flow-basis-row');
        const panel = document.getElementById('desktop-config-editor').getBoundingClientRect();
        const returnAction = document.querySelector(
            '#npc-acquaintance-flow > .npc-flow-header .npc-flow-return-action'
        );
        const returnBox = returnAction.getBoundingClientRect();
        const avatarBox = avatar.getBoundingClientRect();
        const basisBox = basis.getBoundingClientRect();
        const actionBox = document.querySelector(
            '[data-flow-view="intro"] .npc-flow-action-row button'
        ).getBoundingClientRect();
        return {
            headerBorderBottom: getComputedStyle(document.querySelector('.npc-flow-header')).borderBottomWidth,
            returnLeft: returnBox.left,
            returnTop: returnBox.top - panel.top,
            subtitleSize: getComputedStyle(subtitle).fontSize,
            avatarRadius: getComputedStyle(avatar).borderRadius,
            avatarSize: getComputedStyle(avatar).width,
            avatarTop: avatarBox.top - panel.top,
            basisLeft: basisBox.left - panel.left,
            basisWidth: basisBox.width,
            actionRightGap: panel.right - actionBox.right,
            actionBottomGap: panel.bottom - actionBox.bottom,
            columns: getComputedStyle(basis).gridTemplateColumns.split(' ').length,
            listBorderTop: getComputedStyle(basis).borderTopWidth,
            rowBorderBottom: getComputedStyle(row).borderBottomWidth,
            accentWidth: getComputedStyle(row, '::before').width
        };
    });
    expect(approvedIntroStyle).toEqual({
        headerBorderBottom: '0px',
        returnLeft: approvedIntroStyle.returnLeft,
        returnTop: 25,
        subtitleSize: '12px',
        avatarRadius: '50%',
        avatarSize: '104px',
        avatarTop: 83,
        basisLeft: approvedPreviewStyle.gridLeft,
        basisWidth: approvedPreviewStyle.gridWidth,
        actionRightGap: approvedPreviewStyle.actionRightGap,
        actionBottomGap: approvedPreviewStyle.actionBottomGap,
        columns: 2,
        listBorderTop: '0px',
        rowBorderBottom: '0px',
        accentWidth: '3px'
    });
    expect(Math.abs(approvedIntroStyle.avatarTop - playerMetrics.avatarTop)).toBeLessThan(2);
    const introOverflowProtection = await page.evaluate(() => {
        const content = document.querySelector('[data-flow-view="intro"]');
        const action = document.querySelector('[data-flow-view="intro"] .npc-flow-action-row button');
        const contentBox = content.getBoundingClientRect();
        const actionBox = action.getBoundingClientRect();
        return {
            gap: actionBox.top - contentBox.bottom,
            clientHeight: content.clientHeight,
            scrollHeight: content.scrollHeight
        };
    });
    expect(introOverflowProtection.gap).toBeGreaterThanOrEqual(24);
    expect(introOverflowProtection.scrollHeight).toBeGreaterThan(introOverflowProtection.clientHeight);
    const flowLayout = await readDualPanelLayout(page);
    expect(flowLayout.overview).toEqual(previewLayout.overview);
    expect(flowLayout.editor).toEqual(previewLayout.editor);

    await page.locator('#npc-acquaintance-flow [data-flow-action="close"]').click();
    await expect(page.locator('#npc-list-container details.desktop-active-card')).toBeVisible();
    const editorActions = page.locator(
        '#npc-list-container details.desktop-active-card .desktop-npc-editor-actions .npc-flow-bracket-action'
    );
    await expect(editorActions).toHaveCount(2);
    await expect(editorActions.first()).toBeVisible();
    await expect(page.locator('.desktop-npc-editor-name > span')).toHaveCount(0);
    const deleteButton = page.locator(
        '#npc-list-container details.desktop-active-card .desktop-npc-editor-delete'
    );
    await expect(deleteButton).toBeVisible();
    const deleteButtonStyle = await deleteButton.evaluate(button => ({
        borderBottomWidth: getComputedStyle(button).borderBottomWidth,
        fontSize: getComputedStyle(button).fontSize,
        textDecorationLine: getComputedStyle(button.querySelector('.hold-delete-base')).textDecorationLine
    }));
    expect(deleteButtonStyle).toEqual({
        borderBottomWidth: '0px',
        fontSize: '12px',
        textDecorationLine: 'underline'
    });

    const approvedBracketButton = editorActions.first();
    const bracketStyleAtRest = await approvedBracketButton.evaluate(button => ({
        backgroundColor: getComputedStyle(button).backgroundColor,
        borderTopWidth: getComputedStyle(button).borderTopWidth,
        boxShadow: getComputedStyle(button).boxShadow,
        beforeContent: getComputedStyle(button, '::before').content,
        afterContent: getComputedStyle(button, '::after').content
    }));
    expect(bracketStyleAtRest).toEqual({
        backgroundColor: 'rgba(0, 0, 0, 0)',
        borderTopWidth: '0px',
        boxShadow: 'none',
        beforeContent: '"［"',
        afterContent: '"］"'
    });
    await approvedBracketButton.hover();
    await page.waitForTimeout(300);
    const bracketStyleOnHover = await approvedBracketButton.evaluate(button => ({
        beforeTransform: getComputedStyle(button, '::before').transform,
        afterTransform: getComputedStyle(button, '::after').transform,
        labelClipPath: getComputedStyle(button.querySelector('.npc-flow-bracket-label'), '::after').clipPath
    }));
    expect(bracketStyleOnHover.beforeTransform).toBe('matrix(1, 0, 0, 1, -4, 0)');
    expect(bracketStyleOnHover.afterTransform).toBe('matrix(1, 0, 0, 1, 4, 0)');
    expect(['inset(0px)', 'inset(0px 0px 0px 0px)']).toContain(bracketStyleOnHover.labelClipPath);

    const staticBracketStyles = await page.evaluate(() => {
        const root = document.documentElement;
        const originalMode = root.dataset.bgMode;
        const selectors = [
            '.desktop-game-two-buttons button.npc-flow-bracket-action',
            '.desktop-game-management-actions button.npc-flow-bracket-action'
        ];
        const readStyles = () => Array.from(document.querySelectorAll(selectors.join(','))).map(button => ({
            backgroundColor: getComputedStyle(button).backgroundColor,
            borderTopWidth: getComputedStyle(button).borderTopWidth,
            boxShadow: getComputedStyle(button).boxShadow
        }));
        const light = readStyles();
        root.dataset.bgMode = 'image';
        const image = readStyles();
        if (originalMode === undefined) delete root.dataset.bgMode;
        else root.dataset.bgMode = originalMode;
        return { light, image };
    });
    expect(staticBracketStyles.light.length).toBe(3);
    expect(staticBracketStyles.light).toEqual(staticBracketStyles.image);
    expect(staticBracketStyles.light.every(style => (
        style.backgroundColor === 'rgba(0, 0, 0, 0)'
        && style.borderTopWidth === '0px'
        && style.boxShadow === 'none'
    ))).toBe(true);

    const editorLayout = await page.evaluate(() => {
        const panel = document.getElementById('desktop-config-editor').getBoundingClientRect();
        const header = document.querySelector('.desktop-npc-editor-header').getBoundingClientRect();
        const avatar = document.querySelector(
            '#npc-list-container details.desktop-active-card .avatar-preview'
        ).getBoundingClientRect();
        return {
            returnLeft: header.left,
            returnTop: header.top - panel.top,
            avatarTop: avatar.top - panel.top,
            avatarSize: avatar.width
        };
    });
    expect(Math.abs(editorLayout.returnLeft - approvedIntroStyle.returnLeft)).toBeLessThan(1);
    expect(Math.abs(editorLayout.returnTop - approvedIntroStyle.returnTop)).toBeLessThan(1);
    expect(Math.abs(editorLayout.avatarTop - playerMetrics.avatarTop)).toBeLessThan(1);
    expect(editorLayout.avatarSize).toBe(playerMetrics.avatarSize);
});

test('read-only geometry stays fixed when switching between NPC text lengths', async ({ page }) => {
    await openCharacterConfig(page);
    const npcButtons = page.locator('.desktop-npc-avatar-button:not(.desktop-npc-add-button)');
    expect(await npcButtons.count()).toBeGreaterThan(1);
    const layouts = [];
    for (let index = 0; index < 2; index += 1) {
        await npcButtons.nth(index).click();
        layouts.push(await page.evaluate(() => {
            const panel = document.getElementById('desktop-config-editor').getBoundingClientRect();
            const grid = document.querySelector('.desktop-character-preview-basis').getBoundingClientRect();
            return {
                left: grid.left - panel.left,
                top: grid.top - panel.top,
                width: grid.width
            };
        }));
        await page.evaluate(() => closeDesktopNpcPreview());
    }
    expect(layouts[1]).toEqual(layouts[0]);
});

test('fine pointer at phone width still uses the full-width mobile NPC layouts', async ({ page }) => {
    await openCharacterConfig(page, 553, 900);
    await page.evaluate(() => {
        const text = 'Long mobile profile text. '.repeat(80);
        editingNpcs[0].details.app = text;
        editingNpcs[0].details.bg = text;
        renderNpcList();
        renderDesktopPresetOverview();
    });
    await page.locator('.desktop-npc-avatar-button:not(.desktop-npc-add-button)').first().click();
    const previewLayout = await page.evaluate(() => {
        const panel = document.getElementById('desktop-config-editor').getBoundingClientRect();
        const grid = document.querySelector('.desktop-character-preview-basis');
        const gridBox = grid.getBoundingClientRect();
        const action = document.querySelector('.desktop-npc-preview-actions button').getBoundingClientRect();
        const back = document.querySelector('.mobile-config-editor-back');
        return {
            screenDisplay: getComputedStyle(document.getElementById('edit-scenario-screen')).display,
            overviewDisplay: getComputedStyle(document.getElementById('desktop-config-overview')).display,
            panelWidth: panel.width,
            columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
            writingMode: getComputedStyle(grid.querySelector('strong')).writingMode,
            contentGap: action.top - gridBox.bottom,
            actionInside: action.bottom < panel.bottom,
            backDisplay: getComputedStyle(back).display,
            horizontalOverflow: document.documentElement.scrollWidth - innerWidth
        };
    });
    expect(previewLayout).toEqual({
        screenDisplay: 'flex',
        overviewDisplay: 'none',
        panelWidth: 526,
        columns: 1,
        writingMode: 'horizontal-tb',
        contentGap: 30,
        actionInside: true,
        backDisplay: 'grid',
        horizontalOverflow: 0
    });

    await page.locator('.mobile-config-editor-back').click();
    await expect(page.locator('#desktop-config-overview')).toBeVisible();
    await expect(page.locator('#desktop-config-editor')).toBeHidden();
    await page.locator('.desktop-npc-avatar-button:not(.desktop-npc-add-button)').first().click();

    await page.locator('.desktop-npc-preview-tool').click();
    const editorLayout = await page.evaluate(() => ({
        columns: getComputedStyle(document.querySelector('.desktop-npc-editor-grid'))
            .gridTemplateColumns.split(' ').length,
        horizontalOverflow: document.documentElement.scrollWidth - innerWidth
    }));
    expect(editorLayout).toEqual({ columns: 1, horizontalOverflow: 0 });

    await page.locator('details.desktop-active-card .desktop-npc-editor-header .npc-flow-return-action').click();
    await page.locator('.desktop-npc-preview-actions button').click();
    const flowLayout = await page.evaluate(() => ({
        columns: getComputedStyle(document.querySelector('#npc-acquaintance-flow .npc-flow-basis-list'))
            .gridTemplateColumns.split(' ').length,
        writingMode: getComputedStyle(
            document.querySelector('#npc-acquaintance-flow .npc-flow-basis-row strong')
        ).writingMode,
        backDisplay: getComputedStyle(document.querySelector('.mobile-config-editor-back')).display,
        horizontalOverflow: document.documentElement.scrollWidth - innerWidth
    }));
    expect(flowLayout).toEqual({
        columns: 1,
        writingMode: 'horizontal-tb',
        backDisplay: 'grid',
        horizontalOverflow: 0
    });
    await page.locator('.mobile-config-editor-back').click();
    await expect(page.locator('#desktop-config-overview')).toBeVisible();
    await expect(page.locator('#desktop-config-editor')).toBeHidden();
});

test('narrow desktop pointer keeps equal dual panels instead of a giant single card', async ({ page }) => {
    await openCharacterConfig(page, 900, 900);
    await page.locator('.desktop-npc-avatar-button:not(.desktop-npc-add-button)').first().click();
    await waitForEqualPanels(page);

    const layout = await readDualPanelLayout(page);
    expect(layout.desktopMedia).toBe(true);
    expect(layout.overview.display).toBe('flex');
    expect(layout.editor.display).toBe('flex');
    expect(Math.abs(layout.overview.width - layout.editor.width)).toBeLessThan(1);
    expect(Math.abs(layout.overview.height - layout.editor.height)).toBeLessThan(1);
    expect(layout.horizontalOverflow).toBeLessThanOrEqual(0);
});

test('adding an NPC enters the editor directly and continues to acquaintance', async ({ page }) => {
    await openCharacterConfig(page);
    const countBefore = await page.evaluate(() => editingNpcs.length);

    await page.locator('.desktop-npc-add-button').click();
    const newIndex = await page.evaluate(() => editingNpcs.length - 1);
    expect(newIndex).toBe(countBefore);

    const screenState = await page.evaluate(() => {
        const screen = document.getElementById('edit-scenario-screen');
        return {
            section: screen.dataset.editorSection,
            previewOpen: screen.classList.contains('npc-preview-open'),
            acquaintanceOpen: screen.classList.contains('npc-acquaintance-open')
        };
    });
    expect(screenState).toEqual({
        section: 'npc',
        previewOpen: false,
        acquaintanceOpen: false
    });

    const activeCard = page.locator('#npc-list-container details.desktop-active-card');
    const ageField = page.locator(`#npc-age-${newIndex}`);
    const speechField = page.locator(`#npc-speech-${newIndex}`);
    await expect(activeCard.locator('.desktop-npc-editor-title')).toHaveCount(0);
    await expect(page.locator(`#npc-name-${newIndex}`)).toHaveValue('');
    await expect(page.locator(`#npc-name-${newIndex}`)).toHaveAttribute('placeholder', '輸入名稱');
    await expect(activeCard.locator('.desktop-npc-editor-name > span')).toHaveCount(0);
    await expect(activeCard.locator('.desktop-npc-editor-delete')).toHaveCount(0);
    await expect(activeCard.locator('.desktop-npc-editor-field > span')).toHaveText([
        '年齡／身高／體型',
        '說話習慣／語氣',
        '喜好',
        '厭惡',
        '外貌特徵／常見穿搭',
        '核心性格／背景故事'
    ]);
    await expect(ageField).toBeVisible();
    await expect(speechField.locator('xpath=..').locator('button')).toHaveCount(0);
    await ageField.fill('test build');

    await activeCard.locator('.desktop-npc-editor-actions .npc-flow-bracket-action').first().click();
    await expect(page.locator('#npc-acquaintance-flow')).toBeVisible();
    await expect(page.locator('#npc-acquaintance-flow [data-flow-view="intro"]')).toBeVisible();
});

test('AI output stays dialogue-only and refinement retry never auto-saves fields', async ({ page }) => {
    await openCharacterConfig(page);
    const parserResult = await page.evaluate(() => extractNpcAcquaintanceDialogue(
        '{"narrative":"hidden","dialogue":"only dialogue","options":[]}'
    ));
    expect(parserResult).toBe('only dialogue');

    const originalDetails = await page.evaluate(() => JSON.stringify(editingNpcs[0].details));
    await page.evaluate(() => {
        window.__npcAcquaintanceCalls = [];
        requestNpcAcquaintanceResponse = async (npcIndex, line, options) => {
            window.__npcAcquaintanceCalls.push({ npcIndex, line, options: { ...options } });
            if (window.__npcAcquaintanceCalls.length === 2) {
                throw new Error('retry once');
            }
            return window.__npcAcquaintanceCalls.length === 1 ? 'first reply' : 'second reply';
        };
    });

    await page.locator('.desktop-npc-avatar-button:not(.desktop-npc-add-button)').first().click();
    await page.locator('#desktop-npc-readonly-preview .npc-flow-bracket-action').click();
    await page.locator('#npc-acquaintance-flow [data-flow-action="question"]').click();
    await expect(page.locator(
        '#npc-acquaintance-flow [data-flow-view="question"] [data-flow-action="intro"]'
    )).toHaveCount(0);
    await expect(page.locator(
        '#npc-acquaintance-flow > .npc-flow-header [data-flow-action="close"]'
    )).toBeVisible();
    const questionOptions = page.locator('[data-option-group="question"] .npc-flow-option');
    const sendQuestionButton = page.locator('#npc-acquaintance-flow [data-flow-action="send-question"]');
    await expect(page.locator('[data-option-group="question"] .npc-flow-option[aria-pressed="true"]')).toHaveCount(0);
    await expect(sendQuestionButton).toBeDisabled();
    await questionOptions.first().click();
    await questionOptions.nth(1).hover();
    await expect(questionOptions.first()).toHaveAttribute('aria-pressed', 'true');
    expect(await questionOptions.first().evaluate(element => getComputedStyle(element, '::before').opacity)).toBe('1');
    expect(await questionOptions.nth(1).evaluate(element => getComputedStyle(element, '::before').opacity)).toBe('0');
    await sendQuestionButton.click();

    await expect(page.locator('.npc-flow-dialogue .msg-wrapper')).toHaveCount(2);
    await expect(page.locator('.npc-flow-dialogue .chat-avatar')).toHaveCount(2);
    await expect(page.locator('.npc-flow-identity')).toHaveCount(0);
    await expect(page.locator('.npc-flow-dialogue .msg-wrapper.npc .msg-text')).toHaveText('first reply');
    const echoedLine = await page.locator('.npc-flow-dialogue .msg-wrapper.player .msg-text').innerText();
    expect(echoedLine.length).toBeGreaterThan(0);
    expect(await page.evaluate(() => JSON.stringify(editingNpcs[0].details))).toBe(originalDetails);

    await page.locator('[data-option-group="judgement"] [data-option-value="refine"]').click();
    await page.locator('#npc-acquaintance-flow [data-flow-action="confirm-judgement"]').click();
    await page.locator('[data-option-group="refine"] [data-option-value="__custom__"]').click();
    await page.locator('[data-flow-input="custom-refine"]').fill('more reserved');
    await page.locator('#npc-acquaintance-flow [data-flow-action="retry-with-note"]').click();

    await expect(page.locator('.npc-flow-error')).toBeVisible();
    await page.locator('#npc-acquaintance-flow [data-flow-action="send-question"]').click();
    await expect(page.locator('.npc-flow-dialogue .msg-wrapper.npc .msg-text')).toHaveText('second reply');
    const confirmJudgementButton = page.locator('#npc-acquaintance-flow [data-flow-action="confirm-judgement"]');
    await expect(page.locator('[data-option-group="judgement"] .npc-flow-option[aria-pressed="true"]')).toHaveCount(0);
    await expect(confirmJudgementButton).toBeDisabled();
    await page.locator('[data-option-group="judgement"] [data-option-value="accept"]').click();

    const calls = await page.evaluate(() => window.__npcAcquaintanceCalls);
    expect(calls).toHaveLength(3);
    expect(calls[0].line).toBe(echoedLine);
    expect(calls[1].line).toBe(echoedLine);
    expect(calls[2].line).toBe(echoedLine);
    expect(calls[1].options.adjustment).toBe('more reserved');
    expect(calls[2].options.adjustment).toBe('more reserved');
    expect(await page.evaluate(() => JSON.stringify(editingNpcs[0].details))).toBe(originalDetails);

    await confirmJudgementButton.click();
    await expect(page.locator('#npc-acquaintance-flow [data-flow-view="save-note"]')).toBeVisible();
    await page.locator('#npc-acquaintance-flow [data-flow-action="skip-save"]').click();
    await expect(page.locator('#npc-acquaintance-flow [data-flow-view="confirmed"]')).toHaveCount(0);
    await expect(page.locator('#npc-acquaintance-flow [data-flow-view="scenario"]')).toBeVisible();
    expect(await page.evaluate(() => JSON.stringify(editingNpcs[0].details))).toBe(originalDetails);
});
