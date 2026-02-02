import { getUserStorageScopeKey, userScopedGetItem, userScopedRemoveItem, userScopedSetItem } from "../services/userScopedStorage";

const LEGACY_KEY = "taskmaster.inboxListId";
const SCOPED_BASE_KEY = "inboxListId";

export function getInboxListId(): string | null {
  try {
    const scoped = userScopedGetItem(SCOPED_BASE_KEY);
    if (scoped) return scoped;

    // Legacy migration: only migrate if we have an explicit auth scope.
    if (!getUserStorageScopeKey()) return null;

    const legacy = localStorage.getItem(LEGACY_KEY);
    if (!legacy) return null;

    userScopedSetItem(SCOPED_BASE_KEY, legacy);
    localStorage.removeItem(LEGACY_KEY);
    return legacy;
  } catch {
    return null;
  }
}

export function setInboxListId(id: string) {
  try {
    userScopedSetItem(SCOPED_BASE_KEY, id);
  } catch {
    // ignore for MVP
  }
}

export function clearInboxListId() {
  try {
    userScopedRemoveItem(SCOPED_BASE_KEY);
  } catch {
    // ignore
  }
}

/**
 * System Inbox naming convention for MVP:
 * - list.name must match exactly "__Inbox" (trim-insensitive)
 */
export const SYSTEM_INBOX_NAME = "__Inbox";

export function isInboxList(list: { id: string; name?: string | null }, inboxListId?: string | null) {
  if (inboxListId && list.id === inboxListId) return true;
  return (list.name ?? "").trim() === SYSTEM_INBOX_NAME;
}

export function findInboxListIdByName(lists: { id: string; name?: string | null }[]) {
  const found = lists.find((l) => (l.name ?? "").trim() === SYSTEM_INBOX_NAME);
  return found?.id ?? null;
}