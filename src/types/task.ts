import { TaskStatus, TaskPriority } from "../API";

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
  listName?: string;

  onDelete?: (taskId: string) => void;

  // parent owns API + refresh
  onToggleComplete?: (taskId: string, nextStatus: TaskStatus) => Promise<void> | void;
};

export type SubTaskRowProps = {
  task: Task;
  to: string;

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
  onChanged?: () => void;
  onDelete?: (taskId: string) => void;
};

export type AddTaskFormProps = {
  listId: string;
  stack: string[];
  tasksInList: Task[];
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
    draftTitle: string;
    setDraftTitle: (title: string) => void;
    draftDescription: string;
    setDraftDescription: (description: string) => void;
    draftPriority: TaskPriority;
    setDraftPriority: (priority: TaskPriority) => void;
    draftStatus: TaskStatus;
    setDraftStatus: (status: TaskStatus) => void;
    draftDueDate: string;
    setDraftDueDate: (dueDate: string) => void;
    saving: boolean;
    setSaving: (saving: boolean) => void;
    setIsEditing: (isEditing: boolean) => void;
    onClose: () => void;
    onChanged?: () => void;
    refresh: () => void;
};
