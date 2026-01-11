import type { Task } from "../types/task";
import { readJson, writeJson, isoNow } from "./storage";

const KEY = "taskmaster.taskPatches.v1";

type TaskPatch = Partial<
  Pick<Task, "status" | "completedAt" | "updatedAt" | "dueAt" | "title" | "description">
>;

type TaskPatchStore = Record<string, TaskPatch>;

function getStore(): TaskPatchStore {
  return readJson<TaskPatchStore>(KEY, {});
}

function setStore(next: TaskPatchStore) {
  writeJson(KEY, next);
}

export const taskPatchStore = {
  applyAll(base: Task[]): Task[] {
    const store = getStore();
    if (!store || Object.keys(store).length === 0) return base;

    return base.map((t) => {
      const patch = store[t.id];
      return patch ? { ...t, ...patch } : t;
    });
  },

  patch(taskId: string, patch: TaskPatch) {
    const store = getStore();
    const prev = store[taskId] ?? {};
    store[taskId] = { ...prev, ...patch };
    setStore(store);
  },

  clear(taskId: string) {
    const store = getStore();
    if (!(taskId in store)) return;
    delete store[taskId];
    setStore(store);
  },

  setStatus(taskId: string, status: Task["status"]) {
    const now = isoNow();
    if (status === "Done") {
      this.patch(taskId, { status, completedAt: now, updatedAt: now });
    } else {
      // revive
      this.patch(taskId, { status, completedAt: null, updatedAt: now });
    }
  },
};