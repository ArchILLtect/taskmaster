
# TODO (as time permits)

This file is a running backlog of ideas, cleanups, and future improvements.

## Platform / Foundations
- [ ] Normalize all time-related features by initializing and using the current time zone as the base for all times (display, storage, comparisons)

## Data & Services
- [ ] Zustand state (source of truth):
     - [ ] tasks (including created/patch/deleted merged state)
     - [ ] update events feed
     - [ ] updates read-state (lastReadAt/clearedBeforeAt)
- [ ] Still local component state:
     - [ ] showAddTaskForm, showAddListItemForm, form inputs (title/desc/due/priority), UI toggles

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
- [ ] In TaskDetailsPane, your “Due: {selected.dueAt ?? 'Someday'}” prints an ISO string. Later you’ll want a formatter, but not urgent.
- [ ] Update ProfilePage to use real auth/user data (Cognito/Amplify) instead of `src/mocks/currentUser.ts`
- [ ] Add an app footer
  - [ ] Link to your showcase site
  - [ ] Move the Sign Out button into the footer
  - [ ] Add an email link: `mailto:nick@nickhanson.me`
- [ ] Replace the tick/refresh() pattern everywhere (but during the migration)--Don’t refactor it now. Just note where it exists:
   - ListPage / UpdatesPage / InboxPage / TasksPage etc.
   - When Zustand lands, refresh() disappears and components re-render via selectors.

## Routing & Navigation
- [ ] . . .

## Testing & Quality
- [ ] Add a tiny “dev reset” helper (optional but helpful)--Not required, but it saves you pain while iterating:
  - a function (or button in a dev-only area) that clears:
    - taskmaster.taskPatches.v1
    - taskmaster.updateEvents.v1
    - taskmaster.updates.v1
  - So when something gets weird you can nuke localStorage without spelunking.
## Performance
- [ ] . . .

## Docs
- [ ] . . .

