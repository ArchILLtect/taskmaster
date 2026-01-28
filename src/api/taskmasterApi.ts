import { getClient } from "../amplifyClient";
import type { ModelTaskListFilterInput, ModelSortDirection } from "../API";
import { getCurrentUserSub } from "../services/authIdentity";
import type {
  CreateTaskInput,
  CreateTaskListInput,
  DeleteTaskInput,
  DeleteTaskListInput,
  CreateUserProfileInput,
  UpdateUserProfileInput,
  ModelUserProfileConditionInput,
  ModelIntKeyConditionInput,
  UpdateTaskInput,
  UpdateTaskListInput,
} from "../API";

import {
  createTaskListMinimal,
  updateTaskListMinimal,
  deleteTaskListMinimal,
  listTaskListsMinimal,
  getTaskListMinimal,
  createTaskMinimal,
  updateTaskMinimal,
  deleteTaskMinimal,
  tasksByListMinimal,
  getUserProfileMinimal,
  getUserProfileEmailProbeMinimal,
  createUserProfileMinimal,
  updateUserProfileMinimal,
  listUserProfilesMinimal,
  listUserProfilesSafeMinimal,
  // tasksByParentMinimal, // later if needed
} from "./operationsMinimal";
import type { ListTaskListsQuery, ListUserProfilesQuery, TasksByListQuery } from "../API";
import { TaskStatus } from "../API";
import { getInboxListId } from "../config/inboxSettings";
import { useUpdatesStore } from "../store/updatesStore";

type TaskListItem = NonNullable<NonNullable<ListTaskListsQuery["listTaskLists"]>["items"]>[number];
type UserProfileItem = NonNullable<NonNullable<ListUserProfilesQuery["listUserProfiles"]>["items"]>[number];
type TaskItem = NonNullable<NonNullable<TasksByListQuery["tasksByList"]>["items"]>[number];

type CreateTaskListInputClient = Omit<CreateTaskListInput, "owner"> & { owner?: string };
type CreateTaskInputClient = Omit<CreateTaskInput, "owner"> & { owner?: string };

/**
 * Single shared Amplify GraphQL client for the app.
 * (Amplify.configure is done in main.tsx)
 */
type GenQuery<I, O> = string & { __generatedQueryInput: I; __generatedQueryOutput: O };
type GenMutation<I, O> = string & { __generatedMutationInput: I; __generatedMutationOutput: O };

/**
 * Typed GraphQL caller for our minimal GraphQL document strings.
 * Returns the `.data` object (the operation result wrapper), not the whole GraphQL response.
 */
async function runQuery<I, O>(query: GenQuery<I, O>, variables: I): Promise<O> {
  const client = getClient();
  const res = await client.graphql({ query, variables });
  return (res as { data: O }).data;
}
async function runMutation<I, O>(query: GenMutation<I, O>, variables: I): Promise<O> {
  const client = getClient();
  const res = await client.graphql({ query, variables });
  return (res as { data: O }).data;
}

let ownerSubInFlight: Promise<string> | null = null;
let didLogOwnerSub = false;
async function getOwnerSub(): Promise<string> {
  // Share a single in-flight lookup across concurrent createTask/createTaskList calls.
  if (ownerSubInFlight) return ownerSubInFlight;

  ownerSubInFlight = (async () => {
    return await getCurrentUserSub();
  })();

  try {
    const sub = await ownerSubInFlight;

    if (import.meta.env.DEV && !didLogOwnerSub) {
      didLogOwnerSub = true;
      console.debug(`[taskmasterApi] resolved owner(sub)=${sub}`);
    }

    return sub;
  } finally {
    ownerSubInFlight = null;
  }
}

/**
 * Small helper for pagination if/when you need it.
 */
export type Page<T> = { items: T[]; nextToken?: string | null };

function toPage<T>(conn: { items?: (T | null)[] | null; nextToken?: string | null } | null | undefined): Page<T> {
  return {
    items: (conn?.items ?? []).filter(Boolean) as T[],
    nextToken: conn?.nextToken ?? null,
  };
}

/**
 * API surface: keep it boring and predictable.
 * Pages should call these methods instead of client.graphql directly.
 * 
 * TODO Tighten the typing
 * Later once the first page conversion is done (priority: ship > perfection).
 * For now, 'any' is used in a few places to get things working.
 */
export const taskmasterApi = {
  // -----------------------------
  // UserProfile
  // -----------------------------
  /* eslint-disable @typescript-eslint/no-explicit-any */
  async getUserProfile(id: string) {
    const data = await runQuery(getUserProfileMinimal as any, { id });
    return (data as any).getUserProfile ?? null;
  },

  /* eslint-disable @typescript-eslint/no-explicit-any */
  async getUserProfileEmailProbe(id: string) {
    const data = await runQuery(getUserProfileEmailProbeMinimal as any, { id });
    return (data as any).getUserProfile ?? null;
  },

  /* eslint-disable @typescript-eslint/no-explicit-any */
  async createUserProfile(input: CreateUserProfileInput) {
    const data = await runMutation(createUserProfileMinimal as any, { input });
    return (data as any).createUserProfile;
  },

  /* eslint-disable @typescript-eslint/no-explicit-any */
  async updateUserProfile(input: UpdateUserProfileInput, condition?: ModelUserProfileConditionInput | null) {
    const data = await runMutation(updateUserProfileMinimal as any, { input, condition: condition ?? null });
    return (data as any).updateUserProfile;
  },

  async listUserProfiles(opts?: {
    id?: string | null;
    filter?: import("../API").ModelUserProfileFilterInput | null;
    limit?: number;
    nextToken?: string | null;
    sortDirection?: import("../API").ModelSortDirection | null;
  }): Promise<Page<UserProfileItem>> {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const data = await runQuery(listUserProfilesMinimal as any, {
      id: opts?.id ?? null,
      filter: opts?.filter ?? null,
      sortDirection: opts?.sortDirection ?? null,
      limit: opts?.limit ?? 50,
      nextToken: opts?.nextToken ?? null,
    });

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const conn = (data as any).listUserProfiles as ListUserProfilesQuery["listUserProfiles"];
    return toPage<UserProfileItem>(conn);
  },

  async listUserProfilesSafe(opts?: {
    id?: string | null;
    filter?: import("../API").ModelUserProfileFilterInput | null;
    limit?: number;
    nextToken?: string | null;
    sortDirection?: import("../API").ModelSortDirection | null;
  }): Promise<Page<UserProfileItem>> {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const data = await runQuery(listUserProfilesSafeMinimal as any, {
      id: opts?.id ?? null,
      filter: opts?.filter ?? null,
      sortDirection: opts?.sortDirection ?? null,
      limit: opts?.limit ?? 50,
      nextToken: opts?.nextToken ?? null,
    });

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const conn = (data as any).listUserProfiles as ListUserProfilesQuery["listUserProfiles"];
    return toPage<UserProfileItem>(conn);
  },

  // -----------------------------
  // TaskLists
  // -----------------------------
  async listTaskLists(opts?: {
    id?: string | null;
    filter?: ModelTaskListFilterInput | null;
    limit?: number;
    nextToken?: string | null;
    sortDirection?: ModelSortDirection | null;
  }): Promise<Page<TaskListItem>> {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const data = await runQuery(listTaskListsMinimal as any, {
      id: opts?.id ?? null,
      filter: opts?.filter ?? null,
      sortDirection: opts?.sortDirection ?? null,
      limit: opts?.limit ?? 50,
      nextToken: opts?.nextToken ?? null,
    });

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const conn = (data as any).listTaskLists as ListTaskListsQuery["listTaskLists"];
    return toPage<TaskListItem>(conn);
  },

  async listTaskListsOwned(opts?: {
    limit?: number;
    nextToken?: string | null;
    ownerSub?: string;
  }): Promise<Page<TaskListItem>> {
    const owner = opts?.ownerSub ?? (await getOwnerSub());
    return await this.listTaskLists({
      limit: opts?.limit,
      nextToken: opts?.nextToken,
      filter: { owner: { eq: owner } },
    });
  },

  /* eslint-disable @typescript-eslint/no-explicit-any */
  async getTaskList(id: string) {
    const data = await runQuery(getTaskListMinimal as any, { id });
    return (data as any).getTaskList ?? null;
  },

  /* eslint-disable @typescript-eslint/no-explicit-any */
  async createTaskList(input: CreateTaskListInputClient) {
    const owner = input.owner ?? (await getOwnerSub());
    const data = await runMutation(createTaskListMinimal as any, { input: { ...input, owner } });
    return (data as any).createTaskList;
  },

  /* eslint-disable @typescript-eslint/no-explicit-any */
  async updateTaskList(input: UpdateTaskListInput) {
    const data = await runMutation(updateTaskListMinimal as any, { input });
    return (data as any).updateTaskList;
  },

  /* eslint-disable @typescript-eslint/no-explicit-any */
  async deleteTaskList(input: DeleteTaskListInput) {
    const data = await runMutation(deleteTaskListMinimal as any, { input });
    return (data as any).deleteTaskList;
  },

  async deleteTaskListSafeById(listId: string) {
    const inboxId = getInboxListId();
    if (inboxId && listId === inboxId) return;
    return await this.deleteTaskList({ id: listId });
  },

  // -----------------------------
  // Tasks
  // -----------------------------
  async tasksByList(opts: {
    listId: string;
    sortOrder?: ModelIntKeyConditionInput;
    sortDirection?: ModelSortDirection;
    limit?: number;
    nextToken?: string | null;
  }): Promise<Page<TaskItem>> {
      /* eslint-disable @typescript-eslint/no-explicit-any */
    const data = await runQuery(tasksByListMinimal as any, {
      listId: opts.listId,
      sortOrder: opts.sortOrder ?? { ge: 0 },
      sortDirection: opts.sortDirection,
      limit: opts.limit ?? 200,
      nextToken: opts.nextToken ?? null,
    });

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const conn = (data as any).tasksByList as TasksByListQuery["tasksByList"];
    return toPage<TaskItem>(conn);
  },

  /* eslint-disable @typescript-eslint/no-explicit-any */
  async createTask(input: CreateTaskInputClient) {
    const owner = input.owner ?? (await getOwnerSub());
    const data = await runMutation(createTaskMinimal as any, { input: { ...input, owner } });
    const created = (data as any).createTask;

    if (created?.id && created?.listId) {
      useUpdatesStore.getState().addEvent({
        type: "task_created",
        taskId: created.id,
        listId: created.listId,
        title: `Task created: ${created.title ?? "(untitled)"}`,
        parentTaskId: created.parentTaskId ?? null,
      });
    }

    return created;
  },

  /* eslint-disable @typescript-eslint/no-explicit-any */
  async updateTask(input: UpdateTaskInput) {
    const data = await runMutation(updateTaskMinimal as any, { input });
    const updated = (data as any).updateTask;

    if (updated?.id && updated?.listId) {
      const hasOwn = (k: keyof UpdateTaskInput) => Object.prototype.hasOwnProperty.call(input, k);

      // Many UI “edit task” forms submit status + completedAt even when status didn’t change.
      // So we only emit completed/reopened when the update appears to be status-only.
      const hasContentFields =
        hasOwn("title") ||
        hasOwn("description") ||
        hasOwn("priority") ||
        hasOwn("dueAt") ||
        hasOwn("assigneeId") ||
        hasOwn("tagIds");

      const hasMoveFields = hasOwn("listId") || hasOwn("parentTaskId") || hasOwn("sortOrder");

      const isStatusOnly = hasOwn("status") && !hasContentFields && !hasMoveFields;
      const isMoveOnly = !hasOwn("status") && hasMoveFields && !hasContentFields;

      const type: "task_completed" | "task_reopened" | "task_updated" = isStatusOnly
        ? input.status === TaskStatus.Done
          ? "task_completed"
          : input.status === TaskStatus.Open
            ? "task_reopened"
            : "task_updated"
        : "task_updated";

      const prefix = isMoveOnly ? "Task moved" : type === "task_completed"
        ? "Task completed"
        : type === "task_reopened"
          ? "Task reopened"
          : "Task updated";

      useUpdatesStore.getState().addEvent({
        type,
        taskId: updated.id,
        listId: updated.listId,
        title: `${prefix}: ${updated.title ?? "(untitled)"}`,
        parentTaskId: updated.parentTaskId ?? null,
      });
    }

    return updated;
  },

  /* eslint-disable @typescript-eslint/no-explicit-any */
  async deleteTask(input: DeleteTaskInput) {
    const data = await runMutation(deleteTaskMinimal as any, { input });
    const deleted = (data as any).deleteTask;

    // Note: delete mutation selection set must include listId/title for this to be informative.
    if (deleted?.id && deleted?.listId) {
      useUpdatesStore.getState().addEvent({
        type: "task_deleted",
        taskId: deleted.id,
        listId: deleted.listId,
        title: `Task deleted: ${deleted.title ?? "(untitled)"}`,
        parentTaskId: deleted.parentTaskId ?? null,
      });
    } else if (input?.id) {
      // Fallback: still record something, even if the mutation didn't return enough data.
      useUpdatesStore.getState().addEvent({
        type: "task_deleted",
        taskId: input.id,
        listId: "unknown",
        title: "Task deleted",
        parentTaskId: null,
      });
    }

    return deleted;
  },

  async setTaskStatus(taskId: string, status: TaskStatus ) {
    const now = new Date().toISOString();
    return await this.updateTask({
      id: taskId,
      status,
      completedAt: status === TaskStatus.Done ? now : null,
    });
  },

  // -----------------------------
  // Helpers
  // -----------------------------

  async moveTaskToList(taskId: string, targetListId: string, opts?: { sortOrder?: number }) {
    return await this.updateTask({
      id: taskId,
      listId: targetListId,
      parentTaskId: null,
      sortOrder: opts?.sortOrder ?? 0, // see note below
    });
  },

  async sendTaskToInbox(taskId: string) {
    const inboxId = getInboxListId();
    if (!inboxId) return;
    return await this.moveTaskToList(taskId, inboxId);
  },

};
