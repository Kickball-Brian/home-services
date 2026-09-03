/**
 * Depo Claim Center — Vue 3 app + scroll reveal
 *
 * Eligibility checker uses the exact 4 qualifying criteria:
 *  1. Used Depo-Provera between 1992–2019
 *  2. Used it for at least 1 year (4+ shots)
 *  3. Diagnosed with a meningioma (brain tumor)
 *  4. Not currently represented by another law firm
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
    mountFaqApp();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
