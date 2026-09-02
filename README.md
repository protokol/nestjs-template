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

The application exposes a `GET /health` endpoint suitable for liveness and readiness probes. Once a database or broker is introduced, migrate it to [`@nestjs/terminus`](https://docs.nestjs.com/recipes/terminus).

## Docker

```bash
# build the image
$ docker compose build

# run it
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
