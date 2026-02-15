// Global test setup
// This file runs before each test file

// Mock environment variables
process.env.OIDC_ISSUER = 'https://auth.example.com'
process.env.OIDC_AUDIENCE = 'api://default'

// Suppress console.error during tests (optional)
// global.console.error = jest.fn()