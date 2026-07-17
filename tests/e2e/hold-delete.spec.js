const { test, expect } = require('@playwright/test');
const { openApp } = require('./test-helpers');

async function openStatusDeleteFixture(page) {
    await openApp(page);
    await page.evaluate(() => {
        setUiLanguage('zh-TW');
        currentSaveId = 'hold-delete-status-test';
        savesData[currentSaveId] = { respecCount: 0 };
        currentScenario = {
            playerName: '測試玩家',
            languageMode: 'zh-tw',
            playerStats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
            playerDetails: { age: '', speech: '', likes: '', dislikes: '', app: '', bg: '' },
            playerProficiencies: ['觀察'],
            npcs: [],
            scenarios: []
        };
        currentScenarioIndex = 0;
        currentStorySummary = '';
        currentOpenTasks = '☐ 測試任務';
        currentRelationshipSummary = '';
        currentAdventureLog = '';
        currentFlags = ['警戒'];
        currentItems = ['快樂'];
        openStatusModal();
        switchStatusTab('log');
    });
}

test('text delete expands away from neighbors while symbol delete stays a symbol', async ({ page }) => {
    await openStatusDeleteFixture(page);
    await page.evaluate(() => document.fonts.ready);

    const taskDelete = page.locator('.memory-task-remove');
    const itemDelete = page.locator('.item-remove-btn');
    await expect(taskDelete).toHaveCount(1);
    await expect(itemDelete).toHaveCount(1);

    const before = await page.evaluate(() => {
        const task = document.querySelector('.memory-task-remove');
        const row = task.closest('.memory-task-row');
        const fail = row.querySelector('.memory-task-fail');
        return {
            taskBox: task.getBoundingClientRect().toJSON(),
            rowBox: row.getBoundingClientRect().toJSON(),
            failBox: fail.getBoundingClientRect().toJSON()
        };
    });

    await taskDelete.click();
    const armedTask = await page.evaluate(() => {
        const task = document.querySelector('.memory-task-remove');
        const prompt = task.querySelector('.hold-delete-prompt');
        const base = task.querySelector('.hold-delete-base');
        const wash = task.querySelector('.hold-delete-wash');
        const taskStyle = getComputedStyle(task);
        const promptStyle = getComputedStyle(prompt);
        const baseStyle = getComputedStyle(base);
        const washStyle = getComputedStyle(wash);
        return {
            state: task.dataset.holdState,
            idleText: task.querySelector('.hold-delete-idle').textContent,
            baseText: task.querySelector('.hold-delete-base').textContent,
            washText: task.querySelector('.hold-delete-wash').textContent,
            taskBox: task.getBoundingClientRect().toJSON(),
            rowBox: task.closest('.memory-task-row').getBoundingClientRect().toJSON(),
            promptBox: prompt.getBoundingClientRect().toJSON(),
            feedbackCount: document.querySelectorAll('.hold-delete-feedback').length,
            fontSize: taskStyle.fontSize,
            fontFamily: taskStyle.fontFamily,
            fontWeight: taskStyle.fontWeight,
            letterSpacing: taskStyle.letterSpacing,
            promptFontFamily: promptStyle.fontFamily,
            promptFontSize: promptStyle.fontSize,
            promptFontWeight: promptStyle.fontWeight,
            promptLetterSpacing: promptStyle.letterSpacing,
            baseFontSize: baseStyle.fontSize,
            washFontSize: washStyle.fontSize,
            baseFontFamily: baseStyle.fontFamily,
            washFontFamily: washStyle.fontFamily,
            baseFontWeight: baseStyle.fontWeight,
            washFontWeight: washStyle.fontWeight
        };
    });

    expect(armedTask.state).toBe('armed');
    expect(armedTask.idleText).toBe('DEL');
    expect(armedTask.baseText).toBe('長按以刪除');
    expect(armedTask.washText).toBe('長按以刪除');
    expect(Math.abs(armedTask.taskBox.width - before.taskBox.width)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(armedTask.rowBox.width - before.rowBox.width)).toBeLessThanOrEqual(0.5);
    expect(armedTask.promptBox.left).toBeGreaterThanOrEqual(before.failBox.right - 0.5);
    expect(armedTask.feedbackCount).toBe(0);
    expect(armedTask.fontSize).toBe('12px');
    expect(armedTask.fontFamily).toContain('TRPG Cubic Pixel');
    expect(armedTask.fontWeight).toBe('400');
    expect(armedTask.letterSpacing).toBe('1px');
    expect(armedTask.promptFontFamily).toContain('TRPG Cubic Pixel');
    expect(armedTask.promptFontSize).toBe('12px');
    expect(armedTask.promptFontWeight).toBe('400');
    expect(armedTask.promptLetterSpacing).toBe('1px');
    expect(armedTask.baseFontSize).toBe(armedTask.fontSize);
    expect(armedTask.washFontSize).toBe(armedTask.fontSize);
    expect(armedTask.baseFontFamily).toContain('TRPG Cubic Pixel');
    expect(armedTask.washFontFamily).toContain('TRPG Cubic Pixel');
    expect(armedTask.baseFontWeight).toBe(armedTask.washFontWeight);

    await page.evaluate(() => switchStatusTab('state'));
    const itemBefore = await page.evaluate(() => {
        const item = document.querySelector('.item-remove-btn');
        return {
            itemBox: item.getBoundingClientRect().toJSON(),
            itemTagBox: item.closest('.item-tag').getBoundingClientRect().toJSON()
        };
    });
    await itemDelete.click();
    const armedItem = await page.evaluate(() => {
        const task = document.querySelector('.memory-task-remove');
        const item = document.querySelector('.item-remove-btn');
        return {
            taskState: task.dataset.holdState,
            itemState: item.dataset.holdState,
            itemText: item.textContent,
            baseText: item.querySelector('.hold-delete-base').textContent,
            washText: item.querySelector('.hold-delete-wash').textContent,
            title: item.title,
            ariaLabel: item.getAttribute('aria-label'),
            washColor: getComputedStyle(item.querySelector('.hold-delete-wash')).color,
            itemBox: item.getBoundingClientRect().toJSON(),
            itemTagBox: item.closest('.item-tag').getBoundingClientRect().toJSON()
        };
    });

    expect(armedItem.taskState).toBe('idle');
    expect(armedItem.itemState).toBe('armed');
    expect(armedItem.itemText).not.toContain('長按以刪除');
    expect(armedItem.baseText).toBe('×');
    expect(armedItem.washText).toBe('×');
    expect(armedItem.title).toContain('刪除道具：快樂');
    expect(armedItem.title).not.toBe('長按以刪除');
    expect(armedItem.ariaLabel).toContain('刪除道具：快樂');
    expect(armedItem.washColor).toBe('rgb(255, 68, 68)');
    expect(Math.abs(armedItem.itemBox.width - itemBefore.itemBox.width)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(armedItem.itemTagBox.width - itemBefore.itemTagBox.width)).toBeLessThanOrEqual(0.5);
});

test('idle item delete labels refresh with the selected language', async ({ page }) => {
    await openStatusDeleteFixture(page);
    await page.evaluate(() => switchStatusTab('state'));
    const itemDelete = page.locator('.item-remove-btn');

    await expect(itemDelete).toHaveAttribute('aria-label', '刪除道具：快樂');
    await expect(itemDelete).toHaveAttribute('title', '刪除道具：快樂');

    await page.evaluate(() => setUiLanguage('en'));
    await expect(itemDelete).toHaveAttribute('aria-label', 'Delete item: 快樂');
    await expect(itemDelete).toHaveAttribute('title', 'Delete item: 快樂');

    await page.evaluate(() => setUiLanguage('ja'));
    await expect(itemDelete).toHaveAttribute('aria-label', 'アイテムを削除：快樂');
    await expect(itemDelete).toHaveAttribute('title', 'アイテムを削除：快樂');
});

test('all eight production delete callers use the shared controller contract', async ({ page }) => {
    await openStatusDeleteFixture(page);
    const callers = await page.evaluate(() => {
        const proficiencyFixture = document.createElement('div');
        proficiencyFixture.dataset.proficiencyTags = '';
        document.getElementById('game-container').appendChild(proficiencyFixture);
        renderProficiencyTags();

        editingNpcs = [{
            name: '測試 NPC',
            age: '',
            gender: '',
            appearance: '',
            personality: '',
            background: '',
            details: {}
        }];
        editingScenarios = [{
            name: '測試情境',
            description: '',
            playerRole: '',
            objective: '',
            transitionRule: ''
        }];
        renderNpcList();
        renderScenarioList();

        savesData[currentSaveId].scenario = currentScenario;
        savesData[currentSaveId].collections = [{
            lines: [],
            caption: '測試收藏',
            date: '2026-07-18'
        }];
        diaryViewSaveId = currentSaveId;
        diaryViewIndex = 0;
        renderDiary();

        savesData[currentSaveId].log = '測試冒險紀錄';
        journalSelectedSaveId = currentSaveId;
        journalSearchText = '';
        journalImportantOnly = false;
        renderAdventureJournal();

        const inspect = selector => {
            const button = document.querySelector(selector);
            return {
                ready: button?.dataset.holdDeleteReady,
                compact: button?.classList.contains('hold-delete-compact'),
                text: button?.classList.contains('hold-delete-text'),
                idle: button?.querySelector('.hold-delete-idle')?.textContent,
                expand: button?.dataset.holdExpand
            };
        };
        return {
            task: inspect('.memory-task-remove'),
            flag: inspect('.flag-remove-btn'),
            item: inspect('.item-remove-btn'),
            proficiency: inspect('.proficiency-tag-remove'),
            diary: inspect('.diary-pg-del'),
            journal: inspect('.journal-entry-delete'),
            npc: inspect('.desktop-npc-editor-delete'),
            scenario: inspect('.delete-scen-btn')
        };
    });

    expect(callers).toEqual({
        task: { ready: 'true', compact: false, text: true, idle: 'DEL', expand: 'end' },
        flag: { ready: 'true', compact: true, text: false, idle: '✖', expand: 'start' },
        item: { ready: 'true', compact: true, text: false, idle: '×', expand: 'start' },
        proficiency: { ready: 'true', compact: true, text: false, idle: '✖', expand: 'start' },
        diary: { ready: 'true', compact: true, text: false, idle: '✕', expand: 'start' },
        journal: { ready: 'true', compact: true, text: false, idle: '－', expand: 'start' },
        npc: { ready: 'true', compact: false, text: true, idle: '刪除 NPC', expand: 'end' },
        scenario: { ready: 'true', compact: false, text: true, idle: '刪除', expand: 'start' }
    });
});

test('full hold paints the final frame before one commit', async ({ page }) => {
    await openApp(page);
    await page.evaluate(() => {
        const button = document.createElement('button');
        button.id = 'hold-delete-timing';
        button.textContent = 'DEL';
        document.body.appendChild(button);
        window.__holdDeleteCommitCount = 0;
        window.__holdDeleteCommitSnapshot = null;
        window.__holdDeleteStartedAt = 0;
        button.addEventListener('pointerdown', () => {
            window.__holdDeleteStartedAt = performance.now();
        });
        configureHoldDeleteButton(button, () => {
            const wash = button.querySelector('.hold-delete-wash');
            window.__holdDeleteCommitCount += 1;
            window.__holdDeleteCommitSnapshot = {
                elapsed: performance.now() - window.__holdDeleteStartedAt,
                clipPath: getComputedStyle(wash).clipPath
            };
        }, {
            idleText: 'DEL',
            expandDirection: 'end',
            ariaLabelKey: '刪除任務'
        });
    });

    const button = page.locator('#hold-delete-timing');
    await expect(button).toHaveCount(1);
    await button.click();
    const box = await button.boundingBox();
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    await page.waitForTimeout(250);
    await page.mouse.up();
    expect(await page.evaluate(() => window.__holdDeleteCommitCount)).toBe(0);
    await expect(button).toHaveAttribute('data-hold-state', 'armed');

    await page.waitForTimeout(1300);
    expect(await page.evaluate(() => window.__holdDeleteCommitCount)).toBe(0);
    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    await page.waitForTimeout(1150);
    expect(await page.evaluate(() => window.__holdDeleteCommitCount)).toBe(0);
    await page.waitForFunction(() => window.__holdDeleteCommitCount === 1);
    await page.mouse.up();
    await expect(button).toHaveAttribute('data-hold-state', 'idle');
    await expect(button).not.toHaveClass(/is-holding/);

    const snapshot = await page.evaluate(() => window.__holdDeleteCommitSnapshot);
    expect(snapshot.elapsed).toBeGreaterThanOrEqual(1240);
    expect(snapshot.clipPath).toMatch(/^inset\(0px(?: (?:0px|0%)){0,3}\)$/);
    expect(await page.evaluate(() => window.__holdDeleteCommitCount)).toBe(1);
});

test('movement cancels safely and compact controls preserve mobile gestures', async ({ page }) => {
    await openApp(page);
    await page.evaluate(() => {
        const plainText = document.createElement('p');
        plainText.id = 'ordinary-selectable-text';
        plainText.textContent = '一般文字仍可選取';
        document.body.appendChild(plainText);

        const button = document.createElement('button');
        button.id = 'hold-delete-symbol';
        button.textContent = '✖';
        button.style.width = '80px';
        button.style.height = '32px';
        document.body.appendChild(button);
        window.__holdDeleteSymbolCommits = 0;
        configureHoldDeleteButton(button, () => {
            window.__holdDeleteSymbolCommits += 1;
        }, {
            idleText: '✖',
            compact: true,
            ariaLabelKey: '刪除此標籤'
        });
    });

    const button = page.locator('#hold-delete-symbol');
    await button.click();
    const box = await button.boundingBox();
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    await page.mouse.move(centerX + 12, centerY);
    await page.waitForTimeout(50);
    await page.mouse.up();

    await expect(button).toHaveAttribute('data-hold-state', 'idle');
    expect(await page.evaluate(() => window.__holdDeleteSymbolCommits)).toBe(0);
    const styles = await page.evaluate(() => {
        const control = getComputedStyle(document.getElementById('hold-delete-symbol'));
        const ordinary = getComputedStyle(document.getElementById('ordinary-selectable-text'));
        return {
            touchAction: control.touchAction,
            userSelect: control.userSelect,
            ordinaryUserSelect: ordinary.userSelect,
            text: document.getElementById('hold-delete-symbol').textContent,
            title: document.getElementById('hold-delete-symbol').title,
            washColor: getComputedStyle(
                document.querySelector('#hold-delete-symbol .hold-delete-wash')
            ).color
        };
    });
    expect(styles.touchAction).toBe('manipulation');
    expect(styles.userSelect).toBe('none');
    expect(styles.ordinaryUserSelect).not.toBe('none');
    expect(styles.text).not.toContain('長按以刪除');
    expect(styles.title).toBe('刪除此標籤');
    expect(styles.washColor).toBe('rgb(255, 68, 68)');
});

test('text delete variants share one project typography source', async ({ page }) => {
    await openApp(page);
    await page.evaluate(() => {
        const editor = document.getElementById('desktop-config-editor');
        const details = document.createElement('details');
        details.className = 'desktop-active-card';
        details.open = true;
        const content = document.createElement('div');
        content.className = 'foldable-content';
        const scenario = document.createElement('button');
        scenario.id = 'typography-scenario-delete';
        scenario.className = 'delete-scen-btn';
        content.appendChild(scenario);
        details.appendChild(content);
        editor.appendChild(details);

        const task = document.createElement('button');
        task.id = 'typography-task-delete';
        task.className = 'memory-task-remove';
        const npc = document.createElement('button');
        npc.id = 'typography-npc-delete';
        npc.className = 'desktop-npc-editor-delete';
        document.body.append(task, npc);

        configureHoldDeleteButton(task, () => {}, {
            idleText: 'DEL',
            expandDirection: 'end',
            ariaLabelKey: '刪除任務'
        });
        configureHoldDeleteButton(npc, () => {}, {
            labelKey: '刪除 NPC',
            expandDirection: 'end',
            ariaLabelKey: '刪除 NPC'
        });
        configureHoldDeleteButton(scenario, () => {}, {
            labelKey: '刪除',
            ariaLabelKey: '刪除'
        });
    });
    await page.evaluate(() => document.fonts.ready);

    const typography = await page.evaluate(() => [
        '#typography-task-delete',
        '#typography-npc-delete',
        '#typography-scenario-delete'
    ].map(selector => {
        const button = document.querySelector(selector);
        const base = button.querySelector('.hold-delete-base');
        const wash = button.querySelector('.hold-delete-wash');
        const style = getComputedStyle(button);
        return {
            selector,
            fontFamily: style.fontFamily,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            letterSpacing: style.letterSpacing,
            baseFontFamily: getComputedStyle(base).fontFamily,
            washFontFamily: getComputedStyle(wash).fontFamily
        };
    }));

    for (const variant of typography) {
        expect(variant.fontFamily, variant.selector).toContain('TRPG Cubic Pixel');
        expect(variant.fontSize, variant.selector).toBe('12px');
        expect(variant.fontWeight, variant.selector).toBe('400');
        expect(variant.letterSpacing, variant.selector).toBe('1px');
        expect(variant.baseFontFamily, variant.selector).toContain('TRPG Cubic Pixel');
        expect(variant.washFontFamily, variant.selector).toContain('TRPG Cubic Pixel');
    }

    await page.setViewportSize({ width: 390, height: 844 });
    const scenarioMinHeight = await page.locator('#typography-scenario-delete').evaluate(
        button => getComputedStyle(button).minHeight
    );
    expect(scenarioMinHeight).toBe('44px');
});

test('pointercancel between the hold timer and final paint cancels deletion', async ({ page }) => {
    await openApp(page);
    await page.evaluate(() => new Promise(resolve => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
    }));
    await page.evaluate(() => {
        const button = document.createElement('button');
        button.id = 'hold-delete-raf-cancel';
        button.textContent = 'DEL';
        document.body.appendChild(button);
        window.__rafCancelCommits = 0;
        configureHoldDeleteButton(button, () => {
            window.__rafCancelCommits += 1;
        }, {
            idleText: 'DEL',
            ariaLabelKey: '刪除任務'
        });
    });

    const button = page.locator('#hold-delete-raf-cancel');
    await button.click();
    await expect(button).toHaveAttribute('data-hold-state', 'armed');

    await page.evaluate(() => {
        window.__heldDeleteRafs = [];
        window.__originalDeleteRaf = window.requestAnimationFrame;
        window.requestAnimationFrame = callback => {
            window.__heldDeleteRafs.push(callback);
            return 9000 + window.__heldDeleteRafs.length;
        };
        const target = document.getElementById('hold-delete-raf-cancel');
        window.__rafCancelPointerDownAt = performance.now();
        target.dispatchEvent(new PointerEvent('pointerdown', {
            bubbles: true,
            pointerId: 47,
            pointerType: 'touch',
            isPrimary: true,
            button: 0,
            clientX: 20,
            clientY: 20
        }));
    });

    await page.waitForFunction(() => (
        performance.now() - window.__rafCancelPointerDownAt >= 1220
        && window.__heldDeleteRafs.length >= 1
    ));
    await page.evaluate(() => {
        document.getElementById('hold-delete-raf-cancel').dispatchEvent(
            new PointerEvent('pointercancel', {
                bubbles: true,
                pointerId: 47,
                pointerType: 'touch',
                isPrimary: true
            })
        );
    });
    await expect(button).toHaveAttribute('data-hold-state', 'idle');
    await expect(button).not.toHaveClass(/is-holding/);

    await page.evaluate(() => {
        const pending = window.__heldDeleteRafs.splice(0);
        pending.forEach(callback => callback(performance.now()));
        window.requestAnimationFrame = window.__originalDeleteRaf;
    });
    await page.waitForTimeout(80);
    expect(await page.evaluate(() => window.__rafCancelCommits)).toBe(0);
});

test('cancel during the final dwell cannot commit a newly armed attempt', async ({ page }) => {
    await openApp(page);
    await page.evaluate(() => new Promise(resolve => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
    }));
    await page.evaluate(() => {
        const button = document.createElement('button');
        button.id = 'hold-delete-dwell-cancel';
        button.textContent = 'DEL';
        document.body.appendChild(button);
        window.__dwellCancelCommits = 0;
        configureHoldDeleteButton(button, () => {
            window.__dwellCancelCommits += 1;
        }, {
            idleText: 'DEL',
            ariaLabelKey: '刪除任務'
        });
        button.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            detail: 1
        }));

        window.__heldDwellRafs = [];
        window.__originalDwellRaf = window.requestAnimationFrame;
        window.requestAnimationFrame = callback => {
            window.__heldDwellRafs.push(callback);
            return 9100 + window.__heldDwellRafs.length;
        };
        window.__dwellPointerDownAt = performance.now();
        button.dispatchEvent(new PointerEvent('pointerdown', {
            bubbles: true,
            pointerId: 73,
            pointerType: 'touch',
            isPrimary: true,
            button: 0,
            clientX: 20,
            clientY: 20
        }));
    });

    await page.waitForFunction(() => (
        performance.now() - window.__dwellPointerDownAt >= 1220
        && window.__heldDwellRafs.length >= 1
    ));
    await page.evaluate(() => {
        const pending = window.__heldDwellRafs.splice(0);
        pending.forEach(callback => callback(performance.now()));
        window.requestAnimationFrame = window.__originalDwellRaf;
        const button = document.getElementById('hold-delete-dwell-cancel');
        button.dispatchEvent(new PointerEvent('pointercancel', {
            bubbles: true,
            pointerId: 73,
            pointerType: 'touch',
            isPrimary: true
        }));
        button.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            detail: 1
        }));
    });

    const button = page.locator('#hold-delete-dwell-cancel');
    await page.waitForTimeout(80);
    await expect(button).toHaveAttribute('data-hold-state', 'armed');
    expect(await page.evaluate(() => window.__dwellCancelCommits)).toBe(0);
});

test('removing a button during a short hold clears its armed state', async ({ page }) => {
    await openApp(page);
    await page.evaluate(() => {
        const button = document.createElement('button');
        button.textContent = 'DEL';
        document.body.appendChild(button);
        window.__detachedDeleteButton = button;
        window.__detachedDeleteCommits = 0;
        configureHoldDeleteButton(button, () => {
            window.__detachedDeleteCommits += 1;
        }, {
            idleText: 'DEL',
            ariaLabelKey: '刪除任務'
        });
        button.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            detail: 1
        }));
        button.dispatchEvent(new PointerEvent('pointerdown', {
            bubbles: true,
            pointerId: 91,
            pointerType: 'touch',
            isPrimary: true,
            button: 0
        }));
        button.remove();
        document.dispatchEvent(new PointerEvent('pointerup', {
            bubbles: true,
            pointerId: 91,
            pointerType: 'touch',
            isPrimary: true,
            button: 0
        }));
    });
    await page.waitForTimeout(1300);
    const state = await page.evaluate(() => {
        const button = window.__detachedDeleteButton;
        return {
            holdState: button.dataset.holdState,
            isHolding: button.classList.contains('is-holding'),
            commits: window.__detachedDeleteCommits
        };
    });

    expect(state).toEqual({ holdState: 'idle', isHolding: false, commits: 0 });
});

test('keyboard activation disarms another armed delete before confirming', async ({ page }) => {
    await openApp(page);
    await page.evaluate(() => {
        const first = document.createElement('button');
        first.id = 'hold-delete-a';
        first.textContent = 'DEL A';
        const second = document.createElement('button');
        second.id = 'hold-delete-b';
        second.textContent = 'DEL B';
        document.body.append(first, second);
        window.__keyboardACommits = 0;
        window.__keyboardBCommits = 0;
        window.__keyboardConfirmCalls = 0;
        window.confirm = () => {
            window.__keyboardConfirmCalls += 1;
            return true;
        };
        configureHoldDeleteButton(first, () => {
            window.__keyboardACommits += 1;
        }, {
            idleText: 'DEL A',
            ariaLabelKey: '刪除任務'
        });
        configureHoldDeleteButton(second, () => {
            window.__keyboardBCommits += 1;
        }, {
            idleText: 'DEL B',
            ariaLabelKey: '刪除任務'
        });
    });

    const first = page.locator('#hold-delete-a');
    const second = page.locator('#hold-delete-b');
    await first.click();
    await expect(first).toHaveAttribute('data-hold-state', 'armed');
    await second.focus();
    await page.keyboard.press('Enter');

    await expect(first).toHaveAttribute('data-hold-state', 'idle');
    await expect(second).toHaveAttribute('data-hold-state', 'idle');
    expect(await page.evaluate(() => ({
        first: window.__keyboardACommits,
        second: window.__keyboardBCommits,
        confirms: window.__keyboardConfirmCalls
    }))).toEqual({ first: 0, second: 1, confirms: 1 });
});

test.describe('coarse-pointer configuration layout', () => {
    test.use({
        hasTouch: true,
        viewport: { width: 800, height: 900 }
    });

    test('scenario delete keeps the mobile touch target on a tablet', async ({ page }) => {
        await openApp(page);
        const result = await page.evaluate(() => {
            const details = document.createElement('details');
            details.className = 'desktop-active-card';
            details.open = true;
            const button = document.createElement('button');
            button.className = 'delete-scen-btn';
            details.appendChild(button);
            document.getElementById('desktop-config-editor').appendChild(details);
            configureHoldDeleteButton(button, () => {}, {
                labelKey: '刪除',
                ariaLabelKey: '刪除'
            });
            return {
                coarsePointer: matchMedia('(pointer: coarse)').matches,
                minHeight: getComputedStyle(button).minHeight
            };
        });

        expect(result).toEqual({ coarsePointer: true, minHeight: '44px' });
    });
});
