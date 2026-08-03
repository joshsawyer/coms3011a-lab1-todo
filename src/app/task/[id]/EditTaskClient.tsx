"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TaskForm, parseLocalDate, type TaskFormValues } from "@/components/TaskForm";
import type { TaskWithOverdue } from "@/lib/db/tasks";
import { STATUS_LABELS, STATUS_STYLES, formatDueDate } from "@/lib/status";

export function EditTaskClient({ task }: { task: TaskWithOverdue }) {
  if (task.archivedAt) {
    return <ArchivedTaskView task={task} archivedAt={task.archivedAt} />;
  }

  return <EditableTaskForm task={task} />;
}

function ArchivedTaskView({ task, archivedAt }: { task: TaskWithOverdue; archivedAt: Date }) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6">
      <p className="rounded-md bg-zinc-100 px-3 py-2 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
        This task was archived on {formatDueDate(archivedAt)} and is read-only. View it in the{" "}
        <Link href="/archive" className="underline underline-offset-2">
          archive
        </Link>
        .
      </p>

      <div className="flex flex-col gap-5">
        <ReadOnlyField label="Title" value={task.title} />
        <ReadOnlyField label="Description" value={task.description || "—"} />
        <div className="grid grid-cols-2 gap-4">
          <ReadOnlyField label="Due date" value={formatDueDate(task.dueDate)} />
          <ReadOnlyField label="Topic" value={task.topic} />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Status
          </span>
          <span
            className={`w-fit rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[task.status]}`}
          >
            {STATUS_LABELS[task.status]}
          </span>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          Back
        </button>
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </span>
      <p className="text-sm text-zinc-900 dark:text-zinc-100">{value}</p>
    </div>
  );
}

function EditableTaskForm({ task }: { task: TaskWithOverdue }) {
  const router = useRouter();
  const [archiving, setArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  const initialValues: TaskFormValues = {
    title: task.title,
    description: task.description ?? "",
    dueDate: toDateInputValue(task.dueDate),
    topic: task.topic,
    status: task.status,
  };

  async function handleSubmit(values: TaskFormValues) {
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: values.title,
        description: values.description,
        topic: values.topic,
        status: values.status,
        dueDate: parseLocalDate(values.dueDate).toISOString(),
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { error: body.error ?? "Something went wrong. Please try again." };
    }

    return {};
  }

  async function handleArchive() {
    setArchiving(true);
    setArchiveError(null);

    const res = await fetch(`/api/tasks/${task.id}/archive`, { method: "POST" });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setArchiveError(body.error ?? "Could not archive this task.");
      setArchiving(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <TaskForm
        initialValues={initialValues}
        submitLabel="Save changes"
        showStatus
        onSubmit={handleSubmit}
      />

      <div className="border-t border-zinc-200 pt-5 dark:border-zinc-800">
        {archiveError && (
          <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {archiveError}
          </p>
        )}
        <button
          type="button"
          onClick={handleArchive}
          disabled={archiving}
          className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
        >
          {archiving ? "Archiving…" : "Archive task"}
        </button>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Archiving hides this task from the active list. It is never deleted and stays viewable in the archive.
        </p>
      </div>
    </div>
  );
}

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
