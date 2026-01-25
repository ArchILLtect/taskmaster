import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

import { taskmasterApi } from "../api/taskmasterApi";
import { toListUI, toTaskUI } from "../api/mappers";
import {
  findInboxListIdByName,
  getInboxListId,
  setInboxListId,
  SYSTEM_INBOX_NAME,
} from "../config/inboxSettings";
import type { ListUI, TaskUI } from "../types";

const EMPTY_TASKS: TaskUI[] = [];

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
  hydrateAndRefreshIfStale: (opts?: { listLimit?: number }) => Promise<void>;
  expireTaskCache: () => void;

  createTask: (input: Parameters<typeof taskmasterApi.createTask>[0]) => Promise<{ id: string }>;
  updateTask: (input: Parameters<typeof taskmasterApi.updateTask>[0]) => Promise<void>;
  deleteTask: (input: Parameters<typeof taskmasterApi.deleteTask>[0]) => Promise<void>;
  sendTaskToInbox: (taskId: string) => Promise<void>;

  createTaskList: (input: Parameters<typeof taskmasterApi.createTaskList>[0]) => Promise<void>;
  updateTaskList: (input: Parameters<typeof taskmasterApi.updateTaskList>[0]) => Promise<void>;
  deleteTaskListSafeById: (listId: string) => Promise<void>;
};

// Persistence readiness (no persistence enabled yet)
// Keep the persisted slice fully serializable: plain objects/arrays only.
export const TASK_STORE_PERSIST_VERSION = 1 as const;

export const TASK_STORE_TTL_MS = 5 * 60 * 1000;

export function isCacheFresh(lastLoadedAtMs?: number): boolean {
  if (typeof lastLoadedAtMs !== "number") return false;
  if (!Number.isFinite(lastLoadedAtMs)) return false;
  return Date.now() - lastLoadedAtMs < TASK_STORE_TTL_MS;
}

export type TaskStorePersistedState = Pick<
  TaskStoreState,
  | "lists"
  | "tasks"
  | "lastLoadedAtMs"
  | "listsById"
  | "tasksById"
  | "tasksByListId"
  | "childrenByParentId"
>;

// Zustand persist-style migrate signature.
// Stub for now; once persistence is enabled, evolve this to transform older shapes.
export function migrateTaskStoreState(persistedState: unknown, _version: number): unknown {
  return persistedState;
}

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

export const useTaskStore = create<TaskStoreState>()(
  persist(
    (set, get) => ({
      lists: [],
      tasks: [],
      loading: false,
      error: null,
      lastLoadedAtMs: undefined,
      listsById: emptyIndexes.listsById,
      tasksById: emptyIndexes.tasksById,
      tasksByListId: emptyIndexes.tasksByListId,
      childrenByParentId: emptyIndexes.childrenByParentId,

      expireTaskCache: () => {
        // Force TTL to treat the cache as stale while keeping the cached data.
        // Using 0 (instead of undefined) ensures the persisted value is overwritten.
        set({ lastLoadedAtMs: 0 });
      },

      hydrateAndRefreshIfStale: async (opts) => {
        if (isCacheFresh(get().lastLoadedAtMs)) return;
        await get().refreshAll(opts);
      },

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

      createTask: async (input) => {
        const created = await taskmasterApi.createTask(input);
        await get().refreshAll();
        return { id: String((created as { id?: unknown } | null | undefined)?.id ?? "") };
      },

      updateTask: async (input) => {
        await taskmasterApi.updateTask(input);
        await get().refreshAll();
      },

      deleteTask: async (input) => {
        await taskmasterApi.deleteTask(input);
        await get().refreshAll();
      },

      sendTaskToInbox: async (taskId) => {
        await taskmasterApi.sendTaskToInbox(taskId);
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
    }),
    {
      name: "taskmaster:taskStore",
      version: TASK_STORE_PERSIST_VERSION,
      migrate: migrateTaskStoreState,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        lists: s.lists,
        tasks: s.tasks,
        listsById: s.listsById,
        tasksById: s.tasksById,
        tasksByListId: s.tasksByListId,
        childrenByParentId: s.childrenByParentId,
        lastLoadedAtMs: s.lastLoadedAtMs,
      }),
    }
  )
);

// Selectors (prefer these over inline `(s) => s.x` to keep consumption consistent)
export const selectLists = (s: TaskStoreState) => s.lists;
export const selectTasks = (s: TaskStoreState) => s.tasks;

export const selectLoading = (s: TaskStoreState) => s.loading;
export const selectError = (s: TaskStoreState) => s.error;

export const selectListById = (id: string) => (s: TaskStoreState) => s.listsById[id];
export const selectTaskById = (id: string) => (s: TaskStoreState) => s.tasksById[id];

export const selectTasksByListId = (listId: string) => (s: TaskStoreState) => s.tasksByListId[listId] ?? EMPTY_TASKS;
export const selectChildrenByParentId = (parentId: string) => (s: TaskStoreState) => s.childrenByParentId[parentId] ?? EMPTY_TASKS;

// Common view helper: returns stable references and minimizes rerenders via shallow compare.
export function useTaskIndexView(): {
  lists: ListUI[];
  tasks: TaskUI[];
  listsById: Record<string, ListUI>;
  tasksById: Record<string, TaskUI>;
  tasksByListId: Record<string, TaskUI[]>;
  childrenByParentId: Record<string, TaskUI[]>;
  loading: boolean;
  error: string | null;
  lastLoadedAtMs?: number;
  refreshAll: TaskStoreState["refreshAll"];
  hydrateAndRefreshIfStale: TaskStoreState["hydrateAndRefreshIfStale"];
} {
  return useTaskStore(
    useShallow((s) => ({
      lists: s.lists,
      tasks: s.tasks,
      listsById: s.listsById,
      tasksById: s.tasksById,
      tasksByListId: s.tasksByListId,
      childrenByParentId: s.childrenByParentId,
      loading: s.loading,
      error: s.error,
      lastLoadedAtMs: s.lastLoadedAtMs,
      refreshAll: s.refreshAll,
      hydrateAndRefreshIfStale: s.hydrateAndRefreshIfStale,
    }))
  );
}

export function useTaskStoreView() {
  return useTaskIndexView();
}

type TaskActions = Pick<
  TaskStoreState,
  | "refreshAll"
  | "hydrateAndRefreshIfStale"
  | "expireTaskCache"
  | "createTask"
  | "updateTask"
  | "deleteTask"
  | "sendTaskToInbox"
  | "createTaskList"
  | "updateTaskList"
  | "deleteTaskListSafeById"
>;

export function useTaskActions(): TaskActions {
  return useTaskStore(
    useShallow((s) => ({
      refreshAll: s.refreshAll,
      hydrateAndRefreshIfStale: s.hydrateAndRefreshIfStale,
      expireTaskCache: s.expireTaskCache,
      createTask: s.createTask,
      updateTask: s.updateTask,
      deleteTask: s.deleteTask,
      sendTaskToInbox: s.sendTaskToInbox,
      createTaskList: s.createTaskList,
      updateTaskList: s.updateTaskList,
      deleteTaskListSafeById: s.deleteTaskListSafeById,
    }))
  );
}

export function getTaskStoreState() {
  return useTaskStore.getState();
}
