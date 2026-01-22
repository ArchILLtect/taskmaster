
# Taskmaster Product Spec (Rules of the Universe)

This document defines the durable, “don’t break this” behavior of Taskmaster pages/features.
It is intentionally product-focused (not implementation-focused) so collaborators and agents don’t drift.

## Global invariants

- **Task is the atomic unit.** Tasks belong to exactly one List at a time (`listId`), and may optionally be nested (`parentTaskId`).
- **Stable ordering.** Within the same parent scope (top-level or under a parent task), tasks are ordered by `sortOrder`.
- **Edits are explicit.** Task changes happen via a single write path (GraphQL/AppSync via `taskmasterApi`, or the current local fallback during dev), then the UI refreshes.
- **UI state vs data state.** Pane/stack navigation state lives in the URL; task data lives in the data layer.

---

## Pages

### Inbox

**Purpose**

InboxPage is not supposed to just display a list of tasks; it is a separate component that acts as a staging area.

The Inbox is the central processing area for tasks that need your attention or don't yet have a home in a specific list, acting as a temporary holding place for newly captured items, assigned tasks, or those from integrations like email/Slack. It's where you review, organize, and triage tasks, deciding whether to move them to a project list, schedule them for today, or process them further.

**What goes into the Inbox by default**

- Assigned tasks: Tasks assigned to you by others.
- Integration tasks: Items created from connected services (e.g., Gmail, Slack).
- Quick Command tasks: Tasks created using the universal shortcut (Shift+Option+Space on desktop).
- Manually added tasks: Tasks you create directly in the inbox.

**How to use it**

- Capture: Quickly add tasks to your inbox using quick commands or integrations.
- Review: Check your inbox for items that need processing.
- Organize: Move tasks from the inbox to relevant project lists, assign them due dates, or add details.

Essentially, the Inbox is your starting point for handling new inputs before they're filed away into your organized lists.

**Primary user actions**

- Capture a new task into Inbox
- Triage an Inbox task:
	- Move to a list
	- Schedule (set due date / put into “Today”)
	- Dismiss (remove from active attention without “completing”)
	- Acknowledge (mark as seen/handled without necessarily completing)
- Complete / reopen
- Delete (if supported)

**Data source (reads/writes)**

- Reads tasks from the data layer filtered to “Inbox scope”
	- Implementation may be: a hidden “system list” (e.g. listId = `inbox`) or a dedicated Inbox flag.
- Writes are task mutations (create/update/move/dismiss/acknowledge).

**Special rules / invariants (don’t break this list)**

- Inbox is a staging area for new/untriaged items.
- Inbox tasks may be stored as a hidden “system list”.
- Inbox is not shown in normal list navigation.
- Inbox supports triage: move, schedule, dismiss, acknowledge.
- “New task” default behavior can route into Inbox (if enabled).

**Out of scope for MVP**

- Integrations ingestion (Gmail/Slack/etc.)
- Universal shortcut / quick command UI
- Multi-user assignment workflows (beyond displaying an assignee)
- Automation rules (“if labeled X then move to Y”)

---

### Lists

**Purpose**

Lists are the primary organizational containers for tasks (projects/areas) and are the main navigation surface.

**Primary user actions**

- View lists
- Select a list to view its tasks
- (Optional) favorite/unfavorite lists

**Data source (reads/writes)**

- Reads list metadata from the data layer (currently mocked lists; later GraphQL).
- Writes list preference changes (favorites) to local settings and/or backend.

**Special rules / invariants**

- Lists shown here are user-facing lists; system lists (like Inbox) may be hidden.
- List identity is stable via `listId`.

**Out of scope for MVP**

- Full list CRUD (create/rename/delete) unless explicitly prioritized
- Sharing/permissions
- Complex list types (smart lists, filters-as-lists)

---

### List details (ListPage)

**Purpose**

ListPage is the canonical place to work through tasks in a specific list and to open task details in a pane stack.

**Primary user actions**

- View tasks in the list
- Add a new task to the list (top-level) or add a subtask under a parent task
- Toggle complete / reopen
- Open task details panes and navigate deeper into subtasks
- Delete task (if supported)

**Data source (reads/writes)**

- Reads: tasks for the selected list from the data layer.
- Writes: task mutations (create/update/delete), then refresh.

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

- Reads updates/events from an event store (currently local; later backend).
- May read task details for rendering (e.g., title lookup).

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

- Reads/writes to local storage for preferences (and later backend profile settings).

**Special rules / invariants**

- Settings changes should be reversible and not destructive.
- Defaults should be sensible and consistent across devices when backend sync exists.

**Out of scope for MVP**

- Billing
- Complex role/permission management
- Enterprise policy controls

