<!-- {root}/docs/offline-mode-design.md -->

# Taskmaster Offline Mode Design (GraphQL + Zustand)

**Status:** Design doc (future work)  
**Applies to:** Taskmaster (Amplify Gen 1 CLI backend, AppSync GraphQL, Cognito User Pool auth, React + TypeScript + Chakra UI, planned Zustand state)

---

## 0) Why this doc exists

You already have an “offline-ish” local patch system (created/patches/deletedIds + derived updates feed + tick/refresh). Now that GraphQL is live, offline becomes a **product feature** rather than an accidental side-effect of mocks.

This doc lays out a **concrete, step-by-step** plan to implement offline mode **without** creating two competing sources of truth.

---

## 1) High-level goals

### Goals
- App works **readably and predictably** when offline:
  - user can view previously loaded lists/tasks
  - user can create/update/delete tasks/lists while offline
  - changes are queued locally and sync when online
- **Zustand remains the UI source of truth** (single state doorway).
- GraphQL remains the **server source of truth**.
- Offline sync is an **implementation detail** behind store actions.
- Minimal backend changes for MVP offline (avoid Lambdas unless needed).
- Good UX:
  - show “Offline” badge
  - show “Syncing…” state + errors with retry
  - never silently lose edits

### Non-goals (initial version)
- Cross-device real-time merges
- Complex CRDT collaboration
- Background sync while app closed (possible later with Service Worker)
- End-to-end encrypted local store

---

## 2) Current backend model assumptions

From your schema:

- `TaskList @model @auth(rules: [{allow: owner}, {allow: groups, groups:["Admin"]}])`
- `Task @model @auth(rules: [{allow: owner}, {allow: groups, groups:["Admin"]}])`

Key fields:
- TaskList: `id`, `name`, `isFavorite`, `sortOrder`, timestamps, `owner`
- Task: `id`, `listId`, `sortOrder`, `parentTaskId`, `title`, `description`, `status`, `priority`, `dueAt`, `completedAt`, `assigneeId`, `tagIds`, timestamps, `owner`
- Query fields:
  - `tasksByList(listId, sortOrder...)`
  - `tasksByParent(parentTaskId, sortOrder...)`

---

## 3) The architecture that won’t fight you later

### Single source of truth rules
- **Zustand store** is the **only** place components read/write task state.
- Store actions call a **repository** abstraction (`TaskRepo`) which chooses:
  - online GraphQL
  - offline local cache
  - offline queue + later sync

### Key boundary
UI does **not** call GraphQL directly.  
UI does **not** merge patches in localStorage directly.

Everything goes through:
```
Component → Zustand Action → Repo → (GraphQL | Cache | Queue) → Store update
```


---

## 4) Data storage choices for offline

### Recommendation: IndexedDB (primary) + localStorage (tiny flags only)

Why:
- localStorage is synchronous, small, and easy to corrupt with large data
- IndexedDB is built for structured storage, async, and larger datasets

**Use localStorage only for:**
- `offline.enabled` (boolean)
- `offline.lastSyncAt`
- `offline.schemaVersion`

**Use IndexedDB for:**
- cached TaskLists + Tasks
- operation queue (pending mutations)
- sync error log / dead-letter queue (optional)

### Practical implementation
Use one of:
- `idb` (tiny wrapper around IndexedDB)
- `Dexie` (more ergonomic; slightly heavier)

Pick one and standardize early.

---

## 5) Core concepts

### 5.1 Cached snapshot
A local cache of the latest known server state (per user):
- `taskLists` table keyed by `id`
- `tasks` table keyed by `id`
- optional indexes:
  - `tasksByListId` index on `listId`
  - `tasksByParentTaskId` index on `parentTaskId`

### 5.2 Offline operation queue (“mutation log”)
When offline (or when online but request fails), write an operation:

```ts
type OfflineOp =
  | { id: string; type: "CREATE_TASKLIST"; createdAt: string; payload: {...}; state: "PENDING"|"FAILED"; attempts: number; lastError?: string; }
  | { id: string; type: "UPDATE_TASKLIST"; createdAt: string; payload: {...}; state: ... }
  | { id: string; type: "DELETE_TASKLIST"; createdAt: string; payload: {...}; state: ... }
  | { id: string; type: "CREATE_TASK"; createdAt: string; payload: {...}; state: ... }
  | { id: string; type: "UPDATE_TASK"; createdAt: string; payload: {...}; state: ... }
  | { id: string; type: "DELETE_TASK"; createdAt: string; payload: {...}; state: ... }
;
```

Properties:
- id: uuid for the op
- createdAt: ISO timestamp
- attempts: retry count
- lastError: last failure message
- state: pending/failed (and optionally “dead-letter” after N attempts)

### 5.3 Optimistic UI (required)

When you enqueue an op, you immediately update Zustand and local cache to reflect the change.
Later sync either:
- confirms (no change needed), or
- reconciles if server rejects/adjusts.

---

### 6) IDs and offline-created records

To avoid headaches: use client-generated UUIDs for new records (TaskList/Task).

Amplify/AppSync supports client-provided IDs in `CreateXInput` (common pattern).
That means:
- offline create uses real ID immediately
- later sync creates server record with same ID
- no “temp id → real id” mapping required

If you ever move to server-generated IDs, you’ll need a temp-id mapping table. Avoid.

### 7) Conflict strategy (v1)

Conflicts happen if:
- user edits same record on two devices
- admin or other process changes record
- sync replays ops against newer server state

v1 policy: “last write wins” (LWW) with guardrails
- include updatedAt in your records
- for each update op:
  - fetch server record first (optional in v1; recommended later)
  - if server updatedAt is newer than the base you edited, mark conflict

Simplest v1: do not block; push update anyway and let last writer win.

Better v1.1: detect and notify:
- “This task changed on another device. Keep yours or keep server?”
- Only for high-value fields (title/description)

#### Add a base version field (optional)

If you later want stronger concurrency:
- add version: Int or use AppSync conflict detection (DataStore-style)
- but that adds complexity; not needed for MVP offline

---

### 8) Auth, ownership, and offline safety

Offline cache must be per-user. Ensure:
- cache key namespace includes userSub (from Cognito token)
- on sign-out: clear in-memory store and optionally clear cache for that user

Admin-group behavior:
- offline mode still runs under signed-in identity
- admin-only operations should either:
  - be disabled offline, or
  - be queued like normal (but likely unnecessary for MVP)

---

### 9) “Repo” interface design
Create a repository interface that Zustand uses:

```ts
type TaskRepo = {
  // Reads
  listTaskLists(): Promise<TaskList[]>;
  listTasksByList(listId: string): Promise<Task[]>;
  listTasksByParent(parentTaskId: string): Promise<Task[]>;

  // Writes
  createTaskList(input: CreateTaskListInput): Promise<TaskList>;
  updateTaskList(input: UpdateTaskListInput): Promise<TaskList>;
  deleteTaskList(id: string): Promise<void>;

  createTask(input: CreateTaskInput): Promise<Task>;
  updateTask(input: UpdateTaskInput): Promise<Task>;
  deleteTask(id: string): Promise<void>;

  // Sync
  flushQueue(): Promise<{ applied: number; failed: number }>;
  getQueueState(): Promise<{ pending: number; failed: number }>;
};
```

#### Implementations
- `GraphQLTaskRepo` (online only)
- `OfflineCapableTaskRepo` (wraps GraphQL + cache + queue)

Or:
- `TaskRepo = OfflineCapableTaskRepo` always; it decides at runtime.

### 10) Zustand store design (offline-ready)

#### Suggested slices
- `authSlice`:
  - `userSub`, `username`, `groups`, `isSignedIn`
- `networkSlice`:
  - `isOnline`, `lastOnlineAt`
- `dataSlice`:
  - `taskListsById`, `tasksById`
  - `tasksByListId: Record<listId, taskId[]>` (or computed selector)
- `syncSlice`:
  - `queuePendingCount`, `queueFailedCount`
  - `syncStatus: "idle"|"syncing"|"error"`
  - `lastSyncAt`
  - actions: `flushQueue()`, `retryFailedOps()`

#### Store actions
- reads:
  - `loadTaskLists()`
  - `loadTasksByList(listId)`

- writes:
  - `createTaskList(...)` (optimistic)
  - `updateTaskList(...)`
  - `deleteTaskList(...)`
  - `createTask(...)`
  - `updateTask(...)`
  - `deleteTask(...)`

Each write action:
1. updates Zustand immediately (optimistic)
1. writes to cache
1. attempts online mutation if online
1. if offline or mutation fails → enqueue op
1. updates sync counts

---

### 11) Sync engine behavior

#### Trigger points
- app startup (after auth)
- when network transitions offline→online
- user presses “Sync now”
- optionally every N minutes while online

#### Flush algorithm (v1)
Process ops FIFO:

For each op:
1. attempt GraphQL mutation
1. on success: mark op done (remove from queue)
1. on failure:
   - increment attempts
   - store lastError
   - if attempts > MAX (e.g., 5), mark “FAILED” and stop or continue depending on error type

#### Error classes
- Auth errors (token expired, unauthorized):
  - stop flush, prompt user to re-auth
- Validation/schema errors:
  - mark op failed (likely permanent) and continue
- Throttling/network:
  - exponential backoff, continue later

#### Idempotency

Because create IDs are client-generated, replays are mostly safe:

- If `createTask(id=X)` already exists, server may return error.
Solutions:
- On create failure due to “already exists”, treat as success and drop op.

(You can also “getTask(id)” to confirm, but that’s extra calls.)

---

### 12) Cache read strategy (when offline)

When loading lists/tasks:
- if online:
  - fetch from GraphQL
  - write to cache
  - update Zustand

- if offline:
  - read from cache
  - update Zustand
- show “cached data” indicator

#### Partial cache handling

If cache is empty (fresh device, never loaded online):
- show empty state + “Go online once to load your data”

---

### 13) UI/UX requirements

#### Global indicators
- Top-level badge:
  - Online / Offline
  - Syncing…
  - Sync error (click to see details)

#### Per-action behavior
When offline:
- allow create/update/delete normally
- optionally show small “Queued” toast

When sync fails permanently:
- show a “Sync Issues” panel listing failed ops with:
  - record info
  - error
  - “Retry” / “Discard” buttons

#### Safe discard policy
Discarding an op should:
- remove it from queue
- optionally revert local optimistic change (hard)
- OR mark record as “needs attention” (easier)
For v1, prefer:
- require manual resolution in UI (don’t auto-revert silently)

---

### 14) Backend considerations (minimal)
You can implement offline without backend changes.

Later improvements (optional):
- Add `updatedAt` usage or explicit versioning
- Add dedicated `UpdateEvent @model` if you want a true feed
- Add subscriptions for near-realtime updates

---

### 15) Implementation plan (step-by-step)

#### Step A — Prepare foundations

1. Add a small network utility:
   - `window.addEventListener("online"/"offline")`
   - set `isOnline` in Zustand

1. Choose IndexedDB library (`idb` or `Dexie`) and create:
   - `db.ts` (schema + openDB)

1. Add auth identity extraction:
   - from `fetchAuthSession()` get `sub` and `cognito:groups`
   - store in Zustand `authSlice`

#### Step B — Build cache layer

4. Implement cache tables:
   - `taskLists` (key: id)
   - `tasks` (key: id)
   - `ops` (key: opId)

1. Implement cache API:
   - `cache.getTaskLists(userSub)`
   - `cache.putTaskLists(userSub, lists)`
   - `cache.getTasksByList(userSub, listId)`
   - `cache.putTasks(userSub, tasks)`
   - clear on sign out (optionally)

#### Step C — Implement TaskRepo boundary

6. Create `TaskRepo` interface
1. Implement `GraphQLTaskRepo` using your minimal operations:
   - `createTaskListMinimal`, `updateTaskListMinimal`, ...
   - `tasksByListMinimal`, ...
1. Implement `OfflineCapableTaskRepo` that wraps:
   - GraphQL repo
   - cache
   - queue

#### Step D — Wire Zustand actions to repo
9. Create Zustand store with the actions listed earlier
1. Ensure all pages read from store, not from services/mocks

#### Step E — Add sync engine
11. Implement `flushQueue()`:
    - called when online and signed-in
1. Add UI:
    - “Sync now” button
    - “Sync issues” list if failed ops exist

#### Step F — Convert pages (progressive)
13. Convert ListPage first:
    - `loadTasksByList(listId)`
    - `createTask(...)`, `updateTask(...)`, etc.
1. Convert TaskDetailsPane and create/update flows
1. Convert Today/Inbox/Updates to derived selectors

#### Step G — Quality + guardrails

16. Add tests:
    - queue enqueue logic
    - flush retries
    - cache read fallback
1. Add dev helpers:
    - reset IndexedDB + queue
    - “simulate offline” toggle (dev only)

---

### 16) Testing checklist
#### Offline reads
- Go online, load data, then go offline
- Reload app offline
- Lists/tasks appear from cache

#### Offline writes
- Offline create list → appears immediately
- Offline create task → appears immediately
- Offline update task title/status → immediate
- Offline delete task → disappears immediately
- Queue count increases

#### Sync behavior
- Go online → queued ops flush
- Queue count returns to zero
- Server shows same data (AppSync console / dev smoke test)

#### Error handling
- Force an auth failure (sign out) during flush → flush stops, prompts re-auth
- Force a validation failure → op moves to failed and shows in UI

---

### 17) Migration from your existing local patch system

You currently have local patch merging, tick/refresh patterns, and an updates feed derived from that.

#### Recommended migration
- Keep your patch system code in repo (do not delete immediately)
- Stop wiring it into pages
- Use Zustand + TaskRepo boundary instead
- Later, reuse the idea (queue of ops) inside the offline repo implementation

This avoids maintaining two parallel caches.

---

### 18)  Future enhancements (post-v1)
- Service Worker background sync
- Push subscriptions to auto-refresh cache when online
- Stronger conflict resolution UI
- Per-field merge strategies
- True event stream model (`UpdateEvent @model`)
- Compression/encryption for local cache

---

### 19) Quick reference: what to build first

If you only do one “offline foundation” sprint:
1. IndexedDB cache for TaskLists/Tasks keyed by userSub
1. Offline queue table + enqueue on failed mutations
1. flushQueue on online event
1. minimal UI indicators (Offline, Syncing, Errors)

That alone gives you a legit offline mode.

---

### Appendix A — Suggested file structure

```bash
src/
  data/
    repo/
      TaskRepo.ts
      GraphQLTaskRepo.ts
      OfflineTaskRepo.ts
    cache/
      db.ts
      taskCache.ts
      opQueue.ts
    sync/
      syncEngine.ts
  store/
    useAppStore.ts
    slices/
      authSlice.ts
      networkSlice.ts
      tasksSlice.ts
      syncSlice.ts
  graphql/
    operations.ts  (minimal ops)
```

---

### Appendix B — Minimal op types (recommended)
Keep “minimal selection sets” for writes to avoid nested resolver issues:
- Create/Update TaskList returns only scalar fields
- Create/Update Task returns only scalar fields
- Reads:
  - `listTaskLists`
  - `tasksByList`
  - `tasksByParent`

Add nested relationships only when needed and in separate queries.

---