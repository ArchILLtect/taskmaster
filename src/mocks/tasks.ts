import type { Task } from "../types/task";

export const mockTasks: Task[] = [
    {
        id: "t1",
        listId: "inbox",
        title: "Welcome task",
        description: "This is a sample task in Inbox.",
        status: "Open",
        dueAt: null,
        assigneeId: null,
        priority: "Low",
        tagIds: [],
        subtasks: [],
        createdAt: "2025-01-01T10:00:00Z",
        updatedAt: "2025-01-01T10:00:00Z",
        sortOrder: 1,
    },
    {
        id: "t2",
        listId: "school",
        title: "Study for quiz",
        description: "Review chapters 3–5 and practice problems.",
        status: "Open",
        dueAt: "2025-01-05T18:00:00Z",
        assigneeId: null,
        priority: "High",
        tagIds: [],
        subtasks: [
            { id: "st1", title: "Chapter 3 notes", done: true, sortOrder: 1 },
            { id: "st2", title: "Practice set A", done: false, sortOrder: 2 },
        ],
        createdAt: "2025-01-02T10:00:00Z",
        updatedAt: "2025-01-02T10:00:00Z",
        sortOrder: 2,
    },
    {
        id: "t3",
        listId: "work",
        title: "Send update",
        description: "Post weekly status update.",
        status: "Done",
        dueAt: "2025-01-03T16:00:00Z",
        assigneeId: null,
        priority: "Medium",
        tagIds: [],
        subtasks: [],
        createdAt: "2025-01-03T10:00:00Z",
        updatedAt: "2025-01-03T10:00:00Z",
        sortOrder: 3,
    },
];

export const mockEmptyTasks: Task[] = [];
