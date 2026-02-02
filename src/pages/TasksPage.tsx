import {
  Box,
  Heading,
  HStack,
  Text,
  VStack,
  Button,
  Badge,
} from "@chakra-ui/react";
import { TaskRow } from "../components/TaskRow";
import { useEffect, useMemo, useState } from "react";
import { CompletedTasksToggle } from "../components/CompletedTasksToggle";
import { TaskPriority, TaskStatus } from "../API";
import { useTasksPageData } from "./useTasksPageData";
import { fireToast } from "../hooks/useFireToast";
import { Toaster } from "../components/ui/Toaster";
import { AddTaskForm } from "../components/forms/AddTaskForm";
import { useNavigate } from "react-router-dom";
import { Flex } from "@aws-amplify/ui-react";
import { DialogModal } from "../components/ui/DialogModal";
import { EditTaskForm } from "../components/forms/EditTaskForm";
import type { TaskUI } from "../types/task";
import { BasicSpinner } from "../components/ui/BasicSpinner";
import { useTaskActions } from "../store/taskStore";
import { getInboxListId } from "../config/inboxSettings";
import { AppCollapsible } from "../components/AppCollapsible";
import { SearchFilterSortBar } from "../components/ui/SearchFilterSortBar";
import { getTodayDateInputValue } from "../services/dateTime";
import { Tip } from "../components/ui/Tip";

// --- helpers (keep local, simple)
function dateInputToIso(date: string) {
  if (!date) return null;
  return new Date(`${date}T00:00:00.000Z`).toISOString();
}

function isoToDateInput(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

// Set today's date as default due date in YYYY-MM-DD format
const todayDate = getTodayDateInputValue();

type Option<T extends string> = { label: string; value: T };

type SortKey = "sortOrder" | "due" | "priority" | "title";

const SORT_OPTIONS: Option<SortKey>[] = [
  { label: "Manual (sort order)", value: "sortOrder" },
  { label: "Due date", value: "due" },
  { label: "Priority", value: "priority" },
  { label: "Title", value: "title" },
];

// TODO? : This is needed for new component still I think!
function isSortKey(v: string): v is SortKey {
  return SORT_OPTIONS.some((o) => o.value === v);
}

const priorityToRank: Record<TaskPriority, number> = {
  [TaskPriority.High]: 0,
  [TaskPriority.Medium]: 1,
  [TaskPriority.Low]: 2,
};

export function TasksPage() {

  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskUI | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("New Task");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState(todayDate);
  const [newTaskPriority, setNewTaskPriority] = useState(TaskPriority.Medium);
  const [draftTaskTitle, setDraftTaskTitle] = useState("");
  const [draftTaskDescription, setDraftTaskDescription] = useState("");
  const [draftTaskListId, setDraftTaskListId] = useState("");
  const [draftTaskDueDate, setDraftTaskDueDate] = useState("");
  const [draftTaskPriority, setDraftTaskPriority] = useState(TaskPriority.Medium);
  const [draftTaskStatus, setDraftTaskStatus] = useState(TaskStatus.Open);
  const [saving, setSaving] = useState(false);

  const [taskSearch, setTaskSearch] = useState("");
  const [selectedListFilter, setSelectedListFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("sortOrder");

  const { allTasks, lists, loading, refreshData } = useTasksPageData();
  const navigate = useNavigate();

  const { updateTask, deleteTask, sendTaskToInbox } = useTaskActions();

  const isDialogOpen = !!selectedTask;

  const taskCounts = useMemo(() => {
    const total = allTasks.length;
    const completed = allTasks.filter((t) => t.status === TaskStatus.Done).length;
    const incomplete = total - completed;
    const showing = showCompletedTasks ? completed : incomplete;

    const openTasks = allTasks.filter((t) => t.status !== TaskStatus.Done);
    const scheduledOpenTasks = openTasks.filter((t) => Boolean(t.dueAt));

    const toDueKey = (iso?: string | null) => (typeof iso === "string" && iso.length >= 10 ? iso.slice(0, 10) : null);
    const dueToday = scheduledOpenTasks.filter((t) => toDueKey(t.dueAt) === todayDate).length;
    const overdue = scheduledOpenTasks.filter((t) => {
      const key = toDueKey(t.dueAt);
      return key != null && key < todayDate;
    }).length;

    const somedayOpen = openTasks.filter((t) => !t.dueAt).length;
    const scheduledOpen = scheduledOpenTasks.length;

    return {
      total,
      completed,
      incomplete,
      showing,
      overdue,
      dueToday,
      scheduledOpen,
      somedayOpen,
    };
  }, [allTasks, showCompletedTasks]);

  const listFilterItems = useMemo(() => {
    const items: Option<string>[] = [{ label: "All lists", value: "all" }];
    lists
      .slice()
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .forEach((l) => {
        items.push({ label: l.name || "(Untitled)", value: l.id });
      });
    return items;
  }, [lists]);

  useEffect(() => {
    // If the selected list was deleted, reset to "All".
    if (selectedListFilter !== "all" && !listFilterItems.some((i) => i.value === selectedListFilter)) {
      setSelectedListFilter("all");
    }
  }, [listFilterItems, selectedListFilter]);

  const listById = useMemo(() => new Map(lists.map((l) => [l.id, l])), [lists]);

  const visibleTasks = useMemo(() => {
    const q = taskSearch.trim().toLowerCase();

    const matchesStatus = (t: TaskUI) =>
      showCompletedTasks ? t.status === TaskStatus.Done : t.status !== TaskStatus.Done;

    const matchesList = (t: TaskUI) =>
      selectedListFilter === "all" ? true : t.listId === selectedListFilter;

    const matchesSearch = (t: TaskUI) => {
      if (!q) return true;
      const hay = `${t.title ?? ""} ${(t.description ?? "").toString()}`.toLowerCase();
      return hay.includes(q);
    };

    const filtered = allTasks.filter((t) => matchesStatus(t) && matchesList(t) && matchesSearch(t));

    const toDueKey = (iso?: string | null) =>
      typeof iso === "string" && iso.length >= 10 ? iso.slice(0, 10) : null;

    const decorated = filtered.map((t, idx) => ({ t, idx }));

    decorated.sort((a, b) => {
      const ta = a.t;
      const tb = b.t;

      const stableTieBreak = () => a.idx - b.idx;

      if (sortKey === "sortOrder") {
        return (ta.sortOrder ?? 0) - (tb.sortOrder ?? 0) || stableTieBreak();
      }

      if (sortKey === "due") {
        const ka = toDueKey(ta.dueAt) ?? "9999-12-31";
        const kb = toDueKey(tb.dueAt) ?? "9999-12-31";
        return ka.localeCompare(kb) || (ta.sortOrder ?? 0) - (tb.sortOrder ?? 0) || stableTieBreak();
      }

      if (sortKey === "priority") {
        const pa = priorityToRank[ta.priority] ?? 999;
        const pb = priorityToRank[tb.priority] ?? 999;
        return pa - pb || (ta.sortOrder ?? 0) - (tb.sortOrder ?? 0) || stableTieBreak();
      }

      // sortKey === "title"
      const la = String(ta.title ?? "").toLowerCase();
      const lb = String(tb.title ?? "").toLowerCase();
      return la.localeCompare(lb) || (ta.sortOrder ?? 0) - (tb.sortOrder ?? 0) || stableTieBreak();
    });

    return decorated.map((d) => d.t);
  }, [allTasks, selectedListFilter, showCompletedTasks, sortKey, taskSearch]);

  const handleToggleComplete = async (taskId: string, nextStatus: TaskStatus) => {
    if (!taskId || !nextStatus) return;
    const completedAt = nextStatus === TaskStatus.Done ? new Date().toISOString() : null;

    try {
      await updateTask({
        id: taskId,
        status: nextStatus,
        completedAt,
      });
      fireToast("success", "Task marked as " + nextStatus, "Task is now " + nextStatus.toLowerCase() + ".");
    } catch (error) {
      console.error("Error updating task status:", error);
      fireToast("error", "Error updating task", "There was an issue updating the task status.");
    };
  };

  const handleEditTask = async (task: TaskUI) => {
    setDraftTaskTitle(task.title ?? "");
    setDraftTaskDescription(task.description ?? "");
    setDraftTaskListId(task.listId ?? "");
    setDraftTaskDueDate(isoToDateInput(task.dueAt));
    setDraftTaskPriority(task.priority ?? TaskPriority.Medium);
    setDraftTaskStatus(task.status ?? TaskStatus.Open);
    setSelectedTask(task);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!taskId) return;

    try {
      await deleteTask({
        id: taskId
      });
      fireToast("success", "Task deleted", "The task has been successfully deleted.");
    } catch (error) {
      console.error("Failed to delete task:", error);
      fireToast("error", "Failed to delete task", "An error occurred while deleting the task.");
    }
  };

  const handleSendToInbox = async (task: TaskUI) => {
    const inboxId = getInboxListId();
    if (inboxId && task.listId === inboxId) return;

    try {
      await sendTaskToInbox(task.id);
      fireToast("success", "Task sent to Inbox", "The task has been successfully sent to your Inbox.");
    } catch (error) {
      console.error("Error sending task to inbox:", error);
      fireToast("error", "Failed to send to Inbox", "An error occurred while sending the task to the Inbox.");
    }
  };

  const handleSave = async (selectedTask: TaskUI | null) => {
    if (!selectedTask) return;

    const nextListId = draftTaskListId || selectedTask.listId;
    const didMoveLists = nextListId !== selectedTask.listId;

    try {
      setSaving(true);
      await updateTask({
        id: selectedTask.id,
        title: draftTaskTitle.trim() || "Untitled Task",
        description: draftTaskDescription,
        // Cast to generated enums (type-level only) so TS stops screaming.
        priority: draftTaskPriority as unknown as TaskPriority,
        status: draftTaskStatus as unknown as TaskStatus,
        dueAt: dateInputToIso(draftTaskDueDate),
        completedAt:
          draftTaskStatus === TaskStatus.Done ? (selectedTask.completedAt ?? new Date().toISOString()) : null,
        listId: nextListId,
        ...(didMoveLists ? { parentTaskId: null, sortOrder: 0 } : null),
      });
      fireToast("success", "Task saved", "The task has been successfully updated.");
    } catch (error) {
      console.error("Error saving task:", error);
      fireToast("error", "Error saving task", "There was an issue saving the task.");
    } finally {
      setSaving(false);
      resetFormAndClose();
    }
  };

  const acceptChanges = async () => {
    await handleSave(selectedTask)
  };

  const cancelEditTask = () => {
    resetFormAndClose();
    fireToast("info", "Edit cancelled", "Task edit has been cancelled.");
  };

  const prepAddTaskForm = () => {
    if (showAddTaskForm) {
      setShowAddTaskForm(false);
      return;
    } else {
      setShowAddTaskForm(!showAddTaskForm);
      let newTaskTitleUnique = newTaskTitle;
      if (newTaskTitle === null || newTaskTitle === "" || newTaskTitle === ("New Task")) {
        newTaskTitleUnique = `New Task--${Math.random().toString(36).substring(2, 12)}`;
      }
      setNewTaskTitle(newTaskTitleUnique);
      setNewTaskDescription("");
      setNewTaskDueDate(todayDate);
      setNewTaskPriority(TaskPriority.Medium);
    }
  };

  const resetFormAndClose = () => {
    setDraftTaskTitle("");
    setDraftTaskDescription("");
    setDraftTaskListId("");
    setDraftTaskDueDate("");
    setDraftTaskPriority(TaskPriority.Medium);
    setDraftTaskStatus(TaskStatus.Open);
    setSelectedTask(null);
  };

  if (loading) return <BasicSpinner />;
  
  return (
    <VStack minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
      <Toaster />
      <VStack w="100%" gap={4} align="start">
        <HStack justify="space-between" w="100%">
          <HStack align="center" gap={2}>
            <Heading size="2xl">Tasks</Heading>
            <Badge>View, search, filter, sort, and manage all your tasks in one place.</Badge>
          </HStack>
          <CompletedTasksToggle showCompletedTasks={showCompletedTasks} setShowCompletedTasks={setShowCompletedTasks} />
        </HStack>

        <Tip storageKey="tip:tasks-filters" title="Tip">
          Use “Filters & Sorting” to quickly find tasks. “Someday” tasks are the ones without a due date.
        </Tip>

        <HStack gap={2} flexWrap="wrap" justifyContent={"center"} w={"100%"}>
          <Badge variant="outline">Total: {taskCounts.total}</Badge>
          <Badge variant="outline" colorPalette="green">
            Incomplete: {taskCounts.incomplete}
          </Badge>
          <Badge variant="outline" colorPalette="blue">
            Completed: {taskCounts.completed}
          </Badge>
          <Badge variant="solid" colorPalette="purple">
            Showing: {taskCounts.showing}
          </Badge>
          <Badge variant="outline" colorPalette="red">
            Overdue: {taskCounts.overdue}
          </Badge>
          <Badge variant="outline" colorPalette="orange">
            Due today: {taskCounts.dueToday}
          </Badge>
          <Badge variant="outline" colorPalette="teal">
            Scheduled: {taskCounts.scheduledOpen}
          </Badge>
          <Badge variant="outline" colorPalette="gray">
            Someday: {taskCounts.somedayOpen}
          </Badge>
        </HStack>

        <AppCollapsible title="Filters & Sorting" width="50%">
          <SearchFilterSortBar
            search={taskSearch}
            setSearch={setTaskSearch}
            searchPlaceholder="Search title/description"
            searchHelperText="Search tasks by title or description."
            filter={{
              title: "List",
              items: listFilterItems,
              value: selectedListFilter,
              onChange: (v) => setSelectedListFilter(v || "all"),
              placeholder: "All lists",
              helperText: "Filter tasks by list",
            }}
            sort={{
              title: "Sort",
              items: SORT_OPTIONS,
              value: sortKey,
              onChange: (v) => setSortKey(v && isSortKey(v) ? v : "sortOrder"),
              placeholder: "Manual (sort order)",
              helperText: "Choose how tasks are ordered",
            }}
            onClear={() => {
              setTaskSearch("");
              setSelectedListFilter("all");
              setSortKey("sortOrder");
            }}
            resultsCount={visibleTasks.length}
          />
        </AppCollapsible>

        <Flex
          gap={4}
          alignItems={"center"}
          width={"100%"}
        >
          <HStack gap={2} align="end" justify="space-between" w="100%" px={2} flex={1}>
            <Heading size="sm" w="150px">Task Name & Details</Heading>
            <Text fontSize="sm" color="gray.500">{showCompletedTasks ? "Showing completed tasks" : "Showing incomplete tasks"}</Text>
            <HStack align="end" gap={1}>
              <Heading size="sm" w="100px" textAlign="right">List</Heading>
              <Heading size="sm" w="100px" textAlign="right">Priority & Status</Heading>
            </HStack>
          </HStack>
          {/* spacer for edit button - reflexive with edit state */}
          <Box width={"84.8125px"}></Box>
        </Flex>
      </VStack>

      {allTasks.length === 0 ? (
        <Text>No tasks available.</Text>
      ) : visibleTasks.length === 0 ? (
        <Text>No tasks match your filters.</Text>
      ) : (
        <VStack align="stretch" gap={2} w="100%">
          {visibleTasks.map((task) => {
            const list = listById.get(task.listId);
            if (!list) return null;

            return (
              <Flex key={task.id} gap={4} alignItems={"center"} width={"100%"}>
                <Box flex="1">
                  <TaskRow
                    task={task}
                    list={list}
                    to={`/lists/${task.listId}/tasks/${task.id}`}
                    showLists
                    onMove={handleSendToInbox}
                    onToggleComplete={handleToggleComplete}
                    onDelete={() => handleDeleteTask(task.id)}
                  />
                </Box>
                <Button
                  size="2xl"
                  bg="orange.200"
                  variant="outline"
                  height={"95px"}
                  onClick={() => handleEditTask(task)}
                  _hover={{
                    bg: "orange.300",
                    borderColor: "orange.400",
                    color: "orange.700",
                    fontWeight: "500",
                    boxShadow: "lg",
                  }}
                >
                  Edit
                </Button>
              </Flex>
            );
          })}
        </VStack>
      )}
    {!showAddTaskForm && (
      <Button
          bg="green.200"
          variant="outline"
          onClick={() => prepAddTaskForm()}
        > Add New Task</Button>
      )}
      {showAddTaskForm && (
        <Box w="50%" p={4} border="1px" borderColor="gray.200" borderRadius="md" boxShadow="sm" bg="gray.50">
          <AddTaskForm
            newTaskTitle={newTaskTitle}
            setNewTaskTitle={setNewTaskTitle}
            newTaskDescription={newTaskDescription}
            setNewTaskDescription={setNewTaskDescription}
            newTaskDueDate={newTaskDueDate}
            setNewTaskDueDate={setNewTaskDueDate}
            newTaskPriority={newTaskPriority}
            setNewTaskPriority={setNewTaskPriority}
            setShowAddTaskForm={setShowAddTaskForm}
            navigate={navigate}
            refresh={refreshData}
            parentTaskId={undefined}
          />
        </Box>
      )}
      <DialogModal
        title="Edit Task"
        body={
          selectedTask ? (
          <EditTaskForm
            key={selectedTask.id}
            task={selectedTask}
            draftTaskTitle={draftTaskTitle}
            setDraftTaskTitle={setDraftTaskTitle}
            draftTaskDescription={draftTaskDescription}
            setDraftTaskDescription={setDraftTaskDescription}
            draftTaskListId={draftTaskListId}
            setDraftTaskListId={setDraftTaskListId}
            draftTaskPriority={draftTaskPriority}
            setDraftTaskPriority={setDraftTaskPriority}
            draftTaskStatus={draftTaskStatus}
            setDraftTaskStatus={setDraftTaskStatus}
            draftTaskDueDate={draftTaskDueDate}
            setDraftTaskDueDate={setDraftTaskDueDate}
            saving={saving}
            setSaving={setSaving}
            onSave={() => handleSave(selectedTask)}
            onClose={cancelEditTask}
            refresh={refreshData}
          />
          ) : null
        }
        open={isDialogOpen}
        setOpen={(open) => { if (!open) setSelectedTask(null); }} // Keeps the close dialog button functional
        onAccept={acceptChanges}
        onCancel={cancelEditTask}
      />
    </VStack>
  );
}