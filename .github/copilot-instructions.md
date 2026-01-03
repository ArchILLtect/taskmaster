# Copilot instructions (taskmaster)

## Project overview
- Vite + React 19 + TypeScript, using Chakra UI for all UI primitives (see [src/main.tsx](src/main.tsx)).
- Routing is React Router v7 with a shared layout shell (`AppShell`) and page components under `src/pages` (see [src/App.tsx](src/App.tsx)).
- Data is currently mocked (no backend wiring yet): lists/tasks/users live in [src/mocks](src/mocks) and must match [src/types](src/types).
- AWS Amplify is present but not fully wired in-app yet; treat `amplify/` as generated infrastructure config (see [amplify/README.md](amplify/README.md)).

## Dev workflow (Windows-friendly)
- Run dev server: `npm run dev`
- Typecheck + build: `npm run build` (runs `tsc -b` then `vite build`)
- Lint: `npm run lint`
- Preview production build: `npm run preview`

## Codebase conventions (follow existing patterns)
- **Layout + pages**: Use Chakra layout primitives (`VStack`, `HStack`, `Flex`, `Box`) and the shared page “card” style (`p={4} bg="white" rounded="md" boxShadow="sm"`) as seen in pages like [src/pages/TodayPage.tsx](src/pages/TodayPage.tsx) and [src/pages/TasksPage.tsx](src/pages/TasksPage.tsx).
- **Navigation links**: Use `RouterLink` (a wrapper around `NavLink`) whenever you need active-state styling; don’t use raw `<a>` or plain `NavLink` directly (see [src/components/RouterLink.tsx](src/components/RouterLink.tsx)).
- **Sidebar structure**:
  - Main items are declared in the component (see [src/layout/Sidebar.tsx](src/layout/Sidebar.tsx)).
  - Collapsible sections pull their items from config (`viewLinks`, `favoriteLinks`) in [src/config/sidebar.ts](src/config/sidebar.ts).
  - Favorites currently derive from `mockLists`; if you change list fields, update [src/mocks/lists.ts](src/mocks/lists.ts) and `TaskList` types.
- **Tasks UI**:
  - Task list rows are rendered via `TaskRow` and styled via Chakra + `RouterLink` (see [src/components/TaskRow.tsx](src/components/TaskRow.tsx)).
  - `Task` shape is defined in [src/types/task.ts](src/types/task.ts); mocks must stay consistent (see [src/mocks/tasks.ts](src/mocks/tasks.ts)).

## Routing pattern: “pane stack” for List details
- `ListPage` implements an “infinite pane stack” via a splat route: `/lists/:listId/tasks/*`.
- The current stack is encoded as path segments (e.g. `/lists/inbox/tasks/t1/t3`).
- Keep this behavior if you modify list/task navigation: see `buildStackUrl`, `stackIds`, and the `pushTask`/`popTo` helpers in [src/pages/ListPage.tsx](src/pages/ListPage.tsx).

## Auth / Amplify integration points (current state)
- AppShell uses a temporary `currentUser` mock until Amplify Auth is wired (see [src/layout/AppShell.tsx](src/layout/AppShell.tsx)).
- When wiring Cognito claims → app user, use `mapUserFromClaims` (see [src/auth/mapUserFromClaims.ts](src/auth/mapUserFromClaims.ts)).
- Avoid hand-editing generated Amplify backend files under [amplify/backend](amplify/backend) unless the change is part of an Amplify workflow.
