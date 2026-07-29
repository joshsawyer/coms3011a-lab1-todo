# Database Design

SQLite database, managed via a single Drizzle-generated migration (`drizzle/0000_sharp_sunfire.sql`, derived from `src/lib/db/schema.ts`).

## Tables

There is a single table, `tasks`. The app has one user and no relational data beyond a task's own fields, so a single table with no foreign keys is sufficient — topic and status are plain columns, not references to separate lookup tables.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | integer | PRIMARY KEY AUTOINCREMENT | |
| `title` | text | NOT NULL | |
| `description` | text | nullable | Optional field. |
| `due_date` | integer | NOT NULL | Stored as a Unix millisecond timestamp. |
| `topic` | text | NOT NULL | Free-text category, not a foreign key — the sidebar's topic list is computed at read time as the distinct set of topics on active tasks. |
| `status` | text | NOT NULL, `CHECK (status IN ('todo', 'in_progress', 'complete'))`, default `'todo'` | The three fixed, non-customisable statuses from the brief, enforced at the database level as well as in the TypeScript type. |
| `archived_at` | integer | nullable | `NULL` means the task is active. A timestamp means the task was archived at that time. This is the **archive flag** — archiving a task sets this column; it never deletes the row or copies it elsewhere, so archived tasks remain queryable and viewable. |
| `created_at` | integer | NOT NULL, default `unixepoch('subsec') * 1000` | |
| `updated_at` | integer | NOT NULL, default `unixepoch('subsec') * 1000` | Set to the current time on every edit. |

## Relationships

None. A single table fully models the brief's requirements: one row per task, carrying all four required fields (title, description, due date, topic) plus status and the archive flag.

## Derived values (not stored)

Two values that might look like columns are deliberately **not** stored, to avoid them drifting out of sync with the data they depend on:

- **Overdue** is computed at read time (`isOverdue()` in `src/lib/db/tasks.ts`): a task is overdue when its `due_date` has passed, its `status` is not `complete`, and it is not archived. It is never written to the database and is not one of the three selectable statuses — it's a derived boolean (`overdue`) attached to each task when it's read, and rendered as a separate visual flag in the UI.
- **Sidebar counts and topic groupings** (Overdue, Due tomorrow, Completed, per-topic lists) are computed from the active task list on each request, not cached or stored.

## Queries

- **Active list**: `SELECT * FROM tasks WHERE archived_at IS NULL ORDER BY <topic|status|due_date> [ASC|DESC]`
- **Archived list**: `SELECT * FROM tasks WHERE archived_at IS NOT NULL ORDER BY archived_at DESC`
- **Archive a task**: `UPDATE tasks SET archived_at = <now> WHERE id = ?` — a flag update, not a delete or a copy.
- **Edit a task**: `UPDATE tasks SET <changed fields>, updated_at = <now> WHERE id = ?`
