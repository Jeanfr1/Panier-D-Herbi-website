// Captures the page at real browser windows: full page + top + per-scene heights in screens.
// usage: node scripts/shots.mjs [tag] [WxH ...]   (server: npm run dev)
import { launch, BASE } from './browser.mjs';
import { mkdirSync } from 'node:fs';
const tag = process.argv[2] || 'now';
const sizes = (process.argv.slice(3).length ? process.argv.slice(3) : ['1440x790', '1280x650', '1920x950', '390x844']).map(s => s.split('x').map(Number));
const out = new URL(`../studio/shots/${tag}/`, import.meta.url).pathname; mkdirSync(out, { recursive: true });
const browser = await launch();
for (const [w, h] of sizes) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 300) { scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); } await Promise.all([...document.images].map(i => (i.loading = 'eager', i.decode().catch(() => {})))); scrollTo(0, 0); });
  await page.waitForTimeout(500);
  const scenes = await page.$$eval('main > section, .site-footer', (els, vh) => els.map(e => `${e.id || 'footer'}:${(e.getBoundingClientRect().height / vh).toFixed(2)}`), h);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  console.log(`${w}x${h}`, scenes.join(' '), 'overflowX', overflow, errors.length ? 'ERRORS: ' + errors.join(' | ') : '');
  await page.screenshot({ path: `${out}/${w}x${h}-full.png`, fullPage: true });
  await page.screenshot({ path: `${out}/${w}x${h}-top.png` });
  await page.close();
}
await browser.close();
