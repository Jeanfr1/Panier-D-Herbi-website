/* Panier d’Herbi — scroll choreography (GSAP 3.13 + ScrollTrigger, vendored).
   Built only while motion is on (app.js decides) and reverted completely when it goes off, so the static page
   is always the base. One object runs through the page: the basket. It fills itself on arrival, tips and pours
   its contents onto the shelf, the bag reappears through the basket slats, and the smiling bag waves goodbye. */
(()=>{
  'use strict';
  const root=document.documentElement,g=window.gsap,ST=window.ScrollTrigger;
  const $=(s,p=document)=>p.querySelector(s),$$=(s,p=document)=>[...p.querySelectorAll(s)];
  if(!g||!ST){root.classList.remove('intro');return;}
  g.registerPlugin(ST);ST.config({ignoreMobileResize:true});
  const desk=()=>innerWidth>720;
  const U=()=>desk()?Math.min(1,innerWidth/1024,innerHeight/760):1;
  let ctx=null,mode=null,splits=[],clones=[];

  function words(el){
    if(!el)return[];
    if(!el.dataset.split){
      splits.push([el,el.innerHTML]);el.dataset.split='w';
      const walk=n=>[...n.childNodes].forEach(c=>{
        if(c.nodeType===3){const f=document.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(t=>{if(!t)return;if(/^\s+$/.test(t)){f.append(t);return;}const w=document.createElement('span'),i=document.createElement('span');w.className='w';i.className='wi';i.textContent=t;w.append(i);f.append(w);});c.replaceWith(f);}
        else if(c.nodeType===1&&c.tagName!=='BR')walk(c);
      });
      walk(el);
    }
    return $$('.wi',el);
  }
  function letters(h1){
    if(!h1.dataset.split){
      splits.push([h1,h1.innerHTML]);h1.dataset.split='c';
      h1.setAttribute('aria-label',[...h1.children].map(s=>s.textContent).join(' '));
      [...h1.children].forEach(line=>{const text=line.textContent;line.textContent='';line.setAttribute('aria-hidden','true');
        text.split(/(\s+)/).forEach(t=>{if(!t)return;if(/^\s+$/.test(t)){line.append(t);return;}const w=document.createElement('span');w.style.display='inline-block';[...t].forEach(ch=>{const c=document.createElement('span');c.className='c';c.textContent=ch;w.append(c);});line.append(w);});});
    }
    return $$('.c',h1);
  }
  function unsplit(){splits.forEach(([el,html])=>{el.innerHTML=html;delete el.dataset.split;if(el.id==='hero-title')el.removeAttribute('aria-label');});splits=[];}

  function textIn(scope,start='top 78%'){
    const s=$(scope);if(!s)return;
    const tl=g.timeline({scrollTrigger:{trigger:s,start,toggleActions:'play none none reverse'}});
    $$('.eyebrow',s).forEach(e=>tl.from(e,{autoAlpha:0,x:-28,duration:.6,ease:'power3.out'},0));
    $$('h2.split',s).forEach(h=>tl.from(words(h),{yPercent:118,rotation:5,duration:.95,stagger:.07,ease:'power4.out'},.05));
    return tl;
  }
  function onArrive(trigger,start,tl){const st=ST.create({trigger,start,onEnter:()=>tl.restart(),onLeaveBack:()=>tl.pause(0)});if(st.scroll()>st.start)tl.progress(1);}

  /* 1 — Hero: the three rayons fly in and fill the basket, which pops into place; then it breathes. */
  function heroIntro(chars){
    if(!root.classList.contains('intro')||scrollY>40){root.classList.remove('intro');return;}
    const basket=$('.hero-basket'),ring=$('.hero-ring'),flies=$$('.fly'),nav=[...$$('.header>*')];
    const rest=$$('.hero-copy .eyebrow,.hero-copy .swoosh,.hero-lead,.hero-actions>*,.hero-promise');
    const u=U(),k=desk()?1:.6;
    g.set(basket,{scale:.62,autoAlpha:0,y:50*u,rotation:-6,visibility:'visible'});
    g.set(nav,{autoAlpha:0,y:-14,visibility:'visible'});
    g.set('.hero-copy',{visibility:'visible'});g.set(chars,{yPercent:120,rotation:8,autoAlpha:0});g.set(rest,{autoAlpha:0,y:22});
    g.set(flies[0],{x:-420*u*k,y:260*u*k,rotation:-18,scale:.9,autoAlpha:1,visibility:'visible'});
    g.set(flies[1],{x:60*u*k,y:-420*u*k,rotation:14,scale:.8,autoAlpha:1,visibility:'visible'});
    g.set(flies[2],{x:440*u*k,y:120*u*k,rotation:22,scale:.9,autoAlpha:1,visibility:'visible'});
    root.classList.remove('intro');
    const skip=()=>{if(scrollY>40)tl.progress(1);};
    const tl=g.timeline({paused:true,defaults:{ease:'power3.out'},onComplete:()=>{g.set(flies,{clearProps:'all'});removeEventListener('scroll',skip);breathe(basket);}});
    tl.to(flies,{x:0,y:0,rotation:(i)=>[-6,4,8][i],scale:.38,duration:.72,ease:'power2.in',stagger:.05},.05)
      .to(flies,{autoAlpha:0,scale:.2,duration:.14,ease:'power1.in',stagger:.05},.62)
      .to(basket,{scale:1,autoAlpha:1,y:0,rotation:0,duration:.8,ease:'back.out(1.5)'},.7)
      .fromTo(ring,{scale:.5,opacity:.9},{scale:1.25,opacity:0,duration:.6,ease:'power2.out',immediateRender:false},.74)
      .to(chars,{yPercent:0,rotation:0,autoAlpha:1,duration:.85,stagger:.022,ease:'power4.out'},.5)
      .to(rest,{autoAlpha:1,y:0,duration:.6,stagger:.06},.85)
      .to(nav,{autoAlpha:1,y:0,duration:.5,stagger:.05},.8);
    addEventListener('scroll',skip,{passive:true});
    Promise.race([document.fonts?.ready,new Promise(r=>setTimeout(r,700))]).then(()=>tl.play());
    return ()=>removeEventListener('scroll',skip);
  }
  function breathe(basket){g.to(basket,{y:'-=5',rotation:.25,duration:4,ease:'sine.inOut',yoyo:true,repeat:-1,overwrite:'auto'});}
  function heroScene(cleanups){
    const title=$('#hero-title'),chars=letters(title),lines=[...title.children];
    const stop=heroIntro(chars);if(stop)cleanups.push(stop);else breathe($('.hero-basket'));
    // leaving the hero: the copy drifts up, the basket tips towards the shelf below (no zoom)
    g.timeline({scrollTrigger:{trigger:'#accueil',start:'top top',end:'bottom top',scrub:.8,invalidateOnRefresh:true}})
      .to(lines[0],{xPercent:-10,ease:'none'},0).to(lines[1],{xPercent:8,ease:'none'},0)
      .to('.hero-copy',{y:()=>-90*U(),autoAlpha:.05,ease:'power2.in'},0)
      .to('.hero-stage',{y:()=>(desk()?-160:-80)*U(),x:()=>(desk()?40:0)*U(),rotation:desk()?-16:-10,ease:'none'},0)
      .to('.b1',{y:()=>120*U(),ease:'none'},0).to('.b2',{y:()=>-80*U(),x:()=>40*U(),ease:'none'},0)
      .to('.hero-scroll',{autoAlpha:0,duration:.2},0);
    if(desk()&&matchMedia('(pointer:fine)').matches){
      const hero=$('#accueil'),rx=g.quickTo('.hero-basket','rotationY',{duration:1.2,ease:'power3'}),ry=g.quickTo('.hero-basket','rotationX',{duration:1.2,ease:'power3'}),bx=g.quickTo('.hero-light','x',{duration:1.6,ease:'power3'});
      g.set('.hero-basket',{transformPerspective:1400});
      const move=e=>{const kx=e.clientX/innerWidth-.5,ky=e.clientY/innerHeight-.5;rx(kx*9);ry(-ky*6);bx(kx*-30);};
      hero.addEventListener('pointermove',move,{passive:true});cleanups.push(()=>hero.removeEventListener('pointermove',move));
    }
  }

  /* 2 — Rayons: hand-off. The shelf draws itself and the three groups land on it, poured from the basket above. */
  function rayonsScene(){
    textIn('#rayons .rayons-head','top 82%');
    g.from('.rayons-head .spark',{scale:0,rotation:-90,duration:.5,ease:'back.out(2)',scrollTrigger:{trigger:'#rayons',start:'top 70%',toggleActions:'play none none reverse'}});
    g.from('.rayon-heading>*',{y:20,autoAlpha:0,stagger:.08,duration:.6,ease:'power3.out',scrollTrigger:{trigger:'.rayon-heading',start:'top 88%',toggleActions:'play none none reverse'}});
    g.fromTo('.shelf-floor',{clipPath:'inset(0% 100% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',ease:'power2.inOut',scrollTrigger:{trigger:'#rayons',start:'top 75%',end:'top 20%',scrub:.6}});
    if(desk()){
      const tl=g.timeline({scrollTrigger:{trigger:'#rayons',start:'top 92%',end:'top 42%',scrub:.7,invalidateOnRefresh:true}});
      $$('.shelf-group').forEach((gp,i)=>tl.from(gp,{y:()=>-(150+i*30)*U(),x:()=>(2-i)*70*U()+90*U(),rotation:[-8,-4,6][i],autoAlpha:0,duration:.5,ease:'power2.out'},i*.14)
        .from($('figcaption',gp),{autoAlpha:0,y:12,duration:.2},i*.16+.4));
    }else{
      g.from('.shelf-group',{y:-90,rotation:-4,autoAlpha:0,stagger:.12,duration:.8,ease:'power3.out',scrollTrigger:{trigger:'.shelf-track',start:'top 85%',toggleActions:'play none none reverse'}});
    }
  }

  /* 3 — Marquee: two ribbons of words run against each other and speed up with the scroll. */
  function marqueeScene(cleanups){
    $$('.marquee').forEach(m=>{
      const t=$('.marquee-track',m);const c=t.cloneNode(true);c.setAttribute('aria-hidden','true');m.append(c);clones.push(c);
      const dir=Number(m.dataset.dir)||1,w=()=>t.scrollWidth;
      const tween=g.to([t,c],{x:()=>-w()*dir,ease:'none',duration:()=>w()/60,repeat:-1,modifiers:{x:x=>{const v=parseFloat(x),ww=w();return (dir>0?(v%ww):(v%ww)-ww)+'px';}}});
      g.set(c,{x:0});
      ST.create({trigger:m,start:'top bottom',end:'bottom top',onUpdate:s=>{tween.timeScale(g.utils.clamp(-4,4,1+s.getVelocity()/900*dir));},onToggle:s=>tween.paused(!s.isActive)});
      const settle=()=>g.to(tween,{timeScale:1,duration:.8,overwrite:true});
      const st=ST.create({trigger:m,start:'top bottom',end:'bottom top',onUpdate:()=>{clearTimeout(m._t);m._t=setTimeout(settle,120);}});
      cleanups.push(()=>{clearTimeout(m._t);st.kill();tween.kill();});
    });
  }

  /* 4 — Livraison: the basket's slats slide open one by one and the bag rises behind them; the badge turns with the scroll. */
  function serviceScene(){
    textIn('#livraison .service-copy','top 78%');
    g.from('.service-lead,.service-text,.service-actions>*',{y:24,autoAlpha:0,stagger:.08,duration:.6,ease:'power3.out',scrollTrigger:{trigger:'.service-copy',start:'top 70%',toggleActions:'play none none reverse'}});
    const tl=g.timeline({scrollTrigger:{trigger:'#livraison',start:'top 80%',end:'center 45%',scrub:.7,invalidateOnRefresh:true}});
    tl.fromTo('.window-scene img',{y:()=>90*U(),scale:1.1},{y:0,scale:1.06,duration:1,ease:'none'},0);
    $$('.slats i').forEach((s,i)=>tl.fromTo(s,{scaleY:1},{scaleY:0,duration:.35,ease:'power2.inOut',immediateRender:true},.08+[.12,.3,0,.4][i]));
    tl.from('.badge-spin',{scale:0,rotation:-120,duration:.4,ease:'back.out(1.6)'},.45);
    g.to('.badge-spin>svg:first-child',{rotation:360,ease:'none',scrollTrigger:{trigger:'#livraison',start:'top bottom',end:'bottom top',scrub:true}});
    g.fromTo('.window-scene',{y:()=>40*U()},{y:()=>-30*U(),ease:'none',scrollTrigger:{trigger:'#livraison',start:'top bottom',end:'bottom top',scrub:true,invalidateOnRefresh:true}});
  }

  /* 5 — Trois gestes: the cards are dealt one after another and the dotted line links them. */
  function stepsScene(){
    textIn('#commande .steps-head','top 80%');
    const tl=g.timeline({scrollTrigger:{trigger:'.steps',start:'top 88%',end:desk()?'bottom 60%':'bottom 70%',scrub:.6,invalidateOnRefresh:true}});
    $$('.step').forEach((s,i)=>tl.from(s,{y:()=>(desk()?90:60)*U(),x:()=>(desk()?(2-i)*120:0)*U(),rotation:desk()?[-4,0,4][i]:0,autoAlpha:0,duration:.34,ease:'power3.out'},i*.2)
      .from($('.step-icon',s),{scale:0,rotation:-120,duration:.22,ease:'back.out(2)'},i*.2+.1)
      .from($('.step-no',s),{xPercent:60,autoAlpha:0,duration:.2},i*.2+.14));
    const line=$('.steps-line path');if(line&&desk()){const len=line.getTotalLength();g.set(line,{strokeDasharray:'14 12',strokeDashoffset:0});g.fromTo('.steps-line',{clipPath:'inset(0% 100% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',ease:'none',scrollTrigger:{trigger:'.steps',start:'top 80%',end:'bottom 55%',scrub:.6}});}
    g.from('.steps-fine',{autoAlpha:0,y:14,duration:.5,scrollTrigger:{trigger:'.steps-fine',start:'top 95%',toggleActions:'play none none reverse'}});
  }

  /* 6 — Magasin: day turns to evening as you go down; the shop's windows light up and the hours flip in. */
  function storeScene(){
    textIn('#magasin .store-copy','top 75%');
    g.from('.store-lead',{y:20,autoAlpha:0,duration:.6,scrollTrigger:{trigger:'.store-copy',start:'top 68%',toggleActions:'play none none reverse'}});
    g.timeline({scrollTrigger:{trigger:'#magasin',start:'top 70%',end:'bottom 70%',scrub:.8}})
      .fromTo('.dusk',{opacity:0},{opacity:.9,ease:'power1.inOut',duration:1},0)
      .fromTo('.glow',{opacity:0},{opacity:.85,ease:'power2.in',duration:.6,stagger:.08},.35)
      .fromTo('.facade-frame img',{filter:'brightness(1) saturate(1)'},{filter:'brightness(.9) saturate(.9)',ease:'none',duration:1},0);
    g.fromTo('.facade-frame img',{yPercent:-4,scale:1.08},{yPercent:4,scale:1.08,ease:'none',scrollTrigger:{trigger:'#magasin',start:'top bottom',end:'bottom top',scrub:true}});
    const tl=g.timeline({paused:true});
    tl.from('.hours-panel',{y:()=>80*U(),autoAlpha:0,duration:.7,ease:'power3.out'},0)
      .from('.hours-title',{x:-20,autoAlpha:0,duration:.4},.25)
      .from('.hours tr',{rotationX:-80,autoAlpha:0,transformOrigin:'50% 0',stagger:.07,duration:.45,ease:'power2.out'},.3)
      .from('.hours-note,.hours-actions>*',{y:14,autoAlpha:0,stagger:.06,duration:.4},.8);
    onArrive('.hours-panel','top 85%',tl);
  }

  /* 7 — Suivre: the smiling bag waves (a wobble on its base) and the cards rise with their icons spinning in. */
  function socialScene(){
    textIn('#suivre .social-head','top 78%');
    g.from('.social-lead',{y:20,autoAlpha:0,duration:.6,scrollTrigger:{trigger:'.social-head',start:'top 70%',toggleActions:'play none none reverse'}});
    const wave=g.timeline({paused:true});
    wave.from('.social-mascot img',{y:()=>60*U(),scale:.7,autoAlpha:0,duration:.7,ease:'back.out(1.6)'})
      .to('.social-mascot img',{rotation:-8,duration:.18,ease:'sine.inOut'},.5).to('.social-mascot img',{rotation:7,duration:.22,ease:'sine.inOut'}).to('.social-mascot img',{rotation:-4,duration:.2,ease:'sine.inOut'}).to('.social-mascot img',{rotation:0,duration:.25,ease:'sine.out'});
    onArrive('.social-head','top 75%',wave);
    const tl=g.timeline({scrollTrigger:{trigger:'.social-cards',start:'top 90%',end:'bottom 70%',scrub:.6}});
    $$('.social-card').forEach((c,i)=>tl.from(c,{y:()=>70*U(),autoAlpha:0,duration:.4,ease:'power3.out'},i*.12).from($('.social-icon',c),{scale:0,rotation:-150,duration:.3,ease:'back.out(2)'},i*.12+.12));
  }

  /* 8 — Contact: the number 13 drops in, the address rises and the bag arrives with its sparks. */
  function contactScene(){
    const tl=g.timeline({scrollTrigger:{trigger:'#contact',start:'top 80%',end:'top 30%',scrub:.6,invalidateOnRefresh:true}});
    tl.from('.contact-face img',{x:()=>-140*U(),rotation:-14,autoAlpha:0,duration:.6,ease:'power3.out'},0)
      .from('.contact-face .spark',{scale:0,duration:.3,stagger:.1,ease:'back.out(2)'},.4)
      .from('.address-number',{y:()=>-120*U(),autoAlpha:0,duration:.5,ease:'bounce.out'},.1)
      .from('.address-words',{x:30,autoAlpha:0,duration:.4},.3)
      .from('.contact-actions>*,.contact-social li',{y:20,autoAlpha:0,stagger:.05,duration:.3},.45);
    g.to('.contact-scene',{'--r':0});
  }

  /* 9 — Footer: "À très vite" fills in as the page ends. */
  function footerScene(){
    g.fromTo('.wordmark-fill',{clipPath:'inset(0% 100% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',ease:'none',scrollTrigger:{trigger:'.site-footer',start:'top 85%',end:'bottom bottom',scrub:.6}});
    g.fromTo('.wordmark',{xPercent:-5},{xPercent:0,ease:'none',scrollTrigger:{trigger:'.site-footer',start:'top bottom',end:'bottom bottom',scrub:.6}});
    g.from('.footer-cols>div',{y:30,autoAlpha:0,stagger:.08,duration:.6,ease:'power3.out',scrollTrigger:{trigger:'.footer-cols',start:'top 96%',toggleActions:'play none none reverse'}});
  }

  function build(){
    if(ctx)return;mode=desk();
    ctx=g.context(()=>{const cleanups=[];heroScene(cleanups);rayonsScene();marqueeScene(cleanups);serviceScene();stepsScene();storeScene();socialScene();contactScene();footerScene();return()=>cleanups.forEach(f=>f());});
    ST.refresh();document.fonts?.ready.then(()=>{if(ctx)ST.refresh();});
  }
  function kill(){
    if(!ctx){root.classList.remove('intro');return;}
    ctx.revert();ctx=null;unsplit();clones.forEach(c=>c.remove());clones=[];root.classList.remove('intro');
  }
  document.addEventListener('panier:motion',e=>{if(e.detail?.enabled)build();else kill();});
  addEventListener('resize',()=>{if(ctx&&desk()!==mode){kill();build();}});
  if(window.PANIER_MOTION?.enabled)build();else root.classList.remove('intro');
})();
