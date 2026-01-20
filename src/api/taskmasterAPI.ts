import { generateClient } from "aws-amplify/api";
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

/**
 * Single shared Amplify GraphQL client for the app.
 * (Amplify.configure is done in main.tsx)
 */
const client = generateClient();

type GenQuery<I, O> = string & { __generatedQueryInput: I; __generatedQueryOutput: O };
type GenMutation<I, O> = string & { __generatedMutationInput: I; __generatedMutationOutput: O };

/**
 * Typed GraphQL caller for Amplify codegen operations.ts strings.
 * Returns the `.data` object (the operation result wrapper), not the whole GraphQL response.
 */
async function runQuery<I, O>(query: GenQuery<I, O>, variables: I): Promise<O> {
  const res = (await client.graphql({ query, variables })) as { data: O };
  return res.data;
}
async function runMutation<I, O>(query: GenMutation<I, O>, variables: I): Promise<O> {
  const res = (await client.graphql({ query, variables })) as { data: O };
  return res.data;
}

/**
 * Small helper for pagination if/when you need it.
 */
export type Page<T> = { items: T[]; nextToken?: string | null };

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
  async listTaskLists(opts?: { limit?: number; nextToken?: string | null }) {
    const data = await runQuery(listTaskListsMinimal as any, {
      limit: opts?.limit ?? 50,
      nextToken: opts?.nextToken ?? null,
    });

    const conn = (data as any).listTaskLists;
    return {
      items: (conn?.items ?? []).filter(Boolean),
      nextToken: conn?.nextToken ?? null,
    } satisfies Page<any>;
  },

  async getTaskList(id: string) {
    const data = await runQuery(getTaskListMinimal as any, { id });
    return (data as any).getTaskList ?? null;
  },

  async createTaskList(input: CreateTaskListInput) {
    const data = await runMutation(createTaskListMinimal as any, { input });
    return (data as any).createTaskList;
  },

  async updateTaskList(input: UpdateTaskListInput) {
    const data = await runMutation(updateTaskListMinimal as any, { input });
    return (data as any).updateTaskList;
  },

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
  }) {
    const data = await runQuery(tasksByListMinimal as any, {
      listId: opts.listId,
      sortOrder: opts.sortOrder ?? { ge: 0 },
      sortDirection: opts.sortDirection,
      limit: opts.limit ?? 200,
      nextToken: opts.nextToken ?? null,
    });

    const conn = (data as any).tasksByList;
    return {
      items: (conn?.items ?? []).filter(Boolean),
      nextToken: conn?.nextToken ?? null,
    } satisfies Page<any>;
  },

  async createTask(input: CreateTaskInput) {
    const data = await runMutation(createTaskMinimal as any, { input });
    return (data as any).createTask;
  },

  async updateTask(input: UpdateTaskInput) {
    const data = await runMutation(updateTaskMinimal as any, { input });
    return (data as any).updateTask;
  },

  async deleteTask(input: DeleteTaskInput) {
    const data = await runMutation(deleteTaskMinimal as any, { input });
    return (data as any).deleteTask;
  },
};