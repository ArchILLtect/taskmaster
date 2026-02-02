import { useMemo } from "react";
import { useTaskIndexView } from "../store/taskStore";
import { useInboxView } from "../store/inboxStore";
import { isDueSoonByKey, isOverdueByKey, toUtcDayKey } from "../services/inboxTriage";
import { useDueSoonWindowDays } from "../store/localSettingsStore";

export function useInboxTriageIndicators(): {
  hasDueSoon: boolean;
  hasOverdue: boolean;
} {
  const { tasks } = useTaskIndexView();
  const inbox = useInboxView();
  const dueSoonWindowDays = useDueSoonWindowDays();

  const dismissed = useMemo(() => new Set(inbox.dismissedTaskIds), [inbox.dismissedTaskIds]);
  const nowKey = toUtcDayKey(inbox.lastComputedAtMs);

  const hasOverdue = useMemo(() => {
    return tasks.some(
      (t) => !dismissed.has(t.id) && isOverdueByKey(t.dueAt ?? null, t.status, nowKey)
    );
  }, [dismissed, nowKey, tasks]);

  const hasDueSoon = useMemo(() => {
    return tasks.some(
      (t) =>
        !dismissed.has(t.id) &&
        isDueSoonByKey(t.dueAt ?? null, t.status, nowKey, dueSoonWindowDays)
    );
  }, [dismissed, dueSoonWindowDays, nowKey, tasks]);

  return { hasDueSoon, hasOverdue };
}
