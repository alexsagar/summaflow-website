---
name: odoo-online-saas
description: Project-specific development rules for SummaFlow on Odoo Online SaaS 19.4 Enterprise. Use whenever modifying, packaging, testing, reviewing, or deploying the SummaFlow website.
---

# SummaFlow — Odoo Online SaaS Rules

## Environment

This project targets:

- Odoo Online SaaS
- Version: saas~19.4+e
- Enterprise Edition
- Production database: sumflow
- Test database: sumflow-redesign-test

This is NOT Odoo.sh.
This is NOT a self-hosted Odoo installation.

## Critical Restrictions

Never assume server filesystem or shell access to Odoo.

Never modify Odoo core.

Never create backend functionality that requires custom Python execution on the Odoo server.

Do not create:

- custom Python models
- Python controllers
- server-side Python dependencies
- custom pip dependencies
- shell scripts intended to run on the Odoo server
- PostgreSQL/database migrations requiring direct DB access

The frontend customization layer should use:

- QWeb/XML
- HTML
- SCSS/CSS
- browser-side JavaScript
- SVG/images
- Odoo-compatible importable module data

## Deployment

Deployment is manual through:

Apps -> Import Module

The deliverable must be an Odoo Online-compatible ZIP module.

All changes must be tested first on:

sumflow-redesign-test.odoo.com

Never deploy or make changes to production without explicit approval.

## Current Website Architecture

The existing website was built mainly through Odoo Website Builder.

Important website-specific QWeb views include:

- Home: website.homepage
- Platform: website.platform
- Security: website.security
- Company: website.company

The existing pages contain significant database-stored Website Builder HTML,
Odoo snippet markup, inline styles, gradients, spacing values, and typography.

Do not directly overwrite Odoo's standard base views.

Prefer safe, maintainable customization through the SummaFlow importable module.

Do not manually edit giant database Architecture fields as the normal development workflow.

## Module

Main module:

website_summaflow

Keep all SummaFlow frontend code inside this module.

Expected structure:

website_summaflow/
  __manifest__.py
  __init__.py
  views/
  data/
  static/src/scss/
  static/src/js/
  static/src/img/
  static/src/icons/

## Frontend Rules

Use semantic HTML.

Use QWeb/XML for templates and reusable Odoo website structures.

Move repeated inline styling into reusable SCSS classes.

Avoid unnecessary inline style attributes.

Build responsive behavior explicitly.

Use a consistent design-token system for:

- colors
- gradients
- typography
- spacing
- containers
- borders
- radii
- buttons
- breakpoints

Avoid generic AI-startup aesthetics.

Prefer clean, premium B2B SaaS design.

Product UI and meaningful diagrams should be preferred over decorative graphics.

## JavaScript

Use browser-side JavaScript only.

Avoid adding dependencies unless they provide clear value.

Potential approved libraries later:

- Lucide / selected Lucide SVGs
- Lenis
- GSAP
- ScrollTrigger

Do not introduce these until the static frontend foundation is approved.

Do not add React just to use lucide-react.

## Development Process

Work incrementally.

For every visual section:

1. Inspect current implementation.
2. Define the exact change.
3. Implement only that scope.
4. Build the module ZIP.
5. Import into the neutralized test database.
6. QA desktop/tablet/mobile.
7. Fix problems.
8. Obtain approval.
9. Move to the next section.

Do not redesign several unrelated sections at once.

Do not modify already-approved sections unless necessary and explicitly explained.

## Git Safety

Use Git as the source of truth.

Never make undocumented production-only changes.

Keep commits small and descriptive.

Before destructive actions, inspect current state first.

Do not force-push.

Do not delete existing site content unless the task explicitly requires it.

## Production Safety

Production must remain untouched during redesign work.

Before any eventual production release:

1. Create/download a current Odoo backup.
2. Record the approved Git commit SHA.
3. Record the module version.
4. Build the release ZIP from that exact commit.
5. Import the same tested package.
6. Run smoke tests.
7. Verify forms, links, layout, authentication links, and tracking.

## QA

At minimum verify:

- 320px
- 375px
- 390px
- 430px
- 768px
- 1024px
- 1440px
- 1920px

Check:

- no horizontal overflow
- typography
- spacing
- gradients
- link states
- focus states
- navigation
- forms
- accessibility
- reduced motion
- browser console errors
- Core Web Vitals where practical

## Current Project Direction

The goal is NOT to throw away the current website.

The goal is to refine and professionally finish it:

- improve visuals
- reduce excessive text
- fix spacing
- improve alignment
- standardize gradients/colors
- standardize typography
- improve responsiveness
- fix broken links and forms
- improve product visualization
- improve the footer
- improve Platform/Security/Company pages
- add motion only after the static visual system is approved

Always preserve this direction unless the user explicitly changes it.
