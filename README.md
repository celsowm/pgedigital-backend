# pgedigital-backend

Node.js (TypeScript) backend for **PGE Digital**, built with **Express**, **tsoa** (OpenAPI + route generation), and **SQL Server (MSSQL)** via **Tedious** + **Metal-ORM**.

## Table of contents

- [Quickstart](#quickstart)
- [Environment variables](#environment-variables)
- [Folder structure](#folder-structure)
- [Architecture](#architecture)
- [API docs (Swagger/OpenAPI)](#api-docs-swaggeropenapi)
- [Scripts](#scripts)
- [Testing](#testing)

## Quickstart

### Requirements

- Node.js **20+**
- An accessible **MSSQL** instance

### Install

```bash
npm ci
```

### Configure

Create a `.env` file at the project root:

```bash
# API
PORT=3000

# DB (Option A - preferred): full connection URL
# DATABASE_URL=mssql://user:password@host:1433/PGE_DIGITAL?encrypt=false&trustServerCertificate=true

# DB (Option B): individual fields
PGE_DIGITAL_HOST=localhost
PGE_DIGITAL_USER=sa
PGE_DIGITAL_PASSWORD=your_password
PGE_DIGITAL_DATABASE=PGE_DIGITAL
PGE_DIGITAL_ENCRYPT=false
PGE_DIGITAL_TRUST_CERT=true

# Pool
PGE_DIGITAL_POOL_MIN=2
PGE_DIGITAL_POOL_MAX=10

# Logging
PGE_DIGITAL_LOG_LEVEL=info
PGE_DIGITAL_LOG_NAMESPACES=all
# Legacy flags (optional)
PGE_DIGITAL_DB_DEBUG=false
PGE_DIGITAL_UOW_DEBUG=false
PGE_DIGITAL_QUERY_DEBUG=false
```

### Run

```bash
npm run dev
```

- API base path: `http://localhost:3000/api`
- Swagger UI: `http://localhost:3000/api/docs`

## Environment variables

### API

| Variable | Required | Default | Notes |
|---|---:|---:|---|
| `PORT` | no | `3000` | Server port (see `process.env.PORT` usage in `getServerPort()`). |

### Database (MSSQL)

You must provide either **`DATABASE_URL`** _or_ the **`PGE_DIGITAL_*`** fields.

| Variable | Required | Default | Notes |
|---|---:|---:|---|
| `DATABASE_URL` | no | - | Full MSSQL URL. If set, it overrides the `PGE_DIGITAL_*` fields. |
| `PGE_DIGITAL_HOST` | yes* | - | MSSQL host (only required if `DATABASE_URL` is not set). |
| `PGE_DIGITAL_USER` | yes* | - | MSSQL username. |
| `PGE_DIGITAL_PASSWORD` | yes* | - | MSSQL password. |
| `PGE_DIGITAL_DATABASE` | no | `PGE_DIGITAL` | Database name. |
| `PGE_DIGITAL_ENCRYPT` | no | `false` | If `true`, enables encryption. |
| `PGE_DIGITAL_TRUST_CERT` | no | `false` | If `true`, trusts server certificate. |

### Connection pool

| Variable | Required | Default | Notes |
|---|---:|---:|---|
| `PGE_DIGITAL_POOL_MIN` | no | `2` | Minimum pool size. |
| `PGE_DIGITAL_POOL_MAX` | no | `10` | Maximum pool size. |

### Logging

| Variable | Required | Default | Notes |
|---|---:|---:|---|
| `PGE_DIGITAL_LOG_LEVEL` | no | `info` | One of: `debug`, `info`, `warn`, `error`. |
| `PGE_DIGITAL_LOG_NAMESPACES` | no | `all` | `all`, `*`, or a comma-separated list (e.g. `db,uow,query`). |
| `PGE_DIGITAL_DB_DEBUG` | no | - | Legacy: enables `db` and `db-pool` namespaces when `true`. |
| `PGE_DIGITAL_UOW_DEBUG` | no | - | Legacy: enables `uow` namespace when `true`. |
| `PGE_DIGITAL_QUERY_DEBUG` | no | - | Legacy: enables `query` namespace when `true`. |
| `PGE_DIGITAL_SQL_DEBUG` | no | - | Enables SQL debug logging, forces the `query` namespace + `debug` level, and mirrors the `--sql-debug` CLI flag. |

## Folder structure

High-level overview of the code organization:

- `src/server.ts`
  - Process entrypoint. Loads `.env`, bootstraps entity metadata, starts Express.
- `src/app.ts`
  - Express app wiring (middlewares, Swagger, request-scoped DB session, tsoa routes).
- `src/config/*`
  - Centralized configuration (API constants/port, DB URL parsing).
- `src/db/*`
  - Database integration:
  - MSSQL pooling (Metal-ORM `Pool` + `createPooledExecutorFactory`)
  - request-scoped Metal-ORM session factory
  - utility mapping helpers
- `src/entities/*`
  - Metal-ORM decorator entities (usually auto-generated).
- `src/controllers/*`
  - tsoa controllers (routing + OpenAPI annotations).
- `src/services/*`
  - Business logic.
- `src/repositories/*`
  - Persistence / query layer (Metal-ORM queries).
- `src/middlewares/*`
  - Cross-cutting HTTP concerns (Unit of Work, error handling).
- `src/routes/*`
  - Generated tsoa routes (do not edit manually).
- `scripts/*`
  - Dev tooling (fix tsoa routes, generate entities, DB smoke scripts).
- `docs/*`
  - OpenAPI JSON output (`docs/openapi.json`) and additional documentation.
- `tests/*`
  - Vitest tests (smoke + service tests).

## Architecture

### Runtime stack

- HTTP: **Express**
- API contracts/routes: **tsoa** (generates `src/routes/*` and `docs/openapi.json`)
- DB driver: **Tedious**
- DB pooling: **Metal-ORM Pool** (`createPooledExecutorFactory`)
- ORM: **Metal-ORM** (request-scoped `OrmSession`)

### Request flow (high level)

```
Client
  -> Express (cors/json/morgan)
  -> Swagger UI (GET /api/docs)
  -> Request-scoped DB session (Metal-ORM session + pooled connection)
  -> Unit of Work middleware (auto commit/rollback for mutating requests)
  -> tsoa RegisterRoutes() -> Controllers
  -> Services -> Repositories -> Metal-ORM -> Tedious -> MSSQL
  -> Error handler
```

### Request-scoped DB session

Each request gets a dedicated Metal-ORM session created in `src/app.ts`.

- A pooled MSSQL connection is acquired.
- Metal-ORM's built-in `Pool` + `createPooledExecutorFactory` handles leasing, transactions, and deterministic shutdown.
- A Metal-ORM executor is created from the Tedious connection.
- The session is attached to `req.ormSession`.
- On response `finish`/`close`, the connection is released back to the pool.

This is implemented by `openSession()` (request-scoped session factory) and the pool helpers.

### Unit of Work (transaction policy)

The Unit of Work middleware wraps **mutating HTTP methods** (`POST`, `PUT`, `PATCH`, `DELETE`) in a transaction policy:

- If the response status is **2xx**, it commits (`session.commit()`).
- Otherwise, it rolls back (`session.rollback()`).

This keeps controllers/services focused on business logic while transactions are handled consistently.

## API docs (Swagger/OpenAPI)

Swagger UI is served from:

- `GET /api/docs`

The UI is generated from the static OpenAPI file:

- `docs/openapi.json`

### Regenerating OpenAPI + routes

```bash
npm run tsoa:spec
npm run tsoa:routes
```

Notes:

- `tsoa:routes` also runs a post-processing step (`scripts/fix-tsoa-routes.mjs`).
- `src/routes/routes.ts` is generated. Do not edit it manually.

## Scripts

Common `npm` scripts (see `package.json`):

- `npm run dev` – run in watch mode
- `npm run start` – run once
- `npm run tsoa:routes` – generate tsoa routes
- `npm run tsoa:spec` – generate OpenAPI JSON under `docs/`
- `npm run generate:entities` – regenerate Metal-ORM entities from DB schema
- `npm run db:test-connection` – basic DB connectivity check
- `npm run db:test-metalorm` – validates Metal-ORM + dialect/executor wiring
- `npm run test` – run tests (Vitest)
- `npm run lint` – TypeScript typecheck
- `npm run check` – `lint` + `test`
- `npm start -- --sql-debug` – start once with SQL debug logging enabled (equivalent to `PGE_DIGITAL_SQL_DEBUG=true`).

## Testing

```bash
npm test
```

The test suite uses **Vitest** and includes smoke tests and service-level tests.
