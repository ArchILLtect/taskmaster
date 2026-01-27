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

---

## Plan: Client-owned state strategy (Settings + Onboarding)

This app uses versioned, client-owned state for certain UX concerns (e.g., user settings and onboarding progress). These are stored as JSON blobs with an accompanying `settingsVersion` / `seedVersion` to support forward-only migrations.

### Pattern A (final MVP target): Server-authoritative JSON blob
**Goal:** predictable, stable behavior for a showcase MVP.

- Store `settings` (AWSJSON) + `settingsVersion` in `UserProfile`.
- On app load, fetch the profile and run `migrateSettings()` if the version is behind.
- Write back the migrated settings once per upgrade.
- The server remains the source of truth for settings across devices.

**Pros**
- Cross-device consistency
- Easy to reason about (one canonical truth)
- Good “real product” behavior

**Cons**
- Requires schema + migration discipline
- Slightly more network dependency during profile initialization

### Pattern B (during rapid iteration): Local-first with eventual sync
**Goal:** move fast while the UX is still changing frequently.

- Use local persisted stores (e.g., Zustand `persist`) for settings/onboarding.
- Optionally sync the blob to `UserProfile` on a best-effort basis.
- Run migrations locally first; server sync is secondary.

**Pros**
- Fast iteration (fewer backend changes while UX churns)
- Easier dev/testing (reset local storage, iterate quickly)

**Cons**
- Cross-device mismatch can happen
- More edge cases (local vs server conflict)
- Requires careful cleanup on sign-out / user switch

### Intentional strategy
We start with **Pattern B** while the app is evolving quickly, then switch to **Pattern A** for the finalized MVP once UX and defaults stabilize. This keeps iteration speed high early, while ensuring the final showcase experience is consistent and professional.

---

## Plan: Demo Mode + UserProfile + Seeding Strategy (MVP path)

This is a documentation-only plan for MVP polish. It is not implemented yet.

### Current state (already implemented)
- Task data layer migrated to Zustand:
	- Store-driven reads/writes
	- localStorage cache + TTL
	- bootstrap hydration (no request storms)
	- refresh metadata + resilience (don’t blank UI on refresh failure)
- Guardrails:
	- ESLint prevents UI from importing `src/api/**`
	- UI may import only enums (`TaskStatus` / `TaskPriority`) from `../API`
- Sign-out cleanup:
	- User-scoped cache clearing exists (`taskStore` + inbox/updates + userUI)
- Inbox + Updates:
	- These are locally persisted (per browser), not per user (by design for MVP)
	- We decided to defer per-user persistence as a stretch goal

### Problem to solve (MVP polish)
- “Demo mode” / seeded experience:
	- New users should be able to experience the app immediately without manually creating lists/tasks.
	- We want owner scoping to remain intact (no weakening auth rules).

### Decision: Use `UserProfile` model + `seedVersion`
We will add a new GraphQL model: `UserProfile`, owned by `sub`, that tracks:
- whether the account has been seeded
- what seed version was applied
- settings blob + version
- optional onboarding blob + version

See also: [docs/DATA_MODEL.md](DATA_MODEL.md) for the planned schema shape.

**Reasoning**
- Avoid PostConfirmation Lambda seeding for now (more IAM/auth complexity and harder to debug).
- Client-driven seeding becomes deterministic using `seedVersion`.
- Supports forward-only upgrades (Flyway-style: version bumps, migrate forward).
- Keeps owner scoping strong: all created data is owned by the logged-in user.

### Strategy: Pattern B during rapid iteration, Pattern A for finalized MVP
See: “Client-owned state strategy (Settings + Onboarding)” in this document.

### Demo Mode UX plan (not implemented yet)
We want a seeded experience without clunky pre-login UI.

#### UX approach (recommended)
- After login, app runs a bootstrap step:
	1) Fetch `UserProfile` by `id = sub`
	2) If missing OR `seedVersion < CURRENT_SEED_VERSION`:
		 - Create/Update `UserProfile`
		 - Seed initial TaskLists + Tasks using normal GraphQL mutations
		 - Update `UserProfile`: `seedVersion = CURRENT_SEED_VERSION`, `seededAt = now`
	3) Continue to app normally

#### Seed behavior
- Seed includes:
	- Inbox list (if not already created/ensured)
	- 2–4 example lists (e.g., “Personal”, “Work”, “Someday”)
	- Example tasks + a few subtasks to demo pane-stack navigation
	- 1–2 tasks with due dates to demo “Due soon”
	- A couple “Done” tasks to demo completed toggle

#### Safety + correctness
- Seeding must be idempotent:
	- If it partially ran, rerunning should not create duplicates.
	- Prefer “create once” semantics: either store IDs in profile seed metadata, or seed only when version is behind.
- Seeding must be race-safe:
	- Ensure only one seed run happens even if multiple tabs open.
	- Use a `seedLock` field in `UserProfile` (optional), or rely on conditional create + single bootstrap call.

### Account switching / cache cleanup plan (MVP)
- On sign-out:
	- Clear task store local cache (so next user doesn’t see old cached tasks)
	- Clear user UI cache
	- Optionally clear inbox/updates local stores OR scope them per-user locally (future)
- On sign-in:
	- “belt + suspenders”: clear caches on auth sign-in event (Hub listener), then bootstrap again

### Stretch goals (post-MVP)
- Persist inbox/updates per user in DynamoDB
- Route-level code splitting to reduce bundle size

### Notes / Intentional tradeoffs
- Inbox/Updates are currently browser-local and may reset on account switching.
	- This is acceptable for MVP and will be upgraded later.
- Seed + settings/onboarding use versioning (forward-only migration style).

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
