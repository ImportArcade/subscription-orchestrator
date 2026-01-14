# Story S019 — Fallback-first automation policy

Parent Epic: E006 — Connectors & Safe Automation
Story ID: S019

Description:
Default behavior remains "reminder-first"; automation attempts require explicit user opt-in and logging.

Acceptance Criteria:
- System-level config and per-user flag to enable orchestration.
- Audit trail entries created for attempted automated actions.

Priority: High
Estimate: 1d

Notes:
- Automation should be gated by legal and ToS checks; ensure consent and opt-in are explicit and auditable.
