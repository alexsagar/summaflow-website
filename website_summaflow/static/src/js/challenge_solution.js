/** @odoo-module ignore **/
/*
 * SummaFlow — "Turn scattered trade conversations into Auditable Project
 * Control." heading + Challenge / Solution cards.
 *
 * Plain browser script (no imports, no dependencies, no network).
 *
 * WHY JS AND NOT A VIEW: like the hero, this content lives in standalone
 * Website Builder snippet views with no External ID, and website.homepage
 * holds only an empty `<div id="wrap" class="oe_structure oe_empty"/>`. There
 * is no portable XPath target, and the numeric DB ids are not portable, so
 * nothing is referenced here. Same safe pattern as hero.js.
 *
 * The DB markup stays the source of truth. This script only:
 *   - attaches stable .sf-cs* classes to the EXISTING elements
 *   - clears the specific inline declarations that would beat the stylesheet
 *     (the two old hard-coded brand gradients, and the one inconsistent label
 *     font-weight)
 *   - marks the builder's empty spacer nodes so CSS can collapse them
 *
 * It creates nothing, removes nothing, rewrites no text, and never writes to
 * the database.
 *
 * - Scope: ONE verified heading section plus the two-card section that
 *   directly follows it (see find). Never every .s_three_columns - the
 *   Operations Role cards use that same snippet class and must stay untouched.
 * - Idempotent: guarded by the data-sf-cs-ready attribute, and every mutation
 *   is itself re-runnable.
 * - Website Builder safety: does nothing in edit mode, and if edit mode starts
 *   later it reverts every mutation from an undo log, so the builder can never
 *   save SummaFlow classes or stripped inline styles into the page arch.
 */
(function () {
    'use strict';

    var READY = 'data-sf-cs-ready';
    var HEAD_LINE = 'Turn scattered trade conversations into';
    var HEAD_ACCENT = 'Auditable Project Control';

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

    function text(el) {
        return (el.textContent || '').replace(/ /g, ' ');
    }

    // --- identification ---------------------------------------------------
    // Section context and card structure, never the card copy: both lines of
    // the homepage-only section heading, the s_three_columns section directly
    // after it, and exactly two half-width columns each holding one card.
    // The card titles are deliberately NOT a signal - the builder can leave
    // them empty, and that must not switch the whole section off.
    function find() {
        var blocks = document.querySelectorAll('section.s_text_block');
        for (var i = 0; i < blocks.length; i++) {
            var head = blocks[i];
            var t = text(head);
            if (t.indexOf(HEAD_LINE) === -1 || t.indexOf(HEAD_ACCENT) === -1) { continue; }
            var cards = head.nextElementSibling;
            if (!cards || !cards.matches('section.s_three_columns')) { continue; }
            var cols = cards.querySelectorAll('.row > .col-lg-6');
            if (cols.length !== 2 || cards.querySelectorAll('.row > *').length !== 2) { continue; }
            if (cards.querySelectorAll('.row > .col-lg-6 > .h-100').length !== 2) { continue; }
            return { head: head, cards: cards };
        }
        return null;
    }

    // Empty spacer nodes the builder left behind (<p><br></p>, <h1><br></h1>,
    // an empty <div class="text-center pt16">). Marked, never removed, so CSS
    // collapses them and the rhythm comes from the stylesheet.
    function markVoids(root) {
        var nodes = root.querySelectorAll('p, h1, h2, h3, div');
        Array.prototype.forEach.call(nodes, function (el) {
            if (el.textContent.replace(/[\s ]/g, '')) { return; }
            if (el.querySelector('img, svg, a, input, button')) { return; }
            addClass(el, 'sf-cs__void');
        });
    }

    function decorateHead(head) {
        addClass(head, 'sf-cs-head');
        Array.prototype.forEach.call(head.querySelectorAll('h2'), function (h) {
            addClass(h, 'sf-cs-head__line');
            // The builder hard-codes an older gradient inline on the accent
            // line, and an inline style beats any stylesheet rule. Drop exactly
            // those declarations and attach the shared token-driven utility.
            var span = h.querySelector('span[style], font[style]');
            if (span && text(span).indexOf(HEAD_ACCENT) !== -1) {
                clearInline(span, [
                    'background', 'background-image', 'background-clip',
                    '-webkit-background-clip', 'color', '-webkit-text-fill-color'
                ]);
                addClass(span, 'sf-text-gradient');
                addClass(span, 'sf-cs-head__accent');
            }
        });
    }

    function decorateCards(section) {
        addClass(section, 'sf-cs');

        var row = section.querySelector('.row');
        if (row) { addClass(row, 'sf-cs__grid'); }

        var cols = row ? row.children : [];
        Array.prototype.forEach.call(cols, function (col) {
            var card = col.querySelector('.h-100') || col.firstElementChild;
            if (!card) { return; }
            addClass(col, 'sf-cs__col');
            addClass(card, 'sf-cs__card');

            // The gradient border is painted by a two-layer inline background
            // (padding-box white over a border-box gradient) whose stops are an
            // older, off-canon set at odd positions. Cleared here; _challenge-
            // solution.scss repaints the same technique with the canonical
            // token. The inline `border` is cleared with it, since the width
            // and the transparent colour belong to that same treatment.
            clearInline(card, ['background', 'background-image', 'border', 'border-color', 'border-width']);

            var label = card.querySelector('p');
            if (label) {
                addClass(label, 'sf-cs__label');
                // "Challenge" uses <strong>, "Solution" uses
                // style="font-weight: bolder" - one inconsistent inline value,
                // cleared so both labels share one weight.
                Array.prototype.forEach.call(label.querySelectorAll('[style]'), function (el) {
                    clearInline(el, ['font-weight']);
                });
            }

            var title = card.querySelector('h2');
            if (title) { addClass(title, 'sf-cs__title'); }

            Array.prototype.forEach.call(card.querySelectorAll('p'), function (p) {
                if (p === label) { return; }
                if (!p.textContent.replace(/[\s ]/g, '')) { return; }
                addClass(p, 'sf-cs__item');
            });

            markVoids(card);
        });

        section.setAttribute(READY, '1');
        undo.push(function () { section.removeAttribute(READY); });
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
        var found = find();
        if (!found || found.cards.hasAttribute(READY)) { return; } // idempotent
        decorateHead(found.head);
        decorateCards(found.cards);
        guardEditor();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
