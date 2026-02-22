/* ══════════════════════════════════════════════════
   Portfolio — Love Kush Pranu
   Green theme · Mouse-follow circle (hero only)
   Neumorphic pixel art · OSIRIS projects · Blog
══════════════════════════════════════════════════ */

/* ── PRELOADER ───────────────────────────────────── */
const preloader = document.getElementById('preloader');
const preFill   = document.getElementById('preFill');
const prePct    = document.getElementById('prePct');
let pct = 0;
const pctTimer = setInterval(() => {
  pct += Math.random() * 14;
  if (pct >= 100) { pct = 100; clearInterval(pctTimer); endPreload(); }
  preFill.style.width = pct + '%';
  prePct.textContent  = Math.floor(pct) + '%';
}, 100);
function endPreload() {
  setTimeout(() => {
    preloader.classList.add('done');
    document.body.classList.add('loaded');
    animateHeroTitle();
  }, 350);
}

/* ── CURSOR ──────────────────────────────────────── */
const cursor     = document.getElementById('cursor');
const cursorRing = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
});
(function lerpRing() {
  rx += (mx - rx) * 0.1; ry += (my - ry) * 0.1;
  cursorRing.style.left = rx + 'px'; cursorRing.style.top = ry + 'px';
  requestAnimationFrame(lerpRing);
})();
document.querySelectorAll('a, button, input, textarea, .service-row, .exp-row, .project-block, .osiris-card, .blog-card, .na-keys span').forEach(el => {
  el.addEventListener('mouseenter', () => { cursor.classList.add('big'); cursorRing.classList.add('big'); });
  el.addEventListener('mouseleave', () => { cursor.classList.remove('big'); cursorRing.classList.remove('big'); });
});
document.addEventListener('mousedown', () => cursor.classList.add('clicked'));
document.addEventListener('mouseup',   () => cursor.classList.remove('clicked'));

/* ── HERO CIRCLE — follows mouse ONLY on title hover ─ */
const heroCircle = document.getElementById('heroCircle');
const heroTitle  = document.getElementById('heroTitle');
let heroCircleX = 0, heroCircleY = 0;
let targetCX = 0, targetCY = 0;
let onTitle = false;

if (heroTitle) {
  heroTitle.addEventListener('mouseenter', () => { onTitle = true; });
  heroTitle.addEventListener('mouseleave', () => {
    onTitle = false;
    targetCX = 0; targetCY = 0; // smoothly return
  });
}

document.addEventListener('mousemove', e => {
  if (!onTitle || !heroCircle) return;
  const rect = document.getElementById('hero').getBoundingClientRect();
  targetCX = (e.clientX - rect.left - rect.width  * 0.5) * 0.55;
  targetCY = (e.clientY - rect.top  - rect.height * 0.5) * 0.35;
});

(function animCircle() {
  heroCircleX += (targetCX - heroCircleX) * 0.06;
  heroCircleY += (targetCY - heroCircleY) * 0.06;
  if (heroCircle) {
    heroCircle.style.transform = `translate(${heroCircleX}px, ${heroCircleY}px)`;
  }
  requestAnimationFrame(animCircle);
})();

/* ── THREE.JS HERO SCENE ─────────────────────────── */
function initHeroScene() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const parent = canvas.parentElement;
  const W = parent.clientWidth  || 420;
  const H = parent.clientHeight || 420;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(W, H, false);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, W / H, 0.1, 100);
  camera.position.z = 5.2;

  const G1 = 0x22c55e, G2 = 0x4ade80;

  // Master group (for mouse tilt)
  const group = new THREE.Group();
  scene.add(group);

  // ── Wireframe icosahedron ──
  const ico = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.35, 1),
    new THREE.MeshBasicMaterial({ color: G1, wireframe: true, transparent: true, opacity: 0.72 })
  );
  group.add(ico);

  // ── Outer wireframe sphere ──
  const sph = new THREE.Mesh(
    new THREE.SphereGeometry(2.15, 18, 13),
    new THREE.MeshBasicMaterial({ color: G2, wireframe: true, transparent: true, opacity: 0.09 })
  );
  group.add(sph);

  // ── Three orbit rings ──
  function ring(r, rx, rz) {
    const m = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.006, 4, 90),
      new THREE.MeshBasicMaterial({ color: G1, transparent: true, opacity: 0.28 })
    );
    m.rotation.x = rx; m.rotation.z = rz;
    group.add(m); return m;
  }
  const r1 = ring(2.1, Math.PI / 2, 0);
  const r2 = ring(2.1, Math.PI / 5, Math.PI / 3.2);
  const r3 = ring(2.1, -Math.PI / 4.5, -Math.PI / 4.8);

  // ── Orbiting glowing dots ──
  const dotTemplate = new THREE.Mesh(
    new THREE.SphereGeometry(0.052, 7, 7),
    new THREE.MeshBasicMaterial({ color: G2 })
  );
  const dots = Array.from({ length: 5 }, (_, i) => {
    const d = { mesh: dotTemplate.clone(), angle: (i / 5) * Math.PI * 2, speed: 0.36 + i * 0.07, radius: 2.1, yOff: (i - 2) * 0.32 };
    group.add(d.mesh); return d;
  });

  // ── Background particle field ──
  const pCount = 130;
  const pPos   = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const rad   = 2.6 + Math.random() * 1.6;
    pPos[i*3]   = rad * Math.sin(phi) * Math.cos(theta);
    pPos[i*3+1] = rad * Math.sin(phi) * Math.sin(theta);
    pPos[i*3+2] = rad * Math.cos(phi);
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  group.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color: G1, size: 0.026, transparent: true, opacity: 0.52 })));

  // ── Mouse tilt ──
  let mx = 0, my = 0, rotX = 0, rotY = 0;
  parent.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mx = (e.clientX - rect.left) / rect.width  * 2 - 1;
    my = -((e.clientY - rect.top)  / rect.height * 2 - 1);
  });

  // ── Render loop ──
  const clock = new THREE.Clock();
  (function loop() {
    const t = clock.getElapsedTime();
    ico.rotation.x = t * 0.19; ico.rotation.y = t * 0.27;
    sph.rotation.y = t * 0.055;
    r1.rotation.z  = t * 0.28;
    r2.rotation.z  = -t * 0.19;
    r3.rotation.z  = t * 0.16;
    dots.forEach(d => {
      d.angle += d.speed * 0.013;
      d.mesh.position.set(Math.cos(d.angle) * d.radius, d.yOff, Math.sin(d.angle) * d.radius);
    });
    rotX += (my * 0.30 - rotX) * 0.055;
    rotY += (mx * 0.40 - rotY) * 0.055;
    group.rotation.x = rotX; group.rotation.y = rotY;
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  })();

  // ── Resize ──
  const ro = new ResizeObserver(() => {
    const nW = parent.clientWidth, nH = parent.clientHeight;
    renderer.setSize(nW, nH, false);
    camera.aspect = nW / nH; camera.updateProjectionMatrix();
  });
  ro.observe(parent);
}
/* call after preloader fades */
window.addEventListener('load', () => setTimeout(initHeroScene, 500));

/* ── HERO TITLE STAGGER ──────────────────────────── */
function animateHeroTitle() {
  document.querySelectorAll('.ht-line').forEach((span, i) => {
    span.style.opacity = '0';
    span.style.transform = 'translateY(50px)';
    span.style.transition = `opacity 0.75s cubic-bezier(0.16,1,0.3,1) ${300 + i * 110}ms, transform 0.75s cubic-bezier(0.16,1,0.3,1) ${300 + i * 110}ms`;
    setTimeout(() => { span.style.opacity = '1'; span.style.transform = 'none'; }, 50);
  });
  const eyebrow = document.querySelector('.hero-eyebrow');
  const bottom  = document.querySelector('.hero-bottom');
  [eyebrow, bottom].forEach((el, i) => {
    if (!el) return;
    el.style.opacity = '0';
    el.style.transition = `opacity 0.8s ease ${600 + i * 200}ms`;
    setTimeout(() => { el.style.opacity = '1'; }, 50);
  });
}

/* ── CHIP-8 PIXEL ART ─────────────────────────────── */
const pixelGrid = document.getElementById('pixelGrid');
if (pixelGrid) {
  // 16×8 display snippet — random Pong-like pattern
  const pattern = [
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
    1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,
    1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,1,
    1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,1,
    1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  ];
  pattern.forEach(bit => {
    const p = document.createElement('div');
    p.className = 'na-pixel ' + (bit ? 'on' : 'off');
    pixelGrid.appendChild(p);
  });
  // Animate random pixels
  setInterval(() => {
    const pixels = pixelGrid.querySelectorAll('.na-pixel');
    const idx = Math.floor(Math.random() * pixels.length);
    pixels[idx].classList.toggle('on');
    pixels[idx].classList.toggle('off');
  }, 400);
}

/* ── NAV SCROLL ──────────────────────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

/* ── HAMBURGER / MOBILE MENU ─────────────────────── */
const hamburger = document.getElementById('hamburger');
const mobMenu   = document.getElementById('mobMenu');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobMenu.classList.toggle('open');
  document.body.style.overflow = mobMenu.classList.contains('open') ? 'hidden' : '';
});
document.querySelectorAll('.mob-item').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ── SMOOTH SCROLL (offset for nav) ─────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  });
});

/* ── SCROLL REVEAL ───────────────────────────────── */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

const revealSelectors = [
  '.sec-label', '.about-headline', '.about-p', '.about-tags', '.about-actions-row',
  '.about-stat-cards', '.photo-box',
  '.services-title', '.service-row',
  '.work-title', '.project-block',
  '.osiris-header', '.osiris-desc', '.osiris-card',
  '.exp-row',
  '.ach-quote',
  '.sg-col',
  '.blog-header', '.blog-card',
  '.contact-title', '.contact-left', '.contact-form',
  '.footer-inner'
];
revealSelectors.forEach(sel => {
  document.querySelectorAll(sel).forEach((el, i) => {
    el.classList.add('reveal');
    el.style.setProperty('--d', (i % 5) * 70 + 'ms');
    revealObs.observe(el);
  });
});

/* ── PROJECT IMAGE TILT ──────────────────────────── */
document.querySelectorAll('.proj-img').forEach(img => {
  img.addEventListener('mousemove', e => {
    const r = img.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    img.style.transform = `perspective(900px) rotateY(${x * 4}deg) rotateX(${-y * 3}deg) scale(1.005)`;
  });
  img.addEventListener('mouseleave', () => { img.style.transform = ''; });
});

/* ── NEUMORPHIC CELL ANIMATION ────────────────────── */
const kernelCells = document.querySelectorAll('.na-cell');
if (kernelCells.length) {
  setInterval(() => {
    const i = Math.floor(Math.random() * kernelCells.length);
    kernelCells[i].classList.toggle('active');
  }, 500);
}
const mlNodes = document.querySelectorAll('.na-node');
if (mlNodes.length) {
  setInterval(() => {
    const i = Math.floor(Math.random() * mlNodes.length);
    mlNodes[i].classList.toggle('active');
  }, 600);
}

/* ── ACTIVE NAV LINK ─────────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navAs    = document.querySelectorAll('.nav-links a');
const sectionObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navAs.forEach(a => a.style.color = '');
      const active = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
      if (active) active.style.color = 'var(--accent)';
    }
  });
}, { threshold: 0.35 });
sections.forEach(s => sectionObs.observe(s));

/* ── CONTACT FORM (Formspree) ────────────────────── */
/* 1. Go to https://formspree.io → create a free account
   2. Create a new form → copy the form ID (e.g. "xyzabcde")
   3. Replace REPLACE_WITH_YOUR_FORM_ID below with that ID     */
const FORMSPREE_ID = 'REPLACE_WITH_YOUR_FORM_ID';

const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn      = form.querySelector('.btn-send');
    const btnLabel = btn.querySelector('span:first-child');
    btnLabel.textContent = 'Sending…';
    btn.disabled = true;

    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method:  'POST',
        body:    new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        form.innerHTML = `<div class="form-sent">"Thanks for reaching out.<br/>I'll get back to you soon."</div>`;
      } else {
        const data = await res.json();
        btnLabel.textContent = 'Try Again';
        btn.disabled = false;
        alert(data?.errors?.map(e => e.message).join(', ') || 'Something went wrong. Email me at lp2989@nyu.edu');
      }
    } catch {
      btnLabel.textContent = 'Try Again';
      btn.disabled = false;
      alert('Network error. Please email me directly at lp2989@nyu.edu');
    }
  });
}

/* ── OSIRIS CARD GLOW ON HOVER ───────────────────── */
document.querySelectorAll('.osiris-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width  * 100).toFixed(1);
    const y = ((e.clientY - r.top)  / r.height * 100).toFixed(1);
    card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(34,197,94,0.06) 0%, var(--surface) 60%)`;
  });
  card.addEventListener('mouseleave', () => { card.style.background = ''; });
});
