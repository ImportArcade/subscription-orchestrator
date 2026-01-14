# Story S022 — Audit logging & event store

Parent Epic: E007 — Data Storage & Secrets
Story ID: S022

Description:
Record an immutable audit log for all schedule changes, notifications sent, and connector actions.

Acceptance Criteria:
- Audit table exists and is appended to for every significant action.
- API to query audit entries by schedule and by user implemented.

Priority: High
Estimate: 1d

Notes:
- Consider append-only table schema and retention policy in a later story.
