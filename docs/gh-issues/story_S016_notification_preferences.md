# Story S016 — Opt-ins and user preferences

Parent Epic: E005 — Notification Service
Story ID: S016

Description:
Allow users to set notification channel preferences and opt-out rules.

Acceptance Criteria:
- Preference model and endpoints to read/update them.
- Worker respects preferences when choosing transport.

Priority: Medium
Estimate: 1d

Notes:
- Include a default safe preference (email + in-app) and allow users to opt into push/SMS explicitly.
