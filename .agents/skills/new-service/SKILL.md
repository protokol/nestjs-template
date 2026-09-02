---
name: new-service
description: Spin up a full CRUD service (module, controller, service, entity, DTOs, migration, unit + e2e tests) in this NestJS template. Use when the user says "spin up a new service", "add a <name> service/module/resource", or asks for a new set of REST endpoints with a database table. Not for modifying existing services.
metadata:
    version: "1.0.0"
    timestamp: "2026-09-02"
    type: workflow
    inclusion: default
    activation: on-demand
---

# New Service

Scaffold a complete feature — a plural feature folder with module, controller,
service, entity, DTOs, a TypeORM migration, and unit + e2e tests. The
**notes** feature is the canonical example of every convention below.

**REQUIRED READING before writing any file:** the notes feature —
[src/notes/](../../../src/notes/) (module, controller, service, entity,
dto/), [src/database/migrations/20260902000000-CreateNoteTable.ts](../../../src/database/migrations/20260902000000-CreateNoteTable.ts),
and the tests [**tests**/unit/notes.service.test.ts](../../../__tests__/unit/notes.service.test.ts),
[**tests**/unit/notes.controller.test.ts](../../../__tests__/unit/notes.controller.test.ts),
[**tests**/e2e/notes.e2e-spec.ts](../../../__tests__/e2e/notes.e2e-spec.ts).
Mirror `<name>` → `<Name>` renames column-for-column and assertion-for-pattern;
these files are the source of truth, this skill never re-states their content.

## Inputs (gather before generating)

If the user gave only a name, propose the missing details and confirm:

- **Singular + plural** names: `note` / `notes` → `Note`, `NotesService`, `notes` folder.
- **Table name**: snake_case plural (`notes`, not `Notes`).
- **Columns**: name, type, nullable. Default shape is increment `int` PK +
  `created_at`/`updated_at` timestamps — every service gets these.
- **Route**: lowercase plural path (`@Controller("notes")`).
- Keep it standard until confirmed. For anything non-CRUD — auth guards,
  relations between entities, uuid PKs, extra providers — propose a design
  first and wait for approval. Do not guess.

## Files (generate in this order)

Assume singular `X` / plural `Xs`; `xCamel` = camelCase singular, `xCs` =
PascalCase singular.

| #   | File                                                       | Notes                                                                                                                                                               |
| --- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `src/xs/dto/create-x.dto.ts`                               | class-validator decorators mirroring entity constraints (`@IsString()`, `@MaxLength()`, `@IsOptional()`, ...)                                                       |
| 2   | `src/xs/dto/update-x.dto.ts`                               | Same fields, all optional — **written manually**; `@nestjs/mapped-types` is not installed, no `PartialType`                                                         |
| 3   | `src/xs/x.entity.ts`                                       | `@Entity("snake_case_table")`, camelCase file, plain class with `!` definite assignment on every column; wire DB names via `{ name: "snake_case" }`                 |
| 4   | `src/xs/xs.service.ts`                                     | Injectable + `@InjectRepository(X)`, `public async findAll/findOne/create/update/delete`; `findOne` throws `NotFoundException` before reading/patching/deleting     |
| 5   | `src/xs/xs.controller.ts`                                  | `@Get()`, `@Get(":id")` + `ParseIntPipe`, `@Post`, `@Patch(":id")`, `@Delete(":id")` + `@HttpCode(HttpStatus.NO_CONTENT)`                                           |
| 6   | `src/xs/xs.module.ts`                                      | `TypeOrmModule.forFeature([X])`, one controller, one provider                                                                                                       |
| 7   | `src/app.module.ts`                                        | Add relative import + entry in `imports` (alphabetical within the relative import group)                                                                            |
| 8   | `src/database/migrations/YYYYMMDDHHMMSS-CreateXCSTable.ts` | Stamp **strictly greater** than every existing file's stamp; class `Create<XCs>Table<stamp>`; `up` creates the table (matching the entity exactly), `down` drops it |
| 9   | `__tests__/unit/xs.service.test.ts`                        | `createMockRepository()` from `__tests__/mocks/repository.mock.ts` bound via `getRepositoryToken(X)` — covers every service branch                                  |
| 10  | `__tests__/unit/xs.controller.test.ts`                     | Replace the service with an inline `useValue` of jest mocks, one test per handler                                                                                   |
| 11  | `__tests__/e2e/xs.e2e-spec.ts`                             | Full `AppModule` + ValidationPipe; five cases: POST+GET list, GET+PATCH roundtrip, 404 unknown id, DELETE→204 then 404, 400 invalid payload                         |

## Conventions (enforced, do not deviate)

- Prettier: **tabs at width 4**, double quotes, printWidth 120, trailing comma all (`.prettierrc`).
- ESLint `simple-import-sort` is an error: all external packages alphabetized
  in one group → blank line → relative imports. Match the notes files exactly.
- Table columns snake_case in migrations and `@Column({ name: "..." })`;
  TypeScript members camelCase. `createdAt`/`updatedAt` via
  `@CreateDateColumn({ name: "created_at" })` / `@UpdateDateColumn({ name: "updated_at" })`.
- Methods are `public` (explicit modifier), no `any` anywhere (company rule),
  early returns, one responsibility per file.
- Dependencies from package.json only — never add a dependency to scaffold a
  service (that includes `@nestjs/mapped-types`, `UUID` helpers, etc.).

## Testing facts (why tests need no database)

Jest sets `NODE_ENV=test`; `DatabaseModule.forRoot()` then wires
`MockDatabaseModule` — in-memory repositories that auto-provision per entity.
So e2e runs against `AppModule` with **no postgres and no entity
registration**. Keep the global pipe identical to the notes e2e file:
`new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })`.

Coverage gates are global (90% lines/functions/statements, 85% branches) — an
untested branch in the new service fails the whole suite.

## Verify (before reporting done)

1. `pnpm lint`
2. `pnpm test`
3. `pnpm test:e2e`
4. `pnpm format:check` (run `pnpm format` if it fails)
5. `pnpm migration:run` — only if the user has local postgres up
   (`docker-compose.yml`); `migrationsRun: true` applies pending migrations on
   app startup anyway.

Fix every failure yourself before reporting. Report the generated files and
the verify results.

## Common mistakes

| Mistake                                                        | Reality                                                                                                                              |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Colocating `<name>.spec.ts` next to source                     | Test files live in `__tests__/unit/` (`.test.ts`) and `__tests__/e2e/` (`.e2e-spec.ts`); jest testMatch ignores colocated specs      |
| `PartialType(CreateXDto)`                                      | `@nestjs/mapped-types` is not a dependency; write the update DTO by hand with optional fields                                        |
| Registering the entity with the mock module                    | Unnecessary — `MockRepository` auto-provisions per entity on first `getRepository` call                                              |
| Migration stamp reused Arbitrary or lower than an existing one | TypeORM applies migrations in filename order; clone `20260902000000` as the minimum and pick a strictly later stamp (e.g., now, UTC) |
| camelCase column names in entity + migration                   | SQL columns are snake_case (`created_at`); wire names via `{ name: "..." }`                                                          |
| Forgetting `!` on entity fields                                | `strictPropertyInitialization` breaks the build — every `@Column` member needs `!`                                                   |
| Missing `@HttpCode(HttpStatus.NO_CONTENT)` on DELETE           | Default POST/DELETE answer is 201/200; the API shape requires 204                                                                    |
| New e2e uses raw module imports                                | e2e boots `AppModule` — registering the feature module there is what makes e2e reachable                                             |
