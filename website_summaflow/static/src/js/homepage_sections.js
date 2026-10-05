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

    // Heroicons v2.2.0 (MIT, Tailwind Labs), 24x24 outline + solid pairs.
    // The official path data is transcribed verbatim from the published
    // package and embedded here: nothing is fetched, no CDN, no sprite file,
    // and no second icon library is mixed in. Earlier hand-drawn marks are
    // gone; this is the only icon implementation in the module.
    //
    // Each block renders both variants stacked in one wrapper. Outline shows
    // at rest, solid on hover — crossfaded with opacity, so neither variant
    // ever affects layout.
    var ICONS = {
        // Ephemeral In-Memory Scanning — cpu-chip.
        'cpu-chip': {
            outline: '<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z"/>',
            solid: '<path d="M16.5 7.5h-9v9h9v-9Z"/><path fill-rule="evenodd" d="M8.25 2.25A.75.75 0 0 1 9 3v.75h2.25V3a.75.75 0 0 1 1.5 0v.75H15V3a.75.75 0 0 1 1.5 0v.75h.75a3 3 0 0 1 3 3v.75H21A.75.75 0 0 1 21 9h-.75v2.25H21a.75.75 0 0 1 0 1.5h-.75V15H21a.75.75 0 0 1 0 1.5h-.75v.75a3 3 0 0 1-3 3h-.75V21a.75.75 0 0 1-1.5 0v-.75h-2.25V21a.75.75 0 0 1-1.5 0v-.75H9V21a.75.75 0 0 1-1.5 0v-.75h-.75a3 3 0 0 1-3-3v-.75H3A.75.75 0 0 1 3 15h.75v-2.25H3a.75.75 0 0 1 0-1.5h.75V9H3a.75.75 0 0 1 0-1.5h.75v-.75a3 3 0 0 1 3-3h.75V3a.75.75 0 0 1 .75-.75ZM6 6.75A.75.75 0 0 1 6.75 6h10.5a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75V6.75Z" clip-rule="evenodd"/>'
        },
        // Granular OAuth & 1-Click Revocation — key.
        key: {
            outline: '<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"/>',
            solid: '<path fill-rule="evenodd" d="M15.75 1.5a6.75 6.75 0 0 0-6.651 7.906c.067.39-.032.717-.221.906l-6.5 6.499a3 3 0 0 0-.878 2.121v2.818c0 .414.336.75.75.75H6a.75.75 0 0 0 .75-.75v-1.5h1.5A.75.75 0 0 0 9 19.5V18h1.5a.75.75 0 0 0 .53-.22l2.658-2.658c.19-.189.517-.288.906-.22A6.75 6.75 0 1 0 15.75 1.5Zm0 3a.75.75 0 0 0 0 1.5A2.25 2.25 0 0 1 18 8.25a.75.75 0 0 0 1.5 0 3.75 3.75 0 0 0-3.75-3.75Z" clip-rule="evenodd"/>'
        },
        // Absolute Traceability & Zero Hallucinations — link.
        link: {
            outline: '<path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"/>',
            solid: '<path fill-rule="evenodd" d="M19.902 4.098a3.75 3.75 0 0 0-5.304 0l-4.5 4.5a3.75 3.75 0 0 0 1.035 6.037.75.75 0 0 1-.646 1.353 5.25 5.25 0 0 1-1.449-8.45l4.5-4.5a5.25 5.25 0 1 1 7.424 7.424l-1.757 1.757a.75.75 0 1 1-1.06-1.06l1.757-1.757a3.75 3.75 0 0 0 0-5.304Zm-7.389 4.267a.75.75 0 0 1 1-.353 5.25 5.25 0 0 1 1.449 8.45l-4.5 4.5a5.25 5.25 0 1 1-7.424-7.424l1.757-1.757a.75.75 0 1 1 1.06 1.06l-1.757 1.757a3.75 3.75 0 1 0 5.304 5.304l4.5-4.5a3.75 3.75 0 0 0-1.035-6.037.75.75 0 0 1-.354-1Z" clip-rule="evenodd"/>'
        },
        // Privacy Scrubbing & PDPO Compliance — shield-check.
        'shield-check': {
            outline: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"/>',
            solid: '<path fill-rule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd"/>'
        }
    };

    var ICON_ORDER = ['cpu-chip', 'key', 'link', 'shield-check'];

    // Built through innerHTML on a throwaway host, exactly like
    // operations_roles_viz.js: the HTML parser puts <svg> in the SVG namespace,
    // so no namespace URL is needed anywhere in this module.
    function svgIcon(name) {
        var set = ICONS[name];
        var head = ' viewBox="0 0 24 24" focusable="false" aria-hidden="true">';
        var host = document.createElement('div');
        host.innerHTML = '<span class="sf-trust__mark">' +
            '<svg class="sf-trust__icon sf-trust__icon--outline" fill="none"' +
            ' stroke="currentColor" stroke-width="1.5"' + head + set.outline + '</svg>' +
            '<svg class="sf-trust__icon sf-trust__icon--solid" fill="currentColor"' +
            head + set.solid + '</svg>' +
            '</span>';
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

        // Two empty <h1> spacers the builder left inside the Challenge /
        // Solution cards. They carry no text, so they are not headings at all;
        // they become plain <div> and stay collapsed by CSS.
        each(document.querySelectorAll('h1'), function (el) {
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
