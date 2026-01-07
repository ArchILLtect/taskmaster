import type { Task } from "../types/task";
import { mockTasks } from "../mocks/tasks";

export const taskService = {
  getAll(): Task[] {
    return mockTasks;
  },

  getByListId(listId: string): Task[] {
    return mockTasks.filter((t) => t.listId === listId);
  },

  getById(taskId: string): Task | undefined {
    return mockTasks.find((t) => t.id === taskId);
  },

  getChildren(tasks: Task[], parentId: string): Task[] {
    return tasks
      .filter((t) => t.parentTaskId === parentId)
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },

  getTopLevel(tasks: Task[]): Task[] {
    return tasks
      .filter((t) => t.parentTaskId == null)
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },
};