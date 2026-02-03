
# Taskmaster Product Spec (Rules of the Universe)

This document defines the durable, “don’t break this” behavior of Taskmaster pages/features.
It is intentionally product-focused (not implementation-focused) so collaborators and agents don’t drift.

## Global invariants

- **Task is the atomic unit.** Tasks belong to exactly one List at a time (`listId`), and may optionally be nested (`parentTaskId`).
- **Stable ordering.** Within the same parent scope (top-level or under a parent task), tasks are ordered by `sortOrder`.
- **Edits are explicit.** Task changes happen via a single write path: UI → store action → GraphQL API wrapper (`taskmasterApi`).
- **UI state vs data state.** Pane/stack navigation state lives in the URL; task data lives in the data layer.

---

## Pages

### Inbox

**Purpose**

InboxPage is a staging area for new/untriaged tasks and a place to surface time-based attention cues.

**Current MVP behavior (implemented)**

- The Inbox is backed by a hidden **system list** named `__Inbox`.
- Tasks in the system Inbox list are **always visible** in the Inbox UI (staging area).
- The Inbox page also surfaces **attention cues** across *all lists*:
	- Overdue tasks
	- Due-soon tasks (window controlled by a user setting)
- Users can **ignore** (dismiss) overdue/due-soon notifications per task, or in bulk via “Done triaging”.
	- Ignoring is local UX state: it does **not** delete or complete tasks.
	- Ignoring does not remove staging tasks from `__Inbox`.
	- Ignored state can be reset from Settings.

**Primary user actions (MVP)**

- Capture a new task into Inbox
- Triage:
	- Move to a list
	- Schedule (set due date)
	- Complete / reopen
	- Delete
- Ignore attention cues:
	- Ignore a single overdue/due-soon task notification
	- “Done triaging” (bulk ignore overdue/due-soon)

**Special rules / invariants (don’t break this list)**

- Inbox is a staging area for new/untriaged items.
- Inbox tasks are stored as a hidden “system list” named `__Inbox`.
- The system Inbox list is not shown in normal list navigation.
- Dismiss/ignore is about attention cues (overdue/due-soon), not about completing/deleting tasks.

**Out of scope for MVP**

- Integrations ingestion (Gmail/Slack/etc.)
- Universal shortcut / quick command UI
- Multi-user assignment workflows (beyond displaying an assignee)

---

### Lists

**Primary user actions**

- View lists
- Select a list to view its tasks
- (Optional) favorite/unfavorite lists

**Data source (reads/writes)**

- Reads list metadata from the data layer (GraphQL-backed via the API wrapper and stores).
- Writes list preference changes (favorites) to local settings and/or backend.

**Special rules / invariants**

- Lists shown here are user-facing lists; system lists (like Inbox) may be hidden.
- List identity is stable via `listId`.

**Out of scope for MVP**

- Sharing/permissions
- Complex list types (smart lists, filters-as-lists)

**In scope for MVP (implemented)**

- Full list CRUD exists (create/rename/delete), with guardrails around the system Inbox name `__Inbox`.

---

### List details (ListDetailsPage)

**Purpose**

ListDetailsPage is the canonical place to work through tasks in a specific list and to open task details in a pane stack.

**Primary user actions**

- View tasks in the list
- Add a new task to the list (top-level) or add a subtask under a parent task
- Toggle complete / reopen
- Open task details panes and navigate deeper into subtasks
- Delete task (if supported)

**Data source (reads/writes)**

- Reads: tasks for the selected list from the data layer.
- Writes: store actions trigger mutations and the tasks store refreshes.

**Special rules / invariants**

- **Pane stack behavior is URL-driven.** The current “stack” is encoded in the URL path segments.
- **Stack is ordered.** The URL segments represent the visible pane order left → right.
- **Stack items are task IDs.** Each segment corresponds to a task in the current list.
- **Subtask navigation appends.** Opening a child task pushes its ID onto the stack.
- **Pop is deterministic.** Clicking “close last” removes the last stack ID; “close all” resets stack to empty.
- **List context is stable.** The stack is scoped to a list route (stack IDs are interpreted within that list’s task set).

**Out of scope for MVP**

- Cross-list stack navigation (opening a task from another list inside the same stack)
- Drag-and-drop ordering / hierarchy changes
- Bulk edits

---

### Task details panes / stack behavior

**Purpose**

Task details panes let users inspect/edit a task while maintaining list context, and support “drilling down” into subtasks.

**Primary user actions**

- View task metadata (title, status, priority, due date)
- Edit task fields
- Create subtasks
- Toggle subtask completion
- Navigate deeper into the subtask chain

**Data source (reads/writes)**

- Reads: selected task and its children from the current list’s task data.
- Writes: update mutations for the selected task and its children, then refresh.

**Special rules / invariants**

- **No hidden local truth.** The pane shows the task as returned by the data layer; edits must be persisted before treating them as committed.
- **Subtasks are tasks.** A “subtask” is just a task with `parentTaskId`.
- **Ordering of children** is by `sortOrder` within the parent.
- **Completion semantics** are per task; completing a parent does not automatically complete children (unless explicitly added later).

**Out of scope for MVP**

- Rich task fields (attachments, comments, activity feed)
- Recurring tasks
- Dependencies (“blocked by”)

---

### Updates

**Purpose**

UpdatesPage shows a stream of notable task events to help users track what changed.

**Primary user actions**

- Review recent events
- Jump to the referenced task (when possible)
- Optionally clear/acknowledge updates

**Data source (reads/writes)**

- Reads updates/events from a persisted local store.
- Events are appended after successful task mutations (in the API layer), and the UI can link back to tasks when possible.

**Special rules / invariants**

- Updates are append-only events.
- Events should be resilient to missing tasks (deleted tasks may still have historical events).

**Out of scope for MVP**

- Collaboration audit log
- Push notifications
- Filtering/saved views

---

### Settings

**Purpose**

Settings is where user-level preferences live (appearance, defaults, integrations toggles, etc.).

**Primary user actions**

- View and update preferences
- (Optional) manage account/auth state

**Data source (reads/writes)**

- Reads/writes to local storage for preferences (and later backend profile settings, if desired).

**Special rules / invariants**

- Settings changes should be reversible and not destructive.
- Defaults should be sensible and consistent across devices when backend sync exists.

**Out of scope for MVP**

- Billing
- Complex role/permission management
- Enterprise policy controls

**Current MVP behavior (implemented)**

- Choose default view route (Today/Week/Month) and default post-login landing route.
- Configure due-soon window days.
- Reset ignored Inbox notifications (clears locally persisted dismissal state).
- Manage demo data safely:
	- Clear demo data only (never deletes non-demo items)
	- Reset demo data (re-seed demo content while preserving non-demo)
	- Add more demo tasks/lists (generators for testing and exploration)

