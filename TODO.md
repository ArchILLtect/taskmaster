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

- [ ] TODO(P1) Zustand state (post-MVP)
  - [ ] tasks (GraphQL-backed, cached client-side)
  - [ ] taskLists
  - [ ] update feed (derived from updatedAt / createdAt)
  - [ ] updates read-state (lastReadAt / clearedBeforeAt)

- [ ] TODO(P1) Gradually migrate pages from mock/local services → GraphQL
  - [ ] InboxPage
  - [ ] ListPage
  - [ ] UpdatesPage

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
  - Replace `src/mocks/currentUser.ts`

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

- [ ] TODO(P4) Investigate production bundle size & code splitting
  - Vite warning: main JS chunk > 500 kB (≈1.4 MB minified, ≈395 kB gzip)
  - Likely contributors:
    - Chakra UI
    - AWS Amplify (Auth + API)
    - Large page components (ListPage, UpdatesPage, TasksPage)
  - Notes:
    - Lazy-loading the DevPage increased bundle size (expected; DevPage is tiny)
    - Optimization should focus on **route-level code splitting**, not dev tooling
  - Possible actions (later):
    - Convert major routes to `React.lazy()`:
      - ListPage
      - UpdatesPage
      - TasksPage
    - Consider `manualChunks` in `vite.config.ts` if needed
    - Re-evaluate after MVP UX + Zustand migration
  - Status:
    - Non-blocking for MVP
    - Safe to defer until performance tuning phase
