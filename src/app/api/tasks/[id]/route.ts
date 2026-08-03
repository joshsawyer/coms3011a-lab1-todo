import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { getById, update } from "@/lib/db/tasks";
import { TASK_STATUSES, type TaskStatus } from "@/lib/db/schema";

function parseId(idParam: string): number | null {
  const id = Number(idParam);
  return Number.isInteger(id) ? id : null;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = parseId(idParam);
  if (id === null) {
    return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
  }

  const task = getById(db, id);
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({ task });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = parseId(idParam);
  if (id === null) {
    return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
  }

  const existing = getById(db, id);
  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  if (existing.archivedAt) {
    return NextResponse.json({ error: "Archived tasks cannot be edited" }, { status: 409 });
  }

  const body = await request.json();
  const patch: Parameters<typeof update>[2] = {};

  if (typeof body.title === "string") {
    const title = body.title.trim();
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    patch.title = title;
  }

  if (typeof body.topic === "string") {
    const topic = body.topic.trim();
    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }
    patch.topic = topic;
  }

  if (typeof body.description === "string") {
    patch.description = body.description.trim() || null;
  }

  if (typeof body.dueDate === "string") {
    const dueDate = new Date(body.dueDate);
    if (Number.isNaN(dueDate.getTime())) {
      return NextResponse.json({ error: "A valid due date is required" }, { status: 400 });
    }
    patch.dueDate = dueDate;
  }

  if (typeof body.status === "string") {
    if (!TASK_STATUSES.includes(body.status as TaskStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    patch.status = body.status as TaskStatus;
  }

  const task = update(db, id, patch);
  return NextResponse.json({ task });
}
