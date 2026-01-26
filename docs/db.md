# Local Database (Postgres)

This document describes how to run a local Postgres instance for development and how to connect to it.

Run Postgres via Docker Compose

```bash
docker compose -f docker-compose.postgres.yml up -d
```

Wait for the database to become ready:

```bash
docker compose -f docker-compose.postgres.yml ps
# or watch logs
docker compose -f docker-compose.postgres.yml logs -f postgres
```

Connection string

In `.env.example` we provide a local default:

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/subscription_orchestrator
```

Connect with `psql` (local machine):

```bash
# install psql if you don't have it
psql "$DATABASE_URL"
```

Create migrations and run them

- This project doesn't mandate a specific migration tool yet. Common options:
  - Prisma: `prisma migrate dev`
  - Knex: `knex migrate:latest`
  - TypeORM: `typeorm migration:run`

Prisma quickstart

1. Install Prisma and the client:

```bash
npm install prisma --save-dev
npm install @prisma/client
```

2. Generate the client and run the initial migration:

```bash
npm run prisma:generate
npm run prisma:migrate:dev
```

3. After running migrations, you can use the generated Prisma client in your code:

```ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

await prisma.user.create({ data: { email: 'dev@example.com', provider: 'auth0', providerId: 'auth0|123' } })
```

Run migrations after choosing/adding a migration tool.

Seeding

Add a seed file to your migration tool or use `psql` to insert test data manually.

Teardown

```bash
docker compose -f docker-compose.postgres.yml down -v
```

Notes

- The Postgres data volume is persisted in `postgres-data`.
- For production, use a managed Postgres and never use these trivial passwords.
- Update `.env` locally (do not commit secrets) with `DATABASE_URL` pointing to your DB.
