// Frames of one scene at real speed: wheel-scroll to a start offset, then capture every `step` px.
// usage: node scripts/scene-shots.mjs <tag> <WxH> <fromY> <toY> <step> [intro]
import { launch, BASE } from './browser.mjs';
import { mkdirSync } from 'node:fs';
const [tag = 'scene', size = '1440x790', from = '0', to = '900', step = '150', intro] = process.argv.slice(2);
const [w, h] = size.split('x').map(Number);
const out = new URL(`../studio/shots/${tag}/`, import.meta.url).pathname; mkdirSync(out, { recursive: true });
const browser = await launch();
const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: 'no-preference', hasTouch: w <= 430, isMobile: w <= 430 });
const errors = []; page.on('pageerror', e => errors.push(e.message));
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
if (intro) { const t0 = Date.now(); for (const t of [120, 350, 550, 750, 950, 1200, 1600]) { while (Date.now() - t0 < t) await page.waitForTimeout(10); await page.screenshot({ path: `${out}/intro-${String(t).padStart(4, '0')}.png` }); } }
await page.waitForTimeout(1800);
let y = 0; const target = Number(from);
while (y < target) { await page.mouse.wheel(0, 90); y += 90; await page.waitForTimeout(16); }
let i = 0;
while (y <= Number(to)) { await page.waitForTimeout(350); await page.screenshot({ path: `${out}/y-${String(y).padStart(5, '0')}.png` }); i++; let moved = 0; while (moved < Number(step)) { await page.mouse.wheel(0, Math.min(90, Number(step) - moved)); moved += 90; await page.waitForTimeout(16); } y += Number(step); }
console.log('frames', i, errors.length ? 'ERRORS ' + errors.join(' | ') : 'no errors');
await browser.close();
