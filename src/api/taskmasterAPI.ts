import { getClient } from "../amplifyClient";
import type {
  CreateTaskInput,
  CreateTaskListInput,
  DeleteTaskInput,
  DeleteTaskListInput,
  ModelIntKeyConditionInput,
  ModelSortDirection,
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
  // tasksByParentMinimal, // later if needed
} from "../graphql/operations";
import type { ListTaskListsQuery, TasksByListQuery } from "../API";

type TaskListItem = NonNullable<NonNullable<ListTaskListsQuery["listTaskLists"]>["items"]>[number];
type TaskItem = NonNullable<NonNullable<TasksByListQuery["tasksByList"]>["items"]>[number];


/**
 * Single shared Amplify GraphQL client for the app.
 * (Amplify.configure is done in main.tsx)
 */


type GenQuery<I, O> = string & { __generatedQueryInput: I; __generatedQueryOutput: O };
type GenMutation<I, O> = string & { __generatedMutationInput: I; __generatedMutationOutput: O };

/**
 * Typed GraphQL caller for Amplify codegen operations.ts strings.
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
  // TaskLists
  // -----------------------------
  async listTaskLists(opts?: { limit?: number; nextToken?: string | null }): Promise<Page<TaskListItem>> {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const data = await runQuery(listTaskListsMinimal as any, {
      limit: opts?.limit ?? 50,
      nextToken: opts?.nextToken ?? null,
    });

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const conn = (data as any).listTaskLists as ListTaskListsQuery["listTaskLists"];
    return toPage<TaskListItem>(conn);
  },

  /* eslint-disable @typescript-eslint/no-explicit-any */
  async getTaskList(id: string) {
    const data = await runQuery(getTaskListMinimal as any, { id });
    return (data as any).getTaskList ?? null;
  },

  /* eslint-disable @typescript-eslint/no-explicit-any */
  async createTaskList(input: CreateTaskListInput) {
    const data = await runMutation(createTaskListMinimal as any, { input });
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
  async createTask(input: CreateTaskInput) {
    const data = await runMutation(createTaskMinimal as any, { input });
    return (data as any).createTask;
  },

  /* eslint-disable @typescript-eslint/no-explicit-any */
  async updateTask(input: UpdateTaskInput) {
    const data = await runMutation(updateTaskMinimal as any, { input });
    return (data as any).updateTask;
  },

  /* eslint-disable @typescript-eslint/no-explicit-any */
  async deleteTask(input: DeleteTaskInput) {
    const data = await runMutation(deleteTaskMinimal as any, { input });
    return (data as any).deleteTask;
  },
};