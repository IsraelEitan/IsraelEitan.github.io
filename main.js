/* ================================================================
   EITAN PROSHIZKI — main.js v2.0
   Interactions: dark mode, scroll reveal, counters, skill bars,
   typewriter, scroll progress, mobile menu, filter
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
    btn.addEventListener('click', () => {
      nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', nav.classList.contains('open'));
    });
    // Close on link click
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
    // Close on outside click
    document.addEventListener('click', e => {
      if (!btn.contains(e.target) && !nav.contains(e.target)) nav.classList.remove('open');
    });
  }

  /* ── Animated Counter ── */
  function animateCounter(el) {
    const target = el.getAttribute('data-target');
    const numTarget = parseFloat(target.replace(/[^0-9.]/g, ''));
    const suffix = target.replace(/[0-9.]/g, '');
    const duration = 1800;
    const step = 16;
    const steps = duration / step;
    const increment = numTarget / steps;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(curr