// TODO: Switch to using API enums for consistency when possible
import type { Task } from "../types/task";
import { taskService } from "./taskService";
import { isoNow, readJson, writeJson } from "./storage";

const KEY = "taskmaster.inbox.v1";

export type InboxState = {
  lastViewedAt: string | null;
  dueSoonWindowDays: number;
  dismissedTaskIds: string[];
  lastComputedAtMs: number;
};

const DEFAULTS: InboxState = {
  lastViewedAt: null,
  dueSoonWindowDays: 3,
  dismissedTaskIds: [],
  lastComputedAtMs: Date.now(),
};

function getState(): InboxState {
  const s = readJson<InboxState>(KEY, DEFAULTS);
  // defensive defaults in case schema drifts
  return {
    lastViewedAt: s.lastViewedAt ?? null,
    dueSoonWindowDays: Number.isFinite(s.dueSoonWindowDays) ? s.dueSoonWindowDays : 3,
    dismissedTaskIds: Array.isArray(s.dismissedTaskIds) ? s.dismissedTaskIds : [],
    lastComputedAtMs: Number.isFinite(s.lastComputedAtMs) ? s.lastComputedAtMs : DEFAULTS.lastComputedAtMs,
  };
}

function setState(next: InboxState) {
  writeJson(KEY, next);
}

function isNewTask(t: Task, lastViewedAt: string | null): boolean {
  // If never viewed, treat everything as “new” once (good MVP behavior).
  if (!lastViewedAt) return true;
  return new Date(t.createdAt).getTime() > new Date(lastViewedAt).getTime();
}

function isDueSoon(t: Task, nowMs: number, windowDays: number): boolean {
  if (t.status !== "Open") return false;
  if (!t.dueAt) return false;

  const dueMs = new Date(t.dueAt).getTime();
  const endMs = nowMs + windowDays * 24 * 60 * 60 * 1000;

  return dueMs >= nowMs && dueMs <= endMs;
}

export const inboxService = {
  getState,

  touchNow() {
    const s = getState();
    setState({ ...s, lastComputedAtMs: Date.now() });
  },

  setDueSoonWindowDays(days: number) {
    const s = getState();
    const normalized = Math.max(1, Math.min(30, Math.floor(days || 0) || 3));
    setState({ ...s, dueSoonWindowDays: normalized, lastComputedAtMs: Date.now() });
  },

  dismiss(taskId: string) {
    const s = getState();
    if (s.dismissedTaskIds.includes(taskId)) return;
    setState({ ...s, dismissedTaskIds: [...s.dismissedTaskIds, taskId], lastComputedAtMs: Date.now() });
  },

  undismiss(taskId: string) {
    const s = getState();
    setState({ ...s, dismissedTaskIds: s.dismissedTaskIds.filter((id) => id !== taskId), lastComputedAtMs: Date.now() });
  },

  markViewedNow() {
    const s = getState();
    setState({ ...s, lastViewedAt: isoNow(), lastComputedAtMs: Date.now() });
  },

  getViewModel() {
    const s = getState();
    const all = taskService.getAll();

    const dismissed = new Set(s.dismissedTaskIds);
    const nowMs = Date.now();

    const newTasks = all
      .filter((t) => !dismissed.has(t.id))
      .filter((t) => isNewTask(t, s.lastViewedAt))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const dueSoonTasks = all
      .filter((t) => !dismissed.has(t.id))
      .filter((t) => isDueSoon(t, nowMs, s.dueSoonWindowDays))
      .sort((a, b) => new Date(a.dueAt!).getTime() - new Date(b.dueAt!).getTime());

    return {
      state: s,
      newTasks,
      dueSoonTasks,
    };
  },
};