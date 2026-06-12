'use strict';

/* ─── Reveal on scroll ─────────────────────────── */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ─── Sticky nav & Mobile Menu ─────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
if (mobileMenuBtn && nav) {
  mobileMenuBtn.addEventListener('click', () => {
    nav.classList.toggle('nav-open');
  });
  
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('nav-open');
    });
  });
}

/* ─── Use-case tabs ────────────────────────────── */
function activateTab(id) {
  document.querySelectorAll('.uc-tab').forEach(b => b.classList.toggle('active', b.dataset.uc === id));
  document.querySelectorAll('.uc-panel').forEach(p => p.classList.toggle('active', p.id === 'uc-' + id));
}

document.querySelectorAll('.uc-tab').forEach(btn => {
  btn.addEventListener('click', () => activateTab(btn.dataset.uc));
});

/* Footer Use-case links */
document.querySelectorAll('.footer-uc-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const id = link.dataset.uc;
    activateTab(id);
    const target = document.getElementById('usecases');
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

/* ─── Mouse glow on cards ──────────────────────── */
document.querySelectorAll('.pillar-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

/* ─── Count-up animation ───────────────────────── */
function countUp(el, target, duration) {
  const isFloat = String(target).includes('.');
  const end = parseFloat(target);
  const step = 16;
  const inc = end / (duration / step);
  let cur = 0;
  const timer = setInterval(() => {
    cur = Math.min(cur + inc, end);
    el.textContent = isFloat ? cur.toFixed(1) : Math.floor(cur);
    if (cur >= end) { el.textContent = isFloat ? end.toFixed(1) : end; clearInterval(timer); }
  }, step);
}

const countObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.querySelectorAll('.mc-count').forEach(el => {
      countUp(el, el.dataset.target, 1400);
    });
    countObs.unobserve(e.target);
  });
}, { threshold: 0.3 });

const metGrid = document.querySelector('.metrics-grid');
if (metGrid) countObs.observe(metGrid);

/* ─── Animated Particles Background (Global) ─────────── */
(function initParticles() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;opacity:0.4;';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let particles = [];
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;

  const colors = ['rgba(232,160,0,0.5)', 'rgba(245,183,49,0.4)', 'rgba(255,202,69,0.3)'];

  class Particle {
    constructor() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 1.2 + 0.6;
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > w) this.vx *= -1;
      if (this.y < 0 || this.y > h) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  function init() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    particles = [];
    if (w < 860) return; // Disable on mobile for smoother transitions
    const count = Math.min(Math.floor((w * h) / 10000), 150);
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255,255,255, ${0.1 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }

  init();
  animate();
  window.addEventListener('resize', init, { passive: true });
})();

/* ─── Animated beam background (Hero only) ─────────── */
(function initBeams() {
  const heroBg = document.getElementById('hero-bg');
  if (!heroBg || window.innerWidth < 860) return; // Disable on mobile for performance

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:0.4; mix-blend-mode: screen;';
  heroBg.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const palette = [ [232, 160, 0], [245, 183, 49], [255, 202, 69] ];
  let beams = [];
  let w, h;

  function resize() {
    w = canvas.width = heroBg.clientWidth;
    h = canvas.height = heroBg.clientHeight;
    beams = Array.from({ length: 8 }, (_, i) => {
      const col = palette[Math.random() < 0.6 ? 0 : Math.random() < 0.8 ? 1 : 2];
      return {
        x:  (w / 8) * i + Math.random() * 60 - 30,
        w:  Math.random() * 80 + 30,
        h:  h + 400,
        a:  Math.random() * 20 - 10,
        o:  Math.random() * 0.12 + 0.03, // Slight opacity tweak
        dx: (Math.random() - 0.5) * 0.2,
        c:  col,
      };
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    beams.forEach(b => {
      ctx.save();
      ctx.translate(b.x + b.w / 2, h / 2);
      ctx.rotate(b.a * Math.PI / 180);
      const g = ctx.createLinearGradient(0, -b.h / 2, 0, b.h / 2);
      const [r, g2, bl] = b.c;
      g.addColorStop(0,   `rgba(${r},${g2},${bl},0)`);
      g.addColorStop(0.3, `rgba(${r},${g2},${bl},${b.o})`);
      g.addColorStop(0.7, `rgba(${r},${g2},${bl},${b.o})`);
      g.addColorStop(1,   `rgba(${r},${g2},${bl},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
      ctx.restore();
      b.x += b.dx;
      if (b.x > w + 100)  b.x = -100;
      if (b.x < -100) b.x = w + 100;
    });
    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', resize, { passive: true });
})();

/* ─── Scramble text utility ────────────────────── */
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';
function scramble(el, speed = 36) {
  const text = el.dataset.text || el.textContent;
  let i = 0;
  const iv = setInterval(() => {
    el.textContent = text.split('').map((ch, idx) => {
      if (/[\s→·]/.test(ch)) return ch;
      if (idx < i) return text[idx];
      return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    }).join('');
    i += 1 / 3;
    if (i >= text.length) { el.textContent = text; clearInterval(iv); }
  }, speed);
}

/* matrix spin every 15s */
setInterval(() => {
  document.querySelectorAll('[data-text]').forEach(el => scramble(el));
}, 15000);

/* ─── Smooth active nav link highlight ─────────── */
const sections = document.querySelectorAll('section[id], div[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const sectionObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(a => {
        a.style.color = a.getAttribute('href') === '#' + e.target.id ? 'var(--text)' : '';
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(s => sectionObs.observe(s));

/* ─── FAQ Accordion ────────────────────────────── */
document.querySelectorAll('.faq-item').forEach(item => {
  const button = item.querySelector('.faq-question');

  button.addEventListener('click', () => {    
    // Close other items (cleaner)
    document.querySelectorAll('.faq-item').forEach(other => {
      if (other !== item) other.classList.remove('active');
    });

    item.classList.toggle('active');
  });
});


