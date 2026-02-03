# Taskmaster Glossary

- **Inbox**: A staging area for new/untriaged tasks before they are filed into a user-facing list.
- **System list**: A list that exists for internal product behavior (e.g., Inbox). It may be treated specially by the UI (for example, some actions are disabled).
- **List**: A user-facing container for tasks (project/area). A task belongs to exactly one list at a time via `listId`.
- **Task**: The atomic unit of work. Can optionally have a parent task via `parentTaskId`.
- **Subtask**: A task whose `parentTaskId` points to another task.

## Routing & UI

- **Pane stack (task stack)**: The ordered set of task IDs encoded in the URL to represent open detail panes left → right.
- **Splat route**: A route that ends with `*` (React Router) so extra path segments can encode additional state.
- **Stack URL segments**: The path segments after `/lists/:listId/tasks/` that encode the task IDs currently opened in panes.
- **AppShell**: The shared layout wrapper (top bar + sidebar) that hosts page routes.
- **RouterLink**: A wrapper around `NavLink` used across the UI to centralize link styling and active-state behavior.

## State & data flow

- **Zustand store**: The client-side state container used as the UI’s source of truth. Pages/components read through hooks/selectors; mutations go through store actions.
- **Task store (`taskStore`)**: The store that owns lists + tasks, plus derived indexes for fast lookup. It is the main read/write path for task data.
- **Store actions**: Functions exposed by the store for mutations (create/update/delete). Actions call the API wrapper and then refresh state.
- **Derived indexes**: Secondary data structures computed from base arrays (e.g., `tasksByListId`, `childrenByParentId`) for efficient reads.
- **Hydration**: Loading persisted store state from localStorage on app startup.
- **Persisted cache**: A serializable slice of state stored locally (localStorage) to make reloads faster.
- **TTL (time-to-live)**: A freshness window used to decide whether cached data can be reused or should be refreshed from the network.
- **Stable selector snapshot**: A pattern used to return stable object references from selectors to avoid unnecessary re-renders and to play nicely with React 19’s external store semantics.

## Backend (Amplify)

- **Amplify (Gen 1)**: The Amplify CLI-driven backend configuration used by this repo.
- **Cognito**: The authentication system backing sign-in/sign-out.
- **Cognito groups**: Group memberships attached to a user (e.g., `Admin`) and used for authorization.
- **AppSync**: AWS’s managed GraphQL service used by Amplify to host the API.
- **GraphQL schema**: The source-of-truth API schema under `amplify/backend/api/*/schema.graphql`.
- **`@model`**: An Amplify directive that generates DynamoDB tables and CRUD operations for a GraphQL type.
- **`@auth`**: An Amplify directive that configures authorization rules (e.g., owner-based access and Admin group access).
- **Selection set**: The subset of fields requested by a GraphQL query/mutation. Many API responses in the app are “selection-set-shaped”, not full generated model types.

## Code terms

- **API wrapper (`taskmasterApi`)**: The internal module that performs GraphQL operations. UI code should not import it directly; store actions own API calls.
- **Mappers**: Functions that translate API/GraphQL shapes into stable UI/domain shapes.
- **UI types (`TaskUI`, `ListUI`)**: The stable TypeScript types used by the UI, decoupled from generated GraphQL model types.

## Local storage keys

TaskMaster scopes most persisted keys per signed-in user.

- **`taskmaster:authScope`**: The current user scope key used for local persistence.
- **`taskmaster:u:<scope>:zustand:taskmaster:taskStore`**: Persisted tasks/lists cache (with TTL and migrations).
- **`taskmaster:u:<scope>:zustand:taskmaster:inbox`**: Persisted Inbox triage state (dismissed notification task ids).
- **`taskmaster:u:<scope>:zustand:taskmaster:updates`**: Persisted Updates feed + read markers.
- **`taskmaster:u:<scope>:zustand:taskmaster:user`**: Cached user display info (email/role).
- **`taskmaster:u:<scope>:zustand:taskmaster:localSettings`**: Local preferences (sidebar width, default routes, due-soon window).
- **`taskmaster:u:<scope>:inboxListId`**: Cached system Inbox list id mapping.
- **`taskmaster:storageDisclosureAck:v1`**: Storage disclosure banner dismissal.
