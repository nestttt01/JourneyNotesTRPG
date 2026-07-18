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

async function readNpcReturnLayout(page) {
    return page.evaluate(() => {
        const sharedBack = document.getElementById('config-editor-back');
        const title = document.querySelector('#npc-acquaintance-flow .npc-flow-title');
        const sharedBox = sharedBack.getBoundingClientRect();
        const panelBox = document.getElementById('desktop-config-editor').getBoundingClientRect();
        const svg = sharedBack.querySelector('svg');
        const use = svg.querySelector('use');
        const iconBox = use.getBBox();
        const iconMatrix = svg.getScreenCTM();
        const iconLeft = new DOMPoint(iconBox.x, iconBox.y).matrixTransform(iconMatrix).x;
        const titleBox = title?.getBoundingClientRect();
        const hit = document.elementFromPoint(
            sharedBox.left + sharedBox.width / 2,
            sharedBox.top + sharedBox.height / 2
        );
        const duplicateSelector = [
            '.desktop-npc-editor-header > .npc-flow-return-action',
            '#npc-acquaintance-flow .npc-flow-header > .npc-flow-return-action'
        ].join(',');
        const returnControls = [sharedBack, ...document.querySelectorAll(duplicateSelector)];
        return {
            sharedCount: document.querySelectorAll('#config-editor-back').length,
            sharedVisible: sharedBack.getClientRects().length > 0,
            sharedDisplay: getComputedStyle(sharedBack).display,
            sharedWidth: sharedBox.width,
            sharedHeight: sharedBox.height,
            sharedText: sharedBack.innerText.trim(),
            sharedBorder: getComputedStyle(sharedBack).borderTopWidth,
            sharedBackground: getComputedStyle(sharedBack).backgroundColor,
            sharedColor: getComputedStyle(sharedBack).color,
            sharedIconFill: getComputedStyle(svg).fill,
            sharedAriaLabel: sharedBack.getAttribute('aria-label'),
            sharedOwnsHit: hit === sharedBack || sharedBack.contains(hit),
            sharedLeft: sharedBox.left,
            sharedTop: sharedBox.top,
            sharedLeftInPanel: sharedBox.left - panelBox.left,
            sharedTopInPanel: sharedBox.top - panelBox.top,
            iconLeft,
            iconTitleDelta: titleBox ? Math.abs(iconLeft - titleBox.left) : null,
            iconViewBox: svg.getAttribute('viewBox'),
            iconRef: use.getAttribute('href'),
            duplicateReturnCount: document.querySelectorAll(duplicateSelector).length,
            visibleReturnCount: returnControls
                .filter(control => control.getClientRects().length > 0).length,
            horizontalOverflow: document.documentElement.scrollWidth - innerWidth
        };
    });
}

function expectSharedNpcReturn(layout) {
    expect(layout).toMatchObject({
        sharedCount: 1,
        sharedVisible: true,
        sharedDisplay: 'grid',
        sharedWidth: 44,
        sharedHeight: 44,
        sharedText: '',
        sharedBorder: '0px',
        sharedBackground: 'rgba(0, 0, 0, 0)',
        sharedColor: 'rgb(237, 255, 102)',
        sharedIconFill: 'rgb(237, 255, 102)',
        sharedAriaLabel: '返回',
        sharedOwnsHit: true,
        iconViewBox: '0 0 24 24',
        iconRef: '#theme-icon-back',
        duplicateReturnCount: 0,
        visibleReturnCount: 1,
        horizontalOverflow: 0
    });
}

function expectHiddenDesktopNpcReturn(layout) {
    expect(layout).toMatchObject({
        sharedCount: 1,
        sharedVisible: false,
        sharedDisplay: 'none',
        sharedWidth: 0,
        sharedHeight: 0,
        sharedOwnsHit: false,
        duplicateReturnCount: 0,
        visibleReturnCount: 0,
        horizontalOverflow: 0
    });
}

test('approved command hierarchy stays borderless and uses interruptible feedback', async ({ page }) => {
    await openCharacterConfig(page);
    await page.locator('.desktop-npc-avatar-button:not(.desktop-npc-add-button)').first().click();

    const primaryButton = page.locator('#desktop-npc-readonly-preview .ui-command-primary');
    await expect(primaryButton).toBeVisible();
    const rest = await primaryButton.evaluate(button => ({
        backgroundColor: getComputedStyle(button).backgroundColor,
        borderTopWidth: getComputedStyle(button).borderTopWidth,
        boxShadow: getComputedStyle(button).boxShadow,
        beforeContent: getComputedStyle(button, '::before').content,
        cursorAnimationName: getComputedStyle(button, '::before').animationName,
        cursorAnimationDuration: getComputedStyle(button, '::before').animationDuration
    }));
    expect(rest).toEqual({
        backgroundColor: 'rgba(0, 0, 0, 0)',
        borderTopWidth: '0px',
        boxShadow: 'none',
        beforeContent: '""',
        cursorAnimationName: 'ui-command-cursor-poke',
        cursorAnimationDuration: '0.9s'
    });

    await primaryButton.hover();
    await page.mouse.down();
    await page.waitForTimeout(50);
    const activePrimary = await primaryButton.evaluate(button => ({
        transform: getComputedStyle(button).transform,
        textShadow: getComputedStyle(button).textShadow,
        cursorAnimationName: getComputedStyle(button, '::before').animationName
    }));
    expect(activePrimary.transform).not.toBe('none');
    expect(activePrimary.textShadow).toContain('rgb(237, 255, 102)');
    expect(activePrimary.cursorAnimationName).toBe('none');
    await page.mouse.move(0, 0);
    await page.mouse.up();

    await page.evaluate(() => switchDesktopConfigWorkspace('game'));
    const secondaryButton = page.locator('.desktop-game-management-actions .ui-command-secondary').first();
    await expect(secondaryButton).toBeVisible();
    const secondaryRest = await secondaryButton.evaluate(button => {
        const line = getComputedStyle(button.querySelector('.ui-command-label'), '::after');
        return {
            height: line.height,
            borderTopWidth: line.borderTopWidth,
            borderBottomWidth: line.borderBottomWidth,
            boxShadow: line.boxShadow,
            transitionProperty: line.transitionProperty,
            transitionDuration: line.transitionDuration
        };
    });
    expect(secondaryRest).toEqual({
        height: '4px',
        borderTopWidth: '1px',
        borderBottomWidth: '1px',
        boxShadow: 'none',
        transitionProperty: 'transform',
        transitionDuration: '0.22s'
    });

    await secondaryButton.dispatchEvent('pointerdown', {
        pointerId: 1,
        pointerType: 'touch',
        button: 0,
        isPrimary: true
    });
    await expect(secondaryButton).toHaveClass(/is-tapped/);
    await page.waitForTimeout(240);
    expect(await secondaryButton.evaluate(button => (
        getComputedStyle(button.querySelector('.ui-command-label'), '::after').transform
    ))).toBe('matrix(1, 0, 0, 1, 0, 0)');
    await page.waitForTimeout(180);
    await expect(secondaryButton).not.toHaveClass(/is-tapped/);

    const staticCommandStyles = await page.evaluate(() => {
        const root = document.documentElement;
        const originalMode = root.dataset.bgMode;
        const selector = [
            '.desktop-game-two-buttons button.ui-command',
            '.desktop-game-management-actions button.ui-command'
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
    expect(staticCommandStyles.light.length).toBe(6);
    expect(staticCommandStyles.light).toEqual(staticCommandStyles.image);
    expect(staticCommandStyles.light.every(style => (
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

test('existing NPC opens a read-only detail sheet then enters questions directly', async ({ page }) => {
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

    await preview.locator('.desktop-npc-preview-actions .ui-command-primary').click();
    const flow = page.locator('#npc-acquaintance-flow');
    await expect(flow).toBeVisible();
    await expect(flow.locator('[data-flow-view="question"]')).toBeVisible();
    await expect(flow.locator('[data-flow-view="intro"]')).toHaveCount(0);
    await expect(flow.locator('.npc-flow-intro-identity')).toHaveCount(0);
    await expect(flow.locator('.npc-flow-basis-list')).toHaveCount(0);
    await expect(flow.locator('.npc-flow-progress')).toHaveText('01 / 02');
    await expect(flow.locator('[data-option-group="question"] .npc-flow-option')).toHaveCount(5);
    await expect(flow.locator('.npc-flow-title')).not.toHaveText('');
    const directQuestionStyle = await flow.evaluate(root => {
        const optionList = root.querySelector('.npc-flow-option-list');
        const title = root.querySelector('.npc-flow-title');
        return {
            headerBorderBottom: getComputedStyle(root.querySelector('.npc-flow-header')).borderBottomWidth,
            titleSize: getComputedStyle(title).fontSize,
            optionCount: optionList.querySelectorAll('.npc-flow-option').length,
            columns: getComputedStyle(optionList).gridTemplateColumns.split(' ').filter(Boolean).length,
            writingMode: getComputedStyle(title).writingMode,
            horizontalOverflow: document.documentElement.scrollWidth - innerWidth
        };
    });
    expect(directQuestionStyle).toMatchObject({
        headerBorderBottom: '0px',
        titleSize: '21px',
        optionCount: 5,
        columns: 1,
        writingMode: 'horizontal-tb'
    });
    expect(directQuestionStyle.horizontalOverflow).toBeLessThanOrEqual(0);
    const desktopQuestionBack = await readNpcReturnLayout(page);
    expectHiddenDesktopNpcReturn(desktopQuestionBack);
    const flowLayout = await readDualPanelLayout(page);
    expect(flowLayout.overview).toEqual(previewLayout.overview);
    expect(flowLayout.editor).toEqual(previewLayout.editor);

    await npcButtons.first().click();
    await expect(preview).toBeVisible();
    await preview.locator('.desktop-npc-preview-tool').click();
    await expect(page.locator('#npc-list-container details.desktop-active-card')).toBeVisible();
    await expect.poll(() => page.evaluate(() => (
        document.getElementById('desktop-config-editor').scrollTop
    ))).toBe(0);
    const editorActions = page.locator(
        '#npc-list-container details.desktop-active-card .desktop-npc-editor-actions .ui-command'
    );
    await expect(editorActions).toHaveCount(2);
    await expect(editorActions.first()).toBeVisible();
    await expect(editorActions.first()).toHaveClass(/ui-command-secondary/);
    await expect(editorActions.last()).toHaveClass(/ui-command-primary/);
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

    const secondaryLine = await editorActions.first().evaluate(button => {
        const line = getComputedStyle(button.querySelector('.ui-command-label'), '::after');
        return {
            height: line.height,
            borderTopWidth: line.borderTopWidth,
            boxShadow: line.boxShadow
        };
    });
    expect(secondaryLine).toEqual({
        height: '4px',
        borderTopWidth: '1px',
        boxShadow: 'none'
    });

    const editorLayout = await page.evaluate(() => {
        const panel = document.getElementById('desktop-config-editor').getBoundingClientRect();
        const avatar = document.querySelector(
            '#npc-list-container details.desktop-active-card .avatar-preview'
        ).getBoundingClientRect();
        return {
            avatarTop: avatar.top - panel.top,
            avatarSize: avatar.width
        };
    });
    expectHiddenDesktopNpcReturn(await readNpcReturnLayout(page));
    expect(editorLayout.avatarTop).toBeGreaterThan(0);
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

test('NPC layouts share one aligned return control across viewports', async ({ page, browser }) => {
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
        return {
            screenDisplay: getComputedStyle(document.getElementById('edit-scenario-screen')).display,
            overviewDisplay: getComputedStyle(document.getElementById('desktop-config-overview')).display,
            panelWidth: panel.width,
            columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
            writingMode: getComputedStyle(grid.querySelector('strong')).writingMode,
            contentGap: action.top - gridBox.bottom,
            actionInside: action.bottom < panel.bottom
        };
    });
    expect(previewLayout).toEqual({
        screenDisplay: 'flex',
        overviewDisplay: 'none',
        panelWidth: 526,
        columns: 1,
        writingMode: 'horizontal-tb',
        contentGap: 30,
        actionInside: true
    });
    const previewBack = await readNpcReturnLayout(page);
    expectSharedNpcReturn(previewBack);

    const sharedBack = page.locator('#config-editor-back');
    await sharedBack.click();
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
    const editorBack = await readNpcReturnLayout(page);
    expectSharedNpcReturn(editorBack);
    expect(editorBack.sharedLeft).toBeCloseTo(previewBack.sharedLeft, 5);
    expect(editorBack.sharedTop).toBeCloseTo(previewBack.sharedTop, 5);
    expect(editorBack.iconLeft).toBeCloseTo(previewBack.iconLeft, 5);

    await sharedBack.click();
    await expect(page.locator('#desktop-npc-readonly-preview')).toBeVisible();
    await page.locator('.desktop-npc-preview-actions button').click();
    const flowLayout = await page.evaluate(() => ({
        columns: getComputedStyle(document.querySelector('#npc-acquaintance-flow .npc-flow-option-list'))
            .gridTemplateColumns.split(' ').filter(Boolean).length,
        writingMode: getComputedStyle(
            document.querySelector('#npc-acquaintance-flow .npc-flow-title')
        ).writingMode,
        progress: document.querySelector('#npc-acquaintance-flow .npc-flow-progress').textContent.trim(),
        questionVisible: Boolean(document.querySelector(
            '#npc-acquaintance-flow [data-flow-view="question"]'
        )),
        introCount: document.querySelectorAll(
            '#npc-acquaintance-flow [data-flow-view="intro"]'
        ).length
    }));
    expect(flowLayout).toEqual({
        columns: 1,
        writingMode: 'horizontal-tb',
        progress: '01 / 02',
        questionVisible: true,
        introCount: 0
    });
    const flowBack = await readNpcReturnLayout(page);
    expectSharedNpcReturn(flowBack);
    expect(flowBack.iconTitleDelta).toBeLessThan(0.5);
    expect(flowBack.sharedLeft).toBeCloseTo(previewBack.sharedLeft, 5);
    expect(flowBack.sharedTop).toBeCloseTo(previewBack.sharedTop, 5);
    expect(flowBack.iconLeft).toBeCloseTo(previewBack.iconLeft, 5);

    await sharedBack.click();
    await expect(page.locator('#npc-acquaintance-flow')).toBeHidden();
    await expect(page.locator('#npc-list-container details.desktop-active-card')).toBeVisible();
    expectSharedNpcReturn(await readNpcReturnLayout(page));
    await sharedBack.click();
    await expect(page.locator('#desktop-npc-readonly-preview')).toBeVisible();
    await sharedBack.click();
    await expect(page.locator('#desktop-config-overview')).toBeVisible();
    await expect(page.locator('#desktop-config-editor')).toBeHidden();

    const coarseContext = await browser.newContext({
        baseURL: 'http://127.0.0.1:4173',
        viewport: { width: 815, height: 900 },
        hasTouch: true,
        isMobile: true
    });
    try {
        const coarsePage = await coarseContext.newPage();
        await openApp(coarsePage);
        await coarsePage.evaluate(() => openEditScenario());
        await coarsePage.locator(
            '.desktop-npc-avatar-button:not(.desktop-npc-add-button)'
        ).first().click();
        await coarsePage.locator('.desktop-npc-preview-actions button').click();
        expect(await coarsePage.evaluate(() => matchMedia(
            '(min-width: 1100px)'
        ).matches)).toBe(false);
        const coarseBack = await readNpcReturnLayout(coarsePage);
        expectSharedNpcReturn(coarseBack);
        expect(coarseBack.iconTitleDelta).toBeLessThan(0.5);
        await coarsePage.locator('#config-editor-back').click();
        await expect(coarsePage.locator('#npc-list-container details.desktop-active-card')).toBeVisible();
    } finally {
        await coarseContext.close();
    }
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
    expectHiddenDesktopNpcReturn(await readNpcReturnLayout(page));
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
    const acquaintanceAction = activeCard.locator(
        '.desktop-npc-editor-actions .ui-command-secondary'
    ).first();
    await acquaintanceAction.click();
    await expect(page.locator('#npc-acquaintance-flow')).toBeHidden();
    await expect(page.locator('.tiny-toast.show')).toHaveText(
        '\u8acb\u5148\u586b\u5beb\u81f3\u5c11\u4e00\u9805\u4eba\u7269\u57fa\u5e95\uff0c'
        + '\u518d\u958b\u59cb\u8a8d\u8b58\u5925\u4f34\u3002'
    );

    await ageField.fill('test build');
    await acquaintanceAction.click();
    await expect(page.locator('#npc-acquaintance-flow')).toBeVisible();
    await expect(page.locator('#npc-acquaintance-flow [data-flow-view="question"]')).toBeVisible();
    await expect(page.locator('#npc-acquaintance-flow [data-flow-view="intro"]')).toHaveCount(0);
    await expect(page.locator('#npc-acquaintance-flow .npc-flow-progress')).toHaveText('01 / 02');
});

test('asking the NPC again returns directly to the question view', async ({ page }) => {
    await openCharacterConfig(page);
    await page.evaluate(() => {
        requestNpcAcquaintanceResponse = async () => 'direct return reply';
    });

    await page.locator('.desktop-npc-avatar-button:not(.desktop-npc-add-button)').first().click();
    await page.locator('#desktop-npc-readonly-preview .ui-command-primary').click();
    await page.locator('[data-option-group="question"] .npc-flow-option').first().click();
    await page.locator('#npc-acquaintance-flow [data-flow-action="send-question"]').click();
    await expect(page.locator('#npc-acquaintance-flow [data-flow-view="response"]')).toBeVisible();

    await page.locator('[data-option-group="judgement"] [data-option-value="again"]').click();

    await expect(page.locator('#npc-acquaintance-flow [data-flow-view="question"]')).toBeVisible();
    await expect(page.locator('#npc-acquaintance-flow [data-flow-view="response"]')).toHaveCount(0);
    await expect(page.locator('#npc-acquaintance-flow .npc-flow-progress')).toHaveText('01 / 02');
    await expect(page.locator('[data-option-group="question"] .npc-flow-option[aria-pressed="true"]')).toHaveCount(0);
    await expect(page.locator('#npc-acquaintance-flow [data-flow-action="send-question"]')).toBeDisabled();
    await expect(page.locator('#npc-acquaintance-flow [data-flow-action="confirm-judgement"]')).toHaveCount(0);
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
    await page.locator('#desktop-npc-readonly-preview .ui-command-primary').click();
    await expect(page.locator('#npc-acquaintance-flow [data-flow-view="question"]')).toBeVisible();
    await expect(page.locator('#npc-acquaintance-flow [data-flow-view="intro"]')).toHaveCount(0);
    await expect(page.locator('#npc-acquaintance-flow .npc-flow-progress')).toHaveText('01 / 02');
    await expect(page.locator('#config-editor-back')).toBeHidden();
    await expect(page.locator(
        '#npc-acquaintance-flow > .npc-flow-header .npc-flow-return-action'
    )).toHaveCount(0);
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

    const previousStep = page.locator(
        '#npc-acquaintance-flow [data-flow-view="scenario"] [data-flow-action="response"]'
    );
    await expect(previousStep).toHaveClass(/ui-command-secondary/);
    await previousStep.click();
    await expect(page.locator('#npc-acquaintance-flow')).toBeVisible();
    await expect(page.locator('#npc-acquaintance-flow [data-flow-view="response"]')).toBeVisible();
    await confirmJudgementButton.click();
    await expect(page.locator('#npc-acquaintance-flow [data-flow-view="save-note"]')).toBeVisible();
    await page.locator('#npc-acquaintance-flow [data-flow-action="skip-save"]').click();
    await expect(page.locator('#npc-acquaintance-flow [data-flow-view="scenario"]')).toBeVisible();

    const scenarioOptions = page.locator('[data-option-group="scenarioIndex"] .npc-flow-option');
    expect(await scenarioOptions.count()).toBeGreaterThan(0);
    await scenarioOptions.first().click();
    const scenarioInput = page.locator('[data-flow-input="scenario-line"]');
    await scenarioInput.fill('scenario check');
    const runScenario = page.locator('#npc-acquaintance-flow [data-flow-action="run-scenario"]');
    await runScenario.click();
    await expect(page.locator('#npc-acquaintance-flow [data-flow-view="scenario-response"]')).toBeVisible();
    const chooseAnotherScenario = page.locator(
        '#npc-acquaintance-flow [data-flow-view="scenario-response"] [data-flow-action="scenario"]'
    );
    await expect(chooseAnotherScenario).toHaveClass(/ui-command-secondary/);
    await chooseAnotherScenario.click();
    await expect(page.locator('#npc-acquaintance-flow [data-flow-view="scenario"]')).toBeVisible();
    await expect(scenarioInput).toHaveValue('scenario check');
    await runScenario.click();
    await expect(page.locator('#npc-acquaintance-flow [data-flow-view="scenario-response"]')).toBeVisible();

    const finishAction = page.locator('#npc-acquaintance-flow [data-flow-action="finish"]');
    await expect(finishAction).toHaveClass(/ui-command-primary/);
    await expect(finishAction).toHaveText('完美！');
    await finishAction.click();
    await expect(page.locator('#npc-acquaintance-flow')).toBeHidden();
    await expect(page.locator('#desktop-npc-readonly-preview')).toBeVisible();
    expect(await page.evaluate(() => {
        const screen = document.getElementById('edit-scenario-screen');
        return {
            previewOpen: screen.classList.contains('npc-preview-open'),
            acquaintanceOpen: screen.classList.contains('npc-acquaintance-open')
        };
    })).toEqual({ previewOpen: true, acquaintanceOpen: false });
    const finalCalls = await page.evaluate(() => window.__npcAcquaintanceCalls);
    expect(finalCalls).toHaveLength(5);
    expect(finalCalls[3].options.scenarioIndex).toBe(0);
    expect(finalCalls[4].options.scenarioIndex).toBe(0);
    expect(await page.evaluate(() => JSON.stringify(editingNpcs[0].details))).toBe(originalDetails);
});
