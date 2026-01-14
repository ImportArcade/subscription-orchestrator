# Epic E003 — Scheduling & Scheduler Service

Goal: Core domain: allow users to create schedules and ensure the system reliably evaluates and triggers those schedules.

Epic ID: E003

Associated User Stories:
- S008 — Schedule data model & API (docs/gh-issues/story_S008_schedule_model_and_api.md)
- S009 — Scheduler process (enqueueing) (docs/gh-issues/story_S009_scheduler_process.md)
- S010 — Timezone and recurrence edge-cases (docs/gh-issues/story_S010_timezone_and_recurrence.md)

Description:
Implement the schedule model and a scheduler that evaluates schedules and enqueues jobs at the right times. Support cron-like expressions, calendar ranges, and single-dates with timezone-aware handling.

Acceptance Criteria:
- Schedules can be created, updated, listed, and deleted via API.
- Scheduler process can be run to enqueue jobs for due schedules.
- Tests covering recurrence and timezone edge cases exist.

Priority: High
Estimate: 6d (sum of stories)
