import type { Task } from "../types/task";
import { mockTasks } from "../mocks/tasks";
import { taskPatchStore } from "./taskPatchStore";

export const taskService = {
  getAll(): Task[] {
    return taskPatchStore.applyAll(mockTasks);
  },

  getByListId(listId: string): Task[] {
    return this.getAll().filter((t) => t.listId === listId);
  },

  getById(taskId: string): Task | undefined {
    return this.getAll().find((t) => t.id === taskId);
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

  setStatus(taskId: string, status: Task["status"]) {
    taskPatchStore.setStatus(taskId, status);
  },

  create(data: Partial<Task>): Task {
    const now = new Date().toISOString();
    const listId = data.listId || "default";
    const all = this.getAll();

    const maxSortOrderInList = all
      .filter((t) => t.listId === listId)
      .reduce((acc, t) => Math.max(acc, t.sortOrder), 0);

    const newTask: Task = {
      id: `task-${Date.now()}`,
      listId,
      parentTaskId: data.parentTaskId ?? null,
      title: data.title || "New Task",
      description: data.description || "",
      status: (data.status ?? "Open"),
      priority: data.priority || "Medium",
      tagIds: data.tagIds || [],
      dueAt: data.dueAt ?? null,
      completedAt: null,
      sortOrder: data.sortOrder ?? (maxSortOrderInList + 1),
      createdAt: now,
      updatedAt: now,
    };

    taskPatchStore.addCreated(newTask);
    return newTask;
  },

  delete(taskId: string) {
    const all = this.getAll();

    const toDelete = new Set<string>();
    const visit = (id: string) => {
      if (toDelete.has(id)) return;
      toDelete.add(id);
      for (const child of all.filter(t => t.parentTaskId === id)) {
        visit(child.id);
      }
    };

    visit(taskId);
    taskPatchStore.deleteIds([...toDelete]);
  },
};