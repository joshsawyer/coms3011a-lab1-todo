# Third-Party Code

Libraries and packages installed for this project, and why each was chosen.

## Runtime dependencies

| Package | Why |
|---|---|
| [next](https://nextjs.org/) | Required by the brief. App Router gives server components that can read SQLite directly on the server, plus file-based routing for the four pages this app needs. |
| [react](https://react.dev/) / [react-dom](https://react.dev/) | Peer dependencies of Next.js. |
| [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | Required by the brief (SQLite). Chosen over `node:sqlite` alternatives for its synchronous API — no async ceremony for what is, for a single local user, always a fast local read/write — and it has no native-build flakiness under a standard Node install, which matters for a project that has to run cleanly from a clean clone during grading. |
| [drizzle-orm](https://orm.drizzle.team/) | Typed schema and query builder for the `tasks` table. Chosen over raw SQL so the schema definition in code and the "Database Design" documentation can't drift apart, and over Prisma for a lighter footprint and no code-generation step in the dev loop. |

## Development dependencies

| Package | Why |
|---|---|
| [drizzle-kit](https://orm.drizzle.team/kit-docs/overview) | Generates SQL migration files from the Drizzle schema (`npm run db:generate`), so the migration in `drizzle/` is derived from `src/lib/db/schema.ts` rather than hand-written and liable to go stale. |
| [tsx](https://github.com/privatenumber/tsx) | Runs the TypeScript migration script (`scripts/migrate.ts`) directly with `npm run db:migrate`, without a separate build step. |
| [vitest](https://vitest.dev/) | Test runner. Chosen for native TypeScript/ESM support and fast startup — the test suite runs against an in-memory SQLite database, so there's no need for a browser environment or heavy test harness. |
| [tailwindcss](https://tailwindcss.com/) + [@tailwindcss/postcss](https://tailwindcss.com/) | Utility-first styling, used to build the dark sidebar / status-pill interface without hand-writing a separate CSS file per component. |
| [typescript](https://www.typescriptlang.org/) | Static typing across the schema, data-access layer, API routes, and components — the same `Task` type flows from the database schema through to the UI. |
| [eslint](https://eslint.org/) + [eslint-config-next](https://nextjs.org/docs/app/api-reference/config/eslint) | Linting, scaffolded by `create-next-app`. |
| `@types/*` packages | Type definitions for `node`, `react`, `react-dom`, and `better-sqlite3` (which ships without its own types). |

No authentication, state-management, or ORM-adjacent libraries beyond the above were added — the brief specifies a single local user with no accounts, so there was nothing for those to do.
