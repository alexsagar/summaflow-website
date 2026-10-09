# -*- coding: utf-8 -*-
# SummaFlow website customization module.
# Frontend-only, Odoo Online SaaS compatible (Apps > Import Module).
# No custom Python models, controllers, or server-side logic.
{
    'name': "SummaFlow Website",
    'summary': "SummaFlow website frontend customizations (SCSS/JS/QWeb).",
    'description': """
SummaFlow website redesign layer.

Frontend-only customization module for the SummaFlow website running on
Odoo Online SaaS (Enterprise). Contains SCSS, browser-side JavaScript,
QWeb/XML, and static assets. No server-side Python logic.

Phase 1: global frontend foundation. Ships the SummaFlow design-system
layer as --sf-* CSS custom properties and opt-in .sf-* primitives
(typography, layout, buttons, utilities). No current markup uses these
classes, so there is no visible redesign yet. Retains the harmless
--sf-module-loaded marker for load verification.
""",
    'author': "SummaFlow",
    'website': "https://summaflow.com",
    'category': 'Website',
    # Short 2-3 part semantic version on purpose. The saas~19.4 module loader
    # prefixes the current Odoo SaaS series automatically; do NOT hard-code
    # 19.0 / 19.4 here.
    'version': '1.11.0',
    'license': 'LGPL-3',
    # website_blog is required for the /blog Resources polish (QWeb inheritance
    # of its stable templates). It is a standard Odoo Online module, already
    # installed on the site; listing it here makes the dependency explicit.
    # website_crm is the standard Odoo module behind the Builder form action
    # "Create an Opportunity": it whitelists crm.lead for website forms
    # (website_form_access / website_form_key = create_lead) and whitelists the
    # usable lead fields. The live /contactus form posts to the native
    # /website/form/ controller with data-model_name="crm.lead", so the
    # dependency is declared here. Standard module, no custom server code.
    'depends': ['website', 'website_blog', 'website_crm'],
    'data': [
        # Shared components first: header.xml and footer.xml t-call ai_marks.
        'views/components/ai_marks.xml',
        'views/header.xml',
        'views/footer.xml',
        'views/pages/utility_pages.xml',
        'views/blog.xml',
    ],
    # Odoo Online SaaS forbids local @import between custom SCSS files, so
    # every file is listed explicitly here (no wildcards) in dependency order.
    # Values are CSS custom properties resolved at runtime, so order is not
    # strictly required, but tokens are bundled first by convention.
    'assets': {
        'web.assets_frontend': [
            # Vendored Lenis (v1.1.18, MIT) — smooth scrolling. Vendored, not
            # fetched: Odoo Online never runs npm and the page never calls a
            # CDN. smooth_scroll.js below starts it (frontend only, never in
            # the Website Editor).
            'website_summaflow/static/lib/lenis/lenis.css',
            'website_summaflow/static/lib/lenis/lenis.min.js',
            'website_summaflow/static/src/scss/_tokens.scss',
            'website_summaflow/static/src/scss/_typography.scss',
            'website_summaflow/static/src/scss/_layout.scss',
            'website_summaflow/static/src/scss/_buttons.scss',
            'website_summaflow/static/src/scss/_utilities.scss',
            'website_summaflow/static/src/scss/_responsive.scss',
            'website_summaflow/static/src/scss/_operations-roles.scss',
            'website_summaflow/static/src/scss/_operations-roles-viz.scss',
            'website_summaflow/static/src/scss/_header.scss',
            'website_summaflow/static/src/scss/_hero.scss',
            'website_summaflow/static/src/scss/_challenge-solution.scss',
            'website_summaflow/static/src/scss/_homepage-sections.scss',
            'website_summaflow/static/src/scss/_footer.scss',
            'website_summaflow/static/src/scss/_legal.scss',
            'website_summaflow/static/src/scss/_platform.scss',
            'website_summaflow/static/src/scss/_solutions.scss',
            'website_summaflow/static/src/scss/_security.scss',
            'website_summaflow/static/src/scss/_company.scss',
            'website_summaflow/static/src/scss/_blog.scss',
            'website_summaflow/static/src/scss/_contactus.scss',
            # Shared product-screenshot slider (platform + company pages).
            'website_summaflow/static/src/scss/_shots.scss',
            'website_summaflow/static/src/scss/summaflow.scss',
            # Self-mounting product-screenshot slider (platform + company).
            'website_summaflow/static/src/js/shots.js',
            # Site-wide smooth scrolling; needs lenis.min.js above.
            'website_summaflow/static/src/js/smooth_scroll.js',
            # Mobile-nav state reset (Bootstrap offcanvas edge case).
            'website_summaflow/static/src/js/header.js',
            'website_summaflow/static/src/js/operations_roles_viz.js',
            'website_summaflow/static/src/js/hero.js',
            'website_summaflow/static/src/js/challenge_solution.js',
            # Last on purpose: its heading-semantics pass queries the tags the
# scripts above rely on, so it must run after all of them.
            'website_summaflow/static/src/js/homepage_sections.js',
            # Platform-page polish layer. Last on purpose: its own heading pass
            # retags /platform's builder headings, and it must run after the
            # homepage-section scripts that also execute on every page load.
            'website_summaflow/static/src/js/platform.js',
            # Solutions-page polish layer. Page-gated at runtime.
            'website_summaflow/static/src/js/solutions.js',
            # Security-page polish layer. Page-gated at runtime.
            'website_summaflow/static/src/js/security.js',
            # Company-page polish layer. Page-gated at runtime.
            'website_summaflow/static/src/js/company.js',
            # /contactus ("Request a Free Trial") polish layer. The page is
            # Website-Builder content whose form action is set to "Create an
            # Opportunity" (crm.lead) in the Builder: this script only attaches
            # classes and neutralises builder spacing so _contactus.scss can
            # style it. It never rebuilds, clones or rewires the form.
            'website_summaflow/static/src/js/contactus.js',
            # First-paint reveal. MUST stay last: it un-hides the builder
            # content only after every decorator above has run.
            'website_summaflow/static/src/js/reveal.js',
        ],
    },
    'installable': True,
    'application': False,
    'auto_install': False,
}
