(() => {
  'use strict';
  const root=document.documentElement;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  const pauseButton=document.querySelector('#motion-toggle');
  let manualPause=false;
  const motion=()=>{
    const paused=manualPause||reduce.matches;
    root.classList.toggle('motion-paused',paused);
    pauseButton.setAttribute('aria-pressed',String(paused));
    pauseButton.disabled=reduce.matches;
    pauseButton.textContent=reduce.matches?'Animation réduite selon vos préférences':paused?'Reprendre l’animation':'Mettre l’animation en pause';
  };
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.12,rootMargin:'0px 0px -12px 0px'});
    document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));root.classList.add('motion-ready');
  }
  pauseButton.addEventListener('click',()=>{manualPause=!manualPause;motion();});
  reduce.addEventListener?.('change',motion);motion();

  const menu=document.querySelector('#navigation'),menuButton=document.querySelector('.menu-toggle');
  const closeMenu=()=>{menu.classList.remove('is-open');menuButton.setAttribute('aria-expanded','false');};
  menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));menu.classList.toggle('is-open',open);});
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
  window.matchMedia('(min-width:861px)').addEventListener?.('change',e=>{if(e.matches)closeMenu();});

  const categories={
    epicerie:{title:'ÉPICERIE',image:'epicerie.webp',width:1448,height:1086,caption:'Des essentiels à retrouver en magasin.',description:'Pour le placard du quotidien ou une petite envie de dernière minute. Venez découvrir la sélection disponible au magasin.',alt:'Illustration de pâtes, riz et conserves avec des étiquettes Panier d’Herbi.'},
    boissons:{title:'BOISSONS',image:'boissons.webp',width:1402,height:1122,caption:'Une pause, une soirée, un passage au magasin.',description:'Pour accompagner votre journée ou votre soirée. Contactez le magasin pour connaître les références disponibles.',alt:'Illustration de trois bouteilles, toutes étiquetées Panier d’Herbi.'},
    snacks:{title:'SNACKS',image:'snacks.webp',width:1448,height:1086,caption:'Les petites envies ont aussi leur rayon.',description:'Une envie à partager ou une pause pour soi. Découvrez les petites attentions à grignoter disponibles au magasin.',alt:'Illustration de biscuits et de chips avec des étiquettes Panier d’Herbi.'}
  };
  const track=document.querySelector('#shelf-track');
  const controls=[...document.querySelectorAll('[data-rayon]')];
  const mobile=window.matchMedia('(max-width:680px)');
  function chooseCategory(key,scroll=false){
    if(!categories[key])return;
    controls.forEach(b=>{const active=b.dataset.rayon===key;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active));});
    document.querySelectorAll('.shelf-group').forEach(g=>g.classList.toggle('is-selected',g.id===`rayon-${key}`));
    document.querySelector('#rayon-copy').textContent=categories[key].caption;
    if(scroll&&mobile.matches){const group=document.getElementById(`rayon-${key}`);track.scrollTo({left:group.offsetLeft-24,behavior:reduce.matches||manualPause?'auto':'smooth'});}
  }
  controls.forEach(button=>button.addEventListener('click',()=>chooseCategory(button.dataset.rayon,true)));
  let scrollFrame=false;
  track.addEventListener('scroll',()=>{
    if(!mobile.matches||scrollFrame)return;scrollFrame=true;
    requestAnimationFrame(()=>{const groups=[...document.querySelectorAll('.shelf-group')];const nearest=groups.reduce((a,b)=>Math.abs(a.offsetLeft-24-track.scrollLeft)<Math.abs(b.offsetLeft-24-track.scrollLeft)?a:b);chooseCategory(nearest.id.replace('rayon-',''));scrollFrame=false;});
  },{passive:true});

  const preview=document.querySelector('#product-dialog');let trigger=null;
  function openDialog(dialog,button){if(typeof dialog.showModal!=='function'){window.location.hash='contact';return;}trigger=button;dialog.showModal();document.body.style.overflow='hidden';}
  document.querySelectorAll('[data-preview]').forEach(button=>button.addEventListener('click',()=>{
    const data=categories[button.dataset.preview];if(!data)return;
    const img=document.querySelector('#preview-image');img.src=`assets/images/${data.image}`;img.alt=data.alt;img.width=data.width;img.height=data.height;
    document.querySelector('#product-title').textContent=data.title;document.querySelector('#preview-description').textContent=data.description;
    openDialog(preview,button);
  }));
  document.querySelectorAll('[data-dialog]').forEach(button=>button.addEventListener('click',()=>{const dialog=document.getElementById(button.dataset.dialog);if(dialog)openDialog(dialog,button);}));
  document.querySelectorAll('dialog').forEach(dialog=>{
    dialog.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>dialog.close()));
    dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
    dialog.addEventListener('close',()=>{document.body.style.overflow='';trigger?.focus();});
  });
})();
