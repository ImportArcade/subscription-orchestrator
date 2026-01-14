# Story S012 — Worker framework & job retry semantics

Parent Epic: E004 — Queue & Worker Platform
Story ID: S012

Description:
Implement worker process with retry/backoff, idempotency support, and error handling.

Acceptance Criteria:
- Worker handles success, transient failures (retries), and permanent failures (dead-letter or logging) correctly.
- Idempotency keys supported for actions that might be re-run.

Priority: High
Estimate: 2d

Notes:
- Use job metadata to store idempotency keys and trace information.
