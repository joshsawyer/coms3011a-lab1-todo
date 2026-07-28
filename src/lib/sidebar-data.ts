import { db } from "./db/client";
import { listActive } from "./db/tasks";

export interface SidebarData {
  overdueCount: number;
  dueTomorrowCount: number;
  completedCount: number;
  topics: string[];
  totalActive: number;
}

export function getSidebarData(): SidebarData {
  const active = listActive(db);

  const now = new Date();
  const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const dayAfterTomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);

  const overdueCount = active.filter((t) => t.overdue).length;
  const dueTomorrowCount = active.filter(
    (t) => t.dueDate >= tomorrowStart && t.dueDate < dayAfterTomorrowStart,
  ).length;
  const completedCount = active.filter((t) => t.status === "complete").length;

  const topics = Array.from(new Set(active.map((t) => t.topic))).sort();

  return { overdueCount, dueTomorrowCount, completedCount, topics, totalActive: active.length };
}
