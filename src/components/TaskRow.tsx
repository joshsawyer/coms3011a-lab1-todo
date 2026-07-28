import Link from "next/link";
import type { TaskWithOverdue } from "@/lib/db/tasks";
import { STATUS_LABELS, STATUS_STYLES, formatDueDate, topicColor } from "@/lib/status";

export function TaskRow({ task }: { task: TaskWithOverdue }) {
  return (
    <Link
      href={`/task/${task.id}`}
      className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white px-4 py-3 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${topicColor(task.topic)}`} aria-hidden />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {task.title}
        </p>
        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{task.topic}</p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {task.overdue && (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
            Overdue
          </span>
        )}
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {formatDueDate(task.dueDate)}
        </span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[task.status]}`}>
          {STATUS_LABELS[task.status]}
        </span>
      </div>
    </Link>
  );
}
