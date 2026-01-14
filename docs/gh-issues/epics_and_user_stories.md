# Epics & User Stories

This file lists Epics and User Stories derived from `docs/architecture.md` and `docs/vision.md`. Each item is written in a GitHub-issue-friendly format: title, description, acceptance criteria, priority, and rough estimate.

---

## Epic: Repo & Dev Setup
Goal: Create a reproducible Node.js + TypeScript developer environment and baseline repo layout so feature work can proceed.

- Story: Project scaffold
  - Description: Initialize a Node.js + TypeScript project with a clear folder layout (`src/`, `tests/`, `scripts/`, `infra/`, `docs/`). Add a basic `package.json`, `tsconfig.json`, and README with contribution notes.
  - Acceptance Criteria:
    - `package.json` and `tsconfig.json` present and contain scripts for build, test, lint, and start.
    - `src/`, `tests/`, `infra/`, `scripts/` directories exist with README files.
    - Local dev run: `npm run build` and `npm test` succeed (minimal passing test).
  - Priority: High
  - Estimate: 1d

- Story: CI pipeline (GitHub Actions)
  - Description: Add GitHub Actions workflow to run lint, build, and tests on push and PRs.
  - Acceptance Criteria:
    - Workflow file present in `.github/workflows/ci.yml`.
    - Workflow runs and passes on a branch (CI config validates commands used in `package.json`).
  - Priority: High
  - Estimate: 1d

- Story: Docker & local dev scripts
  - Description: Provide a `Dockerfile` and `docker-compose` (or Dev container) for local development including Postgres and a queue (Redis) so devs can boot a local environment.
  - Acceptance Criteria:
    - `Dockerfile` builds image for the app.
    - `docker-compose.yml` brings up app, Postgres, and Redis and has basic health checks.
  - Priority: Medium
  - Estimate: 1d

- Story: Linting and formatting
  - Description: Add ESLint, Prettier, and TypeScript rules and a pre-commit hook (husky) to run lint/stage formatting.
  - Acceptance Criteria:
    - ESLint config present and `npm run lint` passes on the codebase.
    - Prettier config present.
    - Husky pre-commit hook is installed in repo docs, or instructions added.
  - Priority: Medium
  - Estimate: 0.5d

---

## Epic: Authentication & User Management
Goal: Provide secure user auth and account management using OAuth2/OIDC compatible flows.

- Story: Auth provider integration & local flow
  - Description: Add an authentication layer that supports OAuth2/OIDC sign-in using a pluggable provider (e.g., Auth0, Keycloak, or a mock for local dev).
  - Acceptance Criteria:
    - Routes for sign-in, callback, sign-out exist.
    - Session management is implemented with secure cookies or JWT.
    - Local dev environment includes a mock or test OAuth flow.
  - Priority: High
  - Estimate: 2d

- Story: User model & profile endpoints
  - Description: Implement a user model in Postgres and API endpoints to fetch and update profile data.
  - Acceptance Criteria:
    - Database migration/schema for users exists.
    - Endpoints: `GET /me`, `PATCH /me` implemented and protected by auth.
  - Priority: High
  - Estimate: 1d

- Story: Authorization roles and RBAC basics
  - Description: Introduce minimal role-based access controls for admin and user operations.
  - Acceptance Criteria:
    - Middleware to check roles present.
    - At least one admin-only endpoint exists and is protected.
  - Priority: Medium
  - Estimate: 1d

---

## Epic: Scheduling & Scheduler Service
Goal: Core domain: allow users to create schedules and ensure the system reliably evaluates and triggers those schedules.

- Story: Schedule data model & API
  - Description: Define the `schedule` model, CRUD API for schedules (create, read, update, delete) and validation of cron-like triggers and date ranges.
  - Acceptance Criteria:
    - DB schema/migrations for schedules.
    - REST or GraphQL endpoints for CRUD operations, protected by auth.
    - Validation and unit tests for schedule serialization and parsing.
  - Priority: High
  - Estimate: 2d

- Story: Scheduler process (enqueueing)
  - Description: Implement a scheduler process that evaluates active schedules and enqueues jobs at the required times.
  - Acceptance Criteria:
    - Scheduler can be run locally and will enqueue test jobs to the configured queue when a mock schedule is due.
    - Tests cover schedule evaluation logic (time zones, daylight savings, range vs single date, cron expressions).
  - Priority: High
  - Estimate: 3d

- Story: Timezone and recurrence edge-cases
  - Description: Ensure schedule handling respects user timezones and recurring patterns, with tests for boundary cases.
  - Acceptance Criteria:
    - Test cases for DST transitions and timezone-aware scheduling.
  - Priority: Medium
  - Estimate: 1d

---

## Epic: Queue & Worker Platform
Goal: Implement a robust job queue and worker pool for executing scheduled actions and running connectors.

- Story: Queue abstraction and local driver
  - Description: Implement an abstract queue interface and a concrete local/Redis driver (e.g., BullMQ) for development.
  - Acceptance Criteria:
    - Queue interface and Redis-backed implementation exist.
    - Integration tests show enqueue → worker consume for a sample job type.
  - Priority: High
  - Estimate: 2d

- Story: Worker framework & job retry semantics
  - Description: Implement worker process with retry/backoff, idempotency support, and error handling.
  - Acceptance Criteria:
    - Worker handles success, transient failures (retries), and permanent failures (dead-letter or logging) correctly.
    - Idempotency keys supported for actions that might be re-run.
  - Priority: High
  - Estimate: 2d

- Story: Job types & routing
  - Description: Define job schemas for "send reminder", "attempt automation", "audit log entry", and related payloads.
  - Acceptance Criteria:
    - Clear JSON schema/spec for each job type documented.
    - Worker routing logic uses job type to dispatch to handlers.
  - Priority: Medium
  - Estimate: 1d

---

## Epic: Notification Service
Goal: Provide a unified service for delivering reminders via email, push, SMS and in-app notifications.

- Story: Notification microservice / module
  - Description: Implement a notification service interface with a pluggable transport architecture (email, push, sms). Start with email (SMTP/sendgrid mock) and in-app notifications.
  - Acceptance Criteria:
    - Notification service abstraction exists.
    - Email transport using a sandbox or mock is implemented and tested.
    - In-app notifications persist in DB and are retrievable via API.
  - Priority: High
  - Estimate: 3d

- Story: Notification templates & personalization
  - Description: Provide templating for notification messages with user and schedule context.
  - Acceptance Criteria:
    - Template engine integrated (e.g., handlebars) and at least two templates created (reminder, confirmation).
    - Tests verify templating and variable substitution.
  - Priority: Medium
  - Estimate: 1d

- Story: Opt-ins and user preferences
  - Description: Allow users to set notification channel preferences and opt-out rules.
  - Acceptance Criteria:
    - Preference model and endpoints to read/update them.
    - Worker respects preferences when choosing transport.
  - Priority: Medium
  - Estimate: 1d

---

## Epic: Connectors & Safe Automation
Goal: Provide a connector interface for third-party subscription providers, prioritizing safe, compliant automation and fallbacks to reminders.

- Story: Connector interface & SDK
  - Description: Define a connector interface describing connect, authenticate, subscribe, unsubscribe, and verify actions. Provide SDK for building connectors.
  - Acceptance Criteria:
    - Interface documented and a sample stub connector implemented (mock provider).
    - Unit tests for connector behavior.
  - Priority: High
  - Estimate: 2d

- Story: Connector sandbox & consent workflow
  - Description: Implement user consent flows and sandbox mode for connectors; ensure token handling is secure.
  - Acceptance Criteria:
    - Consent UI/API flows exist (or documented endpoints) for connecting a provider.
    - Tokens are stored encrypted and scoped; tests verify encryption in dev mode with mock KMS.
  - Priority: High
  - Estimate: 2d

- Story: Fallback-first automation policy
  - Description: Default behavior remains "reminder-first"; automation attempts require explicit user opt-in and logging.
  - Acceptance Criteria:
    - System-level config and per-user flag to enable orchestration.
    - Audit trail entries created for attempted automated actions.
  - Priority: High
  - Estimate: 1d

---

## Epic: Data Storage & Secrets
Goal: Provide durable storage for domain data, audit logs, and encrypted secrets for connectors.

- Story: Postgres schema & migrations
  - Description: Design DB schema for users, schedules, notifications, connectors, audit logs; add migrations using a migration tool (e.g., Knex, TypeORM, or Prisma).
  - Acceptance Criteria:
    - Migration files present and runnable locally.
    - Local DB seeded with test data for developer use.
  - Priority: High
  - Estimate: 2d

- Story: Secrets management & encryption
  - Description: Integrate secrets storage using KMS or a local dev mock; encrypt tokens at rest and only decrypt in worker context as needed.
  - Acceptance Criteria:
    - Secrets API and encryption functions present.
    - Integration test verifies encryption/decryption using mock KMS.
  - Priority: High
  - Estimate: 1d

- Story: Audit logging & event store
  - Description: Record an immutable audit log for all schedule changes, notifications sent, and connector actions.
  - Acceptance Criteria:
    - Audit table exists and is appended to for every significant action.
    - API to query audit entries by schedule and by user implemented.
  - Priority: High
  - Estimate: 1d

---

## Epic: Observability & Operations
Goal: Add logging, metrics, tracing, and alerting hooks for production readiness.

- Story: Structured logging & request tracing
  - Description: Integrate structured logging (JSON), request IDs, and basic tracing hooks.
  - Acceptance Criteria:
    - Requests include trace-id in logs.
    - Worker logs include job id and job type.
  - Priority: High
  - Estimate: 1d

- Story: Metrics and dashboards
  - Description: Expose Prometheus-compatible metrics and create basic dashboards (jobs processed, failed, queued; schedules due; notifications sent).
  - Acceptance Criteria:
    - `/metrics` endpoint present.
    - Example Grafana dashboard JSON added to `infra/`.
  - Priority: Medium
  - Estimate: 1d

- Story: Alerts and SLOs
  - Description: Define basic alert rules (high error rate, queue backlog) and document SLO targets for schedule delivery latency.
  - Acceptance Criteria:
    - Alerting rules documented or added to infra config.
    - SLOs documented in `docs/`.
  - Priority: Medium
  - Estimate: 0.5d

---

## Epic: API & Web UI
Goal: Provide a user-friendly UI and API for managing subscriptions, schedules, connectors, and notifications.

- Story: Public API surface (REST or GraphQL)
  - Description: Define and implement the API endpoints needed by the web UI and third-party integrations for schedules, users, connectors, and notifications.
  - Acceptance Criteria:
    - OpenAPI or GraphQL schema present and synchronized with implementation.
    - Endpoints secured and documented.
  - Priority: High
  - Estimate: 2d

- Story: Minimal web UI for schedule management
  - Description: Implement a small Next.js (or equivalent) UI for users to sign-in, create schedules, view upcoming reminders and connect providers.
  - Acceptance Criteria:
    - Pages: sign-in, dashboard (subscription visibility), schedule create/edit, connector management.
    - Integration tests (or smoke manual steps) validated in local dev Docker compose environment.
  - Priority: High
  - Estimate: 4d

- Story: In-app notification center
  - Description: UI section for in-app notifications and audit/history for each schedule.
  - Acceptance Criteria:
    - User can view and dismiss in-app notifications.
    - Audit history for a schedule visible in the UI.
  - Priority: Medium
  - Estimate: 2d

---

## Epic: Compliance, Security & Legal
Goal: Ensure designs honor terms of service constraints, safe handling of credentials, and privacy rules.

- Story: Privacy & data retention policy
  - Description: Add documentation and enforceable settings for deleting user data, retention windows for audit logs, and export requests.
  - Acceptance Criteria:
    - `docs/privacy.md` added with retention policies.
    - API endpoint to delete or export user data implemented (soft delete + purge workflow).
  - Priority: High
  - Estimate: 1d

- Story: Security review checklist
  - Description: Provide a security checklist that covers encryption, least privilege for connectors, tokens handling, and dependency scanning.
  - Acceptance Criteria:
    - Checklist added to `docs/` and a basic threat model documented.
  - Priority: Medium
  - Estimate: 0.5d

- Story: Legal/ToS automation gating
  - Description: Provide explicit gating such that automation for a connector requires user confirmation and a documented consent record.
  - Acceptance Criteria:
    - Consent records stored and related to audit logs.
    - UI/flow shows clearly when automation is enabled and what permissions it requires.
  - Priority: High
  - Estimate: 1d

---

## Notes & Next Steps
- These epics and stories are scoped to produce a minimally viable, safe `reminder-first` product and a careful path to optional orchestration.
- Suggested immediate priorities for an MVP: Repo & Dev Setup, Auth & User Management, Scheduling core (model + enqueue), Queue & Worker baseline, Notification (email + in-app), Postgres schema, Secrets encryption mock, and basic UI.
- If you'd like, I can:
  - Open these as ready-to-import GitHub issues with labels and estimates.
  - Create templates for issue creation or PR templates.
  - Generate the initial migration and code stubs for the highest-priority stories.

---

Generated from `docs/architecture.md` and `docs/vision.md`.
