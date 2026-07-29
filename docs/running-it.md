# Running It

## Requirements

- Node.js **v20.19.6** (or any Node 20.x LTS release)
- npm (bundled with Node)

No other services are required. The app is local-first: it opens/creates a SQLite database file on disk (`data/app.db`) the first time it's migrated, and does not connect to anything over the network.

## Install

```bash
npm install
```

## Set up the database

Creates `data/app.db` and applies the schema migration in `drizzle/`:

```bash
npm run db:migrate
```

This is safe to re-run — it only applies migrations that haven't been applied yet, and won't touch existing data.

## Run

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

For a production-style run instead:

```bash
npm run build
npm run start
```

## Test

```bash
npm test
```

Runs the Vitest suite in `src/lib/db/tasks.test.ts`. Each test creates a fresh **in-memory** SQLite database (migrated from the same `drizzle/` migration used above) and tears it down afterwards — the test run never reads or writes `data/app.db`, so it's safe to run at any time without affecting your own tasks.

## Resetting local data

The database lives entirely in `data/app.db` (plus SQLite's WAL sidecar files). To start over:

```bash
rm -f data/app.db data/app.db-wal data/app.db-shm
npm run db:migrate
```
