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

    // Fill-on-hover line icons — the SAME construction as the homepage Trust
    // icons (homepage_sections.js svgIcon): 24x24, 1.5 stroke, ONE svg per icon.
    // Closed "body" shapes (.sf-ico__b) fill with the brand blue on hover; inner
    // details (.sf-ico__d) flip to white so they stay legible; unclassed parts
    // outside the body stay stroked. Each icon is matched to its heading.
    // Static markup only, nothing fetched, no CDN.
    var ADV_ICONS = {
        // Zero Manual Data Entry — automation bolt.
        'auto-bolt': '<path class="sf-ico__b" d="M13.25 2.75 5.5 13.25H11l-1 8 8.5-11H13Z"/>',
        // 100% Traceable — source-to-summary trace route.
        'trace-route': '<path d="M8.25 18h7.25a3.25 3.25 0 0 0 0-6.5h-7a3.25 3.25 0 0 1 0-6.5h7.25"/>' +
            '<circle class="sf-ico__b" cx="5.75" cy="18" r="2.5"/>' +
            '<circle class="sf-ico__b" cx="18.25" cy="5" r="2.5"/>',
        // Privacy First — padlock.
        'privacy-lock': '<path d="M8 10.5V7.75a4 4 0 0 1 8 0v2.75"/>' +
            '<rect class="sf-ico__b" x="4.75" y="10.5" width="14.5" height="10.75" rx="2"/>' +
            '<path class="sf-ico__d" d="M12 14.5v2.75"/>',
        // Clear Action Items — checklist clipboard.
        'action-list': '<rect class="sf-ico__b" x="4.75" y="4.5" width="14.5" height="16.75" rx="1.75"/>' +
            '<rect class="sf-ico__b" x="8.75" y="2.75" width="6.5" height="3.5" rx="1"/>' +
            '<path class="sf-ico__d" d="m8 11.5 1.5 1.5 2.5-3M14 12h2.5M8 16.75h8.5"/>',
        // Instant Negotiation Trends — rising bar chart.
        'trend-bars': '<path d="M3 20.75h18"/>' +
            '<rect class="sf-ico__b" x="4.75" y="13" width="3.5" height="7.75" rx=".75"/>' +
            '<rect class="sf-ico__b" x="10.25" y="9" width="3.5" height="11.75" rx=".75"/>' +
            '<rect class="sf-ico__b" x="15.75" y="4.75" width="3.5" height="16" rx=".75"/>',
        // Seamless Team Onboarding — team.
        'team': '<circle class="sf-ico__b" cx="9" cy="8" r="3.25"/>' +
            '<circle class="sf-ico__b" cx="16.75" cy="9.25" r="2.5"/>' +
            '<path class="sf-ico__b" d="M3.25 20.25a5.75 5.75 0 0 1 11.5 0Z"/>' +
            '<path class="sf-ico__b" d="M16.75 20.25h4a4.25 4.25 0 0 0-6.3-3.72 7.2 7.2 0 0 1 2.3 3.72Z"/>'
    };

    var ADV_ORDER = ['auto-bolt', 'trace-route', 'privacy-lock', 'action-list', 'trend-bars', 'team'];

    // Same construction method as homepage_sections.js svgIcon: innerHTML on a
    // throwaway host so the parser places <svg> in the SVG namespace.
    function advIcon(name) {
        var host = document.createElement('div');
        host.innerHTML = '<span class="sf-adv__mark">' +
            '<svg class="sf-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
            ' stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"' +
            ' focusable="false" aria-hidden="true">' + (ADV_ICONS[name] || ADV_ICONS['action-list']) +
            '</svg></span>';
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

            // The product screenshot slider inside this band is mounted by
            // shots.js, which owns its own guard and undo log: this band is
            // also matched by homepage_sections.js, which sets data-sf-ready
            // first, so anything added after the READY check here would never
            // run.

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
                        var mark = advIcon(ADV_ORDER[idx] || 'action-list');
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
