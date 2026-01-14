# Story S008 — Schedule data model & API

Parent Epic: E003 — Scheduling & Scheduler Service
Story ID: S008

Description:
Define the `schedule` model, CRUD API for schedules (create, read, update, delete) and validation of cron-like triggers and date ranges.

Acceptance Criteria:
- DB schema/migrations for schedules.
- REST or GraphQL endpoints for CRUD operations, protected by auth.
- Validation and unit tests for schedule serialization and parsing.

Priority: High
Estimate: 2d

Notes:
- Include fields for: userId, targetProvider (optional), action (subscribe/unsubscribe), trigger (cron/expression), timezone, start/end range, metadata.
