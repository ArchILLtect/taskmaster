# Architecture Overview

This doc describes the system *as currently implemented* (mock/local-first) and the intended backend integration points (Amplify GraphQL).

## High-level
TaskMaster is a single-page app:
- React Router v7 for routing
- Chakra UI for layout/components
- Mock data + localStorage-backed patch/event stores for persistence

Entry points:
- [src/main.tsx](../src/main.tsx): ChakraProvider + BrowserRouter
- [src/App.tsx](../src/App.tsx): route table
- [src/layout/AppShell.tsx](../src/layout/AppShell.tsx): TopBar + Sidebar + `<Outlet />`

## Directory map
- `src/pages/*`: route-level pages
- `src/components/*`: reusable UI
- `src/services/*`: local persistence + domain helpers
- `src/mocks/*`: seed data
- `src/types/*`: TypeScript domain types (must match mocks)
- `amplify/*`: generated Amplify backend config (not fully wired into runtime yet)

## Routing + “pane stack” design
Lists and task details use a route-encoded stack:
- Route: `/lists/:listId/tasks/*`
- The `*` splat contains a stack of task IDs (`t1/t3/t9`)

Implementation: [src/pages/ListPage.tsx](../src/pages/ListPage.tsx)
- `stackIds`: derived from the splat param
- `buildStackUrl(listId, stackIds)`: converts stack → URL
- `pushTask(taskId)`: pushes onto stack
- `popTo(index)`: pops panes to a given index

Why this exists:
- Deep-linkable UI state (panes can be shared/bookmarked)
- Avoids hidden internal state for navigation

## Current data flow (mock + local persistence)
UI reads base data from mocks, then overlays local changes from localStorage.

Key pieces:
- Base tasks: [src/mocks/tasks.ts](../src/mocks/tasks.ts)
- Patch overlay: [src/services/taskPatchStore.ts](../src/services/taskPatchStore.ts)
- Domain API: [src/services/taskService.ts](../src/services/taskService.ts)

Task events / updates feed:
- Event log: [src/services/updatesEventStore.ts](../src/services/updatesEventStore.ts)
- View model + read-state: [src/services/updatesService.ts](../src/services/updatesService.ts)

Persistence primitives:
- JSON helpers: [src/services/storage.ts](../src/services/storage.ts)

### UI refresh pattern
Some pages use a `tick/refresh()` local state counter to re-render after service mutations.
- Example: [src/pages/UpdatesPage.tsx](../src/pages/UpdatesPage.tsx)

> TODO: Roadmap/design docs describe migrating this to a single state store (Zustand) so UI re-renders via selectors rather than manual ticks.

## Amplify + GraphQL (planned / partially scaffolded)
GraphQL schema exists under Amplify:
- [amplify/backend/api/taskmaster/schema.graphql](../amplify/backend/api/taskmaster/schema.graphql)

Client-side generated files exist but are not yet the primary data source:
- [src/API.ts](../src/API.ts)
- [src/graphql](../src/graphql)

> TODO: When wiring GraphQL for real pages, prefer a single boundary (service/repo layer) so pages/components don’t call GraphQL directly.

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
