import { useEffect, useMemo, useState } from "react";
import { taskmasterApi } from "../api/taskmasterApi"
import { mapTask, mapTaskList } from "../api/mappers";

export function useListPageData(listId: string | undefined) {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const [lists, setLists] = useState<any[]>([]);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<unknown>(null);

  async function refresh() {
    if (!listId) return;
    setLoading(true);
    setErr(null);

    try {
      // Fetch all lists (small enough for MVP)
      const listPage = await taskmasterApi.listTaskLists({ limit: 200 });
      setLists(listPage.items);

      // Fetch tasks for the current list
      const taskPage = await taskmasterApi.tasksByList({
        listId,
        sortOrder: { ge: 0 },
        limit: 500,
      });
      setTasks(taskPage.items);
    } catch (e) {
      setErr(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId]);

  const mapped = useMemo(() => {
    return {
      lists: lists.map(mapTaskList),
      tasks: tasks.map(mapTask).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    };
  }, [lists, tasks]);

  return {
    ...mapped,
    loading,
    err,
    refresh,
  };
}