import { create } from "zustand";

import { taskmasterApi } from "../api/taskmasterApi";
import { toListUI, toTaskUI } from "../api/mappers";
import {
  findInboxListIdByName,
  getInboxListId,
  setInboxListId,
  SYSTEM_INBOX_NAME,
} from "../config/inboxSettings";
import { taskService } from "../services/taskService";
import type { ListUI, TaskUI } from "../types";

export type TaskIndexes = {
  listsById: Record<string, ListUI>;
  tasksById: Record<string, TaskUI>;
  tasksByListId: Record<string, TaskUI[]>;
  childrenByParentId: Record<string, TaskUI[]>;
};

export type TaskStoreState = {
  lists: ListUI[];
  tasks: TaskUI[];

  loading: boolean;
  error: string | null;
  lastLoadedAtMs?: number;

  listsById: Record<string, ListUI>;
  tasksById: Record<string, TaskUI>;
  tasksByListId: Record<string, TaskUI[]>;
  childrenByParentId: Record<string, TaskUI[]>;

  refreshAll: (opts?: { listLimit?: number }) => Promise<void>;

  updateTask: (input: Parameters<typeof taskmasterApi.updateTask>[0]) => Promise<void>;
  deleteTask: (input: Parameters<typeof taskmasterApi.deleteTask>[0]) => Promise<void>;

  createTaskList: (input: Parameters<typeof taskmasterApi.createTaskList>[0]) => Promise<void>;
  updateTaskList: (input: Parameters<typeof taskmasterApi.updateTaskList>[0]) => Promise<void>;
  deleteTaskListSafeById: (listId: string) => Promise<void>;
};

const emptyIndexes: TaskIndexes = {
  listsById: {},
  tasksById: {},
  tasksByListId: {},
  childrenByParentId: {},
};

function errorToMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (typeof err === "object" && err !== null && "message" in err) return String((err as { message: unknown }).message);
  return "Failed to load tasks.";
}

async function ensureInboxListExists(rawLists: ListUI[]) {
  // 1) Stored id path
  const storedId = getInboxListId();
  if (storedId && rawLists.some((l) => l?.id === storedId)) {
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

  if (created?.id) setInboxListId(created.id);

  return { lists: [...rawLists, toListUI(created)] };
}

async function fetchAllTasksForList(listId: string) {
  const all: unknown[] = [];
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

function buildIndexes(lists: ListUI[], tasks: TaskUI[]): TaskIndexes {
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

  // Keep subtasks sorted too (tasks are already globally sorted by sortOrder, but be explicit)
  for (const k of Object.keys(tasksByListId)) {
    tasksByListId[k].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }
  for (const k of Object.keys(childrenByParentId)) {
    childrenByParentId[k].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }

  return { listsById, tasksById, tasksByListId, childrenByParentId };
}

let refreshInFlight: Promise<void> | null = null;

export const useTaskStore = create<TaskStoreState>((set, get) => ({
  lists: [],
  tasks: [],
  loading: true,
  error: null,
  lastLoadedAtMs: undefined,
  listsById: emptyIndexes.listsById,
  tasksById: emptyIndexes.tasksById,
  tasksByListId: emptyIndexes.tasksByListId,
  childrenByParentId: emptyIndexes.childrenByParentId,

  refreshAll: async (opts) => {
    if (refreshInFlight) return refreshInFlight;

    refreshInFlight = (async () => {
      set({ loading: true, error: null });

      try {
        const listPage = await taskmasterApi.listTaskLists({ limit: opts?.listLimit ?? 200 });
        const fetchedLists = listPage.items
          .filter((l): l is NonNullable<typeof l> => !!l)
          .map(toListUI);

        const ensured = await ensureInboxListExists(fetchedLists);
        const ensuredListsSorted = ensured.lists
          .slice()
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

        const tasksNested = await Promise.all(ensuredListsSorted.map((l) => fetchAllTasksForList(l.id)));
        const fetchedTasks = tasksNested.flat().map((t) => toTaskUI(t as Parameters<typeof toTaskUI>[0]));

        const tasksSorted = fetchedTasks.slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

        const indexes = buildIndexes(ensuredListsSorted, tasksSorted);

        // Keep legacy taskService in sync for now (UI behavior must not change yet)
        taskService.setBaseTasks(tasksSorted);

        set({
          lists: ensuredListsSorted,
          tasks: tasksSorted,
          listsById: indexes.listsById,
          tasksById: indexes.tasksById,
          tasksByListId: indexes.tasksByListId,
          childrenByParentId: indexes.childrenByParentId,
          loading: false,
          error: null,
          lastLoadedAtMs: Date.now(),
        });
      } catch (err) {
        taskService.setBaseTasks([]);

        set({
          lists: [],
          tasks: [],
          listsById: emptyIndexes.listsById,
          tasksById: emptyIndexes.tasksById,
          tasksByListId: emptyIndexes.tasksByListId,
          childrenByParentId: emptyIndexes.childrenByParentId,
          loading: false,
          error: errorToMessage(err),
          lastLoadedAtMs: undefined,
        });
      }
    })().finally(() => {
      refreshInFlight = null;
    });

    return refreshInFlight;
  },

  updateTask: async (input) => {
    await taskmasterApi.updateTask(input);
    await get().refreshAll();
  },

  deleteTask: async (input) => {
    await taskmasterApi.deleteTask(input);
    await get().refreshAll();
  },

  createTaskList: async (input) => {
    await taskmasterApi.createTaskList(input);
    await get().refreshAll();
  },

  updateTaskList: async (input) => {
    await taskmasterApi.updateTaskList(input);
    await get().refreshAll();
  },

  deleteTaskListSafeById: async (listId) => {
    await taskmasterApi.deleteTaskListSafeById(listId);
    await get().refreshAll();
  },
}));

export function getTaskStoreState() {
  return useTaskStore.getState();
}
