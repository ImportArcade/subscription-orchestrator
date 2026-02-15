import server from './server';
import { PrismaClient } from '@prisma/client';
const PORT = 3000;

const prisma = new PrismaClient();

async function start() {
  try {
    await server.listen({ port: PORT, host: '0.0.0.0' });
    server.log.info(`Server listening on port ${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();

process.on('SIGINT', async () => {
  server.log.info('Shutting down server...');
  await prisma.$disconnect();
  await server.close();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  server.log.info('SIGTERM received - closing server');
  await prisma.$disconnect();
  await server.close();
  process.exit(0);
});
