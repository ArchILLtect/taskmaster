# Copilot instructions (taskmaster)

## Project overview
- Vite + React 19 + TypeScript, using Chakra UI for all UI primitives (see [src/main.tsx](../src/main.tsx)).
- Routing is React Router v7 with a shared layout shell (`AppShell`) and page components under `src/pages` (see [src/App.tsx](../src/App.tsx)).
- Data is GraphQL-backed (Amplify/AppSync). UI reads/writes tasks/lists through the Zustand store (see [src/store/taskStore.ts](../src/store/taskStore.ts)).
- Some UX-only state is still local (e.g., inbox dismissed ids / last viewed, updates “read” state) and is intentionally not GraphQL-backed yet.
- AWS Amplify is configured in-app (see [src/amplifyConfig.ts](../src/amplifyConfig.ts)); treat `amplify/` as generated infrastructure config (see [amplify/README.md](../amplify/README.md)).

## Dev workflow (Windows-friendly)
- Run dev server: `npm run dev`
- Typecheck + build: `npm run build` (runs `tsc -b` then `vite build`)
- Lint: `npm run lint`
- Preview production build: `npm run preview`

## Codebase conventions (follow existing patterns)
- **Layout + pages**: Use Chakra layout primitives (`VStack`, `HStack`, `Flex`, `Box`) and the shared page “card” style (`p={4} bg="white" rounded="md" boxShadow="sm"`) as seen in pages like [src/pages/TodayPage.tsx](../src/pages/TodayPage.tsx) and [src/pages/TasksPage.tsx](../src/pages/TasksPage.tsx).
- **Navigation links**: Use `RouterLink` (a wrapper around `NavLink`) whenever you need active-state styling; don’t use raw `<a>` or plain `NavLink` directly (see [src/components/RouterLink.tsx](../src/components/RouterLink.tsx)).
- **Sidebar structure**:
  - Main items are declared in the component (see [src/layout/Sidebar.tsx](../src/layout/Sidebar.tsx)).
  - Collapsible sections pull their items from config (`viewLinks`) in [src/config/sidebar.ts](../src/config/sidebar.ts).
  - Favorites derive from the current lists state (Zustand store → page hooks), not from hard-coded data.
- **Tasks UI**:
  - Task list rows are rendered via `TaskRow` and styled via Chakra + `RouterLink` (see [src/components/TaskRow.tsx](../src/components/TaskRow.tsx)).
  - UI task shape is `TaskUI` in [src/types/task.ts](../src/types/task.ts) (treat it as the stable UI contract).

## Store usage (important)
- Prefer using hooks/selectors over direct store calls:
  - Read model via `useTaskIndex` (see [src/hooks/useTaskIndex.ts](../src/hooks/useTaskIndex.ts)) or `useTaskStoreView` / `useTaskIndexView`.
  - Mutations via `useTaskActions()` (see [src/store/taskStore.ts](../src/store/taskStore.ts)).
- Avoid calling `useTaskStore((s) => ...)` in pages/components; keep the UI insulated from the raw store shape.

## Architecture guardrails
- UI code under `src/pages/**` and `src/components/**` must not import from `src/api/**` directly.
- Avoid importing generated `src/API.ts` types in UI (enums like `TaskStatus` / `TaskPriority` are OK).
- Prefer UI/domain types under [src/types](../src/types).

## Routing pattern: “pane stack” for List details
- `ListDetailsPage` implements an “infinite pane stack” via a splat route: `/lists/:listId/tasks/*`.
- The current stack is encoded as path segments (e.g. `/lists/inbox/tasks/t1/t3`).
- Keep this behavior if you modify list/task navigation: see `buildStackUrl`, `stackIds`, and the `pushTask`/`popTo` helpers in [src/pages/ListDetailsPage.tsx](../src/pages/ListDetailsPage.tsx).

## Auth / Amplify integration points (current state)
- App auth is wired via Amplify UI’s `Authenticator` (see [src/App.tsx](../src/App.tsx)).
- For user display info (email/role), use `getUserUIResult`/`useUserUI` (see [src/services/authService.ts](../src/services/authService.ts) and [src/hooks/useUserUI.ts](../src/hooks/useUserUI.ts)).
- Avoid hand-editing generated Amplify backend files under [amplify/backend](../amplify/backend) unless the change is part of an Amplify workflow.
