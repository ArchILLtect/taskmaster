import { useTaskIndex } from "../hooks/useTaskIndex";

export function useMonthPageData() {
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