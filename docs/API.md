# API Reference

This project currently has two relevant “API surfaces”:
1) Internal frontend services (used by pages/components today)
2) Planned backend GraphQL API (Amplify/AppSync) described by the schema

## 1) Frontend service APIs (current)

### `taskService`
Source: [src/services/taskService.ts](../src/services/taskService.ts)

Key methods:
- `getAll(): Task[]` — returns mock tasks + locally created tasks + patches applied
- `getByListId(listId): Task[]`
- `getById(taskId): Task | undefined`
- `getTopLevel(tasks): Task[]` — tasks with `parentTaskId == null`, sorted by `sortOrder`
- `getChildren(tasks, parentId): Task[]` — tasks with `parentTaskId === parentId`, sorted
- `setStatus(taskId, status)` — updates local patch store and emits an update event
- `create(partialTask): Task` — creates a new task (client-generated id), persists via patch store, emits update event
- `delete(taskId)` — deletes a task and all descendants, persists via patch store, emits update event

Persistence details:
- Patches stored via [src/services/taskPatchStore.ts](../src/services/taskPatchStore.ts)
- Storage keys documented in [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

### `updatesService`
Source: [src/services/updatesService.ts](../src/services/updatesService.ts)

Key methods:
- `getViewModel()` → `{ state, events, unreadCount }`
- `markAllReadNow()`
- `clearRead()`

Events originate from:
- [src/services/updatesEventStore.ts](../src/services/updatesEventStore.ts)

## 2) GraphQL API (planned / scaffolded)
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

> TODO: The UI is not currently backed by GraphQL yet. When it is, prefer routing all reads/writes through a repo/service layer (UI should not call GraphQL directly).

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
