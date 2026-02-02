import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PersistStorage, StorageValue } from "zustand/middleware";

import { isoNow } from "../services/storage";
import { createUserScopedZustandStorage, getUserStorageScopeKey } from "../services/userScopedStorage";

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

  resetAll: () => void;

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

const inboxScopedStorage: PersistStorage<unknown, unknown> = (() => {
  const scoped = createUserScopedZustandStorage();

  return {
    getItem: (name: string) => {
      // Preferred: user-scoped key
      const fromScoped = scoped.getItem(name);
      if (fromScoped != null) return fromScoped;

      // Only migrate legacy global keys if we have an explicit auth scope.
      if (!getUserStorageScopeKey()) return null;

      // Legacy migration: older builds wrote to unscoped localStorage under `name`.
      try {
        const raw = localStorage.getItem(name);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as StorageValue<unknown>;

        // Best-effort: write into scoped storage then remove legacy.
        scoped.setItem(name, parsed);
        localStorage.removeItem(name);

        return parsed;
      } catch {
        return null;
      }
    },
    setItem: (name: string, value: StorageValue<unknown>) => {
      scoped.setItem(name, value);
    },
    removeItem: (name: string) => {
      scoped.removeItem(name);
    },
  };
})();

export const useInboxStore = create<InboxStore>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,
      lastComputedAtMs: Date.now(),

      resetAll: () => {
        set({
          ...DEFAULTS,
          lastComputedAtMs: Date.now(),
        });
      },

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
      storage: inboxScopedStorage,
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

type InboxView = InboxPersistedStateV1 & { lastComputedAtMs: number };

let cachedInboxView: InboxView | null = null;
let cachedInboxViewInputs: {
  lastViewedAt: InboxView["lastViewedAt"];
  dueSoonWindowDays: InboxView["dueSoonWindowDays"];
  dismissedTaskIds: InboxView["dismissedTaskIds"];
  lastComputedAtMs: InboxView["lastComputedAtMs"];
} | null = null;

function selectInboxView(s: InboxStore): InboxView {
  const inputs = {
    lastViewedAt: s.lastViewedAt,
    dueSoonWindowDays: s.dueSoonWindowDays,
    dismissedTaskIds: s.dismissedTaskIds,
    lastComputedAtMs: s.lastComputedAtMs,
  };

  if (
    cachedInboxView &&
    cachedInboxViewInputs &&
    cachedInboxViewInputs.lastViewedAt === inputs.lastViewedAt &&
    cachedInboxViewInputs.dueSoonWindowDays === inputs.dueSoonWindowDays &&
    cachedInboxViewInputs.dismissedTaskIds === inputs.dismissedTaskIds &&
    cachedInboxViewInputs.lastComputedAtMs === inputs.lastComputedAtMs
  ) {
    return cachedInboxView;
  }

  cachedInboxViewInputs = inputs;
  cachedInboxView = {
    lastViewedAt: inputs.lastViewedAt,
    dueSoonWindowDays: inputs.dueSoonWindowDays,
    dismissedTaskIds: inputs.dismissedTaskIds,
    lastComputedAtMs: inputs.lastComputedAtMs,
  };

  return cachedInboxView;
}

export function useInboxView(): InboxView {
  return useInboxStore(selectInboxView);
}

type InboxActions = Pick<InboxStore, "touchNow" | "setDueSoonWindowDays" | "dismiss" | "undismiss" | "markViewedNow">;

let cachedInboxActions: InboxActions | null = null;
let cachedInboxActionsInputs: {
  touchNow: InboxActions["touchNow"];
  setDueSoonWindowDays: InboxActions["setDueSoonWindowDays"];
  dismiss: InboxActions["dismiss"];
  undismiss: InboxActions["undismiss"];
  markViewedNow: InboxActions["markViewedNow"];
} | null = null;

function selectInboxActions(s: InboxStore): InboxActions {
  const inputs = {
    touchNow: s.touchNow,
    setDueSoonWindowDays: s.setDueSoonWindowDays,
    dismiss: s.dismiss,
    undismiss: s.undismiss,
    markViewedNow: s.markViewedNow,
  };

  if (
    cachedInboxActions &&
    cachedInboxActionsInputs &&
    cachedInboxActionsInputs.touchNow === inputs.touchNow &&
    cachedInboxActionsInputs.setDueSoonWindowDays === inputs.setDueSoonWindowDays &&
    cachedInboxActionsInputs.dismiss === inputs.dismiss &&
    cachedInboxActionsInputs.undismiss === inputs.undismiss &&
    cachedInboxActionsInputs.markViewedNow === inputs.markViewedNow
  ) {
    return cachedInboxActions;
  }

  cachedInboxActionsInputs = inputs;
  cachedInboxActions = {
    touchNow: inputs.touchNow,
    setDueSoonWindowDays: inputs.setDueSoonWindowDays,
    dismiss: inputs.dismiss,
    undismiss: inputs.undismiss,
    markViewedNow: inputs.markViewedNow,
  };

  return cachedInboxActions;
}

export function useInboxActions(): InboxActions {
  return useInboxStore(selectInboxActions);
}
