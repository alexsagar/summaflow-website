/** @odoo-module ignore **/
/*
 * SummaFlow — /company page polish layer (NOT a redesign).
 *
 * One DB view (website.company, builder snippets, no per-section External ID).
 * Same established, editor-safe runtime-decoration pattern as platform.js /
 * solutions.js / security.js. The DB markup stays the source of truth; this
 * script only attaches .sf-company-* classes, clears the inline declarations
 * that beat the stylesheet (off-canon 135deg gradients, inline font-size/
 * weight, the builder divider HRs, the 75vh min-heights), retags the editorial
 * heading <p>s to <h2> and the 22px sub-labels to <h3>, maps the CTA onto the
 * approved black/white button, and relabels it to "Request a Free Trial".
 * No copy rewrite, no DB write, no numeric DB IDs.
 *
 * Sections (source order):
 *   1. Hero         section.s_discovery      single H1 + layered-line image
 *   2. Editorial    section.s_title_split    "Born from a Search…"
 *   3. Editorial    section.s_title_split    "The SummaFlow Breakthrough."
 *   4. Principles   section.s_key_benefits   "Core Engineering & Operating…" 3x2
 *   5. Editorial    section.s_title_split    "Global Hub & Regional Compliance."
 *   6. Editorial    section.s_title_split    "Enterprise Trust & Security."
 *   7. CTA          section.s_text_bold      "Ready to Bring Clarity…"
 *
 * Duplicate-CTA guard: the DB source holds exactly one CTA. If the live builder
 * holds a second (cloned) CTA band, only the first is decorated; any extra is
 * collapsed (.sf-company-dup) so one CTA — and therefore one footer start —
 * renders. True removal of a duplicated builder node needs a DB edit, which is
 * out of scope here; this is the safe render-level fix.
 *
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

    function isCompany() {
        if (/^\/company(\/|$|\?|#)/.test(window.location.pathname + window.location.search)) {
            return true;
        }
        var n = document.querySelector('section.s_discovery');
        return !!(n && (n.textContent || '').indexOf('Global Trade Operations') !== -1);
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
        each(root.querySelectorAll('p, div, br'), function (el) {
            if (el.tagName === 'BR') {
                if (el.parentElement && el.parentElement.childNodes.length === 1) { addClass(el, cls); }
                return;
            }
            if (isBlank(el)) { addClass(el, cls); }
        });
    }

    function gradientFonts(root) {
        each(root.querySelectorAll('font.text-gradient, font[style*="linear-gradient"]'), function (f) {
            clearInline(f, GRADIENT_PROPS);
            addClass(f, 'sf-text-gradient');
        });
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
                .replace(/Request\s+Free\s+Trial/i, 'Request a Free Trial')
                .replace(/Book\s+a\s+Demo/i, 'Request a Free Trial')
                .replace(/^[\s ]+/, '').replace(/[\s ]+$/, '');
            if (after === before) { continue; }
            node.nodeValue = after;
            (function (n, v) { undo.push(function () { n.nodeValue = v; }); })(node, before);
        }
    }

    // =====================================================================
    // 1. Hero
    // =====================================================================
    function decorateHero() {
        var s = document.querySelector('section.s_discovery');
        if (!s || text(s).indexOf('Global Trade Operations') === -1) { return; }
        if (s.hasAttribute(READY)) { return; }

        addClass(s, 'sf-company-hero');

        var h = s.querySelector('h1');
        if (h) {
            addClass(h, 'sf-company-hero__title');
            clearInline(h, ['font-weight']);
            gradientFonts(h);
        }

        // The builder's stacked-rectangle illustration is replaced by the
        // three product screenshots in the shared slider (shots.js). The image
        // node itself is NOT removed - only marked, so CSS hides it on the
        // public page and the undo log restores it for the Website Editor.
        var img = s.querySelector('img');
        if (img) { addClass(img, 'sf-company-hero__media'); }

        // The screenshot slider that replaces it, and the class that hides it,
        // are mounted by shots.js (own guard + own undo log) so the mount can
        // never depend on this file's position in the asset bundle.

        markVoids(s, 'sf-void');
        ready(s);
    }

    // =====================================================================
    // 2. Editorial two-column sections (4x s_title_split)
    // =====================================================================
    function decorateSplit(s) {
        if (!s || s.hasAttribute(READY)) { return; }
        addClass(s, 'sf-company-split');

        var cols = s.querySelectorAll('[class*="col-lg-"]');
        var head = cols[0], body = cols[1];

        if (head) {
            addClass(head, 'sf-company-split__head');
            // The heading is a <p><span class="h2-fs">…</span></p>; promote the
            // <p> to the section's H2 and drop its inline weight.
            var p = head.querySelector('p');
            if (p) {
                clearInline(p, ['font-weight']);
                gradientFonts(p);
                var h2 = retag(p, 'h2');
                addClass(h2, 'sf-company-split__title');
            }
        }

        if (body) {
            addClass(body, 'sf-company-split__body');
            each(body.querySelectorAll('p'), function (par) {
                if (isBlank(par)) { addClass(par, 'sf-void'); return; }
                // A lone 22px span is a sub-label → promote to <h3>.
                var span = par.querySelector('span[style*="font-size: 22px"]');
                if (span && par.children.length === 1) {
                    clearInline(span, ['font-size', 'font-weight']);
                    var h3 = retag(par, 'h3');
                    addClass(h3, 'sf-company-split__subhead');
                } else {
                    each(par.querySelectorAll('span[style]'), function (el) {
                        clearInline(el, ['font-size', 'font-weight']);
                    });
                }
            });
            markVoids(body, 'sf-void');
        }

        ready(s);
    }

    // =====================================================================
    // 4. Core Engineering & Operating Principles — 3x2 grid, dividers removed
    // =====================================================================
    function decoratePrinciples() {
        var s = document.querySelector('section.s_key_benefits');
        if (!s || text(s).indexOf('Core Engineering') === -1) { return; }
        if (s.hasAttribute(READY)) { return; }

        addClass(s, 'sf-company-principles');

        var h = s.querySelector('h2');
        if (h) {
            addClass(h, 'sf-company-principles__title');
            clearInline(h, ['font-weight', 'text-align']);
            each(h.querySelectorAll('span[style]'), function (el) {
                clearInline(el, ['font-size', 'font-weight']);
            });
        }

        var row = s.querySelector('.row');
        if (row) { addClass(row, 'sf-company-principles__grid'); }

        each(s.querySelectorAll('[class*="col-lg-4"]'), function (col) {
            addClass(col, 'sf-company-principle');

            var num = col.querySelector('span.display-3-fs') || col.querySelector('span');
            if (num) {
                addClass(num, 'sf-company-principle__num');
                removeClass(num, 'display-3-fs');
                gradientFonts(num);
            }

            // Remove the divider HR entirely (collapsed, not deleted).
            var hr = col.querySelector('.s_hr');
            if (hr) { addClass(hr, 'sf-void'); }

            var title = col.querySelector('h3');
            if (title) {
                addClass(title, 'sf-company-principle__title');
                clearInline(title, ['font-weight']);
                each(title.querySelectorAll('span[style]'), function (el) {
                    clearInline(el, ['font-size', 'font-weight']);
                });
            }

            each(col.querySelectorAll('p'), function (p) {
                if (isBlank(p)) { addClass(p, 'sf-void'); return; }
                addClass(p, 'sf-company-principle__text');
            });
        });

        markVoids(s, 'sf-void');
        ready(s);
    }

    // =====================================================================
    // 7. Final CTA band (+ duplicate guard)
    // =====================================================================
    function decorateCta() {
        var sections = document.querySelectorAll('section.s_text_bold');
        var first = null;
        each(sections, function (s) {
            if (text(s).indexOf('Ready to Bring Clarity') === -1) { return; }
            if (!first) { first = s; return; }
            // Any additional identical CTA band is a duplicate render — collapse.
            addClass(s, 'sf-company-dup');
        });

        var s = first;
        if (!s || s.hasAttribute(READY)) { return; }

        addClass(s, 'sf-company-cta');
        clearInline(s, ['background', 'background-color', 'background-image']);

        var h = s.querySelector('h2');
        if (h) { clearInline(h, ['font-weight']); }

        var btn = s.querySelector('a[href="/contactus"]') || s.querySelector('a');
        if (btn) {
            asButton(btn, 'primary');
            if (btn.parentElement) { addClass(btn.parentElement, 'sf-company-cta__actions'); }
        }

        each(s.querySelectorAll('p'), function (p) {
            if (p.querySelector('a')) { return; }
            if (isBlank(p)) { addClass(p, 'sf-void'); return; }
            addClass(p, 'sf-company-cta__copy');
        });
        markVoids(s, 'sf-void');
        ready(s);
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
        if (isEditing() || !isCompany()) { return; }
        decorateHero();
        each(document.querySelectorAll('section.s_title_split'), decorateSplit);
        decoratePrinciples();
        decorateCta();
        if (undo.length) { guardEditor(); }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
