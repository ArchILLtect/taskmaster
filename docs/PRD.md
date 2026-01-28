# Product Requirements Document (PRD)

> TODO: This PRD is intentionally lightweight and should evolve as features stabilize.

## Summary
TaskMaster is a task management app prototype focused on:
- clear list/task navigation
- stable UI patterns
- a migration path from GraphQL-backed MVP → offline support

## Target users
- Single user (initially)
- Optional admin role (planned via Cognito groups)

## Core user stories (MVP)
- As a user, I can view my task lists.
- As a user, I can view tasks in a list.
- As a user, I can open task details without losing context.
- As a user, I can create tasks and see them persist (GraphQL-backed, with a cached store for fast reloads).
- As a user, I can mark tasks done/open and see an activity feed.

## MVP polish goal: Seeded first-run experience
- New accounts should have an immediate “demo mode” experience (example lists/tasks) after login.
- This must preserve strong owner scoping (no weakening auth rules).
- Implemented approach: `UserProfile` model with versioned `seedVersion` and a client-run bootstrap seed flow.
	- MVP behavior seeds demo data for all accounts by default (versioned + idempotent).

References:
- Architecture plan: [docs/ARCHITECTURE.md](ARCHITECTURE.md)
- Data model plan: [docs/DATA_MODEL.md](DATA_MODEL.md)

## Key UX requirements
- Consistent layout via AppShell (top bar + sidebar).
- Deep-linkable task details via the “pane stack” route.
- Activity feed (“Updates”) that can be marked read and cleared.

## Acceptance criteria (current prototype)
- App runs locally via `npm run dev`.
- Lists and tasks render from Zustand stores backed by Amplify GraphQL.
- Task create/status changes persist via GraphQL, and the app keeps a persisted cache in localStorage for fast reloads.

---

## MVP scope
- Authentication is real (Cognito via Amplify Auth)
	- user identity is available throughout the app shell
	- Admin group support exists (read/write across users)
- Data is real (AppSync GraphQL + DynamoDB via Amplify `@model`)
		- Lists and tasks pages do not use local placeholder data for user-facing data
	- Core CRUD works end-to-end for TaskLists + Tasks
- Developer confidence
	- Dev-only GraphQL smoke tests exist and are runnable

### MVP acceptance criteria
- A signed-in user can:
	- create/update/delete TaskLists
	- create/update/delete Tasks
	- view tasks by list in stable sort order
	- view parent/child task relationships (or a clearly-defined alternative)
- Access control rules are correct:
	- owners can only access their own records
	- Admin group can read/write across users

### Implementation notes (current)
- UI state is managed via Zustand stores with persisted caches (TTL for tasks/lists).
- UI does not call `src/api/**` directly; store actions call the API wrapper.

References:
- GraphQL schema: [amplify/backend/api/taskmaster/schema.graphql](../amplify/backend/api/taskmaster/schema.graphql)
- Tasks store (cache + actions): [src/store/taskStore.ts](../src/store/taskStore.ts)
