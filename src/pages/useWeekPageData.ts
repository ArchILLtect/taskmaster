import { useTaskIndex } from "../hooks/useTaskIndex";

export function useWeekPageData() {
  const { tasks, lists, loading, err, refresh: refreshData } = useTaskIndex();

  const allTasks = tasks;

  return {
    allTasks,
    lists,
    loading,
    err,
    refreshData,
  };
}