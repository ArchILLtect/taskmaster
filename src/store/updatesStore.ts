import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

import { isoNow } from "../services/storage";

const STORAGE_KEY = "taskmaster:updates";
const STORE_VERSION = 1;
const MAX_EVENTS = 500;

export type UpdateType =
  | "task_created"
  | "task_completed"
  | "task_reopened"
  | "task_deleted"
  | "task_updated";

export type UpdateEvent = {
  id: string;
  type: UpdateType;
  occurredAt: string; // ISO
  taskId: string;
  listId: string;
  title: string;
  parentTaskId?: string | null;
};

export type UpdatesPersistedStateV1 = {
  events: UpdateEvent[];
  lastReadAt: string | null;
  clearedBeforeAt: string | null;
};

const DEFAULTS: UpdatesPersistedStateV1 = {
  events: [],
  lastReadAt: null,
  clearedBeforeAt: null,
};

type UpdatesStore = UpdatesPersistedStateV1 & {
  addEvent: (evt: Omit<UpdateEvent, "id" | "occurredAt">) => UpdateEvent;
  clearAll: () => void;
  markAllReadNow: () => void;
  clearRead: () => void;
};

export const useUpdatesStore = create<UpdatesStore>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,

      addEvent: (evt) => {
        const full: UpdateEvent = {
          ...evt,
          id: makeId("evt"),
          occurredAt: isoNow(),
        };

        const next = [full, ...(get().events ?? [])].slice(0, MAX_EVENTS);
        set({ events: next });
        return full;
      },

      clearAll: () => {
        // Intentionally does not touch read/unread state.
        set({ events: [] });
      },

      markAllReadNow: () => {
        set({ lastReadAt: isoNow() });
      },

      clearRead: () => {
        const s = get();
        if (!s.lastReadAt) return;
        set({ clearedBeforeAt: s.lastReadAt });
      },
    }),
    {
      name: STORAGE_KEY,
      version: STORE_VERSION,
      migrate: (persistedState) => persistedState,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        events: s.events,
        lastReadAt: s.lastReadAt,
        clearedBeforeAt: s.clearedBeforeAt,
      }),
    }
  )
);

function makeId(prefix: string) {
  const core =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${core}`;
}

export function useUpdatesActions(): Pick<UpdatesStore, "addEvent" | "markAllReadNow" | "clearRead" | "clearAll"> {
  return useUpdatesStore(
    useShallow((s) => ({
      addEvent: s.addEvent,
      markAllReadNow: s.markAllReadNow,
      clearRead: s.clearRead,
      clearAll: s.clearAll,
    }))
  );
}

type UpdatesView = {
  state: Pick<UpdatesPersistedStateV1, "lastReadAt" | "clearedBeforeAt">;
  events: UpdateEvent[];
  unreadCount: number;
};

// Important: React 19 + useSyncExternalStore requires getSnapshot to be cached.
// If our selector returns fresh objects/arrays on every call (even when state didn't change),
// React can get stuck in an infinite rerender loop.
const selectUpdatesView = (() => {
  let prevEventsRef: UpdateEvent[] | null = null;
  let prevLastReadAt: string | null = null;
  let prevClearedBeforeAt: string | null = null;
  let prevView: UpdatesView | null = null;

  return (s: UpdatesStore): UpdatesView => {
    const eventsRef = s.events ?? [];
    const lastReadAt = s.lastReadAt ?? null;
    const clearedBeforeAt = s.clearedBeforeAt ?? null;

    if (
      prevView &&
      prevEventsRef === eventsRef &&
      prevLastReadAt === lastReadAt &&
      prevClearedBeforeAt === clearedBeforeAt
    ) {
      return prevView;
    }

    const clearedBeforeMs = clearedBeforeAt ? new Date(clearedBeforeAt).getTime() : -Infinity;
    const lastReadMs = lastReadAt ? new Date(lastReadAt).getTime() : -Infinity;

    const visible = eventsRef.filter((e) => new Date(e.occurredAt).getTime() > clearedBeforeMs);
    const unreadCount = visible.filter((e) => new Date(e.occurredAt).getTime() > lastReadMs).length;

    prevEventsRef = eventsRef;
    prevLastReadAt = lastReadAt;
    prevClearedBeforeAt = clearedBeforeAt;
    prevView = {
      state: {
        lastReadAt,
        clearedBeforeAt,
      },
      events: visible,
      unreadCount,
    };

    return prevView;
  };
})();

export function useUpdatesView(): UpdatesView {
  return useUpdatesStore(selectUpdatesView);
}

// Back-compat facade for existing call sites (API layer appends events here).
export const updatesEventStore = {
  append(evt: Omit<UpdateEvent, "id" | "occurredAt">): UpdateEvent {
    return useUpdatesStore.getState().addEvent(evt);
  },

  getAll(): UpdateEvent[] {
    return useUpdatesStore.getState().events ?? [];
  },

  clearAll() {
    useUpdatesStore.getState().clearAll();
  },
};
