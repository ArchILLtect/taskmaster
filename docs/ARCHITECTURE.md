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
	- Inbox + Updates stores persist their own local UI state (dismissals, read markers, event feed) in **user-scoped localStorage**.

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
- User-scoped storage helpers (keying + zustand storage): [src/services/userScopedStorage.ts](../src/services/userScopedStorage.ts)

## Amplify + GraphQL (current)
GraphQL schema exists under Amplify:
- [amplify/backend/api/taskmaster/schema.graphql](../amplify/backend/api/taskmaster/schema.graphql)

Client-side generated files exist and are used by the API wrapper:
- [src/API.ts](../src/API.ts)
- [src/graphql](../src/graphql)

Codegen note:
- `src/graphql/**` is treated as codegen-owned and safe to delete/regenerate.
- Keep any hand-written GraphQL documents out of that folder (use [src/api/operationsMinimal.ts](../src/api/operationsMinimal.ts)).

Important boundaries:
- UI (pages/components/hooks) does not call GraphQL directly.
- `src/api/taskmasterApi.ts` is the boundary that calls `client.graphql`.
- Zustand store actions call the API wrapper and remain the single source of truth for UI state.

## Auth (current)
Auth is wired via Amplify UI’s `Authenticator` (app-level `user` + `signOut`).

User display info (email/role) is fetched client-side via:
- [src/services/authService.ts](../src/services/authService.ts)
- [src/hooks/useUserUI.ts](../src/hooks/useUserUI.ts)

## E2E smoke testing (implemented)

Minimal automated smoke coverage uses Playwright (plus axe scans) to validate that key routes render and basic accessibility regressions are caught.

To keep tests stable and avoid requiring live AWS connectivity, the E2E web server enables a test-only auth bypass via `VITE_E2E_BYPASS_AUTH=1`.

Implementation:
- Auth gate: [src/routes/RequireAuth.tsx](../src/routes/RequireAuth.tsx)
- Playwright web server env: [playwright.config.ts](../playwright.config.ts)

This flag must never be enabled in production deployments.

## Admin console (current)
The app includes an admin-only route:
- Route: `/admin`
- Page: [src/pages/AdminPage.tsx](../src/pages/AdminPage.tsx)
- Data helpers: [src/services/adminDataService.ts](../src/services/adminDataService.ts)

### Access model
- The TopBar shows the Admin link only when the signed-in user’s role resolves to `Admin`.
- The page also defends itself (it won’t render admin data unless the user is an admin).

### Step-by-step workflow (implemented)
The Admin console is designed as a guided flow to reduce accidental cross-user data access:
1) Select an **email**
2) Select the specific **account** for that email (by `ownerSub`)
3) Select one or more **lists** for that account
4) Load **tasks** only for the selected lists

### Safety: “safe mode” for legacy schema mismatches
Some historical/legacy `UserProfile` records may be missing fields that are now required by the schema (notably `email`).
Admin list queries therefore include a safe-mode fallback that can still enumerate accounts without breaking the entire admin view.

### Intentional limitation (not forgotten)
The Admin console is currently **read-only** (inspection/debugging only).
Admin-driven item editing/deleting is intentionally deferred and tracked in the repo backlog.

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

## Demo Mode + UserProfile + Seeding Strategy (implemented)

TaskMaster seeds a demo-first experience for new (or unseeded) accounts using a versioned, idempotent bootstrap.
This is safe to run on every authenticated boot because it only writes when the profile is missing or behind.

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
	- These are locally persisted (per browser) and scoped per signed-in user to avoid cross-user cache flashes.
	- They are not yet synchronized to the backend (no cross-device persistence yet).

### Goal
- New users should be able to experience the app immediately without manually creating lists/tasks.
- Owner scoping remains intact (no weakening auth rules).

### Decision: Use `UserProfile` model + `seedVersion`
We use a GraphQL model `UserProfile` owned by `sub`, that tracks:
- whether the account has been seeded (`seedVersion`, `seededAt`)
- settings/onboarding blobs + versions (future use)

Schema: [amplify/backend/api/taskmaster/schema.graphql](../amplify/backend/api/taskmaster/schema.graphql)

**Reasoning**
- Avoid PostConfirmation Lambda seeding for now (more IAM/auth complexity and harder to debug).
- Client-driven seeding becomes deterministic using `seedVersion`.
- Supports forward-only upgrades (Flyway-style: version bumps, migrate forward).
- Keeps owner scoping strong: all created data is owned by the logged-in user.

### Strategy: Pattern B during rapid iteration, Pattern A for finalized MVP
See: “Client-owned state strategy (Settings + Onboarding)” in this document.

### Bootstrap behavior
MVP behavior: demo seeding runs for **all accounts by default**.
Temporary opt-out is supported via `?demo=0` or `localStorage.taskmaster:seedDemo = "0"`.

#### UX approach (recommended)
- After login, app runs a bootstrap step:
	1) Resolve current identity (Cognito `sub`) and ensure `UserProfile` exists.
		- `UserProfile.id = sub`
		- `UserProfile.owner = sub`
		- `UserProfile.email` is populated from Cognito attributes
	2) If `seedVersion < CURRENT_SEED_VERSION`:
		- Claim seeding (multi-tab safe) by conditionally setting `seedVersion = -1`
		- Create demo TaskLists/Tasks (all created with `isDemo: true`)
		- Finalize by setting `seedVersion = CURRENT_SEED_VERSION` and `seededAt = now`
	3) If `seedVersion >= CURRENT_SEED_VERSION`: do nothing

#### Where the logic lives
- Bootstrap trigger: [src/hooks/useBootstrapUserProfile.ts](../src/hooks/useBootstrapUserProfile.ts)
- Bootstrap + seeding: [src/services/userBootstrapService.ts](../src/services/userBootstrapService.ts)
- GraphQL boundary: [src/api/taskmasterApi.ts](../src/api/taskmasterApi.ts)
- Minimal GraphQL docs: [src/api/operationsMinimal.ts](../src/api/operationsMinimal.ts)

#### Safety + correctness
- Idempotent by versioning: writes only happen when `seedVersion` is behind.
- Race-safe: conditional update claims seeding by setting `seedVersion = -1` (in-progress).
- After seeding, the app expires the task cache and refreshes so seeded data appears immediately.

### Account switching / cache cleanup plan (MVP)
- On sign-out:
	- Clear task store local cache (so next user doesn’t see old cached tasks)
	- Clear user UI cache
	- Clear user-scoped inbox/updates/localSettings caches (these are scoped per user locally)
- On sign-in:
	- “belt + suspenders”: clear caches on auth sign-in event (Hub listener), then bootstrap again

### Demo data management (implemented)
- Settings includes a Demo Data section that can clear/reset/add demo content without touching non-demo items.
- Implementation: [src/services/demoDataService.ts](../src/services/demoDataService.ts)

### Stretch goals (post-MVP)
- Persist inbox/updates per user in DynamoDB
- Route-level code splitting to reduce bundle size (implemented Feb 2026)

### Notes / Intentional tradeoffs
- Inbox/Updates are browser-local (no backend sync yet) but are scoped per signed-in user in localStorage.
	- This is acceptable for MVP and can be upgraded to backend persistence later.
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
