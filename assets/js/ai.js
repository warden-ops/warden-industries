// Warden Industries, private AI pages only: header state, mobile menu, scroll reveals, counters, marquee.
(function () {
  var d = document, rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hdr = d.querySelector('.ahdr');
  var onScroll = function () { if (hdr) hdr.classList.toggle('scrolled', window.scrollY > 24); };
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  var b = d.querySelector('.aburger'), m = d.getElementById('amnav');
  if (b && m) b.addEventListener('click', function () {
    var open = b.getAttribute('aria-expanded') === 'true';
    b.setAttribute('aria-expanded', String(!open)); m.hidden = open;
    b.querySelector('.sr').textContent = open ? b.dataset.open : b.dataset.close;
  });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && b && m && !m.hidden) { b.click(); b.focus(); } });
  // marquee: duplicate the track once so the loop is seamless
  d.querySelectorAll('.marq-t').forEach(function (t) { t.innerHTML += t.innerHTML; t.lastElementChild && Array.prototype.slice.call(t.children, t.children.length / 2).forEach(function (c) { c.setAttribute('aria-hidden', 'true'); }); });
  var lang = d.documentElement.lang || 'fr-CA';
  var fmt = function (n) { return Math.round(n).toLocaleString(lang).replace(/\u202f/g, '\u00a0'); };
  var count = function (el) {
    var to = parseFloat(el.dataset.count), t0 = null, dur = 1400;
    if (rm) { el.textContent = fmt(to); return; }
    var step = function (ts) { if (!t0) t0 = ts; var p = Math.min(1, (ts - t0) / dur); el.textContent = fmt(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  var els = d.querySelectorAll('.rv, .msteps, .guide-card, [data-count]');
  if (rm || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); if (e.dataset.count) count(e); }); return; }
  d.querySelectorAll('[data-count]').forEach(function (e) { e.textContent = fmt(0); });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); if (x.target.dataset.count) count(x.target); io.unobserve(x.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  els.forEach(function (e) { io.observe(e); });
})();
