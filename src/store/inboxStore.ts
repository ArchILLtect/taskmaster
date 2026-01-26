import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

import { isoNow } from "../services/storage";

const STORAGE_KEY = "taskmaster:inbox";
const STORE_VERSION = 1;

export type InboxPersistedStateV1 = {
  lastViewedAt: string | null;
  dueSoonWindowDays: number;
  dismissedTaskIds: string[];
};

type InboxStore = InboxPersistedStateV1 & {
  // Non-persisted (used to keep computations stable within a session)
  lastComputedAtMs: number;

  touchNow: () => void;
  setDueSoonWindowDays: (days: number) => void;
  dismiss: (taskId: string) => void;
  undismiss: (taskId: string) => void;
  markViewedNow: () => void;
};

const DEFAULTS: InboxPersistedStateV1 = {
  lastViewedAt: null,
  dueSoonWindowDays: 3,
  dismissedTaskIds: [],
};

export const useInboxStore = create<InboxStore>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,
      lastComputedAtMs: Date.now(),

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
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) return;
          // Ensure session-only computed timestamp is fresh on load.
          state?.touchNow();
        };
      },
    }
  )
);

export function useInboxView(): InboxPersistedStateV1 & { lastComputedAtMs: number } {
  return useInboxStore(
    useShallow((s) => ({
      lastViewedAt: s.lastViewedAt,
      dueSoonWindowDays: s.dueSoonWindowDays,
      dismissedTaskIds: s.dismissedTaskIds,
      lastComputedAtMs: s.lastComputedAtMs,
    }))
  );
}

export function useInboxActions(): Pick<InboxStore, "touchNow" | "setDueSoonWindowDays" | "dismiss" | "undismiss" | "markViewedNow"> {
  return useInboxStore(
    useShallow((s) => ({
      touchNow: s.touchNow,
      setDueSoonWindowDays: s.setDueSoonWindowDays,
      dismiss: s.dismiss,
      undismiss: s.undismiss,
      markViewedNow: s.markViewedNow,
    }))
  );
}

// Back-compat facade (keeps existing API stable).
export const inboxService = {
  getState(): InboxPersistedStateV1 & { lastComputedAtMs: number } {
    const s = useInboxStore.getState();
    return {
      lastViewedAt: s.lastViewedAt ?? null,
      dueSoonWindowDays: Number.isFinite(s.dueSoonWindowDays) ? Number(s.dueSoonWindowDays) : 3,
      dismissedTaskIds: Array.isArray(s.dismissedTaskIds) ? s.dismissedTaskIds : [],
      lastComputedAtMs: Number.isFinite(s.lastComputedAtMs) ? Number(s.lastComputedAtMs) : Date.now(),
    };
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
