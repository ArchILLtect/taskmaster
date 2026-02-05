<!-- {root}/TODO.md -->

# TO-DO (as time permits)

## `TODO` TAGGING RULES

This file is a running backlog of ideas, cleanups, and future improvements.

Actionable TODOs must use one of the following forms (do not include backticks):
- `TODO` + `(P1)` through `TODO` + `(P5)`   — prioritized work

## Index

- [Open Backlog (prioritized)](#open-backlog)
  - [P1](#p1)
  - [P2](#p2)
  - [P3](#p3)
  - [P4](#p4)
  - [P5](#p5)
  - [stretch](#stretch)
  - [postmvp](#postmvp)
- [Archive (implemented / completed)](#archive)

<a id="open-backlog"></a>
## Open Backlog (prioritized)

<a id="continual"></a>
### `TODO`(continual)

- [ ] TODO(continual) Keep `/docs/README.md` up to date as new design docs are added

- [ ] TODO(continual) Manual QA regression sweep (pre-showcase)
  - Auth + redirects:
    - Deep link to a protected page → confirm redirect to `/login?redirect=...` works and sanitization prevents external redirects
    - Sign out from a deep-linked page → confirm app returns to a safe public route (and no loops)
  - Multi-tab:
    - Sign out in Tab A → Tab B should not show stale private data after navigation/refresh
  - Persistence hygiene:
    - Switch accounts without a hard reload → confirm no cross-user flash (tasks, inbox indicators, favorites, user UI)
    - Use DevPage "Clear all user caches" → confirm stores rehydrate cleanly on next refresh
  - Demo-only UX:
    - Start demo mode → confirm confirmation dialog + one-time tour appear
    - Fail demo request (simulate by turning off network) → confirm demo session flag is cleared and error is visible


<a id="p1"></a>
### `TODO`(P1)


- [ ] TODO(P1) Basic UX polish passes: keyboard navigation + focus states (accessibility), mobile/responsive review, and loading/error empty-state consistency across pages.
  - Status (Feb 2026): most “no-layout-risk” a11y fixes shipped (focus-visible rings, skip-to-content, icon-button aria-labels, remove nested interactive header controls, form label/id/name hygiene).
  - Tester script/checklist: `docs/TESTER_SCRIPT.md`
  - [ ] MVP-critical manual validation (3 demo-critical flows)
    - [ ] Flow 1: Sign in → Inbox triage → edit task
      - Keyboard-only: tab order makes sense; focus is visible; no traps; Esc closes dialogs; Enter/Space activate buttons; toast notifications don’t steal focus.
      - Screen-reader-name sniff test: icon-only buttons and collapsibles announce sensible names.
      - Mobile viewport spot-check: no horizontal scroll; action buttons still reachable.
    - [ ] Flow 2: Lists → open pane stack → navigate stack
      - Keyboard-only: task rows are reachable; stack panes don’t create focus traps; Back/close behaviors are predictable.
      - Responsive: base breakpoint doesn’t overflow; panes usable on small widths.
    - [ ] Flow 3: Settings
      - Keyboard-only: selects/switches operable; focus ring visible; no missing labels.
      - Autofill sanity: inputs/selects have stable labels and names.
  - [ ] Loading/error/empty-state audit (MVP)
    - [x] Standardize primary routes’ error states + Retry (Today/Week/Month/Tasks/Updates/Lists/Favorites/Settings)
    - Ensure every page has: loading (spinner), error (message + Retry), empty (clear text + next action when possible).
    - Confirm no raw/un-styled error dumps (console-only errors are OK; UI should still show a friendly error block).
  - [x] Stretch (optional, but great for employer confidence)
    - [x] Add automated a11y checks (Playwright + axe) for the 3 flows’ key routes.
    - [x] Add a small responsive smoke (Playwright setViewportSize + screenshot diff is optional).

--[DONE]--

- [x] `TODO`(P1) Manual sanity (demo-visible):
  - Create 3 tasks: due yesterday, due today, due tomorrow → confirm Today badges/sections match expectations.
  - Change a task’s due date via Edit Task → confirm it moves between Overdue/Due today immediately.
  - Timezone drift check (Chrome DevTools → More tools → Sensors → Timezone override):
    - Override to a negative offset (e.g. `Pacific/Honolulu`) then a positive offset (e.g. `Pacific/Kiritimati`) and refresh.
    - Confirm the same task stays classified as overdue vs due-today vs future (no day shifting).
  - Confirm “Someday/Anytime” tasks never appear in overdue/due-today counts.

<a id="p2"></a>
### `TODO`(P2)

- [x] `TODO`(P2) Performance: investigate bundle size + add route-level code splitting
  - Vite warning: main JS chunk > 500 kB
  - Likely contributors: Chakra UI, AWS Amplify (Auth + API), large route components
  - Status (Feb 2026): route-level code splitting added for the biggest pages + basic `manualChunks` vendor splitting; main `index` chunk is now much smaller, though Vite may still warn about a large vendor chunk.
  - Route-level `React.lazy()` (highest impact first):
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
  - Optional: consider `manualChunks` in `vite.config.ts` if needed

- [x] `TODO`(P2) Minimal automated smoke coverage: even 1–2 Playwright tests (“sign in → seed → see Today/Inbox/Tasks render”) gives huge confidence for a showcase.
  - Run: `npm run test:e2e`
  - Optional HTML report: `npm run test:e2e:html` then `npm run test:e2e:report`

- [x] `TODO`(P2) Talk about how the demo-mode "script" works, and:
  - Is there still more work that needs to be done?
  - How are you supposed to open it after closing to do a step?
  - We either need to add more info about how to use demo mode including:
    - How to clear demo-mode when done, etc.
    - Use modal or create a demo page for this?

- [x] `TODO`(P2) Normalize all time-related features by initializing and using the current time zone as the base for all times
  - [x] (foundation): `src/services/dateTime.ts` centralizes timezone detection (`getUserTimeZone`) + day-key helpers for comparisons/labels.
  - [x] (comparisons): overdue/due-soon logic uses day-key semantics in triage/views.
  - [x] (consistency): removed remaining ad-hoc ISO/date conversions in UI and standardized due-date encoding/decoding.
    - Added `isoToDateInputValue()` and used day-key extraction (no timezone-dependent `Date` parsing for `dueAt`).
    - Made `normalizeDateInputToIso()` strict (reject invalid rollover dates) and consistently store `YYYY-MM-DDT00:00:00.000Z`.


- [x] `TODO`(P2) CI: enforce `npm run lint` + `npm run build` on PRs
  - Goal: keep the UI-layer API import restrictions enforced and prevent accidental regressions

- [x] `TODO`(P2) Harden owner-based GraphQL auth rules
  - Prevent clients from reassigning the `owner` field on @model types
  - Apply field-level auth or remove `owner` from client-writable inputs
  - Ensure:
    - owners can CRUD only their own records
    - Admin group can read/write across users
    - ownership cannot be transferred via mutation payloads
  - Context:
    - Amplify warning: “owners may reassign ownership”
    - Deferred intentionally for MVP speed

<a id="p3"></a>
### `TODO`(P3)

- [ ] TODO(P3) AdminPage: refactor filter controls to use shared UI patterns (tooltip labels + FormSelect) and remove raw HTML selects

- [ ] TODO(P3) Settings persistence: versioned blob + migrations + validation
  - Candidate home: `UserProfile.settings/settingsVersion` (preferred) vs a separate Settings model
  - Migration path: bring existing local settings (e.g. dueSoonWindowDays) + tip dismissals into the settings blob
  - Persisted settings helper:
    - a single place to read/write user settings (local-first now, UserProfile-backed later)
    - versioned settings schema + forward-only migrations
    - safe defaults + normalization
    - easy to add new settings without scattering localStorage keys
  - Runtime validators + normalizers for `settings` and `onboarding` blobs
    - validate shape aggressively before using values in UI
    - default-fill + version migrations (forward-only)
  - Stretch: persist settings + tips in GraphQL (AppSync) instead of localStorage once migrations + UX are stable

- [ ] TODO(P3) Add “Snooze” for overdue (and due-soon) tasks
  - Goal: temporarily hide tasks from overdue/due-soon indicators and sections without losing them
  - UX ideas:
    - Add a Snooze button on TaskRow and/or in Inbox triage sections
    - Provide quick presets: 1 hour, later today, tomorrow morning, next week
    - Optional: “Bump due date” quick actions (e.g. +1 day / +3 days / +1 week)
    - Show a “Snoozed until …” chip + an “Unsnooze” action
  - Options (implementation):
    - A) Local-only (fastest): add a user-scoped persisted map like `snoozedUntilByTaskId: Record<string, string>` (ISO) in `inboxStore` or `localSettingsStore`; triage views ignore tasks until `now >= snoozedUntil`.
    - B) Task-backed (cross-device): add a nullable GraphQL field on Task (e.g. `snoozedUntil`) and treat it like a soft visibility rule in Today/Week/Inbox.
    - C) Due-date mutation (aka “bump due date”; simplest but changes meaning): implement snooze by moving `dueAt` forward (e.g. +1 day / +3 days) and optionally recording the prior due date in a local-only “original due” map.
  - Open questions:
    - Should snoozed tasks be hidden everywhere, or only from Inbox/Triage + overdue badges?
    - Should snooze apply only to open tasks, and should it clear automatically when a task is completed?
    - Do we want “bump due date” as a distinct action (explicitly edits dueAt) vs treating it as one Snooze strategy?

- [ ] TODO(P3) Replace the tick/refresh() pattern everywhere (after migration)
  - [x] (prereq): Zustand store actions already call `refreshAll()` after mutations.
  - [ ] (refactor): remove remaining `refresh` prop threading and redundant `refresh()` calls in pages/components.

- [ ] TODO(P3) Replace `any[]` pagination in `fetchAllTasksForList` with a structural “API-like” type
  - Goal: better editor help + safer mapping in `toTaskUI`

- [x] `TODO`(P3) Add a manual QA checklist for auth/cache hygiene
  - Sign in as User A → verify tasks + user metadata
  - Sign out → sign in as User B → verify no cross-user flashes
  - Verify DevPage "Clear all user caches" produces a clean, correct state
  - Status: validated Feb 2026

<a id="p4"></a>
### `TODO`(P4)

- [ ] TODO(P4) ESLint guardrail: if we introduce additional Amplify enums used by UI (beyond TaskStatus/TaskPriority), expand the allowlist
  - Update `eslint.config.js` (`no-restricted-imports` → allowImportNames) so UI can import enums from `../API` without importing generated models

<a id="p5"></a>
### `TODO`(P5)

- [ ] TODO(P5) Offline mode (follow `/docs/offline-mode-design.md`)
  - Introduce IndexedDB-backed cache
  - Add offline mutation queue + replay logic
  - Add sync status UI (offline / syncing / error states)

⚠️ Offline mode is intentionally deferred until:
- GraphQL CRUD is stable
- Zustand is the primary client cache
- MVP UX is complete

<a id="stretch"></a>
### `TODO`(stretch)

- [ ] TODO(stretch) Inbox triage: decide whether “dismiss” should exist long-term and how it fits in with future features and how it differs from UpdatesPage.
  - [x] Inbox triage supports “dismiss”.
  - [ ] define long-term intent (dismiss vs snooze), and ensure dismissed tasks remain discoverable (show dismissed and/or add a system inbox list route).

- [ ] TODO(stretch) Add deploy-time CSP + baseline security headers
  - Goal: make XSS impact much smaller even if a bug slips in
  - Add via hosting config:
    - Amplify Hosting: custom headers (recommended) or a CloudFront response headers policy
    - Netlify: `_headers` file in `public/` (or `netlify.toml`)
  - Safe starter CSP (works for most SPAs; validate against Amplify UI + Vite build output and iterate as needed):
    - `default-src 'self'`
    - `base-uri 'self'`
    - `object-src 'none'`
    - `frame-ancestors 'none'`
    - `img-src 'self' data: https:`
    - `font-src 'self' data: https:`
    - `style-src 'self' 'unsafe-inline' https:`
    - `script-src 'self'`
    - `connect-src 'self' https:`
  - Notes / iteration knobs:
    - If auth or API calls fail, extend `connect-src` with the specific Amplify/AppSync/Cognito endpoints your deployed app uses.
    - If you introduce analytics or third-party widgets, whitelist only their specific origins.
    - Keep `script-src` strict (avoid `'unsafe-inline'` / `'unsafe-eval'` unless you have a proven need).
  - Also consider: `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`
  - Document final headers in `docs/SECURITY_CHECKLIST.md`

- [ ] TODO(stretch) Backend validation for field constraints (don’t rely on client)
  - GraphQL schema enforces type/required fields, but not max string lengths
  - Enforce title/name/description max length + date semantics in AppSync resolvers (VTL/JS) or a Lambda wrapper
  - Reject invalid inputs with clear errors; keep client normalization for UX only

- [ ] TODO(stretch) Add more contextual Tips across the app (including reusable component-level tips)
  - Audit existing Tips for relevance and remove any that feel redundant
  - Candidate components: task/list headers, empty states, filter bars

- [ ] TODO(stretch) Admin: add “Select all across pagination” for list selection
  - In Admin flow, Lists tab currently supports “Select all loaded”
  - Stretch: load remaining list pages for the selected account, then select all
  - Useful for power admins; keep optional to avoid extra AppSync load by default

- [ ] TODO(stretch) Admin: enable editing/deleting items from the Admin console
  - Scope: allow Admins to update/delete Tasks and TaskLists across users from `/admin`
  - Add explicit UX guardrails (confirmations, clear labels, read-only defaults)
  - Ensure mutations are protected by GraphQL `@auth` group rules (Admin override) and cannot reassign ownership
  - Consider safe-mode behavior for legacy records (required fields / partial rows)
  - Intentionally deferred for now so the new Admin UX ships without risky write paths

- [ ] TODO(stretch) Make Updates logging “perfect” by comparing before/after task status
  - Today: `taskmasterApi.updateTask()` infers completed/reopened vs updated based on which fields are present in the payload
  - Ideal: compare previous task state vs next task state (e.g., status transition) before emitting `task_completed` / `task_reopened`
  - Options:
    - Pass `prevStatus` (or a snapshot) from UI to the API wrapper as metadata
    - Fetch the task before update (extra round-trip; be careful about latency)

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

- [ ] TODO(stretch) Admin: delete Cognito user accounts from the app
  - Would require a backend function (Lambda) with Cognito admin permissions (e.g. `AdminDeleteUser`).
  - UI alone can’t securely delete Cognito identities.
  - Consider coupling with an app-data cleanup flow (delete UserProfile + tasks/lists) for a full deprovision.

- [ ] TODO(stretch) Post-MVP: Add AWS WAF rate limiting for `POST /auth/demo`
  - [ ] Create a Web ACL in `us-east-2` and attach it to the API Gateway stage for `taskmasterAuth`
  - [ ] Add a rate-based rule keyed by source IP (start with 5 requests / 5 minutes)
  - [ ] Validate behavior (normal demo works; burst requests get blocked)
  - [ ] Remove the in-Lambda `ipBuckets` limiter (or keep as a fallback with a higher threshold, but don’t double-punish users)

- [ ] TODO(stretch) Consider adding an "Overdue" View (conditional)
  - Option: keep overdue sections inside Today/Week for visibility (MVP), but also add a dedicated `/overdue` view.
  - UX: only show the Overdue view link when there are overdue tasks; style it as high-salience (red + icon).

<a id="postmvp"></a>
### `TODO`(postmvp)

- [ ] TODO(postmvp) Switch from Pattern B → Pattern A
  - During iteration: local-first + optional sync
  - Final MVP: server-authoritative in `UserProfile`
  - See definition: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) → “Pattern A / Pattern B”.

- [ ] TODO(postmvp) Demo entry: unify flow via `/login?intent=demo`
  - Goal: make demo entry a single, shareable, route-driven flow instead of duplicating logic across pages.
  - UX:
    - Home “Try Demo” navigates to `/login?intent=demo&redirect=...`
    - LoginPage uses `intent=demo` to auto-open (or prominently highlight) the demo confirmation dialog
  - Code health:
    - Centralize demo-start logic in one place (a hook/service), so Home/Login don’t maintain parallel versions
    - Keep `redirect` behavior consistent with normal auth flows

- [ ] TODO(postmvp) Demo tools: make “Clear demo data” safe for real users
  - Problem: current behavior moves non-demo tasks *that are inside demo lists* into the system `__Inbox`.
  - Risk: if a user has real work living under demo lists (incl. subtasks), this becomes a cleanup burden.
  - Desired behavior (safer defaults):
    - Never mass-move non-demo tasks into `__Inbox` by default (even when they’re inside demo lists).
    - Prefer: convert the containing demo list(s) to non-demo (set `isDemo=false`, rename with a “Recovered” prefix), OR prompt for a destination list, OR create a dedicated “Recovered” list and preserve hierarchy.
    - Add stronger UX guardrails: explicit confirmation copy + counts (lists/tasks/subtasks), and a clear “this is destructive” warning.
  - MVP note: intentionally deferred, but tracked for post-MVP hardening.

- [ ] TODO(postmvp) Demo tools: allow converting demo tasks to “real” tasks
  - Goal: let users keep a demo task without recreating/copying it.
  - UX: add a “Keep this task” / “Convert to real” action (best surface: TaskDetailsPane; optional in Edit Task).
  - Behavior:
    - Convert the selected Task (and optionally its subtask subtree) to `isDemo=false`.
    - If the task currently lives in a demo list:
      - Prompt for destination list (default: Inbox), OR
      - Auto-create a non-demo “Recovered” list and move it there, OR
      - Offer “Convert this list to real” (set list `isDemo=false`) as an alternative.
  - Guardrails:
    - Clear confirmation copy (explain how “Clear demo data” interacts with items living inside demo lists).
    - Preserve hierarchy + ordering where possible.
    - Ensure the conversion is resilient if some legacy rows are missing required fields.

- [ ] TODO(postmvp) Audit & remove legacy non-null violations (starting with `isDemo`)
  - See: [docs/LEGACY_DATA_CLEANUP.md](docs/LEGACY_DATA_CLEANUP.md)
  - Why: current UI reads prefer selecting `isDemo`, but fall back to omitting it when the backend throws `Cannot return null for non-nullable type ... isDemo`.
  - How to detect:
    - In-app: use Admin diagnostics (lists/tasks “isDemo mode” indicators) and look for the safe-fallback warning states.
    - Backend: run an admin-only scan/query for any `Task` / `TaskList` records missing `isDemo` (or returning null) and count them.
    - Logs: watch for GraphQL errors containing `Cannot return null for non-nullable type` + the field name.
  - What to do once confirmed:
    - Backfill: write a one-off admin script/mutation pass to set `isDemo=false` on any legacy records that are missing it.
    - Then: remove the safe-fallback query paths and always select `isDemo` in normal UI queries.
  - Also check: any other known legacy required fields (e.g. admin service already has safe fallbacks for `UserProfile.email`), and remove those fallbacks once fully backfilled.

- [ ] TODO(postmvp) Decide “reset/purge” strategy to eliminate legacy data before launch
  - See: [docs/LEGACY_DATA_CLEANUP.md](docs/LEGACY_DATA_CLEANUP.md)
  - Option A (clean): backfill legacy records (preferred if you want continuity for existing testers).
  - Option B (nuke): purge all existing accounts + GraphQL records, then recreate Admin + testers.
    - Pros: guarantees no legacy records remain; simplest way to ensure required fields are present everywhere.
    - Cons: deletes all historical testing data; requires careful coordination and confirming you’re in the right environment.
  - If choosing Option B:
    - Document exact steps (Cognito user deletion + DynamoDB/AppSync model table purge) and verify they’re run against the correct Amplify env.
    - After reset: disable safe-fallbacks and keep `isDemo` selected everywhere.

- [ ] TODO(postmvp) Hardening: align minimal GraphQL selection sets with TypeScript types
  - Decision (Feb 2026): defer. Current MVP flow maps GraphQL → UI types via `toTaskUI` / `toListUI` and does not rely on relation payloads.
  - Current state: `src/api/operationsMinimal.ts` uses minimal selection sets but is typed with full Amplify-generated operation output types.
  - Risk: TypeScript can become misleading (it may appear that nested relations / extra fields exist when the selection set didn’t request them).
  - Revisit when:
    - you add features that read nested relation data from mutation results, or
    - you adopt normalized caching / entity identity patterns (Apollo/urql-style), or
    - you start seeing bugs caused by assumed-but-unselected fields.
  - Options:
    - Define custom minimal output types for the minimal ops (preferred for correctness), or
    - Expand minimal selection sets to match the generated types you’re using.

- [ ] TODO(postmvp) Consider adding `__typename` to minimal queries/mutations
  - Decision (Feb 2026): defer. Zustand indexing/memoization currently keys off explicit ids and doesn’t need `__typename`.
  - Notes:
    - Generated codegen ops already include `__typename`; the minimal ops intentionally omit it.
    - Add `__typename` later if you want stronger runtime discrimination (interfaces/unions) or to support normalized cache keys.

- [ ] TODO(postmvp) Support time-of-day due times (datetime) for tasks
  - Today: the UI treats `dueAt` as a “floating day” (date-only) value and formats/compares by day key to avoid timezone drift.
  - Upgrade path:
    - Add UX for optional time (e.g. `datetime-local`) and/or a separate `dueTime` field
    - Decide storage semantics (instant vs floating local time) and migration strategy
    - Update triage/views bucketing + formatting helpers to respect time-of-day where enabled

- [ ] TODO(postmvp) Task move: allow "move under another task" (reparent)
  - Ideal UX (A): drag/drop to change nesting + order
    - Best surface: ListDetailsPage + TaskDetailsPane stack (where the tree/context is visible)
    - Support: drop onto a task to make it a child, and drop between siblings to reorder
  - Fallback UX (B): manual reparent in the edit flow (ship this first)
    - Surface: add a "Parent" section to Edit Task (used by TasksPage edit dialog + TaskDetailsPane edit inline)
    - Step 1: choose target list
      - Use existing list selector UX (FormSelect)
      - Important: allow reparenting even when the user keeps the same list (don’t hide the parent controls)
    - Step 2: choose parent path (nested picker, but not confusing)
      - Default parent = "No parent (top-level)"
      - Recommended UI: a small, progressive "parent path" chooser
        - Level 1: "Parent (top-level)" select → shows *top-level* tasks in the chosen list
        - If a parent is selected and it has children, reveal Level 2: "…under" select → shows that parent’s subtasks
        - Repeat until the selected parent has no children, or the user stops (leaves next level blank)
      - Show a 1-line preview so users understand the result:
        - "Will move under: A ▸ B ▸ C" (or "Top-level")
      - UX guardrails:
        - Exclude the current task from all options
        - Disable (or hide) any descendant tasks as valid parents (cycle prevention)
        - Provide a quick "Clear parent" action to jump back to top-level
    - Optional (nice): "Move under another task" checkbox/toggle
      - Off: parent controls collapsed (keeps edit form compact)
      - On: reveals the parent path chooser (default still top-level until user picks)
    - Save behavior (minimum viable)
      - Persist: `listId`, `parentTaskId` (nullable)
      - Compute `sortOrder` at destination as end-of-siblings:
        - siblings = tasks with same `listId` AND same `parentTaskId`
        - `sortOrder = max(siblings.sortOrder) + 1`
      - If list changes, allow optionally choosing a parent in the destination list; otherwise force `parentTaskId=null`
    - Validation + error messaging
      - If selected parent is invalid (self/descendant/missing), block save + show a toast
      - If API rejects the update, keep the draft selections so the user can fix and retry
    - URL/pane-stack behavior
      - If the task is currently open in the pane stack and gets moved:
        - If it remains in the same list: keep the stack open (safe)
        - If it moves lists: navigate to the new stack root for that task to avoid "Task not found"

  - Staged rollout plan (do B first, then A)
    - Stage 1 (fastest): manual reparent within the same list only
      - Enable selecting parent path for tasks in ListDetailsPage/TaskDetailsPane edit
      - Save updates `parentTaskId` + `sortOrder` only
    - Stage 2: manual reparent across lists
      - Allow list change + parent selection in destination list
      - Ensure move clears/updates parent consistently and handles pane-stack navigation
    - Stage 3: ordering strategy upgrade (enables future drag/drop reorder)
      - Introduce sparse sortOrder spacing or occasional sibling renumbering
      - (Optional) batch update API/resolver support for reordering without N sequential mutations
    - Stage 4: drag/drop UI (A) on the stack view
      - Start with reparent-only (drop onto task changes parent, keep end-of-siblings ordering)
      - Then add between-sibling reorder once sortOrder strategy is proven stable

  - Save payload should support: `listId`, `parentTaskId` (nullable), and a reasonable `sortOrder` among new siblings
  - Guardrails:
    - Prevent cycles: disallow selecting self or any descendant as parent
    - Ensure the selected parent is in the same target list (or auto-fix/clear parent if list changes)
    - Decide: allow parenting under subtasks (deep nesting) vs only under top-level tasks
    - If a task is currently open in the pane stack, decide how URL + selection should respond after reparent

- [ ] TODO(postmvp) Task move: improve ordering when moving/reparenting
  - Today: moving lists resets `sortOrder` to `0` (good enough for MVP, but crude)
  - Better: compute next `sortOrder` for end-of-list among siblings (same list + same parentTaskId)
  - Drag/drop note: true “reorder within siblings” requires either (a) sparse sortOrder spacing, or (b) occasional renumbering of many siblings (batch updates)
  - Optional UX polish: "Move to top" vs "Move to bottom" vs "Keep relative order"

---

<a id="archive"></a>
## Archive (implemented / completed)

### Platform / Foundations

- [x] `TODO`(P3) Architecture guardrail: forbid direct imports from `src/api/**` inside `src/pages/**` and `src/components/**`
  - Enforced in `eslint.config.js` via `no-restricted-imports` for `src/pages/**`, `src/components/**`, and `src/hooks/**`.
  - Keeps UI-layer data access going through store/hooks.

- [x] `TODO`(P1) Create a disclosure/notification that "the app uses cookies/local storage" and that closes and persists acknowledgement so it does not reopen again later.

### UI / Frontend

- [x] `TODO`(P2) Add date formatting helper for task due dates
  - Implemented in `src/services/dateTime.ts` as `formatDueDate`.
  - Used by `TaskRow` and `TaskDetailsPane` so we no longer print raw ISO strings.

- [x] `TODO`(P2) Update ProfilePage to use real auth/user data (Cognito / Amplify)
  - Uses `useUserUI` via the profile page data hook.

- [x] `TODO`(P2) Ensure user metadata always updates on account switch
  - Implemented via auth lifecycle hooks + Hub listeners (`useAuthUser` + `useUserUI`) and cache guards.
  - Validation still belongs in the manual QA checklist item (fast account switches without reload).

- [x] `TODO`(P3) Add an app footer
  - [x] Link to the showcase site
  - [x] Move the Sign Out button into the footer
  - [x] Add an email link: `mailto:nick@nickhanson.me`

- [x] `TODO`(P1) Find a way to ensure refreshing of favorites sidebar section upon starring/un-starring lists for favorites.

- [x] `TODO`(P1) Fix failing toasts from editing _and_ adding tasks and closing/canceling both windows on ListDetailsPage.
  - [x] Centralized a single global `Toaster` mount in the app shell (removed per-page mounts).
  - [x] Normalized toast calls: `fireToast(...)` is synchronous and no longer awaited.

- [x] `TODO`(P1) Add Tooltip/Toast for "already in inbox"

### Demo Mode + UserProfile seeding (MVP-critical)

- [x] `TODO`(P1) Add `UserProfile` GraphQL model (owned by sub)
  - Implemented in [amplify/backend/api/taskmaster/schema.graphql](amplify/backend/api/taskmaster/schema.graphql)
  - Key fields: `id (sub)`, `owner (sub)`, `email`, `seedVersion`, `seededAt`, `settingsVersion/settings`, `onboardingVersion/onboarding`

- [x] `TODO`(P1) Implement bootstrap: fetch/create `UserProfile` on login
  - Centralized in the app shell; runs once per authenticated session.
  - Version gate: if missing or `seedVersion < CURRENT_SEED_VERSION`, run the seed flow.

- [x] `TODO`(P1) Implement seed flow (idempotent + race-safe)
  - Seed creates example lists + tasks (including subtasks) and marks them `isDemo: true`.
  - Multi-tab safety uses conditional updates on `UserProfile.seedVersion` with an in-progress lock value (`-1`).
  - Finalizes by setting `seedVersion = CURRENT_SEED_VERSION` and `seededAt = now`.

- [x] `TODO`(P1) Add “Demo seed” UX (minimal)
  - MVP behavior: always seed for all accounts by default.
  - Temporary opt-out supported (e.g. `?demo=0` or per-user `localStorage.taskmaster:u:<scope>:seedDemo = "0"`).

- [x] `TODO`(P2) Demo onboarding polish (confirmation + quick tour)
  - Home/Login: show a confirmation + explanation step before creating a demo user + signing in.
  - Demo sessions: show a one-time “Demo quick tour” checklist (dismissed via user-scoped key `demoTourSeen:v1`).

- [x] `TODO`(P1) Account-switch cleanup for user-scoped caches + bootstrap
  - [x] On sign out: clear `taskStore` persisted cache + user UI cache (and other user-scoped caches)
  - [x] On sign in: bootstrap runs after auth restore and cache guards prevent cross-user flashes

- [x] `TODO`(P1) Add a Demo data section within SettingsPage that contains these features:
  - [x] A button to clear all demo data.
  - [x] A button to re-seed all demo data ('reset demo data').
    - Note: Demo users already have a footer "Reset demo data" action. This Settings version is for non-demo accounts and must NOT remove non-demo data (implement later with stricter filtering/guardrails).
  - [x] A section for adding more demo data with:
    - [x] A button to add more tasks with multiplier. "Add [ x ] tasks."
    - [x] A button to add more lists with multiplier. "Add [ x ] lists."
    - [x] A button to add both with separate multipliers. "Add [ x ] tasks and [ x ] lists."."

### Settings + onboarding blob strategy (light MVP)

- [x] `TODO`(P1) Add user-configurable default post-login landing route
  - Implemented (local-only): Settings selector persists per-user in `localSettingsStore`.
  - Behavior:
    - If `?redirect=` is present (from `RequireAuth`), respect it (after sanitization)
    - Otherwise navigate to the configured landing route, defaulting to `/today`

- [x] `TODO`(P1) Zustand state (MVP shipped)
  - [x] tasks + taskLists (GraphQL-backed, cached client-side)
  - [x] updates feed (persisted event feed)
  - [x] updates read-state (lastReadAt / clearedBeforeAt)
  - [x] inbox UX state (dismissals, lastViewedAt, dueSoonWindowDays)

- [x] `TODO`(P1) Migrate page reads/writes → store hooks/actions
  - [x] InboxPage
  - [x] ListDetailsPage
  - [x] UpdatesPage
  - [x] TasksPage

- [x] `TODO`(P2) Persist client-side state (localStorage)
  - Implemented:
    - tasks/lists cache (versioned + TTL)
    - inbox local state (dismissed ids, lastViewedAt, dueSoonWindowDays)
    - updates feed + read markers
    - userUI cache (username/email/role with TTL)
  - Note: persisted keys are now user-scoped (to prevent cross-user mixing on shared browsers) with safe legacy migrations.
  - Future: consider moving persistence to IndexedDB for offline mode.

- [x] `TODO`(P3) Scope inbox/updates localStorage keys by user sub (optional polish)
  - Implemented via `taskmaster:u:<scope>:...` key prefixing (see `taskmaster:authScope`)
  - Inbox/Updates/TaskStore/UserUI/LocalSettings are stored under per-user `zustand:` keys
  - Legacy unscoped keys (`taskmaster:inbox`, `taskmaster:updates`, etc.) are migrated only when a signed-in scope is known

### Testing & Quality

- [x] `TODO`(P3) Add a tiny “dev reset local state” helper
  - Implemented via DevPage: "Clear all user caches".
  - Clears current user's persisted caches (user-scoped) and resets in-memory session state:
    - `taskmaster:u:<scope>:zustand:taskmaster:taskStore`
    - `taskmaster:u:<scope>:zustand:taskmaster:inbox`
    - `taskmaster:u:<scope>:zustand:taskmaster:updates`
  - Notes:
    - `<scope>` is the value of `taskmaster:authScope`
    - Legacy unscoped keys are handled separately and should not be relied on going forward

### Routing & Navigation

- [x] `TODO`(stretch) Improve navigation for system Inbox tasks
  Prefer navigation to InboxPage for task in __Inbox instead of disabled navigation.

- [x] `TODO`(P1) Improve navigation for system Inbox list
  - [x] system Inbox is treated as special (hidden from normal list visibility/favorites; edit/favorite/delete disabled when detected).
  - [x] Decision (Feb 2026): keep it exclusively behind `/inbox` triage.
    - The “system Inbox list” is an implementation detail (a staging bucket), not a user-facing List.
    - Do not add a dedicated page for it and do not special-case `ListDetailsPage` to display it.
