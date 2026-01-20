<!-- {root}/TODO.md -->

# TODO (as time permits)

This file is a running backlog of ideas, cleanups, and future improvements.

## Platform / Foundations
- [ ] Normalize all time-related features by initializing and using the current time zone as the base for all times (display, storage, comparisons)

## Data & Services
- [ ] Zustand state (post-MVP):
  - [ ] tasks (GraphQL-backed, cached client-side)
  - [ ] taskLists
  - [ ] update feed (derived from updatedAt / createdAt)
  - [ ] updates read-state (lastReadAt / clearedBeforeAt)

- [ ] Gradually migrate pages from mock/local services → GraphQL
  - [ ] InboxPage
  - [ ] ListPage
  - [ ] UpdatesPage

## Offline Mode (Post-MVP)
- [ ] Implement offline support following:
  - `/docs/offline-mode-design.md`
- [ ] Introduce IndexedDB-backed cache
- [ ] Add offline mutation queue + replay logic
- [ ] Add sync status UI (offline / syncing / error)

⚠️ Offline mode is intentionally deferred until:
- GraphQL CRUD is stable
- Zustand is the primary client cache
- MVP UX is complete

## Security & Auth (Post-MVP Hardening)
- [ ] Harden owner-based GraphQL auth rules
  - Prevent clients from reassigning the `owner` field on @model types
  - Apply field-level auth or remove `owner` from client-writable inputs
  - Ensure:
    - owners can CRUD only their own records
    - Admin group can read/write across users
    - ownership cannot be transferred via mutation payloads
  - Context:
    - Amplify warning: “owners may reassign ownership”
    - Deferred intentionally for MVP speed

## UI / UX
- [ ] Add date formatting helper for task due dates
  - In TaskDetailsPane, the “Due: {selected.dueAt ?? 'Someday'}” prints an ISO string. Later we’ll want a formatter, but not urgent.
- [ ] Update ProfilePage to use real auth/user data (Cognito/Amplify) instead of `src/mocks/currentUser.ts`
- [ ] Add an app footer
  - [ ] Link to the showcase site
  - [ ] Move the Sign Out button into the footer
  - [ ] Add an email link: `mailto:nick@nickhanson.me`
- [ ] Replace the tick/refresh() pattern everywhere (but during the migration)--Don’t refactor it now. Just note where it exists:
   - ListPage / UpdatesPage / InboxPage / TasksPage etc.
   - When Zustand lands, refresh() disappears and components re-render via selectors.


## Testing & Quality
- [ ] Add a tiny “dev reset local state” helper (optional but helpful)--Not required, but it saves you pain while iterating:
  - [ ] a function (or button in a dev-only area) that clears:
    - taskmaster.taskPatches.v1
    - taskmaster.updateEvents.v1
    - taskmaster.updates.v1
  - [ ] Useful during GraphQL/Zustand migration
    - So when something gets weird you can nuke localStorage without spelunking.

## Docs
- [ ] Keep `/docs/README.md` up to date as new design docs are added

## Routing & Navigation
- [ ] . . .

## Performance
- [ ] . . .

