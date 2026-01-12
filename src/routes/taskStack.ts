
// Parse the list ID and stack of task IDs from a given pathname.
// E.g., "/lists/abc/tasks/t1/tasks/t2" → { listId: "abc", stack: ["t1","t2"] }
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

// Build a path string given a list ID and a stack of task IDs.
// E.g., listId="abc", stack=["t1","t2"] → "/lists/abc/tasks/t1/tasks/t2"
export function buildTaskStackPath(listId: string, stack: string[]): string {
  if (stack.length === 0) return `/lists/${listId}`;
  return `/lists/${listId}/tasks/${stack.join("/tasks/")}`;
}

// Given the current stack of open task IDs and a clicked task ID,
// return the new stack of task IDs to represent the updated panes.
// If the clicked ID is already in the stack, truncate the stack to that ID.
// If it's not in the stack, append it.
export function nextStackOnClick(current: string[], clickedId: string): string[] {
  const existingIdx = current.indexOf(clickedId);
  if (existingIdx !== -1) {
    // already open → truncate so it becomes the last pane
    return current.slice(0, existingIdx + 1);
  }
  // new → append
  return [...current, clickedId];
}