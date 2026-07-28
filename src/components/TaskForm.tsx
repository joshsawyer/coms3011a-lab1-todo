"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { TASK_STATUSES, type TaskStatus } from "@/lib/db/schema";
import { STATUS_LABELS } from "@/lib/status";

// Parses a "yyyy-mm-dd" <input type="date"> value as local midnight, not UTC
// midnight — new Date("yyyy-mm-dd") parses as UTC and can shift a day in
// negative-offset timezones, which would misfile a task's due date.
export function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export interface TaskFormValues {
  title: string;
  description: string;
  dueDate: string; // yyyy-mm-dd, suitable for <input type="date">
  topic: string;
  status: TaskStatus;
}

export function TaskForm({
  initialValues,
  submitLabel,
  showStatus,
  onSubmit,
}: {
  initialValues: TaskFormValues;
  submitLabel: string;
  showStatus: boolean;
  onSubmit: (values: TaskFormValues) => Promise<{ error?: string }>;
}) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await onSubmit(values);

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <Field label="Title">
        <input
          type="text"
          required
          value={values.title}
          onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
          className="input"
        />
      </Field>

      <Field label="Description">
        <textarea
          value={values.description}
          onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          rows={4}
          className="input resize-none"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Due date">
          <input
            type="date"
            required
            value={values.dueDate}
            onChange={(e) => setValues((v) => ({ ...v, dueDate: e.target.value }))}
            className="input"
          />
        </Field>

        <Field label="Topic">
          <input
            type="text"
            required
            placeholder="e.g. Work"
            value={values.topic}
            onChange={(e) => setValues((v) => ({ ...v, topic: e.target.value }))}
            className="input"
          />
        </Field>
      </div>

      {showStatus && (
        <Field label="Status">
          <select
            value={values.status}
            onChange={(e) => setValues((v) => ({ ...v, status: e.target.value as TaskStatus }))}
            className="input"
          >
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </Field>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {submitting ? "Saving…" : submitLabel}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </span>
      {children}
    </label>
  );
}
