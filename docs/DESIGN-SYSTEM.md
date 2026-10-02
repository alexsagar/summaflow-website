# SummaFlow Design System

Status: Initial design foundation

This is a starting system for implementation and testing.

Values may be adjusted during real section design.

Do not treat every initial numeric value as permanently approved.

---

# Design Goal

SummaFlow should feel like professional enterprise B2B SaaS software for operations-heavy trade workflows.

Desired qualities:

- trustworthy
- precise
- clear
- operational
- intelligent
- premium
- modern
- calm

The design should communicate visibility, traceability and control.

---

# Avoid

Do not default to:

- generic AI startup visuals
- purple AI gradients
- excessive glow
- decorative blobs
- excessive glassmorphism
- meaningless 3D
- visual noise
- excessive icon usage
- unnecessary animation
- giant empty sections
- walls of text

---

# Layout

Initial desktop maximum content width:

1200px - 1280px

Long-form text maximum readable width:

680px - 760px

Initial section spacing guidance:

Desktop:
112px - 144px

Tablet:
80px - 96px

Mobile:
64px - 72px

These are guidelines, not mandatory values.

Spacing must respond to actual content density.

---

# Grid

Use a consistent responsive grid.

Desktop:

12-column conceptual grid

Tablet:

flexible 6/8-column equivalent as appropriate

Mobile:

single primary content column

Do not force desktop card patterns onto small screens.

---

# Color

Existing brand direction appears primarily:

- white / off-white
- dark text
- blue
- teal / green-blue

Build actual final tokens from approved brand colors rather than copying arbitrary values from existing inline styles.

Suggested token structure:

--sf-bg
--sf-bg-subtle
--sf-surface
--sf-text
--sf-text-muted
--sf-border
--sf-primary
--sf-secondary
--sf-accent
--sf-gradient-brand
--sf-focus

Do not use many slightly different blues without purpose.

---

# Gradients

Brand gradients should be controlled and reusable.

Avoid individually creating gradients per section.

Create one or very few approved brand-gradient tokens.

Gradients must maintain readable contrast.

The current "Purpose-built for Every Operations Role" treatment is an example where the gradient needs stronger readability and better spacing.

---

# Typography

Typography must establish hierarchy through a deliberate scale rather than arbitrary inline font-size values.

Required semantic hierarchy:

H1:
one primary page heading

H2:
major page sections

H3:
subsections/cards when semantically appropriate

Body:
comfortable reading size and line height

Small:
metadata, helper copy and compact UI

Do not choose heading tags based solely on desired font size.

---

# Containers

Use reusable container classes.

Example conceptual classes:

.sf-container
.sf-container--narrow
.sf-container--wide

Avoid repeatedly defining page-specific max-width values.

---

# Sections

Use shared section primitives.

Example concepts:

.sf-section
.sf-section--compact
.sf-section--subtle
.sf-section--dark

Each section should intentionally control:

- vertical rhythm
- background
- heading spacing
- content width
- responsive behavior

---

# Buttons

Create a consistent button system.

Potential variants:

- primary
- secondary
- text/link
- dark
- light where required

Buttons should have:

- consistent height
- consistent radius
- consistent typography
- visible focus state
- hover state
- disabled state where applicable

Avoid one-off CTA styles.

---

# Cards

Cards should be used only when content benefits from grouping.

Maintain consistent:

- padding
- border
- radius
- title hierarchy
- icon sizing
- spacing
- minimum heights where appropriate

Do not turn every sentence into a card.

---

# Icons

Icons should support comprehension.

Preferred approach:

- selected Lucide SVGs where appropriate
- custom product/operational icons where generic icons are insufficient

Avoid decorative icon spam.

Do not add React solely for icon rendering.

---

# Product Visuals

Product visuals are a core part of the redesign.

Potential reusable visual families:

- Project Overview
- Project Timeline
- Source Verification
- Change Intelligence
- Explore AI

Visuals should explain the product.

Do not use fake dashboards simply as decoration.

---

# Imagery

Prefer:

1. real product UI
2. meaningful product diagrams
3. operational workflows
4. carefully selected real-world imagery where justified

Avoid generic corporate stock imagery unless it clearly adds value.

---

# Motion

Motion should communicate:

- hierarchy
- progression
- relationship
- interaction

It should not exist purely for spectacle.

Respect:

prefers-reduced-motion

Potential future libraries:

- GSAP
- ScrollTrigger
- Lenis

Do not add them during Phase 0.

---

# Responsive Behavior

Start from content requirements rather than shrinking desktop layouts.

Common transformations may include:

4 columns
-> 2 columns
-> 1 column

Comparison table
-> stacked comparison cards

Desktop navigation
-> mobile menu

Large product composition
-> simplified stacked visual

---

# Accessibility

Target WCAG-conscious design.

Require:

- sufficient contrast
- visible focus
- semantic HTML
- keyboard usability
- descriptive link text
- meaningful image alt text
- sufficiently large interaction targets
- reduced motion support

Target approximately 44px minimum interactive touch area where practical.

---

# Visual References

Directional inspiration only:

- Linear
- Palantir
- premium enterprise logistics/operations software

Do not clone these products.

The desired result should remain clearly SummaFlow.

---

# Phase 1 — Implemented Foundation

Status: INITIAL IMPLEMENTATION TOKENS (not final approved brand values).

Shipped in `website_summaflow/static/src/scss/` as CSS custom properties
(`--sf-*`) and opt-in classes (`.sf-*`). No existing markup uses these classes,
so importing Phase 1 produces no visible change. Values are grounded in colors
observed in `docs/original-site/` snapshots and are provisional.

## SCSS architecture

Odoo Online SaaS forbids local SCSS `@import` between custom files, so all 7
files are listed explicitly in `web.assets_frontend`, in order:
`_tokens` → `_typography` → `_layout` → `_buttons` → `_utilities` →
`_responsive` → `summaflow`. No local `@import`/`@use`. Cross-file references are
CSS custom properties resolved at runtime, so order is not strictly required.
`summaflow.scss` carries only the `--sf-module-loaded` marker.

## Tokens (initial)

Color: `--sf-bg` `#ffffff`, `--sf-bg-subtle` `#f6f8fa`, `--sf-surface` `#ffffff`,
`--sf-text` `#1a2230`, `--sf-text-muted` `#5a6473`, `--sf-border` `#d9dee5`,
`--sf-primary` `#2f80ed`, `--sf-primary-ink` `#4262ae`, `--sf-secondary` `#64beb5`,
`--sf-accent` `#53b973`, `--sf-focus` `#2f80ed`,
`--sf-gradient-brand` (`90deg #4262ae → #64beb5 → #53b973`).

Typography: `--sf-font-body`/`--sf-font-heading` (both `inherit` in Phase 1 — no
new font imposed); sizes `--sf-text-xs|sm|base|lg`; fluid headings
`--sf-h-md|lg|xl` and `--sf-display` (clamp); line-heights
`--sf-lh-tight|snug|body`; weights `--sf-weight-regular|medium|semibold|bold`.

Spacing: `--sf-space-1..9` (0.25rem → 6rem) + fluid `--sf-section-y`.

Containers: `--sf-container` 1240px, `--sf-container-narrow` 720px,
`--sf-container-wide` 1440px, fluid `--sf-gutter`.

Primitives: `--sf-border-width`, `--sf-radius-sm|radius|lg`,
`--sf-shadow-sm|shadow`, `--sf-focus-ring`, `--sf-transition|transition-slow`.

Marker: `--sf-module-loaded: 1` retained for load verification.

## Primitives (opt-in classes)

- Layout: `.sf-container` (`--narrow`, `--wide`), `.sf-section` (`--compact`,
  `--subtle`), `.sf-stack`, `.sf-cluster`, `.sf-grid` (auto-fit, no media query).
- Typography: `.sf-display`, `.sf-heading-xl|lg|md`, `.sf-body-lg|body|sm`,
  `.sf-eyebrow`.
- Buttons: `.sf-button` + `--primary|--secondary|--ghost`; states default/hover/
  active/`:focus-visible`/disabled (`[disabled]`, `[aria-disabled="true"]`);
  44px min touch target. Does not touch Odoo `.btn`.
- Utilities/a11y: `.sf-visually-hidden`, `.sf-text-gradient`, `.sf-focus-ring`,
  `.sf-muted`. `@media (prefers-reduced-motion: reduce)` neutralizes transitions
  on `.sf-*` only (no global reset).

---

# Design Approval Rule

Once a section has been approved, agents should not casually redesign it while working on another section.

Cross-section changes should occur only when required for:

- shared design system consistency
- accessibility
- responsive fixes
- bugs
- explicit user request
