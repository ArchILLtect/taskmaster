export type TaskList = {
    id: string;
    name: string;

    isFavorite: boolean;

    sortOrder: number; // sidebar ordering
    createdAt: string; // ISO string
    updatedAt: string; // ISO string
};
