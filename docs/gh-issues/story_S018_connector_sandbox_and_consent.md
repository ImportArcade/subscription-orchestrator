# Story S018 — Connector sandbox & consent workflow

Parent Epic: E006 — Connectors & Safe Automation
Story ID: S018

Description:
Implement user consent flows and sandbox mode for connectors; ensure token handling is secure.

Acceptance Criteria:
- Consent UI/API flows exist (or documented endpoints) for connecting a provider.
- Tokens are stored encrypted and scoped; tests verify encryption in dev mode with mock KMS.

Priority: High
Estimate: 2d

Notes:
- Record consent actions in the audit log for compliance.
