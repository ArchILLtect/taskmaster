# Troubleshooting / FAQ

## The app looks “stuck” after I change data
TaskMaster uses persisted Zustand stores for fast reloads, and a TTL-based cache for tasks/lists. If something looks stale, it’s usually one of:

- You’re seeing cached task data (it will refresh automatically when stale).
- A local persisted UX setting is hiding content (e.g., Inbox dismissals).

## React “Maximum update depth exceeded” / `getSnapshot` warning (Zustand)
If the app loads and then immediately freezes or white-screens, and the console shows something like:

- `The result of getSnapshot should be cached to avoid an infinite loop`
- `Uncaught Error: Maximum update depth exceeded`

…the most common cause is a Zustand selector that returns a **new object/array literal** every render.

Bad (unstable snapshot):
- `useStore((s) => ({ a: s.a }))`

Good:
- `useStore((s) => s.a)` (primitive)
- `useStore((s) => s.setA)` (function)

If you truly need multiple fields:
- Prefer a dedicated “view hook” that returns cached references (see the patterns in `src/store/taskStore.ts` / `src/store/inboxStore.ts`).
- Or use `zustand/shallow` with a stable selector.

## Reset local state (recommended during development)
TaskMaster persists a small amount of state in `localStorage`.

Most keys are **scoped per signed-in user** (to avoid cross-user cache flashes on shared browsers).

Common keys you’ll see:
- `taskmaster:authScope` (current auth scope marker used for scoping)
- `taskmaster:u:<scope>:zustand:taskmaster:taskStore` (tasks/lists cache with TTL)
- `taskmaster:u:<scope>:zustand:taskmaster:inbox` (Inbox triage dismissal state)
- `taskmaster:u:<scope>:zustand:taskmaster:updates` (Updates event feed + read markers)
- `taskmaster:u:<scope>:zustand:taskmaster:user` (cached user display info)
- `taskmaster:u:<scope>:zustand:taskmaster:localSettings` (sidebar width + default routes + due-soon window)
- `taskmaster:u:<scope>:inboxListId` (system Inbox list id mapping)

Other UX keys:
- `taskmaster:storageDisclosureAck:v1` (storage disclosure banner dismissal)
- `taskmaster:u:<scope>:tip:*` (dismissed tips)

To reset:
1. Open browser devtools → Application/Storage → Local Storage.
2. Remove keys by prefix (recommended): `taskmaster:u:`.
3. Refresh the page.

Tip: If you only want to reset tasks/lists cache (but keep UX state), clear only `taskmaster:u:<scope>:zustand:taskmaster:taskStore`.

## `npm run dev` exits immediately
If `npm run dev` exits with code 1:

1. Re-run `npm run dev` and read the *first* error line (it’s usually the real root cause).
2. If it’s a TypeScript error, try `npm run build` to get the full typecheck output.
3. If it’s a dependency/Vite error, delete `node_modules` and reinstall: `npm install`.

## I can’t access the Admin console (`/admin`)
The Admin console is intentionally restricted.

Expected behavior:
- The Admin link appears in the TopBar only when your user role resolves to `Admin`.
- Navigating to `/admin` as a non-admin should not load admin data.

If you believe you *should* be an admin:
1. Confirm your Cognito user is in the `Admin` group for the current environment.
2. Sign out and sign back in (group membership changes may not reflect until a fresh session).
3. Clear the cached user display/role key and refresh:
	- `taskmaster:u:<scope>:zustand:taskmaster:user`

Notes:
- The Admin console is currently **read-only** (inspection/debug only). Editing/deleting items from `/admin` is intentionally deferred.

## Admin console shows “Safe mode” for accounts
If the Admin page shows a “Safe mode” badge while listing accounts, it usually means some legacy `UserProfile` rows don’t match the latest schema (for example, missing a now-required `email`).

What to do:
- This is expected for legacy data; safe mode keeps the Admin view usable.
- Have the affected user sign in once: the bootstrap flow opportunistically self-heals missing `UserProfile.email` / `displayName` when possible.

## I updated a task but Updates didn’t change
Updates events are appended after successful task mutations (create/update/delete). If you don’t see an expected event:

- Confirm the mutation succeeded (check network tab and UI toast).
- Clear `taskmaster:u:<scope>:zustand:taskmaster:updates` to reset the feed.
- Note: some updates may be categorized as “task_updated” vs “task_completed/reopened” depending on what fields changed.

## Time zones / due dates
The Add Task form uses the user’s local timezone when computing the minimum date.
- See [src/components/AddTaskForm.tsx](../src/components/AddTaskForm.tsx)

> TODO: Standardize how we store/format time across the app.
