/** @odoo-module ignore **/
/*
 * SummaFlow — remaining homepage sections (polish layer, not a redesign):
 *
 *   1. "Ready to Eliminate Manual Trade Tracking?" gradient CTA band
 *   2. "Traditional Operational Workflow vs. SummaFlow Intelligence" table
 *   3. "Trust, Security & Control." four feature blocks
 *   4. "Integrates in minutes. Zero data-entry required." gradient CTA + FAQ
 *
 * Plain browser script (no imports, no dependencies, no network).
 *
 * WHY JS AND NOT A VIEW: all four live in standalone Website Builder snippet
 * views with no External ID, and website.homepage holds only an empty
 * `<div id="wrap" class="oe_structure oe_empty"/>`. There is no portable XPath
 * target and the numeric DB ids are not portable. Same pattern as hero.js and
 * challenge_solution.js.
 *
 * The DB markup stays the source of truth. This script only:
 *   - attaches stable .sf-* classes to the EXISTING elements
 *   - clears the inline declarations that would beat the stylesheet (three
 *     off-canon hard-coded gradients, the table's grey cell fills)
 *   - maps the CTA links onto the approved black/white button classes
 *   - marks the builder's empty spacer nodes so CSS can collapse them
 *   - swaps the four Trust icons for inline stroke SVGs (the one place where
 *     nodes are created, because the icon quality itself is the request)
 *
 * It rewrites no copy except one stray "." paragraph in the first Trust block,
 * and never writes to the database.
 *
 * - Idempotent: each section is guarded by data-sf-ready, and every mutation
 *   is itself re-runnable.
 * - Website Builder safety: does nothing in edit mode, and if edit mode starts
 *   later it reverts every mutation from an undo log, so the builder can never
 *   save SummaFlow classes, stripped inline styles or injected icons into the
 *   page arch.
 */
(function () {
    'use strict';

    var READY = 'data-sf-ready';

    function isEditing() {
        var b = document.body;
        return /[?&](enable_editor|edit_translations)=/.test(window.location.search) ||
            !!(b && b.classList.contains('editor_enable'));
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
        return (el.textContent || '').replace(/ /g, ' ');
    }

    function isBlank(el) {
        if (el.textContent.replace(/[\s ]/g, '')) { return false; }
        return !el.querySelector('img, svg, a, input, button, hr, table');
    }

    function each(list, fn) { Array.prototype.forEach.call(list, fn); }

    function ready(section) {
        section.setAttribute(READY, '1');
        undo.push(function () { section.removeAttribute(READY); });
    }

    // Mark (never remove) the builder's empty spacer nodes so CSS collapses
    // them and the vertical rhythm comes from the stylesheet.
    function markVoids(root, cls) {
        each(root.querySelectorAll('p, h1, h2, h3, div, br'), function (el) {
            if (el.tagName === 'BR') {
                // A <br> that is the only child of a heading/paragraph is a
                // builder line-break artefact, not content.
                if (el.parentElement && el.parentElement.childNodes.length === 1) {
                    addClass(el, cls);
                }
                return;
            }
            if (isBlank(el)) { addClass(el, cls); }
        });
    }

    // Map a builder CTA link onto the approved black/white button system, the
    // same way hero.js does: SummaFlow classes on, Odoo's .btn sizing off.
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
        // Label: the approved wording is "Request a Free Trial", and the
        // builder padded several labels with literal &nbsp; on both sides.
        // Text nodes are rewritten in place, so the inline <font>/<span>
        // wrapper, the href and the element identity all survive. Naturally
        // idempotent: after the first pass neither pattern matches.
        var walker = document.createTreeWalker(a, NodeFilter.SHOW_TEXT, null, false);
        var node;
        while ((node = walker.nextNode())) {
            var before = node.nodeValue;
            var after = before
                .replace(/Request\s+Free\s+Trial/, 'Request a Free Trial')
                .replace(/^[\s ]+/, '').replace(/[\s ]+$/, '');
            if (after === before) { continue; }
            node.nodeValue = after;
            (function (n, v) { undo.push(function () { n.nodeValue = v; }); })(node, before);
        }
    }

    // =====================================================================
    // 1. Gradient CTA band — "Ready to Eliminate Manual Trade Tracking?"
    // =====================================================================
    var CTA_HEAD = 'Ready to Eliminate Manual Trade Tracking';

    function decorateCtaBand() {
        var sections = document.querySelectorAll('section.s_text_bold');
        for (var i = 0; i < sections.length; i++) {
            var s = sections[i];
            if (text(s).indexOf(CTA_HEAD) === -1) { continue; }
            if (s.hasAttribute(READY)) { return; }

            addClass(s, 'sf-band');
            // The builder hard-codes the older 135deg gradient inline, and an
            // inline style beats any stylesheet rule. Cleared here; the
            // stylesheet repaints the canonical brand gradient.
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

    // =====================================================================
    // 2. Comparison table
    // =====================================================================
    var TABLE_HEAD = 'Traditional Operational Workflow vs.';
    var TABLE_ACCENT = 'SummaFlow Intelligence';

    function decorateTable() {
        var sections = document.querySelectorAll('section.s_text_block');
        for (var i = 0; i < sections.length; i++) {
            var s = sections[i];
            var t = text(s);
            if (t.indexOf(TABLE_HEAD) === -1 || t.indexOf(TABLE_ACCENT) === -1) { continue; }
            var table = s.querySelector('table');
            if (!table) { continue; }
            if (s.hasAttribute(READY)) { return; }

            addClass(s, 'sf-cmp');

            var h = s.querySelector('h2');
            if (h) { addClass(h, 'sf-cmp__title'); }
            // Accent carries an inline repeating-linear-gradient with
            // off-canon stops. Cleared, then handed to the shared utility.
            var accent = s.querySelector('.text-gradient');
            if (accent && text(accent).indexOf(TABLE_ACCENT) !== -1) {
                clearInline(accent, GRADIENT_PROPS);
                addClass(accent, 'sf-text-gradient');
                addClass(accent, 'sf-cmp__accent');
            }

            var wrap = s.querySelector('.table-responsive');
            if (wrap) { addClass(wrap, 'sf-cmp__scroll'); }
            addClass(table, 'sf-cmp__table');
            // Striping and the inline #f2f2f2 cell fills both fight the
            // stylesheet's row rhythm and the one emphasised column.
            removeClass(table, 'table-striped');
            removeClass(table, 'table-bordered');

            // Third cell of every row is the "With SummaFlow" column.
            each(table.querySelectorAll('tr'), function (tr) {
                addClass(tr, 'sf-cmp__row');
                clearInline(tr, ['height']);
                each(tr.children, function (cell, idx) {
                    clearInline(cell, ['background', 'background-color', 'vertical-align', 'text-align']);
                    addClass(cell, 'sf-cmp__cell');
                    if (idx === 0) { addClass(cell, 'sf-cmp__cell--label'); }
                    if (idx === 2) { addClass(cell, 'sf-cmp__cell--sf'); }
                    // The ✓ and the emphasised lead-in carry inline font-size.
                    each(cell.querySelectorAll('[style]'), function (el) {
                        clearInline(el, ['font-size']);
                    });
                });
            });
            ready(s);
            return;
        }
    }

    // =====================================================================
    // 3. "Trust, Security & Control." — four feature blocks
    // =====================================================================
    var TRUST_HEAD = 'Trust, Security';

    // Fill-on-hover line icons, 24x24, 1.5 stroke, drawn for this module and
    // matched to each block's heading. ONE svg per icon (no outline/solid
    // crossfade): every icon has closed "body" shapes (.sf-ico__b) that fill
    // with the brand blue on hover, and inner details (.sf-ico__d) that flip to
    // white so they stay legible on the fill. Elements outside the body (pins,
    // handles) carry no class and stay stroked. Nothing fetched, no CDN.
    var ICONS = {
        // Ephemeral In-Memory Scanning — memory chip with a scan line.
        'memory-scan': '<path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>' +
            '<rect class="sf-ico__b" x="6" y="6" width="12" height="12" rx="2"/>' +
            '<path class="sf-ico__d" d="M9 12h6M9 9.5h2M13 14.5h2"/>',
        // Granular OAuth & 1-Click Revocation — key.
        'oauth-key': '<path d="M10.9 12.1 19.5 3.5M16.5 6.5l2.5 2.5M14 9l2 2"/>' +
            '<circle class="sf-ico__b" cx="7.75" cy="15.25" r="4.75"/>' +
            '<circle class="sf-ico__d" cx="7.75" cy="15.25" r="1.25"/>',
        // Absolute Traceability & Zero Hallucinations — verified source document.
        'source-check': '<path class="sf-ico__b" d="M6 2.75h8.25L19 7.5V20a1.25 1.25 0 0 1-1.25 1.25H6A1.25 1.25 0 0 1 4.75 20V4A1.25 1.25 0 0 1 6 2.75Z"/>' +
            '<path class="sf-ico__d" d="M14 2.75V7.5h5M8 9.5h4M8.5 15l2 2 4-4.5"/>',
        // Privacy Scrubbing & PDPO Compliance — shield with check.
        'shield-check': '<path class="sf-ico__b" d="M12 2.75 4.75 5.6v5.65c0 4.55 3.05 8.45 7.25 9.75 4.2-1.3 7.25-5.2 7.25-9.75V5.6Z"/>' +
            '<path class="sf-ico__d" d="m9 12 2 2 4-4.25"/>'
    };

    var ICON_ORDER = ['memory-scan', 'oauth-key', 'source-check', 'shield-check'];

    // Built through innerHTML on a throwaway host, exactly like
    // operations_roles_viz.js: the HTML parser puts <svg> in the SVG namespace,
    // so no namespace URL is needed anywhere in this module. Static markup
    // only — no page or user content is interpolated.
    function svgIcon(name) {
        var host = document.createElement('div');
        host.innerHTML = '<span class="sf-trust__mark">' +
            '<svg class="sf-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
            ' stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"' +
            ' focusable="false" aria-hidden="true">' + (ICONS[name] || ICONS['shield-check']) +
            '</svg></span>';
        return host.firstChild;
    }

    function decorateTrust() {
        var sections = document.querySelectorAll('section.s_features');
        for (var i = 0; i < sections.length; i++) {
            var s = sections[i];
            if (text(s).indexOf(TRUST_HEAD) === -1) { continue; }
            if (s.hasAttribute(READY)) { return; }

            addClass(s, 'sf-trust');

            var h = s.querySelector('h2');
            if (h) {
                addClass(h, 'sf-trust__title');
                var span = h.querySelector('span[style]');
                if (span) {
                    clearInline(span, GRADIENT_PROPS);
                    addClass(span, 'sf-text-gradient');
                }
            }

            var row = s.querySelector('.row');
            if (row) { addClass(row, 'sf-trust__grid'); }

            each(s.querySelectorAll('.col-lg-3'), function (col, idx) {
                addClass(col, 'sf-trust__item');

                // The builder's per-column <hr> separators: kept in the arch,
                // collapsed by CSS, replaced by one rule in the stylesheet.
                var sep = col.querySelector('.s_hr');
                if (sep) { addClass(sep, 'sf-void'); }

                var icon = col.querySelector('i.s_features_icon');
                if (icon) {
                    // Filled chip + rounded corners are the "fake" treatment
                    // the icons had to lose.
                    removeClass(icon, 'bg-o-color-3');
                    removeClass(icon, 'text-o-color-5');
                    removeClass(icon, 'rounded');
                    removeClass(icon, 'mb-3');
                    addClass(icon, 'sf-void');
                    var name = ICON_ORDER[idx] || 'shield-check';
                    if (!col.querySelector('.sf-trust__mark')) {
                        var mark = svgIcon(name);
                        icon.parentNode.insertBefore(mark, icon);
                        undo.push(function () {
                            if (mark.parentNode) { mark.parentNode.removeChild(mark); }
                        });
                    }
                }

                var title = col.querySelector('h1, h2, h3');
                if (title) {
                    addClass(title, 'sf-trust__item-title');
                    each(title.querySelectorAll('[style]'), function (el) {
                        clearInline(el, ['font-size', 'font-weight']);
                    });
                }

                each(col.querySelectorAll('p'), function (p) {
                    // Stray "." paragraph the builder left under the first
                    // card. Marked void, not deleted: no DB content is lost.
                    if (text(p).replace(/[\s.]/g, '') === '') {
                        addClass(p, 'sf-void');
                        return;
                    }
                    addClass(p, 'sf-trust__item-text');
                });
            });
            ready(s);
            return;
        }
    }

    // =====================================================================
    // 4. Gradient CTA + FAQ accordion
    // =====================================================================
    var FAQ_HEAD = 'Integrates in minutes';

    function decorateFaq() {
        var sections = document.querySelectorAll('section.s_call_to_action');
        for (var i = 0; i < sections.length; i++) {
            var s = sections[i];
            if (text(s).indexOf(FAQ_HEAD) === -1) { continue; }
            if (s.hasAttribute(READY)) { return; }

            addClass(s, 'sf-faq');
            clearInline(s, ['background', 'background-image', 'background-color']);

            var row = s.querySelector('.row');
            if (row) { addClass(row, 'sf-faq__grid'); }

            var main = s.querySelector('.col-lg-9');
            if (main) { addClass(main, 'sf-faq__main'); }
            var aside = s.querySelector('.col-lg-3');
            if (aside) { addClass(aside, 'sf-faq__aside'); }

            var h = s.querySelector('h2');
            if (h) {
                addClass(h, 'sf-faq__title');
                clearInline(h, ['font-weight']);
            }

            var acc = s.querySelector('.s_accordion');
            if (acc) { addClass(acc, 'sf-faq__accordion'); }

            each(s.querySelectorAll('.accordion-item'), function (it) {
                addClass(it, 'sf-faq__item');
            });
            each(s.querySelectorAll('.accordion-button'), function (btn) {
                addClass(btn, 'sf-faq__question');
                each(btn.querySelectorAll('[style]'), function (el) {
                    clearInline(el, ['font-size']);
                });
            });
            each(s.querySelectorAll('.accordion-body'), function (body) {
                addClass(body, 'sf-faq__answer');
            });

            var cta = aside ? aside.querySelector('a') : s.querySelector('.col-lg-3 a');
            if (cta) {
                asButton(cta, 'primary');
                var p = cta.closest ? cta.closest('p') : cta.parentElement;
                if (p) {
                    addClass(p, 'sf-faq__actions');
                    clearInline(p, ['text-align']);
                }
            }

            // Empty lead paragraph between heading and accordion.
            each(s.querySelectorAll('p.lead'), function (p) {
                if (isBlank(p)) { addClass(p, 'sf-void'); }
            });
            ready(s);
            return;
        }
    }

    // =====================================================================
    // 5. Heading semantics
    // =====================================================================
    // The builder's homepage carries ELEVEN <h1> elements: the hero headline
    // plus every card title and two empty spacer headings. Only the hero is a
    // real page heading. This pass rewrites the tag and nothing else — same
    // classes, same inline styles, same children, same text — so the visual
    // result is identical while the document outline becomes
    // H1 > H2 (sections) > H3 (cards).
    //
    // It runs last, after every other SummaFlow script has decorated the page,
    // because those scripts query for the original tags (`h2`, `h1.h3`). The
    // manifest bundles this file after them for exactly that reason.
    var HEADINGS_READY = 'data-sf-headings';

    // Swaps an element's tag, preserving attributes and moving the children
    // across by reference. The undo swaps them straight back, so the builder
    // can still only ever save the untouched database arch.
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

    function fixHeadings() {
        if (document.documentElement.hasAttribute(HEADINGS_READY)) { return; }

        // Card titles -> H3. Selected by the SummaFlow classes the other
        // scripts attached, plus the Operations Role cards, which are scoped
        // by their own unique title section exactly as their stylesheet is.
        var cards = [];
        each(document.querySelectorAll('.sf-cs__title, .sf-trust__item-title'), function (el) {
            cards.push(el);
        });
        each(document.querySelectorAll(
            'section.s_title.pt72.pb40 + section.s_three_columns .col-lg-4 h1.h3'
        ), function (el) { cards.push(el); });

        var converted = 0;
        cards.forEach(function (el) {
            var level = parseInt(el.tagName.slice(1), 10);
            if (!(level === 1 || level === 2)) { return; }
            retag(el, 'h3');
            converted++;
        });

        // "Turn scattered trade conversations into / Auditable Project
        // Control." is ONE heading that the builder stores as two sibling
        // <h2>. The second becomes a block <span> inside the first: same
        // classes, same inline style, same children, still its own line
        // (_challenge-solution.scss), one semantic H2.
        var lines = document.querySelectorAll('.sf-cs-head h2.sf-cs-head__line');
        if (lines.length === 2 && lines[0].parentNode === lines[1].parentNode) {
            var first = lines[0];
            var line = retag(lines[1], 'span');
            var home = line.parentNode;
            var after = line.nextSibling;
            // Keeps the two halves apart in the heading's text; collapses
            // visually before the block span.
            var gap = document.createTextNode(' ');
            first.appendChild(gap);
            first.appendChild(line);
            undo.push(function () {
                if (gap.parentNode) { gap.parentNode.removeChild(gap); }
                home.insertBefore(line, after);
            });
            converted++;
        }

        // Empty spacer headings the builder left behind (every stray <h1>,
        // plus any card heading that still has no text). They carry no text,
        // so they are not headings at all; they become plain <div> and stay
        // collapsed by CSS.
        each(document.querySelectorAll(
            'h1, .sf-cs h2, .sf-cs h3, .sf-trust h3, ' +
            'section.s_title.pt72.pb40 + section.s_three_columns h3'
        ), function (el) {
            if (el.closest('.sf-hero')) { return; }  // the one real page H1
            if (el.textContent.replace(/[\s ]/g, '')) { return; }
            retag(el, 'div');
            converted++;
        });

        if (!converted) { return; }
        document.documentElement.setAttribute(HEADINGS_READY, '1');
        undo.push(function () {
            document.documentElement.removeAttribute(HEADINGS_READY);
        });
    }

    // If the Website Editor starts after decoration, undo everything so the
    // builder can only ever save the untouched database arch. One observer on
    // body's class attribute, disconnected as soon as it fires.
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
        if (isEditing()) { return; }
        decorateCtaBand();
        decorateTable();
        decorateTrust();
        decorateFaq();
        fixHeadings();
        if (undo.length) { guardEditor(); }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
