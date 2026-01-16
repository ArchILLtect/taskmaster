import type { Task } from "../types/task";
import { readJson, writeJson, isoNow } from "./storage";

const KEY = "taskmaster.taskPatches.v1";

type TaskPatch = Partial<
  Pick<Task, "status" | "completedAt" | "updatedAt" | "dueAt" | "title" | "description">
>;

type TaskPatchStore = {
  created: Record<string, Task>;
  patches: Record<string, TaskPatch>;
  deletedIds: string[];
};

const DEFAULTS: TaskPatchStore = { patches: {}, deletedIds: [], created: {} };

function getStore(): TaskPatchStore {
  const raw = readJson<Partial<TaskPatchStore>>(KEY, DEFAULTS);
  const created = (raw.created ?? {}) as Record<string, Task>;
  const patches = (raw.patches ?? {}) as Record<string, TaskPatch>;

  // Migration: older versions stored the full created Task object in `patches`.
  // Move any "task-shaped" patch entries into `created` so created tasks remain visible.
  let migrated = false;
  
  const toMove: Array<{ taskId: string; task: Task }> = [];

  for (const [taskId, patch] of Object.entries(patches)) {
    const maybeTask = patch as unknown as Partial<Task>;
    if (
      maybeTask &&
      typeof maybeTask === "object" &&
      typeof maybeTask.listId === "string" &&
      typeof maybeTask.title === "string"
    ) {
      toMove.push({ taskId, task: { ...(maybeTask as Task), id: taskId } });
    }
  }
  
  if (toMove.length > 0) {
    migrated = true;
    for (const { taskId, task } of toMove) {
      created[taskId] = task;
      delete patches[taskId];
    }
  }

  const store: TaskPatchStore = {
    patches,
    deletedIds: Array.isArray(raw.deletedIds) ? raw.deletedIds : [],
    created,
  };

  if (migrated) setStore(store);
  return store;
}

function setStore(next: TaskPatchStore) {
  writeJson(KEY, next);
}

export const taskPatchStore = {
  applyAll(base: Task[]): Task[] {
    const store = getStore();
    const created = Object.values(store.created ?? {});
    const deleted = new Set(store.deletedIds);

    const merged = [...base, ...created]
      .filter((t) => !deleted.has(t.id))
      .map((t) => {
        const patch = store.patches[t.id];
        return patch ? { ...t, ...patch } : t;
      });

    // Defensive de-dupe (shouldn't happen, but keeps output stable).
    const seen = new Set<string>();
    return merged.filter((t) => (seen.has(t.id) ? false : (seen.add(t.id), true)));
  },

  patch(taskId: string, patch: TaskPatch) {
    const store = getStore();
    const prev = store.patches[taskId] ?? {};
    store.patches[taskId] = { ...prev, ...patch };
    setStore(store);
  },

  clear(taskId: string) {
    const store = getStore();
    if (!(taskId in store.patches)) return;
    delete store.patches[taskId];
    setStore(store);
  },

  setStatus(taskId: string, status: Task["status"]) {
    const store = getStore();
    const now = isoNow();
    const prev = store.patches[taskId] ?? {};

    store.patches[taskId] =
      status === "Done"
        ? { ...prev, status, completedAt: now, updatedAt: now }
        : { ...prev, status, completedAt: null, updatedAt: now };

    setStore(store);
  },

  addPatch(patch: { type: "create"; task: Task }) {
    // Back-compat: older callers used addPatch for create; treat as created task.
    const store = getStore();
    store.created[patch.task.id] = patch.task;
    // If it had been deleted previously, revive it.
    store.deletedIds = store.deletedIds.filter((id) => id !== patch.task.id);
    setStore(store);
  },

  addCreated(task: Task) {
    const store = getStore();
    store.created[task.id] = task;
    store.deletedIds = store.deletedIds.filter((id) => id !== task.id);
    setStore(store);
  },

  deleteIds(ids: string[]) {
    const store = getStore();
    const set = new Set(store.deletedIds);
    for (const id of ids) {
      set.add(id);
      delete store.patches[id];
      delete store.created[id];
    }
    store.deletedIds = Array.from(set);
    setStore(store);
  },
};