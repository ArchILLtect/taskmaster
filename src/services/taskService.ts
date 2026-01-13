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
    const all = this.getAll();
    const newTask: Task = {
      id: `task-${Date.now()}`,
      listId: data.listId || "default",
      parentTaskId: data.parentTaskId || null,
      title: data.title || "New Task",
      description: data.description || "",
      status: data.status || null,
      priority: data.priority || "Medium",
      tagIds: data.tagIds || [],
      dueAt: data.dueAt || null,
      completedAt: data.completedAt || null,
      sortOrder: data.sortOrder || all.filter(t => t.listId === (data.listId || "default") && t.parentTaskId === (data.parentTaskId || null)).length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    taskPatchStore.addPatch({
      type: "create",
      task: newTask,
    });

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