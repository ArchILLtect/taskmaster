# Risk Register

This file tracks risks and mitigations for TaskMaster.

## Risks

### R1 — Docs vs implementation drift
- **Risk:** Docs fall out of date as the store/persistence/routing architecture evolves.
- **Impact:** Confusion during onboarding and regression-prone implementation work.
- **Mitigation:** Keep [docs/INDEX.md](INDEX.md) and [docs/ARCHITECTURE.md](ARCHITECTURE.md) aligned with current code, and treat docs changes as part of feature work.

### R2 — Local persistence complexity
- **Risk:** persisted localStorage state grows into an accidental second source of truth.
- **Impact:** Hard-to-debug “stale UI” and cache invalidation issues.
- **Mitigation:** Keep persisted slices minimal and versioned (Zustand `persist`), rebuild derived data on hydration, and centralize all network interactions behind store actions + the API wrapper.

### R3 — Auth + access control correctness
- **Risk:** Owner-based auth can be subtly wrong (e.g., owner reassignment, group edge cases).
- **Impact:** Security/correctness issues when backend is enabled.
- **Mitigation:** Document auth invariants and keep dedicated smoke tests (e.g. `/dev`) for auth + GraphQL behavior.

### R4 — Time zone handling
- **Risk:** Mixed time zone assumptions (due dates, formatting).
- **Impact:** Incorrect due dates and confusing UI.
- **Mitigation:** Standardize date/time helpers and storage format.

> TODO: Add severity/likelihood scoring once project scope solidifies.
