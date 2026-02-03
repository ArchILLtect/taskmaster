# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project aims to follow Semantic Versioning when versions are introduced.

## [Unreleased]

### Added
- Zustand-first state architecture for tasks/lists, including derived indexes for fast reads.
- Persisted client-side caches (localStorage) with TTL refresh behavior.
- Dev-only GraphQL smoke test route (`/dev`).
- Admin-only console route (`/admin`) with step-by-step cross-user inspection (email → account → lists → tasks).
- Deployment and security checklists under /docs.
- README banner, badges, screenshots, and an architecture mini-diagram.
- Storage disclosure banner with persisted acknowledgement.
- Inbox triage UX: system Inbox staging + overdue/due-soon attention across all lists with per-task ignore and “Done triaging” bulk ignore.
- Settings controls:
  - Reset ignored Inbox notifications
  - Default landing/view route preferences
  - Demo data management (clear demo-only, reset demo data safely, add more demo data)

### Changed
- Updated documentation across /docs to match current Amplify (Cognito + AppSync) + Zustand architecture.
- Documented the new Admin console flow and the intentional decision to defer admin-driven editing/deleting in the console.
- Removed all references to deleted mock data/files; app/docs now assume real GraphQL-backed data.
- Improved README structure and navigation for onboarding and contributors.
- Local persistence is now scoped per signed-in user in localStorage to prevent cross-user cache flashes, with best-effort migration from legacy unscoped keys.

### Fixed
- Documentation drift: corrected stale references and aligned guides/checklists with current scripts, storage keys, and routing patterns.
- Hydration and UX issues caused by cross-user persisted caches (via user-scoped storage keys + legacy key cleanup).

### Removed
- Mock-data references in docs and contributor guidance (mock files were deleted from the repo).
