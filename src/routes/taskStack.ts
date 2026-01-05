export function parseTaskStackFromPath(pathname: string): {
  listId: string | null;
  stack: string[];
} {
  const listMatch = pathname.match(/\/lists\/([^/]+)/);
  const listId = listMatch?.[1] ?? null;

  // Split on "/tasks/" and take everything after it
  const stack = pathname.split("/tasks/").slice(1).filter(Boolean);

  return { listId, stack };
}

export function buildTaskStackPath(listId: string, stack: string[]): string {
  if (stack.length === 0) return `/lists/${listId}`;
  return `/lists/${listId}/tasks/${stack.join("/tasks/")}`;
}

export function nextStackOnClick(current: string[], clickedId: string): string[] {
  const existingIdx = current.indexOf(clickedId);
  if (existingIdx !== -1) {
    // already open → truncate so it becomes the last pane
    return current.slice(0, existingIdx + 1);
  }
  // new → append
  return [...current, clickedId];
}