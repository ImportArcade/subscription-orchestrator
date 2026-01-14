# Epic E005 — Notification Service

Goal: Provide a unified service for delivering reminders via email, push, SMS and in-app notifications.

Epic ID: E005

Associated User Stories:
- S014 — Notification microservice / module (docs/gh-issues/story_S014_notification_module.md)
- S015 — Notification templates & personalization (docs/gh-issues/story_S015_notification_templates.md)
- S016 — Opt-ins and user preferences (docs/gh-issues/story_S016_notification_preferences.md)

Description:
Implement a notification subsystem with pluggable transports, templating, and persistence for in-app messages. Start with email (sandbox/mock) and in-app notifications.

Acceptance Criteria:
- Notification service abstraction exists.
- Email transport using a sandbox or mock is implemented and tested.
- In-app notifications persist in DB and are retrievable via API.

Priority: High
Estimate: 5d (sum of stories)
