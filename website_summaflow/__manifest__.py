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

Phase 0: minimal valid module. The only shipped style is a harmless
CSS custom property (--sf-module-loaded) used to confirm the frontend
asset bundle loaded. No visible redesign.
""",
    'author': "SummaFlow",
    'website': "https://summaflow.com",
    'category': 'Website',
    # Short 2-3 part semantic version on purpose. The saas~19.4 module loader
    # prefixes the current Odoo SaaS series automatically; do NOT hard-code
    # 19.0 / 19.4 here.
    'version': '1.0.0',
    'license': 'LGPL-3',
    'depends': ['website'],
    'data': [],
    'assets': {
        'web.assets_frontend': [
            'website_summaflow/static/src/scss/summaflow.scss',
        ],
    },
    'installable': True,
    'application': False,
    'auto_install': False,
}
