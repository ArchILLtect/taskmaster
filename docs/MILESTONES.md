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
- No mock data used in user-facing pages
- Core pages wired to GraphQL:
  - Inbox
  - List view
  - Updates
- Basic CRUD works end-to-end
- Errors are surfaced cleanly
- App is demoable without caveats

When this milestone is reached:
> “This is a real app, not a prototype.”

---

## 🔵 Milestone: State Architecture Stabilized

**Planned**

Criteria:
- Zustand introduced
- GraphQL calls isolated to a service layer
- UI reads from store only
- No `tick / refresh()` usage
- Clear ownership of client vs server state

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

## TODO: Milestone verification notes

Some milestone statements (notably “GraphQL Backbone Established” and “No mock data used in user-facing pages”) may not match the current runtime wiring.

Current code reality (as of today):
- UI pages use `src/mocks/*` as the primary data source.
- Local persistence exists via `src/services/*` (patch store + updates event store).
- Amplify/GraphQL schema exists, but the app is not yet fully migrated to it.

This TODO section is intentionally additive (no edits to the original milestone text) so we can reconcile the plan and the implementation later.