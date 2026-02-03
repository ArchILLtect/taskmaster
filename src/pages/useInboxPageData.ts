import { useMemo } from "react";
import { useTaskIndex } from "../hooks/useTaskIndex";
import { getInboxListId } from "../config/inboxSettings";
import { useInboxView } from "../store/inboxStore";
import { isDueSoonByKey, isOverdueByKey } from "../services/inboxTriage";
import { msToDateInputValue } from "../services/dateTime";
import { useDueSoonWindowDays } from "../store/localSettingsStore";

export function useInboxPageData() {
  const { lists, tasks, initialLoading, err, refresh: refreshData } = useTaskIndex();

  const inboxListId = getInboxListId();
  const dueSoonWindowDays = useDueSoonWindowDays();

  const inbox = useInboxView();
  const dismissed = useMemo(() => new Set(inbox.dismissedTaskIds), [inbox.dismissedTaskIds]);

  const nowKey = msToDateInputValue(inbox.lastComputedAtMs);

  // Only tasks that belong to the Inbox list
  const inboxTasks = inboxListId
    ? tasks.filter((t) => t.listId === inboxListId)
    : [];

  // System Inbox is a staging area: always show all tasks that live there.
  const inboxStagingTasks = inboxTasks
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Due soon should include tasks across ALL lists (not just Inbox)
  const dueSoonTasks = tasks
    .filter((t) => !dismissed.has(t.id))
    .filter((t) => isDueSoonByKey(t.dueAt ?? null, t.status, nowKey, dueSoonWindowDays))
    .sort((a, b) => String(a.dueAt ?? "").localeCompare(String(b.dueAt ?? "")) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  // Overdue tasks across ALL lists
  const overdueTasks = tasks
    .filter((t) => !dismissed.has(t.id))
    .filter((t) => isOverdueByKey(t.dueAt ?? null, t.status, nowKey))
    .sort((a, b) => String(a.dueAt ?? "").localeCompare(String(b.dueAt ?? "")) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const vm = { inboxStagingTasks, dueSoonTasks, overdueTasks };

  return {
    lists,
    inboxListId,
    vm,
    loading: initialLoading,
    err,
    refreshData,   // network refresh
  };
}