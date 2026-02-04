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
  listTaskListsAdminMinimal,
  getTaskListMinimal,
  createTaskMinimal,
  updateTaskMinimal,
  deleteTaskMinimal,
  tasksByListMinimal,
  tasksByListAdminMinimal,
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

function errorToMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (typeof err === "object" && err !== null) {
    if ("errors" in err && Array.isArray((err as { errors?: unknown }).errors)) {
      const errors = (err as { errors: Array<{ message?: unknown; errorType?: unknown }> }).errors;
      const messages = errors
        .map((e) => {
          const msg = typeof e?.message === "string" ? e.message : "Unknown GraphQL error";
          const type = typeof e?.errorType === "string" ? e.errorType : "";
          return type ? `${msg} (${type})` : msg;
        })
        .filter(Boolean);
      if (messages.length) return messages.join("; ");
    }

    if ("message" in err) return String((err as { message: unknown }).message);
  }
  return "Unknown error";
}

function shouldFallbackMissingIsDemo(err: unknown): boolean {
  const msg = errorToMessage(err);
  return msg.includes("Cannot return null for non-nullable type") && msg.includes("isDemo");
}

type TaskListItem = NonNullable<NonNullable<ListTaskListsQuery["listTaskLists"]>["items"]>[number];
type UserProfileItem = NonNullable<NonNullable<ListUserProfilesQuery["listUserProfiles"]>["items"]>[number];
type TaskItem = NonNullable<NonNullable<TasksByListQuery["tasksByList"]>["items"]>[number];

type CreateTaskListInputClient = Omit<CreateTaskListInput, "owner"> & { owner?: string };
type CreateTaskInputClient = Omit<CreateTaskInput, "owner"> & { owner?: string };

function stripOwnerField<T extends Record<string, unknown>>(input: T): Omit<T, "owner"> {
  // Defense-in-depth: never allow client code to send `owner` in *update* mutation inputs.
  // Ownership should not be transferable via client payloads.
  const { owner: _owner, ...rest } = input as T & { owner?: unknown };
  return rest;
}

// The operation documents in `operationsMinimal.ts` are typed as branded strings.
// Use those brands to infer variable + result types without any casts.
type GenQuery<I, O> = string & { __generatedQueryInput: I; __generatedQueryOutput: O };
type GenMutation<I, O> = string & { __generatedMutationInput: I; __generatedMutationOutput: O };

async function runQuery<I, O>(query: GenQuery<I, O>, variables: I): Promise<O> {
  const client = getClient();
  const res = await client.graphql<O, I>({ query, variables });
  return res.data as O;
}

async function runMutation<I, O>(query: GenMutation<I, O>, variables: I): Promise<O> {
  const client = getClient();
  const res = await client.graphql<O, I>({ query, variables });
  return res.data as O;
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
 */
export const taskmasterApi = {
  // -----------------------------
  // UserProfile
  // -----------------------------
  async getUserProfile(id: string) {
    const data = await runQuery(getUserProfileMinimal, { id });
    return data.getUserProfile ?? null;
  },

  async getUserProfileEmailProbe(id: string) {
    const data = await runQuery(getUserProfileEmailProbeMinimal, { id });
    return data.getUserProfile ?? null;
  },

  async createUserProfile(input: CreateUserProfileInput) {
    const data = await runMutation(createUserProfileMinimal, { input });
    return data.createUserProfile;
  },

  async updateUserProfile(input: UpdateUserProfileInput, condition?: ModelUserProfileConditionInput | null) {
    const data = await runMutation(updateUserProfileMinimal, {
      input: stripOwnerField(input),
      condition: condition ?? null,
    });
    return data.updateUserProfile;
  },

  async listUserProfiles(opts?: {
    id?: string | null;
    filter?: import("../API").ModelUserProfileFilterInput | null;
    limit?: number;
    nextToken?: string | null;
    sortDirection?: import("../API").ModelSortDirection | null;
  }): Promise<Page<UserProfileItem>> {
    const data = await runQuery(listUserProfilesMinimal, {
      id: opts?.id ?? null,
      filter: opts?.filter ?? null,
      sortDirection: opts?.sortDirection ?? null,
      limit: opts?.limit ?? 50,
      nextToken: opts?.nextToken ?? null,
    });

    const conn = data.listUserProfiles;
    return toPage<UserProfileItem>(conn);
  },

  async listUserProfilesSafe(opts?: {
    id?: string | null;
    filter?: import("../API").ModelUserProfileFilterInput | null;
    limit?: number;
    nextToken?: string | null;
    sortDirection?: import("../API").ModelSortDirection | null;
  }): Promise<Page<UserProfileItem>> {
    const data = await runQuery(listUserProfilesSafeMinimal, {
      id: opts?.id ?? null,
      filter: opts?.filter ?? null,
      sortDirection: opts?.sortDirection ?? null,
      limit: opts?.limit ?? 50,
      nextToken: opts?.nextToken ?? null,
    });

    const conn = data.listUserProfiles;
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
    // Prefer including `isDemo` so the normal UI can accurately mark demo data.
    // If legacy records are missing the now-required `isDemo`, fall back to a safe query
    // that omits it (otherwise the whole query can hard-fail).
    let data: unknown;
    try {
      data = await runQuery(listTaskListsAdminMinimal, {
        id: opts?.id ?? null,
        filter: opts?.filter ?? null,
        sortDirection: opts?.sortDirection ?? null,
        limit: opts?.limit ?? 50,
        nextToken: opts?.nextToken ?? null,
      });
    } catch (err) {
      if (!shouldFallbackMissingIsDemo(err)) throw err;
      data = await runQuery(listTaskListsMinimal, {
        id: opts?.id ?? null,
        filter: opts?.filter ?? null,
        sortDirection: opts?.sortDirection ?? null,
        limit: opts?.limit ?? 50,
        nextToken: opts?.nextToken ?? null,
      });
    }

    const conn = (data as ListTaskListsQuery).listTaskLists;
    return toPage<TaskListItem>(conn);
  },

  // Admin-only: includes `isDemo` in selection set.
  async listTaskListsAdmin(opts?: {
    id?: string | null;
    filter?: ModelTaskListFilterInput | null;
    limit?: number;
    nextToken?: string | null;
    sortDirection?: ModelSortDirection | null;
  }): Promise<Page<TaskListItem>> {
    const data = await runQuery(listTaskListsAdminMinimal, {
      id: opts?.id ?? null,
      filter: opts?.filter ?? null,
      sortDirection: opts?.sortDirection ?? null,
      limit: opts?.limit ?? 50,
      nextToken: opts?.nextToken ?? null,
    });

    const conn = data.listTaskLists;
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

  async listTaskListsOwnedAdmin(opts?: {
    limit?: number;
    nextToken?: string | null;
    ownerSub?: string;
  }): Promise<Page<TaskListItem>> {
    const owner = opts?.ownerSub ?? (await getOwnerSub());
    return await this.listTaskListsAdmin({
      limit: opts?.limit,
      nextToken: opts?.nextToken,
      filter: { owner: { eq: owner } },
    });
  },

  async getTaskList(id: string) {
    const data = await runQuery(getTaskListMinimal, { id });
    return data.getTaskList ?? null;
  },

  async createTaskList(input: CreateTaskListInputClient) {
    const owner = input.owner ?? (await getOwnerSub());
    const data = await runMutation(createTaskListMinimal, { input: { ...input, owner } });
    return data.createTaskList;
  },

  async updateTaskList(input: UpdateTaskListInput) {
    const data = await runMutation(updateTaskListMinimal, { input: stripOwnerField(input) });
    return data.updateTaskList;
  },

  async deleteTaskList(input: DeleteTaskListInput) {
    const data = await runMutation(deleteTaskListMinimal, { input });
    return data.deleteTaskList;
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
    // Prefer including `isDemo` so the normal UI can accurately mark demo tasks.
    // If legacy records are missing the now-required `isDemo`, fall back to a safe query
    // that omits it (otherwise the whole query can hard-fail).
    let data: unknown;
    try {
      data = await runQuery(tasksByListAdminMinimal, {
        listId: opts.listId,
        sortOrder: opts.sortOrder ?? { ge: 0 },
        sortDirection: opts.sortDirection,
        limit: opts.limit ?? 200,
        nextToken: opts.nextToken ?? null,
      });
    } catch (err) {
      if (!shouldFallbackMissingIsDemo(err)) throw err;
      data = await runQuery(tasksByListMinimal, {
        listId: opts.listId,
        sortOrder: opts.sortOrder ?? { ge: 0 },
        sortDirection: opts.sortDirection,
        limit: opts.limit ?? 200,
        nextToken: opts.nextToken ?? null,
      });
    }

    const conn = (data as TasksByListQuery).tasksByList;
    return toPage<TaskItem>(conn);
  },

  // Admin-only: includes `isDemo` in selection set.
  async tasksByListAdmin(opts: {
    listId: string;
    sortOrder?: ModelIntKeyConditionInput;
    sortDirection?: ModelSortDirection;
    limit?: number;
    nextToken?: string | null;
  }): Promise<Page<TaskItem>> {
    const data = await runQuery(tasksByListAdminMinimal, {
      listId: opts.listId,
      sortOrder: opts.sortOrder ?? { ge: 0 },
      sortDirection: opts.sortDirection,
      limit: opts.limit ?? 200,
      nextToken: opts.nextToken ?? null,
    });

    const conn = data.tasksByList;
    return toPage<TaskItem>(conn);
  },

  async createTask(input: CreateTaskInputClient) {
    const owner = input.owner ?? (await getOwnerSub());
    const data = await runMutation(createTaskMinimal, { input: { ...input, owner } });
    const created = data.createTask;

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

  async updateTask(input: UpdateTaskInput) {
    const data = await runMutation(updateTaskMinimal, { input: stripOwnerField(input) });
    const updated = data.updateTask;

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

  async deleteTask(input: DeleteTaskInput) {
    const data = await runMutation(deleteTaskMinimal, { input });
    const deleted = data.deleteTask;

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
