# Product Requirements Document (PRD)

> TODO: This PRD is intentionally lightweight and should evolve as features stabilize.

## Summary
TaskMaster is a task management app prototype focused on:
- clear list/task navigation
- stable UI patterns
- a migration path from mocks → GraphQL → offline support

## Target users
- Single user (initially)
- Optional admin role (planned via Cognito groups)

## Core user stories (MVP)
- As a user, I can view my task lists.
- As a user, I can view tasks in a list.
- As a user, I can open task details without losing context.
- As a user, I can create tasks and see them persist locally.
- As a user, I can mark tasks done/open and see an activity feed.

## Key UX requirements
- Consistent layout via AppShell (top bar + sidebar).
- Deep-linkable task details via the “pane stack” route.
- Activity feed (“Updates”) that can be marked read and cleared.

## Acceptance criteria (current prototype)
- App runs locally via `npm run dev`.
- Lists and tasks render from mocks.
- Task create/status changes persist via localStorage.

> TODO: Align this PRD with [ROADMAP.md](ROADMAP.md). Some roadmap items assume GraphQL wiring that is not yet reflected in the UI.

---

## TODO: Target-state PRD (MVP = Cognito + GraphQL)

This section captures the intended MVP target state (as reflected in [ROADMAP.md](ROADMAP.md)) while the current prototype remains mock/localStorage-backed.

### MVP scope (target)
- Authentication is real (Cognito via Amplify Auth)
	- user identity is available throughout the app shell
	- Admin group support exists (read/write across users)
- Data is real (AppSync GraphQL + DynamoDB via Amplify `@model`)
	- Lists and tasks pages do not use `src/mocks/*` for user-facing data
	- Core CRUD works end-to-end for TaskLists + Tasks
- Developer confidence
	- Dev-only GraphQL smoke tests exist and are runnable

### MVP acceptance criteria (target)
- A signed-in user can:
	- create/update/delete TaskLists
	- create/update/delete Tasks
	- view tasks by list in stable sort order
	- view parent/child task relationships (or a clearly-defined alternative)
- Access control rules are correct:
	- owners can only access their own records
	- Admin group can read/write across users

### Current-state callout (implementation today)
- UI still uses mock data and local persistence services (localStorage patch/event stores).

References:
- GraphQL schema: [amplify/backend/api/taskmaster/schema.graphql](../amplify/backend/api/taskmaster/schema.graphql)
- Local task persistence (prototype): [src/services/taskPatchStore.ts](../src/services/taskPatchStore.ts)
