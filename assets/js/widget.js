/**
 * Віджет «Вартість участі в кемпі» — Vanilla JS.
 * Формула: (ціна програми + тренер + меню + проживання) × тижні − знижка + діагностика.
 * Код ізольовано в IIFE: глобальних змінних і функцій немає.
 */
(function () {
  'use strict';

  // ---------- Бізнес-правила (грн) ----------
  const PROGRAMS = {
    loss:   { label: 'Зниження ваги',   weekly: 4200 },
    muscle: { label: 'Набір м’язів',    weekly: 4800 },
    tone:   { label: 'Підтримка форми', weekly: 3600 },
  };
  const TRAINER_WEEKLY = 1800;   // індивідуальний тренер
  const MENU_WEEKLY = 900;       // індивідуальне меню
  const LODGING_WEEKLY = 2500;   // проживання на базі
  const DIAGNOSTICS_FEE = 1000;  // разова вступна діагностика
  const MIN_WEEKS = 1;
  const MAX_WEEKS = 12;

  // ---------- Пошук елементів (Fail-Safe: без падіння, якщо чогось немає) ----------
  const ids = [
    'pc-form', 'pc-weeks', 'pc-weeks-error', 'pc-program', 'pc-program-error',
    'pc-menu', 'pc-lodging', 'pc-total', 'pc-summary',
    'pc-base', 'pc-extras', 'pc-discount', 'pc-fee',
  ];
  const el = {};
  const missing = [];
  ids.forEach((id) => {
    el[id] = document.getElementById(id);
    if (!el[id]) missing.push(id);
  });
  const formatInputs = document.querySelectorAll('input[name="pc-format"]');
  if (missing.length || formatInputs.length === 0) {
    console.warn('[widget] Віджет не запущено, відсутні елементи:', missing.join(', ') || 'pc-format');
    return;
  }

  // ---------- Допоміжні функції ----------
  function money(value) {
    return Number(value).toLocaleString('uk-UA') + ' грн';
  }

  function discountPercent(weeks) {
    if (weeks >= 8) return 10;
    if (weeks >= 4) return 5;
    return 0;
  }

  function setFieldError(input, errorEl, message) {
    const hasError = Boolean(message);
    errorEl.textContent = message || '';      // textContent, а не innerHTML
    errorEl.classList.toggle('hidden', !hasError);
    input.setAttribute('aria-invalid', String(hasError));
    input.classList.toggle('border-red-400', hasError);
    input.classList.toggle('border-brand-border', !hasError);
  }

  // Повертає { ok, weeks, adjusted, message }
  function readWeeks() {
    const input = el['pc-weeks'];
    const fail = { ok: false, message: 'Введіть кількість тижнів від ' + MIN_WEEKS + ' до ' + MAX_WEEKS + '.' };

    if (input.validity && input.validity.badInput) return fail; // літери, «e», «--»
    const raw = input.value.trim();
    if (raw === '') return fail;

    const n = Number(raw);
    if (!Number.isFinite(n) || n < MIN_WEEKS || n > MAX_WEEKS) return fail;

    const weeks = Math.floor(n); // дробове значення нормалізуємо вниз
    return { ok: true, weeks, adjusted: weeks !== n };
  }

  // Чистий розрахунок: повертає об'єкт або null, якщо вхідні дані некоректні
  function calculate(weeks, programKey, withTrainer, withMenu, withLodging) {
    const program = Object.prototype.hasOwnProperty.call(PROGRAMS, programKey) ? PROGRAMS[programKey] : null;
    if (!program || !Number.isInteger(weeks)) return null;

    const baseWeekly = program.weekly;
    const extrasWeekly =
      (withTrainer ? TRAINER_WEEKLY : 0) +
      (withMenu ? MENU_WEEKLY : 0) +
      (withLodging ? LODGING_WEEKLY : 0);

    const base = baseWeekly * weeks;
    const extras = extrasWeekly * weeks;
    const pct = discountPercent(weeks);
    const discount = Math.round(((base + extras) * pct) / 100);
    const total = base + extras - discount + DIAGNOSTICS_FEE;

    return { label: program.label, base, extras, pct, discount, total };
  }

  function showEmpty() {
    el['pc-total'].textContent = '—';
    el['pc-summary'].textContent = 'Заповніть параметри, щоб побачити вартість';
    el['pc-base'].textContent = '—';
    el['pc-extras'].textContent = '—';
    el['pc-discount'].textContent = '—';
    el['pc-fee'].textContent = money(DIAGNOSTICS_FEE);
  }

  // ---------- Основне оновлення ----------
  function update() {
    // 1. Тижні
    const weeksResult = readWeeks();
    setFieldError(el['pc-weeks'], el['pc-weeks-error'], weeksResult.ok ? '' : weeksResult.message);

    // 2. Програма (select можуть підмінити через DevTools)
    const programKey = el['pc-program'].value;
    const programValid = Object.prototype.hasOwnProperty.call(PROGRAMS, programKey);
    setFieldError(el['pc-program'], el['pc-program-error'], programValid ? '' : 'Оберіть програму зі списку.');

    if (!weeksResult.ok || !programValid) {
      showEmpty();
      return;
    }

    // 3. Формат: якщо жоден radio не обрано — вважаємо груповим
    const checkedFormat = document.querySelector('input[name="pc-format"]:checked');
    const withTrainer = Boolean(checkedFormat && checkedFormat.value === 'personal');

    const r = calculate(
      weeksResult.weeks, programKey, withTrainer,
      el['pc-menu'].checked, el['pc-lodging'].checked
    );
    if (!r) { showEmpty(); return; }

    el['pc-total'].textContent = money(r.total);
    el['pc-summary'].textContent =
      r.label + ', ' + weeksResult.weeks + ' тиж.' +
      (weeksResult.adjusted ? ' (кількість тижнів округлено до цілого)' : '');
    el['pc-base'].textContent = money(r.base);
    el['pc-extras'].textContent = r.extras > 0 ? '+ ' + money(r.extras) : '—';
    el['pc-discount'].textContent = r.pct > 0 ? '− ' + money(r.discount) + ' (' + r.pct + '%)' : '—';
    el['pc-fee'].textContent = money(DIAGNOSTICS_FEE);
  }

  // ---------- Події ----------
  el['pc-weeks'].addEventListener('input', update);
  el['pc-program'].addEventListener('change', update);
  el['pc-menu'].addEventListener('change', update);
  el['pc-lodging'].addEventListener('change', update);
  formatInputs.forEach((r) => r.addEventListener('change', update));
  el['pc-form'].addEventListener('submit', (e) => e.preventDefault()); // Enter не перезавантажує сторінку

  update(); // початковий розрахунок
})();