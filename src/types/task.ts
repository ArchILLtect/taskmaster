export type Priority = "Low" | "Medium" | "High";
export type TaskStatus = "Open" | "Done";

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
    priority: Priority;
    tagIds: string[]; // Points to Tag objects
    parentTaskId?: string | null; // Points to parent Task ID or null = no parent

    createdAt: string; // ISO string
    updatedAt: string; // ISO string
    completedAt?: string | null; // ISO string or null
};

export type TaskRowProps = {
  task: Task;
  to: string;
  showLists?: boolean;
  onChanged?: () => void;
};
