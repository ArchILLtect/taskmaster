import type { TaskPriority, TaskStatus } from "../API";
import type { TaskUI } from "../types/task";
import type { ListUI } from "../types/list";

/*
* Map from GraphQL types (from AppSync) to local types
* This is useful to decouple the rest of the app from the GraphQL schema
* and to handle any necessary transformations
* For example, if the GraphQL schema changes, only this file needs to be updated
* rather than the entire app.
* Also, it allows for easier testing and mocking of data in the app.
* Use export function mapTaskList(g: GqlTaskList): TaskList { ... } and
* export function mapTask(g: GqlTask): Task { ... } when the types are re-introduced
*/

// API shapes are often "selection set" objects (not necessarily the full generated model types).
// Keep these structural so callers can pass query items directly.
type ApiListLike = {
  id: string;
  name: string;
  isFavorite: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  description?: string | null;
};

type ApiTaskLike = {
  id: string;
  listId: string;
  sortOrder: number;
  parentTaskId?: string | null;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt?: string | null;
  completedAt?: string | null;
  assigneeId?: string | null;
  tagIds?: string[];
  createdAt: string;
  updatedAt: string;
};

export function toListUI(apiList: ApiListLike): ListUI {
  return {
    id: apiList.id,
    name: apiList.name,
    description: apiList.description ?? null,
    isFavorite: apiList.isFavorite,
    sortOrder: apiList.sortOrder,
    createdAt: apiList.createdAt,
    updatedAt: apiList.updatedAt,
  };
}

export function toTaskUI(apiTask: ApiTaskLike): TaskUI {
  return {
    id: apiTask.id,
    listId: apiTask.listId,
    sortOrder: apiTask.sortOrder,
    parentTaskId: apiTask.parentTaskId ?? null,
    title: apiTask.title,
    description: apiTask.description ?? null,
    status: apiTask.status,
    priority: apiTask.priority,
    dueAt: apiTask.dueAt ?? null,
    completedAt: apiTask.completedAt ?? null,
    assigneeId: apiTask.assigneeId ?? null,
    tagIds: apiTask.tagIds ?? [],
    createdAt: apiTask.createdAt,
    updatedAt: apiTask.updatedAt,
  };
}

// Back-compat exports (older code calls mapTask/mapTaskList)
/* eslint-disable @typescript-eslint/no-explicit-any */
export function mapTaskList(g: any) {
  return toListUI(g as ApiListLike);
}
export function mapTask(g: any) {
  return toTaskUI(g as ApiTaskLike);
}