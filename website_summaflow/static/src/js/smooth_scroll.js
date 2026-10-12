/** @odoo-module ignore **/
/*
 * SummaFlow — site-wide smooth scrolling (Lenis).
 *
 * Lenis is VENDORED, not fetched: static/lib/lenis/lenis.min.js (v1.1.18, MIT)
 * and its 4-rule stylesheet, both listed in __manifest__.py. Odoo Online never
 * runs npm and the page never calls a CDN.
 *
 * This file only starts it, and only where it is safe:
 *   - never in the Website Editor (the builder owns scrolling while editing,
 *     and snippet drag/drop depends on native scroll)
 *   - never under prefers-reduced-motion
 *   - never on touch input: Lenis's default touchMultiplier fights native
 *     momentum scrolling, so mobile keeps the browser's own behaviour
 *
 * Anchor links keep working: Lenis exposes scrollTo and this file routes
 * same-page #hash clicks through it, so /platform#section still lands in the
 * right place instead of being torn between two scroll owners.
 *
 * Scrollable UI that must NOT be smoothed (the mobile offcanvas panel) is
 * marked data-lenis-prevent, which Lenis honours natively.
 */
(function () {
    'use strict';

    function isEditing() {
        var b = document.body;
        return /[?&](enable_editor|edit_translations)=/.test(window.location.search) ||
            !!(b && b.classList.contains('editor_enable'));
    }

    function init() {
        if (isEditing()) { return; }
        if (!window.Lenis) {
            // The real Odoo asset bundle does not follow manifest order
            // (verified on the test DB), so the vendored library may parse
            // AFTER this file. One retry at window load, then give up and the
            // site simply scrolls natively.
            if (!init.retried) {
                init.retried = true;
                window.addEventListener('load', init, { once: true });
            }
            return;
        }
        if (window.sfLenis) { return; } // idempotent
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        // Coarse pointer = touch device: leave native momentum scrolling alone.
        if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) { return; }

        var lenis = new window.Lenis({
            duration: 1.1,
            smoothWheel: true,
            syncTouch: false,
            touchMultiplier: 1
        });
        window.sfLenis = lenis;

        function raf(time) {
            lenis.raf(time);
            window.requestAnimationFrame(raf);
        }
        window.requestAnimationFrame(raf);

        // The mobile menu scrolls itself.
        var panel = document.getElementById('sf_mobile_nav');
        if (panel) { panel.setAttribute('data-lenis-prevent', ''); }

        // Same-page anchors go through Lenis, so one owner animates the scroll.
        document.addEventListener('click', function (ev) {
            var a = ev.target && ev.target.closest ? ev.target.closest('a[href^="#"]') : null;
            if (!a) { return; }
            var hash = a.getAttribute('href');
            if (!hash || hash === '#' || a.hasAttribute('data-bs-toggle')) { return; }
            var target;
            try { target = document.querySelector(hash); } catch (e) { return; }
            if (!target) { return; }
            ev.preventDefault();
            lenis.scrollTo(target, { offset: -70 }); // clears the 62px sticky header
        });

        // The Website Editor can start later: hand scrolling back untouched.
        if (window.MutationObserver && document.body) {
            var mo = new MutationObserver(function () {
                if (!document.body.classList.contains('editor_enable')) { return; }
                mo.disconnect();
                lenis.destroy();
                delete window.sfLenis;
            });
            mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
