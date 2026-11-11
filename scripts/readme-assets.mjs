// README assets from the running site: banner, hero-scroll frames (→ GIF with ffmpeg), desktop sections, mobile screens.
// usage: npm run dev (other terminal) && node scripts/readme-assets.mjs
import { launch, BASE } from './browser.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
const out = new URL('../.github/assets/', import.meta.url).pathname, tmp = new URL('../studio/shots/readme/', import.meta.url).pathname;
mkdirSync(out, { recursive: true }); mkdirSync(tmp, { recursive: true });
const browser = await launch();

/* banner: rendered with the site's own fonts */
{
  const page = await browser.newPage({ viewport: { width: 1600, height: 520 }, deviceScaleFactor: 1 });
  const html = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${BASE}styles.css"><style>body{margin:0;background:radial-gradient(ellipse at 74% 50%,#dde9cf 0,transparent 55%),linear-gradient(125deg,#f7faf1,#F1F6E9);height:520px;overflow:hidden;position:relative;font-family:DMSans}.t{position:absolute;left:90px;top:150px;color:#004D2D}.t h1{font:italic 800 112px/.9 Barlow;margin:0;text-transform:uppercase;letter-spacing:-.02em}.t p{font:600 24px/1.4 DMSans;margin:22px 0 0;max-width:640px}.sw{width:420px;height:12px;background:#A5C925;border-radius:50%;transform:rotate(-3deg);margin-top:18px}.b{position:absolute;right:60px;top:-10px;width:560px}.l{position:absolute;left:90px;top:28px;width:170px}</style></head><body><img class="l" src="${BASE}brand/logo.webp"><div class="t"><h1>Le quotidien,<br>en plus simple.</h1><div class="sw"></div><p>Votre épicerie de proximité à Herbignac. Ouverte le soir, livraison à domicile sur demande.</p></div><img class="b" src="${BASE}images/hero.webp"></body></html>`;
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.setContent(html, { waitUntil: 'networkidle' }); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}/banner.png` }); await page.close();
}

if (process.env.ONLY === 'banner') { await browser.close(); console.log('banner only'); process.exit(0); }
/* hero-scroll frames: intro at real speed, then a natural scroll through hero → rayons → marquee */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  let n = 0; const shot = () => page.screenshot({ path: `${tmp}/f_${String(n++).padStart(4, '0')}.png` });
  const t0 = Date.now(); for (const t of [150, 300, 450, 600, 750, 900, 1050, 1200, 1400, 1700, 2100]) { while (Date.now() - t0 < t) await page.waitForTimeout(10); await shot(); }
  for (let i = 0; i < 44; i++) { await page.mouse.wheel(0, 48); await page.waitForTimeout(70); await shot(); }
  await page.waitForTimeout(500); await shot(); await shot();
  await page.close();
  execSync(`ffmpeg -y -framerate 12 -i ${tmp}/f_%04d.png -vf "fps=12,scale=960:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4" -loop 0 ${out}/hero-scroll.gif`, { stdio: 'ignore' });
}

/* desktop sections (motion on, scrolled naturally to each) and mobile screens */
const framed = [];
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
  await page.goto(BASE, { waitUntil: 'networkidle' }); await page.waitForTimeout(2300);
  const targets = ['#rayons', '#livraison', '#commande', '#magasin', '#suivre', '#contact'];
  for (const [i, sel] of targets.entries()) {
    const y = await page.evaluate(s => document.querySelector(s).getBoundingClientRect().top + scrollY - (s === '#magasin' ? 60 : 10), sel);
    let cur = await page.evaluate(() => scrollY); while (cur < y) { await page.mouse.wheel(0, Math.min(120, y - cur)); cur += 120; await page.waitForTimeout(18); }
    await page.waitForTimeout(1500); await page.screenshot({ path: `${tmp}/desktop-${i}.png` }); framed.push(`${tmp}/desktop-${i}.png`);
  }
  await page.close();
  const m = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, reducedMotion: 'no-preference' });
  await m.goto(BASE, { waitUntil: 'networkidle' }); await m.waitForTimeout(2300);
  for (const [i, sel] of ['#accueil', '#rayons', '#livraison', '#magasin', '#contact'].entries()) {
    const y = await m.evaluate(s => document.querySelector(s).getBoundingClientRect().top + scrollY, sel);
    let cur = await m.evaluate(() => scrollY); while (cur < y) { await m.mouse.wheel(0, Math.min(140, y - cur)); cur += 140; await m.waitForTimeout(18); }
    await m.waitForTimeout(1500); await m.screenshot({ path: `${tmp}/mobile-${i}.png` });
  }
  await m.close();
}
await browser.close();
writeFileSync(`${tmp}/done.txt`, new Date().toISOString());
console.log('assets captured');
