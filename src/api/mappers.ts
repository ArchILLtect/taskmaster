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
export function mapTaskList(list: TaskList): TaskList {
  // g is the object returned by AppSync (has fields + __typename sometimes)
  return {
    id: list.id,
    name: list.name,
    isFavorite: list.isFavorite,
    sortOrder: list.sortOrder,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
  };
}

// Map GraphQL Task to local Task type
/* eslint-disable @typescript-eslint/no-explicit-any */
export function mapTask(task: Task): Task {
  // g is the object returned by AppSync (has fields + __typename sometimes)
  return {
    id: task.id,
    listId: task.listId,
    sortOrder: task.sortOrder,
    parentTaskId: task.parentTaskId ?? null,
    title: task.title,
    description: task.description ?? "",
    status: task.status,     // should match your union/enum strings
    priority: task.priority, // same
    dueAt: task.dueAt ?? null,
    completedAt: task.completedAt ?? null,
    assigneeId: task.assigneeId ?? null,
    tagIds: task.tagIds ?? [],
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}