/* ============================================
   VELMORA · script.js
   Tracking, LGPD, navegação, UTMs
   ============================================ */

(function() {
  'use strict';

  /* ============= ANO DINÂMICO ============= */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============= HEADER SCROLL BEHAVIOR ============= */
  var header = document.getElementById('header');
  var lastScroll = 0;
  var scrollThreshold = 80;

  window.addEventListener('scroll', function() {
    var currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    if (currentScroll > scrollThreshold && currentScroll > lastScroll) {
      header.classList.add('hidden');
    } else {
      header.classList.remove('hidden');
    }

    lastScroll = currentScroll;
  }, { passive: true });

  /* ============= MOBILE MENU ============= */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  if (burger && nav) {
    burger.addEventListener('click', function() {
      var isOpen = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', isOpen);
    });

    nav.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', false);
      });
    });
  }

  /* ============= SMOOTH SCROLL ============= */
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var href = this.getAttribute('href');
      if (href === '#' || href.length < 2) return;

      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        var offset = 90;
        var y = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  /* ============= REVEAL ON SCROLL ============= */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(function(el) { observer.observe(el); });
  } else {
    revealEls.forEach(function(el) { el.classList.add('is-visible'); });
  }

  /* ============= BACK TO TOP ============= */
  var backTop = document.getElementById('backTop');
  if (backTop) {
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 600) {
        backTop.classList.add('show');
      } else {
        backTop.classList.remove('show');
      }
    }, { passive: true });

    backTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============= FAQ ACCORDION (one open at a time) ============= */
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function(item) {
    item.addEventListener('toggle', function() {
      if (item.open) {
        faqItems.forEach(function(other) {
          if (other !== item) other.removeAttribute('open');
        });
      }
    });
  });

  /* ============= COOKIE BANNER (LGPD) ============= */
  var cookieBanner = document.getElementById('cookieBanner');
  var cookieAccept = document.getElementById('cookieAccept');
  var cookieDecline = document.getElementById('cookieDecline');
  var COOKIE_KEY = 'velmora_cookie_consent';

  function getCookieConsent() {
    try { return localStorage.getItem(COOKIE_KEY); }
    catch (e) { return null; }
  }
  function setCookieConsent(value) {
    try { localStorage.setItem(COOKIE_KEY, value); } catch (e) {}
  }
  function hideBanner() {
    if (cookieBanner) cookieBanner.style.display = 'none';
  }

  if (cookieBanner && !getCookieConsent()) {
    setTimeout(function() {
      cookieBanner.hidden = false;
    }, 1500);
  }
  if (cookieAccept) {
    cookieAccept.addEventListener('click', function() {
      setCookieConsent('accepted');
      hideBanner();
    });
  }
  if (cookieDecline) {
    cookieDecline.addEventListener('click', function() {
      setCookieConsent('declined');
      hideBanner();
    });
  }

  /* ============= TRACKING UNIFICADO ============= */
  function trackEvent(eventName, params) {
    params = params || {};

    // Google Analytics 4
    if (typeof gtag === 'function') {
      gtag('event', eventName, params);
    }

    // Facebook Pixel - mapping para eventos padrão
    if (typeof fbq === 'function') {
      var pixelMap = {
        'hero_offer': 'InitiateCheckout',
        'hero_whatsapp': 'Contact',
        'header_cta': 'Contact',
        'spotlight_offer': 'InitiateCheckout',
        'offer_kit_1': 'InitiateCheckout',
        'offer_kit_2': 'InitiateCheckout',
        'offer_kit_3': 'InitiateCheckout',
        'lineup_whatsapp': 'Contact',
        'faq_whatsapp': 'Lead',
        'final_offer': 'InitiateCheckout',
        'final_whatsapp': 'Contact',
        'float_whatsapp': 'Contact',
        'ingredients_view': 'ViewContent'
      };
      var stdEvent = pixelMap[eventName];
      if (stdEvent) {
        fbq('track', stdEvent, params);
      } else {
        fbq('trackCustom', eventName, params);
      }
    }
  }

  document.querySelectorAll('[data-track]').forEach(function(el) {
    el.addEventListener('click', function() {
      var eventName = el.getAttribute('data-track');
      trackEvent(eventName, {
        event_category: 'engagement',
        event_label: el.textContent.trim().substring(0, 50)
      });
    });
  });

  /* ============= UTMs PERSISTENTES NO WHATSAPP ============= */
  var urlParams = new URLSearchParams(window.location.search);
  var utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  var utmString = '';

  utmKeys.forEach(function(key) {
    var value = urlParams.get(key);
    if (value) utmString += '%0A%0A_' + key + '=' + encodeURIComponent(value) + '_';
  });

  if (utmString) {
    document.querySelectorAll('a[href*="wa.me"]').forEach(function(link) {
      var href = link.getAttribute('href');
      if (href.indexOf('text=') !== -1) {
        link.setAttribute('href', href + utmString);
      }
    });
  }

  /* ============= INGREDIENTS VIEW TRACKING ============= */
  var compositionSection = document.getElementById('composicao');
  if (compositionSection && 'IntersectionObserver' in window) {
    var compObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          trackEvent('ingredients_view', {
            event_category: 'engagement',
            section: 'composicao'
          });
          compObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    compObserver.observe(compositionSection);
  }

})();
