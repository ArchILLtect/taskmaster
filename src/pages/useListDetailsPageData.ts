import { useMemo } from "react";
import { useTaskIndex } from "../hooks/useTaskIndex";

export function useListDetailsPageData(listId: string | undefined) {
  const { lists, tasksByListId, initialLoading, err, refresh } = useTaskIndex();

  const tasks = useMemo(() => {
    if (!listId) return [];
    return tasksByListId[listId] ?? [];
  }, [listId, tasksByListId]);

  return { lists, tasks, loading: initialLoading, err, refresh };
}