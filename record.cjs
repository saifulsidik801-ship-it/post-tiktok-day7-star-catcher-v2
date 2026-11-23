// Record day-1 and day-7 Star Catcher gameplay with headless Chromium.
// Same camera for both: 1080x1920 viewport, game auto-played from the same start.
// Samples game state at 20 Hz and logs timed SFX events (catch/miss/powerup/levelup)
// with video-time stamps so the edit can place sound effects exactly on the action.
const { chromium } = require('/home/hatch/workspace/makefun/post-x-game/video/node_modules/playwright-core');
const path = require('node:path');
const fs = require('node:fs');

const DIR = '/home/hatch/workspace/makefun/post-tiktok-day7-v2';
const DAY1 = '/home/hatch/workspace/makefun/post-x-game/video/star-catcher.html';
const DAY7 = path.join(DIR, 'game', 'star-catcher-day7.html');
const CHROME = process.env.HOME + '/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome';

async function record(browser, url, seconds, outName, eventsName, shotName) {
  const ctx = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    recordVideo: { dir: DIR, size: { width: 1080, height: 1920 } },
  });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('PAGE ERROR', outName, String(e).slice(0, 200)));
  const navStart = Date.now();
  await page.goto('file://' + url);
  await page.waitForTimeout(400);
  // Offset: game script runs at DOM parse; video started at navigation.
  const offset = await page.evaluate(() => {
    const t = performance.timing;
    return Math.max(0, (t.domContentLoadedEventEnd - t.navigationStart) / 1000);
  });
  const t0 = Date.now();
  const events = [];
  let lastSeq = 0, lastScore = 0, lastLives = 3, lastLevel = 1;
  const shotAt = setTimeout(async () => {
    try { await page.screenshot({ path: path.join(DIR, shotName) }); } catch (e) { /* ignore */ }
  }, 1000);
  const endAt = Date.now() + seconds * 1000;
  while (Date.now() < endAt) {
    const s = await page.evaluate(() => {
      const g = window.__game;
      return { score: g.score, lives: g.lives, level: g.level, combo: g.combo, ev: g.lastEvent, elapsed: g.elapsed };
    }).catch(() => null);
    if (s) {
      const vt = (Date.now() - t0) / 1000 + offset;
      if (s.ev && s.ev.seq !== lastSeq) {
        lastSeq = s.ev.seq;
        events.push({ t: +vt.toFixed(3), type: s.ev.type, combo: s.ev.combo, points: s.ev.points });
      } else if (!s.ev) {
        // Games without an event feed (day-1): derive events from score/lives deltas.
        if (s.score > lastScore) events.push({ t: +vt.toFixed(3), type: 'catch', combo: s.combo, points: s.score - lastScore });
        if (s.lives < lastLives) events.push({ t: +vt.toFixed(3), type: 'miss', combo: 0, points: 0 });
      }
      if (s.score !== lastScore) lastScore = s.score;
      if (s.lives !== lastLives) lastLives = s.lives;
      if (s.level !== lastLevel) lastLevel = s.level;
    }
    await page.waitForTimeout(50);
  }
  clearTimeout(shotAt);
  const fin = await page.evaluate(() => ({
    score: window.__game.score, state: window.__game.state,
    timeLeft: window.__game.timeLeft, level: window.__game.level,
    combo: window.__game.combo, lives: window.__game.lives,
  }));
  console.log(outName, 'offset', offset.toFixed(3), 'final', JSON.stringify(fin), 'events', events.length);
  const v = page.video();
  await ctx.close();
  fs.renameSync(await v.path(), path.join(DIR, outName));
  fs.writeFileSync(path.join(DIR, eventsName), JSON.stringify({ offset, events }, null, 1));
  console.log('saved', outName, eventsName);
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const d1 = parseInt(process.env.DAY1_SECS || '12', 10);
  const d7 = parseInt(process.env.DAY7_SECS || '30', 10);
  await record(browser, DAY1 + '?auto=1&t=60', d1, 'day1.webm', 'day1-events.json', 'check-day1.png');
  await record(browser, DAY7 + '?auto=1&t=60', d7, 'day7.webm', 'day7-events.json', 'check-day7.png');
  await browser.close();
  console.log('DONE');
})();
