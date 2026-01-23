import type { TaskList } from "../types/list";
import { getInboxListId, isInboxList } from "../config/inboxSettings";

export function getUserVisibleLists(lists: TaskList[], opts?: { inboxListId?: string | null }) {
  const inboxListId = opts?.inboxListId ?? getInboxListId();
  return lists.filter((l) => !isInboxList(l, inboxListId));
}

export function getUserVisibleFavorites(lists: TaskList[], opts?: { inboxListId?: string | null }) {
  return getUserVisibleLists(lists, opts).filter((l) => l.isFavorite);
}

export function getUserVisibleNonFavorites(lists: TaskList[], opts?: { inboxListId?: string | null }) {
  return getUserVisibleLists(lists, opts).filter((l) => !l.isFavorite);
}

export function hasUserVisibleFavorites(lists: TaskList[], opts?: { inboxListId?: string | null }) {
  return getUserVisibleFavorites(lists, opts).length > 0;
}

export function hasUserVisibleNonFavorites(lists: TaskList[], opts?: { inboxListId?: string | null }) {
  return getUserVisibleNonFavorites(lists, opts).length > 0;
}

export function countUserVisibleLists(lists: TaskList[], opts?: { inboxListId?: string | null }) {
  return getUserVisibleLists(lists, opts).length;
}

export function countUserVisibleFavorites(lists: TaskList[], opts?: { inboxListId?: string | null }) {
  return getUserVisibleFavorites(lists, opts).length;
}

export function countUserVisibleNonFavorites(lists: TaskList[], opts?: { inboxListId?: string | null }) {
  return getUserVisibleNonFavorites(lists, opts).length;
}

export function isInboxListId(listId: string, inboxListId?: string | null) {
  return !!inboxListId && listId === inboxListId;
}