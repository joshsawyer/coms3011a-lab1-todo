import { asc, desc, eq, isNull, isNotNull } from "drizzle-orm";
import type { AppDatabase } from "./client";
import { tasks, type Task, type TaskStatus } from "./schema";

export type SortField = "topic" | "status" | "dueDate";
export type SortDirection = "asc" | "desc";

export interface TaskWithOverdue extends Task {
  overdue: boolean;
}

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  dueDate: Date;
  topic: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  dueDate?: Date;
  topic?: string;
  status?: TaskStatus;
}

// Overdue is derived, never stored: a task is overdue when its due date has
// passed and it is neither complete nor archived. This keeps "overdue" from
// ever drifting out of sync with the fields it depends on.
export function isOverdue(task: Pick<Task, "dueDate" | "status" | "archivedAt">, now: Date = new Date()): boolean {
  if (task.archivedAt) return false;
  if (task.status === "complete") return false;
  return task.dueDate.getTime() < now.getTime();
}

function withOverdue(task: Task, now: Date = new Date()): TaskWithOverdue {
  return { ...task, overdue: isOverdue(task, now) };
}

const SORT_COLUMNS = {
  topic: tasks.topic,
  status: tasks.status,
  dueDate: tasks.dueDate,
} as const;

export function listActive(
  db: AppDatabase,
  options: { sort?: SortField; direction?: SortDirection } = {},
): TaskWithOverdue[] {
  const { sort = "dueDate", direction = "asc" } = options;
  const column = SORT_COLUMNS[sort];
  const orderFn = direction === "desc" ? desc : asc;

  const rows = db
    .select()
    .from(tasks)
    .where(isNull(tasks.archivedAt))
    .orderBy(orderFn(column))
    .all();

  return rows.map((row) => withOverdue(row));
}

export function listArchived(db: AppDatabase): TaskWithOverdue[] {
  const rows = db
    .select()
    .from(tasks)
    .where(isNotNull(tasks.archivedAt))
    .orderBy(desc(tasks.archivedAt))
    .all();

  return rows.map((row) => withOverdue(row));
}

export function getById(db: AppDatabase, id: number): TaskWithOverdue | undefined {
  const row = db.select().from(tasks).where(eq(tasks.id, id)).get();
  return row ? withOverdue(row) : undefined;
}

export function create(db: AppDatabase, input: CreateTaskInput): TaskWithOverdue {
  const row = db
    .insert(tasks)
    .values({
      title: input.title,
      description: input.description ?? null,
      dueDate: input.dueDate,
      topic: input.topic,
      status: "todo",
    })
    .returning()
    .get();

  return withOverdue(row);
}

export function update(db: AppDatabase, id: number, input: UpdateTaskInput): TaskWithOverdue | undefined {
  const row = db
    .update(tasks)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(tasks.id, id))
    .returning()
    .get();

  return row ? withOverdue(row) : undefined;
}

export function archive(db: AppDatabase, id: number): TaskWithOverdue | undefined {
  const row = db
    .update(tasks)
    .set({ archivedAt: new Date(), updatedAt: new Date() })
    .where(eq(tasks.id, id))
    .returning()
    .get();

  return row ? withOverdue(row) : undefined;
}
