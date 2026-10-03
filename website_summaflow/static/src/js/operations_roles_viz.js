/** @odoo-module ignore **/
/*
 * SummaFlow — "Purpose-built for Every Operations Role" card visualizations.
 *
 * Plain browser script (no imports, no dependencies, no network).
 * Appends one decorative SVG stage to each of the three existing role cards
 * that immediately follow the unique title section. Existing card text and
 * markup are never rewritten.
 *
 * - Scope: ONLY `section.s_title.pt72.pb40 + section.s_three_columns`.
 * - Idempotent: a card that already has a `.sf-viz` stage is skipped.
 * - Website Builder safety: does nothing in edit mode, and removes its own
 *   injected nodes if edit mode starts later, so they are never saved into
 *   the page arch.
 * - Off-screen stages are paused (IntersectionObserver). Reduced-motion users
 *   get a static final-state scene (handled in CSS).
 */
(function () {
    'use strict';

    var TITLE_SECTION = 'section.s_title.pt72.pb40';
    var READY = 'sf-viz-ready';
    var counter = 0;

    function isEditing() {
        var b = document.body;
        return /[?&](enable_editor|edit_translations)=/.test(window.location.search) ||
            !!(b && b.classList.contains('editor_enable'));
    }

    // Same stops/direction as --sf-gradient-heading (90deg #4262AE, #64BEB5,
    // #53B973). The viewBox is cropped to the artwork (x 24-296, y 16-184), so
    // scenes render ~18% larger than the old 320x200 frame without any CSS
    // transform; the gradient still spans the full 0-320 ramp.
    function svg(id, body) {
        return '<svg class="sf-viz__svg" viewBox="24 16 272 168"preserveAspectRatio="xMidYMid meet" focusable="false" aria-hidden="true">' +
            '<defs><linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="320" y2="0">' +
            '<stop offset="0" class="sf-viz__stop-1"/>' +
            '<stop offset="0.5" class="sf-viz__stop-2"/>' +
            '<stop offset="1" class="sf-viz__stop-3"/>' +
            '</linearGradient></defs>' + body + '</svg>';
    }

    // Per-element offsets are added to the per-card stagger (--sf-d, in CSS).
    function delay(s) { return ' style="animation-delay:calc(var(--sf-d, 0s) + ' + s + 's)"'; }

    // 1. Instant Consensus Verification: sources -> converge -> verify -> result.
    function consensus(g) {
        var out = '<circle class="sf-viz__orbit" cx="186" cy="100" r="36"/>';
        [40, 80, 120, 160].forEach(function (y, i) {
            var d = 'M44 ' + y + ' C 110 ' + y + ', 116 100, 162 100';
            out += '<path class="sf-viz__track" d="' + d + '"/>' +
                '<path class="sf-viz__pulse sf-c-pulse" d="' + d + '" pathLength="100" stroke="' + g + '"' + delay(i * 0.2) + '/>' +
                '<circle class="sf-viz__node" cx="36" cy="' + y + '" r="7"/>' +
                '<circle class="sf-c-src" cx="36" cy="' + y + '" r="7" fill="' + g + '"' + delay(i * 0.15) + '/>';
        });
        // Result pill as a path so its border can be drawn (stroke resolves).
        var result = 'M260 86 H278 A14 14 0 0 1 278 114 H260 A14 14 0 0 1 260 86 Z';
        return out +
            '<circle class="sf-viz__node" cx="186" cy="100" r="24"/>' +
            '<circle class="sf-c-sync" cx="186" cy="100" r="24" stroke="' + g + '" transform="rotate(-90 186 100)"/>' +
            '<circle class="sf-c-core" cx="186" cy="100" r="15" fill="' + g + '"/>' +
            '<path class="sf-viz__mark sf-c-check" d="M179 100 l5 5 l9 -10" pathLength="100"/>' +
            '<path class="sf-viz__track" d="M210 100 L246 100"/>' +
            '<path class="sf-viz__draw sf-c-line" d="M210 100 L246 100" pathLength="100" stroke="' + g + '"/>' +
            '<path class="sf-viz__pulse sf-c-out" d="M210 100 L246 100" pathLength="100" stroke="' + g + '"/>' +
            '<path class="sf-viz__node" d="' + result + '"/>' +
            '<path class="sf-viz__draw sf-c-ring" d="' + result + '" pathLength="100" stroke="' + g + '"/>' +
            '<path class="sf-c-result" d="' + result + '" fill="' + g + '"/>' +
            '<path class="sf-viz__mark sf-c-rcheck" d="M262 100 l4 4 l9 -9" pathLength="100"/>';
    }

    // 2. Proactive Anomaly Detection: aligned lanes -> one item drifts off its
    // lane -> scanner reacts as it enters -> explicit elbow route draws -> item
    // follows the route into a separate isolation bay -> normal flow continues.
    function anomaly(g) {
        function item(y, d, x) {
            return '<rect class="sf-viz__item sf-a-flow" x="24" y="' + (y - 4) + '" width="16" height="8" rx="4"' +
                ' style="animation-delay:calc(var(--sf-d, 0s) + ' + d + 's);--sf-x:' + x + 'px"/>';
        }
        var route = 'M190 80 H206 V163 H226';
        return '<line class="sf-viz__track" x1="30" y1="52" x2="290" y2="52"/>' +
            '<line class="sf-viz__track" x1="30" y1="88" x2="290" y2="88"/>' +
            '<line class="sf-viz__track" x1="30" y1="124" x2="290" y2="124"/>' +
            '<rect class="sf-viz__frame" x="150" y="38" width="40" height="100" rx="10"/>' +
            '<rect class="sf-viz__hi sf-a-detect" x="150" y="38" width="40" height="100" rx="10" stroke="' + g + '"/>' +
            '<line class="sf-a-sweep" x1="154" y1="44" x2="154" y2="132" stroke="' + g + '"/>' +
            '<path class="sf-viz__track sf-viz__track--dash" d="' + route + '"/>' +
            '<path class="sf-viz__draw sf-a-link" d="' + route + '" pathLength="100" stroke="' + g + '"/>' +
            '<rect class="sf-viz__frame" x="226" y="150" width="64" height="26" rx="10"/>' +
            '<rect class="sf-viz__hi sf-a-bay" x="226" y="150" width="64" height="26" rx="10" stroke="' + g + '"/>' +
            item(52, 0, 16) + item(52, 2.3, 106) + item(52, 4.5, 206) +
            item(124, 1.1, 40) + item(124, 3.4, 120) + item(124, 5.6, 236) +
            item(88, 2.6, 56) +
            '<g class="sf-a-anom">' +
            '<rect class="sf-viz__item" x="24" y="84" width="16" height="8" rx="4"/>' +
            '<rect class="sf-a-flag" x="24" y="84" width="16" height="8" rx="4"/>' +
            '</g>';
    }

    // 3. Airtight Source Traceability: forward flow -> result -> trace back -> origin.
    function traceability(g) {
        var e = {
            e1: 'M43 48 C 80 48, 86 72, 117 72',
            e2: 'M43 100 C 80 100, 86 72, 117 72',
            e3: 'M43 100 C 80 100, 86 128, 117 128',
            e4: 'M43 152 C 80 152, 86 128, 117 128',
            e5: 'M131 72 C 166 72, 170 100, 201 100',
            e6: 'M131 128 C 166 128, 170 100, 201 100',
            e7: 'M215 100 L250 100'
        };
        var fwd = { e1: 0, e2: 0.1, e3: 0.2, e4: 0.3, e5: 0.9, e6: 1.0, e7: 1.8 };
        var out = '';
        Object.keys(e).forEach(function (k) {
            out += '<path class="sf-viz__track" d="' + e[k] + '"/>' +
                '<path class="sf-viz__pulse sf-t-fwd" d="' + e[k] + '" pathLength="100" stroke="' + g + '"' + delay(fwd[k]) + '/>';
        });
        // Backward lineage trail: result -> aggregator -> P1 -> source S2.
        out += '<path class="sf-viz__draw sf-t-b1" d="' + e.e7 + '" pathLength="100" stroke="' + g + '"/>' +
            '<path class="sf-viz__draw sf-t-b2" d="' + e.e5 + '" pathLength="100" stroke="' + g + '"/>' +
            '<path class="sf-viz__draw sf-t-b3" d="' + e.e2 + '" pathLength="100" stroke="' + g + '"/>';
        [[36, 48], [36, 100], [36, 152], [124, 72], [124, 128], [208, 100]].forEach(function (p) {
            out += '<circle class="sf-viz__node" cx="' + p[0] + '" cy="' + p[1] + '" r="7"/>';
        });
        return out +
            '<circle class="sf-viz__hi sf-t-n1" cx="208" cy="100" r="11" stroke="' + g + '"/>' +
            '<circle class="sf-viz__hi sf-t-n2" cx="124" cy="72" r="11" stroke="' + g + '"/>' +
            '<circle class="sf-viz__hi sf-t-n3" cx="36" cy="100" r="11" stroke="' + g + '"/>' +
            '<circle class="sf-t-origin" cx="36" cy="100" r="7" fill="' + g + '"/>' +
            '<circle class="sf-viz__hi sf-t-ripple" cx="36" cy="100" r="7" stroke="' + g + '"/>' +
            '<rect class="sf-viz__node" x="250" y="86" width="44" height="28" rx="14"/>' +
            '<rect class="sf-t-result" x="250" y="86" width="44" height="28" rx="14" fill="' + g + '"/>';
    }

    var SCENES = [
        { name: 'consensus', match: /consensus/i, build: consensus },
        { name: 'anomaly', match: /anomaly/i, build: anomaly },
        { name: 'trace', match: /traceab/i, build: traceability }
    ];

    function play(stages) {
        var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce || !('IntersectionObserver' in window)) {
            stages.forEach(function (s) { s.classList.add('is-playing'); });
            return;
        }
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) { en.target.classList.toggle('is-playing', en.isIntersecting); });
        }, { threshold: 0.25 });
        stages.forEach(function (s) { io.observe(s); });
    }

    // If the Website Builder starts after load, remove everything we injected
    // so it can never be saved into the database-stored page.
    function guardEditor(section) {
        if (!window.MutationObserver || !document.body) { return; }
        var mo = new MutationObserver(function () {
            if (document.body.classList.contains('editor_enable')) {
                Array.prototype.forEach.call(section.querySelectorAll('.sf-viz'), function (n) {
                    n.parentNode.removeChild(n);
                });
                section.classList.remove(READY);
                mo.disconnect();
            }
        });
        mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    function init() {
        if (isEditing()) { return; }
        var title = document.querySelector(TITLE_SECTION);
        var section = title && title.nextElementSibling;
        if (!section || !section.matches('section.s_three_columns')) { return; }
        var cards = section.querySelectorAll('.row > .col-lg-4 > .h-100');
        if (cards.length !== 3) { return; }

        var stages = [];
        Array.prototype.forEach.call(cards, function (card) {
            if (card.querySelector('.sf-viz')) { return; } // idempotent
            var heading = card.querySelector('h1, h2, h3');
            var text = heading ? heading.textContent : '';
            var scene = SCENES.filter(function (s) { return s.match.test(text); })[0];
            if (!scene) { return; }
            var id = 'sf-viz-g-' + (++counter);
            var stage = document.createElement('div');
            stage.className = 'sf-viz sf-viz--' + scene.name;
            stage.setAttribute('aria-hidden', 'true');
            stage.setAttribute('contenteditable', 'false');
            stage.innerHTML = svg(id, scene.build('url(#' + id + ')'));
            card.appendChild(stage);
            stages.push(stage);
        });
        if (!stages.length) { return; }
        section.classList.add(READY);
        play(stages);
        guardEditor(section);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
