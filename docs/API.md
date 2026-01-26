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
