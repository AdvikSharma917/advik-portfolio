(function(){
'use strict';

document.documentElement.classList.remove('no-js');

document.querySelectorAll('a svg,button svg').forEach(svg => {
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
});

/* ────────────────────────────────────────────────
   ENVIRONMENT
──────────────────────────────────────────────── */
const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const TOUCH = !window.matchMedia('(pointer: fine)').matches;
const MOBILE = window.innerWidth < 768;

if (!TOUCH && !MOBILE && !RM) {
  document.documentElement.classList.add('has-custom-cursor');
}

function splitHeroName() {
  document.querySelectorAll('.hero-name .word').forEach(word => {
    if (word.dataset.split === 'true') return;
    const text = word.dataset.text || word.textContent;
    word.textContent = '';
    Array.from(text).forEach(ch => {
      const letter = document.createElement('span');
      letter.className = 'char';
      letter.innerHTML = ch === ' ' ? '&nbsp;' : ch;
      word.appendChild(letter);
    });
    word.dataset.split = 'true';
  });
}

function revealStaticContent() {
  const pre = document.getElementById('pre');
  if (pre) pre.remove();
  document.querySelectorAll('.hero-name .char,.hero-name .accent-dot,.h-tag,.h-sub,.h-ctas,.h-scroll,.rv,.rvs,.rvl').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
  document.querySelectorAll('.as-path').forEach(el => {
    el.style.strokeDashoffset = '0';
  });
}

window.Portfolio = {
  splitHeroName,
  revealStaticContent
};

window.setTimeout(() => {
  if (document.getElementById('pre')) {
    splitHeroName();
    revealStaticContent();
  }
}, 3200);

/* ────────────────────────────────────────────────
   SCROLL PROGRESS
──────────────────────────────────────────────── */
const sp = document.getElementById('sp');
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  sp.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
}, {passive:true});

/* ────────────────────────────────────────────────
   NAV
──────────────────────────────────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('s', window.scrollY > 50);
}, {passive:true});

const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
const navTargets = navLinks
  .map(link => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);
const navSections = [document.getElementById('hero'), ...navTargets].filter(Boolean);

function setActiveNavLink() {
  let activeId = 'hero';
  navSections.forEach(section => {
    if (section.getBoundingClientRect().top <= 140) activeId = section.id;
  });
  navLinks.forEach(link => {
    const isActive = link.getAttribute('href') === `#${activeId}`;
    if (isActive) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
}

setActiveNavLink();
window.addEventListener('scroll', setActiveNavLink, {passive:true});

/* ────────────────────────────────────────────────
   CONTACT FORM
──────────────────────────────────────────────── */
const contactForm = document.getElementById('cform');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!this.reportValidity()) return;
    const name = this.querySelector('#fn').value.trim();
    const email= this.querySelector('#fe').value.trim();
    const msg  = this.querySelector('#fm').value.trim();
    if (!name||!email||!msg) return;
    window.location.href =
      `mailto:Adviksharmaa917@gmail.com?subject=${encodeURIComponent('Portfolio Contact from '+name)}&body=${encodeURIComponent('Hi Advik,\n\n'+msg+'\n\n- '+name+' ('+email+')')}`;
  });
}

/* ────────────────────────────────────────────────
   SPRING CURSOR  (MagicUI algorithm, vanilla JS)
──────────────────────────────────────────────── */
if (!TOUCH && !MOBILE && !RM) {
  const cur = document.getElementById('cur');

  /* minimal spring implementation */
  function mkSpring(init, cfg) {
    const k = cfg.stiffness || 400;
    const d = cfg.damping   || 45;
    const m = cfg.mass      || 1;
    let pos = init, vel = 0, tgt = init;
    return {
      set(v){ tgt = v; },
      get(){ return pos; },
      tick(dt){
        const a = (-k*(pos-tgt) - d*vel) / m;
        vel += a * dt;
        pos += vel * dt;
        return pos;
      }
    };
  }

  const sx = mkSpring(0, {stiffness:400, damping:45, mass:1});
  const sy = mkSpring(0, {stiffness:400, damping:45, mass:1});
  const sr = mkSpring(0, {stiffness:300, damping:60, mass:1});
  const ss = mkSpring(1, {stiffness:500, damping:35, mass:1});

  let mx=0, my=0, lx=0, ly=0, lt=Date.now();
  let prevAngle=0, accRot=0;
  let scaleTimer=null, visible=false;
  const hoverTargets = 'a,button,input,textarea,select,[role="button"],[data-tilt]';

  const onPointer = e => {
    if (e.pointerType === 'touch') return;
    if (!visible) { cur.classList.add('vis'); visible=true; }

    const now = Date.now();
    const dt  = Math.max(now - lt, 1);
    const vx  = (e.clientX - lx) / dt;
    const vy  = (e.clientY - ly) / dt;
    lt = now; lx = e.clientX; ly = e.clientY;

    mx = e.clientX; my = e.clientY;
    sx.set(mx); sy.set(my);

    const speed = Math.sqrt(vx*vx + vy*vy);
    if (speed > 0.08) {
      let ang = Math.atan2(vy, vx) * (180/Math.PI) + 90;
      let diff = ang - prevAngle;
      if (diff >  180) diff -= 360;
      if (diff < -180) diff += 360;
      accRot += diff;
      sr.set(accRot);
      prevAngle = ang;
      ss.set(0.88);
      if (scaleTimer) clearTimeout(scaleTimer);
      scaleTimer = setTimeout(() => ss.set(1), 150);
    }
  };

  let pRaf = 0;
  window.addEventListener('pointermove', e => {
    if (pRaf) return;
    pRaf = requestAnimationFrame(() => { onPointer(e); pRaf=0; });
  }, {passive:true});

  window.addEventListener('pointerover', e => {
    if (e.pointerType === 'touch') return;
    if (e.target.closest(hoverTargets)) ss.set(1.18);
  }, {passive:true});

  window.addEventListener('pointerout', e => {
    if (e.pointerType === 'touch') return;
    if (e.target.closest(hoverTargets)) ss.set(1);
  }, {passive:true});

  document.addEventListener('pointerleave', () => {
    cur.classList.remove('vis');
    visible = false;
  });

  let last = performance.now();
  function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    const x = sx.tick(dt);
    const y = sy.tick(dt);
    const r = sr.tick(dt);
    const sc = ss.tick(dt);
    cur.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%) rotate(${r}deg) scale(${sc})`;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

})();
