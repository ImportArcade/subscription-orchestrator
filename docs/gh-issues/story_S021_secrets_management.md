# Story S021 — Secrets management & encryption

Parent Epic: E007 — Data Storage & Secrets
Story ID: S021

Description:
Integrate secrets storage using KMS or a local dev mock; encrypt tokens at rest and only decrypt in worker context as needed.

Acceptance Criteria:
- Secrets API and encryption functions present.
- Integration test verifies encryption/decryption using mock KMS.

Priority: High
Estimate: 1d

Notes:
- For local development, provide a simple envelope encryption mock and document how to configure real KMS in production.
