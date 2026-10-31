(function () {
  'use strict';

  // Number that receives the orders on WhatsApp (international format, no +)
  var WA_TO = '9647738293881';

  var TITLES = { project: 'مشروع تخرّج', research: 'بحث تخرّج', both: 'مشروع + بحث' };
  var DEPTS = ['هندسة الحاسوب', 'علوم الحاسوب', 'هندسة البرمجيات', 'نظم المعلومات', 'هندسة الاتصالات',
    'الذكاء الاصطناعي', 'الأمن السيبراني', 'إنترنت الأشياء (IoT)', 'الإلكترونيك والسيطرة', 'قسم آخر'];

  // Nothing is pre-selected, unless the visitor came from a specific service
  // link on the home page (order.html?type=project|research|both, ?defense=1).
  // Defence preparation is an optional add-on with its own price.
  var state = { step: 1, type: '', defense: false, dept: '', tried: false };
  try {
    var q = new URLSearchParams(window.location.search);
    if (TITLES.hasOwnProperty(q.get('type'))) state.type = q.get('type');
    if (q.get('defense') === '1') state.defense = true;
  } catch (err) { /* very old browser: start with nothing selected */ }

  var $ = function (id) { return document.getElementById(id); };
  var panels = document.querySelectorAll('.o-panel');
  var stepItems = document.querySelectorAll('#steps li');
  var CHECK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>';

  function toLatin(v) {
    var ar = '٠١٢٣٤٥٦٧٨٩', fa = '۰۱۲۳۴۵۶۷۸۹';
    return String(v || '').replace(/[٠-٩]/g, function (d) { return ar.indexOf(d); })
      .replace(/[۰-۹]/g, function (d) { return fa.indexOf(d); });
  }
  function phoneDigits() {
    var d = toLatin($('o-phone').value).replace(/\D/g, '');
    if (d.indexOf('964') === 0) d = d.slice(3);
    if (d.charAt(0) === '0') d = d.slice(1);
    return d;
  }
  function checks() {
    return {
      type: TITLES.hasOwnProperty(state.type),
      name: $('o-name').value.trim().length >= 3,
      phone: /^7\d{9}$/.test(phoneDigits()),
      uni: $('o-uni').value.trim().length >= 2,
      dept: !!state.dept
    };
  }

  function waLink() {
    var R = '‏', L = '‎';
    var d = phoneDigits();
    var date = $('o-date').value, dateFmt = 'غير محدد';
    if (date) { var p = date.split('-'); if (p.length === 3) dateFmt = L + p[2] + '/' + p[1] + '/' + p[0] + L; }
    var lines = [
      '*طلب جديد من موقع مشروعي*',
      '',
      '*نوع الطلب:* ' + (TITLES[state.type] || 'غير محدد'),
      '*إضافة التحضير للمناقشة:* ' + (state.defense ? 'نعم' : 'لا'),
      '*الاسم:* ' + $('o-name').value.trim(),
      '*رقم الواتساب:* ' + L + '0' + d.slice(0, 3) + ' ' + d.slice(3, 6) + ' ' + d.slice(6) + L,
      '*الجامعة:* ' + $('o-uni').value.trim(),
      '*القسم:* ' + state.dept,
      '*موعد المناقشة:* ' + dateFmt,
      '',
      '*' + (state.type === 'research' ? 'عنوان البحث' : 'فكرة المشروع') + ':*',
      $('o-idea').value.trim() || (state.type === 'research' ? 'نتفق عليه بالمحادثة' : 'نتفق عليها بالمحادثة')
    ].map(function (l) { return l ? R + l : l; });
    return 'https://wa.me/' + WA_TO + '?text=' + encodeURIComponent(lines.join('\n'));
  }

  // Shows or hides a field's error. The error spans are role="alert", so they
  // are announced when they appear; the control only points at its error
  // while it is shown, so screen readers don't read a hidden message.
  function setErr(field, bad, box, ctrl) {
    $('err-' + field).hidden = !bad;
    if (box) box.classList.toggle('o-bad', bad);
    ctrl = ctrl || box;
    if (!ctrl) return;
    if (bad) { ctrl.setAttribute('aria-describedby', 'err-' + field); ctrl.setAttribute('aria-invalid', 'true'); }
    else { ctrl.removeAttribute('aria-describedby'); ctrl.removeAttribute('aria-invalid'); }
  }

  function render() {
    var c = checks(), show = state.tried;
    panels.forEach(function (p) { p.hidden = Number(p.dataset.step) !== state.step; });
    stepItems.forEach(function (li) {
      var n = Number(li.dataset.n), done = state.step > n, active = state.step === n;
      li.classList.toggle('done', done);
      li.classList.toggle('active', active);
      if (active) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      li.querySelector('.o-dot').innerHTML = done ? CHECK : '<span>' + n + '</span>';
    });
    document.querySelectorAll('#types .o-opt').forEach(function (b) {
      var on = b.dataset.type === state.type;
      b.classList.toggle('on', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    $('defense').classList.toggle('on', state.defense);
    $('defense').setAttribute('aria-checked', state.defense ? 'true' : 'false');

    setErr('type', show && !c.type, null, $('types'));
    setErr('name', show && !c.name, $('o-name'));
    setErr('phone', show && !c.phone, $('tel'), $('o-phone'));
    $('hint-phone').hidden = show && !c.phone;
    setErr('uni', show && !c.uni, $('o-uni'));
    setErr('dept', show && !c.dept, $('dept-btn'));

    $('dept-val').textContent = state.dept || 'اختار القسم';
    $('dept-val').className = state.dept ? '' : 'o-ph';
    $('idea-lbl').textContent = state.type === 'research' ? 'عنوان البحث' : 'فكرة المشروع';
    $('o-idea').placeholder = state.type === 'research' ? 'العنوان المقترح أو المجال…' : 'اكتب الفكرة باختصار…';

    var link = waLink();
    $('send').href = link;
    $('resend').href = link;
  }

  function go(step) {
    state.step = step; state.tried = false; closeMenu(); render();
    var first = document.querySelector('.o-panel[data-step="' + step + '"] input, .o-panel[data-step="' + step + '"] button');
    if (first && step > 1 && step < 4) first.focus({ preventScroll: true });
  }

  // step 1
  document.querySelectorAll('#types .o-opt').forEach(function (b) {
    b.addEventListener('click', function () { state.type = b.dataset.type; render(); });
  });
  $('defense').addEventListener('click', function () { state.defense = !state.defense; render(); });

  // navigation
  document.querySelectorAll('[data-next]').forEach(function (b) {
    b.addEventListener('click', function () {
      var c = checks();
      if (state.step === 1 && !c.type) { state.tried = true; render(); document.querySelector('#types .o-opt').focus(); return; }
      if (state.step === 2 && !(c.name && c.phone)) { state.tried = true; render(); (c.name ? $('o-phone') : $('o-name')).focus(); return; }
      go(state.step + 1);
    });
  });
  document.querySelectorAll('[data-back]').forEach(function (b) {
    b.addEventListener('click', function () { go(Math.max(1, state.step - 1)); });
  });
  $('edit').addEventListener('click', function () { go(1); });

  // Keep a copy of the order on Netlify Forms, so it is not lost if the
  // student never presses send inside WhatsApp. Fire-and-forget: WhatsApp
  // opens either way.
  var savedKey = '';
  function saveOrder() {
    var d = phoneDigits();
    var data = {
      'form-name': 'order',
      'subject': 'طلب جديد من مشروعي: ' + $('o-name').value.trim(),
      'name': $('o-name').value.trim(),
      'phone': '0' + d,
      'type': TITLES[state.type] || 'غير محدد',
      'defense': state.defense ? 'نعم' : 'لا',
      'university': $('o-uni').value.trim(),
      'department': state.dept,
      'defense_date': $('o-date').value || 'غير محدد',
      'idea': $('o-idea').value.trim() || 'غير محدد',
      'bot-field': ''
    };
    var body = new URLSearchParams(data).toString();
    if (body === savedKey) return; // same order re-opened: don't duplicate
    savedKey = body;
    try {
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body,
        keepalive: true
      }).catch(function () {});
    } catch (err) { /* offline or blocked: WhatsApp still opens */ }
  }

  // send
  $('send').addEventListener('click', function (e) {
    var c = checks();
    if (!c.type) { e.preventDefault(); go(1); state.tried = true; render(); document.querySelector('#types .o-opt').focus(); return; }
    if (!(c.uni && c.dept)) { e.preventDefault(); state.tried = true; render(); (c.uni ? $('dept-btn') : $('o-uni')).focus(); return; }
    $('send').href = waLink();
    saveOrder();
    setTimeout(function () { go(4); }, 50);
  });

  // no defense dates in the past
  (function () {
    var t = new Date(), m = String(t.getMonth() + 1).padStart(2, '0'), dd = String(t.getDate()).padStart(2, '0');
    $('o-date').min = t.getFullYear() + '-' + m + '-' + dd;
  })();

  // inputs
  $('o-phone').addEventListener('input', function () {
    var v = toLatin(this.value).replace(/[^\d+ ]/g, '').slice(0, 14);
    if (v !== this.value) this.value = v;
    render();
  });
  ['o-name', 'o-uni', 'o-date', 'o-idea'].forEach(function (id) { $(id).addEventListener('input', render); });

  // department dropdown
  var menu = $('dept-menu'), btn = $('dept-btn');
  DEPTS.forEach(function (d) {
    var li = document.createElement('li');
    var o = document.createElement('button');
    o.type = 'button'; o.className = 'o-o'; o.setAttribute('role', 'option'); o.dataset.value = d;
    o.innerHTML = '<span></span>' + CHECK.replace('width="16" height="16"', 'width="18" height="18" class="o-tick"');
    o.firstChild.textContent = d;
    o.addEventListener('click', function () { state.dept = d; closeMenu(); render(); btn.focus(); });
    li.appendChild(o); menu.appendChild(li);
  });
  function openMenu() {
    menu.hidden = false; btn.classList.add('open'); btn.setAttribute('aria-expanded', 'true');
    menu.querySelectorAll('.o-o').forEach(function (o) {
      var on = o.dataset.value === state.dept;
      o.classList.toggle('on', on); o.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    (menu.querySelector('.o-o.on') || menu.querySelector('.o-o')).focus();
  }
  function closeMenu() { menu.hidden = true; btn.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
  btn.addEventListener('click', function () { if (menu.hidden) openMenu(); else closeMenu(); });
  document.addEventListener('click', function (e) { if (!$('dept-wrap').contains(e.target)) closeMenu(); });
  menu.addEventListener('keydown', function (e) {
    var items = Array.prototype.slice.call(menu.querySelectorAll('.o-o'));
    var i = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); items[Math.min(items.length - 1, i + 1)].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); items[Math.max(0, i - 1)].focus(); }
    else if (e.key === 'Escape') { closeMenu(); btn.focus(); }
  });

  // translucent nav on scroll (the order page scrolls inside <main> on short screens)
  var nav = $('nav'), main = document.querySelector('.o-main');
  main.addEventListener('scroll', function () { nav.classList.toggle('scrolled', main.scrollTop > 8); }, { passive: true });

  render();
})();
