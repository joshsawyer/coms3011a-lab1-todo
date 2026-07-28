import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { archive, getById } from "@/lib/db/tasks";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
  }

  if (!getById(db, id)) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const task = archive(db, id);
  return NextResponse.json({ task });
}
