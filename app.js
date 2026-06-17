/* Fractalogie — site interactions + signature animations (vanilla, mobile-first).
   All heavy canvas work: DPR-capped, paused off-screen, disabled for
   prefers-reduced-motion, and tuned down on coarse/small screens. */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = matchMedia('(pointer: coarse)').matches;
  var small = innerWidth < 700;
  var DPR = Math.min(devicePixelRatio || 1, 2);
  var TAU = Math.PI * 2;

  /* Mount a canvas anim: handles sizing + only runs while on-screen. */
  function mountCanvas(canvas, init) {
    if (!canvas) return;
    var ctx = canvas.getContext('2d'), W = 0, H = 0, raf = 0, vis = false, api;
    function size() {
      var r = canvas.getBoundingClientRect();
      W = canvas.width = Math.max(1, Math.round(r.width * DPR));
      H = canvas.height = Math.max(1, Math.round(r.height * DPR));
      if (api && api.resize) api.resize(W, H);
    }
    api = init(ctx, function () { return W; }, function () { return H; });
    addEventListener('resize', size); size();
    if (reduce) { if (api.still) api.still(W, H); return; } // reduced-motion → static but VISIBLE (no blank, no loop)
    function loop() { if (!vis) return; api.frame(W, H); raf = requestAnimationFrame(loop); }
    var io = new IntersectionObserver(function (e) {
      vis = e[0].isIntersecting;
      if (vis && !raf) loop(); else { cancelAnimationFrame(raf); raf = 0; }
    }, { rootMargin: '120px' });
    io.observe(canvas);
    if (api.still) api.still(W, H);
  }

  /* ── 1 · STRANGE ATTRACTOR ──────────────────────────────────────────────
     "Every loop traces to one attractor." A morphing de Jong attractor. */
  (function () {
    var c = document.getElementById('attractor'); if (!c) return;
    mountCanvas(c, function (ctx, gw, gh) {
      var a = -2, b = -2, cc = -1.2, d = 2, t = 0, x = 0, y = 0;
      var N = small ? 1600 : 3800;
      function draw(W, H, fade) {
        ctx.fillStyle = 'rgba(4,5,12,' + fade + ')'; ctx.fillRect(0, 0, W, H);
        t += 0.0009;
        a = -2 + Math.sin(t) * 0.32; b = -2 + Math.cos(t * 0.7) * 0.32;
        cc = -1.2 + Math.sin(t * 1.3) * 0.22; d = 2 + Math.cos(t * 0.9) * 0.22;
        var cx = W / 2, cy = H / 2, s = Math.min(W, H) * 0.23;
        for (var i = 0; i < N; i++) {
          var nx = Math.sin(a * y) - Math.cos(b * x);
          var ny = Math.sin(cc * x) - Math.cos(d * y);
          x = nx; y = ny;
          var px = cx + x * s, py = cy + y * s;
          var g = (x + 2) / 4; // 0..1 → gold→violet
          ctx.fillStyle = 'rgba(' + Math.round(231 - g * 63) + ',' + Math.round(183 - g * 60) + ',' + Math.round(101 + g * 154) + ',0.72)';
          ctx.fillRect(px, py, 1.4 * DPR, 1.4 * DPR);
        }
      }
      return {
        frame: function (W, H) { draw(W, H, reduce ? 1 : 0.055); },
        still: function (W, H) { ctx.fillStyle = '#04050c'; ctx.fillRect(0, 0, W, H); for (var k = 0; k < 60; k++) draw(W, H, 0.0); }
      };
    });
  })();

  /* ── 3 · FRACTAL TREE (grows on load) ───────────────────────────────────
     The brand mark, drawn branch by branch then breathing. */
  (function () {
    var c = document.getElementById('tree'); if (!c) return;
    mountCanvas(c, function (ctx, gw, gh) {
      var grow = 0, breath = 0;
      function branch(x, y, len, ang, depth, max, gp) {
        if (depth > max || len < 2) return;
        var sway = Math.sin(breath + depth) * 0.04 * (depth / max);
        var x2 = x + Math.cos(ang + sway) * len, y2 = y + Math.sin(ang + sway) * len;
        var lit = depth <= gp; if (!lit) return;
        ctx.strokeStyle = 'rgba(231,183,101,' + (0.85 - depth / max * 0.55) + ')';
        ctx.lineWidth = Math.max(DPR, (max - depth) * 0.6 * DPR);
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
        branch(x2, y2, len * 0.74, ang - 0.42, depth + 1, max, gp);
        branch(x2, y2, len * 0.74, ang + 0.42, depth + 1, max, gp);
      }
      function paint(W, H) {
        ctx.clearRect(0, 0, W, H);
        var max = 9, gp = reduce ? max : grow * max;
        branch(W / 2, H * 0.96, H * 0.2, -Math.PI / 2, 0, max, gp);
        // top node glow
        ctx.fillStyle = 'rgba(240,207,155,0.9)'; ctx.beginPath();
        ctx.arc(W / 2, H * 0.96 - H * 0.2 * 0.0, 2 * DPR, 0, TAU); ctx.fill();
      }
      return {
        frame: function (W, H) { if (grow < 1) grow += 0.012; breath += 0.02; paint(W, H); },
        still: function (W, H) { grow = 1; paint(W, H); }
      };
    });
  })();

  /* ── 2 · FRACTAL ZOOM (scroll-driven infinite zoom) ─────────────────────
     One structure, every scale. Concentric fractal rings scale with scroll. */
  (function () {
    var sec = document.querySelector('.fzoom'); var c = document.getElementById('fzoom'); if (!sec || !c) return;
    var prog = 0;
    addEventListener('scroll', function () {
      var r = sec.getBoundingClientRect();
      prog = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
    }, { passive: true });
    mountCanvas(c, function (ctx) {
      function ring(W, H, scale) {
        var cx = W / 2, cy = H / 2, base = Math.min(W, H) * 0.5;
        for (var k = 0; k < 6; k++) {
          var s = base * scale * Math.pow(0.5, k);
          if (s < 4 || s > Math.max(W, H)) continue;
          var alpha = Math.min(1, s / base) * 0.72;
          ctx.strokeStyle = k % 2 ? 'rgba(168,123,255,' + alpha + ')' : 'rgba(231,183,101,' + alpha + ')';
          ctx.lineWidth = 1.5 * DPR;
          // hexagonal fractal node ring
          ctx.beginPath();
          for (var a = 0; a <= 6; a++) { var ang = a / 6 * TAU; var px = cx + Math.cos(ang) * s, py = cy + Math.sin(ang) * s; a ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
          ctx.stroke();
          // radial spokes
          for (var b = 0; b < 6; b++) { var an = b / 6 * TAU; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(an) * s, cy + Math.sin(an) * s); ctx.globalAlpha = alpha * 0.5; ctx.stroke(); ctx.globalAlpha = 1; }
        }
      }
      function paint(W, H) { ctx.clearRect(0, 0, W, H); var z = 1 + (prog % 1) * 1; ring(W, H, z); ring(W, H, z * 0.5); }
      return { frame: function (W, H) { paint(W, H); }, still: function (W, H) { prog = 0.3; paint(W, H); } };
    });
  })();

  /* ── 4 · DECODE HEADLINES ───────────────────────────────────────────────
     Headlines materialise from glyph-noise (the revelation emerging). */
  (function () {
    if (reduce) return;
    var glyphs = '◆✦⟳∞⌖⟡ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    function decode(el) {
      var target = el.getAttribute('data-text'); var len = target.length, f = 0;
      var id = setInterval(function () {
        var out = '', done = Math.floor(f / 2);
        for (var i = 0; i < len; i++) {
          var ch = target[i];
          out += (ch === ' ' || i < done) ? ch : glyphs[(Math.random() * glyphs.length) | 0];
        }
        el.textContent = out; f++;
        if (done >= len) { clearInterval(id); el.textContent = target; }
      }, 28);
    }
    var els = document.querySelectorAll('[data-decode]');
    var io = new IntersectionObserver(function (e) {
      e.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target; if (el.dataset.done) return; el.dataset.done = '1';
        el.setAttribute('data-text', el.textContent); decode(el); io.unobserve(el);
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ── 5 · THE REVERSAL (text swap loop) ──────────────────────────────────*/
  (function () {
    var el = document.querySelector('.reversal'); if (!el) return;
    var a = el.querySelector('.rev-a'), b = el.querySelector('.rev-b'); if (!a || !b || reduce) return;
    var on = false;
    var io = new IntersectionObserver(function (e) { on = e[0].isIntersecting; }, { threshold: 0.5 });
    io.observe(el); var flip = false;
    setInterval(function () { if (!on) return; flip = !flip; a.classList.toggle('out', flip); b.classList.toggle('in', flip); }, 3400);
  })();

  /* ── 6 · CONSTELLATION CURSOR (desktop) ─────────────────────────────────*/
  (function () {
    if (reduce || coarse) return;
    var c = document.getElementById('constellation'); if (!c) return;
    var ctx = c.getContext('2d'), W, H, mx = -999, my = -999, pts = [];
    function size() {
      W = c.width = innerWidth * DPR; H = c.height = innerHeight * DPR;
      c.style.width = innerWidth + 'px'; c.style.height = innerHeight + 'px';
      pts = []; var n = Math.min(54, (innerWidth * innerHeight) / 34000);
      for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.12 * DPR, vy: (Math.random() - 0.5) * 0.12 * DPR });
    }
    addEventListener('resize', size); size();
    // intensity rises with mouse movement, decays when the cursor is still →
    // the constellation only appears while you're actively playing with it.
    var intensity = 0, lx = 0, ly = 0;
    addEventListener('mousemove', function (e) {
      var nx = e.clientX * DPR, ny = e.clientY * DPR;
      intensity = Math.min(1, intensity + Math.hypot(nx - lx, ny - ly) / 420);
      lx = nx; ly = ny; mx = nx; my = ny;
    });
    addEventListener('mouseleave', function () { intensity = 0; mx = my = -9999; });
    (function loop() {
      ctx.clearRect(0, 0, W, H);
      intensity *= 0.9; // fade out when the mouse stops (~0.4s)
      var R = 134 * DPR, draw = intensity > 0.02;
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i]; p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
        if (!draw) continue;
        var dx = p.x - mx, dy = p.y - my, dist = Math.hypot(dx, dy);
        if (dist < R) {
          var al = (1 - dist / R) * 0.55 * intensity;
          ctx.strokeStyle = 'rgba(231,183,101,' + al + ')'; ctx.lineWidth = DPR;
          ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(p.x, p.y); ctx.stroke();
          ctx.fillStyle = 'rgba(240,207,155,' + (al + 0.16 * intensity) + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, 1.4 * DPR, 0, TAU); ctx.fill();
        }
      }
      requestAnimationFrame(loop);
    })();
  })();

  /* ── Store badges: tap → "not available yet" toast (no dead button, no email) */
  (function () {
    var badges = document.querySelectorAll('.store.dim'); if (!badges.length) return;
    var toast;
    function show(msg) {
      if (!toast) { toast = document.createElement('div'); toast.className = 'toast'; document.body.appendChild(toast); }
      toast.textContent = msg; toast.classList.add('on');
      clearTimeout(show._t); show._t = setTimeout(function () { toast.classList.remove('on'); }, 2600);
    }
    badges.forEach(function (b) {
      b.setAttribute('role', 'button'); b.setAttribute('tabindex', '0');
      var store = (b.querySelector('b') && b.querySelector('b').textContent) || 'the stores';
      var act = function () { show('Not available yet — Fractalogie is coming soon to ' + store + '.'); };
      b.addEventListener('click', act);
      b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
    });
  })();

  /* ── Base interactions ──────────────────────────────────────────────────*/
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else reveals.forEach(function (el) { el.classList.add('in'); });

  var toggle = document.querySelector('.nav-toggle'), links = document.querySelector('.nav-links');
  if (toggle && links) { toggle.addEventListener('click', function () { links.classList.toggle('open'); }); links.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { links.classList.remove('open'); }); }); }

  var scSteps = document.querySelectorAll('.sc-step'), scShots = document.querySelectorAll('.showcase-shot');
  if (scSteps.length && scShots.length && 'IntersectionObserver' in window) {
    var setA = function (i) { scSteps.forEach(function (s, j) { s.classList.toggle('on', j === i); }); scShots.forEach(function (s, j) { s.classList.toggle('on', j === i); }); };
    var sio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) setA(+e.target.getAttribute('data-i')); }); }, { rootMargin: '-45% 0px -45% 0px' });
    scSteps.forEach(function (s) { sio.observe(s); });
  }

  var device = document.querySelector('.hero-device .device');
  if (device && !reduce && !coarse) {
    var wrapEl = document.querySelector('.hero-device');
    wrapEl.addEventListener('mousemove', function (e) { var r = wrapEl.getBoundingClientRect(); var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; device.style.transform = 'perspective(1000px) rotateY(' + (x * 8).toFixed(2) + 'deg) rotateX(' + (-y * 8).toFixed(2) + 'deg) translateY(-4px)'; });
    wrapEl.addEventListener('mouseleave', function () { device.style.transform = ''; });
  }

  var stats = document.querySelectorAll('[data-count]');
  if (stats.length && !reduce) {
    var cio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (!e.isIntersecting) return; var el = e.target, target = parseFloat(el.getAttribute('data-count')), t0 = null; requestAnimationFrame(function step(ts) { if (!t0) t0 = ts; var p = Math.min((ts - t0) / 1400, 1), eased = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(target * eased); if (p < 1) requestAnimationFrame(step); }); cio.unobserve(el); }); }, { threshold: 0.5 });
    stats.forEach(function (s) { cio.observe(s); });
  }

  /* Starfield (kept). */
  var canvas = document.getElementById('stars');
  if (canvas) {
    var sctx = canvas.getContext('2d'), st = [], SW, SH;
    function sresize() { SW = canvas.width = innerWidth * DPR; SH = canvas.height = innerHeight * DPR; canvas.style.width = innerWidth + 'px'; canvas.style.height = innerHeight + 'px'; var n = Math.min(190, (innerWidth * innerHeight) / (small ? 6500 : 11000)); st = []; for (var i = 0; i < n; i++) st.push({ x: Math.random() * SW, y: Math.random() * SH, r: (Math.random() * 1.4 + 0.5) * DPR, a: Math.random() * 0.55 + 0.3, tw: Math.random() * 0.02 + 0.004, p: Math.random() * 6.28, h: Math.random() > 0.72 ? '231,183,101' : '245,242,234' }); }
    function paintStars() { sctx.clearRect(0, 0, SW, SH); for (var i = 0; i < st.length; i++) { var s = st[i]; var al = reduce ? s.a : s.a + Math.sin(s.p += s.tw) * 0.12; sctx.beginPath(); sctx.arc(s.x, s.y, s.r, 0, TAU); sctx.fillStyle = 'rgba(' + s.h + ',' + Math.max(0, al) + ')'; sctx.fill(); } }
    addEventListener('resize', sresize); sresize();
    if (reduce) paintStars(); else (function stick() { paintStars(); requestAnimationFrame(stick); })();
  }

  var y = document.querySelector('[data-year]'); if (y) y.textContent = new Date().getFullYear();
})();
