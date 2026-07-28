"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { TASK_STATUSES, type TaskStatus } from "@/lib/db/schema";
import { STATUS_DOT_COLORS, STATUS_LABELS, STATUS_STYLES } from "@/lib/status";

export function StatusPicker({ taskId, status }: { taskId: number; status: TaskStatus }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleSelect(next: TaskStatus) {
    setOpen(false);
    if (next === status) return;

    setPending(true);
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setPending(false);

    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={pending}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={`rounded-full px-2 py-0.5 text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-50 ${STATUS_STYLES[status]}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {STATUS_LABELS[status]}
      </button>

      {open && (
        <div
          role="listbox"
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 z-10 mt-1 w-36 overflow-hidden rounded-md border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        >
          {TASK_STATUSES.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={option === status}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSelect(option);
              }}
              className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                option === status ? "font-medium text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT_COLORS[option]}`} />
              {STATUS_LABELS[option]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
