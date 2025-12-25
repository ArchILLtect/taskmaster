import type { TaskList } from "../types/list";

export const mockLists: TaskList[] = [
    {
        id: "inbox",
        name: "Inbox",
        isFavorite: true,
        sortOrder: 0,
        createdAt: "2025-01-01T10:00:00Z",
        updatedAt: "2025-01-01T10:00:00Z",
    },
    {
        id: "school",
        name: "School",
        isFavorite: true,
        sortOrder: 1,
        createdAt: "2025-01-02T10:00:00Z",
        updatedAt: "2025-01-02T10:00:00Z",
    },
    {
        id: "work",
        name: "Work",
        isFavorite: false,
        sortOrder: 2,
        createdAt: "2025-01-03T10:00:00Z",
        updatedAt: "2025-01-03T10:00:00Z",
    },
];
