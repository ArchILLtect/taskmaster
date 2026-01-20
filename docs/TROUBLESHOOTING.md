# Troubleshooting / FAQ

## The app looks “stuck” after I change data
Some pages use a simple `tick/refresh()` local-state pattern to re-render after localStorage-backed changes.
- Example: [src/pages/UpdatesPage.tsx](../src/pages/UpdatesPage.tsx)

> TODO: As part of the roadmap, this is expected to move to a proper state store (Zustand).

## Reset local state (recommended during development)
TaskMaster persists local patches and updates in `localStorage`.

Keys in use:
- `taskmaster.taskPatches.v1` (created tasks + patches + deletions)
- `taskmaster.updateEvents.v1` (activity feed)
- `taskmaster.updates.v1` (updates read state)

To reset:
1. Open browser devtools → Application/Storage → Local Storage.
2. Remove the keys above.
3. Refresh the page.

## `npm run build` fails: “no exported member 'SubTask'”
This comes from [src/types/index.ts](../src/types/index.ts) re-exporting a type that does not exist.

> TODO: Fix by either defining `SubTask` in [src/types/task.ts](../src/types/task.ts) or removing the re-export.

## `npm run lint` fails in Amplify generated files
Amplify generates typings under `amplify/backend/types/*` which may not conform to the repo’s ESLint rules.

Options:
- Prefer excluding generated paths from lint (recommended).
- Or adjust ESLint rules to allow those generated patterns.

> TODO: Decide which approach we want and document it in [SETUP.md](SETUP.md).

## `npm run build` fails in `src/API.ts` with TS1294
If you see errors like:
> This syntax is not allowed when 'erasableSyntaxOnly' is enabled.

This is currently triggered by `export enum ...` declarations in [src/API.ts](../src/API.ts).

> TODO: Options include changing TypeScript compiler settings or regenerating/adjusting the Amplify-generated types to avoid enums.

## `npm run build` fails in `GraphQLSmokeTest.tsx` with deep type errors
The dev GraphQL smoke test currently hits an “Excessive stack depth comparing types” TypeScript error.

> TODO: Typically resolved by simplifying types at the call site, using explicit types, or adjusting the generated client typing.

## Time zones / due dates
The Add Task form uses the user’s local timezone when computing the minimum date.
- See [src/components/AddTaskForm.tsx](../src/components/AddTaskForm.tsx)

> TODO: Standardize how we store/format time across the app.
