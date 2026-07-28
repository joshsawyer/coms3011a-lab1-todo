import { db } from "@/lib/db/client";
import { listArchived } from "@/lib/db/tasks";
import { TaskRow } from "@/components/TaskRow";

export default function ArchivePage() {
  const tasks = listArchived(db);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-8 py-10">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Archive</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {tasks.length} archived {tasks.length === 1 ? "task" : "tasks"}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {tasks.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            No archived tasks yet.
          </p>
        ) : (
          tasks.map((task) => <TaskRow key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}
