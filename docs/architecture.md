## Subscription Orchestrator — Architecture

This document describes the architecture for the "subscription scheduler" app: a service that allows users to define a schedule of when they want to be subscribed to different streaming services and automates or reminds them to subscribe/unsubscribe according to that schedule.

At a high level the app supports two modes:
- Reminder-first (default): the app sends reminders/notifications when a scheduled subscribe/unsubscribe action is due so the user can confirm manually.
- Orchestration (Possibly in the future, not currently possible or legal): the app attempts to perform the subscribe/unsubscribe action on the user's behalf using connectors to third-party services or browser automation where APIs exist.

Below are the architecture decisions, component responsibilities, data shapes, operational requirements, and rationale for each choice.

## System contract
- Inputs:
	- Authenticated user actions: create/update/delete subscription schedules.
	- External connector callbacks (optional) and webhook events.
	- Time / schedule triggers (cron-like times or calendar ranges).
- Outputs:
	- Time-based reminders, notifications, and optional automated subscribe/unsubscribe actions.
	- Audit logs of all actions taken and notifications sent.
- Success criteria:
	- Reliable firing of scheduled reminders/actions within acceptable time window (e.g., ±1 minute for critical reminders; relaxed for non-critical).
	- Clear, auditable history for every schedule and action.
	- Safe handling of secrets and user credentials (encrypted-at-rest, minimal scope).

## High-level architecture

Components (logical):
- Web / API layer (REST or GraphQL) — user management, UI/API for creating schedules.
- Authentication & Authorization — OAuth2 / OIDC provider for sign-in + session management.
- Scheduler / Orchestrator — a service that evaluates schedules and enqueues jobs at the right time.
- Job Queue & Worker Pool — reliable queue for processing scheduled jobs and running connectors.
- Notification Service — handles email, push, SMS and in-app notifications.
- Connector Layer — adapters for third-party subscription providers (optional). Each connector encapsulates API differences.
- Data Store — relational DB (Postgres) for primary state; optional event store or table for audit logs.
- Secrets & Keys — KMS for encrypting tokens/credentials.
- Observability — logging, metrics, tracing and alerting.

Suggested deployment topology (small-to-medium scale):
- API and web UI: containerized Node.js (Next.js or similar) or serverless functions.
- Scheduler: either a managed schedule (EventBridge / Cloud Scheduler) to push jobs into the queue, or a lightweight scheduler process that enqueues jobs.
- Queue: managed message queue (SQS, Redis streams with BullMQ, Google Pub/Sub) depending on cloud vendor.
- Workers: horizontally scalable worker processes (Node.js/TS) consuming the queue.
- Database: managed Postgres (RDS/Aurora / Cloud SQL).

Rationale: a simple, robust queue + worker model separates schedule evaluation (when to act) from action execution (what to do), improving resilience and observability.
