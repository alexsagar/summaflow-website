/** @odoo-module ignore **/
/*
 * SummaFlow — /contactus ("Request a Free Trial") polish layer.
 *
 * /contactus is Website Builder content and STAYS Builder content. Its form
 * action is set to "Create an Opportunity" in the Builder, so the public form
 * carries data-model_name="crm.lead", posts to the native /website/form/
 * controller and redirects to /contactus-thank-you. That mechanism works and
 * is never touched here: this script only ATTACHES CLASSES and clears the
 * builder inline declarations that beat the stylesheet, exactly like
 * security.js / company.js. It never rebuilds, clones, reorders, removes or
 * rewires the form, never changes field names, data-name, action, model or
 * success handling, and never writes to the database.
 *
 * The right-hand column is now a value panel instead of the Builder image
 * (client instruction): one homepage-style heading plus the six Platform-page
 * points. The Builder image node is NOT removed - it is marked so CSS hides it
 * on the public page, and the undo log restores it before the Website Editor
 * ever sees the page.
 *
 * Idempotent; reverts from an undo log the instant the Website Editor starts.
 */
(function () {
    'use strict';

    var READY = 'data-sf-contact-ready';

    // Fields that share a desktop row, in the order the Builder renders them:
    // Name | Phone, then Email | Company. Anything else spans the full width.
    var HALF = ['contact_name', 'phone', 'email_from', 'partner_name'];

    function isEditing() {
        var b = document.body;
        return /[?&](enable_editor|edit_translations)=/.test(window.location.search) ||
            !!(b && b.classList.contains('editor_enable'));
    }

    function isContact() {
        return /^\/contactus(\/|$|\?|#)/.test(window.location.pathname + window.location.search);
    }

    var undo = [];

    function each(list, fn) { Array.prototype.forEach.call(list, fn); }

    function addClass(el, name) {
        if (!el || el.classList.contains(name)) { return; }
        el.classList.add(name);
        undo.push(function () { el.classList.remove(name); });
    }

    // Clear builder inline declarations (e.g. label width:200px) without
    // touching the rest of the style attribute.
    function clearInline(el, props) {
        if (!el || !el.style) { return; }
        each(props, function (prop) {
            var value = el.style.getPropertyValue(prop);
            if (!value) { return; }
            el.style.removeProperty(prop);
            undo.push(function () { el.style.setProperty(prop, value); });
        });
    }

    function replaceText(root, from, to) {
        if (!root) { return; }
        var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
        var node;
        while ((node = walker.nextNode())) {
            var before = node.nodeValue;
            if (before.indexOf(from) === -1) { continue; }
            node.nodeValue = before.split(from).join(to);
            (function (n, v) { undo.push(function () { n.nodeValue = v; }); })(node, before);
        }
    }

    // "Request a Free Trial" -> "Request a <span>Free Trial</span>", so the
    // two words can carry the canonical brand gradient. The heading text
    // itself is unchanged; only a span is introduced, and the undo log puts
    // the original text node back before the editor ever sees it.
    function gradientHeading(title) {
        if (!title || title.querySelector('.sf-trial__grad')) { return; }
        var walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT, null, false);
        var node;
        while ((node = walker.nextNode())) {
            if (node.nodeValue.indexOf('Free Trial') === -1) { continue; }
            var before = title.innerHTML;
            var tail = node.splitText(node.nodeValue.indexOf('Free Trial'));
            tail.splitText('Free Trial'.length);
            var span = document.createElement('span');
            span.className = 'sf-trial__grad';
            tail.parentNode.replaceChild(span, tail);
            span.appendChild(tail);
            undo.push(function () { title.innerHTML = before; });
            return;
        }
    }

    // --- Right column value panel ----------------------------------------
    // Replaces the builder image with the approved copy: the homepage-style
    // heading plus the six Platform-page points. NEW nodes only; the builder
    // image is hidden by CSS (class only) and restored by the undo log.
    var PANEL_TITLE = ['One Workspace', ' for scattered project signals.'];

    // The six Platform-page points, each with the SAME fill-on-hover line icon
    // the Platform page's "Key Advantages" block uses for that exact heading
    // (platform.js ADV_ICONS) and the homepage Trust block before it. The paths
    // are repeated here on purpose: the real Odoo asset bundle does not follow
    // manifest order (verified on the test DB), so a cross-file global read at
    // parse time is not safe. The icon LOOK is shared through the .sf-ico
    // classes in _utilities.scss, so there is one visual system, not two.
    //   .sf-ico__b = closed body shapes, filled with currentColor on hover
    //   .sf-ico__d = inner details, flipped to white on hover
    var PANEL_POINTS = [
        { label: 'Zero Manual Data Entry',
          svg: '<path class="sf-ico__b" d="M13.25 2.75 5.5 13.25H11l-1 8 8.5-11H13Z"/>' },
        { label: 'Clear Action Items',
          svg: '<rect class="sf-ico__b" x="4.75" y="4.5" width="14.5" height="16.75" rx="1.75"/>' +
               '<rect class="sf-ico__b" x="8.75" y="2.75" width="6.5" height="3.5" rx="1"/>' +
               '<path class="sf-ico__d" d="m8 11.5 1.5 1.5 2.5-3M14 12h2.5M8 16.75h8.5"/>' },
        { label: 'Instant Negotiation Trends',
          svg: '<path d="M3 20.75h18"/>' +
               '<rect class="sf-ico__b" x="4.75" y="13" width="3.5" height="7.75" rx=".75"/>' +
               '<rect class="sf-ico__b" x="10.25" y="9" width="3.5" height="11.75" rx=".75"/>' +
               '<rect class="sf-ico__b" x="15.75" y="4.75" width="3.5" height="16" rx=".75"/>' },
        { label: '100% Traceable',
          svg: '<path d="M8.25 18h7.25a3.25 3.25 0 0 0 0-6.5h-7a3.25 3.25 0 0 1 0-6.5h7.25"/>' +
               '<circle class="sf-ico__b" cx="5.75" cy="18" r="2.5"/>' +
               '<circle class="sf-ico__b" cx="18.25" cy="5" r="2.5"/>' },
        { label: 'Privacy First',
          svg: '<path d="M8 10.5V7.75a4 4 0 0 1 8 0v2.75"/>' +
               '<rect class="sf-ico__b" x="4.75" y="10.5" width="14.5" height="10.75" rx="2"/>' +
               '<path class="sf-ico__d" d="M12 14.5v2.75"/>' },
        { label: 'Seamless Team Onboarding',
          svg: '<circle class="sf-ico__b" cx="9" cy="8" r="3.25"/>' +
               '<circle class="sf-ico__b" cx="16.75" cy="9.25" r="2.5"/>' +
               '<path class="sf-ico__b" d="M3.25 20.25a5.75 5.75 0 0 1 11.5 0Z"/>' +
               '<path class="sf-ico__b" d="M16.75 20.25h4a4.25 4.25 0 0 0-6.3-3.72 7.2 7.2 0 0 1 2.3 3.72Z"/>' }
    ];

    // Built on a throwaway host so the parser places <svg> in the SVG
    // namespace - the same construction as platform.js / homepage_sections.js.
    function pointIcon(markup) {
        var host = document.createElement('div');
        host.innerHTML = '<span class="sf-trial__mark">' +
            '<svg class="sf-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
            ' stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"' +
            ' focusable="false" aria-hidden="true">' + markup + '</svg></span>';
        return host.firstChild;
    }

    function node(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) { n.className = cls; }
        if (text) { n.textContent = text; }
        return n;
    }

    function buildPanel(col, image) {
        if (!col || col.querySelector('.sf-trial__panel')) { return; }

        var panel = node('div', 'sf-trial__panel');

        var h = node('h2', 'sf-trial__panel-title');
        h.appendChild(node('span', 'sf-trial__grad', PANEL_TITLE[0]));
        h.appendChild(document.createTextNode(PANEL_TITLE[1]));
        panel.appendChild(h);

        var list = node('ul', 'sf-trial__points');
        PANEL_POINTS.forEach(function (point) {
            var li = node('li', 'sf-trial__point');
            li.appendChild(pointIcon(point.svg));
            li.appendChild(node('span', 'sf-trial__point-label', point.label));
            list.appendChild(li);
        });
        panel.appendChild(list);

        col.appendChild(panel);
        undo.push(function () { if (panel.parentNode) { panel.parentNode.removeChild(panel); } });

        addClass(col, 'sf-trial__col-media--panel');
        if (image) { addClass(image, 'sf-trial__image--void'); }
    }

    function decorate() {
        var wrap = document.querySelector('#wrap');
        if (!wrap || wrap.hasAttribute(READY)) { return; }

        var form = wrap.querySelector('form.o_mark_required, .s_website_form form, form');
        if (!form) { return; }

        addClass(wrap, 'sf-trial');

        // Outer builder section: kills o_full_screen_height / pt48 / pb120 via
        // the stylesheet, so the page height is content-driven.
        var shell = form.closest('section.s_form_aside') || form.closest('section');
        if (shell) { addClass(shell, 'sf-trial__shell'); }

        // The two builder columns: form left, existing image right. Neither is
        // moved, cloned or hidden - they are only labelled so the stylesheet
        // can set the 58 / 42 proportions.
        var left = form.closest('[class*="col-"]');
        if (left) { addClass(left, 'sf-trial__col-form'); }
        var image = wrap.querySelector('img.img, .s_form_aside img, #wrap img');
        var right = null;
        if (image && !image.closest('form')) {
            addClass(image, 'sf-trial__image');
            right = image.closest('[class*="col-"]');
            if (right && right !== left) { addClass(right, 'sf-trial__col-media'); }
        }
        if (!right) {
            // No builder image in the arch: use whichever sibling column is
            // not the form column, so the panel still has a home.
            var row = left && left.parentNode;
            if (row) {
                each(row.children, function (col) {
                    if (right || col === left) { return; }
                    if (col.className.indexOf('col-') === -1) { return; }
                    right = col;
                    addClass(col, 'sf-trial__col-media');
                });
            }
        }
        buildPanel(right, image);

        // Heading + supporting copy.
        var title = wrap.querySelector('h1');
        if (title) {
            addClass(title, 'sf-trial__title');
            replaceText(title, 'Contact us', 'Request a Free Trial');
            replaceText(title, 'Contact Us', 'Request a Free Trial');
            gradientHeading(title);
        }
        var lead = left && left.querySelector('p');
        if (lead && !lead.closest('form')) { addClass(lead, 'sf-trial__support'); }

        // Form shell + fields. Classes only; names and data-name untouched.
        addClass(form, 'sf-trial__form');
        var inner = form.closest('section.s_website_form');
        if (inner) { addClass(inner, 'sf-trial__form-section'); }

        each(form.querySelectorAll('.s_website_form_field'), function (field) {
            var control = field.querySelector('[name]');
            var name = control ? control.getAttribute('name') : '';
            addClass(field, HALF.indexOf(name) === -1 ? 'sf-trial__field--full'
                                                      : 'sf-trial__field--half');
            // Builder pins labels at width:200px for its label-left layout.
            clearInline(field.querySelector('label'), ['width']);
        });

        var submit = form.querySelector('.s_website_form_submit');
        if (submit) { addClass(submit, 'sf-trial__submit'); }
        var send = form.querySelector('.s_website_form_send');
        if (send) {
            addClass(send, 'sf-trial__send');
            // Legacy builder typo, in case an older arch is still in place.
            replaceText(send, 'Sed Message', 'Request a Free Trial');
            replaceText(send, 'Send Message', 'Request a Free Trial');
        }
        replaceText(wrap, 'Sed Message', 'Request a Free Trial');

        wrap.setAttribute(READY, '1');
        undo.push(function () { wrap.removeAttribute(READY); });
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
        if (isEditing() || !isContact()) { return; }
        decorate();
        if (undo.length) { guardEditor(); }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
