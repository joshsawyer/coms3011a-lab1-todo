import Link from "next/link";
import type { SortDirection, SortField } from "@/lib/db/tasks";

const SORT_OPTIONS: { field: SortField; label: string }[] = [
  { field: "dueDate", label: "Due date" },
  { field: "topic", label: "Topic" },
  { field: "status", label: "Status" },
];

export function SortControls({
  activeSort,
  activeDirection,
}: {
  activeSort: SortField;
  activeDirection: SortDirection;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-zinc-500 dark:text-zinc-400">Sort by</span>
      {SORT_OPTIONS.map(({ field, label }) => {
        const isActive = field === activeSort;
        const nextDirection: SortDirection = isActive && activeDirection === "asc" ? "desc" : "asc";
        return (
          <Link
            key={field}
            href={`/?sort=${field}&direction=${nextDirection}`}
            className={`rounded-full px-3 py-1 font-medium transition-colors ${
              isActive
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            {label}
            {isActive && (activeDirection === "asc" ? " ↑" : " ↓")}
          </Link>
        );
      })}
    </div>
  );
}
