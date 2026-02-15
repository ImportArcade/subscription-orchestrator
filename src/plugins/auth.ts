import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

export interface JwksResolverOptions {
  issuer: string;
  jwksPath?: string;
  cacheTtlSeconds?: number;
  rateLimit?: number;
}

/**
 * Create a JWKS resolver function for `jose`'s jwtVerify.
 */
export function createJwksResolver(options: JwksResolverOptions): JWTVerifyGetKey {
  const jwksPath = options.jwksPath ?? '/.well-known/jwks.json';
  const issuer = options.issuer.replace(/\/$/, '');
  const jwksUrl = new URL(`${issuer}${jwksPath}`);
  return createRemoteJWKSet(jwksUrl, { timeoutDuration: 5000 });
}

export interface VerifiedToken {
  sub: string;
  iss: string;
  aud: string | string[];
  scope?: string;
  [claim: string]: unknown;
}

const prisma = new PrismaClient();

/**
 * Verify an access token against the configured issuer and audience.
 * Returns the token payload on success or throws on failure.
 */
export async function verifyAccessToken(token: string, audience: string): Promise<VerifiedToken> {
  const issuer = process.env.OIDC_ISSUER;
  if (!issuer) throw new Error('OIDC_ISSUER environment variable is not set');

  const jwks = createJwksResolver({ issuer });
  const verifyOptions = { issuer, audience };

  const { payload } = await jwtVerify(token, jwks, verifyOptions);
  return payload as VerifiedToken;
}

/**
 * Fastify auth middleware (preHandler). Extracts Bearer token, verifies it,
 * upserts/finds the user in the DB, and attaches the Prisma user record to
 * `request.user`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function authMiddleware(request: any, reply: any) {
  try {
    const authHeader = request.headers?.authorization;
    if (!authHeader || typeof authHeader !== 'string') {
      reply.code(401).send({ error: 'missing_authorization' });
      return;
    }

    const m = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!m) {
      reply.code(401).send({ error: 'invalid_authorization_format' });
      return;
    }

    const token = m[1];
    const audience = process.env.OIDC_AUDIENCE || '';
    const payload = await verifyAccessToken(token, audience);

    const provider = payload.iss as string;
    const providerId = payload.sub as string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const email = (payload as any).email as string | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const displayName = (payload as any).name as string | undefined;

    let user = await prisma.user.findFirst({ where: { provider, providerId } });
    if (!user) {
      user = await prisma.user.create({
        data: { email: email ?? '', displayName, provider, providerId },
      });
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updates: any = {};
      if (email && email !== user.email) updates.email = email;
      if (displayName && displayName !== user.displayName) updates.displayName = displayName;
      if (Object.keys(updates).length > 0) {
        user = await prisma.user.update({ where: { id: user.id }, data: updates });
      }
    }

    request.user = user;
  } catch (err: unknown) {
    // JWKS/network errors could manifest as thrown errors; map to 503
    const msg = String(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err as any)?.message || err,
    );
    if (msg.includes('timeout') || msg.includes('network') || msg.includes('fetch')) {
      reply.code(503).send({ error: 'jwks_unavailable' });
      return;
    }
    reply.code(401).send({ error: 'invalid_token' });
    return;
  }
}

/**
 * Fastify plugin register function. Decorates the instance with `auth`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function registerAuthPlugin(fastify: any) {
  if (!fastify || typeof fastify.decorate !== 'function')
    throw new Error('Invalid Fastify instance');
  fastify.decorate('auth', authMiddleware);
}

export default registerAuthPlugin;
