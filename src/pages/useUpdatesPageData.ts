import { useTaskIndex } from "../hooks/useTaskIndex";

export function useUpdatesPageData() {
  const { tasks, lists, initialLoading, err, refresh: refreshData } = useTaskIndex();

  const allTasks = tasks;

  return {
    allTasks,
    lists,
    loading: initialLoading,
    err,
    refreshData,
  };
}