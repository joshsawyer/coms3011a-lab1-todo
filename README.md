# Tasks

A local-first todo app built with Next.js and SQLite for COMS3011A Lab 1. Single user, no accounts, all data stored locally in `data/app.db`.

## Quick start

Requires Node.js v20.19.6 (or any Node 20.x LTS).

```bash
npm install
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Run the tests with:

```bash
npm test
```

Full details — including how to reset local data and run a production build — are in [docs/running-it.md](docs/running-it.md).

## Documentation

- [Third-Party Code](docs/third-party-code.md) — libraries used and why.
- [Database Design](docs/database-design.md) — the `tasks` table and how overdue/archive are modelled.
- [Running It](docs/running-it.md) — exact install/run/test commands.

## Features

- Create, edit, and archive tasks (title, description, due date, topic). Archiving hides a task from the active list without deleting it — archived tasks remain viewable at `/archive`.
- Task list sortable by topic, status, or due date, with dedicated sidebar shortcuts for Overdue, Due tomorrow, and Completed.
- Three fixed statuses (Todo, In Progress, Complete), changeable inline from the task list via the status pill, or from the task's edit page.
- Overdue tasks are visually flagged; overdue is derived from the due date and is not a selectable status.
- All data persists in SQLite across restarts.
