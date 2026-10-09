/** @odoo-module ignore **/
/*
 * SummaFlow — /security page polish layer (NOT a redesign).
 *
 * One DB view (website.security, builder snippets, no per-section External ID).
 * Same established, editor-safe runtime-decoration pattern as platform.js /
 * solutions.js. The DB markup stays the source of truth; this script only
 * attaches .sf-sec-* classes, clears the inline declarations that beat the
 * stylesheet (off-canon hero/CTA gradients, inline font-size/weight, the
 * builder TOC top/max-height), retags the hero heading to the page's single
 * H1, maps the CTA onto the approved black/white button and relabels it to
 * "Request a Free Trial". No copy rewrite, no DB write, no numeric DB IDs.
 *
 * Sections (source order):
 *   1. Hero        section.s_title_split        "Governance Infrastructure"
 *   2. Doc band    section.s_table_of_content   TOC (col-lg-3) + article (col-lg-9)
 *        6x        section.s_text_block         numbered security topics (H2)
 *   3. CTA         section.s_text_bold          "Ready to Eliminate Manual…"
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

    function isSecurity() {
        if (/^\/security(\/|$|\?|#)/.test(window.location.pathname + window.location.search)) {
            return true;
        }
        var n = document.querySelector('section.s_title_split');
        return !!(n && (n.textContent || '').indexOf('Governance Infrastructure') !== -1);
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
        var s = document.querySelector('section.s_title_split');
        if (!s || text(s).indexOf('Governance Infrastructure') === -1) { return; }
        if (s.hasAttribute(READY)) { return; }

        addClass(s, 'sf-sec-hero');

        var cols = s.querySelectorAll('[class*="col-lg-"]');
        if (cols[0]) { addClass(cols[0], 'sf-sec-hero__lead'); }
        if (cols[1]) { addClass(cols[1], 'sf-sec-hero__intro'); }

        // The lone H2 title becomes the page's single H1.
        var title = retag(s.querySelector('h2'), 'h1');
        if (title) {
            addClass(title, 'sf-sec-hero__title');
            clearInline(title, ['font-weight']);
            each(title.querySelectorAll('span[style]'), function (el) {
                clearInline(el, ['font-size', 'font-weight']);
            });
            each(title.querySelectorAll('font.text-gradient'), function (f) {
                clearInline(f, GRADIENT_PROPS);
                addClass(f, 'sf-text-gradient');
            });
        }

        if (cols[0]) { markVoids(cols[0], 'sf-void'); }
        if (cols[1]) { markVoids(cols[1], 'sf-void'); }
        ready(s);
    }

    // =====================================================================
    // 2. Documentation band: TOC + six topic sections
    // =====================================================================
    function decorateDoc() {
        var s = document.querySelector('section.s_table_of_content');
        if (!s || s.hasAttribute(READY)) { return; }

        addClass(s, 'sf-sec-doc');

        var toc = s.querySelector('.s_table_of_content_navbar_wrap');
        if (toc) {
            addClass(toc, 'sf-sec-toc');
            // Show the TOC at every width (builder hid it below lg); position
            // is owned by the stylesheet (static < lg, sticky >= lg).
            removeClass(toc, 'd-none');
            removeClass(toc, 'd-lg-block');
            var inner = toc.querySelector('.s_table_of_content_navbar');
            // Drop the builder's inline sticky top / viewport max-height; the
            // stylesheet sticks the whole block below the 62px header instead.
            if (inner) { clearInline(inner, ['top', 'max-height']); }
        }

        var main = s.querySelector('.s_table_of_content_main');
        if (main) { addClass(main, 'sf-sec-main'); }

        each(s.querySelectorAll('section.s_text_block'), function (topic) {
            addClass(topic, 'sf-sec-topic');

            var h = topic.querySelector('h2');
            if (h) {
                addClass(h, 'sf-sec-topic__title');
                clearInline(h, ['font-weight']);
                each(h.querySelectorAll('span[style]'), function (el) {
                    clearInline(el, ['font-size', 'font-weight']);
                });
            }

            var hr = topic.querySelector('.s_hr');
            if (hr) { addClass(hr, 'sf-sec-topic__hr'); }

            each(topic.querySelectorAll('p'), function (p) {
                if (isBlank(p)) { addClass(p, 'sf-void'); return; }
                addClass(p, 'sf-sec-topic__text');
            });
            markVoids(topic, 'sf-void');
        });

        ready(s);
    }

    // =====================================================================
    // 3. Final CTA band
    // =====================================================================
    function decorateCta() {
        var s = document.querySelector('section.s_text_bold');
        if (!s || text(s).indexOf('Ready to Eliminate') === -1) { return; }
        if (s.hasAttribute(READY)) { return; }

        addClass(s, 'sf-sec-cta');
        // Replace the inline off-canon gradient with the canonical brand token.
        clearInline(s, ['background', 'background-color', 'background-image']);

        var btn = s.querySelector('a[href="/contactus"]') || s.querySelector('a');
        if (btn) {
            asButton(btn, 'primary');
            if (btn.parentElement) { addClass(btn.parentElement, 'sf-sec-cta__actions'); }
        }

        each(s.querySelectorAll('p'), function (p) {
            if (p.querySelector('a')) { return; } // the actions <p>
            if (isBlank(p)) { addClass(p, 'sf-void'); return; }
            addClass(p, 'sf-sec-cta__copy');
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
        if (isEditing() || !isSecurity()) { return; }
        decorateHero();
        decorateDoc();
        decorateCta();
        if (undo.length) { guardEditor(); }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
