import { CodeUniverse } from './scene.js';
import { TypeEffect, CounterAnim, SectionReveal } from './effects.js';

let universe = null;
let typedEffect = null;

function init3D() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  try {
    universe = new CodeUniverse(canvas);
  } catch (e) {
    console.warn('[3D] CodeUniverse init failed (hiding canvas):', e);
    canvas.style.display = 'none';
  }
}

function initTyped() {
  const el = document.getElementById('typed');
  if (!el) return;

  const start = () => {
    const words = i18n.t('hero.typed');
    if (typedEffect && typedEffect.stop) typedEffect.stop();
    typedEffect = new TypeEffect(el, Array.isArray(words) ? words : [words || '']);
  };
  start();
  document.addEventListener('langchange', start);
}

function initStats() {
  const stats = document.querySelectorAll('.stat-number');
  if (stats.length) CounterAnim.observe(stats);
}

function initReveals() {
  SectionReveal.init();
}

function initSmoothScroll() {
  const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64;
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === '#' || href.length < 2) return; // skip bare "#"
    link.addEventListener('click', (e) => {
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

function initBackToTop() {
  const btn = document.getElementById('back-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function initMenu() {
  const hamburger = document.getElementById('hamburger');
  const panel = document.getElementById('menu-panel');
  const overlay = document.getElementById('menu-overlay');
  if (!hamburger || !panel) return;

  const toggle = (force) => {
    const open = force != null ? force : !panel.classList.contains('open');
    panel.classList.toggle('open', open);
    overlay && overlay.classList.toggle('open', open);
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
  };

  hamburger.addEventListener('click', () => toggle());
  if (overlay) overlay.addEventListener('click', () => toggle(false));
  panel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => { if (panel.classList.contains('open')) toggle(false); });
  });
}

async function main() {
  await i18n.init();
  init3D();
  initTyped();
  initStats();
  initReveals();
  initSmoothScroll();
  initBackToTop();
  initMenu();
}


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main().catch((e) => console.error('[app] boot failed:', e));
}

window.addEventListener('pagehide', () => { if (universe) universe.dispose(); });
