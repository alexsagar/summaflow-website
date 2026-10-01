# SummaFlow Website — Agent Instructions

This repository contains the code-controlled frontend redesign of the SummaFlow website.

These instructions are authoritative for all coding agents working in this repository, including Codex, Antigravity/AGY, and later Claude Code.

---

# 1. Project Environment

Target platform:

- Odoo Online SaaS
- Odoo version: saas~19.4+e
- Enterprise Edition
- Production database: sumflow
- Neutralized redesign/test database: sumflow-redesign-test
- Production website: summaflow.com

This project is NOT:

- Odoo.sh
- self-hosted Odoo
- a normal Python Odoo development environment

Agents must never assume SSH, server filesystem, PostgreSQL, pip, Docker, or Odoo server shell access.

---

# 2. Mandatory Skill Priority

Before implementing work, use the relevant skills available under:

.agents/skills/

For Odoo work, skill priority is:

1. odoo-online-saas
2. odoo-19
3. odoo-workflow

If generic Odoo guidance conflicts with `odoo-online-saas`,
the `odoo-online-saas` instructions win.

For frontend implementation use, as relevant:

- frontend-design
- frontend-ui-engineering
- web-design-guidelines
- accessibility
- performance
- core-web-vitals
- seo
- best-practices

For engineering workflow use, as relevant:

- spec-driven-development
- incremental-implementation
- source-driven-development
- context-engineering
- debugging-and-error-recovery
- code-review-and-quality
- git-workflow-and-versioning
- browser-testing-with-devtools
- repomix-explorer

Do not invoke every skill for every task.

Select only the skills relevant to the current task.

---

# 3. Odoo Online Restrictions

Never create functionality requiring custom Python execution on the Odoo server.

Do not introduce:

- custom Python models
- Python controllers
- server-side Python libraries
- pip dependencies
- PostgreSQL migrations
- shell commands intended to run on Odoo
- direct Odoo filesystem modifications
- Odoo core modifications

The website customization layer must remain compatible with Odoo Online importable modules.

Allowed frontend technologies include:

- QWeb/XML
- HTML
- SCSS/CSS
- browser-side JavaScript
- SVG
- images
- Odoo frontend assets

The final deployable artifact must remain compatible with:

Apps -> Import Module

---

# 4. Production Safety

Production is OFF LIMITS during redesign development.

Never:

- edit production Website Builder content
- import experimental modules into production
- change production configuration
- modify production views
- test experimental JavaScript on production
- deploy automatically to production

All testing must happen on:

sumflow-redesign-test.odoo.com

A production deployment requires explicit user approval.

---

# 5. Existing Website Architecture

The existing website is primarily stored as database-managed Odoo Website Builder QWeb content.

Known website-specific page keys:

- Home: website.homepage
- Platform: website.platform
- Security: website.security
- Company: website.company

The pages currently contain significant:

- Website Builder snippet markup
- inline CSS
- inline spacing
- manually configured gradients
- inconsistent typography
- database-stored HTML

Do not use manual editing of giant Odoo Architecture fields as the normal development workflow.

Do not directly modify standard Odoo base views.

The long-term goal is to move maintainable frontend behavior and styling into:

website_summaflow/

---

# 6. Repository Structure

Primary module:

website_summaflow/

Expected structure:

website_summaflow/
├── __init__.py
├── __manifest__.py
├── data/
├── views/
│   ├── pages/
│   └── components/
└── static/
    └── src/
        ├── scss/
        ├── js/
        ├── img/
        └── icons/

Documentation:

docs/
├── CURRENT-SITE.md
├── DESIGN-SYSTEM.md
├── CHANGE-LIST.md
└── QA.md

Keep project knowledge updated as the implementation evolves.

---

# 7. Development Strategy

Work incrementally.

Do NOT redesign the entire website in one implementation.

Preferred sequence:

1. project/module foundation
2. harmless import validation
3. global design tokens
4. header/navigation
5. footer
6. homepage section-by-section
7. Platform
8. Security
9. Company
10. forms and legal pages
11. responsive QA
12. accessibility
13. performance
14. animations
15. analytics/tracking
16. final release QA

Each significant visual section must be independently reviewable.

---

# 8. Design Direction

The site should feel like premium enterprise B2B SaaS software.

Priorities:

- clear visual hierarchy
- strong typography
- intentional whitespace
- meaningful product visuals
- disciplined grid
- consistent colors
- consistent gradients
- consistent spacing
- restrained motion
- responsive layouts
- accessibility

Avoid:

- generic AI startup aesthetics
- excessive gradients
- decorative blobs
- excessive glassmorphism
- random icons
- meaningless 3D graphics
- excessive animations
- visual effects without purpose
- huge empty spaces
- text-heavy walls of copy

Product UI, operational workflows, diagrams and meaningful product imagery are preferred over decoration.

---

# 9. Existing Design Problems

Known issues include:

- inconsistent section spacing
- excessive negative space
- inconsistent gradients
- inconsistent typography
- text-heavy sections
- insufficient product visuals
- awkward card layouts
- weak responsive wrapping
- page transition issues
- button/link inconsistencies
- duplicate content between pages
- overly repeated security messaging
- broken or incomplete links
- legal-page gaps
- unfinished blog/resources area
- footer inconsistencies
- mobile/tablet layout problems

Do not attempt to fix all of these simultaneously.

---

# 10. Content/Meeting Direction

The existing general design direction should be refined rather than discarded completely.

Important requirements include:

- add better visuals
- improve visual consistency
- fix spacing and alignment
- fix color consistency
- improve typography
- improve button behavior
- improve page transitions
- improve mobile/tablet layouts
- improve Platform visuals
- improve Explore AI presentation
- update footer
- remove Instagram
- remove Facebook
- retain LinkedIn
- retain YouTube
- ensure Privacy links work
- ensure Terms links work
- ensure Sign In reaches the application
- website forms should integrate with the intended CRM workflow
- animation comes AFTER static visuals are approved

Visuals first.
Motion second.

---

# 11. Design Tokens

Do not scatter arbitrary styling values through templates.

Create reusable tokens/classes for:

- colors
- brand gradients
- type scale
- font weights
- container widths
- spacing
- borders
- radii
- shadows
- buttons
- breakpoints
- section padding

Avoid unnecessary inline styles.

---

# 12. JavaScript and Dependencies

Use the smallest practical amount of JavaScript.

Do not add dependencies automatically.

Potential future libraries include:

- Lucide or selected Lucide SVGs
- GSAP
- ScrollTrigger
- Lenis

They are NOT approved for immediate installation merely because they are available.

Static design should be finalized first.

Do not add React just to use lucide-react.

If npm packages are used, they must be bundled locally into browser-ready assets.

Odoo Online must never be expected to run npm.

---

# 13. Responsive Requirements

Every implemented section should eventually be checked at approximately:

- 320px
- 375px
- 390px
- 430px
- 768px
- 1024px
- 1440px
- 1920px

Check:

- horizontal overflow
- content clipping
- typography
- wrapping
- spacing
- container widths
- navigation
- cards
- tables
- forms
- buttons
- imagery

---

# 14. Accessibility

Do not treat accessibility as a final cosmetic step.

Implement:

- semantic heading hierarchy
- keyboard navigation
- visible focus states
- proper form labels
- suitable contrast
- meaningful alt text
- appropriate ARIA only where required
- adequate interactive target sizing
- reduced-motion support

---

# 15. SEO

Maintain proper document semantics.

Requirements include:

- one meaningful H1 per page
- logical H2/H3 structure
- crawlable text
- descriptive page titles
- useful metadata
- meaningful internal linking
- appropriate structured data where justified

Do not use heading tags merely for visual sizing.

---

# 16. Browser QA

When browser tooling is available, inspect the actual rendered Odoo test website.

Check:

- console errors
- network failures
- responsive behavior
- broken links
- layout shifts
- accessibility
- page performance
- forms
- navigation behavior

Browser validation must target the redesign/test database.

Do not use production as the experimental QA environment.

---

# 17. Context and Token Efficiency

Avoid dumping the entire repository into context unnecessarily.

Prefer:

- targeted file reads
- search before reading large files
- Repomix when broad repository understanding is required
- Context Mode when available
- concise command output
- focused diffs

Do not repeatedly reread unchanged files.

Do not generate enormous summaries after every small task.

---

# 18. Git Rules

Git is the source of truth.

Before modifying code:

1. inspect repository status
2. inspect relevant files
3. understand current implementation

Do not:

- force push
- rewrite published history
- delete unrelated work
- reset unrelated changes
- commit secrets
- commit credentials
- commit Odoo login information

Keep changes focused.

Use meaningful commit messages.

Do not commit automatically unless explicitly requested.

---

# 19. Secrets

Never store credentials in source control.

Do not put the following into tracked files:

- Odoo passwords
- API keys
- access tokens
- private credentials
- session cookies
- production secrets

Use ignored local environment files when necessary.

---

# 20. Change Discipline

Before implementation, state briefly:

- what is being changed
- which files are expected to change
- what will NOT be changed

After implementation, report:

- files changed
- verification performed
- unresolved issues
- recommended next step

Do not silently expand scope.

If an unrelated problem is discovered, report it separately instead of fixing it without approval.

---

# 21. First Project Phase

The immediate objective is NOT redesign.

Phase 0 is:

1. inspect repository
2. establish documentation
3. configure safe Odoo module structure
4. establish asset architecture
5. establish local build/package workflow
6. generate an Odoo Online-compatible ZIP
7. perform a harmless import into the test database
8. verify installation/update/removal behavior
9. document rollback procedure

The first validation package should cause no meaningful visual redesign.

Only after Phase 0 succeeds should actual design implementation begin.

---

# 22. Approval Gates

Stop and request approval before:

- first Odoo import
- major architecture changes
- adding substantial dependencies
- replacing existing page content
- deploying to production
- modifying tracking/analytics
- changing CRM behavior
- removing significant existing content

Do not assume approval from previous unrelated tasks.

---

# 23. Definition of Done

A task is not complete merely because code was written.

Depending on scope, completion requires:

- valid code
- compatible Odoo package
- clean Git diff
- responsive verification
- browser verification
- no obvious console errors
- documentation updated when needed
- no unintended production changes
- explicit report of remaining limitations

Safety and maintainability take priority over speed.
