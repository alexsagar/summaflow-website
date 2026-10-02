# SummaFlow Website — Claude Code Instructions

You are working on the SummaFlow website redesign.

## Authoritative Instructions

Before making changes, read:

AGENTS.md

AGENTS.md is the authoritative project-wide operating manual.

Also read the relevant documents under:

docs/

especially:

- docs/CURRENT-SITE.md
- docs/CHANGE-LIST.md
- docs/DESIGN-SYSTEM.md
- docs/QA.md

## Skills

Project skills are available under:

.claude/skills/

For Odoo work, use this priority:

1. odoo-online-saas
2. odoo-19
3. odoo-workflow

If generic Odoo guidance conflicts with `odoo-online-saas`,
the `odoo-online-saas` skill wins.

Use frontend/design/QA skills only when relevant to the current task.
Do not invoke every skill unnecessarily.

## Platform

Target:

- Odoo Online SaaS
- saas~19.4+e
- Enterprise Edition

Test database:

sumflow-redesign-test

Production:

sumflow / summaflow.com

Production is off limits unless explicit approval is given.

This is not Odoo.sh and not self-hosted Odoo.

Do not assume:

- SSH
- Odoo server shell
- direct PostgreSQL access
- Docker deployment
- custom backend Python execution

Frontend work must remain compatible with Odoo Online Import Module.

## Development Discipline

Work incrementally.

Do not redesign unrelated areas while completing a focused task.

Inspect before editing.

Do not commit automatically.

Do not deploy automatically.

Do not import anything into Odoo without explicit approval.

When a task is complete, report:

- files changed
- verification performed
- unresolved concerns
- next recommended step

For the current project phase, follow the Phase 0 instructions supplied by the user.
