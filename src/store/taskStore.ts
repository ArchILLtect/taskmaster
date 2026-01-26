import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PersistStorage, StorageValue } from "zustand/middleware";

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

  // Non-persisted refresh metadata (debug/demo-friendly)
  lastRefreshSource?: "cache" | "network";
  lastRefreshReason?: "hydrate" | "ttl" | "manual" | "mutation";
  lastRefreshAtMs?: number;

  listsById: Record<string, ListUI>;
  tasksById: Record<string, TaskUI>;
  tasksByListId: Record<string, TaskUI[]>;
  childrenByParentId: Record<string, TaskUI[]>;

  refreshAll: (
    opts?: { listLimit?: number },
    meta?: { reason?: "ttl" | "manual" | "mutation" }
  ) => Promise<void>;
  hydrateAndRefreshIfStale: (opts?: { listLimit?: number }) => Promise<void>;
  expireTaskCache: () => void;

  // Internal helper (not persisted)
  setRefreshMeta: (meta: {
    source: "cache" | "network";
    reason: "hydrate" | "ttl" | "manual" | "mutation";
    atMs?: number;
  }) => void;

  // Internal helper (not persisted)
  rebuildIndexes: () => void;

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
  "lists" | "tasks" | "lastLoadedAtMs"
>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidTaskStorePersistedState(value: unknown): value is TaskStorePersistedState {
  if (!isRecord(value)) return false;

  if (!Array.isArray(value.lists)) return false;
  if (!Array.isArray(value.tasks)) return false;

  if ("lastLoadedAtMs" in value && value.lastLoadedAtMs !== undefined) {
    if (typeof value.lastLoadedAtMs !== "number" || !Number.isFinite(value.lastLoadedAtMs)) return false;
  }

  return true;
}

let didWarnTaskStoreBadJson = false;
let didWarnTaskStoreBadShape = false;

// Persist storage wrapper that is resilient to corrupted/invalid JSON values.
// This prevents a bad localStorage entry from breaking app startup.
const taskStoreStorage: PersistStorage<unknown, unknown> = {
  getItem: (name: string) => {
    const raw = localStorage.getItem(name);
    if (raw == null) return null;

    try {
      const parsed = JSON.parse(raw) as unknown;

      // Persist expects an envelope: { state, version }. If it's not shaped like that,
      // treat it as corrupted and clear it.
      if (!isRecord(parsed) || !("state" in parsed)) {
        if (import.meta.env.DEV && !didWarnTaskStoreBadJson) {
          didWarnTaskStoreBadJson = true;
          console.warn(`[taskStore] Invalid persisted JSON for "${name}"; clearing and using defaults.`);
        }
        localStorage.removeItem(name);
        return null;
      }

      return parsed as StorageValue<unknown>;
    } catch {
      if (import.meta.env.DEV && !didWarnTaskStoreBadJson) {
        didWarnTaskStoreBadJson = true;
        console.warn(`[taskStore] Invalid persisted JSON for "${name}"; clearing and using defaults.`);
      }
      localStorage.removeItem(name);
      return null;
    }
  },
  setItem: (name: string, value: StorageValue<unknown>) => {
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  },
};

// Zustand persist-style migrate signature.
// Stub for now; once persistence is enabled, evolve this to transform older shapes.
export function migrateTaskStoreState(persistedState: unknown, _version: number): unknown {
  // Allow older versions for now (no transforms yet), but validate the shape.
  if (!isValidTaskStorePersistedState(persistedState)) {
    if (import.meta.env.DEV && !didWarnTaskStoreBadShape) {
      didWarnTaskStoreBadShape = true;
      console.warn('[taskStore] Invalid persisted state shape; clearing cache and using defaults.');
    }
    return undefined;
  }

  // Persist only the minimal stable slice; older caches may include derived indexes.
  const s = persistedState as TaskStorePersistedState;
  return {
    lists: s.lists,
    tasks: s.tasks,
    lastLoadedAtMs: s.lastLoadedAtMs,
  } satisfies TaskStorePersistedState;
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
      lastRefreshSource: undefined,
      lastRefreshReason: undefined,
      lastRefreshAtMs: undefined,
      listsById: emptyIndexes.listsById,
      tasksById: emptyIndexes.tasksById,
      tasksByListId: emptyIndexes.tasksByListId,
      childrenByParentId: emptyIndexes.childrenByParentId,

      setRefreshMeta: (meta) => {
        set({
          lastRefreshSource: meta.source,
          lastRefreshReason: meta.reason,
          lastRefreshAtMs: meta.atMs ?? Date.now(),
        });
      },

      rebuildIndexes: () => {
        const s = get();
        const indexes = buildIndexes(s.lists, s.tasks);
        set({
          listsById: indexes.listsById,
          tasksById: indexes.tasksById,
          tasksByListId: indexes.tasksByListId,
          childrenByParentId: indexes.childrenByParentId,
        });
      },

      expireTaskCache: () => {
        // Force TTL to treat the cache as stale while keeping the cached data.
        // Using 0 (instead of undefined) ensures the persisted value is overwritten.
        set({ lastLoadedAtMs: 0 });
      },

      hydrateAndRefreshIfStale: async (opts) => {
        if (isCacheFresh(get().lastLoadedAtMs)) {
          get().setRefreshMeta({ source: "cache", reason: "ttl" });
          return;
        }
        await get().refreshAll(opts, { reason: "ttl" });
      },

      refreshAll: async (opts, meta) => {
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
              lastRefreshSource: "network",
              lastRefreshReason: meta?.reason ?? "manual",
              lastRefreshAtMs: Date.now(),
            });
          } catch (err) {
            const prev = get();
            const hasCachedData = prev.lists.length > 0 || prev.tasks.length > 0;

            set(
              hasCachedData
                ? {
                    loading: false,
                    error: errorToMessage(err),
                  }
                : {
                    lists: [],
                    tasks: [],
                    listsById: emptyIndexes.listsById,
                    tasksById: emptyIndexes.tasksById,
                    tasksByListId: emptyIndexes.tasksByListId,
                    childrenByParentId: emptyIndexes.childrenByParentId,
                    loading: false,
                    error: errorToMessage(err),
                    lastLoadedAtMs: undefined,
                  }
            );
          }
        })().finally(() => {
          refreshInFlight = null;
        });

        return refreshInFlight;
      },

      createTask: async (input) => {
        const created = await taskmasterApi.createTask(input);
        await get().refreshAll(undefined, { reason: "mutation" });
        return { id: String((created as { id?: unknown } | null | undefined)?.id ?? "") };
      },

      updateTask: async (input) => {
        await taskmasterApi.updateTask(input);
        await get().refreshAll(undefined, { reason: "mutation" });
      },

      deleteTask: async (input) => {
        await taskmasterApi.deleteTask(input);
        await get().refreshAll(undefined, { reason: "mutation" });
      },

      sendTaskToInbox: async (taskId) => {
        await taskmasterApi.sendTaskToInbox(taskId);
        await get().refreshAll(undefined, { reason: "mutation" });
      },

      createTaskList: async (input) => {
        await taskmasterApi.createTaskList(input);
        await get().refreshAll(undefined, { reason: "mutation" });
      },

      updateTaskList: async (input) => {
        await taskmasterApi.updateTaskList(input);
        await get().refreshAll(undefined, { reason: "mutation" });
      },

      deleteTaskListSafeById: async (listId) => {
        await taskmasterApi.deleteTaskListSafeById(listId);
        await get().refreshAll(undefined, { reason: "mutation" });
      },
    }),
    {
      name: "taskmaster:taskStore",
      version: TASK_STORE_PERSIST_VERSION,
      migrate: migrateTaskStoreState,
      storage: taskStoreStorage,
      onRehydrateStorage: (state) => {
        return (_hydratedState, error) => {
          if (error) return;
          // After hydration, rebuild derived indexes from the cached arrays.
          state?.rebuildIndexes();
          // Mark that we are rendering from persisted cache after hydration.
          state?.setRefreshMeta({ source: "cache", reason: "hydrate" });
        };
      },
      partialize: (s) => ({
        lists: s.lists,
        tasks: s.tasks,
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

type TaskIndexView = {
  lists: ListUI[];
  tasks: TaskUI[];
  listsById: Record<string, ListUI>;
  tasksById: Record<string, TaskUI>;
  tasksByListId: Record<string, TaskUI[]>;
  childrenByParentId: Record<string, TaskUI[]>;
  loading: boolean;
  error: string | null;
  lastLoadedAtMs?: number;
  lastRefreshSource?: TaskStoreState["lastRefreshSource"];
  lastRefreshReason?: TaskStoreState["lastRefreshReason"];
  lastRefreshAtMs?: number;
  refreshAll: TaskStoreState["refreshAll"];
  hydrateAndRefreshIfStale: TaskStoreState["hydrateAndRefreshIfStale"];
};

let cachedTaskIndexView: TaskIndexView | null = null;
let cachedTaskIndexInputs: {
  lists: TaskIndexView["lists"];
  tasks: TaskIndexView["tasks"];
  listsById: TaskIndexView["listsById"];
  tasksById: TaskIndexView["tasksById"];
  tasksByListId: TaskIndexView["tasksByListId"];
  childrenByParentId: TaskIndexView["childrenByParentId"];
  loading: TaskIndexView["loading"];
  error: TaskIndexView["error"];
  lastLoadedAtMs: TaskIndexView["lastLoadedAtMs"];
  lastRefreshSource: TaskIndexView["lastRefreshSource"];
  lastRefreshReason: TaskIndexView["lastRefreshReason"];
  lastRefreshAtMs: TaskIndexView["lastRefreshAtMs"];
  refreshAll: TaskIndexView["refreshAll"];
  hydrateAndRefreshIfStale: TaskIndexView["hydrateAndRefreshIfStale"];
} | null = null;

function selectTaskIndexView(s: TaskStoreState): TaskIndexView {
  const inputs = {
    lists: s.lists,
    tasks: s.tasks,
    listsById: s.listsById,
    tasksById: s.tasksById,
    tasksByListId: s.tasksByListId,
    childrenByParentId: s.childrenByParentId,
    loading: s.loading,
    error: s.error,
    lastLoadedAtMs: s.lastLoadedAtMs,
    lastRefreshSource: s.lastRefreshSource,
    lastRefreshReason: s.lastRefreshReason,
    lastRefreshAtMs: s.lastRefreshAtMs,
    refreshAll: s.refreshAll,
    hydrateAndRefreshIfStale: s.hydrateAndRefreshIfStale,
  };

  if (
    cachedTaskIndexView &&
    cachedTaskIndexInputs &&
    cachedTaskIndexInputs.lists === inputs.lists &&
    cachedTaskIndexInputs.tasks === inputs.tasks &&
    cachedTaskIndexInputs.listsById === inputs.listsById &&
    cachedTaskIndexInputs.tasksById === inputs.tasksById &&
    cachedTaskIndexInputs.tasksByListId === inputs.tasksByListId &&
    cachedTaskIndexInputs.childrenByParentId === inputs.childrenByParentId &&
    cachedTaskIndexInputs.loading === inputs.loading &&
    cachedTaskIndexInputs.error === inputs.error &&
    cachedTaskIndexInputs.lastLoadedAtMs === inputs.lastLoadedAtMs &&
    cachedTaskIndexInputs.lastRefreshSource === inputs.lastRefreshSource &&
    cachedTaskIndexInputs.lastRefreshReason === inputs.lastRefreshReason &&
    cachedTaskIndexInputs.lastRefreshAtMs === inputs.lastRefreshAtMs &&
    cachedTaskIndexInputs.refreshAll === inputs.refreshAll &&
    cachedTaskIndexInputs.hydrateAndRefreshIfStale === inputs.hydrateAndRefreshIfStale
  ) {
    return cachedTaskIndexView;
  }

  cachedTaskIndexInputs = inputs;
  cachedTaskIndexView = {
    lists: inputs.lists,
    tasks: inputs.tasks,
    listsById: inputs.listsById,
    tasksById: inputs.tasksById,
    tasksByListId: inputs.tasksByListId,
    childrenByParentId: inputs.childrenByParentId,
    loading: inputs.loading,
    error: inputs.error,
    lastLoadedAtMs: inputs.lastLoadedAtMs,
    lastRefreshSource: inputs.lastRefreshSource,
    lastRefreshReason: inputs.lastRefreshReason,
    lastRefreshAtMs: inputs.lastRefreshAtMs,
    refreshAll: inputs.refreshAll,
    hydrateAndRefreshIfStale: inputs.hydrateAndRefreshIfStale,
  };
  return cachedTaskIndexView;
}

// Common view helper: returns cached snapshots (stable references when inputs don’t change).
export function useTaskIndexView(): TaskIndexView {
  return useTaskStore(selectTaskIndexView);
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
  return useTaskStore(selectTaskActions);
}

let cachedTaskActions: TaskActions | null = null;
let cachedTaskActionsInputs: {
  refreshAll: TaskActions["refreshAll"];
  hydrateAndRefreshIfStale: TaskActions["hydrateAndRefreshIfStale"];
  expireTaskCache: TaskActions["expireTaskCache"];
  createTask: TaskActions["createTask"];
  updateTask: TaskActions["updateTask"];
  deleteTask: TaskActions["deleteTask"];
  sendTaskToInbox: TaskActions["sendTaskToInbox"];
  createTaskList: TaskActions["createTaskList"];
  updateTaskList: TaskActions["updateTaskList"];
  deleteTaskListSafeById: TaskActions["deleteTaskListSafeById"];
} | null = null;

function selectTaskActions(s: TaskStoreState): TaskActions {
  const inputs = {
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
  };

  if (
    cachedTaskActions &&
    cachedTaskActionsInputs &&
    cachedTaskActionsInputs.refreshAll === inputs.refreshAll &&
    cachedTaskActionsInputs.hydrateAndRefreshIfStale === inputs.hydrateAndRefreshIfStale &&
    cachedTaskActionsInputs.expireTaskCache === inputs.expireTaskCache &&
    cachedTaskActionsInputs.createTask === inputs.createTask &&
    cachedTaskActionsInputs.updateTask === inputs.updateTask &&
    cachedTaskActionsInputs.deleteTask === inputs.deleteTask &&
    cachedTaskActionsInputs.sendTaskToInbox === inputs.sendTaskToInbox &&
    cachedTaskActionsInputs.createTaskList === inputs.createTaskList &&
    cachedTaskActionsInputs.updateTaskList === inputs.updateTaskList &&
    cachedTaskActionsInputs.deleteTaskListSafeById === inputs.deleteTaskListSafeById
  ) {
    return cachedTaskActions;
  }

  cachedTaskActionsInputs = inputs;
  cachedTaskActions = {
    refreshAll: inputs.refreshAll,
    hydrateAndRefreshIfStale: inputs.hydrateAndRefreshIfStale,
    expireTaskCache: inputs.expireTaskCache,
    createTask: inputs.createTask,
    updateTask: inputs.updateTask,
    deleteTask: inputs.deleteTask,
    sendTaskToInbox: inputs.sendTaskToInbox,
    createTaskList: inputs.createTaskList,
    updateTaskList: inputs.updateTaskList,
    deleteTaskListSafeById: inputs.deleteTaskListSafeById,
  };
  return cachedTaskActions;
}

export function getTaskStoreState() {
  return useTaskStore.getState();
}
