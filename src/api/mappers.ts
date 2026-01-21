// TODO Re-introduce these types later to make the mapper more explicit
// import type { Task as GqlTask, TaskList as GqlTaskList } from "../API";
import type { Task } from "../types/task";
import type { TaskList } from "../types/list";

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

// Map GraphQL TaskList to local TaskList type
/* eslint-disable @typescript-eslint/no-explicit-any */
export function mapTaskList(g: any): TaskList {
  // g is the object returned by AppSync (has fields + __typename sometimes)
  return {
    id: g.id,
    name: g.name,
    isFavorite: g.isFavorite,
    sortOrder: g.sortOrder,
    createdAt: g.createdAt,
    updatedAt: g.updatedAt,
  };
}

// Map GraphQL Task to local Task type
/* eslint-disable @typescript-eslint/no-explicit-any */
export function mapTask(g: any): Task {
  // g is the object returned by AppSync (has fields + __typename sometimes)
  return {
    id: g.id,
    listId: g.listId,
    sortOrder: g.sortOrder,
    parentTaskId: g.parentTaskId ?? null,
    title: g.title,
    description: g.description ?? "",
    status: g.status,     // should match your union/enum strings
    priority: g.priority, // same
    dueAt: g.dueAt ?? null,
    completedAt: g.completedAt ?? null,
    assigneeId: g.assigneeId ?? null,
    tagIds: g.tagIds ?? [],
    createdAt: g.createdAt,
    updatedAt: g.updatedAt,
  };
}