import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const TASK_STATUSES = ["todo", "in_progress", "complete"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: integer("due_date", { mode: "timestamp_ms" }).notNull(),
  topic: text("topic").notNull(),
  status: text("status", { enum: TASK_STATUSES }).notNull().default("todo"),
  // null = active task; a timestamp marks when the task was archived.
  // Archiving never deletes or copies the row, per the assignment brief.
  archivedAt: integer("archived_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch('subsec') * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch('subsec') * 1000)`),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
