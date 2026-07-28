import { beforeEach, describe, expect, it } from "vitest";
import { createDb, type AppDatabase } from "./client";
import { runMigrations } from "./migrate";
import { archive, create, isOverdue, listActive, listArchived } from "./tasks";

let db: AppDatabase;

beforeEach(() => {
  db = createDb(":memory:");
  runMigrations(db);
});

describe("create + listActive", () => {
  it("creates a task and returns it in the active list", () => {
    create(db, {
      title: "Write report",
      description: "Cover Q1 numbers",
      dueDate: new Date(Date.now() + 86_400_000),
      topic: "Work",
    });

    const active = listActive(db);
    expect(active).toHaveLength(1);
    expect(active[0]).toMatchObject({
      title: "Write report",
      topic: "Work",
      status: "todo",
      overdue: false,
    });
  });
});

describe("isOverdue", () => {
  const base = { archivedAt: null as Date | null, status: "todo" as const };

  it("is true when the due date has passed and status is not complete", () => {
    const task = { ...base, dueDate: new Date("2020-01-01") };
    expect(isOverdue(task, new Date("2026-01-01"))).toBe(true);
  });

  it("is false when the task is complete, even if the due date passed", () => {
    const task = { ...base, status: "complete" as const, dueDate: new Date("2020-01-01") };
    expect(isOverdue(task, new Date("2026-01-01"))).toBe(false);
  });

  it("is false when the due date is in the future", () => {
    const task = { ...base, dueDate: new Date("2099-01-01") };
    expect(isOverdue(task, new Date("2026-01-01"))).toBe(false);
  });

  it("is false when the task is archived, even if overdue", () => {
    const task = { ...base, archivedAt: new Date("2025-06-01"), dueDate: new Date("2020-01-01") };
    expect(isOverdue(task, new Date("2026-01-01"))).toBe(false);
  });
});

describe("archive", () => {
  it("removes the task from the active list but keeps it in the archived list", () => {
    const created = create(db, {
      title: "Old task",
      dueDate: new Date(Date.now() + 86_400_000),
      topic: "Personal",
    });

    archive(db, created.id);

    expect(listActive(db)).toHaveLength(0);

    const archived = listArchived(db);
    expect(archived).toHaveLength(1);
    expect(archived[0].id).toBe(created.id);
    expect(archived[0].archivedAt).not.toBeNull();
  });
});
