# Style Guide (UI + Code)

This guide documents *current* conventions found in the codebase.

## UI (Chakra UI)
- Use Chakra components for layout and controls instead of raw HTML.
- Many pages use a consistent “card” wrapper:
  - `p={4} bg="white" rounded="md" boxShadow="sm"`
  - Example: [src/pages/TodayPage.tsx](../src/pages/TodayPage.tsx)

## Navigation
- Prefer `RouterLink` for navigational UI with active-state styles.
  - [src/components/RouterLink.tsx](../src/components/RouterLink.tsx)
- Sidebar items should use [src/components/SidebarItem.tsx](../src/components/SidebarItem.tsx)

## Routing
- Preserve the list “pane stack” route behavior:
  - `/lists/:listId/tasks/*`
  - See [src/pages/ListPage.tsx](../src/pages/ListPage.tsx)

## Data consistency
- If you change any domain type, update both:
  - `src/types/*`
  - `src/mocks/*`

## TypeScript
- The repo runs strict TS settings (see [tsconfig.app.json](../tsconfig.app.json)).
- Avoid unused locals/params (`noUnusedLocals`, `noUnusedParameters`).

## Comments
- Comment *why* decisions were made (tradeoffs/constraints).
- Don’t comment obvious code.

> TODO: Add formatter policy (Prettier or ESLint --fix) once chosen.
