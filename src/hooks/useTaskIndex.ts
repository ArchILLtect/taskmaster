import { useCallback, useEffect } from "react";
import { useTaskStore } from "../store/taskStore";

export function useTaskIndex(opts?: {
  listLimit?: number;
  tasksPerListLimit?: number; // not used (pagination does the real work), kept for future tuning
  autoLoad?: boolean;
}) {
  const lists = useTaskStore((s) => s.lists);
  const tasks = useTaskStore((s) => s.tasks);
  const listsById = useTaskStore((s) => s.listsById);
  const tasksById = useTaskStore((s) => s.tasksById);
  const tasksByListId = useTaskStore((s) => s.tasksByListId);
  const childrenByParentId = useTaskStore((s) => s.childrenByParentId);
  const loading = useTaskStore((s) => s.loading);
  const error = useTaskStore((s) => s.error);
  const refreshAll = useTaskStore((s) => s.refreshAll);

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