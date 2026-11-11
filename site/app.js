/* Panier d’Herbi — interface: scale unit, menu, rayons tabs + zoom, dialogs (map, infos), today's hours,
   sticky bar, and the single motion switch that motion.js listens to. No tracking, nothing sent anywhere. */
(()=>{
  'use strict';
  const root=document.documentElement,C=window.PANIER;
  const $=(s,p=document)=>p.querySelector(s),$$=(s,p=document)=>[...p.querySelectorAll(s)];
  root.classList.add('js');

  /* One canvas unit: the 1024 board shown whole, sized from the window (never above 1). */
  const unit=()=>innerWidth>720?Math.min(1,innerWidth/1024,innerHeight/760):1;
  const setUnit=()=>root.style.setProperty('--u',unit().toFixed(4));
  setUnit();addEventListener('resize',setUnit);

  /* Mobile menu */
  const mobileNav=$('.mobile-nav');
  $$('.mobile-nav nav a').forEach(a=>a.addEventListener('click',()=>mobileNav.removeAttribute('open')));
  document.addEventListener('click',e=>{if(mobileNav.open&&!mobileNav.contains(e.target))mobileNav.removeAttribute('open');});

  /* Rayons: tabs select a group; on phones the shelf scrolls to it; the image opens a larger preview. */
  const track=$('#shelf-track'),tabs=$$('[data-rayon]'),copy=$('#rayon-copy');
  const phone=matchMedia('(max-width:720px)');
  function select(id,scroll=true,focus=false){
    const r=C.rayons[id];if(!r)return;
    tabs.forEach(b=>{const on=b.dataset.rayon===id;b.classList.toggle('is-active',on);b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1;if(on&&focus)b.focus();});
    $$('.shelf-group').forEach(g=>g.classList.toggle('is-selected',g.id==='rayon-'+id));
    copy.textContent=r.caption;
    const target=$('#rayon-'+id);
    if(scroll&&phone.matches&&target)track.scrollTo({left:target.offsetLeft-(track.clientWidth-target.clientWidth)/2,behavior:root.classList.contains('motion-off')?'auto':'smooth'});
  }
  tabs.forEach((b,i)=>{b.addEventListener('click',()=>select(b.dataset.rayon));b.addEventListener('keydown',e=>{let n=i;if(e.key==='ArrowRight')n=(i+1)%tabs.length;else if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;else return;e.preventDefault();select(tabs[n].dataset.rayon,true,true);});});
  let snapTimer=0;track.addEventListener('scroll',()=>{if(!phone.matches)return;clearTimeout(snapTimer);snapTimer=setTimeout(()=>{const mid=track.scrollLeft+track.clientWidth/2;let best=null,d=1e9;$$('.shelf-group').forEach(g=>{const c=g.offsetLeft+g.clientWidth/2,dd=Math.abs(c-mid);if(dd<d){d=dd;best=g;}});if(best)select(best.id.replace('rayon-',''),false);},90);},{passive:true});

  const pdialog=$('#product-dialog'),pimg=$('#preview-image'),ptitle=$('#product-title'),pdesc=$('#preview-description');
  let pReturn=null;
  function preview(id,trigger){const r=C.rayons[id];if(!r||!pdialog.showModal)return;pimg.src=r.image;pimg.width=r.width;pimg.height=r.height;pimg.alt=r.alt;ptitle.textContent=r.title.toUpperCase();pdesc.textContent=r.description;pReturn=trigger;pdialog.showModal();}
  $$('.product-zoom').forEach(b=>b.addEventListener('click',()=>preview(b.dataset.preview,b)));
  pdialog.addEventListener('close',()=>pReturn?.focus());
  $$('[data-close]',pdialog).forEach(b=>b.addEventListener('click',()=>pdialog.close()));

  /* Utility dialog: map (loaded only on request) and informations. */
  const dialog=$('#utility-dialog'),title=$('#utility-title'),content=$('#utility-content');
  const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
  const link=(text,href,cls,ext=false)=>{const a=node('a',text,cls);a.href=href;if(ext){a.target='_blank';a.rel='noopener noreferrer';}return a;};
  let uReturn=null,cleanup=()=>{};
  function open(heading,trigger){if(!dialog.showModal)return false;cleanup();cleanup=()=>{};content.replaceChildren();title.textContent=heading;uReturn=trigger;dialog.showModal();return true;}
  $('#utility-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{cleanup();cleanup=()=>{};content.replaceChildren();uReturn?.focus();});
  [dialog,pdialog].forEach(d=>d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}));
  function showMap(trigger){
    if(!open('Nous trouver',trigger))return;
    content.append(node('p',C.address));
    const stage=node('div');
    const gate=node('div',undefined,'external-gate');
    gate.append(node('p','La carte est fournie par Google Maps et se charge seulement si vous le demandez.'));
    const b=node('button','Afficher la carte','button button-forest');b.type='button';
    b.addEventListener('click',()=>{stage.replaceChildren();const f=node('iframe');f.src=C.mapEmbed;f.title='Plan d’accès au Panier d’Herbi';f.className='external-frame';f.referrerPolicy='strict-origin-when-cross-origin';f.loading='lazy';stage.append(f);cleanup=()=>{f.src='about:blank';f.remove();};});
    gate.append(b);stage.append(gate);
    const actions=node('div',undefined,'dialog-actions');actions.append(link('Itinéraire ↗',C.maps,'button button-outline',true),link('Appeler le '+C.phoneDisplay,'tel:'+C.phone,'button button-outline'));
    content.append(stage,actions);
  }
  function showInfos(trigger){
    if(!open('Informations',trigger))return;
    const p1=node('p');p1.append('Panier d’Herbi · Accueil & Service',document.createElement('br'),C.address,document.createElement('br'),link(C.phoneDisplay,'tel:'+C.phone),document.createElement('br'),link(C.email,'mailto:'+C.email));
    content.append(p1,node('p','Pour les disponibilités, les horaires exceptionnels et les modalités de livraison, contactez directement le magasin.'),node('p','Ce site de présentation ne prend ni commande ni paiement. Les liens Instagram, TikTok, Facebook et Google Maps ouvrent leurs services après votre clic. Aucun formulaire, aucun outil de mesure d’audience et aucun contenu social n’est chargé automatiquement.'));
  }
  document.addEventListener('click',e=>{const a=e.target.closest('[data-action]');if(!a||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey)return;const fn={map:showMap,infos:showInfos}[a.dataset.action];if(fn&&dialog.showModal){e.preventDefault();fn(a);}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&mobileNav.open){mobileNav.removeAttribute('open');$('summary',mobileNav).focus();}});

  /* Today's row in the hours table (local time of the visitor; no "open now" status is computed). */
  const today=$('.hours tr[data-day="'+new Date().getDay()+'"]');if(today){today.classList.add('today');today.setAttribute('aria-current','date');}

  /* Movement: one switch. Reduced motion, Save-Data and the pause button turn it off; motion.js reverts everything. */
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),conn=navigator.connection,toggle=$('#motion-toggle'),motionKey='panier.motion.paused';
  let manual=false;try{manual=localStorage.getItem(motionKey)==='1';}catch{}
  let enabled=false;
  function setMotion(){
    const forced=reduced.matches||Boolean(conn?.saveData);enabled=!forced&&!manual;
    root.classList.toggle('js-motion',enabled);root.classList.toggle('motion-off',!enabled);if(!enabled)root.classList.remove('intro');
    toggle.disabled=forced;toggle.setAttribute('aria-pressed',String(!enabled));
    toggle.textContent=forced?'Animation réduite selon vos préférences':enabled?'Mettre l’animation en pause':'Reprendre l’animation';
    window.PANIER_MOTION={enabled};document.dispatchEvent(new CustomEvent('panier:motion',{detail:{enabled}}));
  }
  toggle.addEventListener('click',()=>{manual=!manual;try{localStorage.setItem(motionKey,manual?'1':'0');}catch{}setMotion();});
  reduced.addEventListener?.('change',setMotion);
  setMotion();

  /* Sticky bar after the hero while scrolling up; the mascot's ring shows page progress. */
  const bar=$('.sticky-bar'),hero=$('#accueil');let lastY=scrollY,shown=null,raf=0;
  function showBar(on){if(on===shown)return;shown=on;bar.classList.toggle('is-shown',on);bar.inert=!on;if(on)bar.removeAttribute('aria-hidden');else bar.setAttribute('aria-hidden','true');}
  function update(){raf=0;const y=scrollY,max=Math.max(1,root.scrollHeight-innerHeight);bar.style.setProperty('--p',Math.min(1,y/max).toFixed(4));const past=y>hero.offsetHeight*.85;if(!past)showBar(false);else if(y<lastY-4)showBar(true);else if(y>lastY+4)showBar(false);lastY=y;}
  addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(update);},{passive:true});update();
})();
