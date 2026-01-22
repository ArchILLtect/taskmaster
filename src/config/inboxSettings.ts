const KEY = "taskmaster.inboxListId";

export function getInboxListId(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setInboxListId(id: string) {
  try {
    localStorage.setItem(KEY, id);
  } catch {
    // ignore for MVP
  }
}

export function clearInboxListId() {
  try {
    localStorage.removeItem(KEY);
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