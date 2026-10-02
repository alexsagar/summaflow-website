# Original SummaFlow Website Snapshot

Captured before coded redesign work began.

Snapshot date: 2026-10-02

## Source

Odoo Online neutralized test database:

sumflow-redesign-test.odoo.com

This database was duplicated from the existing SummaFlow production database.

The snapshot was captured primarily from:

Settings -> Technical -> User Interface -> Views

and:

Website -> Edit Menu

## Purpose

These files preserve the website state that existed before the source-controlled
redesign began.

They are intended to:

- preserve original Website Builder/QWeb markup
- provide comparison material during redesign
- document database-created customizations
- help recover original content if required
- prevent agents from repeatedly rediscovering the old implementation

These files are REFERENCE SNAPSHOTS.

They are not automatically loaded by `website_summaflow`.

Do not clean, reformat, modernize, or rewrite the snapshot files.

## Pages

Captured website-specific QWeb page architecture:

- pages/homepage.xml
  - key: website.homepage

- pages/platform.xml
  - key: website.platform

- pages/security.xml
  - key: website.security

- pages/company.xml
  - key: website.company

- pages/terms-and-conditions.xml
  - key: website.terms-conditions

These are database-stored website views rather than source-controlled page
templates from an existing custom module.

## Header

Captured database-specific header state:

- header/template-header-default.xml
- header/header-brand-logo.xml
- header/header-call-to-action.xml
- header/header-call-to-action-large.xml
- header/header-width-full.xml
- header/header-navlink-no-background-inactive.xml

Several of these are database-created copies with no External ID even though
their Key matches standard Odoo website templates.

Some captured header records showed Odoo "invalid locator" warnings at capture
time. Those warnings are part of the original database state and must not be
silently corrected in these snapshot files.

The inactive navlink-no-background record is preserved for historical context.

Important Odoo core dependencies referenced by the header include:

- website.layout
- website.navbar
- website.template_header_mobile
- website.placeholder_header_brand
- website.placeholder_header_call_to_action

Those standard Odoo core views are not duplicated here.

## Header CTA

The captured SummaFlow-specific Sign In CTA points to:

https://app.summaflow.com/login

## Footer

Captured active website-specific footer:

- footer/template-footer-mega.xml
  - key: website.template_footer_mega
  - inherits: Main layout
  - database-specific copy with no External ID

The footer contains the current SummaFlow contact information, navigation,
newsletter, social links and legal links.

The generic Odoo `website.footer_custom` placeholder template is not included
because it is not the footer currently rendered by SummaFlow.

## Navigation

See:

navigation/menu.md

Current top-level menu:

1. Platform -> /platform
2. Solutions -> /solutions
3. Security -> /security
4. Company -> /company
5. Resources -> /blog

No submenus were present at capture time.

## Important

The authoritative live website state still resides in Odoo's database.

This snapshot exists so the redesign can proceed from a documented,
recoverable baseline while new maintainable frontend code is developed inside:

website_summaflow/
