import type { Task } from "../types/task";
import { taskService } from "./taskService";
import { isoNow, readJson, writeJson } from "./storage";

const KEY = "taskmaster.updates.v1";

export type UpdatesState = {
  lastReadAt: string | null;
  clearedBeforeAt: string | null;
};

const DEFAULTS: UpdatesState = {
  lastReadAt: null,
  clearedBeforeAt: null,
};

export type UpdateType = "task_created" | "task_completed" | "task_updated";

export type UpdateEvent = {
  id: string;          // stable derived id
  type: UpdateType;
  occurredAt: string;  // ISO
  taskId: string;
  listId: string;
  title: string;       // display string
};

function getState(): UpdatesState {
  const s = readJson<UpdatesState>(KEY, DEFAULTS);
  return {
    lastReadAt: s.lastReadAt ?? null,
    clearedBeforeAt: s.clearedBeforeAt ?? null,
  };
}

function setState(next: UpdatesState) {
  writeJson(KEY, next);
}

function deriveEvents(tasks: Task[]): UpdateEvent[] {
  const events: UpdateEvent[] = [];

  for (const t of tasks) {
    events.push({
      id: `created:${t.id}:${t.createdAt}`,
      type: "task_created",
      occurredAt: t.createdAt,
      taskId: t.id,
      listId: t.listId,
      title: `Task created: ${t.title}`,
    });

    if (t.updatedAt && t.updatedAt !== t.createdAt) {
      events.push({
        id: `updated:${t.id}:${t.updatedAt}`,
        type: "task_updated",
        occurredAt: t.updatedAt,
        taskId: t.id,
        listId: t.listId,
        title: `Task updated: ${t.title}`,
      });
    }

    if (t.status === "Done") {
      const when = t.completedAt ?? t.updatedAt;
      events.push({
        id: `completed:${t.id}:${when}`,
        type: "task_completed",
        occurredAt: when,
        taskId: t.id,
        listId: t.listId,
        title: `Task completed: ${t.title}`,
      });
    }
  }

  return events.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
}

export const updatesService = {
  getState,

  markAllReadNow() {
    const s = getState();
    setState({ ...s, lastReadAt: isoNow() });
  },

  clearRead() {
    const s = getState();
    // “Clear read” means: hide everything up to lastReadAt
    if (!s.lastReadAt) return;
    setState({ ...s, clearedBeforeAt: s.lastReadAt });
  },

  getViewModel() {
    const s = getState();
    const events = deriveEvents(taskService.getAll());

    const clearedBeforeMs = s.clearedBeforeAt ? new Date(s.clearedBeforeAt).getTime() : -Infinity;
    const lastReadMs = s.lastReadAt ? new Date(s.lastReadAt).getTime() : -Infinity;

    const visible = events.filter((e) => new Date(e.occurredAt).getTime() > clearedBeforeMs);
    const unreadCount = visible.filter((e) => new Date(e.occurredAt).getTime() > lastReadMs).length;

    return {
      state: s,
      events: visible,
      unreadCount,
    };
  },
};