/* Fractalogie — site interactions (vanilla, no framework, mobile-first). */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer: coarse)').matches;

  /* ── Scroll reveal ──────────────────────────────────────────────────── */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else { reveals.forEach(function (el) { el.classList.add('in'); }); }

  /* ── Mobile nav ─────────────────────────────────────────────────────── */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () { links.classList.toggle('open'); });
    links.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { links.classList.remove('open'); }); });
  }

  /* ── Sticky showcase — scroll-driven screen switching ───────────────── */
  var scSteps = document.querySelectorAll('.sc-step');
  var scShots = document.querySelectorAll('.showcase-shot');
  if (scSteps.length && scShots.length && 'IntersectionObserver' in window) {
    var setActive = function (i) {
      scSteps.forEach(function (s, j) { s.classList.toggle('on', j === i); });
      scShots.forEach(function (s, j) { s.classList.toggle('on', j === i); });
    };
    var scIo = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) setActive(+e.target.getAttribute('data-i'));
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    scSteps.forEach(function (s) { scIo.observe(s); });
  }

  /* ── Hero device parallax + tilt (pointer devices only) ─────────────── */
  var device = document.querySelector('.hero-device .device');
  if (device && !reduce && !coarse) {
    var wrapEl = document.querySelector('.hero-device');
    wrapEl.addEventListener('mousemove', function (e) {
      var r = wrapEl.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      device.style.transform = 'perspective(1000px) rotateY(' + (x * 8).toFixed(2) + 'deg) rotateX(' + (-y * 8).toFixed(2) + 'deg) translateY(-4px)';
    });
    wrapEl.addEventListener('mouseleave', function () { device.style.transform = ''; });
  }

  /* ── Count-up stats ─────────────────────────────────────────────────── */
  var stats = document.querySelectorAll('[data-count]');
  if (stats.length && 'IntersectionObserver' in window && !reduce) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, target = parseFloat(el.getAttribute('data-count')), suffix = el.getAttribute('data-suffix') || '';
        var dur = 1400, t0 = null;
        var step = function (ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (target % 1 ? (target * eased).toFixed(1) : Math.round(target * eased)) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    stats.forEach(function (s) { cio.observe(s); });
  }

  /* ── Starfield ──────────────────────────────────────────────────────── */
  var canvas = document.getElementById('stars');
  if (canvas && !reduce) {
    var ctx = canvas.getContext('2d'), stars = [], W, H, DPR = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      W = canvas.width = innerWidth * DPR; H = canvas.height = innerHeight * DPR;
      canvas.style.width = innerWidth + 'px'; canvas.style.height = innerHeight + 'px';
      var n = Math.min(140, Math.floor((innerWidth * innerHeight) / 13000)); stars = [];
      for (var i = 0; i < n; i++) stars.push({ x: Math.random() * W, y: Math.random() * H, r: (Math.random() * 1.3 + 0.3) * DPR, a: Math.random() * 0.6 + 0.15, tw: Math.random() * 0.02 + 0.004, p: Math.random() * 6.28, h: Math.random() > 0.72 ? '231,183,101' : '245,242,234' });
    }
    function tick() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < stars.length; i++) { var s = stars[i]; s.p += s.tw; var a = s.a + Math.sin(s.p) * 0.12; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.2832); ctx.fillStyle = 'rgba(' + s.h + ',' + Math.max(0, a) + ')'; ctx.fill(); }
      requestAnimationFrame(tick);
    }
    addEventListener('resize', resize); resize(); tick();
  }

  /* ── Footer year ────────────────────────────────────────────────────── */
  var y = document.querySelector('[data-year]'); if (y) y.textContent = new Date().getFullYear();
})();
