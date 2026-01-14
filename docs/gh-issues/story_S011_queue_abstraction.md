# Story S011 — Queue abstraction and local driver

Parent Epic: E004 — Queue & Worker Platform
Story ID: S011

Description:
Implement an abstract queue interface and a concrete local/Redis driver (e.g., BullMQ) for development.

Acceptance Criteria:
- Queue interface and Redis-backed implementation exist.
- Integration tests show enqueue → worker consume for a sample job type.

Priority: High
Estimate: 2d

Notes:
- Design the interface so it can later be swapped for SQS or Pub/Sub.
