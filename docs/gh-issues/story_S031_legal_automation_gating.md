# Story S031 — Legal/ToS automation gating

Parent Epic: E010 — Compliance, Security & Legal
Story ID: S031

Description:
Provide explicit gating such that automation for a connector requires user confirmation and a documented consent record.

Acceptance Criteria:
- Consent records stored and related to audit logs.
- UI/flow (API flows for mobile clients) shows clearly when automation is enabled and what permissions it requires.

Priority: High
Estimate: 1d

Notes:
- Store consent metadata (timestamp, user, provider, scope) and surface it in audit queries.
