# TaskMaster (WIP)

TaskMaster is a Vite + React + TypeScript task app prototype using Chakra UI. The app currently uses mocked data (no backend wired yet) and focuses on navigation + list/task browsing patterns.

## Tech stack
- React 19 + TypeScript + Vite
- Chakra UI (all UI primitives)
- React Router v7 (`react-router-dom`)
- AWS Amplify scaffolding is present, but not yet integrated into runtime auth/data flows

Entry points:
- App bootstrapping: [src/main.tsx](src/main.tsx)
- Route table: [src/App.tsx](src/App.tsx)
- Shared layout shell (top bar + sidebar): [src/layout/AppShell.tsx](src/layout/AppShell.tsx)

## What’s implemented
- App shell with persistent sidebar + top bar
- Views/pages (mostly placeholders today): Inbox/Today/Week/Month/Updates/Settings/Profile
- Tasks index page that renders all mock tasks
- Lists page with an “infinite pane stack” details UI for drilling into tasks

## Routing model
Routes are defined in [src/App.tsx](src/App.tsx).

Key patterns:
- Base list views: `/lists` and `/lists/:listId` render the same page component.
- “Pane stack” list details: `/lists/:listId/tasks/*`
  - The `*` splat encodes a stack of selected task IDs as path segments.
  - Example: `/lists/inbox/tasks/t1/t3` opens a details pane for `t1`, then another for `t3`.
  - Implementation lives in [src/pages/ListPage.tsx](src/pages/ListPage.tsx) (`buildStackUrl`, `stackIds`, `pushTask`, `popTo`).

## Data model (mocked)
All data is currently local mock data.

- Types live in [src/types](src/types) (notably [src/types/task.ts](src/types/task.ts)).
- Mocks live in [src/mocks](src/mocks):
  - Lists: [src/mocks/lists.ts](src/mocks/lists.ts)
  - Tasks: [src/mocks/tasks.ts](src/mocks/tasks.ts)
  - Current user (temporary): [src/mocks/currentUser.ts](src/mocks/currentUser.ts)

UI components typically consume these mocks directly (no services layer yet).

## UI conventions
- Use Chakra layout primitives (`VStack`, `HStack`, `Flex`, `Box`). Many pages use a consistent “card” container: `p={4} bg="white" rounded="md" boxShadow="sm"` (example: [src/pages/TodayPage.tsx](src/pages/TodayPage.tsx)).
- Use [src/components/RouterLink.tsx](src/components/RouterLink.tsx) (wrapper over `NavLink`) when you need active-state styling.
- Sidebar main items are declared in [src/layout/Sidebar.tsx](src/layout/Sidebar.tsx). Collapsible sections pull items from [src/config/sidebar.ts](src/config/sidebar.ts).

## Getting started
Install deps:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

## Scripts
- `npm run dev` — start Vite dev server
- `npm run build` — typecheck (`tsc -b`) then build (`vite build`)
- `npm run lint` — run ESLint
- `npm run preview` — preview production build

## Amplify notes
The [amplify](amplify) folder is Amplify CLI output/scaffolding. Until the app is wired up to Amplify Auth/API, treat it as generated config (see [amplify/README.md](amplify/README.md)).

Auth integration entry point (when you wire Cognito claims → app user):
- [src/auth/mapUserFromClaims.ts](src/auth/mapUserFromClaims.ts)

## Known issues (current repo state)
- `npm run build` fails because [src/types/index.ts](src/types/index.ts) re-exports a `SubTask` type that is not defined/exported.
- `npm run lint` may flag generated Amplify typings under [amplify/backend](amplify/backend).
