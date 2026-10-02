# SummaFlow Website

Frontend redesign of **summaflow.com**, delivered as an Odoo-importable
module: `website_summaflow`.

## Purpose

Move maintainable SummaFlow website styling and behavior out of
database-stored Website Builder markup and into a versioned, reviewable
frontend module (SCSS / JavaScript / QWeb / assets).

## Target platform

- **Odoo Online SaaS**, version `saas~19.4+e` (Enterprise).
- Deployed via **Apps > Import Module** (manual upload of a ZIP).
- **Not** Odoo.sh. **Not** self-hosted.

Databases:

- Production: `sumflow` / summaflow.com — **off limits**.
- Test (neutralized redesign): `sumflow-redesign-test`.

## Restrictions

Frontend-only. The module must **not** contain:

- custom Python models, controllers, or ORM/business logic
- pip / server-side Python dependencies
- PostgreSQL migrations, Docker, Odoo.sh, or server-shell assumptions

Allowed: QWeb/XML, HTML, SCSS/CSS, browser-side JavaScript, SVG/images,
Odoo frontend asset bundles. The authoritative shared project rules are
`AGENTS.md` and `.agents/skills/odoo-online-saas/SKILL.md` (that project
skill wins on any conflict with generic Odoo guidance). `CLAUDE.md` and the
mirrored `.claude/skills/` directory exist for Claude Code tooling; they
track the `.agents` sources and are not the canonical copy.

## Repository layout

```
website_summaflow/        # the importable module
  __manifest__.py
  __init__.py             # intentionally empty (no Python logic)
  data/
  views/{pages,components}/
  static/src/{scss,js,img,icons}/
scripts/                  # Windows build + validation
docs/                     # CURRENT-SITE, CHANGE-LIST, DESIGN-SYSTEM, QA
release/                  # built ZIP (git-ignored)
```

## Development workflow

Work incrementally — one section at a time, inspect before editing, no
unrelated redesign. Full process and approval gates are in `AGENTS.md`.

### Build the importable ZIP

```powershell
npm run build
# or: powershell -ExecutionPolicy Bypass -File scripts\build.ps1
```

Output: `release\website_summaflow.zip` (module directory as the top-level
entry, ready for Apps > Import Module).

### Local validation

```powershell
npm run validate
# or: powershell -ExecutionPolicy Bypass -File scripts\validate.ps1
```

Checks (manifest, expected files, referenced assets, XML well-formedness,
secrets, ZIP layout) are **LOCAL ONLY**. They do **not** install anything
into Odoo and do not prove a working Odoo installation.

## Deployment (manual)

1. Build the ZIP from a known-good commit.
2. In the **test** database (`sumflow-redesign-test`): Apps > Import Module >
   upload `release\website_summaflow.zip` > install.
3. QA across required viewports (see `docs/QA.md`).
4. Only after test QA passes and approval is given, repeat against
   production following the Production Safety checklist in the project skill
   (backup first, record commit SHA + version, build from that exact commit).

**Test before production, always.** Never import untested packages into
`sumflow`.

## Status

Phase 0: **verified**. Module foundation + build pipeline established, and the
full local -> ZIP -> Odoo Online -> browser pipeline is confirmed on the test
database `sumflow-redesign-test.odoo.com`: import succeeded, website unchanged,
and the `--sf-module-loaded` marker returned `'1'` in the browser with no new
console errors. `website_summaflow` stays installed on the test database;
future redesign work updates this same module. See `docs/QA.md`.
