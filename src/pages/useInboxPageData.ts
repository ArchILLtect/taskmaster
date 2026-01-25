import { useCallback, useState } from "react";
import { useTaskIndex } from "../hooks/useTaskIndex";
import { inboxService } from "../services/inboxService";
import { TaskStatus } from "../API";
import { getInboxListId } from "../config/inboxSettings";

function isNewTask(createdAt: string, lastViewedAt: string | null) {
  if (!lastViewedAt) return true;
  return new Date(createdAt).getTime() > new Date(lastViewedAt).getTime();
}

function isDueSoon(dueAt: string | null | undefined, status: TaskStatus, nowMs: number, windowDays: number) {
  if (status !== TaskStatus.Open) return false;
  if (!dueAt) return false;

  const dueMs = new Date(dueAt).getTime();
  const endMs = nowMs + windowDays * 24 * 60 * 60 * 1000;
  return dueMs >= nowMs && dueMs <= endMs;
}

export function useInboxPageData() {
  const { lists, tasks, initialLoading, err, refresh: refreshData } = useTaskIndex();

  // local “poke” for inbox-only state changes (dismiss/window/viewedAt)
  const [, setInboxVersion] = useState(0);
  const refreshInbox = useCallback(() => setInboxVersion((v) => v + 1), []);

  const inboxListId = getInboxListId();

  const state = inboxService.getState();
  const dismissed = new Set(state.dismissedTaskIds);
  const nowMs = state.lastComputedAtMs;

  // Only tasks that belong to the Inbox list
  const inboxTasks = inboxListId
    ? tasks.filter((t) => t.listId === inboxListId)
    : [];

  const newTasks = inboxTasks
    .filter((t) => !dismissed.has(t.id))
    .filter((t) => isNewTask(t.createdAt, state.lastViewedAt))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const dueSoonTasks = inboxTasks
    .filter((t) => !dismissed.has(t.id))
    .filter((t) => isDueSoon(t.dueAt ?? null, t.status, nowMs, state.dueSoonWindowDays))
    .sort((a, b) => new Date(a.dueAt ?? 0).getTime() - new Date(b.dueAt ?? 0).getTime());

  const vm = { state, newTasks, dueSoonTasks };

  return {
    lists,
    inboxListId,
    vm,
    loading: initialLoading,
    err,
    refreshData,   // network refresh
    refreshInbox,  // local refresh
  };
}