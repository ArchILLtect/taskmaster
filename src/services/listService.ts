// TODO Switch to using API enums for consistency when possible
import type { TaskList } from "../types/list";
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