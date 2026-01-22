# Taskmaster Glossary

- **Inbox**: A staging area for new/untriaged tasks before they are filed into a user-facing list.
- **System list**: A list that exists for internal product behavior (e.g., Inbox) and may be hidden from normal list navigation.
- **List**: A user-facing container for tasks (project/area). A task belongs to one list at a time via `listId`.
- **Task**: The atomic unit of work. Can optionally have a parent task via `parentTaskId`.
- **Subtask**: A task whose `parentTaskId` points to another task.
- **Task stack / pane stack**: The ordered set of task IDs encoded in the ListPage URL to represent the open detail panes left → right.
- **Stack URL segments**: Path segments after the list route that encode the task IDs currently opened in panes.
- **Triage**: Inbox processing actions (move to list, schedule, dismiss, acknowledge).
- **Dismissed**: A task state meaning it no longer requires attention right now without being completed (exact storage/model TBD).
- **Acknowledged**: A task state meaning it has been seen/processed without necessarily being completed (exact storage/model TBD).
- **Due soon window**: A time range used to consider tasks “upcoming” (exact duration TBD).
