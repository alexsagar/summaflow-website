# SummaFlow Change List

This document is the running product/design change register.

Items should move through:

DISCOVERED
-> PLANNED
-> IMPLEMENTED
-> QA
-> APPROVED

Do not mark an item complete only because code exists.

---

# Global

## DISCOVERED

- Standardize typography across all pages.
- Standardize colors and gradients.
- Establish reusable spacing system.
- Establish container widths.
- Establish consistent section spacing.
- Reduce excessive negative space.
- Reduce walls of text.
- Introduce meaningful product visuals.
- Improve desktop/tablet/mobile responsiveness.
- Correct heading hierarchy.
- Remove unnecessary inline styling over time.
- Standardize buttons and CTA styles.
- Fix inconsistent links.
- Improve page transitions.
- Introduce restrained animation only after static design approval.
- Review accessibility throughout implementation.
- Review Core Web Vitals and performance.
- Verify SEO semantics.
- Verify analytics / Google Tag Manager setup before launch.

---

# Header / Navigation

## DISCOVERED

- Verify all navigation links.
- Verify Sign In destination.
- Standardize CTA.
- Improve responsive navigation behavior.
- Preserve clear access to Platform, Security and Company.
- Review mobile menu spacing and usability.

---

# Footer

## DISCOVERED

- Redesign footer hierarchy.
- Remove Instagram.
- Remove Facebook.
- Keep LinkedIn.
- Keep YouTube.
- Verify Privacy.
- Fix Terms route.
- Fix Cookie Policy route.
- Verify Sign In / application links.
- Remove or minimize unnecessary Odoo branding if platform/account configuration permits.
- Review newsletter messaging.
- Avoid promoting an empty Resources section.

---

# Homepage

## DISCOVERED

### Hero

- Improve semantic H1 usage.
- Improve visual hierarchy.
- Add meaningful product visual.
- Keep copy concise.
- Standardize CTA language.

### Hidden Operational Friction

- Reduce text-heavy appearance.
- Improve spacing.
- Improve supporting visuals.
- Remove unnecessary empty elements if present.

### Complete Visibility into Every Project

- Replace generic text-only treatment with product visualization.
- Present benefits clearly:
  - One Single Timeline
  - Catch Delays Early
  - 100% Verifiable
  - Instant Change Notifications

### Purpose-built for Every Operations Role

- Reduce excessive blank space.
- Fix heading wrapping.
- Improve gradient readability.
- Improve role presentation.
- Correct heading semantics.
- Avoid washed-out gradient.

Potential heading presentation:

Purpose-built for
Every Operations Role

with deliberate typography rather than accidental wrapping.

#### IMPLEMENTED — v1.2.0 (local only; not yet imported)

Module ships section-scoped CSS `.sf-op-roles` in
`static/src/scss/_operations-roles.scss` (no new visuals, no JS). Fixes:
calmer fluid `padding-block` (replaces `pt72`/`pb40`), heading on the
`--sf-h-xl` scale (not inline `39px`), intentional two-line break via
`.sf-op-roles__accent` (`display:block`). Heading uses the canonical SummaFlow
brand-heading gradient `--sf-gradient-heading` (`90deg #4262AE → #64BEB5 →
#53B973`), recovered from the original branded headings (deep blue→teal→green,
wordmark direction), not the pale blue→mint accent gradient.

No Website Builder or DB edit required. The CSS targets the existing database
markup directly via the unique selector `section.s_title.pt72.pb40` (verified 1
match on the homepage) and its inner `.text-gradient` accent. Importing/updating
the module ZIP + hard refresh applies the fix. `.sf-op-roles*` classes are kept
as a future reusable alias. Role-card section below is unchanged (out of scope).

Two `!important` uses, both because the section carries inline Website Builder
styles that otherwise win over the sheet: heading `font-size` (inline
`font-size:39px` on the span) and accent `background-image` (inline gradient on
the `<font>`). Section padding and the line break need no `!important` (compound
selector beats Odoo's single-class `.pt72`/`.pb40`; no inline `display`).

#### PROTOTYPE (test database only) — animated role cards

Approved for testing only. `static/src/js/operations_roles_viz.js` appends one
decorative SVG stage to each of the three role cards (Consensus, Anomaly,
Traceability) after the unique title section; `_operations-roles-viz.scss`
gives near-square cards (3 cols ≤ ~424px desktop, 2 cols tablet, 1 col mobile)
and the 6s scene timelines. Uses the canonical heading gradient stops only.
Idempotent; inactive in Website Builder edit mode (removes its own nodes if
edit mode starts) so nothing is saved into the page arch. Off-screen scenes
pause; `prefers-reduced-motion` shows a static final state.

### Workflow Comparison

- Keep the core comparison concept.
- Improve visual presentation.
- Desktop may use comparison table.
- Mobile should use stacked comparison cards rather than compressed table.

### Security Teaser

- Reduce duplication with Security page.
- Keep homepage security content concise.
- Link users to detailed Security page.

### FAQ

- Reduce answer length where appropriate.
- Verify product/security claims.
- Improve accordion spacing.
- Ensure keyboard accessibility.

### Final CTA

- Standardize conversion goal.
- Verify destination.
- Fix current broken route behavior if still present.

---

# Platform

## DISCOVERED

- Restructure around product workflow.
- Add actual or representative product visuals.
- Reduce duplicate Security content.
- Improve Explore AI explanation.
- Improve role-based content.
- Improve spacing and hierarchy.
- Correct heading semantics.
- Improve mobile/tablet layouts.

---

# Security

## DISCOVERED

- Convert loose text layouts into structured visual sections/cards.
- Improve security architecture storytelling.
- Improve card spacing and alignment.
- Use consistent responsive grid.
- Reduce excessive copy.
- Verify all strong technical/security claims.
- Clearly distinguish SummaFlow controls from infrastructure-provider certifications.

Security cards currently needing visual redesign include:

- Ephemeral In-Memory Scanning
- Granular OAuth & 1-Click Revocation
- Absolute Traceability & Zero Hallucinations
- Privacy Scrubbing & PDPO Compliance

---

# Company

## DISCOVERED

- Focus on company narrative.
- Remove duplicated Security-page material.
- Improve imagery.
- Add proper alt text.
- Fix copy inconsistencies.
- Improve spacing.
- Improve typography.
- Maintain professional enterprise tone.

---

# Legal

## DISCOVERED

- Verify Privacy route.
- Fix Terms and Conditions.
- Create/fix Cookie Policy.
- Add clear last-updated dates.
- Standardize contact details.
- Improve readability and anchor navigation.

---

# Resources

## DISCOVERED

- Do not heavily promote an empty blog.
- Future content should focus on trade operations, visibility, sourcing, logistics and related SummaFlow subjects rather than generic AI/LLM news.

---

# Forms / CRM

## DISCOVERED

- Verify demo/contact form behavior.
- Ensure intended Odoo CRM lead creation.
- Validate required fields.
- Add appropriate user feedback.
- Validate mobile behavior.
- Review spam protection.

Do not modify CRM workflow without approval.

---

# Analytics

## DISCOVERED

Before final release verify:

- Google Analytics if required
- Google Tag Manager if required
- Search Console
- consent/cookie handling
- tracking only after stakeholder approval

---

# Animation

## RULE

Do not prioritize animation during initial design implementation.

Sequence:

1. layout
2. typography
3. color
4. product visuals
5. responsive design
6. accessibility
7. static approval
8. motion

Potential future tools:

- GSAP
- ScrollTrigger
- Lenis

Only introduce them when their value is clear.

---

# Phase 0 — Module Foundation

## IMPLEMENTED (local only; not yet imported into Odoo)

- Created minimal valid `website_summaflow` module (manifest, `__init__.py`).
- Established asset directory structure (scss/js/img/icons, views/pages, views/components, data) with `.gitkeep`.
- Added harmless frontend load marker: `--sf-module-loaded: 1` in `static/src/scss/summaflow.scss` (no visible redesign), loaded via `web.assets_frontend`.
- Added Windows build/package pipeline: `scripts/build.ps1`, `scripts/validate.ps1`, npm scripts.
- Generates `release/website_summaflow.zip` (module dir as top-level, forward-slash entries).
- Created valid `package.json`; wrote `README.md`.

## QA — VERIFIED (test database)

Smoke test on the neutralized test database `sumflow-redesign-test.odoo.com`:

- Imported `website_summaflow` via Apps > Import Module — succeeded.
- Website remained visually unchanged after installation.
- Frontend SCSS asset loaded successfully.
- Browser verification:
  `getComputedStyle(document.documentElement).getPropertyValue('--sf-module-loaded').trim()`
  returned `'1'`.
- No new console errors observed.
- Production not touched.

Pipeline verified end to end: local -> ZIP -> Odoo Online -> browser.

`website_summaflow` remains installed on the test database. Future redesign
work updates this same module (import updated ZIP = module upgrade).

---

# Phase 1 — Global Frontend Foundation

## IMPLEMENTED (local only; not yet imported into Odoo)

- Refactored SCSS into partials `_tokens`, `_typography`, `_layout`,
  `_buttons`, `_utilities`, `_responsive` + `summaflow.scss` (marker).
- Odoo Online SaaS forbids local SCSS `@import`
  ("Local import '...' is forbidden for security reasons"); all 7 files are
  listed explicitly in `web.assets_frontend` in dependency order, no local
  `@import`/`@use`. (Cross-file refs are CSS custom properties, runtime-resolved.)
- Added `--sf-*` design tokens (color, typography, spacing, containers,
  radii, shadows, focus, transitions) and opt-in `.sf-*` primitives
  (typography, layout, buttons, a11y utilities). See docs/DESIGN-SYSTEM.md.
- Retained `--sf-module-loaded: 1` marker.
- Bumped module version `1.0.0` → `1.1.0`.
- Made `validate.ps1` structure-aware: ZIP required-files derived from the
  manifest + all on-disk SCSS partials (no longer hardcodes 3 files);
  added on-disk `@import` partial-resolution check. Safety checks unchanged.
- `build.ps1`: pre-build pass now backs up + removes the stale ZIP so it
  validates source only; ZIP validated post-build; restore-on-failure kept.

Values are INITIAL implementation tokens, not final approved brand values.
No current markup uses `.sf-*`, so no visible change is expected on import.

## QA — PENDING

Not yet imported. Visual-safety expectation: existing pages render identically
because no markup references the new classes.
