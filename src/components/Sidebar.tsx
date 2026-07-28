import Link from "next/link";
import { getSidebarData } from "@/lib/sidebar-data";
import { topicColor } from "@/lib/status";

export function Sidebar() {
  const { overdueCount, dueTomorrowCount, topics, totalActive } = getSidebarData();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col gap-6 bg-zinc-950 px-4 py-6 text-zinc-300">
      <div className="flex items-center justify-between px-2">
        <span className="text-sm font-semibold tracking-wide text-white">Tasks</span>
        <Link
          href="/task/new"
          className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-800 text-zinc-200 transition-colors hover:bg-zinc-700"
          aria-label="New task"
        >
          +
        </Link>
      </div>

      <nav className="flex flex-col gap-1">
        <SidebarLink href="/?filter=overdue" label="Overdue" count={overdueCount} dotClassName="bg-red-500" />
        <SidebarLink href="/?filter=due-tomorrow" label="Due tomorrow" count={dueTomorrowCount} dotClassName="bg-amber-400" />
      </nav>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">All tasks</span>
          <span className="text-xs text-zinc-500">{totalActive}</span>
        </div>
        <SidebarLink href="/" label="List" />
        {topics.map((topic) => (
          <SidebarLink
            key={topic}
            href={`/?topic=${encodeURIComponent(topic)}`}
            label={topic}
            dotClassName={topicColor(topic)}
          />
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-1 border-t border-zinc-800 pt-4">
        <SidebarLink href="/archive" label="Archive" />
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  label,
  count,
  dotClassName,
}: {
  href: string;
  label: string;
  count?: number;
  dotClassName?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-white"
    >
      <span className="flex items-center gap-2">
        {dotClassName && <span className={`h-2 w-2 rounded-full ${dotClassName}`} />}
        {label}
      </span>
      {typeof count === "number" && count > 0 && (
        <span className="rounded-full bg-red-500/90 px-1.5 py-0.5 text-xs font-medium text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
