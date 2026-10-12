/** @odoo-module ignore **/
/*
 * SummaFlow — first-paint reveal (anti-flash).
 *
 * Builder pages (#wrap) are restyled at runtime by the page
 * scripts above (hero.js, homepage_sections.js, platform.js, ...). Until they
 * run, the raw builder markup would paint with its old look for a moment.
 * _layout.scss keeps that content area transparent until <body> carries
 * .sf-ready; this script adds it once every decorator has run.
 *
 * Loaded LAST in the bundle: its DOMContentLoaded handler is registered after
 * the decorators', so it fires after them. If anything fails, the CSS
 * auto-reveals after 2.5s — content can never stay hidden.
 */
(function () {
    'use strict';

    function reveal() {
        window.requestAnimationFrame(function () {
            document.body.classList.add('sf-ready');
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', reveal);
    } else {
        reveal();
    }
})();
