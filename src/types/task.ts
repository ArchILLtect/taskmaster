import { TaskStatus, TaskPriority } from "../API";
import type { TaskList } from "./list";

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

export type Task = {
    id: string;
    listId: string;

    sortOrder: number; // lower = higher in list (stable ordering)

    title: string;
    description?: string;
    status: TaskStatus;

    dueAt?: string | null; // ISO string or null = someday
    assigneeId?: string | null; // User ID or null = unassigned
    priority: TaskPriority;
    tagIds: string[]; // Points to Tag objects
    parentTaskId?: string | null; // Points to parent Task ID or null = no parent

    createdAt: string; // ISO string
    updatedAt: string; // ISO string
    completedAt?: string | null; // ISO string or null
};

export type TaskRowProps = {
  task: Task;
  to: string;
  showLists: boolean;
  list: TaskList;

  onMove?: (task: Task) => void | Promise<void>;

  // parent owns API + refresh
  onToggleComplete?: (taskId: string, nextStatus: TaskStatus) => Promise<void> | void;
  onDelete?: (taskId: string) => void;
};

export type SubTaskRowProps = {
  task: Task;
  to: string;

  onMove?: (task: Task) => Promise<void> | void;
  onDelete?: (taskId: string) => void;

  // parent owns API + refresh
  onToggleComplete?: (taskId: string, nextStatus: TaskStatus) => Promise<void> | void;
};

export type TaskDetailsPaneProps = {
  listId: string;
  taskId: string;
  stack: string[];
  tasksInList: Task[];
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
  tasksInList?: Task[];
  newTaskTitle: string;
  setNewTaskTitle: (title: string) => void;
  newTaskDescription: string;
  setNewTaskDescription: (description: string) => void;
  newTaskDueDate: string;
  setNewTaskDueDate: (dueDate: string) => void;
  newTaskPriority: TaskPriority;
  setNewTaskPriority: (priority: TaskPriority) => void;
  setShowAddTaskForm?: (show: boolean) => void;
  navigate: (path: string) => void;
  refresh: () => void;
  parentTaskId?: string | null;
};

export type EditTaskFormProps = {
    task: Task;
    draftTaskTitle: string;
    setDraftTaskTitle: (title: string) => void;
    draftTaskDescription: string;
    setDraftTaskDescription: (description: string) => void;
    draftTaskPriority: TaskPriority;
    setDraftTaskPriority: (priority: TaskPriority) => void;
    draftTaskStatus: TaskStatus;
    setDraftTaskStatus: (status: TaskStatus) => void;
    draftTaskDueDate: string;
    setDraftTaskDueDate: (dueDate: string) => void;
    skipModal?: boolean;
    saving: boolean;
    setSaving: (saving: boolean) => void;
    onSave: (task: Task) => Promise<void> | void;
    onClose: () => void;
    refresh: () => void;
};
