import type { TaskList } from "../types/list"; // adjust if your type path differs
import { mockLists } from "../mocks/lists";

export const listService = {
  getAll(): TaskList[] {
    return mockLists;
  },

  exists(listId: string): boolean {
    return mockLists.some((l) => l.id === listId);
  },

  getById(listId: string): TaskList | undefined {
    return mockLists.find((l) => l.id === listId);
  },
};