import { useCallback, useEffect, useMemo, useState } from "react";
import { taskmasterApi } from "../api/taskmasterApi";
import { mapTask, mapTaskList } from "../api/mappers";
import type { Task } from "../types/task";
import type { TaskList } from "../types/list";

type TaskIndex = {
  lists: TaskList[];
  tasks: Task[];

  listsById: Record<string, TaskList>;
  tasksById: Record<string, Task>;

  tasksByListId: Record<string, Task[]>;
  childrenByParentId: Record<string, Task[]>;
};

async function fetchAllTasksForList(listId: string) {
  const all: any[] = [];
  let nextToken: string | null | undefined = null;

  do {
    const page = await taskmasterApi.tasksByList({
      listId,
      sortOrder: { ge: 0 },
      limit: 500,
      nextToken,
    });

    all.push(...page.items);
    nextToken = page.nextToken ?? null;
  } while (nextToken);

  return all;
}

export function useTaskIndex(opts?: {
  listLimit?: number;
  tasksPerListLimit?: number; // not used (pagination does the real work), kept for future tuning
  autoLoad?: boolean;
}) {
  const [rawLists, setRawLists] = useState<any[]>([]);
  const [rawTasks, setRawTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<unknown>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setErr(null);

    try {
      // 1) fetch lists
      const listPage = await taskmasterApi.listTaskLists({ limit: opts?.listLimit ?? 200 });
      const lists = listPage.items.filter((l): l is NonNullable<typeof l> => !!l);

      // 2) fan out tasksByList for each list (parallel)
      const tasksNested = await Promise.all(lists.map((l) => fetchAllTasksForList(l.id)));
      const tasks = tasksNested.flat();

      setRawLists(lists);
      setRawTasks(tasks);
    } catch (e) {
      setErr(e);
      setRawLists([]);
      setRawTasks([]);
    } finally {
      setLoading(false);
    }
  }, [opts?.listLimit]);

  useEffect(() => {
    if (opts?.autoLoad === false) return;
    void refresh();
  }, [refresh, opts?.autoLoad]);

  const index = useMemo<TaskIndex>(() => {
    // NOTE: your mappers currently accept local types as input, but we’re feeding them GraphQL shapes.
    // For MVP, just cast (the shapes are structurally compatible enough).
    const lists = rawLists
      .map((l) => mapTaskList(l as unknown as TaskList))
      .slice()
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    const tasks = rawTasks
      .map((t) => mapTask(t as unknown as Task))
      .slice()
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    const listsById: Record<string, TaskList> = {};
    for (const l of lists) listsById[l.id] = l;

    const tasksById: Record<string, Task> = {};
    for (const t of tasks) tasksById[t.id] = t;

    const tasksByListId: Record<string, Task[]> = {};
    for (const t of tasks) (tasksByListId[t.listId] ??= []).push(t);

    const childrenByParentId: Record<string, Task[]> = {};
    for (const t of tasks) {
      const parentId = t.parentTaskId ?? null;
      if (!parentId) continue;
      (childrenByParentId[parentId] ??= []).push(t);
    }

    // Keep subtasks sorted too
    for (const k of Object.keys(childrenByParentId)) {
      childrenByParentId[k].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    }

    return { lists, tasks, listsById, tasksById, tasksByListId, childrenByParentId };
  }, [rawLists, rawTasks]);

  return { ...index, loading, err, refresh };
}
