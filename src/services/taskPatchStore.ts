import type { Task } from "../types/task";
import { readJson, writeJson, isoNow } from "./storage";

const KEY = "taskmaster.taskPatches.v1";

type TaskPatch = Partial<
  Pick<Task, "status" | "completedAt" | "updatedAt" | "dueAt" | "title" | "description">
>;

type TaskPatchStore = {
  patches: Record<string, TaskPatch>;
  deletedIds: string[];
};

const DEFAULTS: TaskPatchStore = { patches: {}, deletedIds: [] };

function getStore(): TaskPatchStore {
  const s = readJson<TaskPatchStore>(KEY, DEFAULTS);
  return {
    patches: s.patches ?? {},
    deletedIds: Array.isArray(s.deletedIds) ? s.deletedIds : [],
  };
}

function setStore(next: TaskPatchStore) {
  writeJson(KEY, next);
}

export const taskPatchStore = {
  applyAll(base: Task[]): Task[] {
    const store = getStore();
    const deleted = new Set(store.deletedIds);
    if (!store || Object.keys(store).length === 0) return base;

    return base
      .filter((t) => !deleted.has(t.id))
      .map((t) => {
        const patch = store.patches[t.id];
        return patch ? { ...t, ...patch } : t;
      });
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

  deleteIds(ids: string[]) {
    const store = getStore();
    const set = new Set(store.deletedIds);
    for (const id of ids) {
      set.add(id);
      // optional: also clear patches so store doesn’t grow forever
      delete store.patches[id];
    }
    store.deletedIds = Array.from(set);
    setStore(store);
  },
};