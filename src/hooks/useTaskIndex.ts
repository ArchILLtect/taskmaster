import { useCallback, useEffect, useMemo, useState } from "react";
import { taskmasterApi } from "../api/taskmasterApi";
import { toListUI, toTaskUI } from "../api/mappers";
import { 
  getInboxListId, 
  setInboxListId, 
  findInboxListIdByName, 
  SYSTEM_INBOX_NAME 
} from "../config/inboxSettings";
// import { isInboxList } from "../config/inboxSettings";
import type { TaskUI } from "../types/task";
import type { ListUI } from "../types/list";
import { taskService } from "../services/taskService";

type TaskIndex = {
  lists: ListUI[];
  tasks: TaskUI[];

  listsById: Record<string, ListUI>;
  tasksById: Record<string, TaskUI>;

  tasksByListId: Record<string, TaskUI[]>;
  childrenByParentId: Record<string, TaskUI[]>;
};

async function ensureInboxListExists(rawLists: ListUI[]) {
  // 1) Stored id path
  const storedId = getInboxListId();
if (storedId && rawLists.some(l => l?.id === storedId)) {
    return { lists: rawLists };
  }

  // 2) Name fallback
  const byNameId = findInboxListIdByName(rawLists);
  if (byNameId) {
    setInboxListId(byNameId);
    return { lists: rawLists };
  }

  // 3) Create it
  const maxSortOrder = rawLists.reduce((acc, l) => Math.max(acc, l?.sortOrder ?? 0), 0);

  const created = await taskmasterApi.createTaskList({
    name: SYSTEM_INBOX_NAME,
    sortOrder: maxSortOrder + 1,
    isFavorite: false,
  });

  // created should include id
  if (created?.id) setInboxListId(created.id);

  // Make sure it exists in the current in-memory list set
  return { lists: [...rawLists, toListUI(created)] };
}

// ignore any for linting purposes; pagination handles limits
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  const [rawLists, setRawLists] = useState<ListUI[]>([]);
  const [rawTasks, setRawTasks] = useState<TaskUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<unknown>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setErr(null);

    try {
      // 1) fetch lists
      const listPage = await taskmasterApi.listTaskLists({ limit: opts?.listLimit ?? 200 });
      const lists = listPage.items
        .filter((l): l is NonNullable<typeof l> => !!l)
        .map(toListUI);

      // 2) ensure inbox exists (and localStorage is updated)
      const ensured = await ensureInboxListExists(lists);
      const ensuredLists = ensured.lists;

      // 3) fan out tasksByList for each list (parallel)
      const tasksNested = await Promise.all(ensuredLists.map((l) => fetchAllTasksForList(l.id)));
      const tasks = tasksNested.flat().map(toTaskUI);

      setRawLists(ensuredLists);
      setRawTasks(tasks);
      taskService.setBaseTasks(tasks);
    } catch (e) {
      setErr(e);
      setRawLists([]);
      setRawTasks([]);
      taskService.setBaseTasks([]);
    } finally {
      setLoading(false);
    }
  }, [opts?.listLimit]);

  useEffect(() => {
    if (opts?.autoLoad === false) return;
    void refresh();
  }, [refresh, opts?.autoLoad]);

  const index = useMemo<TaskIndex>(() => {
    const lists = rawLists.slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const tasks = rawTasks.slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    const listsById: Record<string, ListUI> = {};
    for (const l of lists) listsById[l.id] = l;

    const tasksById: Record<string, TaskUI> = {};
    for (const t of tasks) tasksById[t.id] = t;

    const tasksByListId: Record<string, TaskUI[]> = {};
    for (const t of tasks) (tasksByListId[t.listId] ??= []).push(t);

    const childrenByParentId: Record<string, TaskUI[]> = {};
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