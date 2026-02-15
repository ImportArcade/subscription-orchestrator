import Fastify from 'fastify';
import registerAuthPlugin from './plugins/auth';
import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
dotenv.config();

const fastify = Fastify({ logger: true });

// Register auth plugin (decorates instance with `auth` preHandler)
fastify.register(registerAuthPlugin);

// Protected route: GET /me
// eslint-disable-next-line @typescript-eslint/no-explicit-any
fastify.get('/me', { preHandler: (fastify as any).auth }, async (request: any, reply: any) => {
  const user = request.user;
  if (!user) {
    return reply.code(401).send({ error: 'unauthorized' });
  }
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    timezone: user.timezone,
    preferredChannels: user.preferredChannels,
  };
});

// Protected route: PATCH /me
// eslint-disable-next-line @typescript-eslint/no-explicit-any
fastify.patch('/me', { preHandler: (fastify as any).auth }, async (request: any, reply: any) => {
  const user = request.user;
  if (!user) return reply.code(401).send({ error: 'unauthorized' });

  const { displayName, timezone, preferredChannels, email } = request.body ?? {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: any = {};
  if (displayName !== undefined) {
    if (typeof displayName !== 'string')
      return reply.code(400).send({ error: 'invalid_displayName' });
    updates.displayName = displayName;
  }
  if (timezone !== undefined) {
    if (typeof timezone !== 'string') return reply.code(400).send({ error: 'invalid_timezone' });
    updates.timezone = timezone;
  }
  if (preferredChannels !== undefined) {
    if (typeof preferredChannels !== 'object')
      return reply.code(400).send({ error: 'invalid_preferredChannels' });
    updates.preferredChannels = preferredChannels;
  }
  if (email !== undefined) {
    if (typeof email !== 'string' || !email.includes('@'))
      return reply.code(400).send({ error: 'invalid_email' });
    updates.email = email;
  }

  if (Object.keys(updates).length === 0)
    return reply.code(400).send({ error: 'nothing_to_update' });

  try {
    const updated = await prisma.user.update({ where: { id: user.id }, data: updates });
    return {
      id: updated.id,
      email: updated.email,
      displayName: updated.displayName,
      timezone: updated.timezone,
      preferredChannels: updated.preferredChannels,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    // Prisma P2002 = unique constraint failed (email)
    if (err?.code === 'P2002') return reply.code(409).send({ error: 'email_in_use' });
    request.log.error(err);
    return reply.code(500).send({ error: 'update_failed' });
  }
});

export default fastify;
