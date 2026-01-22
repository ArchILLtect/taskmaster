import type { TaskList } from "../types/list";
import { getInboxListId, isInboxList } from "../config/inboxSettings";

export function getUserVisibleLists(lists: TaskList[], opts?: { inboxListId?: string | null }) {
  const inboxListId = opts?.inboxListId ?? getInboxListId();
  return lists.filter((l) => !isInboxList(l, inboxListId));
}

export function getUserVisibleFavorites(lists: TaskList[], opts?: { inboxListId?: string | null }) {
  return getUserVisibleLists(lists, opts).filter((l) => l.isFavorite);
}