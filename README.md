![Img](nestjs-template.png)

[![Tests](https://github.com/protokol/nestjs-template/actions/workflows/tests.yml/badge.svg)](https://github.com/protokol/nestjs-template/actions/workflows/tests.yml)

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Requirements

- Node.js `>= 24.9`
- [pnpm](https://pnpm.io/installation) — any recent version; it switches automatically to the version pinned in the `packageManager` field.

## Installation

```bash
$ pnpm install
```

## Environment configuration

Copy the example file and adjust it to your needs:

```bash
$ cp .env.example .env
```

All variables are validated with [class-validator](https://github.com/typestack/class-validator) at startup (see `src/configuration/environment-variables.ts`); a bad value prevents the application from booting. To add a new variable:

1. Add it to `.env.example`.
2. Declare it with decorators in `EnvironmentVariables`.
3. Read it in the `configuration` factory (`src/configuration/configuration.ts`).

## Running the app

```bash
# development
$ pnpm start

# watch mode
$ pnpm start:dev

# production mode
$ pnpm start:prod
```

## Health check

The application exposes a `GET /health` endpoint suitable for liveness and readiness probes. To wire the database into the health check, migrate it to [`@nestjs/terminus`](https://docs.nestjs.com/recipes/terminus) and use `TypeOrmHealthIndicator`.

## Database

The template ships with [TypeORM](https://typeorm.io) connected to PostgreSQL (see `src/database`). Entities are loaded automatically (`autoLoadEntities`), and migrations run on application startup (`migrationsRun` in `src/database/typeorm-options.ts`).

A sampled domain (`src/notes`) demonstrates the end-to-end pattern: entity + migration + repository service + controller.

Migrations are executed with the TypeORM CLI against `src/database/data-source.ts`:

```bash
# generate a migration from entity changes
$ pnpm migration:generate -- ChangeSomething

# run pending migrations
$ pnpm migration:run

# revert the last migration
$ pnpm migration:revert
```

When generating or running migrations, a local PostgreSQL instance (e.g. the `postgres` service from `docker compose`) must be reachable and `DATABASE_*` variables configured in `.env`.

Schema auto-sync from entities is available through `DATABASE_SYNCHRONIZE=true` for local experimentation only — migrations remain the source of truth and `synchronize` must stay disabled in production.

## Docker

```bash
# build the image
$ docker compose build

# run it (postgres service included)
$ docker compose up
```

## Test

```bash
# unit tests
$ pnpm test

# e2e tests
$ pnpm test:e2e

# test coverage (enforces thresholds from jest.config.ts)
$ pnpm test:cov
```

Tests never need a live PostgreSQL: `DatabaseModule.forRoot()` swaps the real TypeORM data source for an in-memory mock repository setup (see `src/database/mock-database.module.ts`) when `NODE_ENV=test`, and services are tested against `MockRepository` via `__tests__/mocks/repository.mock.ts`.

## Lint & Format

```bash
# check lint
$ pnpm lint

# fix lint issues
$ pnpm lint:fix

# format with prettier
$ pnpm format
```

## License

This project is [MIT](LICENSE) licensed.
