# Authentication (Auth0) — Mobile + Backend

This document describes the recommended Auth0-based authentication approach for the mobile clients (iOS / Android) and the Fastify backend.

## Goals
- Use secure, standard OIDC flows for mobile (Authorization Code Flow with PKCE).
- Keep tokens secure on device (Keychain / EncryptedSharedPreferences).
- Backend verifies access tokens for API calls and maps users to the internal `users` model.
- Provide comprehensive local testing documentation and automated validation.

## Recommended Architecture (Option A — PKCE on Mobile)
- Mobile apps perform Authorization Code Flow with PKCE directly against Auth0.
- Mobile receives an `access_token` (short-lived) and optionally a `refresh_token` (use Refresh Token Rotation).
- Mobile stores tokens in platform-secure storage (iOS Keychain, Android EncryptedSharedPreferences).
- Mobile calls your API with `Authorization: Bearer <access_token>`.
- Backend validates access tokens (signature, `iss`, `aud`, `exp`, `scope`) using Auth0 JWKS with jose library.

## Why PKCE on mobile?
- PKCE prevents interception of the authorization code and is the recommended flow for native apps.
- Direct mobile auth is simpler to implement and provides a good UX.
- Refresh Token Rotation reduces risk if refresh tokens are compromised.

## Auth0 Configuration Checklist
1. Create an **Application** in Auth0 (Native app) for each mobile platform.
   - Allowed Callback URLs: add your app scheme (e.g., `com.your.app://callback`) and any local dev redirect you use.
   - Allowed Logout URLs and Allowed Origins as needed.
2. Create an **API** in Auth0 (this defines the `audience` for access tokens). Use a stable identifier (e.g., `https://api.subscription-orchestrator.local`).
3. When requesting authorization from mobile, include the `audience` so Auth0 issues an access token for your API.
4. Enable **Refresh Token Rotation** in the Application settings if you plan to issue refresh tokens to mobile.

## Environment Variables
Add to `.env` file (see `.env.example` for template):
```bash
OIDC_ISSUER=https://your-tenant.us.auth0.com/
OIDC_AUDIENCE=your-api-identifier
OIDC_CLIENT_ID=your-client-id
OIDC_CLIENT_SECRET=your-client-secret
DATABASE_URL=postgresql://user:password@localhost:5433/subscription_orchestrator
PORT=3000
NODE_ENV=development
```

## Backend Implementation (Fastify)

### Responsibilities
- Verify incoming `access_token` on protected endpoints:
  - Fetch JWKS from `https://{AUTH0_DOMAIN}/.well-known/jwks.json` using jose library.
  - Verify token signature (RS256), and validate claims: `iss`, `aud` (must include your API `OIDC_AUDIENCE`), `exp`.
  - Attach authenticated subject to request context as `request.user` using the token `sub`.
- Map Auth0 users to internal `users` table by `(provider, providerId)` where `provider` is the issuer and `providerId` is the token `sub`.
- Implement `GET /me` and `PATCH /me` to operate on the internal user record; these endpoints must require a valid access token.
- Do not rely on client-supplied identity; always verify the token server-side.

### Token Verification Flow (Implementation Detail)

The backend uses the `jose` library for RS256 token verification:

```typescript
// 1. Extract Bearer token from Authorization header
const token = authHeader.match(/^Bearer\s+(.+)$/i)?.[1]

// 2. Create JWKS resolver (fetches public keys from Auth0)
const jwks = createRemoteJWKSet(
  new URL(`${issuer}/.well-known/jwks.json`)
)

// 3. Verify token signature and claims
const { payload } = await jwtVerify(token, jwks, {
  issuer: process.env.OIDC_ISSUER,
  audience: process.env.OIDC_AUDIENCE
})

// 4. Extract user info from token
const { sub, email, name } = payload

// 5. Upsert user in database
const user = await prisma.user.upsert({
  where: { provider_providerId: { provider: issuer, providerId: sub } },
  update: { email, displayName: name },
  create: { provider: issuer, providerId: sub, email, displayName: name }
})

// 6. Attach to request
request.user = user
```

## Local Testing

### Prerequisites
- Node.js 18+
- Postgres running on `localhost:5433`
- `.env` file configured with Auth0 credentials

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Create database
psql -h localhost -U postgres -c "CREATE DATABASE subscription_orchestrator;"

# 3. Run migrations
npm run prisma:migrate:dev

# 4. Start server
npm run dev
```

### Option 1: Manual Testing with curl

**Get Auth0 Token:**
```bash
AUTH0_DOMAIN="your-tenant.us.auth0.com"
CLIENT_ID="your-client-id"
CLIENT_SECRET="your-client-secret"
AUDIENCE="your-api-identifier"

TOKEN=$(curl -s --request POST \
  --url "https://${AUTH0_DOMAIN}/oauth/token" \
  --header 'content-type: application/json' \
  --data '{
    "client_id": "'${CLIENT_ID}'",
    "client_secret": "'${CLIENT_SECRET}'",
    "audience": "'${AUDIENCE}'",
    "grant_type": "client_credentials"
  }' | jq -r '.access_token')

echo "Token: $TOKEN"
```

**Test GET /me:**
```bash
curl -X GET http://localhost:3000/me \
  -H "Authorization: Bearer ${TOKEN}" | jq
```

**Test PATCH /me:**
```bash
curl -X PATCH http://localhost:3000/me \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "Updated Name",
    "timezone": "America/New_York"
  }' | jq
```

### Option 2: Automated Integration Tests

Run the comprehensive test suite (27 tests covering all auth flows):

```bash
npm test

# Output:
# PASS tests/basic.test.ts
# PASS tests/me.endpoint.test.ts
#   GET /me (5 tests)
#   PATCH /me (14 tests)
#   Authorization header parsing (4 tests)
#   User database operations (5 tests)
# Tests: 27 passed, 27 total
```

Tests validate:
- Authorization header parsing and validation
- Missing/invalid token rejection (401)
- Successful profile read (GET /me)
- Profile field updates (PATCH /me)
- Input type validation
- Email uniqueness constraints
- Database user operations

### Option 3: Smoke Test Script

Quick validation script included:

```bash
chmod +x scripts/test-auth-endpoint.sh
./scripts/test-auth-endpoint.sh
```

Output example:
```
✓ Server is running on localhost:3000
✓ GET /me without token returns 401
✓ GET /me with Bearer token format works
✓ Authorization header parsing validated
✓ All checks passed!
```

## API Reference

### GET /me (Protected)

Returns authenticated user's profile.

**Request:**
```http
GET /me HTTP/1.1
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "displayName": "John Doe",
  "timezone": "America/New_York",
  "preferredChannels": {
    "channels": ["email", "sms"]
  }
}
```

**Errors:**
- `401 missing_authorization`: Authorization header missing
- `401 invalid_authorization_format`: Header not in `Bearer <token>` format
- `401 invalid_token`: Token signature verification failed

### PATCH /me (Protected)

Updates authenticated user's profile. Only provided fields are updated.

**Request:**
```http
PATCH /me HTTP/1.1
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "displayName": "Jane Doe",
  "timezone": "UTC",
  "preferredChannels": {
    "channels": ["email"]
  }
}
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "displayName": "Jane Doe",
  "timezone": "UTC",
  "preferredChannels": {
    "channels": ["email"]
  }
}
```

**Errors:**
- `400 invalid_displayName`: displayName must be string
- `400 invalid_timezone`: timezone must be string
- `400 invalid_email`: email must be valid format
- `400 invalid_preferredChannels`: preferredChannels must be object
- `400 nothing_to_update`: no valid fields provided
- `409 email_in_use`: email already registered to another user
- `401 *`: Authorization errors

## Troubleshooting

### "Can't reach database server at localhost:5433"

Start Postgres:
```bash
docker run -d --name postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5433:5432 \
  postgres:latest
```

### "Invalid token" even with valid Auth0 token

Verify:
- ✓ `OIDC_ISSUER` ends with `/`
- ✓ `OIDC_AUDIENCE` matches Auth0 API identifier
- ✓ Token not expired
- ✓ Auth0 JWKS endpoint accessible

### "401 missing_authorization"

Check:
- ✓ `Authorization` header present
- ✓ Format is `Bearer <token>` (case-sensitive)
- ✓ Token not empty

### "409 email_in_use"

Choose a different email address for update.

## Token Storage on Mobile

- **iOS**: Store in **Keychain** (SecItemAdd/SecItemCopyMatching)
- **Android**: Store in **EncryptedSharedPreferences** or **Android Keystore**
- Never store tokens in SharedPreferences/UserDefaults (unencrypted)
- Use secure storage APIs provided by platform

## Security Best Practices

1. **HTTPS Only**: All token transmission must use HTTPS (except localhost dev)
2. **Token Expiration**: Enforce reasonable token lifetimes (typically 24 hours)
3. **Refresh Tokens**: Use Refresh Token Rotation for long-lived sessions
4. **PKCE**: Required for all mobile/native clients
5. **CORS**: Configure appropriate CORS policies for web clients
6. **Rate Limiting**: Implement rate limiting on token endpoints
7. **Logging**: Never log tokens or sensitive claims
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
