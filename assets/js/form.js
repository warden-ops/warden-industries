// Warden Industries: quote request form. Sends JSON to the configured endpoint, never navigates away.
(function () {
  var f = document.getElementById('wform');
  if (!f) return;
  var M = JSON.parse(f.getAttribute('data-msgs') || '{}');
  var st = f.querySelector('.fstatus'), btn = f.querySelector('button[type=submit]'), bt = btn.querySelector('.bt');
  var okbox = f.querySelector('.okbox');
  var phoneRe = /^\+?[0-9 ().\-]{7,}$/;
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function setErr(el, msg) {
    var box = el.closest('.fld'); if (!box) return;
    var e = box.querySelector('.ferr');
    if (msg) { box.classList.add('bad'); if (!e) { e = document.createElement('span'); e.className = 'ferr'; e.setAttribute('role', 'alert'); box.appendChild(e); } e.textContent = msg; el.setAttribute('aria-invalid', 'true'); }
    else { box.classList.remove('bad'); if (e) e.remove(); el.removeAttribute('aria-invalid'); }
  }
  function check(el) {
    var v = (el.type === 'checkbox') ? el.checked : el.value.trim();
    if (el.required && !v) { setErr(el, el.type === 'checkbox' ? M.need_consent : M.req); return false; }
    if (el.type === 'email' && v && !emailRe.test(v)) { setErr(el, M.bad_email); return false; }
    if (el.type === 'tel' && v && (!phoneRe.test(v) || v.replace(/\D/g, '').length < 10)) { setErr(el, M.bad_phone); return false; }
    setErr(el, ''); return true;
  }
  f.querySelectorAll('input,select,textarea').forEach(function (el) {
    if (el.name === '_honey') return;
    el.addEventListener('blur', function () { if (el.value || el.type === 'checkbox') check(el); });
    el.addEventListener('input', function () { if (el.closest('.fld.bad')) check(el); });
    el.addEventListener('change', function () { if (el.closest('.fld.bad')) check(el); });
  });
  var t0 = Date.now();
  f.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var ok = true, first = null;
    f.querySelectorAll('input[name],select,textarea').forEach(function (el) {
      if (el.type === 'hidden' || el.name === '_honey') return;
      if (!check(el)) { ok = false; if (!first) first = el; }
    });
    if (!ok) { st.className = 'fstatus'; st.textContent = ''; first.focus(); return; }
    var hp = f.querySelector('[name=_honey]');
    // Bots fill the hidden field or submit in under two seconds: pretend success, send nothing.
    if ((hp && hp.value) || Date.now() - t0 < 2000) { done(); return; }
    var data = {};
    new FormData(f).forEach(function (v, k) { data[k] = v; });
    btn.disabled = true; bt.textContent = M.sending; st.className = 'fstatus'; st.textContent = '';
    fetch(f.getAttribute('data-endpoint'), { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || String(j.success) === 'false') throw new Error('send'); }); })
      .then(done)
      .catch(function () { btn.disabled = false; bt.textContent = M.send; st.className = 'fstatus err'; st.textContent = M.err; });
  });
  function done() {
    f.classList.add('sent'); st.textContent = ''; btn.disabled = false; bt.textContent = M.send;
    okbox.focus();
  }
})();
