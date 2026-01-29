<!-- {root}/docs/MILESTONES.md -->

# TaskMaster Milestones

This file tags major milestones so progress can be reasoned about clearly.

---

## ✅ Milestone: GraphQL Backbone Established

**Completed**

- Amplify Auth configured once at app startup
- GraphQL schema deployed
- DynamoDB tables auto-generated via `@model`
- Owner-based auth rules working
- Admin group wired and verified
- Dev-only GraphQL smoke tests passing

This milestone means:
> “The backend is real, stable, and boring (in a good way).”

---

## 🟡 Milestone: MVP Complete

**In Progress**

Criteria:
- Core pages are demoable end-to-end:
  - Inbox
  - Lists + List details (pane stack)
  - Tasks
  - Updates
  - Admin console (`/admin`) for admins (read-only inspection)
- Basic CRUD works end-to-end
- Errors are surfaced cleanly
- App is demoable without caveats

When this milestone is reached:
> “This is a real app, not a prototype.”

---

## 🔵 Milestone: State Architecture Stabilized

**Completed**

Criteria:
- Zustand introduced
- GraphQL calls isolated to an API boundary
- UI reads from store only
- No `tick / refresh()` usage
- Clear ownership of client vs server state

Notes:
- Store selectors must return stable snapshots (React 19 `useSyncExternalStore` requirement).
- Persisted slices are minimal and derived indexes are rebuilt on hydration.

When this milestone is reached:
> “The app is easy to reason about.”

---

## ⚪ Milestone: Offline-Ready

**Designed, Deferred**

Criteria:
- IndexedDB cache implemented
- Offline mutation queue in place
- Sync + conflict resolution working
- Clear UX for offline states

When this milestone is reached:
> “The app works anywhere, anytime.”

---

## ✅ Milestone: Persisted UX State + Cache (Local)

**Completed**

Criteria:
- Tasks/lists are cached locally with TTL and revalidated on refresh.
- Derived indexes are rebuilt from canonical arrays on hydration.
- Inbox preferences/dismissals persist locally.
- Updates feed + read markers persist locally.

When this milestone is reached:
> “Reloads are fast and UI state is resilient.”

---

## TODO: Milestone verification notes

Milestones should be periodically re-verified as features expand.