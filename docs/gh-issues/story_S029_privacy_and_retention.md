# Story S029 — Privacy & data retention policy

Parent Epic: E010 — Compliance, Security & Legal
Story ID: S029

Description:
Add documentation and enforceable settings for deleting user data, retention windows for audit logs, and export requests.

Acceptance Criteria:
- `docs/privacy.md` added with retention policies.
- API endpoint to delete or export user data implemented (soft delete + purge workflow).

Priority: High
Estimate: 1d

Notes:
- Make sure the deletion flow includes revocation of connector tokens and removal from backups.
