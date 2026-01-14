# Story S006 — User model & profile endpoints

Parent Epic: E002 — Authentication & User Management
Story ID: S006

Description:
Implement a user model in Postgres and API endpoints to fetch and update profile data.

Acceptance Criteria:
- Database migration/schema for users exists.
- Endpoints: `GET /me`, `PATCH /me` implemented and protected by auth.

Priority: High
Estimate: 1d

Notes:
- Keep profile fields minimal: id, email, displayName, timezone, preferredChannels.
