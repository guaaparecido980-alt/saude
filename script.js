/* =========================================================
   VELMO BLACK DRINK — SCRIPT
   ========================================================= */
(function(){
'use strict';

/* ===== Util ===== */
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

/* ===== 1. Year ===== */
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ===== 2. Header: scroll behavior ===== */
const header = $('#header');
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (!header) return;
    if (y > 80) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
    if (y > lastScroll && y > 220) header.classList.add('is-hidden');
    else header.classList.remove('is-hidden');
    lastScroll = y;
}, { passive: true });

/* ===== 3. Mobile menu ===== */
const burger = $('#burger');
const nav = $('#nav');
if (burger && nav) {
    burger.addEventListener('click', () => {
        const open = nav.classList.toggle('is-open');
        burger.classList.toggle('is-open', open);
        burger.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            nav.classList.remove('is-open');
            burger.classList.remove('is-open');
            burger.setAttribute('aria-expanded', 'false');
        });
    });
}

/* ===== 4. Smooth scroll ===== */
$$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (id === '#' || id.length < 2) return;
        const tgt = document.querySelector(id);
        if (!tgt) return;
        e.preventDefault();
        const y = tgt.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top: y, behavior: 'smooth' });
    });
});

/* ===== 5. Reveal on scroll ===== */
const revealEls = $$('section .container > *, .kit, .bf-card, .comp__card, .identif__card, .conf__item, .pq');
revealEls.forEach(el => el.classList.add('reveal'));
if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
} else {
    revealEls.forEach(el => el.classList.add('is-visible'));
}

/* ===== 6. Back to top ===== */
const toTop = $('#toTop');
if (toTop) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 600) toTop.classList.add('is-visible');
        else toTop.classList.remove('is-visible');
    }, { passive: true });
    toTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ===== 7. FAQ — close others when one opens ===== */
$$('.faq__item').forEach(item => {
    item.addEventListener('toggle', () => {
        if (item.open) {
            $$('.faq__item').forEach(other => {
                if (other !== item) other.open = false;
            });
        }
    });
});

/* ===== 8. Cookie banner (LGPD) ===== */
const cookie = $('#cookieBanner');
const cookieAccept = $('#cookieAccept');
const cookieReject = $('#cookieReject');
const COOKIE_KEY = 'velmo_cookie_consent';

if (cookie) {
    if (!localStorage.getItem(COOKIE_KEY)) {
        setTimeout(() => cookie.classList.add('is-visible'), 1200);
    }
    cookieAccept && cookieAccept.addEventListener('click', () => {
        localStorage.setItem(COOKIE_KEY, 'accepted');
        cookie.classList.remove('is-visible');
    });
    cookieReject && cookieReject.addEventListener('click', () => {
        localStorage.setItem(COOKIE_KEY, 'rejected');
        cookie.classList.remove('is-visible');
    });
}

/* ===== 9. Tracking — eventos ===== */
function trackEvent(name, params) {
    params = params || {};
    try {
        if (typeof window.gtag === 'function') {
            window.gtag('event', name, params);
        }
        if (typeof window.fbq === 'function') {
            const fbMap = {
                hero_whatsapp: 'Contact',
                hero_offer: 'Lead',
                offer_kit_1: 'InitiateCheckout',
                offer_kit_2: 'InitiateCheckout',
                offer_kit_3: 'InitiateCheckout',
                final_cta: 'Contact',
                faq_whatsapp: 'Contact',
                float_whatsapp: 'Contact',
                header_cta: 'Lead',
                produto_offer: 'Lead'
            };
            const fbEvent = fbMap[name];
            if (fbEvent) {
                window.fbq('track', fbEvent, { content_name: name });
            } else {
                window.fbq('trackCustom', name, params);
            }
        }
    } catch (err) {
        console && console.warn && console.warn('Tracking error:', err);
    }
}

$$('[data-track]').forEach(el => {
    el.addEventListener('click', () => {
        const eventName = el.getAttribute('data-track');
        trackEvent(eventName, {
            event_category: 'engagement',
            event_label: el.textContent.trim().slice(0, 60)
        });
    });
});

/* ===== 10. UTMs persistentes nos links de WhatsApp ===== */
(function persistUTMs() {
    const params = new URLSearchParams(window.location.search);
    const utmKeys = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','fbclid','gclid'];
    const utmObj = {};
    utmKeys.forEach(k => {
        const v = params.get(k);
        if (v) utmObj[k] = v;
    });
    if (Object.keys(utmObj).length === 0) return;
    $$('a[href*="wa.me"], a[href*="api.whatsapp.com"]').forEach(a => {
        const url = new URL(a.href);
        const text = url.searchParams.get('text') || '';
        const utmText = '\n\n[Origem: ' + Object.entries(utmObj).map(([k,v]) => `${k}=${v}`).join(' | ') + ']';
        url.searchParams.set('text', text + utmText);
        a.href = url.toString();
    });
})();

/* ===== 11. Section tracking on scroll (composição visualizada) ===== */
if ('IntersectionObserver' in window) {
    const compSection = $('#composicao');
    if (compSection) {
        const compObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    trackEvent('ingredients_view', { event_category: 'content' });
                    compObserver.unobserve(compSection);
                }
            });
        }, { threshold: 0.4 });
        compObserver.observe(compSection);
    }
}

})();
