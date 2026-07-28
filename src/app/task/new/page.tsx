"use client";

import { TaskForm, parseLocalDate, type TaskFormValues } from "@/components/TaskForm";

const EMPTY_VALUES: TaskFormValues = {
  title: "",
  description: "",
  dueDate: "",
  topic: "",
  status: "todo",
};

export default function NewTaskPage() {
  async function handleSubmit(values: TaskFormValues) {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: values.title,
        description: values.description,
        topic: values.topic,
        dueDate: parseLocalDate(values.dueDate).toISOString(),
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { error: body.error ?? "Something went wrong. Please try again." };
    }

    return {};
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-8 py-10">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">New task</h1>
      <TaskForm
        initialValues={EMPTY_VALUES}
        submitLabel="Create task"
        showStatus={false}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
