# Epic E007 — Data Storage & Secrets

Goal: Provide durable storage for domain data, audit logs, and encrypted secrets for connectors.

Epic ID: E007

Associated User Stories:
- S020 — Postgres schema & migrations (docs/gh-issues/story_S020_postgres_schema.md)
- S021 — Secrets management & encryption (docs/gh-issues/story_S021_secrets_management.md)
- S022 — Audit logging & event store (docs/gh-issues/story_S022_audit_logging.md)

Description:
Design the primary data store (Postgres) schemas for the domain, migrations, and an approach for encrypting connector tokens and secrets using a KMS (or local mock for development).

Acceptance Criteria:
- Migration files present and runnable locally.
- Secrets are stored encrypted at rest.
- Audit logs are appended for mutating actions.

Priority: High
Estimate: 4d (sum of stories)
