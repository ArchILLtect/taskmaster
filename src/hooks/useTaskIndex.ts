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
  } = useTaskIndexView();

  const refresh = useCallback(async () => {
    await refreshAll({ listLimit: opts?.listLimit });
  }, [refreshAll, opts?.listLimit]);

  useEffect(() => {
    if (opts?.autoLoad === false) return;
    void refresh();
  }, [refresh, opts?.autoLoad]);

  return {
    lists,
    tasks,
    listsById,
    tasksById,
    tasksByListId,
    childrenByParentId,
    loading,
    err: error,
    refresh,
  };
}