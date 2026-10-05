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
    'version': '1.5.7',
    'license': 'LGPL-3',
    'depends': ['website'],
    'data': [
        'views/header.xml',
        'views/footer.xml',
        'views/pages/utility_pages.xml',
    ],
    # Odoo Online SaaS forbids local @import between custom SCSS files, so
    # every file is listed explicitly here (no wildcards) in dependency order.
    # Values are CSS custom properties resolved at runtime, so order is not
    # strictly required, but tokens are bundled first by convention.
    'assets': {
        'web.assets_frontend': [
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
            'website_summaflow/static/src/scss/summaflow.scss',
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
        ],
    },
    'installable': True,
    'application': False,
    'auto_install': False,
}
