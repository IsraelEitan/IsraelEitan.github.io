/* ================================================================
   EITAN PROSHIZKI — main.js v2.0
   ================================================================ */

(function () {
  'use strict';

  /* ── Dark Mode ── */
  const THEME_KEY = 'ep-theme';
  const root = document.documentElement;
  const savedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.setAttribute('data-theme', savedTheme || (prefersDark ? 'dark' : 'light'));

  function toggleTheme() {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);
    updateThemeBtn();
  }
  function updateThemeBtn() {
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = root.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
  }

  /* ── Scroll Progress Bar ── */
  function initScrollProgress() {
    const bar = document.querySelector('.scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      bar.style.width = Math.min(scrolled, 100) + '%';
    }, { passive: true });
  }

  /* ── Active Nav Link ── */
  function setActiveNav() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(a => {
      if (a.getAttribute('href') === page || (page === '' && a.getAttribute('href') === 'index.html')) {
        a.classList.add('active');
      }
    });
  }

  /* ── Mobile Menu ── */
  function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const nav = document.getElementById('mobile-nav');
    if (!btn || !nav) return;
    function setMenuOpen(open) {
      nav.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    btn.addEventListener('click', () => {
      setMenuOpen(!nav.classList.contains('open'));
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenuOpen(false)));
    document.addEventListener('click', e => {
      if (!btn.contains(e.target) && !nav.contains(e.target)) setMenuOpen(false);
    });
  }

  /* ── Animated Counter ── */
  function parseCounterTarget(target) {
    const raw = target.trim();
    const numeric = parseFloat(raw.replace(/[^0-9.]/g, ''));
    const multiplier = raw.toUpperCase().includes('M') ? 1000000 : raw.toUpperCase().includes('K') ? 1000 : 1;
    const compactSuffix = raw.match(/[KM]\+?$/i)?.[0] || '';
    const suffix = compactSuffix || raw.replace(/[0-9.,KM]/gi, '');
    return {
      displayTarget: Number.isFinite(numeric) ? numeric : 0,
      animationTarget: Number.isFinite(numeric) ? numeric * multiplier : 0,
      suffix
    };
  }

  function formatCounterValue(value, parsed) {
    if (parsed.suffix.toUpperCase().startsWith('M')) {
      const compact = value >= parsed.animationTarget ? parsed.displayTarget : value / 1000000;
      return (compact >= 10 || value >= parsed.animationTarget ? Math.round(compact) : compact.toFixed(1)) + parsed.suffix;
    }
    if (parsed.suffix.toUpperCase().startsWith('K')) {
      const compact = value >= parsed.animationTarget ? parsed.displayTarget : value / 1000;
      return (compact >= 10 || value >= parsed.animationTarget ? Math.round(compact) : compact.toFixed(1)) + parsed.suffix;
    }
    return (Number.isInteger(parsed.displayTarget) ? Math.round(value) : value.toFixed(1)) + parsed.suffix;
  }

  function animateCounter(el) {
    const parsed = parseCounterTarget(el.getAttribute('data-target') || '0');
    const duration = 1800;
    const step = 16;
    const steps = duration / step;
    const increment = parsed.animationTarget / steps;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + increment, parsed.animationTarget);
      el.textContent = formatCounterValue(current, parsed);
      if (current >= parsed.animationTarget) clearInterval(timer);
    }, step);
  }

  /* ── Typewriter ── */
  function initTypewriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;
    const phrases = el.getAttribute('data-phrases').split('|');
    let pi = 0, ci = 0, deleting = false;
    function tick() {
      const phrase = phrases[pi];
      el.textContent = deleting ? phrase.slice(0, ci--) : phrase.slice(0, ci++);
      if (!deleting && ci > phrase.length) { deleting = true; setTimeout(tick, 1600); return; }
      if (deleting && ci < 0) { deleting = false; pi = (pi + 1) % phrases.length; ci = 0; setTimeout(tick, 400); return; }
      setTimeout(tick, deleting ? 40 : 70);
    }
    tick();
  }

  /* ── Current Year ── */
  function setYear() {
    document.querySelectorAll('.current-year').forEach(el => {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ── Years Experience (dynamic) ── */
  function setYearsExp() {
    const els = document.querySelectorAll('.years-exp');
    const years = new Date().getFullYear() - 2014;
    els.forEach(el => { el.textContent = years + '+'; });
  }

  /* ── IntersectionObserver for counters and reveals ── */
  function initObservers() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (el.classList.contains('count-up')) {
          animateCounter(el);
        }
        if (el.classList.contains('skill-bar-fill')) {
          el.style.width = el.getAttribute('data-w') || el.style.width;
        }
        if (el.classList.contains('reveal')) {
          el.classList.add('revealed');
        }
        io.unobserve(el);
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.count-up, .skill-bar-fill, .reveal').forEach(el => io.observe(el));
  }

  /* ── Skill Bars (resume page) ── */
  function initSkillBars() {
    document.querySelectorAll('.skill-bar-fill').forEach(el => {
      const w = el.style.width;
      el.setAttribute('data-w', w);
      el.style.width = '0';
    });
  }

  /* ── Project Filter ── */
  function initFilter() {
    const btns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card[data-cat]');
    if (!btns.length) return;
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.getAttribute('data-filter');
        cards.forEach(card => {
          card.style.display = (cat === 'all' || card.getAttribute('data-cat') === cat) ? '' : 'none';
        });
      });
    });
  }

  /* ── Init on DOMContentLoaded ── */
  document.addEventListener('DOMContentLoaded', () => {
    updateThemeBtn();
    setActiveNav();
    setYear();
    setYearsExp();
    initScrollProgress();
    initMobileMenu();
    initTypewriter();
    initSkillBars();
    initObservers();
    initFilter();

    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
  });

})();
