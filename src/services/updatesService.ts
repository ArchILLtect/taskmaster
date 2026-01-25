import type { UpdatesPersistedStateV1 } from "./updatesEventStore";
import { useUpdatesStore, updatesEventStore } from "./updatesEventStore";

export const updatesService = {
  getState(): Pick<UpdatesPersistedStateV1, "lastReadAt" | "clearedBeforeAt"> {
    const s = useUpdatesStore.getState();
    return {
      lastReadAt: s.lastReadAt ?? null,
      clearedBeforeAt: s.clearedBeforeAt ?? null,
    };
  },

  markAllReadNow() {
    useUpdatesStore.getState().markAllReadNow();
  },

  clearRead() {
    useUpdatesStore.getState().clearRead();
  },

  getViewModel() {
    const s = updatesService.getState();
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