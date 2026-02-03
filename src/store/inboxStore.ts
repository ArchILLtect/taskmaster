import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PersistStorage, StorageValue } from "zustand/middleware";

import { createUserScopedZustandStorage, getUserStorageScopeKey } from "../services/userScopedStorage";

const STORAGE_KEY = "taskmaster:inbox";
const STORE_VERSION = 2;

export type InboxPersistedStateV2 = {
  dismissedTaskIds: string[];
};

type InboxStore = InboxPersistedStateV2 & {
  // Non-persisted timestamp used to compute “today”/“now” without calling Date.now() during render.
  lastComputedAtMs: number;

  resetAll: () => void;
  clearDismissed: () => void;
  touchNow: () => void;

  dismiss: (taskId: string) => void;
  dismissMany: (taskIds: string[]) => void;
  undismiss: (taskId: string) => void;
};

const DEFAULTS: InboxPersistedStateV2 = {
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

      clearDismissed: () => {
        set({ dismissedTaskIds: [] });
      },

      touchNow: () => {
        set({ lastComputedAtMs: Date.now() });
      },

      dismiss: (taskId) => {
        const s = get();
        if (s.dismissedTaskIds.includes(taskId)) return;
        set({ dismissedTaskIds: [...s.dismissedTaskIds, taskId] });
      },

      dismissMany: (taskIds) => {
        const ids = Array.isArray(taskIds) ? taskIds.filter((x): x is string => typeof x === "string" && x.length > 0) : [];
        if (ids.length === 0) return;

        const s = get();
        const next = new Set(s.dismissedTaskIds);
        for (const id of ids) next.add(id);
        set({ dismissedTaskIds: Array.from(next) });
      },

      undismiss: (taskId) => {
        const s = get();
        set({ dismissedTaskIds: s.dismissedTaskIds.filter((id) => id !== taskId) });
      },
    }),
    {
      name: STORAGE_KEY,
      version: STORE_VERSION,
      migrate: (persistedState, version) => {
        const s = persistedState as { dismissedTaskIds?: unknown } | undefined;
        const raw = s?.dismissedTaskIds;
        const normalized = Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : [];

        // v1 included lastViewedAt/dueSoonWindowDays; v2 keeps only dismissedTaskIds.
        if (version < 2) {
          return { dismissedTaskIds: normalized } satisfies InboxPersistedStateV2;
        }

        return { dismissedTaskIds: normalized } satisfies InboxPersistedStateV2;
      },
      storage: inboxScopedStorage,
      partialize: (s) => ({
        dismissedTaskIds: s.dismissedTaskIds,
      }),
      onRehydrateStorage: (state) => {
        return (_hydratedState, error) => {
          if (error) return;
          // Refresh the computed timestamp after hydration.
          state?.touchNow();
        };
      },
    }
  )
);

type InboxView = InboxPersistedStateV2 & Pick<InboxStore, "lastComputedAtMs">;

let cachedInboxView: InboxView | null = null;
let cachedInboxViewInputs: {
  dismissedTaskIds: InboxView["dismissedTaskIds"];
  lastComputedAtMs: InboxView["lastComputedAtMs"];
} | null = null;

function selectInboxView(s: InboxStore): InboxView {
  const inputs = {
    dismissedTaskIds: s.dismissedTaskIds,
    lastComputedAtMs: s.lastComputedAtMs,
  };

  if (
    cachedInboxView &&
    cachedInboxViewInputs &&
    cachedInboxViewInputs.dismissedTaskIds === inputs.dismissedTaskIds &&
    cachedInboxViewInputs.lastComputedAtMs === inputs.lastComputedAtMs
  ) {
    return cachedInboxView;
  }

  cachedInboxViewInputs = inputs;
  cachedInboxView = {
    dismissedTaskIds: inputs.dismissedTaskIds,
    lastComputedAtMs: inputs.lastComputedAtMs,
  };

  return cachedInboxView;
}

export function useInboxView(): InboxView {
  return useInboxStore(selectInboxView);
}

type InboxActions = Pick<InboxStore, "dismiss" | "dismissMany" | "undismiss" | "clearDismissed">;

let cachedInboxActions: InboxActions | null = null;
let cachedInboxActionsInputs: {
  dismiss: InboxActions["dismiss"];
  dismissMany: InboxActions["dismissMany"];
  undismiss: InboxActions["undismiss"];
  clearDismissed: InboxActions["clearDismissed"];
} | null = null;

function selectInboxActions(s: InboxStore): InboxActions {
  const inputs = {
    dismiss: s.dismiss,
    dismissMany: s.dismissMany,
    undismiss: s.undismiss,
    clearDismissed: s.clearDismissed,
  };

  if (
    cachedInboxActions &&
    cachedInboxActionsInputs &&
    cachedInboxActionsInputs.dismiss === inputs.dismiss &&
    cachedInboxActionsInputs.dismissMany === inputs.dismissMany &&
    cachedInboxActionsInputs.undismiss === inputs.undismiss &&
    cachedInboxActionsInputs.clearDismissed === inputs.clearDismissed
  ) {
    return cachedInboxActions;
  }

  cachedInboxActionsInputs = inputs;
  cachedInboxActions = {
    dismiss: inputs.dismiss,
    dismissMany: inputs.dismissMany,
    undismiss: inputs.undismiss,
    clearDismissed: inputs.clearDismissed,
  };

  return cachedInboxActions;
}

export function useInboxActions(): InboxActions {
  return useInboxStore(selectInboxActions);
}
