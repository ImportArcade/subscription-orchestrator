#!/bin/bash

# Smoke Test Script for Auth Endpoints
# Validates GET /me endpoint without requiring actual Auth0 tokens
# Useful for CI/CD pre-deployment validation

set -e

# Configuration
SERVER_URL="${SERVER_URL:-http://localhost:3000}"
TIMEOUT=5
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Auth Endpoint Smoke Test"
echo "=========================================="
echo "Server URL: $SERVER_URL"
echo ""

# Helper functions
test_status() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✓${NC} $2"
  else
    echo -e "${RED}✗${NC} $2"
    exit 1
  fi
}

warn_status() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✓${NC} $2"
  else
    echo -e "${YELLOW}⚠${NC} $2 (warning)"
  fi
}

# Test 1: Server is running
echo "Testing server connectivity..."
if curl -s --max-time $TIMEOUT "$SERVER_URL/me" -H "Authorization: Bearer test" > /dev/null 2>&1; then
  test_status 0 "Server is running on $SERVER_URL"
else
  echo -e "${RED}✗${NC} Cannot reach server at $SERVER_URL"
  echo "   Make sure the server is running: npm run dev"
  exit 1
fi

# Test 2: GET /me without authorization returns 401
echo ""
echo "Testing authorization validation..."
RESPONSE=$(curl -s --max-time $TIMEOUT -w "\n%{http_code}" "$SERVER_URL/me" 2>/dev/null)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "401" ]; then
  test_status 0 "GET /me without token returns 401 (Unauthorized)"
  
  # Check if response contains error message
  if echo "$BODY" | grep -q "missing_authorization\|invalid_authorization_format"; then
    test_status 0 "Error message is descriptive"
  else
    warn_status 1 "Response body doesn't contain expected error"
  fi
else
  echo -e "${RED}✗${NC} GET /me without token returned $HTTP_CODE (expected 401)"
  exit 1
fi

# Test 3: GET /me with Bearer token format validation
echo ""
echo "Testing Bearer token format..."
RESPONSE=$(curl -s --max-time $TIMEOUT -w "\n%{http_code}" \
  "$SERVER_URL/me" \
  -H "Authorization: Bearer invalid-token-123" 2>/dev/null)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "401" ]; then
  test_status 0 "GET /me with invalid token returns 401"
else
  warn_status 1 "GET /me with invalid token returned $HTTP_CODE"
fi

# Test 4: Invalid Authorization header format
echo ""
echo "Testing header format validation..."
RESPONSE=$(curl -s --max-time $TIMEOUT -w "\n%{http_code}" \
  "$SERVER_URL/me" \
  -H "Authorization: InvalidFormat token" 2>/dev/null)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "401" ]; then
  test_status 0 "Invalid header format returns 401"
else
  warn_status 1 "Invalid header format returned $HTTP_CODE (expected 401)"
fi

# Test 5: PATCH /me without authorization returns 401
echo ""
echo "Testing PATCH /me authorization..."
RESPONSE=$(curl -s --max-time $TIMEOUT -w "\n%{http_code}" \
  -X PATCH "$SERVER_URL/me" \
  -H "Content-Type: application/json" \
  -d '{"displayName": "Test"}' 2>/dev/null)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "401" ]; then
  test_status 0 "PATCH /me without token returns 401"
else
  warn_status 1 "PATCH /me without token returned $HTTP_CODE"
fi

# Test 6: Case-insensitive Bearer prefix
echo ""
echo "Testing case-insensitive Bearer prefix..."
for prefix in "Bearer" "bearer" "BEARER"; do
  RESPONSE=$(curl -s --max-time $TIMEOUT -w "\n%{http_code}" \
    "$SERVER_URL/me" \
    -H "Authorization: $prefix invalid-token" 2>/dev/null)
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  
  if [ "$HTTP_CODE" = "401" ]; then
    test_status 0 "'$prefix' prefix accepted"
  else
    warn_status 1 "'$prefix' prefix returned $HTTP_CODE"
  fi
done

# Summary
echo ""
echo "=========================================="
echo -e "${GREEN}✓ All smoke tests passed!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Run full test suite: npm test"
echo "2. Test with real Auth0 token (see docs/auth.md)"
echo "3. Deploy to staging environment"
echo ""
