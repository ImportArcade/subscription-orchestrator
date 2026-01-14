# Story S013 — Job types & routing

Parent Epic: E004 — Queue & Worker Platform
Story ID: S013

Description:
Define job schemas for "send reminder", "attempt automation", "audit log entry", and related payloads.

Acceptance Criteria:
- Clear JSON schema/spec for each job type documented.
- Worker routing logic uses job type to dispatch to handlers.

Priority: Medium
Estimate: 1d

Notes:
- Document extensibility for future connector-specific job types.
