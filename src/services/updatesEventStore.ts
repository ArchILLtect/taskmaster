import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { isoNow } from "./storage";

const STORAGE_KEY = "taskmaster:updates";
const STORE_VERSION = 1;
const MAX_EVENTS = 500;

export type UpdateType =
  | "task_created"
  | "task_completed"
  | "task_reopened"
  | "task_deleted"
  | "task_updated"; // optional if/when you implement edits

export type UpdateEvent = {
  id: string;         // unique
  type: UpdateType;
  occurredAt: string; // ISO
  taskId: string;
  listId: string;
  title: string;      // snapshot title at time of event
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
  appendEvent: (evt: Omit<UpdateEvent, "id" | "occurredAt">) => UpdateEvent;
  clearAllEvents: () => void;
  markAllReadNow: () => void;
  clearRead: () => void;
};

export const useUpdatesStore = create<UpdatesStore>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,

      appendEvent: (evt) => {
        const full: UpdateEvent = {
          ...evt,
          id: makeId("evt"),
          occurredAt: isoNow(),
        };

        const next = [full, ...(get().events ?? [])].slice(0, MAX_EVENTS);
        set({ events: next });
        return full;
      },

      clearAllEvents: () => {
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

export const updatesEventStore = {
  append(evt: Omit<UpdateEvent, "id" | "occurredAt">): UpdateEvent {
    return useUpdatesStore.getState().appendEvent(evt);
  },

  getAll(): UpdateEvent[] {
    return useUpdatesStore.getState().events ?? [];
  },

  clearAll() {
    // Intentionally does not touch read/unread state.
    useUpdatesStore.getState().clearAllEvents();
  },
};
