# Story S004 — Linting and formatting

Parent Epic: E001 — Repo & Dev Setup
Story ID: S004

Description:
Add ESLint, Prettier, and TypeScript rules and a pre-commit hook (husky) to run lint/stage formatting.

Acceptance Criteria:
- ESLint config present and `npm run lint` passes on the codebase.
- Prettier config present.
- Husky pre-commit hook is installed in repo docs, or instructions added.

Priority: Medium
Estimate: 0.5d

Notes:
- Keep lint rules opinionated but minimal to reduce developer friction.
