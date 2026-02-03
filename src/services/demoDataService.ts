import { getCurrentUser } from "aws-amplify/auth";

import { taskmasterApi } from "../api/taskmasterApi";
import { bootstrapUser } from "./userBootstrapService";
import { getTaskStoreState } from "../store/taskStore";
import { findInboxListIdByName, getInboxListId, setInboxListId } from "../config/inboxSettings";
import { TaskPriority, TaskStatus } from "../API";

function errorToMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (typeof err === "object" && err !== null && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return "Unknown error";
}

async function deleteTaskIds(taskIds: string[]): Promise<void> {
  const chunkSize = 10;
  for (let i = 0; i < taskIds.length; i += chunkSize) {
    const chunk = taskIds.slice(i, i + chunkSize);
    const results = await Promise.allSettled(chunk.map((id) => taskmasterApi.deleteTask({ id })));
    const rejected = results.find((r) => r.status === "rejected");
    if (rejected && rejected.status === "rejected") throw rejected.reason;
  }
}

async function deleteListIds(listIds: string[]): Promise<void> {
  for (const listId of listIds) {
    await taskmasterApi.deleteTaskListSafeById(listId);
  }
}

async function moveTaskIdsToList(taskIds: string[], targetListId: string): Promise<void> {
  const chunkSize = 10;
  for (let i = 0; i < taskIds.length; i += chunkSize) {
    const chunk = taskIds.slice(i, i + chunkSize);
    const results = await Promise.allSettled(chunk.map((id) => taskmasterApi.moveTaskToList(id, targetListId)));
    const rejected = results.find((r) => r.status === "rejected");
    if (rejected && rejected.status === "rejected") throw rejected.reason;
  }
}

export type ClearDemoDataResult = {
  movedNonDemoTaskCount: number;
  deletedDemoTaskCount: number;
  deletedDemoListCount: number;
};

export type AddDemoDataResult = {
  createdDemoTaskCount: number;
  createdDemoListCount: number;
};

function resolveInboxListIdFromState(lists: Array<{ id: string; name?: string | null }>): string | null {
  const stored = getInboxListId();
  const byName = findInboxListIdByName(lists);
  const inboxId = byName || stored || null;

  if (byName && byName !== stored) {
    setInboxListId(byName);
  }

  return inboxId;
}

// Clears only *demo-marked* data (`isDemo === true`).
// Guardrails:
// - Never deletes non-demo tasks or lists.
// - If a demo list contains non-demo tasks, those tasks are moved to the system inbox before the demo list is deleted.
export async function clearDemoDataOnly(): Promise<ClearDemoDataResult> {
  // Requires auth.
  await getCurrentUser();

  // Ensure we operate on fresh server state.
  await getTaskStoreState().refreshAll(undefined, { reason: "manual" });

  const state = getTaskStoreState();
  const lists = state.lists;
  const tasks = state.tasks;

  const inboxListId = resolveInboxListIdFromState(lists);
  if (!inboxListId) {
    throw new Error("System Inbox list is not initialized yet. Please refresh and try again.");
  }

  const demoListIds = new Set(lists.filter((l) => l.isDemo).map((l) => l.id));

  // Move any non-demo tasks that live inside demo lists to the inbox so we can safely delete the demo list.
  const nonDemoTaskIdsToMove = tasks
    .filter((t) => demoListIds.has(t.listId) && !t.isDemo)
    .map((t) => t.id);

  if (nonDemoTaskIdsToMove.length > 0) {
    await moveTaskIdsToList(nonDemoTaskIdsToMove, inboxListId);
  }

  const demoTaskIdsToDelete = tasks.filter((t) => t.isDemo).map((t) => t.id);
  if (demoTaskIdsToDelete.length > 0) {
    await deleteTaskIds(demoTaskIdsToDelete);
  }

  const demoListIdsToDelete = Array.from(demoListIds);
  if (demoListIdsToDelete.length > 0) {
    await deleteListIds(demoListIdsToDelete);
  }

  await getTaskStoreState().refreshAll(undefined, { reason: "mutation" });

  return {
    movedNonDemoTaskCount: nonDemoTaskIdsToMove.length,
    deletedDemoTaskCount: demoTaskIdsToDelete.length,
    deletedDemoListCount: demoListIdsToDelete.length,
  };
}

// Resets (re-seeds) demo data while preserving non-demo data.
// Implementation: clear demo-only rows, reset the seed gate, then run the seed.
export async function resetDemoDataPreservingNonDemo(): Promise<ClearDemoDataResult> {
  await getCurrentUser();

  const clearResult = await clearDemoDataOnly();

  const current = await getCurrentUser();
  const profileId = current.userId;

  try {
    await taskmasterApi.updateUserProfile({ id: profileId, seedVersion: 0, seededAt: null });
  } catch (err) {
    throw new Error(`Failed to reset seed version: ${errorToMessage(err)}`);
  }

  await bootstrapUser({ seedDemo: true });
  await getTaskStoreState().refreshAll(undefined, { reason: "mutation" });

  return clearResult;
}

function clampCount(n: number, max: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(max, Math.floor(n)));
}

async function ensureAtLeastOneDemoList(owner: string): Promise<string> {
  const state = getTaskStoreState();
  const existing = state.lists.find((l) => l.isDemo);
  if (existing?.id) return existing.id;

  const maxSortOrder = state.lists.reduce((acc, l) => Math.max(acc, l.sortOrder ?? 0), 0);
  const created = await taskmasterApi.createTaskList({
    owner,
    name: "Demo: Extra",
    description: "Extra demo items added from Settings.",
    sortOrder: maxSortOrder + 1,
    isFavorite: false,
    isDemo: true,
  });

  const id = String((created as { id?: unknown } | null | undefined)?.id ?? "");
  if (!id) throw new Error("Failed to create demo list.");
  return id;
}

function nextTaskSortOrderForList(listId: string): number {
  const state = getTaskStoreState();
  const max = state.tasks
    .filter((t) => t.listId === listId)
    .reduce((acc, t) => Math.max(acc, t.sortOrder ?? 0), -1);
  return max + 1;
}

export async function addMoreDemoTasks(count: number): Promise<AddDemoDataResult> {
  await getCurrentUser();

  const n = clampCount(count, 200);
  if (n === 0) return { createdDemoTaskCount: 0, createdDemoListCount: 0 };

  await getTaskStoreState().refreshAll(undefined, { reason: "manual" });

  const current = await getCurrentUser();
  const owner = current.userId;

  const demoListId = await ensureAtLeastOneDemoList(owner);
  const sortOrder = nextTaskSortOrderForList(demoListId);
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

  // Keep concurrency modest to reduce throttling.
  const chunkSize = 10;
  let createdCount = 0;
  for (let i = 0; i < n; i += chunkSize) {
    const chunk = Array.from({ length: Math.min(chunkSize, n - i) }, (_, j) => i + j);
    const results = await Promise.allSettled(
      chunk.map((idx) =>
        taskmasterApi.createTask({
          owner,
          listId: demoListId,
          sortOrder: sortOrder + idx,
          parentTaskId: null,
          title: `Demo: Extra Task ${idx + 1} (${stamp})`,
          description: "Added from Settings → Demo Data.",
          status: TaskStatus.Open,
          priority: TaskPriority.Medium,
          dueAt: null,
          completedAt: null,
          assigneeId: null,
          tagIds: [],
          isDemo: true,
        })
      )
    );

    for (const r of results) if (r.status === "fulfilled") createdCount += 1;
    const rejected = results.find((r) => r.status === "rejected");
    if (rejected && rejected.status === "rejected") throw rejected.reason;
  }

  await getTaskStoreState().refreshAll(undefined, { reason: "mutation" });
  return { createdDemoTaskCount: createdCount, createdDemoListCount: 0 };
}

export async function addMoreDemoLists(count: number): Promise<AddDemoDataResult> {
  await getCurrentUser();

  const n = clampCount(count, 50);
  if (n === 0) return { createdDemoTaskCount: 0, createdDemoListCount: 0 };

  await getTaskStoreState().refreshAll(undefined, { reason: "manual" });

  const current = await getCurrentUser();
  const owner = current.userId;

  const state = getTaskStoreState();
  const sortOrder = state.lists.reduce((acc, l) => Math.max(acc, l.sortOrder ?? 0), 0) + 1;
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

  const chunkSize = 10;
  let createdCount = 0;
  for (let i = 0; i < n; i += chunkSize) {
    const chunk = Array.from({ length: Math.min(chunkSize, n - i) }, (_, j) => i + j);
    const results = await Promise.allSettled(
      chunk.map((idx) =>
        taskmasterApi.createTaskList({
          owner,
          name: `Demo: Extra List ${idx + 1} (${stamp})`,
          description: "Added from Settings → Demo Data.",
          sortOrder: sortOrder + idx,
          isFavorite: false,
          isDemo: true,
        })
      )
    );

    for (const r of results) if (r.status === "fulfilled") createdCount += 1;
    const rejected = results.find((r) => r.status === "rejected");
    if (rejected && rejected.status === "rejected") throw rejected.reason;
  }

  await getTaskStoreState().refreshAll(undefined, { reason: "mutation" });
  return { createdDemoTaskCount: 0, createdDemoListCount: createdCount };
}

export async function addMoreDemoTasksAndLists(opts: { tasks: number; lists: number }): Promise<AddDemoDataResult> {
  await getCurrentUser();

  const taskCount = clampCount(opts.tasks, 200);
  const listCount = clampCount(opts.lists, 50);
  if (taskCount === 0 && listCount === 0) return { createdDemoTaskCount: 0, createdDemoListCount: 0 };

  await getTaskStoreState().refreshAll(undefined, { reason: "manual" });

  const current = await getCurrentUser();
  const owner = current.userId;

  // 1) Create lists (if requested)
  let createdDemoListCount = 0;
  const createdListIds: string[] = [];

  if (listCount > 0) {
    const state = getTaskStoreState();
    const baseSortOrder = state.lists.reduce((acc, l) => Math.max(acc, l.sortOrder ?? 0), 0) + 1;
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

    for (let i = 0; i < listCount; i++) {
      const created = await taskmasterApi.createTaskList({
        owner,
        name: `Demo: Extra List ${i + 1} (${stamp})`,
        description: "Added from Settings → Demo Data.",
        sortOrder: baseSortOrder + i,
        isFavorite: false,
        isDemo: true,
      });

      const id = String((created as { id?: unknown } | null | undefined)?.id ?? "");
      if (id) {
        createdDemoListCount += 1;
        createdListIds.push(id);
      }
    }
  }

  // 2) Create tasks (if requested)
  let createdDemoTaskCount = 0;
  if (taskCount > 0) {
    // Prefer newly-created demo lists to distribute tasks; else fall back to any existing demo list.
    const targetListIds = createdListIds.length > 0 ? createdListIds : [await ensureAtLeastOneDemoList(owner)];
    const sortOrderByListId = new Map<string, number>();
    for (const listId of targetListIds) {
      sortOrderByListId.set(listId, nextTaskSortOrderForList(listId));
    }

    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

    const chunkSize = 10;
    for (let i = 0; i < taskCount; i += chunkSize) {
      const chunk = Array.from({ length: Math.min(chunkSize, taskCount - i) }, (_, j) => i + j);
      const results = await Promise.allSettled(
        chunk.map((idx) => {
          const listId = targetListIds[idx % targetListIds.length];
          const nextSort = sortOrderByListId.get(listId) ?? 0;
          sortOrderByListId.set(listId, nextSort + 1);

          return taskmasterApi.createTask({
            owner,
            listId,
            sortOrder: nextSort,
            parentTaskId: null,
            title: `Demo: Extra Task ${idx + 1} (${stamp})`,
            description: "Added from Settings → Demo Data.",
            status: TaskStatus.Open,
            priority: TaskPriority.Medium,
            dueAt: null,
            completedAt: null,
            assigneeId: null,
            tagIds: [],
            isDemo: true,
          });
        })
      );

      for (const r of results) if (r.status === "fulfilled") createdDemoTaskCount += 1;
      const rejected = results.find((r) => r.status === "rejected");
      if (rejected && rejected.status === "rejected") throw rejected.reason;
    }
  }

  await getTaskStoreState().refreshAll(undefined, { reason: "mutation" });
  return { createdDemoTaskCount, createdDemoListCount };
}
