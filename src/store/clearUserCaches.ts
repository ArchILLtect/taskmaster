import { useInboxStore } from "./inboxStore";
import { useTaskStore } from "./taskStore";
import { useUpdatesStore } from "./updatesStore";
import { clearUserUICache } from "../services/authService";
import {
  USER_UI_STORAGE_KEY,
} from "../services/userUICacheStore";

const TASK_STORE_KEY = "taskmaster:taskStore";
const INBOX_STORE_KEY = "taskmaster:inbox";
const UPDATES_STORE_KEY = "taskmaster:updates";

let clearInProgress = false;
let lastClearedAtMs = 0;

function safeRemoveLocalStorageKey(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function clearAllUserCaches(): void {
  // Idempotency guard: multiple sign-out paths (Hub event + manual cleanup, StrictMode, etc.)
  // can call this back-to-back. The operations are safe but the double log is confusing.
  if (clearInProgress) return;
  const now = Date.now();
  if (now - lastClearedAtMs < 250) return;
  clearInProgress = true;

  // 1) Clear in-memory state for the currently-running session.
  const taskState = useTaskStore.getState() as unknown as { clearAllLocal?: () => void; expireTaskCache?: () => void };
  if (typeof taskState.clearAllLocal === "function") taskState.clearAllLocal();
  else taskState.expireTaskCache?.();

  const inboxState = useInboxStore.getState() as unknown as { resetAll?: () => void };
  inboxState.resetAll?.();

  const updatesState = useUpdatesStore.getState() as unknown as { resetAll?: () => void; clearAll?: () => void };
  if (typeof updatesState.resetAll === "function") updatesState.resetAll();
  else updatesState.clearAll?.();

  // Also clear the authService module-level cache (not just the persisted store),
  // otherwise a user switch can show stale user metadata until a hard reload.
  clearUserUICache();

  // 2) Remove persisted storage keys last, so the persist middleware doesn't immediately
  // recreate them during the reset calls above.
  safeRemoveLocalStorageKey(TASK_STORE_KEY);
  safeRemoveLocalStorageKey(INBOX_STORE_KEY);
  safeRemoveLocalStorageKey(UPDATES_STORE_KEY);
  safeRemoveLocalStorageKey(USER_UI_STORAGE_KEY);

  if (import.meta.env.DEV) {
    console.debug("[auth] cleared user-scoped caches", [
      TASK_STORE_KEY,
      INBOX_STORE_KEY,
      UPDATES_STORE_KEY,
      USER_UI_STORAGE_KEY,
    ]);
  }

  lastClearedAtMs = now;
  clearInProgress = false;
}
