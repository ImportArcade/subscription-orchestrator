# Story S002 — CI pipeline (GitHub Actions)

Parent Epic: E001 — Repo & Dev Setup
Story ID: S002

Description:
Add GitHub Actions workflow to run lint, build, and tests on push and PRs.

Acceptance Criteria:
- Workflow file present in `.github/workflows/ci.yml`.
- Workflow runs and passes on a branch (CI config validates commands used in `package.json`).

Priority: High
Estimate: 1d

Notes:
- Include caching for node_modules where appropriate and fail fast on lint/build errors.
