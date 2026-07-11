const { test, expect } = require('@playwright/test');
const { openApp } = require('./test-helpers');

async function readTaskState(page) {
    return page.evaluate(() => ({
        tasks: serializeTaskChecklist(parseTaskChecklist(currentOpenTasks)),
        log: currentAdventureLog
    }));
}

test('task updates enforce completion, failure and reopen rules', async ({ page }) => {
    await openApp(page);
    await page.evaluate(() => {
        currentOpenTasks = '\u2610 \u8b77\u9001\u5546\u968a\u5230\u5317\u93ae\n\u2610 \u8abf\u67e5\u7926\u5751\u7570\u8072';
        currentAdventureLog = '\u2022 \u6545\u4e8b\u958b\u59cb';
    });

    const completed = await page.evaluate(() => applyTaskUpdates([
        { action: 'complete', text: '\u8b77\u9001\u5546\u968a\u5230\u5317\u93ae', reason: '\u5546\u968a\u5df2\u5e73\u5b89\u62b5\u9054' }
    ]));
    expect(completed).toBe(true);
    let state = await readTaskState(page);
    expect(state.tasks).toContain('\u2611 \u8b77\u9001\u5546\u968a\u5230\u5317\u93ae');
    expect(state.log).toContain('\u4efb\u52d9\u5b8c\u6210\uff1a\u8b77\u9001\u5546\u968a\u5230\u5317\u93ae\uff08\u5546\u968a\u5df2\u5e73\u5b89\u62b5\u9054\uff09');

    const failedWithoutReason = await page.evaluate(() => applyTaskUpdates([
        { action: 'fail', text: '\u8abf\u67e5\u7926\u5751\u7570\u8072' }
    ]));
    expect(failedWithoutReason).toBe(false);
    state = await readTaskState(page);
    expect(state.tasks).toContain('\u2610 \u8abf\u67e5\u7926\u5751\u7570\u8072');

    const failedWithReason = await page.evaluate(() => applyTaskUpdates([
        { action: 'fail', text: '\u8abf\u67e5\u7926\u5751\u7570\u8072', reason: '\u7926\u5751\u5df2\u6c38\u4e45\u584c\u9677' }
    ]));
    expect(failedWithReason).toBe(true);
    state = await readTaskState(page);
    expect(state.tasks).toContain('\u2612 \u8abf\u67e5\u7926\u5751\u7570\u8072');
    expect(state.log).toContain('\u4efb\u52d9\u5931\u6557\uff1a\u8abf\u67e5\u7926\u5751\u7570\u8072\uff08\u7926\u5751\u5df2\u6c38\u4e45\u584c\u9677\uff09');

    const completeFailed = await page.evaluate(() => applyTaskUpdates([
        { action: 'complete', text: '\u8abf\u67e5\u7926\u5751\u7570\u8072', reason: '\u4e0d\u61c9\u751f\u6548' }
    ]));
    expect(completeFailed).toBe(false);

    const openDone = await page.evaluate(() => applyTaskUpdates([
        { action: 'open', text: '\u8b77\u9001\u5546\u968a\u5230\u5317\u93ae' }
    ]));
    expect(openDone).toBe(false);

    const reopened = await page.evaluate(() => applyTaskUpdates([
        { action: 'reopen', text: '\u8abf\u67e5\u7926\u5751\u7570\u8072' }
    ]));
    expect(reopened).toBe(true);
    state = await readTaskState(page);
    expect(state.tasks).toContain('\u2610 \u8abf\u67e5\u7926\u5751\u7570\u8072');

    const removed = await page.evaluate(() => applyTaskUpdates([
        { action: 'remove', text: '\u8b77\u9001\u5546\u968a\u5230\u5317\u93ae' }
    ]));
    expect(removed).toBe(true);
    state = await readTaskState(page);
    expect(state.tasks).not.toContain('\u8b77\u9001\u5546\u968a\u5230\u5317\u93ae');
});
