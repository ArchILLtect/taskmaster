import { useTaskIndex } from "../hooks/useTaskIndex";
import { TaskStatus } from "../API";
import { isoToDayKey } from "../services/inboxTriage";
import {
  addDaysToDayKey,
  endOfMonthDayKey,
  getTodayDateInputValue,
  getUtcWeekdayIndex,
  startOfMonthDayKey,
  startOfWeekDayKey,
} from "../services/dateTime";

export function useMonthPageData() {
  const { tasks, lists, initialLoading, err, refresh: refreshData } = useTaskIndex();

  const allTasks = tasks;

  const todayKey = getTodayDateInputValue();
  const monthStartKey = startOfMonthDayKey(todayKey);
  const monthEndKey = endOfMonthDayKey(todayKey);

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

  const tasksInMonth = allTasks
    .filter((t) => t.status === TaskStatus.Open)
    .filter((t) => {
      const dueKey = isoToDayKey(t.dueAt);
      return dueKey != null && dueKey >= monthStartKey && dueKey <= monthEndKey;
    })
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const tasksByDayKey = new Map<string, typeof allTasks>();

  // Ensure every day in the month exists (even empty).
  {
    let cursor = monthStartKey;
    while (cursor <= monthEndKey) {
      tasksByDayKey.set(cursor, []);
      cursor = addDaysToDayKey(cursor, 1);
    }
  }

  for (const t of tasksInMonth) {
    const dueKey = isoToDayKey(t.dueAt);
    if (!dueKey) continue;
    const bucket = tasksByDayKey.get(dueKey);
    if (!bucket) continue;
    bucket.push(t);
  }

  // Group month days into weeks (Mon-start).
  const weekStart = 1; // Monday
  const weeks: {
    weekStartKey: string;
    days: { dayKey: string; tasks: typeof allTasks }[];
  }[] = [];

  let currentWeek: { weekStartKey: string; days: { dayKey: string; tasks: typeof allTasks }[] } | null = null;

  for (const [dayKey, dayTasks] of Array.from(tasksByDayKey.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
    const weekday = getUtcWeekdayIndex(dayKey);

    const shouldStartNewWeek =
      !currentWeek ||
      (weekday != null && weekday === weekStart && currentWeek.days.length > 0);

    if (shouldStartNewWeek) {
      currentWeek = {
        weekStartKey: startOfWeekDayKey(dayKey, weekStart),
        days: [],
      };
      weeks.push(currentWeek);
    }

    if (!currentWeek) continue;
    currentWeek.days.push({ dayKey, tasks: dayTasks });
  }

  const listsById = new Map(lists.map((l) => [l.id, l] as const));

  return {
    allTasks,
    todayKey,
    monthStartKey,
    monthEndKey,
    overdueTasks,
    tasksInMonth,
    weeks,
    listsById,
    lists,
    loading: initialLoading,
    err,
    refreshData,
  };
}