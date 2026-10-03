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
    'version': '1.3.0',
    'license': 'LGPL-3',
    'depends': ['website'],
    'data': [
        'views/header.xml',
        'views/footer.xml',
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
            'website_summaflow/static/src/scss/_footer.scss',
            'website_summaflow/static/src/scss/summaflow.scss',
            'website_summaflow/static/src/js/operations_roles_viz.js',
        ],
    },
    'installable': True,
    'application': False,
    'auto_install': False,
}
