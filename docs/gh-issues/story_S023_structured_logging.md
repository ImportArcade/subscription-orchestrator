# Story S023 — Structured logging & request tracing

Parent Epic: E008 — Observability & Operations
Story ID: S023

Description:
Integrate structured logging (JSON), request IDs, and basic tracing hooks.

Acceptance Criteria:
- Requests include trace-id in logs.
- Worker logs include job id and job type.

Priority: High
Estimate: 1d

Notes:
- Consider using OpenTelemetry for traces and a lightweight logger (pino/winston) for structured logs.
