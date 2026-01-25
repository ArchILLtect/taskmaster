import { useCallback, useEffect } from "react";
import { useTaskIndexView } from "../store/taskStore";

export function useTaskIndex(opts?: {
  listLimit?: number;
  tasksPerListLimit?: number; // not used (pagination does the real work), kept for future tuning
  autoLoad?: boolean;
}) {
  const {
    lists,
    tasks,
    listsById,
    tasksById,
    tasksByListId,
    childrenByParentId,
    loading,
    error,
    refreshAll,
    hydrateAndRefreshIfStale,
  } = useTaskIndexView();

  const refresh = useCallback(async () => {
    await refreshAll({ listLimit: opts?.listLimit });
  }, [refreshAll, opts?.listLimit]);

  useEffect(() => {
    if (opts?.autoLoad !== true) return;
    void hydrateAndRefreshIfStale({ listLimit: opts?.listLimit });
  }, [hydrateAndRefreshIfStale, opts?.autoLoad, opts?.listLimit]);

  const hasCachedData = lists.length > 0 || tasks.length > 0;
  const initialLoading = loading && !hasCachedData;
  const refreshing = loading && hasCachedData;

  return {
    lists,
    tasks,
    listsById,
    tasksById,
    tasksByListId,
    childrenByParentId,
    loading,
    initialLoading,
    refreshing,
    err: error,
    refresh,
  };
}