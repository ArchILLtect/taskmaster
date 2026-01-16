import type { Task } from "../types/task";
import { mockTasks } from "../mocks/tasks";
import { taskPatchStore } from "./taskPatchStore";
import { updatesEventStore } from "./updatesEventStore";

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
    const prev = this.getById(taskId)?.status;
    taskPatchStore.setStatus(taskId, status);
    const task = this.getById(taskId);
    if (!task || prev === status) return;

    if (prev === "Open" && status === "Done") {
      updatesEventStore.append({
        type: "task_completed",
        taskId: task.id,
        listId: task.listId,
        title: `Task completed: ${task.title}`,
        parentTaskId: task.parentTaskId ?? null,
      });
    } else if (prev === "Done" && status === "Open") {
      updatesEventStore.append({
        type: "task_reopened",
        taskId: task.id,
        listId: task.listId,
        title: `Task reopened: ${task.title}`,
        parentTaskId: task.parentTaskId ?? null,
      });
    }
  },

  create(data: Partial<Task>): Task {
    const now = new Date().toISOString();
    const listId = data.listId || "default";
    const all = this.getAll();
    const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? `task-${crypto.randomUUID()}`
          : `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const maxSortOrderInList = all
      .filter((t) => t.listId === listId)
      .reduce((acc, t) => Math.max(acc, t.sortOrder), 0);

    const newTask: Task = {
      id,
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
    updatesEventStore.append({
      type: "task_created",
      taskId: newTask.id,
      listId: newTask.listId,
      title: `Task created: ${newTask.title}`,
      parentTaskId: newTask.parentTaskId ?? null,
    });
    return newTask;
  },

  delete(taskId: string) {
    const all = this.getAll();
    const victim = this.getById(taskId);

    if (victim) {
      updatesEventStore.append({
        type: "task_deleted",
        taskId: victim.id,
        listId: victim.listId,
        title: `Task deleted (and subtasks if present): ${victim.title}`,
        parentTaskId: victim.parentTaskId ?? null,
      });
    }

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