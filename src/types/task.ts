import { TaskStatus, TaskPriority } from "../API";
import type { ListUI } from "./list";

// export type Priority = "Low" | "Medium" | "High";
// export type TaskStatus = "Open" | "Done";

export type Tag = {
    id: string;
    name: string;
    color?: string;
};

export type Assignee = {
    id: string;
    name: string;
};

export type SubTask = {
    id: string;
};

// Stable UI-level task type (do not depend on generated API model types)
export type TaskUI = {
  id: string;
  listId: string;

  sortOrder: number; // lower = higher in list (stable ordering)
  parentTaskId?: string | null;

  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;

  dueAt?: string | null; // ISO string or null = someday
  completedAt?: string | null; // ISO string or null
  assigneeId?: string | null; // User ID or null = unassigned
  tagIds: string[];

  // Schema field (required)
  isDemo: boolean;

  createdAt: string; // ISO string
  updatedAt: string; // ISO string
};

export type TaskRowProps = {
  task: TaskUI;
  to: string;
  showLists: boolean;
  list: ListUI;

  onMove?: (task: TaskUI) => void | Promise<void>;

  // parent owns API + refresh
  onToggleComplete?: (taskId: string, nextStatus: TaskStatus) => Promise<void> | void;
  onDelete?: (taskId: string) => void;
};

export type SubTaskRowProps = {
  task: TaskUI;
  to: string;

  onMove?: (task: TaskUI) => Promise<void> | void;
  onDelete?: (taskId: string) => void;

  // parent owns API + refresh
  onToggleComplete?: (taskId: string, nextStatus: TaskStatus) => Promise<void> | void;
};

export type TaskDetailsPaneProps = {
  listId: string;
  taskId: string;
  stack: string[];
  tasksInList: TaskUI[];
  isPulsing?: boolean;
  newTaskTitle: string;
  newTaskDescription: string;
  newTaskDueDate: string;
  newTaskPriority: TaskPriority;
  setNewTaskTitle: (title: string) => void;
  setNewTaskDescription: (description: string) => void;
  setNewTaskDueDate: (dueDate: string) => void;
  setNewTaskPriority: (priority: TaskPriority) => void;
  refresh: () => void;
  navigate: (path: string) => void;
  onCloseAll: () => void;
  onDelete?: (taskId: string) => void;
};

export type AddTaskFormProps = {
  listId?: string;
  stack?: string[];
  tasksInList?: TaskUI[];
  newTaskTitle: string;
  setNewTaskTitle: (title: string) => void;
  newTaskDescription: string;
  setNewTaskDescription: (description: string) => void;
  newTaskDueDate: string;
  setNewTaskDueDate: (dueDate: string) => void;
  newTaskPriority: TaskPriority;
  setNewTaskPriority: (priority: TaskPriority) => void;
  navigate: (path: string) => void;
  parentTaskId?: string | null;

  onCreated?: (created: { id: string; listId: string }) => void;
  onSavingChange?: (saving: boolean) => void;
};

export type EditTaskFormProps = {
  task: TaskUI;
    draftTaskTitle: string;
    setDraftTaskTitle: (title: string) => void;
    draftTaskDescription: string;
    setDraftTaskDescription: (description: string) => void;
    draftTaskListId: string;
    setDraftTaskListId: (listId: string) => void;
    draftTaskPriority: TaskPriority;
    setDraftTaskPriority: (priority: TaskPriority) => void;
    draftTaskStatus: TaskStatus;
    setDraftTaskStatus: (status: TaskStatus) => void;
    draftTaskDueDate: string;
    setDraftTaskDueDate: (dueDate: string) => void;
    skipModal?: boolean;
    saving: boolean;
    setSaving: (saving: boolean) => void;
    onSave: (task: TaskUI) => Promise<void> | void;
    onClose: () => void;
    refresh: () => void;
};
