/** @odoo-module ignore **/
/*
 * SummaFlow — /platform page polish layer (NOT a redesign).
 *
 * Sections decorated here:
 *   1. Hero            section.s_numbers_list   "Practical AI Layer"
 *   2. CTA band #1     section.s_text_bold      "Built for teams that cannot…"
 *   3. Audience cards  section.s_three_columns  "Sourcing and Procurement…"
 *   4. Key Advantages  section.s_features       "Key Advantages for Teams"
 *   5. Trust heading   section.s_title          "Trust, Security & Control"
 *   6. Security doc    section.s_table_of_content "Security & Data Governance…"
 *
 * The final "Ready to Eliminate Manual Trade Tracking?" gradient band is a
 * section.s_text_bold already matched and styled by homepage_sections.js
 * (which loads on every page), so it is intentionally NOT touched here — doing
 * so would double-decorate it.
 *
 * WHY JS AND NOT A VIEW: /platform is a single DB-owned website.page
 * (website.platform) built from Website Builder snippets with no portable
 * External ID and no stable XPath target; the numeric DB ids are not portable.
 * Same established, editor-safe pattern as hero.js / homepage_sections.js.
 *
 * The DB markup stays the source of truth. This script only:
 *   - attaches stable .sf-* classes to EXISTING elements
 *   - clears the inline declarations that beat the stylesheet (off-canon
 *     hard-coded gradients, card border/background fills, builder font-sizes)
 *   - maps CTA links onto the approved black/white button classes and relabels
 *     "Book a Demo" / "Request Free Trial" to the approved "Request a Free Trial"
 *   - marks the builder's empty spacer nodes and <hr> separators so CSS
 *     collapses them (whitespace-driven rhythm, no divider lines)
 *   - swaps the six generic Key-Advantages icon chips for inline Heroicons
 *   - retags headings so the page outline is one H1 > H2 > H3
 *
 * It rewrites no marketing/security/legal copy. It never writes to the DB.
 * Idempotent (data-sf-ready guard + re-runnable mutations); reverts every
 * mutation from an undo log the moment the Website Editor starts.
 */
(function () {
    'use strict';

    var READY = 'data-sf-ready';

    function isEditing() {
        var b = document.body;
        return /[?&](enable_editor|edit_translations)=/.test(window.location.search) ||
            !!(b && b.classList.contains('editor_enable'));
    }

    // Only act on the Platform page. website.platform renders the hero
    // s_numbers_list with the unique "Practical AI Layer" phrase; bail on any
    // other page so nothing site-wide is ever touched.
    function isPlatform() {
        if (/^\/platform(\/|$|\?|#)/.test(window.location.pathname + window.location.search)) {
            return true;
        }
        var n = document.querySelector('section.s_numbers_list');
        return !!(n && (n.textContent || '').indexOf('Practical AI Layer') !== -1);
    }

    // --- undo log ---------------------------------------------------------
    var undo = [];

    function addClass(el, name) {
        if (!el || el.classList.contains(name)) { return; }
        el.classList.add(name);
        undo.push(function () { el.classList.remove(name); });
    }

    function removeClass(el, name) {
        if (!el || !el.classList.contains(name)) { return; }
        el.classList.remove(name);
        undo.push(function () { el.classList.add(name); });
    }

    function clearInline(el, props) {
        if (!el || !el.style) { return; }
        var before = el.getAttribute('style');
        var touched = false;
        props.forEach(function (p) {
            if (el.style.getPropertyValue(p)) {
                el.style.removeProperty(p);
                touched = true;
            }
        });
        if (!touched) { return; }
        undo.push(function () {
            if (before === null) { el.removeAttribute('style'); }
            else { el.setAttribute('style', before); }
        });
    }

    var GRADIENT_PROPS = [
        'background', 'background-image', 'background-color', 'background-clip',
        '-webkit-background-clip', 'color', '-webkit-text-fill-color'
    ];

    function text(el) {
        return (el.textContent || '').replace(/ /g, ' ');
    }

    function isBlank(el) {
        if (el.textContent.replace(/[\s ]/g, '')) { return false; }
        return !el.querySelector('img, svg, a, input, button, hr, table');
    }

    function each(list, fn) { Array.prototype.forEach.call(list, fn); }

    function ready(section) {
        section.setAttribute(READY, '1');
        undo.push(function () { section.removeAttribute(READY); });
    }

    function markVoids(root, cls) {
        each(root.querySelectorAll('p, h1, h2, h3, div, br, .s_hr'), function (el) {
            if (el.classList && el.classList.contains('s_hr')) { addClass(el, cls); return; }
            if (el.tagName === 'BR') {
                if (el.parentElement && el.parentElement.childNodes.length === 1) {
                    addClass(el, cls);
                }
                return;
            }
            if (isBlank(el)) { addClass(el, cls); }
        });
    }

    // Map a builder CTA onto the approved black/white button system and relabel
    // it to the approved wording. The href is never touched (stays /contactus).
    function asButton(a, variant) {
        if (!a) { return; }
        addClass(a, 'sf-button');
        addClass(a, 'sf-button--' + variant);
        removeClass(a, 'btn');
        removeClass(a, 'btn-primary');
        removeClass(a, 'btn-secondary');
        clearInline(a, ['color', 'background', 'background-color', 'border-color']);
        each(a.querySelectorAll('[style]'), function (el) {
            clearInline(el, ['color', 'font-size', 'font-weight', 'background']);
        });
        var walker = document.createTreeWalker(a, NodeFilter.SHOW_TEXT, null, false);
        var node;
        while ((node = walker.nextNode())) {
            var before = node.nodeValue;
            var after = before
                .replace(/Book\s+a\s+Demo/i, 'Request a Free Trial')
                .replace(/Request\s+Free\s+Trial/, 'Request a Free Trial')
                .replace(/^[\s ]+/, '').replace(/[\s ]+$/, '');
            if (after === before) { continue; }
            node.nodeValue = after;
            (function (n, v) { undo.push(function () { n.nodeValue = v; }); })(node, before);
        }
    }

    // Swap an element's tag, preserving attributes/children. Undo swaps back.
    function retag(el, tag) {
        if (!el || el.tagName.toLowerCase() === tag) { return el; }
        var next = document.createElement(tag);
        each(el.attributes, function (a) { next.setAttribute(a.name, a.value); });
        while (el.firstChild) { next.appendChild(el.firstChild); }
        var parent = el.parentNode;
        if (!parent) { return el; }
        parent.replaceChild(next, el);
        undo.push(function () {
            while (next.firstChild) { el.appendChild(next.firstChild); }
            if (next.parentNode) { next.parentNode.replaceChild(el, next); }
        });
        return next;
    }

    // Heroicons v2.2.0 (MIT, Tailwind Labs), 24x24 outline + solid pairs — the
    // SAME family, construction method and outline/solid crossfade as the
    // homepage Trust/Security icons (homepage_sections.js svgIcon). Path data is
    // transcribed verbatim from the published package: nothing is fetched, no
    // CDN, no sprite, no second icon library. The cpu-chip / link / shield-check
    // pairs are the exact strings already vetted on the homepage. Each block
    // renders both variants stacked in one wrapper; outline at rest, solid on
    // hover, crossfaded with opacity so neither variant ever affects layout.
    var ADV_ICONS = {
        // Zero Manual Data Entry — cpu-chip.
        'cpu-chip': {
            outline: '<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z"/>',
            solid: '<path d="M16.5 7.5h-9v9h9v-9Z"/><path fill-rule="evenodd" d="M8.25 2.25A.75.75 0 0 1 9 3v.75h2.25V3a.75.75 0 0 1 1.5 0v.75H15V3a.75.75 0 0 1 1.5 0v.75h.75a3 3 0 0 1 3 3v.75H21A.75.75 0 0 1 21 9h-.75v2.25H21a.75.75 0 0 1 0 1.5h-.75V15H21a.75.75 0 0 1 0 1.5h-.75v.75a3 3 0 0 1-3 3h-.75V21a.75.75 0 0 1-1.5 0v-.75h-2.25V21a.75.75 0 0 1-1.5 0v-.75H9V21a.75.75 0 0 1-1.5 0v-.75h-.75a3 3 0 0 1-3-3v-.75H3A.75.75 0 0 1 3 15h.75v-2.25H3a.75.75 0 0 1 0-1.5h.75V9H3a.75.75 0 0 1 0-1.5h.75v-.75a3 3 0 0 1 3-3h.75V3a.75.75 0 0 1 .75-.75ZM6 6.75A.75.75 0 0 1 6.75 6h10.5a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75V6.75Z" clip-rule="evenodd"/>'
        },
        // 100% Traceable — link.
        link: {
            outline: '<path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"/>',
            solid: '<path fill-rule="evenodd" d="M19.902 4.098a3.75 3.75 0 0 0-5.304 0l-4.5 4.5a3.75 3.75 0 0 0 1.035 6.037.75.75 0 0 1-.646 1.353 5.25 5.25 0 0 1-1.449-8.45l4.5-4.5a5.25 5.25 0 1 1 7.424 7.424l-1.757 1.757a.75.75 0 1 1-1.06-1.06l1.757-1.757a3.75 3.75 0 0 0 0-5.304Zm-7.389 4.267a.75.75 0 0 1 1-.353 5.25 5.25 0 0 1 1.449 8.45l-4.5 4.5a5.25 5.25 0 1 1-7.424-7.424l1.757-1.757a.75.75 0 1 1 1.06 1.06l-1.757 1.757a3.75 3.75 0 1 0 5.304 5.304l4.5-4.5a3.75 3.75 0 0 0-1.035-6.037.75.75 0 0 1-.354-1Z" clip-rule="evenodd"/>'
        },
        // Privacy First — shield-check.
        'shield-check': {
            outline: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"/>',
            solid: '<path fill-rule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd"/>'
        },
        // Clear Action Items — check-circle.
        'check-circle': {
            outline: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>',
            solid: '<path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd"/>'
        },
        // Instant Negotiation Trends — arrow-trending-up.
        'arrow-trending-up': {
            outline: '<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"/>',
            solid: '<path fill-rule="evenodd" d="M15.22 6.268a.75.75 0 0 1 .968-.432l5.942 2.28a.75.75 0 0 1 .431.97l-2.28 5.941a.75.75 0 1 1-1.4-.537l1.63-4.251-1.086.483a11.2 11.2 0 0 0-5.45 5.173.75.75 0 0 1-1.199.19L9 12.312l-6.22 6.22a.75.75 0 0 1-1.06-1.061l6.75-6.75a.75.75 0 0 1 1.06 0l3.606 3.605a12.694 12.694 0 0 1 5.68-4.973l1.086-.484-4.251-1.631a.75.75 0 0 1-.432-.97Z" clip-rule="evenodd"/>'
        },
        // Seamless Team Onboarding — user-group.
        'user-group': {
            outline: '<path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"/>',
            solid: '<path fill-rule="evenodd" d="M8.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 19.125a6.375 6.375 0 0 1 12.75 0 .75.75 0 0 1-.366.643 11.957 11.957 0 0 1-6.009 1.61c-2.163 0-4.185-.573-5.939-1.575a.75.75 0 0 1-.436-.678ZM19.5 19.125c0 .613-.076 1.21-.219 1.78a.75.75 0 0 0 .935.805 11.963 11.963 0 0 0 2.5-1.134.75.75 0 0 0 .316-.945 4.502 4.502 0 0 0-5.74-2.59 7.829 7.829 0 0 1 1.208 2.084Z" clip-rule="evenodd"/>'
        }
    };

    var ADV_ORDER = ['cpu-chip', 'link', 'shield-check', 'check-circle', 'arrow-trending-up', 'user-group'];

    // Same construction method as homepage_sections.js svgIcon: innerHTML on a
    // throwaway host so the parser places <svg> in the SVG namespace.
    function advIcon(name) {
        var set = ADV_ICONS[name] || ADV_ICONS['check-circle'];
        var head = ' viewBox="0 0 24 24" focusable="false" aria-hidden="true">';
        var host = document.createElement('div');
        host.innerHTML = '<span class="sf-adv__mark">' +
            '<svg class="sf-adv__icon sf-adv__icon--outline" fill="none"' +
            ' stroke="currentColor" stroke-width="1.5"' + head + set.outline + '</svg>' +
            '<svg class="sf-adv__icon sf-adv__icon--solid" fill="currentColor"' +
            head + set.solid + '</svg>' +
            '</span>';
        return host.firstChild;
    }

    // =====================================================================
    // 1. Hero
    // =====================================================================
    function decorateHero() {
        var s = document.querySelector('section.s_numbers_list');
        if (!s || text(s).indexOf('Practical AI Layer') === -1) { return; }
        if (s.hasAttribute(READY)) { return; }

        addClass(s, 'sf-pf-hero');

        var lead = s.querySelector('.col-lg-5');
        if (lead) { addClass(lead, 'sf-pf-hero__lead'); }

        // Headline: the page's only H1. Retag h2 -> h1 (appearance preserved
        // by CSS), clear the builder's inline weight.
        var h = s.querySelector('h2');
        if (h) {
            each(h.querySelectorAll('[style]'), function (el) {
                clearInline(el, ['font-size', 'font-weight']);
            });
            clearInline(h, ['font-weight']);
            h = retag(h, 'h1');
            addClass(h, 'sf-pf-hero__title');
            // The highlighted phrase keeps the canonical gradient only.
            var grad = h.querySelector('.text-gradient');
            if (grad) {
                clearInline(grad, GRADIENT_PROPS);
                addClass(grad, 'sf-text-gradient');
            }

            // Force two lines: "A Practical AI Layer for" / "operations heavy
            // teams." A presentational <br> is inserted before "operations"
            // (no copy change). Idempotent + reverted via the undo log.
            if (!h.querySelector('br.sf-pf-hero__break')) {
                var tw = document.createTreeWalker(h, NodeFilter.SHOW_TEXT, null, false);
                var tn;
                while ((tn = tw.nextNode())) {
                    var idx = tn.nodeValue.indexOf('operations heavy teams');
                    if (idx <= 0) { continue; }
                    (function (node) {
                        var before = node.nodeValue;
                        var rest = document.createTextNode(before.slice(idx));
                        var br = document.createElement('br');
                        br.className = 'sf-pf-hero__break';
                        node.nodeValue = before.slice(0, idx); // "... for "
                        node.parentNode.insertBefore(br, node.nextSibling);
                        node.parentNode.insertBefore(rest, br.nextSibling);
                        undo.push(function () {
                            node.nodeValue = before;
                            if (br.parentNode) { br.parentNode.removeChild(br); }
                            if (rest.parentNode) { rest.parentNode.removeChild(rest); }
                        });
                    })(tn);
                    break;
                }
            }
        }

        each(s.querySelectorAll('.col-lg-5 p'), function (p) {
            if (isBlank(p)) { return; }
            if (p.querySelector('a')) { addClass(p, 'sf-pf-hero__actions'); }
            else { addClass(p, 'sf-pf-hero__copy'); }
        });

        asButton(s.querySelector('.col-lg-5 a'), 'primary');

        // Benefits: the two builder columns become a clean 2 x 3 list. Drop the
        // <hr> dividers (collapsed by CSS), normalise the inline 22px spans.
        each(s.querySelectorAll('.col-lg-3'), function (col) {
            addClass(col, 'sf-pf-hero__benefits');
            each(col.querySelectorAll('p'), function (p) {
                if (isBlank(p)) { addClass(p, 'sf-void'); return; }
                addClass(p, 'sf-pf-hero__benefit');
                each(p.querySelectorAll('[style]'), function (el) {
                    clearInline(el, ['font-size']);
                });
            });
            // The builder's per-benefit separators are KEPT here (requested
            // layout): styled as thin rules, not collapsed.
            each(col.querySelectorAll('.s_hr'), function (sep) {
                addClass(sep, 'sf-pf-hero__rule');
            });
        });

        // Collapse only the LEAD column's builder spacer nodes; the benefit
        // columns keep their separators as visible rules above.
        if (lead) { markVoids(lead, 'sf-void'); }
        ready(s);
    }

    // =====================================================================
    // 2. CTA band #1 — "Built for teams that cannot afford to miss one update."
    // =====================================================================
    function decorateBand1() {
        var sections = document.querySelectorAll('section.s_text_bold');
        for (var i = 0; i < sections.length; i++) {
            var s = sections[i];
            if (text(s).indexOf('Built for teams that cannot afford') === -1) { continue; }
            if (s.hasAttribute(READY)) { return; }

            addClass(s, 'sf-band');
            addClass(s, 'sf-pf-band');
            clearInline(s, ['background', 'background-image', 'background-color']);

            var box = s.querySelector('.container');
            if (box) { addClass(box, 'sf-band__inner'); }

            var h = s.querySelector('h2');
            if (h) {
                addClass(h, 'sf-band__title');
                clearInline(h, ['font-weight']);
            }

            each(s.querySelectorAll('p'), function (p) {
                if (isBlank(p)) { return; }
                if (p.querySelector('a')) { addClass(p, 'sf-band__actions'); }
                else { addClass(p, 'sf-band__lead'); }
            });

            asButton(s.querySelector('a'), 'primary');
            markVoids(box || s, 'sf-void');
            ready(s);
            return;
        }
    }

    // The final "Ready to Eliminate…" band is decorated (sf-band) by
    // homepage_sections.js. Only add the platform height-fix marker so its
    // o_three_quarter_height 75vh is neutralised too — no other mutation, so no
    // double-decoration.
    function tagFinalBand() {
        var sections = document.querySelectorAll('section.s_text_bold');
        for (var i = 0; i < sections.length; i++) {
            var s = sections[i];
            if (text(s).indexOf('Ready to Eliminate') === -1) { continue; }
            addClass(s, 'sf-pf-band');
            return;
        }
    }

    // =====================================================================
    // 3. Audience cards — "Sourcing and Procurement Agents" etc.
    // =====================================================================
    function decorateAudience() {
        var sections = document.querySelectorAll('section.s_three_columns');
        for (var i = 0; i < sections.length; i++) {
            var s = sections[i];
            if (text(s).indexOf('Sourcing and Procurement') === -1) { continue; }
            if (s.hasAttribute(READY)) { return; }

            addClass(s, 'sf-aud');
            var row = s.querySelector('.row');
            if (row) { addClass(row, 'sf-aud__grid'); }

            each(s.querySelectorAll('.col-lg-4'), function (col) {
                addClass(col, 'sf-aud__col');
                var card = col.querySelector('.h-100');
                if (card) {
                    addClass(card, 'sf-aud__card');
                    // Clear the builder's hard-coded 1px #d9d9d9 border / #fff
                    // fill; the stylesheet owns the card surface.
                    clearInline(card, ['border', 'background', 'background-color']);
                }
                // Card title: retag h1 -> h3 so only the hero keeps an H1.
                var title = col.querySelector('h1, h2');
                if (title) {
                    each(title.querySelectorAll('[style]'), function (el) {
                        clearInline(el, ['font-size', 'font-weight']);
                    });
                    title = retag(title, 'h3');
                    addClass(title, 'sf-aud__title');
                }
                each(col.querySelectorAll('p'), function (p) {
                    if (isBlank(p)) { addClass(p, 'sf-void'); return; }
                    addClass(p, 'sf-aud__text');
                    clearInline(p, ['text-align']);
                });
                markVoids(col, 'sf-void');
            });
            ready(s);
            return;
        }
    }

    // =====================================================================
    // 4. Key Advantages — "Key Advantages for Teams."
    // =====================================================================
    function decorateAdvantages() {
        var sections = document.querySelectorAll('section.s_features');
        for (var i = 0; i < sections.length; i++) {
            var s = sections[i];
            if (text(s).indexOf('Key') === -1 || text(s).indexOf('Advantages for Teams') === -1) { continue; }
            if (s.hasAttribute(READY)) { return; }

            addClass(s, 'sf-adv');

            var h = s.querySelector('h2');
            if (h) {
                addClass(h, 'sf-adv__title');
                clearInline(h, ['font-weight']);
                // Accent phrase "Advantages" carries an off-canon inline
                // gradient; clear it and hand it the canonical token.
                var accent = h.querySelector('.text-gradient');
                if (accent) {
                    clearInline(accent, GRADIENT_PROPS);
                    addClass(accent, 'sf-text-gradient');
                }
                each(h.querySelectorAll('span[style]'), function (el) {
                    clearInline(el, ['font-size']);
                });
            }

            var row = s.querySelector('.row');
            if (row) { addClass(row, 'sf-adv__grid'); }

            each(s.querySelectorAll('.col-lg-4'), function (col, idx) {
                addClass(col, 'sf-adv__item');

                // Divider lines gone: the per-item <hr> is collapsed by CSS.
                var sep = col.querySelector('.s_hr');
                if (sep) { addClass(sep, 'sf-void'); }

                var icon = col.querySelector('i.s_features_icon');
                if (icon) {
                    removeClass(icon, 'bg-o-color-3');
                    removeClass(icon, 'text-o-color-5');
                    removeClass(icon, 'rounded');
                    removeClass(icon, 'mb-3');
                    addClass(icon, 'sf-void');
                    if (!col.querySelector('.sf-adv__mark')) {
                        var mark = advIcon(ADV_ORDER[idx] || 'check-circle');
                        icon.parentNode.insertBefore(mark, icon);
                        undo.push(function () {
                            if (mark.parentNode) { mark.parentNode.removeChild(mark); }
                        });
                    }
                }

                var body = col.querySelector('.overflow-hidden') || col;
                var ps = body.querySelectorAll('p');
                each(ps, function (p, pIdx) {
                    if (isBlank(p)) { addClass(p, 'sf-void'); return; }
                    // First non-blank paragraph is the title; retag -> H3.
                    if (!col.querySelector('.sf-adv__item-title') && pIdx === 0) {
                        each(p.querySelectorAll('[style]'), function (el) {
                            clearInline(el, ['font-size', 'font-weight']);
                        });
                        var t = retag(p, 'h3');
                        addClass(t, 'sf-adv__item-title');
                    } else {
                        addClass(p, 'sf-adv__item-text');
                    }
                });
                markVoids(col, 'sf-void');
            });
            ready(s);
            return;
        }
    }

    // =====================================================================
    // 5. Trust heading — "Trust, Security & Control."
    // =====================================================================
    function decorateTrustTitle() {
        var sections = document.querySelectorAll('section.s_title');
        for (var i = 0; i < sections.length; i++) {
            var s = sections[i];
            if (text(s).indexOf('Trust, Security') === -1) { continue; }
            if (s.hasAttribute(READY)) { return; }

            addClass(s, 'sf-sec-title');
            var h = s.querySelector('h2');
            if (h) {
                addClass(h, 'sf-sec-title__h');
                clearInline(h, ['font-weight']);
                var accent = h.querySelector('.text-gradient') ||
                    (h.classList.contains('text-gradient') ? h : null);
                if (accent) {
                    clearInline(accent, GRADIENT_PROPS);
                    addClass(accent, 'sf-text-gradient');
                }
            }
            ready(s);
            return;
        }
    }

    // =====================================================================
    // 6. Security & Data Governance — documentation two-column layout
    // =====================================================================
    function decorateSecurity() {
        var sections = document.querySelectorAll('section.s_table_of_content');
        for (var i = 0; i < sections.length; i++) {
            var s = sections[i];
            if (text(s).indexOf('Security') === -1 ||
                text(s).indexOf('Data Governance Infrastructure') === -1) { continue; }
            if (s.hasAttribute(READY)) { return; }

            addClass(s, 'sf-sec');

            var row = s.querySelector('.row');
            if (row) { addClass(row, 'sf-sec__row'); }

            var nav = s.querySelector('.s_table_of_content_navbar_wrap');
            if (nav) { addClass(nav, 'sf-sec__nav'); }
            var navList = s.querySelector('.s_table_of_content_navbar');
            if (navList) {
                addClass(navList, 'sf-sec__nav-list');
                // The builder pins it with inline top/max-height; clear so the
                // stylesheet owns the sticky offset below the global navbar.
                clearInline(navList, ['top', 'max-height']);
            }

            var main = s.querySelector('.s_table_of_content_main');
            if (main) { addClass(main, 'sf-sec__main'); }

            // Each topic: retag its heading h2 -> h3, drop the <hr> divider,
            // class the body paragraphs. Content/wording untouched.
            each(s.querySelectorAll('.s_text_block'), function (blk) {
                addClass(blk, 'sf-sec__block');
                var sep = blk.querySelector('.s_hr');
                if (sep) { addClass(sep, 'sf-void'); }
                var hh = blk.querySelector('h1, h2');
                if (hh) {
                    each(hh.querySelectorAll('[style]'), function (el) {
                        clearInline(el, ['font-size', 'font-weight']);
                    });
                    clearInline(hh, ['font-weight']);
                    var t = retag(hh, 'h3');
                    addClass(t, 'sf-sec__head');
                }
                each(blk.querySelectorAll('p'), function (p) {
                    if (isBlank(p)) { addClass(p, 'sf-void'); return; }
                    addClass(p, 'sf-sec__text');
                });
                markVoids(blk, 'sf-void');
            });
            ready(s);
            return;
        }
    }

    function init() {
        if (isEditing() || !isPlatform()) { return; }
        decorateHero();
        decorateBand1();
        tagFinalBand();
        decorateAudience();
        decorateAdvantages();
        decorateTrustTitle();
        decorateSecurity();
        if (undo.length) { guardEditor(); }
    }

    // Revert everything if the Website Editor starts, so the builder can only
    // ever save the untouched database arch.
    function guardEditor() {
        if (!window.MutationObserver || !document.body) { return; }
        var mo = new MutationObserver(function () {
            if (!document.body.classList.contains('editor_enable')) { return; }
            mo.disconnect();
            while (undo.length) { undo.pop()(); }
        });
        mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
