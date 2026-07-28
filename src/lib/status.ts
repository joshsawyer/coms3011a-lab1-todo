import type { TaskStatus } from "./db/schema";

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  complete: "Complete",
};

export const STATUS_STYLES: Record<TaskStatus, string> = {
  todo: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  complete: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

export const STATUS_DOT_COLORS: Record<TaskStatus, string> = {
  todo: "bg-zinc-400",
  in_progress: "bg-blue-500",
  complete: "bg-emerald-500",
};

const TOPIC_DOT_COLORS = [
  "bg-rose-500",
  "bg-indigo-500",
  "bg-amber-500",
  "bg-teal-500",
  "bg-fuchsia-500",
  "bg-lime-500",
];

export function topicColor(topic: string): string {
  let hash = 0;
  for (let i = 0; i < topic.length; i++) {
    hash = (hash * 31 + topic.charCodeAt(i)) >>> 0;
  }
  return TOPIC_DOT_COLORS[hash % TOPIC_DOT_COLORS.length];
}

export function formatDueDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
