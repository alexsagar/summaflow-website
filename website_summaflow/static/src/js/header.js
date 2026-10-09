/** @odoo-module ignore **/
/*
 * SummaFlow — mobile navigation state reset.
 *
 * The panel itself is Bootstrap's offcanvas, declared in views/header.xml, and
 * stays that way: Bootstrap owns open/close, focus, Escape and aria-expanded.
 * This file only closes the gap Bootstrap cannot see.
 *
 * The bug: the trigger (.sf-header__toggle) is d-lg-none. If the menu is open
 * and the viewport crosses to >= 992px (rotation, desktop resize, a tablet
 * keyboard), the offcanvas stays shown with the body scroll lock and the
 * backdrop in place while its trigger is hidden - so the header/background
 * never resets and there is nothing left to close it with. Crossing back to
 * mobile keeps that stale state.
 *
 * The fix: when the desktop breakpoint starts matching, ask Bootstrap's own
 * instance to hide. Bootstrap then removes .show, the backdrop and the body
 * lock exactly as a normal close does - no class poking, no inline-style
 * cleanup, no timers.
 *
 * The second half of the same bug (the Menu button staying inverted after a
 * close, because Bootstrap restores focus to it) is fixed in _header.scss by
 * using :focus-visible instead of :focus - CSS, no JS.
 *
 * No-ops in the Website Editor and when Bootstrap is unavailable.
 */
(function () {
    'use strict';

    var DESKTOP_MQ = '(min-width: 992px)';

    function isEditing() {
        var b = document.body;
        return /[?&](enable_editor|edit_translations)=/.test(window.location.search) ||
            !!(b && b.classList.contains('editor_enable'));
    }

    function init() {
        if (isEditing()) { return; }
        var panel = document.getElementById('sf_mobile_nav');
        var bs = window.bootstrap;
        if (!panel || !bs || !bs.Offcanvas || !window.matchMedia) { return; }

        var mq = window.matchMedia(DESKTOP_MQ);
        function onChange() {
            if (!mq.matches) { return; }
            if (!panel.classList.contains('show')) { return; }
            // getOrCreateInstance: the panel may never have been opened through
            // a JS instance (data-bs-toggle creates one lazily).
            bs.Offcanvas.getOrCreateInstance(panel).hide();
        }
        if (mq.addEventListener) { mq.addEventListener('change', onChange); }
        else { mq.addListener(onChange); } // older Safari
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
