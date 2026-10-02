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

  // ── Hero service picker ────────────────────────────
  function initServicePicker() {
    var pills = document.querySelectorAll('.service-pill');
    if (!pills.length) return;

    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        pills.forEach(function (p) { p.classList.remove('active'); });
        pill.classList.add('active');
      });
    });
  }

  // ── Services grid (multi-select) ───────────────────
  function initServiceCards() {
    document.querySelectorAll('.service-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var on = card.getAttribute('aria-pressed') === 'true';
        card.setAttribute('aria-pressed', on ? 'false' : 'true');
      });
    });
  }

  // ── Hero ZIP lookup ─────────────────────────────────
  function initZipForm() {
    var btn   = document.querySelector('.zip-btn');
    var input = document.querySelector('.zip-input');
    if (!btn || !input) return;

    btn.addEventListener('click', function () {
      var zip = input.value.trim();
      if (!/^\d{5}$/.test(zip)) {
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }
      input.removeAttribute('aria-invalid');
      // TODO: wire to lead-routing endpoint once available.
    });
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

  // ── Init ──────────────────────────────────────────
  function init() {
    initScrollReveal();
    initStatCounters();
    initLLFormProgress();
    initServicePicker();
    initServiceCards();
    initZipForm();
    mountFaqApp();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
