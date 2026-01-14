# Story S010 — Timezone and recurrence edge-cases

Parent Epic: E003 — Scheduling & Scheduler Service
Story ID: S010

Description:
Ensure schedule handling respects user timezones and recurring patterns, with tests for boundary cases.

Acceptance Criteria:
- Test cases for DST transitions and timezone-aware scheduling.

Priority: Medium
Estimate: 1d

Notes:
- Use timezone-aware libraries (e.g., luxon or date-fns-tz) and clearly document assumptions about user timezone storage.
