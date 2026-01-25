import { useTaskIndex } from "../hooks/useTaskIndex";

export function useUpdatesPageData() {
  const { tasks, lists, loading, err } = useTaskIndex();

  const allTasks = tasks;

  return {
    allTasks,
    lists,
    loading,
    err,
  };
}