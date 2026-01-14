# Story S014 — Notification microservice / module

Parent Epic: E005 — Notification Service
Story ID: S014

Description:
Implement a notification service interface with a pluggable transport architecture (email, push, sms). Start with email (SMTP/sendgrid mock) and in-app notifications.

Acceptance Criteria:
- Notification service abstraction exists.
- Email transport using a sandbox or mock is implemented and tested.
- In-app notifications persist in DB and are retrievable via API.

Priority: High
Estimate: 3d

Notes:
- Keep transports pluggable and configuration-driven.
