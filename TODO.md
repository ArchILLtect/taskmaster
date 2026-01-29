<!-- {root}/TODO.md -->

# TO-DO (as time permits)

This file is a running backlog of ideas, cleanups, and future improvements.
Priorities use TODO(P1–P5) and TODO(stretch) and are surfaced via the todo-tree extension.

Last refreshed: Jan 28 2026

---

## Recently Completed (highlights)
- [x] TODO(P1) Zustand is the source of truth for tasks/lists (GraphQL-backed) with TTL + persistence.
- [x] TODO(P1) Cross-user cache hygiene: clear all user-scoped caches on sign-out + auth lifecycle guards.
- [x] TODO(P2) Dev tools: add a one-click "Clear all user caches" button.
- [x] TODO(P2) Docs overhaul: bring docs/README in sync with current architecture and remove any references to deleted local dev-only data/files.
- [x] TODO(P1) Demo seeding: UserProfile bootstrap + versioned, idempotent demo seed (multi-tab safe).
- [x] TODO(P1) MVP decision: seed demo data for all accounts by default (opt-out supported).

---

## Platform / Foundations
- [ ] TODO(P2) Normalize all time-related features by initializing and using the current time zone as the base for all times
  - display
  - comparisons

---

## Data & Services

- [ ] TODO(stretch) Make Updates logging “perfect” by comparing before/after task status
  - Today: `taskmasterApi.updateTask()` infers completed/reopened vs updated based on which fields are present in the payload
  - Ideal: compare previous task state vs next task state (e.g., status transition) before emitting `task_completed` / `task_reopened`
  - Options:
    - Pass `prevStatus` (or a snapshot) from UI to the API wrapper as metadata
    - Fetch the task before update (extra round-trip; be careful about latency)

---

## Demo Mode + UserProfile seeding (MVP-critical)

- [x] TODO(P1) Add `UserProfile` GraphQL model (owned by sub)
  - Implemented in [amplify/backend/api/taskmaster/schema.graphql](amplify/backend/api/taskmaster/schema.graphql)
  - Key fields: `id (sub)`, `owner (sub)`, `email`, `seedVersion`, `seededAt`, `settingsVersion/settings`, `onboardingVersion/onboarding`

- [x] TODO(P1) Implement bootstrap: fetch/create `UserProfile` on login
  - Centralized in the app shell; runs once per authenticated session.
  - Version gate: if missing or `seedVersion < CURRENT_SEED_VERSION`, run the seed flow.

- [x] TODO(P1) Implement seed flow (idempotent + race-safe)
  - Seed creates example lists + tasks (including subtasks) and marks them `isDemo: true`.
  - Multi-tab safety uses conditional updates on `UserProfile.seedVersion` with an in-progress lock value (`-1`).
  - Finalizes by setting `seedVersion = CURRENT_SEED_VERSION` and `seededAt = now`.

- [x] TODO(P1) Add “Demo seed” UX (minimal)
  - MVP behavior: always seed for all accounts by default.
  - Temporary opt-out supported (e.g. `?demo=0` or `localStorage.taskmaster:seedDemo = "0"`).

- [ ] TODO(P1) Account-switch cleanup for user-scoped caches + bootstrap
  - [x] On sign out: clear `taskStore` persisted cache + user UI cache (and other user-scoped caches)
  - [x] On sign in: bootstrap runs after auth restore and cache guards prevent cross-user flashes

- [ ] TODO(P2) Add a Demo data section within SettingsPage that contains these features:
   - [ ] A button to clear all demo data.
   - [ ] A button to re-seed all demo data.
   - [ ] A section for adding more demo data with:
      - [ ] A button to add more tasks with multiplier. "Add [ x ] tasks."
      - [ ] A button to add more lists with multiplier. "Add [ x ] lists."
      - [ ] A button to add both with separate multipliers. "Add [ x ] tasks and [ x ] lists."."

---

## Settings + onboarding blob strategy (light MVP)

- [ ] TODO(P2) Add runtime validators + normalizers for `settings` and `onboarding` blobs
  - Default-fill + version migrations (forward-only)
  - Validate shape aggressively before using any values in UI

- [ ] TODO(P2) Decide Pattern B → Pattern A timeline
  - During iteration: local-first + optional sync
  - Final MVP: server-authoritative in `UserProfile`

- [x] TODO(P1) Zustand state (MVP shipped)
  - [x] tasks + taskLists (GraphQL-backed, cached client-side)
  - [x] updates feed (persisted event feed)
  - [x] updates read-state (lastReadAt / clearedBeforeAt)
  - [x] inbox UX state (dismissals, lastViewedAt, dueSoonWindowDays)

- [x] TODO(P1) Migrate page reads/writes → store hooks/actions
  - [x] InboxPage
  - [x] ListDetailsPage
  - [x] UpdatesPage
  - [x] TasksPage

- [x] TODO(P2) Persist client-side state (localStorage)
  - Implemented:
    - tasks/lists cache (versioned + TTL)
    - inbox local state (dismissed ids, lastViewedAt, dueSoonWindowDays)
    - updates feed + read markers
    - userUI cache (username/email/role with TTL)
  - Future: consider moving persistence to IndexedDB for offline mode.

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

- [ ] TODO(P3) Scope inbox/updates localStorage keys by user sub (optional polish)
  - e.g. `taskmaster:inbox:<sub>` and `taskmaster:updates:<sub>`
  - On sign out: remove only current user keys (not a global wipe)
  - This is a stepping-stone if DynamoDB-per-user persistence is deferred


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

- [ ] TODO(stretch) Admin: delete Cognito user accounts from the app
  - Would require a backend function (Lambda) with Cognito admin permissions (e.g. `AdminDeleteUser`).
  - UI alone can’t securely delete Cognito identities.
  - Consider coupling with an app-data cleanup flow (delete UserProfile + tasks/lists) for a full deprovision.

---

## UI / UX

- [ ] TODO(P2) Add date formatting helper for task due dates
  - In TaskDetailsPane, the “Due: {selected.dueAt ?? 'Someday'}” prints an ISO string

- [ ] TODO(stretch) Admin: add “Select all across pagination” for list selection
  - In Admin flow, Lists tab currently supports “Select all loaded”
  - Stretch: load remaining list pages for the selected account, then select all
  - Useful for power admins; keep optional to avoid extra AppSync load by default

- [x] TODO(P2) Update ProfilePage to use real auth/user data (Cognito / Amplify)
  - Uses `useUserUI` via the profile page data hook.

- [ ] TODO(P2) Ensure user metadata always updates on account switch
  - Goal: avoid requiring a full browser reload to see username/email/role updates.
  - Today: fixed by clearing authService in-memory cache in `clearAllUserCaches()`; consider also keying `useUserUI` re-fetch on auth user identity.

- [ ] TODO(P3) Add an app footer
  - [ ] Link to the showcase site
  - [ ] Move the Sign Out button into the footer
  - [ ] Add an email link: `mailto:nick@nickhanson.me`

- [ ] TODO(P3) Replace the tick/refresh() pattern everywhere (after migration)
  - Zustand is now in place; this is now safe refactor work.
  - Targets:
    - Remove redundant `refresh()` calls after mutations where store actions already `refreshAll()`.
    - Prefer selectors/views over pushing refresh callbacks deep into components.

- [ ] TODO(P3) Find a way to ensure refreshing of favorites sidebar section upon starring/un-starring lists for favorites.
- [ ] TODO(P3) Fix failing toasts from editing _and_ adding tasks and closing/canceling both windows on ListDetailsPage.
- [ ] TODO(P4) Add Tooltip/Toast for "already in inbox"

---

## Testing & Quality

- [x] TODO(P3) Add a tiny “dev reset local state” helper
  - Implemented via DevPage: "Clear all user caches".
  - Clears/reset keys:
    - `taskmaster:taskStore`
    - `taskmaster:inbox`
    - `taskmaster:updates`
    - `taskmaster:user`

- [ ] TODO(P2) Investigate dev server exit (if still happening)
  - If `npm run dev` exits with code 1, capture the first error line and fix root cause.

- [ ] TODO(P3) Add a manual QA checklist for auth/cache hygiene
  - Sign in as User A → verify tasks + user metadata
  - Sign out → sign in as User B → verify no cross-user flashes
  - Verify DevPage "Clear all user caches" produces a clean, correct state

---

## Docs

- [ ] TODO(P2) Keep `/docs/README.md` up to date as new design docs are added

---

## Routing & Navigation
- [ ] TODO(P3) Improve navigation for system Inbox list
  - Today: Inbox is a dedicated triage view; the system Inbox list is not directly reachable like normal lists.
  - Decide: should system Inbox be a normal list route (read-only/edit-disabled) or remain hidden behind the Inbox triage?

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
    - DevPage (already lazy-loaded)
  - Suspense fallback:
    - Place the primary `<Suspense fallback={...}>` in AppShell’s main content area wrapping the `<Outlet />` region
    - Keep the sidebar/topbar always-rendered so navigation remains responsive while a page chunk loads
  - Error handling / boundaries:
    - Preserve existing ErrorBoundary behavior for route renders (don’t move the boundary inside a lazy-loaded component)
    - Ensure the ErrorBoundary still wraps whatever renders the lazy route element so dynamic import failures and render errors surface consistently


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

- [ ] TODO(P3) Cleanup: remove stray debug logging
  - Remove `console.log(user)` in App.tsx once you’re done debugging auth flows.

