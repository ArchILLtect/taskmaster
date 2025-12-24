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
    title: string;
    done: boolean;
};

export type Task = {
    id: string;
    listId: string;
    title: string;
    description?: string;
    status: TaskStatus;
    dueAt?: string | null; // ISO string or null = someday
    assigneeId?: string | null; // User ID or null = unassigned
    priority: Priority;
    tagIds: string[]; // Points to Tag objects
    subtasks: SubTask[];
    createdAt: string; // ISO string
    updatedAt: string; // ISO string
};
