# Epic E004 — Queue & Worker Platform

Goal: Implement a robust job queue and worker pool for executing scheduled actions and running connectors.

Epic ID: E004

Associated User Stories:
- S011 — Queue abstraction and local driver (docs/gh-issues/story_S011_queue_abstraction.md)
- S012 — Worker framework & job retry semantics (docs/gh-issues/story_S012_worker_framework.md)
- S013 — Job types & routing (docs/gh-issues/story_S013_job_types_and_routing.md)

Description:
Provide a pluggable queue abstraction and worker framework with retry/backoff and idempotency support. Start with a Redis-backed queue (BullMQ) for local development.

Acceptance Criteria:
- Queue interface and at least one driver implemented.
- Worker supports retries, backoff, and dead-letter handling.

Priority: High
Estimate: 5d (sum of stories)
