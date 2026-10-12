/** @odoo-module ignore **/
/*
 * SummaFlow — /solutions page polish layer (NOT a redesign).
 *
 * Sections (all in one DB view, website.solutions-style builder snippets, no
 * per-section External ID — same established, editor-safe runtime-decoration
 * pattern as platform.js):
 *
 *   1. Hero            section.s_banner            "High-Velocity Trade Operations"
 *   2. Daily Pain      section.s_features          "The Daily Operational Pain"
 *   3. Transform title section.s_title             "How SummaFlow Transforms"
 *   4. Transform cards section.s_three_columns     "Automated Data Capture"
 *   5. Key Metrics     section.s_numbers_showcase  "Key Metrics Impacted"
 *
 * The final "Integrates in minutes…" gradient FAQ/CTA band (section
 * .s_call_to_action) is already decorated (sf-faq) by homepage_sections.js,
 * which loads on every page, so it is intentionally NOT touched here.
 *
 * The DB markup stays the source of truth. This script only attaches .sf-*
 * classes, clears the inline declarations that beat the stylesheet (off-canon
 * gradients, card border/background fills, builder grid-area/padding), maps the
 * CTA onto the approved button and relabels it to "Request a Free Trial", swaps
 * the four Daily-Pain icon chips for Heroicons outline+solid, and retags
 * headings so the outline is one H1 > H2 > H3. No copy rewrite, no DB write.
 * Idempotent; reverts from an undo log the moment the Website Editor starts.
 */
(function () {
    'use strict';

    var READY = 'data-sf-ready';

    function isEditing() {
        var b = document.body;
        return /[?&](enable_editor|edit_translations)=/.test(window.location.search) ||
            !!(b && b.classList.contains('editor_enable'));
    }

    function isSolutions() {
        if (/^\/solutions(\/|$|\?|#)/.test(window.location.pathname + window.location.search)) {
            return true;
        }
        var n = document.querySelector('section.s_banner');
        return !!(n && (n.textContent || '').indexOf('High-Velocity Trade Operations') !== -1);
    }

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
            if (el.style.getPropertyValue(p)) { el.style.removeProperty(p); touched = true; }
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

    function text(el) { return (el.textContent || '').replace(/ /g, ' '); }

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
        each(root.querySelectorAll('p, h1, h2, h3, h4, div, br, .s_hr'), function (el) {
            if (el.classList && el.classList.contains('s_hr')) { addClass(el, cls); return; }
            if (el.tagName === 'BR') {
                if (el.parentElement && el.parentElement.childNodes.length === 1) { addClass(el, cls); }
                return;
            }
            if (isBlank(el)) { addClass(el, cls); }
        });
    }

    function asButton(a, variant) {
        if (!a) { return; }
        addClass(a, 'sf-button');
        addClass(a, 'sf-button--' + variant);
        removeClass(a, 'btn');
        removeClass(a, 'btn-primary');
        removeClass(a, 'btn-secondary');
        removeClass(a, 'me-2');
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

    // Heroicons v2.2.0 (MIT, Tailwind Labs), 24x24 outline + solid — SAME family
    // and crossfade system as the homepage Trust / Platform Key-Advantages icons.
    var PAIN_ICONS = {
        // The Inbox Chaos — inbox.
        inbox: {
            outline: '<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z"/>',
            solid: '<path fill-rule="evenodd" d="M5.49 3.75A2.25 2.25 0 0 0 3.41 5.173l-1.03 6.18A2.25 2.25 0 0 0 2.25 12v.75h6.198c.277 0 .543.11.74.308l1.252 1.253c.197.198.463.308.74.308h1.64c.277 0 .543-.11.74-.308l1.253-1.253a1.048 1.048 0 0 1 .74-.308H21.75V12c0-.148-.015-.293-.043-.436l-1.029-6.181A2.25 2.25 0 0 0 18.51 3.75H5.49ZM21.75 14.25h-6.198a1.05 1.05 0 0 0-.74.308l-1.253 1.252a1.05 1.05 0 0 1-.74.308h-1.64a1.05 1.05 0 0 1-.74-.308l-1.252-1.252a1.05 1.05 0 0 0-.74-.308H2.25v4.5A2.25 2.25 0 0 0 4.5 21h15a2.25 2.25 0 0 0 2.25-2.25v-4.5Z" clip-rule="evenodd"/>'
        },
        // Unnoticed Project Shifts — exclamation-triangle.
        'exclamation-triangle': {
            outline: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>',
            solid: '<path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd"/>'
        },
        // Manual Data Entry Burnout — document-text.
        'document-text': {
            outline: '<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/>',
            solid: '<path fill-rule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clip-rule="evenodd"/><path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z"/>'
        },
        // Blind Spot Risk — eye-slash.
        'eye-slash': {
            outline: '<path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"/>',
            solid: '<path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 1 0 1.06-1.06l-18-18ZM22.676 12.553a11.249 11.249 0 0 1-2.631 4.31l-3.099-3.099a5.25 5.25 0 0 0-6.71-6.71L7.759 4.577a11.217 11.217 0 0 1 4.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113Z"/><path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0 1 15.75 12ZM12.53 15.713l-4.243-4.244a3.75 3.75 0 0 0 4.244 4.243Z"/><path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 0 0-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 0 1 6.75 12Z"/>'
        }
    };

    var PAIN_ORDER = ['inbox', 'exclamation-triangle', 'document-text', 'eye-slash'];

    function painIcon(name) {
        var set = PAIN_ICONS[name] || PAIN_ICONS.inbox;
        var head = ' viewBox="0 0 24 24" focusable="false" aria-hidden="true">';
        var host = document.createElement('div');
        host.innerHTML = '<span class="sf-sol-icon">' +
            '<svg class="sf-sol-icon__svg sf-sol-icon__svg--outline" fill="none"' +
            ' stroke="currentColor" stroke-width="1.5"' + head + set.outline + '</svg>' +
            '<svg class="sf-sol-icon__svg sf-sol-icon__svg--solid" fill="currentColor"' +
            head + set.solid + '</svg></span>';
        return host.firstChild;
    }

    function markSec(s) { addClass(s, 'sf-sol-sec'); }

    // =====================================================================
    // 1. Hero
    // =====================================================================
    function decorateHero() {
        var s = document.querySelector('section.s_banner');
        if (!s || text(s).indexOf('High-Velocity Trade Operations') === -1) { return; }
        if (s.hasAttribute(READY)) { return; }

        addClass(s, 'sf-sol-hero'); markSec(s);

        var cols = s.querySelectorAll('.col-lg-6');
        var lead = cols[0], media = cols[1];
        if (lead) { addClass(lead, 'sf-sol-hero__lead'); }
        if (media) { addClass(media, 'sf-sol-hero__media'); }

        var h = s.querySelector('h1');
        if (h) {
            addClass(h, 'sf-sol-hero__title');
            clearInline(h, ['font-weight']);
            var span = h.querySelector('span[style]');
            if (span) {
                clearInline(span, GRADIENT_PROPS);
                addClass(span, 'sf-text-gradient');
            }
        }

        each(s.querySelectorAll('.col-lg-6 p'), function (p) {
            if (isBlank(p)) { addClass(p, 'sf-void'); return; }
            addClass(p, 'sf-sol-hero__copy');
            each(p.querySelectorAll('[style]'), function (el) { clearInline(el, ['font-size']); });
        });

        var actWrap = s.querySelector('.pt16');
        if (actWrap) { addClass(actWrap, 'sf-sol-hero__actions'); }
        asButton(s.querySelector('a[href="/contactus"]') || s.querySelector('a'), 'primary');

        if (lead) { markVoids(lead, 'sf-void'); }
        ready(s);
    }

    // =====================================================================
    // 2. Daily Operational Pain
    // =====================================================================
    function decoratePain() {
        var sections = document.querySelectorAll('section.s_features');
        for (var i = 0; i < sections.length; i++) {
            var s = sections[i];
            if (text(s).indexOf('Daily Operational Pain') === -1) { continue; }
            if (s.hasAttribute(READY)) { return; }

            addClass(s, 'sf-sol-pain'); markSec(s);

            var h = s.querySelector('h2');
            if (h) { addClass(h, 'sf-sol-pain__title'); clearInline(h, ['font-weight']); }

            var row = s.querySelector('.row');
            if (row) { addClass(row, 'sf-sol-pain__grid'); }

            each(s.querySelectorAll('.col-lg-3'), function (col, idx) {
                addClass(col, 'sf-sol-pain__item');

                var icon = col.querySelector('i.s_features_icon');
                if (icon) {
                    removeClass(icon, 'bg-o-color-3');
                    removeClass(icon, 'rounded');
                    removeClass(icon, 'mb-3');
                    addClass(icon, 'sf-void');
                    if (!col.querySelector('.sf-sol-icon')) {
                        var mark = painIcon(PAIN_ORDER[idx] || 'inbox');
                        icon.parentNode.insertBefore(mark, icon);
                        undo.push(function () {
                            if (mark.parentNode) { mark.parentNode.removeChild(mark); }
                        });
                    }
                }

                var title = col.querySelector('h1, h2, h3');
                if (title) {
                    each(title.querySelectorAll('[style]'), function (el) {
                        clearInline(el, ['font-size', 'font-weight']);
                    });
                    clearInline(title, ['font-weight']);
                    title = retag(title, 'h3');
                    addClass(title, 'sf-sol-pain__item-title');
                }
                each(col.querySelectorAll('p'), function (p) {
                    if (isBlank(p)) { addClass(p, 'sf-void'); return; }
                    addClass(p, 'sf-sol-pain__item-text');
                });
                markVoids(col, 'sf-void');
            });
            ready(s);
            return;
        }
    }

    // =====================================================================
    // 3. Transform section title
    // =====================================================================
    function decorateTransformTitle() {
        var sections = document.querySelectorAll('section.s_title');
        for (var i = 0; i < sections.length; i++) {
            var s = sections[i];
            if (text(s).indexOf('How SummaFlow Transforms') === -1) { continue; }
            if (s.hasAttribute(READY)) { return; }

            addClass(s, 'sf-sol-sectitle'); markSec(s);
            var h = s.querySelector('h2');
            if (h) {
                addClass(h, 'sf-sol-sectitle__h');
                clearInline(h, ['font-weight']);
                var accent = h.querySelector('.text-gradient');
                if (accent) { clearInline(accent, GRADIENT_PROPS); addClass(accent, 'sf-text-gradient'); }
            }
            ready(s);
            return;
        }
    }

    // =====================================================================
    // 4. Transformation cards
    // =====================================================================
    function decorateTransformCards() {
        var sections = document.querySelectorAll('section.s_three_columns');
        for (var i = 0; i < sections.length; i++) {
            var s = sections[i];
            if (text(s).indexOf('Automated Data Capture') === -1) { continue; }
            if (s.hasAttribute(READY)) { return; }

            addClass(s, 'sf-sol-grid'); markSec(s);
            var row = s.querySelector('.row');
            if (row) { addClass(row, 'sf-sol-grid__row'); }

            each(s.querySelectorAll('.col-lg-4'), function (col) {
                addClass(col, 'sf-sol-grid__col');
                var card = col.querySelector('.h-100');
                if (card) {
                    addClass(card, 'sf-sol-grid__card');
                    clearInline(card, ['border', 'background', 'background-color']);
                }
                var title = col.querySelector('h1, h2');
                if (title) {
                    each(title.querySelectorAll('[style]'), function (el) {
                        clearInline(el, ['font-size', 'font-weight']);
                    });
                    clearInline(title, ['font-weight']);
                    title = retag(title, 'h3');
                    addClass(title, 'sf-sol-grid__title');
                }
                each(col.querySelectorAll('p'), function (p) {
                    if (isBlank(p)) { addClass(p, 'sf-void'); return; }
                    addClass(p, 'sf-sol-grid__text');
                    clearInline(p, ['text-align']);
                });
                markVoids(col, 'sf-void');
            });
            ready(s);
            return;
        }
    }

    // =====================================================================
    // 5. Key Metrics Impacted
    // =====================================================================
    function decorateMetrics() {
        var sections = document.querySelectorAll('section.s_numbers_showcase');
        for (var i = 0; i < sections.length; i++) {
            var s = sections[i];
            if (text(s).indexOf('Key Metrics Impacted') === -1) { continue; }
            if (s.hasAttribute(READY)) { return; }

            addClass(s, 'sf-sol-metrics'); markSec(s);

            var row = s.querySelector('.row');
            if (row) {
                addClass(row, 'sf-sol-metrics__row');
                // Builder lays this out with an inline 24px gap + o_grid_mode
                // (12-col grid). Drop both so the stylesheet's clean 3-col grid
                // owns placement; otherwise the g-height-* spans overlap.
                clearInline(row, ['gap']);
                removeClass(row, 'o_grid_mode');
            }

            each(s.querySelectorAll('.o_grid_item'), function (item) {
                // Drop the builder's grid-area placement, per-item padding and the
                // one isolated gradient background box.
                clearInline(item, [
                    'grid-area', '--grid-item-padding-y', '--grid-item-padding-x',
                    'z-index', 'background', 'background-color', 'background-image'
                ]);
                // Remove the g-col-*/g-height-* span classes that forced items
                // onto overlapping grid rows.
                Array.prototype.slice.call(item.classList).forEach(function (cn) {
                    if (/^g-(col|height)/.test(cn)) { removeClass(item, cn); }
                });
                removeClass(item, 'o_cc');
                removeClass(item, 'o_cc1');
                removeClass(item, 'o_cc3');
                removeClass(item, 'o_cc5');

                if (item.querySelector('h2')) {
                    addClass(item, 'sf-sol-metrics__intro');
                    var h2 = item.querySelector('h2');
                    addClass(h2, 'sf-sol-metrics__heading');
                    clearInline(h2, ['font-weight']);
                    each(item.querySelectorAll('p'), function (p) {
                        if (isBlank(p)) { addClass(p, 'sf-void'); return; }
                        addClass(p, 'sf-sol-metrics__intro-copy');
                    });
                } else {
                    addClass(item, 'sf-sol-metrics__item');
                    var num = item.querySelector('h3');
                    if (num) {
                        addClass(num, 'sf-sol-metrics__num');
                        var gfont = num.querySelector('.text-gradient');
                        if (gfont) {
                            clearInline(gfont, GRADIENT_PROPS);
                            addClass(gfont, 'sf-text-gradient');
                        } else {
                            addClass(num, 'sf-text-gradient');
                        }
                    }
                    var label = item.querySelector('h4');
                    if (label) {
                        addClass(label, 'sf-sol-metrics__label');
                        clearInline(label, ['font-weight']);
                        each(label.querySelectorAll('[style]'), function (el) {
                            clearInline(el, ['font-size']);
                        });
                    }
                    each(item.querySelectorAll('p'), function (p) {
                        if (isBlank(p)) { addClass(p, 'sf-void'); return; }
                        addClass(p, 'sf-sol-metrics__note');
                    });
                }
                markVoids(item, 'sf-void');
            });
            ready(s);
            return;
        }
    }

    function guardEditor() {
        if (!window.MutationObserver || !document.body) { return; }
        var mo = new MutationObserver(function () {
            if (!document.body.classList.contains('editor_enable')) { return; }
            mo.disconnect();
            while (undo.length) { undo.pop()(); }
        });
        mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    function init() {
        if (isEditing() || !isSolutions()) { return; }
        decorateHero();
        decoratePain();
        decorateTransformTitle();
        decorateTransformCards();
        decorateMetrics();
        if (undo.length) { guardEditor(); }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
