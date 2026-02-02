import { useTaskIndex } from "../hooks/useTaskIndex";
import { TaskStatus } from "../API";
import { isoToDayKey } from "../services/inboxTriage";
import { getTodayDateInputValue } from "../services/dateTime";

export function useTodayPageData() {
  const { tasks, lists, initialLoading, err, refresh: refreshData } = useTaskIndex();

  const allTasks = tasks;
  const todayKey = getTodayDateInputValue();

  const dueTodayTasks = allTasks
    .filter((t) => t.status === TaskStatus.Open)
    .filter((t) => {
      const dueKey = isoToDayKey(t.dueAt);
      return dueKey != null && dueKey === todayKey;
    })
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const overdueTasks = allTasks
    .filter((t) => t.status === TaskStatus.Open)
    .filter((t) => {
      const dueKey = isoToDayKey(t.dueAt);
      return dueKey != null && dueKey < todayKey;
    })
    .slice()
    .sort(
      (a, b) =>
        String(a.dueAt ?? "").localeCompare(String(b.dueAt ?? "")) ||
        (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    );

  const listsById = new Map(lists.map((l) => [l.id, l] as const));

  return {
    allTasks,
    todayKey,
    dueTodayTasks,
    overdueTasks,
    listsById,
    lists,
    loading: initialLoading,
    err,
    refreshData,
  };
}