import { useTaskIndex } from "../hooks/useTaskIndex";
import { TaskStatus } from "../API";
import { isoToDayKey } from "../services/inboxTriage";
import { addDaysToDayKey, getTodayDateInputValue } from "../services/dateTime";

export function useWeekPageData() {
  const { tasks, lists, initialLoading, err, refresh: refreshData } = useTaskIndex();

  const allTasks = tasks;

  const todayKey = getTodayDateInputValue();
  const endKey = addDaysToDayKey(todayKey, 6);

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

  const bucketsByDayKey = new Map<string, typeof allTasks>();
  for (let i = 0; i < 7; i += 1) {
    bucketsByDayKey.set(addDaysToDayKey(todayKey, i), []);
  }

  const dueThisWeekTasks = allTasks
    .filter((t) => t.status === TaskStatus.Open)
    .filter((t) => {
      const dueKey = isoToDayKey(t.dueAt);
      return dueKey != null && dueKey >= todayKey && dueKey <= endKey;
    })
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  for (const t of dueThisWeekTasks) {
    const dueKey = isoToDayKey(t.dueAt);
    if (!dueKey) continue;
    const bucket = bucketsByDayKey.get(dueKey);
    if (!bucket) continue;
    bucket.push(t);
  }

  const days = Array.from(bucketsByDayKey.entries())
    .map(([dayKey, tasksForDay]) => ({ dayKey, tasks: tasksForDay }))
    .sort((a, b) => a.dayKey.localeCompare(b.dayKey));

  const listsById = new Map(lists.map((l) => [l.id, l] as const));

  return {
    allTasks,
    todayKey,
    endKey,
    overdueTasks,
    dueThisWeekTasks,
    days,
    listsById,
    lists,
    loading: initialLoading,
    err,
    refreshData,
  };
}