import { useCallback, useEffect, useMemo, useState } from "react";
import { taskmasterApi } from "../api/taskmasterApi"
import { mapTask, mapTaskList } from "../api/mappers";
import type { Task } from "../types/task";
import type { TaskList } from "../types/list";

export function useListPageData(listId: string | undefined) {
  const [rawLists, setRawLists] = useState<TaskList[]>([]);
  const [rawTasks, setRawTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<unknown>(null);

  const refresh = useCallback(async () => {
    if (!listId) return;

    try {
      setLoading(true);
      setErr(null);

      const [listPage, taskPage] = await Promise.all([
        taskmasterApi.listTaskLists({ limit: 200 }),
        taskmasterApi.tasksByList({
          listId,
          sortOrder: { ge: 0 },
          limit: 500,
        }),
      ]);

      setRawLists(listPage.items as TaskList[]);
      setRawTasks(taskPage.items as Task[]);
    } catch (e) {
      setErr(e);
      setRawLists([]);
      setRawTasks([]);
    } finally {
      setLoading(false);
    }
  }, [listId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const lists: TaskList[] = useMemo(() => {
    const mapped = rawLists.map(mapTaskList);
    mapped.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    return mapped;
  }, [rawLists]);

  const tasks: Task[] = useMemo(() => {
    const mapped = rawTasks.map(mapTask);
    mapped.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    return mapped;
  }, [rawTasks]);

  return { lists, tasks, loading, err, refresh };
}