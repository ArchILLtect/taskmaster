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

### Changed
- Updated documentation across /docs to match current Amplify (Cognito + AppSync) + Zustand architecture.
- Documented the new Admin console flow and the intentional decision to defer admin-driven editing/deleting in the console.
- Removed all references to deleted mock data/files; app/docs now assume real GraphQL-backed data.
- Improved README structure and navigation for onboarding and contributors.

### Fixed
- Documentation drift: corrected stale references and aligned guides/checklists with current scripts, storage keys, and routing patterns.

### Removed
- Mock-data references in docs and contributor guidance (mock files were deleted from the repo).
