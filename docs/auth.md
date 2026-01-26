# Authentication (Auth0) — Mobile + Backend

This document describes the recommended Auth0-based authentication approach for the mobile clients (iOS / Android) and the Fastify backend.

Goals
- Use secure, standard OIDC flows for mobile (Authorization Code Flow with PKCE).
- Keep tokens secure on device (Keychain / EncryptedSharedPreferences).
- Backend verifies access tokens for API calls and maps users to the internal `users` model.

Recommended Architecture (Option A — PKCE on Mobile)
- Mobile apps perform Authorization Code Flow with PKCE directly against Auth0.
- Mobile receives an `access_token` (short-lived) and optionally a `refresh_token` (use Refresh Token Rotation).
- Mobile stores tokens in platform-secure storage (iOS Keychain, Android EncryptedSharedPreferences).
- Mobile calls your API with `Authorization: Bearer <access_token>`.
- Backend validates access tokens (signature, `iss`, `aud`, `exp`, `scope`) using Auth0 JWKS.

Why PKCE on mobile?
- PKCE prevents interception of the authorization code and is the recommended flow for native apps.
- Direct mobile auth is simpler to implement and provides a good UX.
- Refresh Token Rotation reduces risk if refresh tokens are compromised.

Auth0 configuration checklist
1. Create an **Application** in Auth0 (Native app) for each mobile platform.
   - Allowed Callback URLs: add your app scheme (e.g., `com.your.app://callback`) and any local dev redirect you use.
   - Allowed Logout URLs and Allowed Origins as needed.
2. Create an **API** in Auth0 (this defines the `audience` for access tokens). Use a stable identifier (e.g., `https://api.subscription-orchestrator.local`).
3. When requesting authorization from mobile, include the `audience` so Auth0 issues an access token for your API.
4. Enable **Refresh Token Rotation** in the Application settings if you plan to issue refresh tokens to mobile.

Environment variables (add to `.env.example`)
- `OIDC_ISSUER` — e.g. `https://dev-xxxxxx.us.auth0.com/`
- `OIDC_CLIENT_ID` — Auth0 Application Client ID (for backend flows if needed)
- `OIDC_CLIENT_SECRET` — (only for confidential / backend flows)
- `OIDC_AUDIENCE` — the Auth0 API Identifier (audience) for access tokens
- `OIDC_REDIRECT_URI` — backend callback URL (if implementing web flows) e.g. `http://localhost:3000/auth/callback`
- `SESSION_SECRET` — for server session signing (if used)
- `REDIS_URL` — session store (optional)

Backend responsibilities (Fastify)
- Verify incoming `access_token` on protected endpoints:
  - Fetch JWKS from `https://{AUTH0_DOMAIN}/.well-known/jwks.json` or use Auth0 management SDK.
  - Verify token signature (RS256), and validate claims: `iss`, `aud` (must include your API `OIDC_AUDIENCE`), `exp`.
  - Attach authenticated subject to request context as `request.user` using the token `sub`.
- Map Auth0 users to internal `users` table by `(provider, providerId)` where `provider` is the issuer and `providerId` is the token `sub`.
- Implement `GET /me` and `PATCH /me` to operate on the internal user record; these endpoints must require a valid access token.
- Do not rely on client-supplied identity; always verify the token server-side.

Token storage on mobile
- iOS: store tokens in the **Keychain**.
- Android: store tokens in **EncryptedSharedPreferences** or **Android Keystore**.
- Never store refresh tokens in plain files or logs.

Refreshing tokens
- Use Refresh Token Rotation in Auth0.
- Refresh tokens should be exchanged from the device to obtain new access tokens; handle rotation errors by forcing re-authentication.

Security best practices
- Use HTTPS in production; set `Secure` flag for cookies and only allow secure storage for secrets.
- Validate `nonce` (if using implicit id_token flows) and `state` for CSRF protection in web flows.
- Use short-lived access tokens (minutes) and rely on refresh tokens for session continuity.
- Monitor and log suspicious activity; implement audit logging for authentication events.

Local development notes
- For local testing on device simulators, register appropriate callback URIs in Auth0 (including `http://localhost:3000/auth/callback` if you use a web-based flow).
- You can use Auth0's test applications or create a Native application for local testing.
- Alternatively run a lightweight Keycloak or mock OIDC provider via Docker for fully local testing (more setup).

Testing and validation
- Manual smoke test:
  1. Login from mobile app (PKCE) — ensure code exchange succeeds
  2. Call a protected API endpoint with `Authorization: Bearer <access_token>` — expect 200 and valid `request.user`
  3. Revoke session or rotate refresh token — ensure app recovers or prompts login
- Add unit tests for middleware that validates tokens (mock JWKS) and integration tests for `GET /me`.

Next steps (implementation sequencing)
1. Install client libs on backend (`openid-client`, `jwks-rsa`, `jsonwebtoken`, or a Fastify JWT verification plugin).
2. Implement token verification middleware and `GET /me` skeleton.
3. Add DB migration and user upsert logic.
4. Add mobile dev notes for callback URIs and secure storage.
