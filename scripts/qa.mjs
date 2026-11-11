// Browser QA: density at real windows, overflow, console errors, missing files, tiny text, upscaled images,
// production-note scan (visible text + alts), every link target, real clicks on the CTAs and dialogs,
// motion on/off, no-JS page, first-load bytes. External hosts are blocked (nothing is loaded from them).
// usage: npm run dev (other terminal) && npm run qa      ·  QA_BASE=https://… node scripts/qa.mjs
import { launch, BASE } from './browser.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const results = [];
const check = (name, pass, detail = '') => { results.push({ name, pass: Boolean(pass), detail: String(detail) }); if (!pass) console.log('  FAIL', name, detail); };
const local = new URL(BASE).host;
const browser = await launch();

async function open(w, h, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: opts.dpr || 1, reducedMotion: opts.motion ? 'no-preference' : 'reduce', hasTouch: w <= 430, isMobile: w <= 430, javaScriptEnabled: opts.js !== false });
  const page = await ctx.newPage();
  const errors = [], missing = []; let bytes = 0;
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|ERR_BLOCKED|net::/.test(m.text())) errors.push(m.text()); });
  page.on('response', async r => { if (new URL(r.url()).host === local) { if (r.status() >= 400) missing.push(r.status() + ' ' + r.url()); try { bytes += (await r.body()).length; } catch {} } });
  await page.route(u => new URL(u).host !== local, r => r.abort());
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const firstLoad = bytes;
  if (opts.js !== false) { await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 350) { scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); } await Promise.all([...document.images].map(i => (i.loading = 'eager', i.decode().catch(() => {})))); scrollTo(0, 0); }); await page.waitForTimeout(300); }
  return { ctx, page, errors, missing, firstLoad };
}

/* 1 — Density, overflow, legibility at real windows */
const windows = [[1440, 790], [1280, 650], [1536, 730], [1920, 950], [1024, 768], [768, 1024], [390, 844], [360, 740]];
for (const [w, h] of windows) {
  const tag = `${w}x${h}`;
  const { ctx, page, errors, missing, firstLoad } = await open(w, h, { dpr: w <= 430 ? 2 : 1 });
  const m = await page.evaluate(() => {
    const vh = innerHeight, q = s => document.querySelector(s), r = s => q(s).getBoundingClientRect();
    const scenes = [...document.querySelectorAll('main>section')].map(s => [s.id, +(s.getBoundingClientRect().height / vh).toFixed(2)]);
    const tiny = [...document.querySelectorAll('main *')].filter(e => e.childNodes.length && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && e.offsetParent && parseFloat(getComputedStyle(e).fontSize) < 11).map(e => e.textContent.trim().slice(0, 30));
    const dpr = devicePixelRatio;
    const upscaled = [...document.querySelectorAll('main img')].filter(i => !i.closest('.facade-frame') && i.naturalWidth && i.getBoundingClientRect().width * dpr > i.naturalWidth * 1.3 && i.offsetParent).map(i => i.getAttribute('src') + ' ' + Math.round(i.getBoundingClientRect().width * dpr) + '/' + i.naturalWidth);
    const wide = [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > innerWidth + 0.5 && !e.closest('.shelf-track,.marquee,dialog') && getComputedStyle(e).visibility !== 'hidden').map(e => e.tagName + '.' + e.className).slice(0, 8);
    return { scenes, overflow: document.documentElement.scrollWidth - innerWidth, h1: parseFloat(getComputedStyle(q('#hero-title')).fontSize), basket: r('.hero-stage').width, heroH: r('#accueil').height, tiny, upscaled, wide, vh, w: innerWidth, nameVisible: r('.brand').bottom > 0 && r('.brand').top < vh, ctaVisible: r('.hero-actions').bottom <= vh + 2 };
  });
  check(`${tag} no horizontal overflow`, m.overflow === 0, `overflow ${m.overflow} ${m.wide.join(' | ')}`);
  check(`${tag} hero ≤ 1 screen`, m.heroH <= m.vh * (w > 380 ? 1.08 : 1.2), `${(m.heroH / m.vh).toFixed(2)} screens`);
  check(`${tag} name and CTA in the first screen`, m.nameVisible && m.ctaVisible, JSON.stringify({ name: m.nameVisible, cta: m.ctaVisible }));
  if (w > 720) { check(`${tag} H1 ≤ 80px and basket ≤ 620px (board scale, never above)`, m.h1 <= 80.5 && m.basket <= 620.5, `h1 ${m.h1} basket ${m.basket}`); check(`${tag} title ≤ 8% of width (kit contract: 80px at 1024)`, m.h1 <= w * 0.08, m.h1); }
  else check(`${tag} H1 56px (50px under 381), basket ≤ 365px`, Math.abs(m.h1 - (w > 380 ? 56 : 50)) < 1 && m.basket <= 365.5, `h1 ${m.h1} basket ${m.basket}`);
  check(`${tag} no text under 11px`, !m.tiny.length, m.tiny.join(' | '));
  check(`${tag} no image upscaled beyond 1.3×`, !m.upscaled.length, m.upscaled.join(' | '));
  check(`${tag} no console errors`, !errors.length, errors.join(' | '));
  check(`${tag} no missing local files`, !missing.length, missing.join(' | '));
  check(`${tag} first load ≤ 1.5 MB`, firstLoad <= 1.5 * 1024 * 1024, (firstLoad / 1024).toFixed(0) + ' KB');
  results.push({ name: `${tag} scenes (screens)`, pass: true, detail: m.scenes.map(s => s.join(':')).join(' ') });
  await ctx.close();
}

/* 2 — Content: links, copy, alts, facts */
{
  const { ctx, page } = await open(1440, 790);
  const facts = await page.evaluate(() => {
    const C = window.PANIER, text = document.body.innerText;
    const links = [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href'));
    const bad = links.filter(h => !/^(#[\w-]+|tel:\+33666533792|mailto:lepanierdeherbi@gmail\.com|https:\/\/)/.test(h));
    const anchors = links.filter(h => h.startsWith('#')).filter(h => h.length > 1 && !document.querySelector(h));
    const ext = [...document.querySelectorAll('a[href^="http"]')].filter(a => a.target !== '_blank' || !/noopener/.test(a.rel)).map(a => a.href);
    const notes = /(conceptuel|conceptual|édité|edited|original photo|generated|généré|illustratif|illustrative|mockup|placeholder|lorem|TODO|IA |AI-)/i;
    const visible = [...document.querySelectorAll('main, footer')].map(e => e.innerText).join('\n');
    const alts = [...document.querySelectorAll('img')].map(i => i.alt).join(' | ');
    const noteHits = [visible, alts].map(s => (s.match(notes) || [])[0]).filter(Boolean);
    const hours = [...document.querySelectorAll('.hours tr')].map(r => (r.querySelector('th').textContent + ' ' + r.querySelector('td').textContent).replace(/\s+/g, ' ').trim());
    return { bad, anchors, ext, noteHits, phone: text.includes('06 66 53 37 92'), address: text.includes('13 place du Général d’Argence') && text.includes('44410 Herbignac'), email: text.includes('lepanierdeherbi@gmail.com'), instagram: links.includes(C.instagram), tiktok: links.includes(C.tiktok), facebook: links.includes(C.facebook), maps: links.includes(C.maps), hours, lang: document.documentElement.lang, title: document.title, desc: document.querySelector('meta[name=description]')?.content, og: document.querySelector('meta[property="og:image"]')?.content, icon: !!document.querySelector('link[rel=icon]'), noindex: document.querySelector('meta[name=robots]')?.content };
  });
  check('every href is an anchor, tel, mailto or https', !facts.bad.length, facts.bad.join(' | '));
  check('every anchor target exists', !facts.anchors.length, facts.anchors.join(' | '));
  check('external links open in a new tab with noopener', !facts.ext.length, facts.ext.join(' | '));
  check('no production notes in visible copy or alts', !facts.noteHits.length, facts.noteHits.join(' | '));
  check('phone, address, e-mail visible', facts.phone && facts.address && facts.email, JSON.stringify({ phone: facts.phone, address: facts.address, email: facts.email }));
  check('Instagram, TikTok, Facebook, Maps buttons present', facts.instagram && facts.tiktok && facts.facebook && facts.maps);
  check('winter hours match the supplied notice', JSON.stringify(facts.hours) === JSON.stringify(['Lun 17h30 – 23h30', 'Mar 17h30 – 23h30', 'Mer Fermé', 'Jeu 17h30 – 23h30', 'Ven 18h – 2h le lendemain', 'Sam 18h – 2h le lendemain', 'Dim 13h – 23h']), facts.hours.join(' / '));
  check('lang fr, title, description, og:image, icon, noindex', facts.lang === 'fr' && facts.title.length > 20 && facts.desc?.length > 60 && facts.og && facts.icon && /noindex/.test(facts.noindex), JSON.stringify({ title: facts.title, og: facts.og }));
  await ctx.close();
}

/* 3 — Interaction with real clicks (desktop, motion on) */
for (const [w, h] of [[1440, 790], [390, 844]]) {
  const tag = `${w}x${h}`;
  const { ctx, page, errors } = await open(w, h, { motion: true, dpr: w <= 430 ? 2 : 1 });
  await page.waitForTimeout(2200);
  const hrefs = [];
  page.on('popup', p => p.close().catch(() => {}));
  // nav anchors
  const target = w > 720 ? '.desktop-nav a[href="#magasin"]' : '.mobile-nav a[href="#magasin"]';
  if (w <= 720) await page.click('.mobile-nav summary');
  await page.click(target); await page.waitForTimeout(1200);
  const atStore = await page.evaluate(() => Math.abs(document.querySelector('#magasin').getBoundingClientRect().top) < 40);
  check(`${tag} nav "Le magasin" lands on the section`, atStore);
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(600);
  // hero CTA
  await page.click('.hero-actions a[href="#rayons"]'); await page.waitForTimeout(1200);
  check(`${tag} hero CTA reaches the rayons`, await page.evaluate(() => Math.abs(document.querySelector('#rayons').getBoundingClientRect().top) < 40));
  // rayons tabs + zoom dialog
  await page.click('[data-rayon="boissons"]'); await page.waitForTimeout(500);
  check(`${tag} rayon tab selects Boissons`, await page.evaluate(() => document.querySelector('#rayon-copy').textContent.includes('soirée') && document.querySelector('#rayon-boissons').classList.contains('is-selected')));
  await page.click('#rayon-boissons .product-zoom'); await page.waitForTimeout(400);
  check(`${tag} zoom dialog opens on Boissons`, await page.evaluate(() => document.querySelector('#product-dialog').open && document.querySelector('#product-title').textContent === 'BOISSONS'));
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  check(`${tag} Escape closes the dialog and focus returns`, await page.evaluate(() => !document.querySelector('#product-dialog').open && document.activeElement?.classList.contains('product-zoom')));
  // map dialog, gated
  await page.click('[data-action="map"]'); await page.waitForTimeout(400);
  const gate = await page.evaluate(() => document.querySelector('#utility-dialog').open && !!document.querySelector('#utility-content .external-gate') && !document.querySelector('#utility-content iframe'));
  check(`${tag} map dialog opens gated (no iframe before consent)`, gate);
  await page.click('#utility-close'); await page.waitForTimeout(300);
  await page.evaluate(() => document.querySelector('[data-action="infos"]').scrollIntoView({ block: 'center' })); await page.waitForTimeout(900); await page.click('[data-action="infos"]'); await page.waitForTimeout(300);
  check(`${tag} informations dialog shows the contacts`, await page.evaluate(() => document.querySelector('#utility-dialog').open && document.querySelector('#utility-content').innerText.includes('06 66 53 37 92')));
  await page.click('#utility-close');
  // sticky bar after scrolling up past the hero
  await page.evaluate(() => scrollTo(0, 2600)); await page.waitForTimeout(500); await page.mouse.wheel(0, -300); await page.waitForTimeout(700);
  check(`${tag} sticky bar shows when scrolling up`, await page.evaluate(() => document.querySelector('.sticky-bar').classList.contains('is-shown')));
  // motion toggle reverts to the static page
  await page.evaluate(() => document.querySelector('#motion-toggle').scrollIntoView()); await page.waitForTimeout(400);
  await page.click('#motion-toggle'); await page.waitForTimeout(500);
  const off = await page.evaluate(() => document.documentElement.classList.contains('motion-off') && !document.querySelector('.w') && getComputedStyle(document.querySelector('.hero-basket')).visibility === 'visible');
  check(`${tag} pause button reverts the choreography`, off);
  await page.click('#motion-toggle'); await page.waitForTimeout(500);
  check(`${tag} resume rebuilds the choreography`, await page.evaluate(() => document.documentElement.classList.contains('js-motion') && !!document.querySelector('.w')));
  check(`${tag} no errors during interaction`, !errors.length, errors.join(' | '));
  await ctx.close();
}

/* 4 — No-JS and reduced motion: everything readable */
{
  const { ctx, page } = await open(1440, 790, { js: false });
  const nojs = await page.evaluate(() => { const t = document.body.innerText; const vis = s => { const e = document.querySelector(s); const r = e.getBoundingClientRect(); return r.width > 0 && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).opacity !== '0'; }; return { hours: t.includes('17h30 – 23h30') && t.includes('Fermé'), phone: t.includes('06 66 53 37 92'), hero: vis('#hero-title') && vis('.hero-basket'), bag: vis('.window-scene img'), cards: vis('.step'), nav: vis('.desktop-nav') }; });
  check('no-JS: hours, phone, hero, bag scene, steps and nav visible', Object.values(nojs).every(Boolean), JSON.stringify(nojs));
  await ctx.close();
  const r = await open(390, 844, { dpr: 2 });
  const red = await r.page.evaluate(() => { const vis = s => { const e = document.querySelector(s); return e && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).opacity !== '0'; }; return { hero: vis('#hero-title') && vis('.hero-basket'), shelf: vis('.shelf-group'), social: vis('.social-card'), toggle: document.querySelector('#motion-toggle').disabled, nosplit: !document.querySelector('.w') }; });
  check('reduced motion: content visible, no choreography, pause button disabled', Object.values(red).every(Boolean), JSON.stringify(red));
  await r.ctx.close();
}

await browser.close();
mkdirSync(new URL('../studio/docs/', import.meta.url).pathname, { recursive: true });
writeFileSync(new URL('../studio/docs/browser-qa.json', import.meta.url).pathname, JSON.stringify({ base: BASE, date: new Date().toISOString(), results }, null, 2));
const fails = results.filter(r => !r.pass);
console.log(`\n${results.length - fails.length}/${results.length} checks passed${fails.length ? ' — FAILED: ' + fails.map(f => f.name).join('; ') : ''}`);
process.exit(fails.length ? 1 : 0);
