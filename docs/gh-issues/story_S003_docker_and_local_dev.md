# Story S003 — Docker & local dev scripts

Parent Epic: E001 — Repo & Dev Setup
Story ID: S003

Description:
Provide a `Dockerfile` and `docker-compose` (or Dev container) for local development including Postgres and a queue (Redis) so devs can boot a local environment.

Acceptance Criteria:
- `Dockerfile` builds image for the app.
- `docker-compose.yml` brings up app, Postgres, and Redis and has basic health checks.

Priority: Medium
Estimate: 1d

Notes:
- Keep the compose file optional for contributors who prefer local tooling; document how to use it in `docs/`.
