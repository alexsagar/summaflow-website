# Current SummaFlow Website

## Purpose

This document records the current known state of the existing SummaFlow website before the coded redesign begins.

It should be treated as reference material, not as a specification that must be preserved exactly.

Last reviewed: 2026-10-01

---

## Platform

Production website:

- https://summaflow.com/
- Odoo-hosted hostname: summaflow.odoo.com

Platform:

- Odoo Online SaaS
- Version: saas~19.4+e
- Enterprise Edition

Production database:

- sumflow

Neutralized redesign/test database:

- sumflow-redesign-test
- URL: https://sumflow-redesign-test.odoo.com/

The test database is a duplicated and neutralized copy of production.

Production must not be used for experimental development.

---

## Current Website Architecture

The website was primarily created using Odoo Website Builder.

The visible page content is stored as website-specific database QWeb views rather than being managed by an existing custom source-controlled website theme.

Known website-specific page views:

| Page | Key |
| --- | --- |
| Home | website.homepage |
| Platform | website.platform |
| Security | website.security |
| Company | website.company |

The website-specific views contain large blocks of:

- Odoo Website Builder snippet markup
- HTML
- inline CSS
- inline spacing
- manually configured gradients
- typography overrides
- cards
- tables
- FAQ markup
- CTA markup

The standard Odoo `website.homepage` base template itself is essentially an empty website layout wrapper.

Do not use manual editing of the giant Architecture fields as the normal development workflow.

---

## Existing Asset Configuration

Technical > Database Structure > Assets was inspected.

No obvious SummaFlow-named custom asset bundle was found.

Searching for `custom` revealed standard Odoo user-custom stylesheet registrations including:

- User custom bootstrap overridden SCSS
- User custom rules SCSS
- User custom rules SCSS override

Example:

Bundle:

web.assets_frontend

Path:

website/static/src/scss/user_custom_rules.scss

Sequence:

99

This appears to be standard Odoo Website Builder custom CSS infrastructure rather than an existing source-controlled SummaFlow frontend module.

---

## Import Capability

Developer mode was enabled in the neutralized test database.

Apps exposes:

Import Module

Therefore the planned deployment workflow is:

local Git repository
-> build Odoo-compatible module
-> package ZIP
-> Apps / Import Module
-> neutralized test database
-> QA
-> eventual approved production release

The repository module is:

website_summaflow

---

# Current Public Pages

## Home

Current hero message:

"Turn scattered trade conversations into Auditable Project Control."

Known sections/concepts include:

- Hero
- Hidden Operational Friction
- Complete Visibility into Every Project
- One Single Timeline
- Catch Delays Early
- 100% Verifiable
- Instant Change Notifications
- Purpose-built for Every Operations Role
- Traditional Operational Workflow vs SummaFlow
- Security / trust content
- FAQ
- CTA

Known issues:

- hero heading semantics need review
- text-heavy layout
- insufficient product UI visuals
- inconsistent spacing
- inconsistent heading hierarchy
- inline styles
- inconsistent gradient treatment
- role titles previously used incorrect heading levels
- duplicated security messaging
- FAQ answers are long
- some security claims require verification
- stray punctuation was visible in at least one area
- CTA terminology is inconsistent across the website

---

## Platform

Current opening message:

"A Practical AI Layer for operations heavy teams."

Current content includes:

- product capabilities
- role-specific content
- security-related material
- AI / Explore AI concepts
- operational workflow content

Known issues:

- heavily text-based
- insufficient product screenshots/visuals
- overlap with Security page
- duplicated benefits
- weak visual storytelling
- inconsistent heading hierarchy
- spacing and alignment issues
- Explore AI needs clearer positioning and presentation

The future Platform page should explain how the product works rather than repeating large amounts of Security content.

---

## Security

Current themes include:

- Ephemeral In-Memory Scanning
- Granular OAuth & 1-Click Revocation
- Absolute Traceability & Zero Hallucinations
- Privacy Scrubbing & PDPO Compliance
- AI model isolation
- encryption/infrastructure
- PII treatment
- auditability

Known layout problem:

A four-column security row currently behaves like loosely placed text rather than a polished card/grid system.

Requirements:

- consistent card dimensions
- consistent gaps
- controlled copy length
- improved responsive behavior
- likely 4 columns -> 2 columns -> 1 column

Claims involving topics such as:

- zero hallucinations
- ephemeral memory
- no physical-disk storage
- no server logs
- AES-256
- SOC 2 / cloud certifications

must be verified before making strong public promises.

Do not imply SummaFlow itself holds a certification unless that is confirmed.

---

## Company

Current main message:

"Bringing Truth, Transparency, and Control to Global Trade Operations."

Known issues:

- duplicated security/privacy content
- company story is diluted
- image alt text previously appeared as generic "Image"
- copy consistency issues
- typography and spacing require cleanup
- Company page should focus on company mission/story rather than functioning as another Security page

---

## Privacy

Privacy content exists but presentation requires improvement.

Known issues:

- heading hierarchy
- long reading width
- lack of clear table of contents / anchors
- inconsistent privacy/contact email usage
- needs clear "Last updated" presentation
- legal contact consistency needs review

---

## Terms

A Terms and Conditions route was previously observed returning 404.

This must be verified and resolved before production release.

---

## Cookies

A footer Cookies item previously appeared to route incorrectly rather than leading to a dedicated cookie policy.

This must be verified.

---

## Blog / Resources

Current `/blog` previously displayed:

"No blog post yet."

The footer/newsletter currently makes the Resources offering appear more mature than it is.

Do not emphasize an empty blog.

A future content strategy can be implemented separately.

---

# Current Global Problems

Known global issues include:

- excessive text
- insufficient product visuals
- inconsistent section spacing
- excessive negative space
- inconsistent colors
- inconsistent blue/teal gradients
- inconsistent typography
- inconsistent button treatments
- weak responsive wrapping
- mobile/tablet layout issues
- duplicated messaging across pages
- unfinished footer links
- legal route gaps
- page transition issues
- missing or incomplete visual storytelling
- generic Website Builder styling patterns
- many inline styles
- inconsistent semantic heading structure

---

# Current CTA / Funnel Issues

Multiple CTA concepts currently appear across the website including variations of:

- Request Free Trial
- Book Demo
- Request Access

The funnel should eventually be standardized.

A previously observed `/contactus` CTA returned 404.

Before redesigning the CTA system, confirm the actual intended commercial flow with the project owner.

---

# Forms

Website forms should ultimately integrate with the intended Odoo CRM workflow.

Do not change CRM behavior during frontend redesign unless explicitly approved.

---

# Social Links

Meeting direction:

Remove:

- Instagram
- Facebook

Keep:

- LinkedIn
- YouTube

---

# Sign In

Sign In should lead users to the intended SummaFlow application/login destination.

This must be verified before production release.

---

# Product Visual Opportunities

Potential reusable product visuals include:

- Project Overview
- Project Timeline
- Source Verification
- Change Intelligence
- Explore AI

Prefer actual product UI or representative product diagrams over decorative graphics.

---

# Important Principle

The project is not a complete brand reset.

The existing direction should be refined into a more professional, coherent, visual and maintainable B2B SaaS website.

Static visual quality comes first.

Animation comes later.
