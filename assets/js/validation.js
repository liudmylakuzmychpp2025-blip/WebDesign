(function () {
  'use strict';

  // ===== RegEx =====
  const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const REGEX_PHONE = /^\+380\d{9}$/;

  const form = document.getElementById('feedbackForm');
  if (!form) return;

  const modal = document.getElementById('successModal');
  const modalClose = document.getElementById('modalClose');
  const $ = (id) => document.getElementById(id);

  // ===== Функції валідації: повертають '' якщо ок, або текст помилки =====
  function validateName(v) {
    return v.trim().length >= 2 ? '' : 'Введіть ім’я (мінімум 2 символи).';
  }
  function validateEmail(v) {
    return REGEX_EMAIL.test(v.trim()) ? '' : 'Введіть коректну електронну адресу, наприклад user@gmail.com.';
  }
  function validatePhone(v) {
    return REGEX_PHONE.test(v) ? '' : 'Введіть номер у форматі +380XXXXXXXXX (без пробілів).';
  }
  function validateMessage(v) {
    return v.trim().length >= 10 ? '' : 'Повідомлення має містити мінімум 10 символів.';
  }
  function validateAgreement(checked) {
    return checked ? '' : 'Потрібна згода з політикою конфіденційності.';
  }

  const fields = [
    { id: 'username',  check: () => validateName($('username').value) },
    { id: 'email',     check: () => validateEmail($('email').value) },
    { id: 'phone',     check: () => validatePhone($('phone').value) },
    { id: 'message',   check: () => validateMessage($('message').value) },
    { id: 'agreement', check: () => validateAgreement($('agreement').checked) },
  ];

  const STATE_CLASSES = ['border-brand-border', 'border-red-500', 'border-green-500'];

  function setBorder(el, cls) {
    el.classList.remove(...STATE_CLASSES);
    if (cls) el.classList.add(cls);
  }

  // ===== UI-стани =====
  function showError(id, msg) {
    const el = $(id), err = $(id + 'Error');
    err.textContent = msg;
    err.classList.remove('hidden');
    el.setAttribute('aria-invalid', 'true');
    if (el.type !== 'checkbox') setBorder(el, 'border-red-500');
  }
  function showSuccess(id) {
    const el = $(id), err = $(id + 'Error');
    err.textContent = '';
    err.classList.add('hidden');
    el.setAttribute('aria-invalid', 'false');
    if (el.type !== 'checkbox') setBorder(el, 'border-green-500');
  }
  function clearError(id) {
    const el = $(id), err = $(id + 'Error');
    err.textContent = '';
    err.classList.add('hidden');
    el.setAttribute('aria-invalid', 'false');
    if (el.type !== 'checkbox') setBorder(el, 'border-brand-border');
  }

  function runField(field) {
    const msg = field.check();
    msg ? showError(field.id, msg) : showSuccess(field.id);
    return !msg;
  }

  // ===== Телефон: UX-нормалізація (окремо від RegEx) =====
  // Прибираємо пробіли, дужки, дефіси; 0501234567 -> +380501234567
  function normalizePhone() {
    const input = $('phone');
    let v = input.value.replace(/[\s()\-]/g, '');
    if (/^0\d{9}$/.test(v)) v = '+38' + v;
    else if (/^380\d{9}$/.test(v)) v = '+' + v;
    input.value = v;
  }

  // ===== Динамічна валідація: input, blur =====
  fields.forEach((field) => {
    const el = $(field.id);
    let touched = false;

    if (el.type === 'checkbox') {
      el.addEventListener('change', () => { touched = true; runField(field); });
      return;
    }

    el.addEventListener('blur', () => {
      if (field.id === 'phone' && el.value) normalizePhone();
      if (!el.value && !touched) return; // не лаємося на поле, якого не торкались
      touched = true;
      runField(field);
    });

    el.addEventListener('input', () => {
      if (touched) runField(field); // оновлюємо стан лише після першого виходу з поля
    });
  });

  // ===== Модальне вікно =====
  let lastFocus = null;

  function openModal() {
    lastFocus = document.activeElement;
    modal.classList.remove('hidden');
    modalClose.focus();
  }
  function closeModal() {
    modal.classList.add('hidden');
    if (lastFocus) lastFocus.focus();
  }

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  document.addEventListener('keydown', (e) => {
    if (modal.classList.contains('hidden')) return;
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key === 'Tab') { e.preventDefault(); modalClose.focus(); } // єдина кнопка: фокус не виходить за межі вікна
  });

  // ===== Submit =====
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!modal.classList.contains('hidden')) return; // захист від повторного натискання

    normalizePhone();
    let firstInvalid = null;
    fields.forEach((field) => {
      if (!runField(field) && !firstInvalid) firstInvalid = $(field.id);
    });

    if (firstInvalid) { firstInvalid.focus(); return; }

    // Імітація надсилання: даних на сервер не відправляємо
    form.reset();
    fields.forEach((f) => clearError(f.id));
    openModal();
  });
})();