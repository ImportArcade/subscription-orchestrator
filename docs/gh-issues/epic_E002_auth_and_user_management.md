# Epic E002 — Authentication & User Management

Goal: Provide secure user auth and account management using OAuth2/OIDC compatible flows.

Epic ID: E002

Associated User Stories:
- S005 — Auth provider integration & local flow (docs/gh-issues/story_S005_auth_provider_integration.md)
- S006 — User model & profile endpoints (docs/gh-issues/story_S006_user_model_and_profile.md)
- S007 — Authorization roles and RBAC basics (docs/gh-issues/story_S007_rbac_basics.md)

Description:
Implement authentication and authorization scaffolding to protect APIs and maintain user profiles. Support pluggable OIDC/OAuth2 providers with a mock provider for local development.

Acceptance Criteria:
- End-to-end sign-in flow available (production provider config optional).
- Profile endpoints implemented and protected.
- RBAC middleware present with at least one admin-only endpoint.

Priority: High
Estimate: 4d (sum of stories)
