# Story S001 — Project scaffold

Parent Epic: E001 — Repo & Dev Setup
Story ID: S001

Description:
Initialize a Node.js + TypeScript project with a clear folder layout (`src/`, `tests/`, `scripts/`, `infra/`, `docs/`). Add a basic `package.json`, `tsconfig.json`, and README with contribution notes.

Acceptance Criteria:
- `package.json` and `tsconfig.json` present and contain scripts for build, test, lint, and start.
- `src/`, `tests/`, `infra/`, `scripts/` directories exist with README files.
- Local dev run: `npm run build` and `npm test` succeed (minimal passing test).

Priority: High
Estimate: 1d

Notes:
- Use Node.js + TypeScript as specified in `docs/vision.md`.
- Provide simple example code and a single unit test to validate the test runner configuration.
