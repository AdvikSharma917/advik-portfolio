(function(){
'use strict';

const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const TOUCH = !window.matchMedia('(pointer: fine)').matches;
const MOBILE = window.innerWidth < 768;
const {splitHeroName, revealStaticContent} = window.Portfolio || {};

function getWebGLContext(canvas) {
  if (!window.WebGLRenderingContext) return null;
  const attrs = {antialias:false, alpha:true};
  return canvas.getContext('webgl', attrs) || canvas.getContext('experimental-webgl', attrs);
}

/* ────────────────────────────────────────────────
   THREE.JS HERO  — Icosahedron + constellation + particles
──────────────────────────────────────────────── */
function initHeroScene() {
  try {
  const canvas = document.getElementById('c3d');
  const W = () => canvas.clientWidth;
  const H = () => canvas.clientHeight;
  const context = getWebGLContext(canvas);
  if (!context) return;

  const renderer = new THREE.WebGLRenderer({canvas, context, antialias:false, alpha:true});
  document.getElementById('hero').classList.add('three-ready');
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(W(), H(), false);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x06070A, 0.028);

  const camera = new THREE.PerspectiveCamera(55, W()/H(), 0.1, 200);
  camera.position.set(0, 0.5, 10);

  /* --- Wireframe icosahedron --- */
  const icoG = new THREE.IcosahedronGeometry(2.6, 1);
  const icoE = new THREE.EdgesGeometry(icoG);
  const icoM = new THREE.LineBasicMaterial({color:0x3B82F6, transparent:true, opacity:0.55});
  const ico  = new THREE.LineSegments(icoE, icoM);
  scene.add(ico);

  /* --- Inner glowing sphere --- */
  const coreG = new THREE.SphereGeometry(0.6, 16, 16);
  const coreM = new THREE.MeshBasicMaterial({color:0x00D4FF, transparent:true, opacity:0.18});
  const core  = new THREE.Mesh(coreG, coreM);
  scene.add(core);

  /* --- Outer ring --- */
  const ringG = new THREE.TorusGeometry(4.2, 0.008, 6, 100);
  const ringM = new THREE.LineBasicMaterial({color:0x00D4FF, transparent:true, opacity:0.18});
  const ring  = new THREE.LineSegments(new THREE.EdgesGeometry(ringG), ringM);
  ring.rotation.x = Math.PI / 2.4;
  scene.add(ring);

  /* --- Particles --- */
  const COUNT = 1400;
  const pos   = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const r     = 5 + Math.random() * 14;
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
    pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i*3+2] = r * Math.cos(phi);
  }
  const ptG = new THREE.BufferGeometry();
  ptG.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const ptM = new THREE.PointsMaterial({
    color:0x60A5FA, size:0.035, transparent:true, opacity:0.65,
    blending:THREE.AdditiveBlending, depthWrite:false
  });
  const pts = new THREE.Points(ptG, ptM);
  scene.add(pts);

  /* --- Constellation lines (pre-computed between first 120 pts) --- */
  const lineVerts = [];
  for (let i = 0; i < 120; i++) {
    for (let j = i+1; j < 120; j++) {
      const dx = pos[i*3]-pos[j*3], dy = pos[i*3+1]-pos[j*3+1], dz = pos[i*3+2]-pos[j*3+2];
      const d = Math.sqrt(dx*dx+dy*dy+dz*dz);
      if (d < 3.5 && lineVerts.length < 3000) {
        lineVerts.push(pos[i*3],pos[i*3+1],pos[i*3+2], pos[j*3],pos[j*3+1],pos[j*3+2]);
      }
    }
  }
  const conG = new THREE.BufferGeometry();
  conG.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lineVerts), 3));
  const conM = new THREE.LineBasicMaterial({color:0x3B82F6, transparent:true, opacity:0.12});
  const con  = new THREE.LineSegments(conG, conM);
  scene.add(con);

  /* --- Mouse parallax --- */
  let tMx=0, tMy=0;
  document.addEventListener('mousemove', e => {
    tMx = (e.clientX/innerWidth  - 0.5) * 0.8;
    tMy = (e.clientY/innerHeight - 0.5) * 0.8;
  });

  /* --- Scroll-driven camera pull --- */
  let camZ = 10;
  window.addEventListener('scroll', () => {
    const ratio = window.scrollY / (document.body.scrollHeight - innerHeight);
    camZ = 10 + ratio * 8;
  }, {passive:true});

  /* --- Animate --- */
  let t0 = performance.now();
  function render(now) {
    requestAnimationFrame(render);
    const t = (now - t0) * 0.001;

    ico.rotation.y = t * 0.14;
    ico.rotation.x = t * 0.07;
    con.rotation.y = t * 0.14;
    con.rotation.x = t * 0.07;
    ring.rotation.z = t * 0.06;
    pts.rotation.y  = t * 0.04;
    core.scale.setScalar(1 + Math.sin(t * 1.2) * 0.08);

    camera.position.x += (tMx - camera.position.x) * 0.025;
    camera.position.y += (-tMy - camera.position.y) * 0.025;
    camera.position.z += (camZ - camera.position.z) * 0.04;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  requestAnimationFrame(render);

  /* resize */
  const ro = new ResizeObserver(() => {
    renderer.setSize(W(), H(), false);
    camera.aspect = W()/H();
    camera.updateProjectionMatrix();
  });
  ro.observe(canvas.parentElement);
  } catch (err) {
    console.warn('Hero WebGL unavailable:', err);
  }
}

if (!MOBILE && !RM && typeof THREE !== 'undefined') {
  initHeroScene();
}

/* ────────────────────────────────────────────────
   LENIS + GSAP
──────────────────────────────────────────────── */
let lenis;
if (!RM && typeof Lenis !== 'undefined') {
  lenis = new Lenis({duration:1.15, easing:t=>Math.min(1,1.001-Math.pow(2,-10*t))});
  const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
  if (typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.lagSmoothing(0);
  }
}

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const el = document.querySelector(a.getAttribute('href'));
    if (!el) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(el, {offset:-80,duration:1.3}) : el.scrollIntoView({behavior:RM ? 'auto' : 'smooth'});
    history.pushState(null, '', a.getAttribute('href'));
  });
});

/* ────────────────────────────────────────────────
   GSAP ANIMATIONS
──────────────────────────────────────────────── */
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);

  /* Preloader */
  const pre = document.getElementById('pre');
  const logo = document.getElementById('pre-logo');

  /* Hero reveal (after preloader) */
  function initHero() {
    splitHeroName?.();

    if (RM) {
      gsap.set('.hero-name .char,.hero-name .accent-dot,.h-tag,.h-sub,.h-ctas,.h-scroll', {
        opacity:1, y:0, rotate:0
      });
    } else {
      document.querySelectorAll('.hero-name .word').forEach((word, i) => {
        gsap.to(word.querySelectorAll('.char'), {
          opacity:1, y:0, rotate:0, duration:1, ease:'expo.out',
          stagger:.038, delay:i*.12
        });
      });
      gsap.to('.hero-name .accent-dot', {opacity:1, y:0, rotate:0, duration:.8, ease:'expo.out', delay:.36});
      gsap.to('.h-tag',    {opacity:1, y:0, duration:.8, ease:'expo.out', delay:.3});
      gsap.to('.h-sub',    {opacity:1, y:0, duration:.8, ease:'expo.out', delay:.55});
      gsap.to('.h-ctas',   {opacity:1, y:0, duration:.8, ease:'expo.out', delay:.75});
      gsap.to('.h-scroll', {opacity:1,       duration:.6, ease:'expo.out', delay:1.1});
    }

    /* AS svg stroke */
    gsap.to('.as-path', {
      strokeDashoffset:0, duration:RM ? 0 : 2, ease:'power2.inOut',
      scrollTrigger:{trigger:'#ab', start:'top 80%', once:true}
    });
  }

  if (RM) {
    if (pre) pre.remove();
    initHero();
  } else {
    const preTL = gsap.timeline({
      onComplete() {
        gsap.to(pre, {opacity:0, duration:.5, onComplete:() => pre.remove()});
        initHero();
      }
    });
    preTL
      .to(logo, {clipPath:'inset(0 0% 0 0)', duration:.9, ease:'expo.out'})
      .to(logo, {y:-30, opacity:0, duration:.4, ease:'expo.in'}, '+=.4');
  }

  /* Section reveals */
  gsap.utils.toArray('.rv,.rvs,.rvl').forEach(el => {
    gsap.to(el, {
      opacity:1, y:0, x:0, scale:1, duration: RM ? 0 : .9, ease:'expo.out',
      scrollTrigger:{trigger:el, start:'top 90%', once:true}
    });
  });

  /* Counters */
  const counters = [
    {id:'cn-rank',  target:155,   fmt:v=>'#'+Math.round(v)},
    {id:'cn-subs',  target:17917, fmt:v=>Math.round(v).toLocaleString()},
    {id:'cn-score', target:9663,  fmt:v=>(v/100).toFixed(2)+'%'},
    {id:'cn-gp',    target:100,   fmt:v=>Math.round(v)+'+'},
    {id:'cn-mo',    target:2,     fmt:v=>Math.round(v)},
  ];
  counters.forEach(({id,target,fmt}) => {
    const el = document.getElementById(id);
    if (!el) return;
    ScrollTrigger.create({
      trigger:el, start:'top 88%', once:true,
      onEnter() {
        const o = {v:0};
        gsap.to(o, {v:target, duration:1.6, ease:'power2.out', onUpdate:()=>{ el.textContent=fmt(o.v); }});
      }
    });
  });
}
else {
  revealStaticContent?.();
}

/* ────────────────────────────────────────────────
   VANILLA TILT  (desktop only)
──────────────────────────────────────────────── */
if (!MOBILE && typeof VanillaTilt !== 'undefined') {
  VanillaTilt.init(document.querySelectorAll('[data-tilt]'), {
    max:7, speed:450, perspective:900, glare:true, 'max-glare':0.1, scale:1.02
  });
}

/* ────────────────────────────────────────────────
   MOBILE: instant reveals
──────────────────────────────────────────────── */
if (MOBILE || RM) {
  document.querySelectorAll('.rv,.rvs,.rvl').forEach(el => {
    el.style.opacity='1';
    el.style.transform='none';
  });
}

})();
