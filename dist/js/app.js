/**
 * ContractorLogic — Vue 3 app + scroll reveal + homepage hero widgets
 */

(function () {
  'use strict';

  // ── Scroll reveal ──────────────────────────────────
  function initScrollReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    els.forEach(function (el) { observer.observe(el); });
  }

  // ── Stat counters ──────────────────────────────────
  function initStatCounters() {
    var els = document.querySelectorAll('.stat-counter');
    if (!els.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        animateCounter(entry.target);
      });
    }, { threshold: 0.5 });

    els.forEach(function (el) { observer.observe(el); });
  }

  function animateCounter(el) {
    var target   = parseInt(el.dataset.target, 10);
    var suffix   = el.dataset.suffix || '';
    var duration = 1600;
    var start    = Date.now();
    // Start close to target for year-style numbers (e.g. 2023 counts from 1980)
    var from     = target > 999 ? target - 43 : 0;

    function tick() {
      var elapsed  = Date.now() - start;
      var progress = Math.min(elapsed / duration, 1);
      var eased    = 1 - Math.pow(1 - progress, 3);
      var current  = Math.round(from + (target - from) * eased);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  // ── LawLogic form progress bar ────────────────────
  function initLLFormProgress() {
    var indicator = document.getElementById('ll-progress');
    if (!indicator) return;

    var totalSteps  = 5;
    var currentStep = 0;
    var dots        = indicator.querySelectorAll('.elig-step-dot');

    function updateDots() {
      dots.forEach(function (dot, i) {
        dot.classList.remove('active', 'done');
        if (i < currentStep)      dot.classList.add('done');
        else if (i === currentStep) dot.classList.add('active');
      });
      indicator.setAttribute('aria-valuenow', currentStep + 1);
    }

    // Event delegation — works with dynamically injected form buttons
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('#ll-form .btn, #ll-form button:not([type="submit"])');
      if (btn && currentStep < totalSteps - 1) {
        currentStep++;
        updateDots();
      }
    });
  }

  // ── Services grid (multi-select) ───────────────────
  // ── Shared service selection: cards ↔ lead form ────
  // `picked` holds the chosen service names. Cards toggle it, the lead form's
  // pills write back to it, and the bottom CTA reports it.
  var picked = [];
  var formField = null; // { select, rows, sync } once the lead form has loaded

  function renderPicked() {
    document.querySelectorAll('.service-card').forEach(function (card) {
      var name = card.querySelector('h3').textContent.trim();
      card.setAttribute('aria-pressed', picked.indexOf(name) > -1 ? 'true' : 'false');
    });
    var cta = document.querySelector('.services-cta');
    if (!cta) return;
    var n = picked.length;
    cta.hidden = n === 0;
    cta.querySelector('.services-cta_label').textContent =
      'Get quotes for ' + (n === 1 ? 'this service' : 'these ' + n + ' services');
  }

  function applyPickedToForm() {
    if (!formField) return;
    Array.prototype.forEach.call(formField.select.options, function (opt, i) {
      var want = picked.indexOf(opt.text.trim()) > -1;
      if (opt.selected !== want && formField.rows[i]) formField.rows[i].click();
    });
    formField.sync();
  }

  function pickedFromForm() {
    picked = Array.prototype.filter.call(formField.select.options, function (o) { return o.selected; })
      .map(function (o) { return o.text.trim(); });
  }

  function goToForm() {
    var hero = document.getElementById('quote');
    if (hero) hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(function () {
      var zip = document.querySelector('#ll-form #zip');
      if (zip) zip.focus({ preventScroll: true });
    }, 700);
  }

  function initServiceCards() {
    document.querySelectorAll('.service-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var name = card.querySelector('h3').textContent.trim();
        var i = picked.indexOf(name);
        if (i > -1) picked.splice(i, 1); else picked.push(name);
        renderPicked();
        applyPickedToForm();
      });
    });
    var btn = document.querySelector('.services-cta_btn');
    if (btn) btn.addEventListener('click', goToForm);
    renderPicked();
  }

  // ── FAQ accordion (Vue) ───────────────────────────
  function mountFaqApp() {
    var el = document.getElementById('faq-app');
    if (!el || typeof Vue === 'undefined') return;

    var faqs;
    try { faqs = JSON.parse(el.dataset.faqs); } catch (e) { return; }

    var { createApp, ref } = Vue;

    createApp({
      template: `
        <div class="faq-list" role="list">
          <div v-for="(faq, i) in faqs" :key="i"
               class="faq-item" :class="{ 'is-open': openIndex === i }" role="listitem">
            <button class="faq-trigger"
                    :aria-expanded="openIndex === i"
                    :aria-controls="'faq-answer-' + i"
                    @click="toggle(i)">
              <span>{{ faq.question }}</span>
              <svg class="faq-trigger-icon" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
              </svg>
            </button>
            <transition name="faq-slide">
              <div v-if="openIndex === i" :id="'faq-answer-' + i" class="faq-answer">
                {{ faq.answer }}
              </div>
            </transition>
          </div>
        </div>
      `,
      setup() {
        var openIndex = ref(null);
        function toggle(i) { openIndex.value = openIndex.value === i ? null : i; }
        return { faqs, openIndex, toggle };
      }
    }).mount('#faq-app');
  }

  // ── Header turns solid after scrolling ─────────────
  function initNavbarScroll() {
    var nav = document.querySelector('.navbar');
    if (!nav) return;
    function update() { nav.classList.toggle('is-scrolled', window.scrollY > 40); }
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  // ── Fade-up as elements scroll into view ───────────
  function initRise() {
    var els = document.querySelectorAll('.rise');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
    els.forEach(function (el) { observer.observe(el); });
  }

  // ── Lead form: service dropdown → multi-select pills ──
  // The platform renders a hidden <select multiple> plus a dropdown whose rows
  // do the real selecting. Pills click those rows, so validation, the platform's
  // onchange handler and the submitted values all keep working.
  function enhanceServiceField(form) {
    var wrap = form.querySelector('.js-bs-select-dropdown:not([data-pills])');
    if (!wrap) return;
    var select = wrap.querySelector('select[multiple]');
    var rows = wrap.querySelectorAll('.dropdown-menu .dropdown-item[data-index]');
    if (!select || !rows.length) return;

    var group = document.createElement('div');
    group.className = 'service-pills';
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', 'Select one or more services');

    function sync() {
      Array.prototype.forEach.call(group.children, function (pill, i) {
        pill.setAttribute('aria-pressed', select.options[i] && select.options[i].selected ? 'true' : 'false');
      });
      // The platform flags the field after a failed submit but only its own
      // dropdown clears that flag, so clear it (and restore its normal class) once something is selected.
      var msg = document.getElementById('validation_service');
      if (msg && select.selectedOptions.length && msg.classList.contains('invalid-field')) {
        msg.classList.remove('invalid-field');
        msg.classList.add('invalid-feedback');
      }
    }

    Array.prototype.forEach.call(select.options, function (opt, i) {
      var pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'service-pill';
      pill.textContent = opt.text;
      pill.setAttribute('aria-pressed', 'false');
      pill.addEventListener('click', function () {
        if (rows[i]) rows[i].click();
        setTimeout(function () { sync(); pickedFromForm(); renderPicked(); }, 0);
      });
      group.appendChild(pill);
    });

    wrap.setAttribute('data-pills', '');
    wrap.parentNode.insertBefore(group, wrap.nextSibling);
    select.addEventListener('change', sync);
    sync();

    formField = { select: select, rows: rows, sync: sync };
    if (picked.length) applyPickedToForm(); else pickedFromForm();
    renderPicked();
  }

  function initServicePills() {
    var form = document.getElementById('ll-form');
    if (!form) return;
    var queued = false;
    new MutationObserver(function () {
      if (queued) return;
      queued = true;
      setTimeout(function () { queued = false; enhanceServiceField(form); }, 50);
    }).observe(form, { childList: true, subtree: true });
    enhanceServiceField(form);
  }

  // ── Init ──────────────────────────────────────────
  function init() {
    initNavbarScroll();
    initScrollReveal();
    initRise();
    initServicePills();
    initStatCounters();
    initLLFormProgress();
    initServiceCards();
    mountFaqApp();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
