import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { create, listActive, type SortDirection, type SortField } from "@/lib/db/tasks";

const VALID_SORT_FIELDS: SortField[] = ["topic", "status", "dueDate"];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sortParam = searchParams.get("sort");
  const directionParam = searchParams.get("direction");

  const sort = VALID_SORT_FIELDS.includes(sortParam as SortField)
    ? (sortParam as SortField)
    : "dueDate";
  const direction: SortDirection = directionParam === "desc" ? "desc" : "asc";

  const tasks = listActive(db, { sort, direction });
  return NextResponse.json({ tasks });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const dueDateRaw = typeof body.dueDate === "string" ? body.dueDate : "";

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (!topic) {
    return NextResponse.json({ error: "Topic is required" }, { status: 400 });
  }
  const dueDate = new Date(dueDateRaw);
  if (!dueDateRaw || Number.isNaN(dueDate.getTime())) {
    return NextResponse.json({ error: "A valid due date is required" }, { status: 400 });
  }

  const task = create(db, {
    title,
    topic,
    description: description || null,
    dueDate,
  });

  return NextResponse.json({ task }, { status: 201 });
}
