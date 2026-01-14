# Story S027 — Minimal mobile apps for schedule management (iOS & Android)

Parent Epic: E009 — API & Mobile Apps
Story ID: S027

Description:
Implement minimal native mobile clients (or reference clients) for iOS and Android that allow users to sign-in, view subscription visibility, create/edit schedules, view upcoming reminders, and manage connectors. These can be lightweight reference apps or a shared cross-platform skeleton if preferred.

Acceptance Criteria:
- Reference mobile app(s) or clear API-driven mock clients demonstrate the flows: sign-in, create/edit schedule, view upcoming reminders, connect provider (consent).
- CI-ready instructions or scripts for building the reference clients (or a simple mock client using HTTP requests) included in `docs/`.

Priority: High
Estimate: 4d

Notes:
- These can initially be thin wrappers or sample apps; full production mobile features are out of scope for the MVP.
