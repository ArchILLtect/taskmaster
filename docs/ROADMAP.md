<!-- {root}/docs/ROADMAP.md -->

# TaskMaster Roadmap

This roadmap describes the planned evolution of TaskMaster from MVP to a fully offline-capable application.

The goal is **progressive complexity**:
- Ship something correct and useful early
- Add power only when the foundation is stable
- Never “wing it” when a design already exists

---

## Phase 1 — MVP (Current Focus)

**Status:** 🟡 In Progress

Primary goals:
- End-to-end correctness
- Predictable data flow
- Minimal magic
- No premature optimization

### Scope
- Cognito authentication (Amplify Auth)
- GraphQL backend (AppSync + DynamoDB via `@model`)
- Core CRUD:
  - TaskLists
  - Tasks
- Owner-based access control
- Admin group support (read/write)
- Stable routing & UI patterns
- GraphQL smoke tests in `/dev`
- Pages wired to real backend data (no mocks)

### Explicit non-goals
- Offline support
- Optimistic UI beyond simple cases
- Real-time subscriptions
- Complex conflict resolution

---

## Phase 2 — Post-MVP Hardening

**Status:** 🔵 Planned

This phase focuses on **quality and resilience**, not new features.

### Scope
- Introduce Zustand as the client-side source of truth
- Remove `tick / refresh()` patterns
- Centralize data access (GraphQL → store → UI)
- Clean up owner auth edge cases
- Improve Updates page (derived from timestamps)
- Better error handling & loading states
- Light performance tuning

### Outcomes
- UI no longer cares where data comes from
- Backend calls become predictable side-effects
- App feels “solid” instead of “prototype-ish”

---

## Phase 3 — Offline Mode

**Status:** ⚪ Designed, Deferred

Offline support is intentionally **not** part of the MVP.

Design lives in:
- `/docs/offline-mode-design.md`

### Scope
- IndexedDB-backed cache
- Offline mutation queue
- Optimistic UI
- Sync + conflict handling
- Explicit UX for offline/sync states

### Rule
Offline mode is implemented **only by following the design doc**.
No ad-hoc hacks.

---

## Phase 4 — Enhancements & Expansion (Optional)

**Status:** ⚪ Optional / Future

Possible directions:
- Subscriptions / real-time updates
- Collaboration / shared lists
- Admin dashboards
- Analytics / usage insights
- Mobile-first polish

These are intentionally unspecified until earlier phases are complete.