import type { ListUI } from "../types/list";
import { getInboxListId, isInboxList } from "../config/inboxSettings";

export function getUserVisibleLists(lists: ListUI[], opts?: { inboxListId?: string | null }) {
  const inboxListId = opts?.inboxListId ?? getInboxListId();
  return lists.filter((l) => !isInboxList(l, inboxListId));
}

export function getUserVisibleFavorites(lists: ListUI[], opts?: { inboxListId?: string | null }) {
  return getUserVisibleLists(lists, opts).filter((l) => l.isFavorite);
}

export function getUserVisibleNonFavorites(lists: ListUI[], opts?: { inboxListId?: string | null }) {
  return getUserVisibleLists(lists, opts).filter((l) => !l.isFavorite);
}

export function hasUserVisibleFavorites(lists: ListUI[], opts?: { inboxListId?: string | null }) {
  return getUserVisibleFavorites(lists, opts).length > 0;
}

export function hasUserVisibleNonFavorites(lists: ListUI[], opts?: { inboxListId?: string | null }) {
  return getUserVisibleNonFavorites(lists, opts).length > 0;
}

export function countUserVisibleLists(lists: ListUI[], opts?: { inboxListId?: string | null }) {
  return getUserVisibleLists(lists, opts).length;
}

export function countUserVisibleFavorites(lists: ListUI[], opts?: { inboxListId?: string | null }) {
  return getUserVisibleFavorites(lists, opts).length;
}

export function countUserVisibleNonFavorites(lists: ListUI[], opts?: { inboxListId?: string | null }) {
  return getUserVisibleNonFavorites(lists, opts).length;
}