import Fastify from 'fastify'
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

/**
 * Test suite for /me endpoints
 * Tests both GET /me and PATCH /me with various scenarios
 */
describe('/me Endpoint Tests', () => {
  let app: any

  beforeAll(async () => {
    // Create a test Fastify app
    app = Fastify({ logger: false })

    // Mock auth middleware for testing - bypasses token verification
    app.decorate('auth', async (request: any, reply: any) => {
      const authHeader = request.headers?.authorization
      if (!authHeader || typeof authHeader !== 'string') {
        reply.code(401).send({ error: 'missing_authorization' })
        return
      }

      const m = authHeader.match(/^Bearer\s+(.+)$/i)
      if (!m) {
        reply.code(401).send({ error: 'invalid_authorization_format' })
        return
      }

      // For testing, create or find a test user
      // In real scenarios, token would be verified with jose + JWKS
      const provider = 'https://test.auth0.com/'
      const providerId = 'auth0|test-user'
      let user = await prisma.user.findFirst({ where: { provider, providerId } })
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: 'testuser@example.com',
            displayName: 'Test User',
            provider,
            providerId,
          },
        })
      }
      request.user = user
    })

    // GET /me route
    app.get('/me', { preHandler: app.auth }, async (request: any, reply: any) => {
      const user = request.user
      if (!user) {
        return reply.code(401).send({ error: 'unauthorized' })
      }
      return {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        timezone: user.timezone,
        preferredChannels: user.preferredChannels,
      }
    })

    // PATCH /me route
    app.patch('/me', { preHandler: app.auth }, async (request: any, reply: any) => {
      const user = request.user
      if (!user) return reply.code(401).send({ error: 'unauthorized' })

      const { displayName, timezone, preferredChannels, email } = request.body ?? {}

      const updates: any = {}
      if (displayName !== undefined) {
        if (typeof displayName !== 'string') return reply.code(400).send({ error: 'invalid_displayName' })
        updates.displayName = displayName
      }
      if (timezone !== undefined) {
        if (typeof timezone !== 'string') return reply.code(400).send({ error: 'invalid_timezone' })
        updates.timezone = timezone
      }
      if (preferredChannels !== undefined) {
        if (typeof preferredChannels !== 'object') return reply.code(400).send({ error: 'invalid_preferredChannels' })
        updates.preferredChannels = preferredChannels
      }
      if (email !== undefined) {
        if (typeof email !== 'string' || !email.includes('@')) return reply.code(400).send({ error: 'invalid_email' })
        updates.email = email
      }

      if (Object.keys(updates).length === 0) return reply.code(400).send({ error: 'nothing_to_update' })

      try {
        const updated = await prisma.user.update({ where: { id: user.id }, data: updates })
        return {
          id: updated.id,
          email: updated.email,
          displayName: updated.displayName,
          timezone: updated.timezone,
          preferredChannels: updated.preferredChannels,
        }
      } catch (err: any) {
        if (err?.code === 'P2002') return reply.code(409).send({ error: 'email_in_use' })
        request.log.error(err)
        return reply.code(500).send({ error: 'update_failed' })
      }
    })

    await app.ready()
  })

  afterAll(async () => {
    await prisma.user.deleteMany({})
    await app.close()
    await prisma.$disconnect()
  })

  afterEach(async () => {
    await prisma.user.deleteMany({})
  })

  describe('GET /me', () => {
    test('returns 401 when authorization header is missing', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/me',
      })

      expect(response.statusCode).toBe(401)
      expect(JSON.parse(response.body)).toEqual({ error: 'missing_authorization' })
    })

    test('returns 401 when authorization header is invalid format', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/me',
        headers: {
          authorization: 'InvalidFormat token',
        },
      })

      expect(response.statusCode).toBe(401)
      expect(JSON.parse(response.body)).toEqual({ error: 'invalid_authorization_format' })
    })

    test('returns user profile when valid Bearer token provided', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/me',
        headers: {
          authorization: 'Bearer test-token-123',
        },
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body).toMatchObject({
        id: expect.any(String),
        email: 'testuser@example.com',
        displayName: 'Test User',
      })
    })

    test('returns all user profile fields', async () => {
      // Create user with all fields populated
      await prisma.user.deleteMany({})
      const user = await prisma.user.create({
        data: {
          email: 'fullprofile@example.com',
          displayName: 'Full Profile User',
          timezone: 'America/New_York',
          preferredChannels: { channels: ['email', 'sms'] },
          provider: 'https://test.auth0.com/',
          providerId: 'auth0|test-user',
        },
      })

      const response = await app.inject({
        method: 'GET',
        url: '/me',
        headers: {
          authorization: 'Bearer test-token-123',
        },
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body).toMatchObject({
        id: user.id,
        email: 'fullprofile@example.com',
        displayName: 'Full Profile User',
        timezone: 'America/New_York',
        preferredChannels: { channels: ['email', 'sms'] },
      })
    })
  })

  describe('PATCH /me', () => {
    test('returns 401 when authorization header is missing', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/me',
        payload: { displayName: 'Updated Name' },
      })

      expect(response.statusCode).toBe(401)
      expect(JSON.parse(response.body)).toEqual({ error: 'missing_authorization' })
    })

    test('returns 401 when authorization header is invalid format', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/me',
        headers: {
          authorization: 'InvalidFormat token',
        },
        payload: { displayName: 'Updated Name' },
      })

      expect(response.statusCode).toBe(401)
      expect(JSON.parse(response.body)).toEqual({ error: 'invalid_authorization_format' })
    })

    test('returns 400 when no valid fields to update', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/me',
        headers: {
          authorization: 'Bearer test-token-123',
        },
        payload: {},
      })

      expect(response.statusCode).toBe(400)
      expect(JSON.parse(response.body)).toEqual({ error: 'nothing_to_update' })
    })

    test('updates displayName successfully', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/me',
        headers: {
          authorization: 'Bearer test-token-123',
        },
        payload: { displayName: 'Updated Name' },
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.displayName).toBe('Updated Name')
    })

    test('updates timezone successfully', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/me',
        headers: {
          authorization: 'Bearer test-token-123',
        },
        payload: { timezone: 'UTC' },
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.timezone).toBe('UTC')
    })

    test('updates email successfully', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/me',
        headers: {
          authorization: 'Bearer test-token-123',
        },
        payload: { email: 'newemail@example.com' },
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.email).toBe('newemail@example.com')
    })

    test('updates preferredChannels successfully', async () => {
      const channels = { channels: ['email', 'push'] }
      const response = await app.inject({
        method: 'PATCH',
        url: '/me',
        headers: {
          authorization: 'Bearer test-token-123',
        },
        payload: { preferredChannels: channels },
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.preferredChannels).toEqual(channels)
    })

    test('updates multiple fields at once', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/me',
        headers: {
          authorization: 'Bearer test-token-123',
        },
        payload: {
          displayName: 'Multi Update',
          timezone: 'America/Los_Angeles',
          email: 'multi@example.com',
        },
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body).toMatchObject({
        displayName: 'Multi Update',
        timezone: 'America/Los_Angeles',
        email: 'multi@example.com',
      })
    })

    test('returns 400 with invalid displayName type', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/me',
        headers: {
          authorization: 'Bearer test-token-123',
        },
        payload: { displayName: 123 },
      })

      expect(response.statusCode).toBe(400)
      expect(JSON.parse(response.body)).toEqual({ error: 'invalid_displayName' })
    })

    test('returns 400 with invalid timezone type', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/me',
        headers: {
          authorization: 'Bearer test-token-123',
        },
        payload: { timezone: ['UTC'] },
      })

      expect(response.statusCode).toBe(400)
      expect(JSON.parse(response.body)).toEqual({ error: 'invalid_timezone' })
    })

    test('returns 400 with invalid email format', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/me',
        headers: {
          authorization: 'Bearer test-token-123',
        },
        payload: { email: 'not-an-email' },
      })

      expect(response.statusCode).toBe(400)
      expect(JSON.parse(response.body)).toEqual({ error: 'invalid_email' })
    })

    test('returns 400 with invalid preferredChannels type', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/me',
        headers: {
          authorization: 'Bearer test-token-123',
        },
        payload: { preferredChannels: 'email' },
      })

      expect(response.statusCode).toBe(400)
      expect(JSON.parse(response.body)).toEqual({ error: 'invalid_preferredChannels' })
    })

    test('returns 409 when email is already in use', async () => {
      // Create another user with an email
      const otherUser = await prisma.user.create({
        data: {
          email: 'existing@example.com',
          provider: 'https://test.auth0.com/',
          providerId: 'auth0|other-user',
        },
      })

      const response = await app.inject({
        method: 'PATCH',
        url: '/me',
        headers: {
          authorization: 'Bearer test-token-123',
        },
        payload: { email: 'existing@example.com' },
      })

      expect(response.statusCode).toBe(409)
      expect(JSON.parse(response.body)).toEqual({ error: 'email_in_use' })
    })
  })
})

describe('Authorization Header Parsing', () => {
  test('correctly extracts Bearer token', () => {
    const header = 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.test.signature'
    const match = header.match(/^Bearer\s+(.+)$/i)
    expect(match).toBeTruthy()
    expect(match?.[1]).toBe('eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.test.signature')
  })

  test('rejects invalid Bearer format', () => {
    const headers = ['Bearer', 'InvalidFormat token', 'token-without-bearer', '']
    headers.forEach(header => {
      const match = header.match(/^Bearer\s+(.+)$/i)
      expect(match).toBeFalsy()
    })
  })

  test('handles case-insensitive Bearer prefix', () => {
    const headers = ['Bearer token123', 'bearer token123', 'BEARER token123']
    headers.forEach(header => {
      const match = header.match(/^Bearer\s+(.+)$/i)
      expect(match).toBeTruthy()
      expect(match?.[1]).toBe('token123')
    })
  })

  test('handles whitespace variations', () => {
    const validHeaders = ['Bearer  token123', 'Bearer   token-with-dashes']
    validHeaders.forEach(header => {
      const match = header.match(/^Bearer\s+(.+)$/i)
      expect(match).toBeTruthy()
    })
  })
})

describe('User Database Operations', () => {
  afterEach(async () => {
    await prisma.user.deleteMany({})
  })

  test('creates a new user with all fields', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'newuser@example.com',
        displayName: 'New User',
        timezone: 'America/New_York',
        preferredChannels: { channels: ['email', 'sms'] },
        provider: 'https://test.auth0.com/',
        providerId: 'auth0|new-user-id',
      },
    })

    expect(user).toMatchObject({
      email: 'newuser@example.com',
      displayName: 'New User',
      timezone: 'America/New_York',
      provider: 'https://test.auth0.com/',
      providerId: 'auth0|new-user-id',
    })
    expect(user.id).toBeDefined()
    expect(user.createdAt).toBeDefined()
    expect(user.updatedAt).toBeDefined()
  })

  test('updates user profile fields', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'user@example.com',
        displayName: 'Original Name',
        provider: 'https://test.auth0.com/',
        providerId: 'auth0|user-id',
      },
    })

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        displayName: 'Updated Name',
        timezone: 'UTC',
      },
    })

    expect(updated.displayName).toBe('Updated Name')
    expect(updated.timezone).toBe('UTC')
    expect(updated.email).toBe('user@example.com')
  })

  test('enforces email uniqueness constraint', async () => {
    await prisma.user.create({
      data: {
        email: 'duplicate@example.com',
        provider: 'https://test.auth0.com/',
        providerId: 'auth0|user-1',
      },
    })

    const user2 = await prisma.user.create({
      data: {
        email: 'other@example.com',
        provider: 'https://test.auth0.com/',
        providerId: 'auth0|user-2',
      },
    })

    await expect(
      prisma.user.update({
        where: { id: user2.id },
        data: { email: 'duplicate@example.com' },
      })
    ).rejects.toThrow()
  })

  test('finds user by provider and providerId', async () => {
    const provider = 'https://test.auth0.com/'
    const providerId = 'auth0|unique-id'

    await prisma.user.create({
      data: {
        email: 'user@example.com',
        provider,
        providerId,
      },
    })

    const found = await prisma.user.findFirst({
      where: { provider, providerId },
    })

    expect(found).toMatchObject({
      email: 'user@example.com',
      provider,
      providerId,
    })
  })

  test('creates user with optional fields as null', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'minimal@example.com',
        provider: 'https://test.auth0.com/',
        providerId: 'auth0|minimal',
      },
    })

    expect(user.email).toBe('minimal@example.com')
    expect(user.displayName).toBeNull()
    expect(user.timezone).toBeNull()
    expect(user.preferredChannels).toBeNull()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })
})
