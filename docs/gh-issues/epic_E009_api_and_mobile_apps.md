# Epic E009 — API & Mobile Apps

Goal: Provide a secure, well-documented API and support for native mobile clients (iOS and Android) instead of a web UI.

Epic ID: E009

Associated User Stories:
- S026 — Public API surface (REST or GraphQL) (docs/gh-issues/story_S026_public_api_surface.md)
- S027 — Minimal mobile apps for schedule management (iOS & Android) (docs/gh-issues/story_S027_mobile_apps.md)
- S028 — In-app notification center (mobile) (docs/gh-issues/story_S028_in_app_notifications_mobile.md)

Description:
Replace the prior web UI plan with an API-first approach designed for mobile clients. Provide a documented REST or GraphQL API that the iOS and Android apps can use to authenticate, manage schedules, view upcoming reminders, and connect providers. Provide in-app notification endpoints and persistence for mobile UX.

Acceptance Criteria:
- API schema (OpenAPI or GraphQL) present and synchronized with implementation.
- Mobile clients (or mock clients) can authenticate, list/create schedules, and receive in-app notifications.

Priority: High
Estimate: 6d (sum of stories)
