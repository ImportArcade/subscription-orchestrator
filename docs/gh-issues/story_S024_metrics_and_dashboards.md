# Story S024 — Metrics and dashboards

Parent Epic: E008 — Observability & Operations
Story ID: S024

Description:
Expose Prometheus-compatible metrics and create basic dashboards (jobs processed, failed, queued; schedules due; notifications sent).

Acceptance Criteria:
- `/metrics` endpoint present.
- Example Grafana dashboard JSON added to `infra/`.

Priority: Medium
Estimate: 1d

Notes:
- Keep metric names and labels consistent for easy aggregation.
