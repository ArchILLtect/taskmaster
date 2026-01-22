import { useMemo } from "react";
import { useTaskIndex } from "../hooks/useTaskIndex";
import { getUserVisibleLists, getUserVisibleFavorites } from "../lists/listVisibility";
import { getInboxListId } from "../config/inboxSettings";

export function useListsPageData() {
  const { lists, loading, err, refresh } = useTaskIndex();

  const inboxListId = useMemo(() => getInboxListId(), []);

  const visibleLists = useMemo(() => {
    return getUserVisibleLists(lists, { inboxListId });
  }, [lists, inboxListId]);

  const visibleFavorites = useMemo(() => {
    return getUserVisibleFavorites(lists, { inboxListId });
  }, [lists, inboxListId]);

  return { lists, visibleLists, visibleFavorites, loading, err, refresh };
}