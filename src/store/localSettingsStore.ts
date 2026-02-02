import { create } from "zustand";
import { persist } from "zustand/middleware";

import { createUserScopedZustandStorage } from "../services/userScopedStorage";

export const LOCAL_SETTINGS_STORE_VERSION = 1 as const;

export type LocalSettingsState = {
  dueSoonWindowDays: number;

  setDueSoonWindowDays: (days: number) => void;
};

function normalizeDueSoonDays(days: number): number {
  return Math.max(1, Math.min(30, Math.floor(days || 0) || 3));
}

function readLegacyDueSoonDays(): number | null {
  // Best-effort migration: older builds stored this on the inbox store.
  // We avoid changing any backend settingsVersion (GraphQL persistence comes later).
  try {
    const raw = localStorage.getItem("taskmaster:inbox");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    const envelope = parsed as { state?: unknown };
    const state = envelope.state as { dueSoonWindowDays?: unknown } | undefined;
    const n = state?.dueSoonWindowDays;
    return typeof n === "number" && Number.isFinite(n) ? normalizeDueSoonDays(n) : null;
  } catch {
    return null;
  }
}

const DEFAULT_DUE_SOON_DAYS = readLegacyDueSoonDays() ?? 3;

export const useLocalSettingsStore = create<LocalSettingsState>()(
  persist(
    (set) => ({
      dueSoonWindowDays: DEFAULT_DUE_SOON_DAYS,

      setDueSoonWindowDays: (days) => {
        set({ dueSoonWindowDays: normalizeDueSoonDays(days) });
      },
    }),
    {
      name: "taskmaster:localSettings",
      version: LOCAL_SETTINGS_STORE_VERSION,
      migrate: (persistedState) => persistedState,
      storage: createUserScopedZustandStorage(),
      partialize: (s) => ({ dueSoonWindowDays: s.dueSoonWindowDays }),
    }
  )
);

// IMPORTANT: keep selectors primitive/function-returning.
// Returning new object literals here can trigger infinite render loops under React strict/dev.
export function useDueSoonWindowDays(): number {
  return useLocalSettingsStore((s) => s.dueSoonWindowDays);
}

export function useSetDueSoonWindowDays(): LocalSettingsState["setDueSoonWindowDays"] {
  return useLocalSettingsStore((s) => s.setDueSoonWindowDays);
}
