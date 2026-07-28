import Link from "next/link";
import { db } from "@/lib/db/client";
import { listActive, type SortDirection, type SortField } from "@/lib/db/tasks";
import { SortControls } from "@/components/SortControls";
import { TaskRow } from "@/components/TaskRow";

const VALID_SORT_FIELDS: SortField[] = ["topic", "status", "dueDate"];

function parseSort(value: string | undefined): SortField {
  return VALID_SORT_FIELDS.includes(value as SortField) ? (value as SortField) : "dueDate";
}

function parseDirection(value: string | undefined): SortDirection {
  return value === "desc" ? "desc" : "asc";
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; direction?: string; filter?: string; topic?: string }>;
}) {
  const params = await searchParams;
  const sort = parseSort(params.sort);
  const direction = parseDirection(params.direction);

  let tasks = listActive(db, { sort, direction });

  if (params.filter === "overdue") {
    tasks = tasks.filter((t) => t.overdue);
  } else if (params.filter === "due-tomorrow") {
    const now = new Date();
    const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const dayAfter = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);
    tasks = tasks.filter((t) => t.dueDate >= tomorrowStart && t.dueDate < dayAfter);
  }

  if (params.topic) {
    tasks = tasks.filter((t) => t.topic === params.topic);
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-8 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {params.filter === "overdue"
              ? "Overdue"
              : params.filter === "due-tomorrow"
                ? "Due tomorrow"
                : params.topic ?? "All tasks"}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
          </p>
        </div>
        <Link
          href="/task/new"
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          + New task
        </Link>
      </div>

      <SortControls activeSort={sort} activeDirection={direction} />

      <div className="flex flex-col gap-2">
        {tasks.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            No tasks here yet.
          </p>
        ) : (
          tasks.map((task) => <TaskRow key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}
