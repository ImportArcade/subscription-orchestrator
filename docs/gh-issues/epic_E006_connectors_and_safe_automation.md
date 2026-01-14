# Epic E006 — Connectors & Safe Automation

Goal: Provide a connector interface for third-party subscription providers, prioritizing safe, compliant automation and fallbacks to reminders.

Epic ID: E006

Associated User Stories:
- S017 — Connector interface & SDK (docs/gh-issues/story_S017_connector_interface.md)
- S018 — Connector sandbox & consent workflow (docs/gh-issues/story_S018_connector_sandbox_and_consent.md)
- S019 — Fallback-first automation policy (docs/gh-issues/story_S019_fallback_first_policy.md)

Description:
Design connector interfaces and a consent workflow to safely interact with third-party providers where permitted. Default to reminder-first behavior and require explicit user opt-in for any automated actions.

Acceptance Criteria:
- Connector interface documented and at least one stub connector implemented.
- Consent flow and token handling implemented for sandbox mode.
- System respects per-user automation opt-in flags.

Priority: High
Estimate: 5d (sum of stories)
