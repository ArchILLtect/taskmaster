# Architecture Overview

This doc describes the system *as currently implemented* (Zustand + Amplify GraphQL) and the key boundaries that keep UI/data flow predictable.

## High-level
TaskMaster is a single-page app:
- React Router v7 for routing
- Chakra UI for layout/components
- Zustand stores for app state, with persisted caches for fast reloads

Entry points:
- [src/main.tsx](../src/main.tsx): ChakraProvider + BrowserRouter
- [src/App.tsx](../src/App.tsx): route table
- [src/layout/AppShell.tsx](../src/layout/AppShell.tsx): TopBar + Sidebar + `<Outlet />`

## Directory map
- `src/pages/*`: route-level pages
- `src/components/*`: reusable UI
- `src/store/*`: Zustand state, persistence, and actions
- `src/services/*`: small non-store utilities (auth helpers, storage helpers)
- `src/types/*`: TypeScript domain types
- `amplify/*`: generated Amplify backend config + metadata (schema + infrastructure)

## Routing + “pane stack” design
Lists and task details use a route-encoded stack:
- Route: `/lists/:listId/tasks/*`
- The `*` splat contains a stack of task IDs (`t1/t3/t9`)

Implementation: [src/pages/ListDetailsPage.tsx](../src/pages/ListDetailsPage.tsx)
- `stackIds`: derived from the splat param
- `buildStackUrl(listId, stackIds)`: converts stack → URL
- `pushTask(taskId)`: pushes onto stack
- `popTo(index)`: pops panes to a given index

Why this exists:
- Deep-linkable UI state (panes can be shared/bookmarked)
- Avoids hidden internal state for navigation

## Current data flow (Zustand + persisted caches)
All app state that drives the UI lives in Zustand stores under `src/store/**`.

### State architecture (Zustand)

- **taskStore** is the single source of truth for task lists + tasks, with derived indexes built in the store.
- UI code should consume state via **UI-facing hooks**:
	- `useTaskIndex` / `useTaskActions`
	- `useInboxView` / `useInboxActions`
	- `useUpdatesView` / `useUpdatesActions`
- Direct imports from `src/api/**` are forbidden in UI (pages/components). Amplify generated `../API` is restricted to enums only (`TaskStatus`, `TaskPriority`).
- Persistence:
	- `taskStore` persists `{ lists, tasks, lastLoadedAtMs }` with a TTL; indexes are rebuilt on hydration.
	- Inbox + Updates stores persist their own local UI state (dismissals, read markers, event feed).

Core stores:
- Tasks/lists: [src/store/taskStore.ts](../src/store/taskStore.ts)
	- Persists only the canonical arrays (`lists`, `tasks`, `lastLoadedAtMs`)
	- Rebuilds derived indexes in-memory on hydration
	- Uses a TTL to make reloads feel instant while still auto-refreshing in the background
- Updates feed (local, persisted UX state): [src/store/updatesStore.ts](../src/store/updatesStore.ts)
- Inbox UX state (local, persisted preferences): [src/store/inboxStore.ts](../src/store/inboxStore.ts)

Network boundary:
- Pages/components do **not** call `src/api/**` directly.
- Store actions call the API wrapper.
- Update events are appended in one place (the API layer) after successful mutations: [src/api/taskmasterApi.ts](../src/api/taskmasterApi.ts)

Persistence primitives:
- JSON + time helpers: [src/services/storage.ts](../src/services/storage.ts)

## Amplify + GraphQL (current)
GraphQL schema exists under Amplify:
- [amplify/backend/api/taskmaster/schema.graphql](../amplify/backend/api/taskmaster/schema.graphql)

Client-side generated files exist and are used by the API wrapper:
- [src/API.ts](../src/API.ts)
- [src/graphql](../src/graphql)

Important boundaries:
- UI (pages/components/hooks) does not call GraphQL directly.
- `src/api/taskmasterApi.ts` is the boundary that calls `client.graphql`.
- Zustand store actions call the API wrapper and remain the single source of truth for UI state.

## Auth (current)
Auth is wired via Amplify UI’s `Authenticator` (app-level `user` + `signOut`).

User display info (email/role) is fetched client-side via:
- [src/services/authService.ts](../src/services/authService.ts)
- [src/hooks/useUserUI.ts](../src/hooks/useUserUI.ts)

## UI, Hooks, and API Boundaries (Intentional)

This project intentionally treats **React hooks (`src/hooks/**`) as part of the UI layer**, alongside
`src/pages/**` and `src/components/**`.

As a result, UI and hooks:
- ❌ MUST NOT import API wrapper modules from `src/api/**`
- ❌ MUST NOT import generated Amplify models from `../API` or `@/API`
- ✅ MAY import **only** UI-safe enums (`TaskStatus`, `TaskPriority`) from the generated API
- ✅ MUST interact with backend data exclusively through Zustand stores and store actions

### Rationale

- Zustand is the **single source of truth** for application state and network interactions.
- Hooks are treated as **composition helpers**, not data-fetching layers.
- This prevents hidden coupling where UI logic bypasses the store and calls the API directly.
- All network behavior, caching, persistence, and invalidation is centralized and observable.

### Trade-off

This approach is slightly more restrictive than allowing hooks to call APIs directly, but it:
- Improves architectural clarity
- Reduces accidental regressions
- Makes data flow easier to reason about in a showcase codebase

If the application grows, a future evolution may introduce a separate
`domain/` or `services/` layer for non-UI hooks, but that is intentionally out of scope for this version.
