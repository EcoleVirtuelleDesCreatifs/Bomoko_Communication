/* ============================================================
   LE CERCLE — interactions discrètes
   header au scroll · menu mobile · reveal au scroll · parallax
   ============================================================ */

(function () {
    'use strict';

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Header : transparent -> opaque au scroll ---------- */
    var header = document.getElementById('siteHeader');

    function onScrollHeader() {
        if (window.scrollY > 60) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', onScrollHeader, { passive: true });
    onScrollHeader();

    /* ---------- Menu mobile ---------- */
    var toggle = document.getElementById('navToggle');
    var nav = document.getElementById('mainNav');

    toggle.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        toggle.classList.toggle('active', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
        document.body.style.overflow = open ? 'hidden' : '';
        document.body.classList.toggle('nav-open', open);
    });

    // Fermer le menu au clic sur un lien
    nav.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            nav.classList.remove('open');
            toggle.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            document.body.classList.remove('nav-open');
        });
    });

    /* ---------- Reveal au scroll (décalage progressif) ---------- */
    var revealEls = document.querySelectorAll('.reveal');

    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
        // Décalage léger entre éléments frères pour une apparition progressive
        var groups = new Map();
        revealEls.forEach(function (el) {
            var parent = el.parentElement;
            if (!groups.has(parent)) groups.set(parent, 0);
            var i = groups.get(parent);
            el.style.setProperty('--d', (i * 0.12).toFixed(2) + 's');
            groups.set(parent, i + 1);
        });

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

        revealEls.forEach(function (el) { observer.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('visible'); });
    }

    /* ---------- Parallax très subtil (section Expérience) ---------- */
    var parallaxImg = document.querySelector('.experience-media img');

    if (parallaxImg && !prefersReducedMotion) {
        var ticking = false;

        function parallax() {
            var rect = parallaxImg.parentElement.getBoundingClientRect();
            var progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
            progress = Math.min(Math.max(progress, 0), 1);
            var offset = (progress - 0.5) * -60; // ±30px max
            parallaxImg.style.transform = 'translateY(' + offset + 'px)';
            ticking = false;
        }

        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(parallax);
                ticking = true;
            }
        }, { passive: true });

        parallax();
    }

    /* ---------- Façade Google Maps : iframe chargée au clic ---------- */
    document.querySelectorAll('.map-load').forEach(function (button) {
        button.addEventListener('click', function () {
            var facade = button.closest('[data-map-facade]');
            if (!facade || !button.dataset.src) {
                return;
            }
            var iframe = document.createElement('iframe');
            iframe.src = button.dataset.src;
            iframe.className = 'map-embed';
            iframe.height = '360';
            iframe.loading = 'lazy';
            iframe.title = "Plan d'accès Le Cercle";
            iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
            iframe.setAttribute('allowfullscreen', '');
            facade.replaceWith(iframe);
        });
    });
})();
