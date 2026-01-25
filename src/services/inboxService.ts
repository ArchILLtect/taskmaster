import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { isoNow } from "./storage";

const STORAGE_KEY = "taskmaster:inbox";
const STORE_VERSION = 1;

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

type InboxStore = InboxState & {
  touchNow: () => void;
  setDueSoonWindowDays: (days: number) => void;
  dismiss: (taskId: string) => void;
  undismiss: (taskId: string) => void;
  markViewedNow: () => void;
};

export const useInboxStore = create<InboxStore>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,

      touchNow: () => {
        set({ lastComputedAtMs: Date.now() });
      },

      setDueSoonWindowDays: (days) => {
        const normalized = Math.max(1, Math.min(30, Math.floor(days || 0) || 3));
        set({ dueSoonWindowDays: normalized, lastComputedAtMs: Date.now() });
      },

      dismiss: (taskId) => {
        const s = get();
        if (s.dismissedTaskIds.includes(taskId)) return;
        set({ dismissedTaskIds: [...s.dismissedTaskIds, taskId], lastComputedAtMs: Date.now() });
      },

      undismiss: (taskId) => {
        const s = get();
        set({ dismissedTaskIds: s.dismissedTaskIds.filter((id) => id !== taskId), lastComputedAtMs: Date.now() });
      },

      markViewedNow: () => {
        set({ lastViewedAt: isoNow(), lastComputedAtMs: Date.now() });
      },
    }),
    {
      name: STORAGE_KEY,
      version: STORE_VERSION,
      migrate: (persistedState) => persistedState,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        lastViewedAt: s.lastViewedAt,
        dueSoonWindowDays: s.dueSoonWindowDays,
        dismissedTaskIds: s.dismissedTaskIds,
        lastComputedAtMs: s.lastComputedAtMs,
      }),
    }
  )
);

function normalizeState(s: Partial<InboxState> | null | undefined): InboxState {
  return {
    lastViewedAt: s?.lastViewedAt ?? null,
    dueSoonWindowDays: Number.isFinite(s?.dueSoonWindowDays) ? Number(s?.dueSoonWindowDays) : 3,
    dismissedTaskIds: Array.isArray(s?.dismissedTaskIds) ? s!.dismissedTaskIds! : [],
    lastComputedAtMs: Number.isFinite(s?.lastComputedAtMs) ? Number(s?.lastComputedAtMs) : DEFAULTS.lastComputedAtMs,
  };
}

export const inboxService = {
  getState(): InboxState {
    return normalizeState(useInboxStore.getState());
  },

  touchNow() {
    useInboxStore.getState().touchNow();
  },

  setDueSoonWindowDays(days: number) {
    useInboxStore.getState().setDueSoonWindowDays(days);
  },

  dismiss(taskId: string) {
    useInboxStore.getState().dismiss(taskId);
  },

  undismiss(taskId: string) {
    useInboxStore.getState().undismiss(taskId);
  },

  markViewedNow() {
    useInboxStore.getState().markViewedNow();
  },
};