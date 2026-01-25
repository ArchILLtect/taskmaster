<!-- {root}/README.md -->

# TaskMaster (WIP)

TaskMaster is a Vite + React + TypeScript task app prototype using Chakra UI.  
The app is transitioning from mocked data to a real backend powered by AWS Amplify (AppSync + Cognito), with an MVP-first mindset.

## Tech stack
- React 19 + TypeScript + Vite
- Chakra UI (all UI primitives)
- React Router v7 (`react-router-dom`)
- AWS Amplify (Auth + GraphQL / AppSync)
- AppSync + DynamoDB via `@model` GraphQL schema
- (Planned) Zustand for client-side state/cache

Entry points:
- App bootstrapping: [src/main.tsx](src/main.tsx)
- Route table: [src/App.tsx](src/App.tsx)
- Shared layout shell (top bar + sidebar): [src/layout/AppShell.tsx](src/layout/AppShell.tsx)

## What’s implemented
- App shell with persistent sidebar + top bar
- Cognito authentication via Amplify `Authenticator`
- GraphQL backend (AppSync + DynamoDB) generated from schema
- Core data models: TaskList, Task
- Dev-only GraphQL smoke testing page (`/dev`)
- Views/pages: Inbox / Today / Week / Month / Updates / Settings / Profile
- Lists page with an “infinite pane stack” details UI for drilling into tasks

## Routing model
Routes are defined in [src/App.tsx](src/App.tsx).

Key patterns:
- Base list views: `/lists` and `/lists/:listId` render the same page component.
- “Pane stack” list details: `/lists/:listId/tasks/*`
  - The `*` splat encodes a stack of selected task IDs as path segments.
  - Example: `/lists/inbox/tasks/t1/t3`
  - Implementation lives in [src/pages/ListPage.tsx](src/pages/ListPage.tsx).

## Data model
The backend is driven by a GraphQL schema using Amplify `@model`.

- Schema: `amplify/backend/api/*/schema.graphql`
- Tables are auto-generated in DynamoDB by Amplify.
- No manual database setup is required.

Local mocks are still present but are being phased out as pages migrate to GraphQL.

## 📄 Architecture & Design Docs

Design documents live in `/docs` and describe **planned or deferred architecture** so future work is intentional—not rediscovered.

### Offline Mode (Planned)

- **Document:** [`/docs/offline-mode-design.md`](./docs/offline-mode-design.md)
- **Status:** Not implemented (by design)

This document describes the full offline-capable architecture for TaskMaster, including:
- Zustand as the single client-side source of truth
- GraphQL (AppSync) as the server source of truth
- IndexedDB-based caching
- Offline mutation queue + optimistic UI
- Sync, conflict resolution, and UX rules

⚠️ **Important:**  
Offline support is intentionally deferred until after the MVP.  
When implemented, this document should be treated as the **source of truth**.

> If you’re reading this in the future and wondering “why isn’t offline here yet?” —  
> it’s because MVP-first decisions were made on purpose. The roadmap already exists. 😉

See also: [`/docs/README.md`](./docs/README.md)

## 🧭 Roadmap & Milestones

TaskMaster follows an **MVP → Post-MVP → Offline** progression.  
Planning is documented explicitly so future work is intentional and scoped.

- **Roadmap:** [`/docs/ROADMAP.md`](./docs/ROADMAP.md)  
  High-level direction and phase goals.

- **Milestones:** [`/docs/MILESTONES.md`](./docs/MILESTONES.md)  
  Concrete deliverables grouped by phase:
  - MVP
  - Post-MVP
  - Offline Mode

If you’re wondering *“what should I work on next?”* — start here.

## Amplify notes
The [amplify](amplify) folder is Amplify CLI output/scaffolding.

- GraphQL, DynamoDB, and Cognito are already live.
- `@model` types automatically create tables and resolvers.
- No `amplify add storage` is required for GraphQL-backed data models.

Auth integration entry point:
- [src/services/authService.ts](src/services/authService.ts) (and [src/hooks/useUserUI.ts](src/hooks/useUserUI.ts))

## Getting started

```bash
npm install
npm run dev
```

## Scripts

- npm run dev — start Vite dev server
- npm run build — typecheck + build
- npm run lint — run ESLint
- npm run preview — preview production build

---

## Documentation (additional)

> TODO: This section is additive and may overlap with earlier doc links.

Start here:
- [docs/INDEX.md](docs/INDEX.md)

Common entry points:
- Local setup: [docs/SETUP.md](docs/SETUP.md)
- Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- API reference: [docs/API.md](docs/API.md)
- Data model: [docs/DATA_MODEL.md](docs/DATA_MODEL.md)
- Troubleshooting: [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
- Style guide: [docs/STYLE_GUIDE.md](docs/STYLE_GUIDE.md)
- Deployment checklist: [docs/DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md)
- Security checklist: [docs/SECURITY_CHECKLIST.md](docs/SECURITY_CHECKLIST.md)

Repo-level docs:
- Contributing: [CONTRIBUTING.md](CONTRIBUTING.md)
- Changelog: [CHANGELOG.md](CHANGELOG.md)

> TODO: Some README claims may reflect planned work rather than current wiring. If something seems inconsistent, check [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and the TODO section in [docs/ROADMAP.md](docs/ROADMAP.md).