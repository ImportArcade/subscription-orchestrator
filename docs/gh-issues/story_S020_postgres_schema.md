# Story S020 — Postgres schema & migrations

Parent Epic: E007 — Data Storage & Secrets
Story ID: S020

Description:
Design DB schema for users, schedules, notifications, connectors, audit logs; add migrations using a migration tool (e.g., Knex, TypeORM, or Prisma).

Acceptance Criteria:
- Migration files present and runnable locally.
- Local DB seeded with test data for developer use.

Priority: High
Estimate: 2d

Notes:
- Choose a migration tool consistent with the project's ORM or DB layer.
