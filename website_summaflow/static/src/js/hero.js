/** @odoo-module ignore **/
/*
 * SummaFlow — homepage hero polish hooks.
 *
 * Plain browser script (no imports, no dependencies, no network).
 *
 * WHY JS AND NOT A VIEW: the live hero is a standalone Website Builder base
 * view ("Custom Banner", key website.s_banner_145bd688541c4e8a94e94046f6c6090a)
 * with NO external ID and no inheritance. website.homepage itself contains only
 * an empty `<div id="wrap" class="oe_structure oe_empty"/>`, so there is no
 * portable XPath target: an earlier views/hero.xml inheriting website.homepage
 * failed to import for exactly that reason. The numeric DB id is not portable
 * either and is deliberately not referenced here.
 *
 * So the DB-managed markup stays the source of truth. This script only:
 *   - attaches stable .sf-hero* classes to the EXISTING elements
 *   - neutralises the inline styles that would beat the stylesheet
 *     (the old hard-coded headline gradient, the image's max-width)
 *   - corrects the one CTA label the client asked for
 *
 * It never creates, clones, removes or re-renders hero content, never touches
 * hrefs, and never writes anything back to the database.
 *
 * - Scope: ONE verified section only (see findHero), never every .s_banner.
 * - Idempotent: guarded by the data-sf-hero-ready attribute, and every
 *   mutation is itself re-runnable.
 * - Website Builder safety: does nothing in edit mode, and if edit mode starts
 *   later it reverts every mutation from an undo log, so the builder can never
 *   save SummaFlow classes or stripped inline styles into the page arch.
 */
(function () {
    'use strict';

    var READY = 'data-sf-hero-ready';
    var HEADLINE = 'One Workspace';
    // The live perspective mockup. Matched loosely: Odoo appends a colour query
    // string (?c5=o-color-5) and may rev the shape path.
    var DEVICE = 'iphone_3d_portrait';
    var DEVICE_FALLBACK = 'image_shape';

    function isEditing() {
        var b = document.body;
        return /[?&](enable_editor|edit_translations)=/.test(window.location.search) ||
            !!(b && b.classList.contains('editor_enable'));
    }

    // --- undo log ---------------------------------------------------------
    // Every mutation registers its inverse so edit mode can restore the DOM to
    // exactly the arch the database holds.
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

    // --- hero identification ---------------------------------------------
    // Three independent signals must agree before anything is decorated:
    //   1. the section is an s_banner
    //   2. its heading carries the hero headline copy
    //   3. it contains the perspective device image
    function findHero() {
        var banners = document.querySelectorAll('section.s_banner');
        for (var i = 0; i < banners.length; i++) {
            var s = banners[i];
            var h = s.querySelector('h1');
            if (!h || h.textContent.indexOf(HEADLINE) === -1) { continue; }
            if (!deviceImage(s)) { continue; }
            return s;
        }
        return null;
    }

    function deviceImage(section) {
        var imgs = section.querySelectorAll('img[src]');
        var fallback = null;
        for (var i = 0; i < imgs.length; i++) {
            var src = imgs[i].getAttribute('src') || '';
            if (src.indexOf(DEVICE) !== -1) { return imgs[i]; }
            if (!fallback && src.indexOf(DEVICE_FALLBACK) !== -1) { fallback = imgs[i]; }
        }
        return fallback;
    }

    // The paragraph carrying the supporting copy: the longest <p> in the
    // content column, which is more robust than Odoo's .lead / .h5-fs utility
    // classes (the builder rewrites those freely).
    function leadParagraph(col) {
        var best = null;
        Array.prototype.forEach.call(col.querySelectorAll('p'), function (p) {
            var len = p.textContent.replace(/\s| /g, '').length;
            if (len < 40) { return; }
            if (!best || len > best.textContent.length) { best = p; }
        });
        return best;
    }

    // --- CTA label --------------------------------------------------------
    // Rewrites text nodes in place, so the existing inline <font> wrapper, the
    // href and the element identity all survive. Naturally idempotent: after
    // the first pass the pattern no longer matches.
    function fixLabel(link) {
        if (!link) { return; }
        var walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT, null, false);
        var node;
        while ((node = walker.nextNode())) {
            var before = node.nodeValue;
            var after = before
                .replace(/Request\s+Free\s+Trial/, 'Request a Free Trial')
                .replace(/^[\s ]+/, '');
            if (after === before) { continue; }
            node.nodeValue = after;
            (function (n, v) { undo.push(function () { n.nodeValue = v; }); })(node, before);
        }
    }

    // Strips the leading &nbsp; the builder left in front of a label so both
    // buttons start on the same optical edge. Text only, no markup change.
    function trimLead(link) {
        if (!link) { return; }
        var walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT, null, false);
        var node = walker.nextNode();
        while (node && !node.nodeValue.replace(/[\s ]/g, '')) { node = walker.nextNode(); }
        if (!node) { return; }
        var before = node.nodeValue;
        var after = before.replace(/^[\s ]+/, '');
        if (after === before) { return; }
        node.nodeValue = after;
        undo.push(function () { node.nodeValue = before; });
    }

    function decorate(section) {
        addClass(section, 'sf-hero');

        var row = section.querySelector('.row');
        if (row) { addClass(row, 'sf-hero__grid'); }

        // Left column: whichever column holds the headline.
        var title = section.querySelector('h1');
        var content = title.closest('.row > *') || title.parentNode;
        addClass(content, 'sf-hero__content');
        addClass(title, 'sf-hero__title');

        // Headline gradient: the builder hard-codes an older gradient inline,
        // and an inline style beats any stylesheet rule. Drop exactly those
        // declarations and attach the shared token-driven utility instead. No
        // hero-local gradient value exists anywhere.
        var span = title.querySelector('span[style], font[style]');
        if (span) {
            clearInline(span, [
                'background', 'background-image', 'background-clip',
                '-webkit-background-clip', 'color', '-webkit-text-fill-color'
            ]);
            addClass(span, 'sf-text-gradient');
        }

        var lead = leadParagraph(content);
        if (lead) {
            addClass(lead, 'sf-hero__lead');
            clearInline(lead, ['font-size', 'line-height']);
            // The builder's inline font-size lives on an inner span.
            Array.prototype.forEach.call(lead.querySelectorAll('[style]'), function (el) {
                clearInline(el, ['font-size', 'line-height']);
            });
        }

        // Empty spacer paragraphs (<p class="lead"><br></p>) exist in the arch.
        // They are not removed - just marked, so CSS can collapse them and the
        // vertical rhythm comes from the stylesheet.
        Array.prototype.forEach.call(content.querySelectorAll('p'), function (p) {
            if (p.textContent.replace(/[\s ]/g, '')) { return; }
            if (p.querySelector('img, svg')) { return; }
            addClass(p, 'sf-hero__void');
        });

        // CTA group: the element that holds the hero's links.
        var links = content.querySelectorAll('a[href]');
        if (links.length) {
            var group = links[0].parentNode;
            addClass(group, 'sf-hero__actions');

            Array.prototype.forEach.call(links, function (a) {
                addClass(a, 'sf-button');
                var primary = a.classList.contains('btn-primary');
                addClass(a, primary ? 'sf-button--primary' : 'sf-button--secondary');
                // Bootstrap's own colour classes would fight the approved
                // black/white language; the .btn sizing base is dropped too.
                removeClass(a, 'btn-primary');
                removeClass(a, 'btn-secondary');
                removeClass(a, 'btn');
                // The builder wrapped the primary label in <font
                // style="color: rgb(255,255,255) !important">; harmless on a
                // black fill, but cleared so the stylesheet owns the colour.
                Array.prototype.forEach.call(a.querySelectorAll('[style]'), function (el) {
                    clearInline(el, ['color', '-webkit-text-fill-color']);
                });
                trimLead(a);
                fixLabel(a);
            });
        }

        // Right column: the device image and the column that holds it.
        var img = deviceImage(section);
        if (img) {
            addClass(img, 'sf-hero__device');
            // The builder's inline max-width (54% of the column) is DELIBERATELY
            // left alone: it is what gives the mockup its original proportion.
            // An earlier pass cleared it and sized the image from the
            // stylesheet, which made the phone visibly larger than the original
            // hero. Only the class is attached here; no sizing is touched.
            var visual = img.closest('.row > *');
            if (visual && visual !== content) { addClass(visual, 'sf-hero__visual'); }
        }

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
        var hero = findHero();
        if (!hero || hero.hasAttribute(READY)) { return; } // idempotent
        decorate(hero);
        guardEditor();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
