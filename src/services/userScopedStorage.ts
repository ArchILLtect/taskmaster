import type { PersistStorage, StorageValue } from "zustand/middleware";
import { USER_UI_STORAGE_KEY } from "./userUICacheStore";

function safeJsonParse(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function readPersistedAuthKeyFromUserUI(): string | null {
  // userUICacheStore persists a small envelope with { state: { userUI } }
  // where userUI.username is set to `currentUser.username || currentUser.userId`.
  // This is stable enough as a per-user local storage scope key.
  try {
    const raw = localStorage.getItem(USER_UI_STORAGE_KEY);
    if (!raw) return null;

    const parsed = safeJsonParse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null) return null;

    const envelope = parsed as { state?: unknown };
    const state = envelope.state as { userUI?: unknown } | undefined;
    const userUI = state?.userUI as { username?: unknown } | undefined;

    return typeof userUI?.username === "string" && userUI.username ? userUI.username : null;
  } catch {
    return null;
  }
}

export function getUserStorageScopeKey(): string | null {
  return readPersistedAuthKeyFromUserUI();
}

export function makeUserScopedKey(baseKey: string, scopeOverride?: string | null): string {
  const scope = scopeOverride ?? getUserStorageScopeKey() ?? "anonymous";
  // Keep a consistent prefix so we can clear a whole category later (e.g. tips).
  return `taskmaster:u:${scope}:${baseKey}`;
}

export function userScopedGetItem(baseKey: string): string | null {
  try {
    return localStorage.getItem(makeUserScopedKey(baseKey));
  } catch {
    return null;
  }
}

export function userScopedSetItem(baseKey: string, value: string): void {
  try {
    localStorage.setItem(makeUserScopedKey(baseKey), value);
  } catch {
    // ignore
  }
}

export function userScopedRemoveItem(baseKey: string): void {
  try {
    localStorage.removeItem(makeUserScopedKey(baseKey));
  } catch {
    // ignore
  }
}

export function clearUserScopedKeysByPrefix(basePrefix: string): void {
  const scope = getUserStorageScopeKey() ?? "anonymous";
  const fullPrefix = `taskmaster:u:${scope}:${basePrefix}`;

  try {
    // Iterate backwards to avoid index shifting issues.
    for (let i = localStorage.length - 1; i >= 0; i -= 1) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (k.startsWith(fullPrefix)) {
        localStorage.removeItem(k);
      }
    }
  } catch {
    // ignore
  }
}

export function createUserScopedZustandStorage(): PersistStorage<unknown, unknown> {
  return {
    getItem: (name: string) => {
      const raw = userScopedGetItem(`zustand:${name}`);
      if (raw == null) return null;
      return safeJsonParse(raw) as StorageValue<unknown>;
    },
    setItem: (name: string, value: StorageValue<unknown>) => {
      userScopedSetItem(`zustand:${name}`, JSON.stringify(value));
    },
    removeItem: (name: string) => {
      userScopedRemoveItem(`zustand:${name}`);
    },
  };
}
