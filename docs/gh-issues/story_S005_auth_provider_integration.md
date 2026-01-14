# Story S005 — Auth provider integration & local flow

Parent Epic: E002 — Authentication & User Management
Story ID: S005

Description:
Add an authentication layer that supports OAuth2/OIDC sign-in using a pluggable provider (e.g., Auth0, Keycloak, or a mock for local dev). Implement session management using secure cookies or JWT.

Acceptance Criteria:
- Routes for sign-in, callback, sign-out exist.
- Session management is implemented with secure cookies or JWT.
- Local dev environment includes a mock or test OAuth flow.

Priority: High
Estimate: 2d

Notes:
- Use environment-driven provider configuration so multiple providers can be swapped easily.
