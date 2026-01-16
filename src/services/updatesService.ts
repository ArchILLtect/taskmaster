import { isoNow, readJson, writeJson } from "./storage";
import { updatesEventStore } from "./updatesEventStore";

const KEY = "taskmaster.updates.v1";

export type UpdatesState = {
  lastReadAt: string | null;
  clearedBeforeAt: string | null;
};

const DEFAULTS: UpdatesState = {
  lastReadAt: null,
  clearedBeforeAt: null,
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
    const events = updatesEventStore.getAll();

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