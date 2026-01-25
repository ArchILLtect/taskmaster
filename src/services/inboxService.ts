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
};