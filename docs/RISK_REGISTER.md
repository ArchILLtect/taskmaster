# Risk Register

This file tracks risks and mitigations for TaskMaster.

## Risks

### R1 — Docs vs implementation drift
- **Risk:** Planning docs describe GraphQL-backed behavior while the UI currently uses mocks/local stores.
- **Impact:** Confusion during onboarding and during implementation.
- **Mitigation:** Add TODO callouts in docs and keep [docs/INDEX.md](INDEX.md) current.

### R2 — Local persistence complexity
- **Risk:** localStorage patch/event stores grow into an accidental state architecture.
- **Impact:** Hard-to-debug UI refresh patterns (`tick/refresh`).
- **Mitigation:** Follow the roadmap to migrate to a single store boundary (Zustand) and keep persistence behind services.

### R3 — Auth + access control correctness
- **Risk:** Owner-based auth can be subtly wrong (e.g., owner reassignment, group edge cases).
- **Impact:** Security/correctness issues when backend is enabled.
- **Mitigation:** Document auth invariants and add dedicated smoke tests once GraphQL is wired.

### R4 — Time zone handling
- **Risk:** Mixed time zone assumptions (due dates, formatting).
- **Impact:** Incorrect due dates and confusing UI.
- **Mitigation:** Standardize date/time helpers and storage format.

> TODO: Add severity/likelihood scoring once project scope solidifies.
