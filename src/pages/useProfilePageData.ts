import { useTaskIndex } from "../hooks/useTaskIndex";

export function useProfilePageData() {
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