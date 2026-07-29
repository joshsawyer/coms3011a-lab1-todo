import { beforeEach, describe, expect, it } from "vitest";
import { createDb, type AppDatabase } from "./client";
import { runMigrations } from "./migrate";
import { archive, create, getById, isOverdue, listActive, listArchived, update } from "./tasks";

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

describe("update", () => {
  it("persists field edits, retrievable via getById", () => {
    const created = create(db, {
      title: "Draft newsletter",
      dueDate: new Date(Date.now() + 86_400_000),
      topic: "Work",
    });

    update(db, created.id, { title: "Draft weekly newsletter", topic: "Marketing" });

    const reloaded = getById(db, created.id);
    expect(reloaded).toMatchObject({
      title: "Draft weekly newsletter",
      topic: "Marketing",
    });
  });

  it("changes status, including marking a task complete", () => {
    const created = create(db, {
      title: "Review PR",
      dueDate: new Date(Date.now() + 86_400_000),
      topic: "Work",
    });
    expect(created.status).toBe("todo");

    update(db, created.id, { status: "in_progress" });
    expect(getById(db, created.id)?.status).toBe("in_progress");

    update(db, created.id, { status: "complete" });
    expect(getById(db, created.id)?.status).toBe("complete");
  });

  it("a completed task is never overdue, even with a past due date", () => {
    const created = create(db, {
      title: "Overdue but done",
      dueDate: new Date("2020-01-01"),
      topic: "Work",
    });

    const completed = update(db, created.id, { status: "complete" });
    expect(completed?.overdue).toBe(false);
  });
});

describe("listActive sorting", () => {
  beforeEach(() => {
    create(db, { title: "Charlie task", dueDate: new Date("2026-03-03"), topic: "Zebra" });
    create(db, { title: "Alpha task", dueDate: new Date("2026-01-01"), topic: "Apple" });
    create(db, { title: "Bravo task", dueDate: new Date("2026-02-02"), topic: "Mango" });
  });

  it("sorts by due date ascending by default", () => {
    const active = listActive(db);
    expect(active.map((t) => t.title)).toEqual(["Alpha task", "Bravo task", "Charlie task"]);
  });

  it("sorts by due date descending", () => {
    const active = listActive(db, { sort: "dueDate", direction: "desc" });
    expect(active.map((t) => t.title)).toEqual(["Charlie task", "Bravo task", "Alpha task"]);
  });

  it("sorts by topic ascending", () => {
    const active = listActive(db, { sort: "topic", direction: "asc" });
    expect(active.map((t) => t.topic)).toEqual(["Apple", "Mango", "Zebra"]);
  });

  it("sorts by status", () => {
    const [charlie, alpha] = listActive(db, { sort: "dueDate" });
    update(db, alpha.id, { status: "complete" });
    update(db, charlie.id, { status: "in_progress" });

    const byStatus = listActive(db, { sort: "status", direction: "asc" });
    // "complete" < "in_progress" < "todo" alphabetically
    expect(byStatus.map((t) => t.status)).toEqual(["complete", "in_progress", "todo"]);
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
