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
- Admin console (`/admin`) for cross-user inspection (read-only; editing/deleting deferred)
- Stable routing & UI patterns
- GraphQL smoke tests in `/dev`
- Pages wired to real backend data (no local placeholder data)

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
- Harden Zustand as the client-side source of truth
- Remove remaining ad-hoc local refresh patterns (prefer store-driven updates)
- Centralize data access (GraphQL → API wrapper → store → UI)
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
- Admin dashboards (expanded capabilities beyond read-only inspection)
- Analytics / usage insights
- Mobile-first polish

These are intentionally unspecified until earlier phases are complete.

---

## TODO: Current implementation status (docs vs code)

Current code reality (as of today):
- Pages read/write data via Zustand stores under `src/store/*`.
- Store actions call the GraphQL wrapper (`src/api/taskmasterApi.ts`).
- Local persistence uses Zustand `persist` for fast reloads (cached lists/tasks, updates feed, inbox prefs).

References:
- Current routing + pages: [src/App.tsx](../src/App.tsx)
- Tasks store (cache + actions): [src/store/taskStore.ts](../src/store/taskStore.ts)
- GraphQL wrapper: [src/api/taskmasterApi.ts](../src/api/taskmasterApi.ts)
- Updates store (persisted feed): [src/store/updatesStore.ts](../src/store/updatesStore.ts)

This roadmap remains the target direction; this section exists to prevent onboarding confusion as the MVP hardens.