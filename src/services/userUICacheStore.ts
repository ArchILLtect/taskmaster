import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { UserUI } from "../types";

export const USER_UI_STORAGE_KEY = "taskmaster:user";
export const USER_UI_STORE_VERSION = 1 as const;

export type UserUICacheState = {
  userUI: UserUI | null;
  fetchedAtMs: number | null;

  set: (userUI: UserUI) => void;
  clear: () => void;
};

export const useUserUICacheStore = create<UserUICacheState>()(
  persist(
    (set) => ({
      userUI: null,
      fetchedAtMs: null,

      set: (userUI) => set({ userUI, fetchedAtMs: Date.now() }),
      clear: () => set({ userUI: null, fetchedAtMs: null }),
    }),
    {
      name: USER_UI_STORAGE_KEY,
      version: USER_UI_STORE_VERSION,
      migrate: (persistedState) => persistedState,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ userUI: s.userUI, fetchedAtMs: s.fetchedAtMs }),
    }
  )
);
