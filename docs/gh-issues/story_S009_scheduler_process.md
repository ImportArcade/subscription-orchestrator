# Story S009 — Scheduler process (enqueueing)

Parent Epic: E003 — Scheduling & Scheduler Service
Story ID: S009

Description:
Implement a scheduler process that evaluates active schedules and enqueues jobs at the required times.

Acceptance Criteria:
- Scheduler can be run locally and will enqueue test jobs to the configured queue when a mock schedule is due.
- Tests cover schedule evaluation logic (time zones, daylight savings, range vs single date, cron expressions).

Priority: High
Estimate: 3d

Notes:
- Provide a lightweight process that can be run as a managed scheduled job (e.g., cloud scheduler) or as a continuously running service.
