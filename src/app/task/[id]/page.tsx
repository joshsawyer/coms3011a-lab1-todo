import { notFound } from "next/navigation";
import { db } from "@/lib/db/client";
import { getById } from "@/lib/db/tasks";
import { EditTaskClient } from "./EditTaskClient";

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  const task = Number.isInteger(id) ? getById(db, id) : undefined;
  if (!task) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-8 py-10">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Edit task</h1>
      <EditTaskClient task={task} />
    </div>
  );
}
