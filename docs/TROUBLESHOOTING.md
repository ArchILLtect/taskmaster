# Troubleshooting / FAQ

## The app looks “stuck” after I change data
TaskMaster uses persisted Zustand stores for fast reloads, and a TTL-based cache for tasks/lists. If something looks stale, it’s usually one of:

- You’re seeing cached task data (it will refresh automatically when stale).
- A local persisted UX setting is hiding content (e.g., Inbox dismissals).

## Reset local state (recommended during development)
TaskMaster persists a small amount of state in `localStorage`.

Keys in use:
- `taskmaster:taskStore` (tasks/lists cache with TTL)
- `taskmaster:inbox` (inbox preferences + dismissals)
- `taskmaster:updates` (updates event feed + read markers)
- `taskmaster:user` (cached user display info)

To reset:
1. Open browser devtools → Application/Storage → Local Storage.
2. Remove the keys above.
3. Refresh the page.

Tip: If you only want to reset tasks/lists cache (but keep UX state), clear only `taskmaster:taskStore`.

## `npm run dev` exits immediately
If `npm run dev` exits with code 1:

1. Re-run `npm run dev` and read the *first* error line (it’s usually the real root cause).
2. If it’s a TypeScript error, try `npm run build` to get the full typecheck output.
3. If it’s a dependency/Vite error, delete `node_modules` and reinstall: `npm install`.

## I updated a task but Updates didn’t change
Updates events are appended after successful task mutations (create/update/delete). If you don’t see an expected event:

- Confirm the mutation succeeded (check network tab and UI toast).
- Clear `taskmaster:updates` to reset the feed.
- Note: some updates may be categorized as “task_updated” vs “task_completed/reopened” depending on what fields changed.

## Time zones / due dates
The Add Task form uses the user’s local timezone when computing the minimum date.
- See [src/components/AddTaskForm.tsx](../src/components/AddTaskForm.tsx)

> TODO: Standardize how we store/format time across the app.
