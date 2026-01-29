# API Reference

This project has a few intentionally small “API surfaces”:
1) UI-facing store hooks + actions (what pages/components should use)
2) Internal API wrapper (the only place that calls Amplify GraphQL)
3) The backend GraphQL schema (reference)

## 1) UI-facing store APIs (current)

### Stores + actions (current)

This app’s “frontend API” is the set of Zustand store hooks and store actions.

Core stores:
- Tasks + lists: [src/store/taskStore.ts](../src/store/taskStore.ts)
  - Read via `useTaskIndexView()` / `useTaskIndex()`
  - Mutate via `useTaskActions()`
- Updates feed (persisted UX state): [src/store/updatesStore.ts](../src/store/updatesStore.ts)
  - Read via `useUpdatesView()`
  - Mutate via `useUpdatesActions()`
- Inbox UX state (persisted preferences): [src/store/inboxStore.ts](../src/store/inboxStore.ts)
  - Read via `useInboxView()`
  - Mutate via `useInboxActions()`

Network boundary:
- The API wrapper lives in [src/api/taskmasterApi.ts](../src/api/taskmasterApi.ts)
- UI code (pages/components/hooks) does not import `src/api/**` directly; store actions do.

Update events:
- Updates events are appended in one place (API layer) after successful mutations.

## 2) GraphQL API (Amplify/AppSync) (current)
Schema: [amplify/backend/api/taskmaster/schema.graphql](../amplify/backend/api/taskmaster/schema.graphql)

Core models:
- `TaskList`
- `Task`

Important query fields:
- `tasksByList(listId, sortOrder)`
- `tasksByParent(parentTaskId, sortOrder)`

Auth rules (current schema intent):
- Owner-based access
- Admin group override (`Admin`)

The UI is backed by GraphQL via the API wrapper and Zustand store actions.

## 3) Admin console data helpers (current)
The admin page uses a small set of helpers in [src/services/adminDataService.ts](../src/services/adminDataService.ts).

Admin console flow is:
- email → account (`ownerSub`) → lists → tasks

Key helpers (used by the Admin UI):
- `listUserProfilesWithEmailAdminPage()`: email-first browsing (filters to profiles with a real email)
- `listUserProfilesByEmailAdminPage()`: list accounts for a selected email (with safe-mode fallback)
- `listTaskListsOwnedAdminPage()`: list task lists for a selected owner
- `loadTasksForListsAdminPage()`: load tasks for selected list ids (concurrency-limited)

Safe-mode note:
- Some legacy records may not satisfy newly-required schema fields (e.g. `UserProfile.email`).
- The admin helpers can fall back to a safe listing mode so the console remains usable.

Intentional limitation:
- The Admin console is currently **read-only** (inspection/debug only).
- Admin-driven editing/deleting via the console is intentionally deferred and tracked in TODOs.

Boundary rules:
- Pages/components/hooks must not call Amplify GraphQL directly.
- The API wrapper lives in [src/api/taskmasterApi.ts](../src/api/taskmasterApi.ts) and is the only module that calls `client.graphql`.
- Store actions call the API wrapper; UI calls store hooks/actions.

### Example queries (reference)
List tasks by list id:
```graphql
query TasksByList($listId: ID!) {
  tasksByList(listId: $listId, sortDirection: ASC) {
    items { id listId sortOrder title status priority dueAt parentTaskId }
  }
}
```

### Generated client artifacts (reference)
- Amplify-generated TS types: [src/API.ts](../src/API.ts)
- Operation documents: [src/graphql](../src/graphql)
