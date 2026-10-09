/** @odoo-module ignore **/
/*
 * SummaFlow — shared product-screenshot slider.
 *
 * One builder of NEW media only, used by two page decorators:
 *   - platform.js : inside the "Built for teams…" gradient band
 *   - company.js  : replacing the stacked-rectangle hero visual
 *
 * It never reads, moves, clones or rewires builder content: the caller passes
 * a container and gets back a detached-then-appended element plus a dispose()
 * that removes it again, so the caller's undo log can restore the exact
 * database arch before the Website Editor ever sees the page.
 *
 * Plain browser script: no imports, no dependencies, no network beyond the
 * module's own static images. Navigation is two buttons plus dots; motion is a
 * single opacity crossfade (no transform, no autoplay, no swipe library).
 *
 * Exposed as window.sfShots so the page scripts stay independent files, in the
 * same bundle order the manifest already documents.
 */
(function () {
    'use strict';

    var BASE = '/website_summaflow/static/src/img/hero/';

    // The three product screenshots already shipped in the module.
    var SHOTS = [
        { file: 'project-overview-grid.png', alt: 'SummaFlow project overview, grid view' },
        { file: 'project-overview-list.png', alt: 'SummaFlow project overview, list view' },
        { file: 'email-providers.png', alt: 'SummaFlow connected email providers' }
    ];

    function el(tag, cls) {
        var n = document.createElement(tag);
        if (cls) { n.className = cls; }
        return n;
    }

    /*
     * build(container, label) -> { root, dispose }
     * Appends the slider to container. Idempotent per container: a second call
     * returns the existing instance.
     */
    function build(container, label) {
        if (!container) { return null; }
        if (container.__sfShots) { return container.__sfShots; }

        var root = el('div', 'sf-shots');
        root.setAttribute('role', 'group');
        root.setAttribute('aria-label', label || 'Product screenshots');

        var frame = el('div', 'sf-shots__frame');
        var imgs = SHOTS.map(function (shot, i) {
            var im = el('img', 'sf-shots__img');
            im.src = BASE + shot.file;
            im.alt = shot.alt;
            im.setAttribute('loading', i === 0 ? 'eager' : 'lazy');
            im.setAttribute('decoding', 'async');
            im.setAttribute('draggable', 'false');
            if (i === 0) { im.classList.add('is-active'); }
            else { im.setAttribute('aria-hidden', 'true'); }
            frame.appendChild(im);
            return im;
        });
        root.appendChild(frame);

        var nav = el('div', 'sf-shots__nav');
        var prev = navButton('Previous screenshot', 'M15 6l-6 6 6 6');
        var next = navButton('Next screenshot', 'M9 6l6 6-6 6');
        var dots = el('div', 'sf-shots__dots');
        var dotList = SHOTS.map(function (shot, i) {
            var d = el('button', 'sf-shots__dot');
            d.type = 'button';
            d.setAttribute('aria-label', 'Screenshot ' + (i + 1) + ' of ' + SHOTS.length);
            d.addEventListener('click', function () { show(i); });
            dots.appendChild(d);
            return d;
        });
        nav.appendChild(prev);
        nav.appendChild(dots);
        nav.appendChild(next);
        root.appendChild(nav);

        var at = 0;
        function show(i) {
            at = (i + SHOTS.length) % SHOTS.length;
            imgs.forEach(function (im, k) {
                var on = (k === at);
                im.classList.toggle('is-active', on);
                if (on) { im.removeAttribute('aria-hidden'); }
                else { im.setAttribute('aria-hidden', 'true'); }
            });
            dotList.forEach(function (d, k) {
                d.classList.toggle('is-active', k === at);
                d.setAttribute('aria-current', k === at ? 'true' : 'false');
            });
        }
        prev.addEventListener('click', function () { show(at - 1); });
        next.addEventListener('click', function () { show(at + 1); });
        show(0);

        container.appendChild(root);

        var stopAuto = autoplay(root, function () { show(at + 1); });

        var instance = {
            root: root,
            dispose: function () {
                stopAuto();
                if (root.parentNode) { root.parentNode.removeChild(root); }
                delete container.__sfShots;
            }
        };
        container.__sfShots = instance;
        return instance;
    }

    /*
     * Autoplay: one timer, started and stopped by real conditions rather than
     * left running in the background.
     *   - pointer over the slider / focus inside it -> paused
     *   - tab hidden -> paused (no work while nobody is looking)
     *   - slider off screen -> paused (IntersectionObserver; always on when the
     *     browser has none)
     *   - prefers-reduced-motion -> never starts
     * Returns a stop() the caller's dispose() uses, so nothing survives the
     * Website Editor undo.
     */
    var INTERVAL = 6000;

    function autoplay(root, advance) {
        var reduce = window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) { return function () {}; }

        var timer = null;
        var hovered = false;
        var visible = true; // no IntersectionObserver -> treat as on screen

        function tick() { if (!document.hidden) { advance(); } }

        function sync() {
            var run = visible && !hovered && !document.hidden;
            if (run && timer === null) { timer = window.setInterval(tick, INTERVAL); }
            else if (!run && timer !== null) { window.clearInterval(timer); timer = null; }
        }

        function enter() { hovered = true; sync(); }
        function leave() { hovered = false; sync(); }

        root.addEventListener('mouseenter', enter);
        root.addEventListener('mouseleave', leave);
        root.addEventListener('focusin', enter);
        root.addEventListener('focusout', leave);
        document.addEventListener('visibilitychange', sync);

        var io = null;
        if (window.IntersectionObserver) {
            visible = false;
            io = new IntersectionObserver(function (entries) {
                visible = entries[0].isIntersecting;
                sync();
            }, { threshold: 0.25 });
            io.observe(root);
        }
        sync();

        return function stop() {
            if (timer !== null) { window.clearInterval(timer); timer = null; }
            if (io) { io.disconnect(); }
            root.removeEventListener('mouseenter', enter);
            root.removeEventListener('mouseleave', leave);
            root.removeEventListener('focusin', enter);
            root.removeEventListener('focusout', leave);
            document.removeEventListener('visibilitychange', sync);
        };
    }

    // Inline chevron: no icon-font dependency, inherits currentColor.
    function navButton(label, path) {
        var b = el('button', 'sf-shots__btn');
        b.type = 'button';
        b.setAttribute('aria-label', label);
        b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
            '<path d="' + path + '" fill="none" stroke="currentColor" stroke-width="2" ' +
            'stroke-linecap="round" stroke-linejoin="round"/></svg>';
        return b;
    }

    // =====================================================================
    // Mounts
    // =====================================================================
    var undo = [];

    function isEditing() {
        var b = document.body;
        return /[?&](enable_editor|edit_translations)=/.test(window.location.search) ||
            !!(b && b.classList.contains('editor_enable'));
    }

    function addClass(e, name) {
        if (!e || e.classList.contains(name)) { return; }
        e.classList.add(name);
        undo.push(function () { e.classList.remove(name); });
    }

    function text(e) { return (e.textContent || '').replace(/ /g, ' '); }

    // Returns the first section matching `selector` whose copy contains
    // `phrase`. Two signals must agree, so no unstable selector is guessed.
    function findSection(selector, phrase) {
        var list = document.querySelectorAll(selector);
        for (var i = 0; i < list.length; i++) {
            if (text(list[i]).indexOf(phrase) !== -1) { return list[i]; }
        }
        return null;
    }

    function mount(section, flag, label) {
        if (!section) { return null; }
        var box = section.querySelector('.container') || section;
        var slider = build(box, label);
        if (!slider) { return null; }
        addClass(section, flag);
        undo.push(function () { slider.dispose(); });
        return slider;
    }

    function mountAll() {
        if (isEditing()) { return; }

        mount(findSection('section.s_text_bold', 'Built for teams that cannot afford'),
              'sf-pf-band--shots', 'SummaFlow product screenshots');

        var company = findSection('section.s_discovery', 'Global Trade Operations');
        if (mount(company, 'sf-company-hero--shots', 'SummaFlow product screenshots')) {
            var img = company.querySelector('img');
            if (img) { addClass(img, 'sf-company-hero__media--void'); }
        }

        if (undo.length) { guardEditor(); }
    }

    // If the Website Editor starts after mounting, undo everything so the
    // builder can only ever save the untouched database arch.
    function guardEditor() {
        if (!window.MutationObserver || !document.body) { return; }
        var mo = new MutationObserver(function () {
            if (!document.body.classList.contains('editor_enable')) { return; }
            mo.disconnect();
            while (undo.length) { undo.pop()(); }
        });
        mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    window.sfShots = { build: build, shots: SHOTS, base: BASE };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mountAll);
    } else {
        mountAll();
    }
})();
