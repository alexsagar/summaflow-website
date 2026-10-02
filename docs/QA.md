# SummaFlow QA

This document defines the minimum QA expectations for the redesign.

QA happens on the neutralized test database first.

Production is not an experimental QA environment.

---

# Environment

Test:

https://sumflow-redesign-test.odoo.com/

Production:

https://summaflow.com/

During redesign work, browser automation and experimental testing should target the test database.

---

# Required Viewports

Check approximately:

- 320px
- 375px
- 390px
- 430px
- 768px
- 1024px
- 1440px
- 1920px

Additional widths may be tested when a layout breakpoint issue appears.

---

# Visual QA

Check:

- section spacing
- alignment
- typography
- line lengths
- heading wrapping
- gradients
- borders
- cards
- imagery
- buttons
- content hierarchy
- consistency across pages
- accidental empty areas
- horizontal overflow

---

# Responsive QA

Check:

- navigation
- mobile menu
- multi-column sections
- tables
- cards
- CTAs
- images
- forms
- accordions
- footer
- product visuals

No content should require horizontal page scrolling.

---

# Functional QA

Verify:

- primary CTA
- secondary CTA
- navigation
- Sign In
- Privacy
- Terms
- Cookie Policy
- LinkedIn
- YouTube
- form submission
- intended CRM behavior
- FAQ accordions
- interactive controls

---

# Browser QA

Inspect:

- browser console
- JavaScript errors
- failed network requests
- missing assets
- layout shifts
- slow-loading assets
- broken links

---

# Accessibility QA

Check:

- one meaningful H1
- logical heading order
- keyboard navigation
- visible focus
- tab order
- button semantics
- link semantics
- form labels
- validation messaging
- image alt text
- contrast
- reduced-motion behavior
- touch target sizes

Use automated tooling as assistance, not as the only accessibility review.

---

# SEO QA

Verify:

- page title
- meta description
- canonical behavior
- H1
- H2/H3 structure
- crawlable navigation
- internal links
- image alt text
- robots behavior
- sitemap behavior
- structured data where relevant

The neutralized test database must remain non-indexable.

---

# Performance QA

Check where practical:

- LCP
- CLS
- INP
- image dimensions
- image compression
- unused JavaScript
- excessive animation
- font loading
- unnecessary third-party scripts

Do not sacrifice usability merely to chase a synthetic score.

---

# Forms

Verify:

- required fields
- error messages
- success messages
- keyboard operation
- mobile layout
- CRM lead creation where intended
- spam protection where configured

Never test destructive or real customer workflows against production without approval.

---

# Security Claims

During QA, flag public claims that require evidence.

Examples:

- Zero Hallucinations
- no data written to disk
- ephemeral-only processing
- AES-256
- SOC 2
- infrastructure certification statements
- privacy/regulatory compliance claims

Design agents must not silently rewrite technical claims into stronger promises.

---

# Pre-Release Checklist

Before production release verify:

- approved Git SHA
- module version
- clean build
- exact tested ZIP
- current production backup
- test import successful
- desktop QA
- tablet QA
- mobile QA
- navigation
- CTA
- forms
- legal routes
- social links
- Sign In
- analytics
- consent behavior
- console
- broken links
- SEO metadata
- production rollback plan

---

# Phase 0 Smoke Test — VERIFIED

Date recorded: 2026-10-02.

- Test database: `sumflow-redesign-test.odoo.com`
- Module: `website_summaflow`
- Apps > Import Module: succeeded.
- Website visually unchanged after installation.
- Frontend SCSS asset loaded.
- Browser check `getComputedStyle(document.documentElement).getPropertyValue('--sf-module-loaded').trim()` returned `'1'`.
- No new console errors.
- Production not touched.

`website_summaflow` remains installed on the test database; future redesign
work updates this same module.

---

# Test Database Rollback

For an imported module, uninstall it from Apps if rollback is required.
After uninstall, reinstalling requires importing the ZIP again.

---

# Rollback

Before production installation:

- preserve previous approved module ZIP
- record previous module version
- record release commit
- create/download Odoo backup where available
- document the rollback steps

If a release causes serious regression, restore the previously tested state rather than attempting uncontrolled live repairs.
