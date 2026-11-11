// Motion captures at real speed: intro frames, then a natural wheel scroll through the page with frames
// taken at scene positions. usage: node scripts/motion-shots.mjs [tag] [WxH]
import { launch, BASE } from './browser.mjs';
import { mkdirSync } from 'node:fs';
const tag = process.argv[2] || 'motion';
const [w, h] = (process.argv[3] || '1440x790').split('x').map(Number);
const out = new URL(`../studio/shots/${tag}/`, import.meta.url).pathname; mkdirSync(out, { recursive: true });
const browser = await launch();
const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: 'no-preference', hasTouch: w <= 430, isMobile: w <= 430 });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
// rAF cadence
const fps = await page.evaluate(() => new Promise(r => { let n = 0, t0 = performance.now(); const f = () => { if (++n < 40) requestAnimationFrame(f); else r(1000 * n / (performance.now() - t0)); }; requestAnimationFrame(f); }));
console.log('rAF fps', fps.toFixed(1));
for (const t of [250, 600, 950, 1400, 2200]) { await page.waitForTimeout(t === 250 ? 250 : t - [0, 250, 600, 950, 1400][[250, 600, 950, 1400, 2200].indexOf(t)]); await page.screenshot({ path: `${out}/intro-${String(t).padStart(4, '0')}.png` }); }
// natural scroll: wheel 100px every 16ms-ish, frame every ~450px
let y = 0, i = 0; const total = await page.evaluate(() => document.body.scrollHeight - innerHeight);
while (y < total) { await page.mouse.wheel(0, 90); y += 90; await page.waitForTimeout(24); if (y % 450 < 90) { await page.waitForTimeout(120); await page.screenshot({ path: `${out}/scroll-${String(++i).padStart(2, '0')}-${y}.png` }); } }
await page.waitForTimeout(800); await page.screenshot({ path: `${out}/scroll-end.png` });
// scroll back up a bit: sticky bar should show
await page.mouse.wheel(0, -400); await page.waitForTimeout(600); await page.screenshot({ path: `${out}/sticky-bar.png` });
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
console.log('frames', i, 'overflowX', overflow, errors.length ? 'ERRORS: ' + errors.join(' | ') : 'no errors');
await browser.close();
