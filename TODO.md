<!-- {root}/TODO.md -->

# TO-DO (as time permits)

This file is a running backlog of ideas, cleanups, and future improvements.
Priorities use TODO(P1–P5) and TODO(stretch) and are surfaced via the todo-tree extension.

---

## Platform / Foundations
- [ ] TODO(P2) Normalize all time-related features by initializing and using the current time zone as the base for all times
  - display
  - storage
  - comparisons

---

## Data & Services

- [ ] TODO(stretch) Make Updates logging “perfect” by comparing before/after task status
  - Today: `taskmasterApi.updateTask()` infers completed/reopened vs updated based on which fields are present in the payload
  - Ideal: compare previous task state vs next task state (e.g., status transition) before emitting `task_completed` / `task_reopened`
  - Options:
    - Pass `prevStatus` (or a snapshot) from UI to the API wrapper as metadata
    - Fetch the task before update (extra round-trip; be careful about latency)

- [ ] TODO(P1) Zustand state (post-MVP)
  - [ ] tasks (GraphQL-backed, cached client-side)
  - [ ] taskLists
  - [ ] update feed (derived from updatedAt / createdAt)
  - [ ] updates read-state (lastReadAt / clearedBeforeAt)

- [ ] TODO(P1) Gradually migrate any remaining legacy page logic → store hooks/actions
  - [ ] InboxPage
  - [ ] ListDetailsPage
  - [ ] UpdatesPage

- [ ] TODO(P2) Persist client-side state (later)
  - Goal: make offline-ish UX smoother by caching state between sessions.
  - Targets to persist (candidates):
    - tasks/lists cache (optional; versioned + TTL; safe to drop and refetch)
    - updates events feed (optional; derived from task history or recorded client-side)
    - inbox local state (dismissed ids, lastViewedAt, dueSoonWindowDays)
    - userUI cache (optional; username/email/role with short TTL)
  - Notes:
    - Persist only serializable slices (arrays/records/primitives); keep functions out of persisted state.
    - Add store versioning + migrations before enabling persistence.

- [ ] TODO(stretch) Persist Inbox + Updates in DynamoDB per user
  - Goal: Make Inbox “dismissed/new/due-soon” state + Updates feed/read markers follow the user across devices.
  - Current: Stored in localStorage only (per-device).
  - Proposed:
    - Add models (one of these approaches):
      - A) UserUXState (1 row per user) containing:
        - inbox: dismissedTaskIds[], lastViewedAt, dueSoonWindowDays
        - updates: events[] OR readMarkers + a capped events list
      - B) Separate models:
        - InboxState @model (owner) 1 row per user
        - UpdateEvent @model (owner) many rows per user (with query by occurredAt)
    - Keep @auth owner rules; Admin group can read/debug.
    - Implement:
      - On sign-in: fetch user UX state -> hydrate stores
      - On state changes: write-through (debounced) to GraphQL
      - Add retention policy (cap events count or TTL via DynamoDB TTL)
    - Migration:
      - First run: if localStorage has inbox/updates, import once then clear local.
  - Notes:
    - Prefer capped events to avoid unbounded growth.
    - Consider idempotent seeds / deterministic ids for update events.


---

## GraphQL & Data Modeling (Future Hardening / Improvements)

- [ ] TODO(P3) Review GraphQL mutation selection sets for minimal ops
  - Some minimal mutations are typed using full Amplify-generated output types
  - This is intentional for MVP speed
  - If TypeScript inference becomes misleading (e.g. assuming nested relations exist),
    consider defining custom output types for minimal ops

- [ ] TODO(P4) Evaluate adding `__typename` to GraphQL minimal queries/mutations
  - Not required for MVP
  - May help later if Zustand, memoization, or derived caches rely on entity identity

---

## Offline Mode (Post-MVP)

- [ ] TODO(P5) Implement offline support following:
  - `/docs/offline-mode-design.md`

- [ ] TODO(P5) Introduce IndexedDB-backed cache

- [ ] TODO(P5) Add offline mutation queue + replay logic

- [ ] TODO(P5) Add sync status UI
  - offline
  - syncing
  - error states

⚠️ Offline mode is intentionally deferred until:
- GraphQL CRUD is stable
- Zustand is the primary client cache
- MVP UX is complete

---

## Security & Auth (Post-MVP Hardening)

- [ ] TODO(P4) Harden owner-based GraphQL auth rules
  - Prevent clients from reassigning the `owner` field on @model types
  - Apply field-level auth or remove `owner` from client-writable inputs
  - Ensure:
    - owners can CRUD only their own records
    - Admin group can read/write across users
    - ownership cannot be transferred via mutation payloads
  - Context:
    - Amplify warning: “owners may reassign ownership”
    - Deferred intentionally for MVP speed

---

## UI / UX

- [ ] TODO(P2) Add date formatting helper for task due dates
  - In TaskDetailsPane, the “Due: {selected.dueAt ?? 'Someday'}” prints an ISO string

- [ ] TODO(P2) Update ProfilePage to use real auth/user data (Cognito / Amplify)
  - Ensure it uses `useUserUI` and does not rely on hard-coded values

- [ ] TODO(P3) Add an app footer
  - [ ] Link to the showcase site
  - [ ] Move the Sign Out button into the footer
  - [ ] Add an email link: `mailto:nick@nickhanson.me`

- [ ] TODO(P3) Replace the tick/refresh() pattern everywhere (after migration)
  - Do **not** refactor during GraphQL migration
  - Known locations:
    - ListPage
    - UpdatesPage
    - InboxPage
    - TasksPage
  - When Zustand lands, refresh() disappears and components re-render via selectors

- [ ] TODO(P3) Find a way to ensure refreshing of favorites sidebar section upon starring/un-starring lists for favorites.
- [ ] TODO(P3) Fix failing toasts from editing _and_ adding tasks and closing/canceling both windows on ListDetailsPage.
- [ ] TODO(P4) Add Tooltip/Toast for "already in inbox"

---

## Testing & Quality

- [ ] TODO(P3) Add a tiny “dev reset local state” helper (optional but helpful)
  - [ ] a function (or dev-only button) that clears:
    - `taskmaster.taskPatches.v1`
    - `taskmaster.updateEvents.v1`
    - `taskmaster.updates.v1`
  - Useful during GraphQL / Zustand migration
  - Saves spelunking in localStorage

---

## Docs

- [ ] TODO(P2) Keep `/docs/README.md` up to date as new design docs are added

---

## Routing & Navigation
- [ ] TODO(P4) . . .

## Performance / Bundling

- [ ] TODO(P4) Investigate production bundle size & route-level code splitting
  - Vite warning: main JS chunk > 500 kB
  - Likely contributors:
    - Chakra UI
    - AWS Amplify (Auth + API)
    - Large route components
  - Notes:
    - Zustand migration + caching is complete; bundle work is now purely perf polish
  - Possible actions (later):
    - Route-level `React.lazy()` for heavy pages:
      - TasksPage, UpdatesPage, Lists/ListDetails pages
    - Consider `manualChunks` in `vite.config.ts` if needed
    - Re-evaluate after MVP polish
  - Status:
    - Non-blocking for MVP
    - Safe to defer until performance tuning phase


- [ ] TODO(P4) Route-level code splitting (React.lazy + Suspense)
  - Lazy-load routes first (highest impact):
    - ListDetailsPage / list task stack route
    - UpdatesPage
    - TasksPage
    - InboxPage
  - Lazy-load later (lower impact / smaller):
    - ListsPage
    - FavoritesPage
    - ProfilePage / SettingsPage / MonthPage
    - DevPage (tiny; defer)
  - Suspense fallback:
    - Place the primary `<Suspense fallback={...}>` in AppShell’s main content area wrapping the `<Outlet />` region
    - Keep the sidebar/topbar always-rendered so navigation remains responsive while a page chunk loads
  - Error handling / boundaries:
    - Preserve existing ErrorBoundary behavior for route renders (don’t move the boundary inside a lazy-loaded component)
    - Ensure the ErrorBoundary still wraps whatever renders the lazy route element so dynamic import failures and render errors surface consistently

### Demo Feature:

- [ ] TODO(P2) Wire Post Confirmation to include the addition of demo data. This means pre-seeding all newly created accounts with mock data the user can feel free to play with and lose.
- [ ] TODO(P2) Add a Demo data section within SettingsPage that contains these features:
   - [ ] A button to clear all demo data.
   - [ ] A button to re-seed all demo data.
   - [ ] A section for adding more demo data with:
      - [ ] A button to add more tasks with multiplier. "Add [ x ] tasks."
      - [ ] A button to add more lists with multiplier. "Add [ x ] lists."
      - [ ] A button to add both with separate multipliers. "Add [ x ] tasks and [ x ] lists."."

### Specify later:

- [x] TODO(P1) Remove legacy task overlay bridge:
  - Removed taskStore.refreshAll() glue (taskService.setBaseTasks).
  - Deleted legacy overlay files (taskService/taskPatchStore) and removed dependencies.
  - Goal met: Zustand is the single source of truth for tasks/lists and edits.
- [ ] Add CI enforcement: run `npm run lint` + `npm run build` on PRs to keep the UI-layer API import restrictions enforced.
- [ ] TODO(P4) ESLint guardrail: if we introduce additional Amplify enums used by UI (beyond TaskStatus/TaskPriority), expand the allowlist in `eslint.config.js` (`no-restricted-imports` → allowImportNames) so UI can import those enums from `../API` without importing generated models.
- [ ] Consider tightening architecture: optionally forbid direct imports from `src/api/**` inside `src/pages/**` and `src/components/**`, forcing all API access through store/hooks (commented-out rule block exists in eslint.config.js).
- [ ] Consider replacing `any[]` pagination in `fetchAllTasksForList` with a structural “API-like” type for better editor help and safer mapping.
- [ ] TODO(P2) The details SubtaskRow are not truncating and need to be because it breaks the UI by pushing the badges behind the action buttons.

- [ ] TODO(P1) Right now Inbox has the ability to "dismiss" tasks. Should it? Without using a URL"hack," it is not possible to get to the system inbox list--and this list is technically just a staging area for tasks with no list.

