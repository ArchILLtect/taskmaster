import { Badge, Box, Button, Heading, HStack, Text, VStack, Flex, Icon } from "@chakra-ui/react";
import { TaskRow } from "../components/TaskRow";
import { buildTaskStackPath } from "../routes/taskStack";
import { TaskPriority, TaskStatus } from "../API";
import { useInboxPageData } from "./useInboxPageData";
import { useMemo, useRef, useState } from "react";
import { AddTaskForm, type AddTaskFormHandle } from "../components/forms/AddTaskForm";
import { useNavigate } from "react-router-dom";
import { fireToast } from "../hooks/useFireToast";
import { DialogModal } from "../components/ui/DialogModal";
import { EditTaskForm } from "../components/forms/EditTaskForm";
import type { TaskUI } from "../types";
import { BasicSpinner } from "../components/ui/BasicSpinner";
import { useTaskActions, useTaskIndexView } from "../store/taskStore";
import { useInboxActions } from "../store/inboxStore";
import { FcPlus, FcHighPriority, FcExpired } from "react-icons/fc";
import { FiEdit2 } from "react-icons/fi";
import { Tip } from "../components/ui/Tip";
import { getTodayDateInputValue, isoToDateInputValue } from "../services/dateTime";
import { AppCollapsible } from "../components/AppCollapsible";
import { FIELD_LIMITS } from "../config/fieldConstraints";
import {
  normalizeDateInputToIso,
  normalizeOptionalSingleLineText,
  normalizeRequiredTitle,
} from "../services/inputNormalization";


// TODO: Give this page more thought re: UX/design
// What’s the best way to help users triage their inbox effectively?
// Also, how to make this more of a staging area for new tasks and other “attention needed” items.

// Possible improvements:
// - Due soon for all tasks, not just inbox?
// - Maybe tabs for New vs Due Soon instead of one long list?
// - Better empty states?
// - Bulk actions (dismiss all new, extend due dates, etc)
// - Animation when dismissing items?
// - Settings link for configuring inbox behavior?
// - Keyboard shortcuts for triage actions?
// - Show more task details inline (due date, list, etc)
// - Confirmation for "Done triaging" if there are still new/due tasks?
// - Mobile responsiveness testing and tweaks
// - Accessibility review to ensure screen reader friendliness
// - Performance optimizations for large inboxes

// Set today's date as default due date in YYYY-MM-DD format
const todayDate = getTodayDateInputValue();

export function InboxPage() {
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [addTaskSaving, setAddTaskSaving] = useState(false);
  const addTaskFormRef = useRef<AddTaskFormHandle | null>(null);
  const [isDoneTriagingDialogOpen, setIsDoneTriagingDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskUI | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("New Task");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState(todayDate);
  const [newTaskPriority, setNewTaskPriority] = useState(TaskPriority.Medium);
  const [draftTaskTitle, setDraftTaskTitle] = useState("");
  const [draftTaskDescription, setDraftTaskDescription] = useState("");
  const [draftTaskListId, setDraftTaskListId] = useState("");
  const [draftTaskParentId, setDraftTaskParentId] = useState<string | null>(null);
  const [draftTaskDueDate, setDraftTaskDueDate] = useState("");
  const [draftTaskPriority, setDraftTaskPriority] = useState(TaskPriority.Medium);
  const [draftTaskStatus, setDraftTaskStatus] = useState(TaskStatus.Open);
  const [saving, setSaving] = useState(false);

  const { vm, lists, loading, err, refreshData } = useInboxPageData();
  const { dismiss, dismissMany } = useInboxActions();

  const { tasksByListId } = useTaskIndexView();

  const { updateTask, deleteTask } = useTaskActions();

  const navigate = useNavigate();
  const isDialogOpen = !!selectedTask;
  const linkToTask = (listId: string, taskId: string) => buildTaskStackPath(listId, [taskId]);
  const listById = useMemo(() => new Map(lists.map(l => [l.id, l])), [lists]);

  const triageIds = useMemo(() => {
    return [...vm.overdueTasks, ...vm.dueSoonTasks].map((t) => t.id);
  }, [vm.dueSoonTasks, vm.overdueTasks]);

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
    }
  };

  const handleEditTask = async (task: TaskUI) => {
    // Ensure the add dialog doesn't compete with the edit dialog.
    setIsAddTaskDialogOpen(false);
    setDraftTaskTitle(task.title ?? "");
    setDraftTaskDescription(task.description ?? "");
    setDraftTaskListId(task.listId ?? "");
    setDraftTaskParentId(task.parentTaskId ?? null);
    setDraftTaskDueDate(isoToDateInputValue(task.dueAt));
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

  const handleSave = async (selectedTask: TaskUI | null) => {
    if (!selectedTask) return;

    const nextListId = draftTaskListId || selectedTask.listId;
    const didMoveLists = nextListId !== selectedTask.listId;

    const nextParentTaskId = draftTaskParentId ?? null;
    const prevParentTaskId = selectedTask.parentTaskId ?? null;
    const didMoveParent = nextParentTaskId !== prevParentTaskId;
    const shouldUpdateMoveFields = didMoveLists || didMoveParent;

    const destTasks = tasksByListId[nextListId] ?? [];

    const title = normalizeRequiredTitle(draftTaskTitle, "Untitled Task", { maxLen: FIELD_LIMITS.task.titleMax });
    const description = normalizeOptionalSingleLineText(draftTaskDescription, { maxLen: FIELD_LIMITS.task.descriptionMax });
    const dueAt = normalizeDateInputToIso(draftTaskDueDate);

    try {
      setSaving(true);
      await updateTask({
        id: selectedTask.id,
        listId: nextListId,
        ...(shouldUpdateMoveFields
          ? (() => {
              const siblings = destTasks.filter(
                (t) => t.id !== selectedTask.id && (t.parentTaskId ?? null) === nextParentTaskId
              );
              const max = siblings.reduce((acc, t) => Math.max(acc, t.sortOrder ?? 0), 0);
              return {
                parentTaskId: nextParentTaskId,
                sortOrder: max + 1,
              };
            })()
          : null),
        title,
        description,
        // Cast to generated enums (type-level only) so TS stops screaming.
        priority: draftTaskPriority as unknown as TaskPriority,
        status: draftTaskStatus as unknown as TaskStatus,
        dueAt,
        completedAt:
          draftTaskStatus === TaskStatus.Done ? (selectedTask.completedAt ?? new Date().toISOString()) : null,
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

  const openAddTaskDialog = () => {
    // Ensure the edit dialog doesn't compete with the add dialog.
    setSelectedTask(null);

    setIsAddTaskDialogOpen(true);
    let newTaskTitleUnique = newTaskTitle;
    if (newTaskTitle === null || newTaskTitle === "" || newTaskTitle === "New Task") {
      newTaskTitleUnique = `New Task--${Math.random().toString(36).substring(2, 12)}`;
    }
    setNewTaskTitle(newTaskTitleUnique);
    setNewTaskDescription("");
    setNewTaskDueDate(todayDate);
    setNewTaskPriority(TaskPriority.Medium);
  };

  const closeAddTaskDialog = () => {
    setIsAddTaskDialogOpen(false);
  };

  const resetFormAndClose = () => {
    setDraftTaskTitle("");
    setDraftTaskDescription("");
    setDraftTaskListId("");
    setDraftTaskParentId(null);
    setDraftTaskDueDate("");
    setDraftTaskPriority(TaskPriority.Medium);
    setDraftTaskStatus(TaskStatus.Open);
    setSelectedTask(null); // closes dialog
  };

  if (loading) return <BasicSpinner />;

  if (err) {
    return (
      <VStack align="start" gap={3} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
        <Heading size="2xl">Inbox</Heading>
        <Text color="red.700" fontWeight="600">
          Failed to load inbox data.
        </Text>
        <Button size="sm" variant="outline" onClick={refreshData}>
          Retry
        </Button>
      </VStack>
    );
  }

  return (
    <VStack align="start" gap={4} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
      <HStack w="100%" justify="space-between" align="start">
        <VStack align="start" gap={1}>
          <Heading size="2xl">Inbox</Heading>
          <Text color="gray.700">
            Inbox is your staging area for anything that needs attention and a place to quickly drop new tasks.
          </Text>
          <Text color="gray.600" fontSize="sm">
            Actionable triage: new tasks + overdue + due soon. In the future, items from teammates/collaborators will land
            here too so you can decide what to do next.
          </Text>
        </VStack>
        <HStack justify="end">
          <Button size="sm" variant="outline" bg="green.200" onClick={openAddTaskDialog}>
            Add New Task
          </Button>
        </HStack>

        <Button
          size="sm"
          onClick={() => {
            if (triageIds.length === 0) {
              fireToast("info", "Done triaging", "No overdue or due-soon notifications to ignore.");
              return;
            }
            setIsDoneTriagingDialogOpen(true);
          }}
        >
          Done triaging
        </Button>
      </HStack>

      <DialogModal
        title="Ignore all due/overdue notifications?"
        body={
          <VStack align="start" gap={2}>
            <Text>
              This will ignore {triageIds.length} {triageIds.length === 1 ? "notification" : "notifications"}.
            </Text>
            <Text color="gray.600" fontSize="sm">
              You can reset ignored notifications in Settings.
            </Text>
          </VStack>
        }
        open={isDoneTriagingDialogOpen}
        setOpen={setIsDoneTriagingDialogOpen}
        acceptLabel="Ignore all"
        acceptColorPalette="green"
        acceptVariant="solid"
        cancelLabel="Cancel"
        cancelVariant="outline"
        onAccept={() => {
          dismissMany(triageIds);
          fireToast(
            "success",
            "Done triaging",
            `Ignored ${triageIds.length} ${triageIds.length === 1 ? "notification" : "notifications"}.`
          );
        }}
        onCancel={() => {
          // no-op
        }}
      />

      <Tip
        storageKey="tip:inbox-due-soon-window"
        title="Tip"
        action={
          <Button size="sm" variant="outline" onClick={() => navigate("/settings")}>
            Open Settings
          </Button>
        }
      >
        You can change the “Due soon” window (in days) on the Settings page.
      </Tip>

      {/* New tasks */}
      <Box w="100%" bg="gray.50" p="3" rounded="md" boxShadow="sm">
        <AppCollapsible
          defaultOpen={vm.inboxStagingTasks.length > 0}
          mt="0"
          mb="0"
          ariaLabel="Toggle Inbox tasks section"
          title={
            <HStack gap={2} alignItems="center">
              <Icon as={FcPlus} />
              <Heading size="lg" fontWeight={700} minW="86px">
                Inbox tasks
              </Heading>
              <Badge rounded="md">{vm.inboxStagingTasks.length}</Badge>
            </HStack>
          }
        >
          <HStack justify="end" mt={2}>
            <Button size="sm" variant="outline" bg="green.200" onClick={openAddTaskDialog}>
              Add New Task
            </Button>
          </HStack>
          {vm.inboxStagingTasks.length === 0 ? (
            <Text color="gray.600" mt={2}>
              No tasks in your Inbox right now.
            </Text>
          ) : (
            <VStack align="stretch" gap={2} mt={2}>
              {vm.inboxStagingTasks.map((task) => {
                const listForTask = listById.get(task.listId);
                if (!listForTask) return null;
                return (
                  <Flex key={task.id} gap={1} alignItems="center" width="100%">
                    <Box flex="1">
                      <TaskRow
                        task={task}
                        list={listForTask}
                        to={linkToTask(task.listId, task.id)}
                        showLists
                        onToggleComplete={handleToggleComplete}
                        onDelete={() => handleDeleteTask(task.id)}
                      />
                    </Box>
                    <VStack gap={1} border={"sm"} borderColor={"blue.400"} borderRadius={"md"} padding={2}>
                      <Button
                        size="xl"
                        bg="orange.200"
                        variant="outline"
                        height={"75px"}
                        onClick={() => handleEditTask(task)}
                        _hover={{
                          bg: "orange.300",
                          borderColor: "orange.400",
                          color: "orange.700",
                          fontWeight: "500",
                          boxShadow: "lg",
                        }}
                      >
                        <VStack>
                          <Icon size={"sm"} as={FiEdit2} />
                          Edit
                        </VStack>
                      </Button>
                    </VStack>
                  </Flex>
                );
              })}
            </VStack>
          )}
        </AppCollapsible>
      </Box>

      {/* Overdue */}
      <Box w="100%" bg="gray.50" p="3" rounded="md" boxShadow="sm">
        <AppCollapsible
          defaultOpen={vm.overdueTasks.length > 0}
          mt="0"
          mb="0"
          ariaLabel="Toggle overdue tasks section"
          title={
            <HStack gap={2} alignItems="center">
              <Icon as={FcExpired} />
              <Heading size="lg" fontWeight={700}>
                Overdue
              </Heading>
              <Badge rounded="md">{vm.overdueTasks.length}</Badge>
            </HStack>
          }
        >
          {vm.overdueTasks.length === 0 ? (
            <Text color="gray.600" mt={2}>
              No overdue tasks. Keep it up.
            </Text>
          ) : (
            <VStack align="stretch" gap={2} mt={2}>
              {vm.overdueTasks.map((task) => {
                const listForTask = listById.get(task.listId);
                if (!listForTask) return null;
                return (
                  <Flex key={task.id} gap={1} alignItems="center" width="100%">
                    <Box flex="1">
                      <TaskRow
                        task={task}
                        list={listForTask}
                        to={linkToTask(task.listId, task.id)}
                        showLists
                        onToggleComplete={handleToggleComplete}
                        onDelete={() => handleDeleteTask(task.id)}
                      />
                    </Box>
                    <VStack gap={1} border={"sm"} borderColor={"blue.400"} borderRadius={"md"} padding={2}>
                      <Button
                        size="sm"
                        minW="81.4792px"
                        variant="outline"
                        bg="red.200"
                        onClick={() => dismiss(task.id)}
                        _hover={{
                          bg: "orange.600",
                          borderColor: "red.600",
                          color: "orange.100",
                          fontWeight: "500",
                          boxShadow: "lg",
                        }}
                      >
                        Ignore
                      </Button>
                      <Button
                        size="sm"
                        bg="orange.200"
                        variant="outline"
                        height="36px"
                        onClick={() => handleEditTask(task)}
                        _hover={{
                          bg: "orange.300",
                          borderColor: "orange.400",
                          color: "orange.700",
                          fontWeight: "500",
                          boxShadow: "lg",
                        }}
                      >
                        <HStack>
                          <Icon size={"sm"} as={FiEdit2} />
                          Edit
                        </HStack>
                      </Button>
                    </VStack>
                  </Flex>
                );
              })}
            </VStack>
          )}
        </AppCollapsible>
      </Box>

      {/* Due soon */}
      <Box w="100%" bg="gray.50" p="3" rounded="md" boxShadow="sm">
        <AppCollapsible
          defaultOpen={vm.dueSoonTasks.length > 0}
          mt="0"
          mb="0"
          ariaLabel="Toggle due soon tasks section"
          title={
            <HStack gap={2} alignItems="center">
              <Icon as={FcHighPriority} />
              <Heading size="lg" fontWeight={700}>
                Due soon
              </Heading>
              <Badge rounded="md">{vm.dueSoonTasks.length}</Badge>
            </HStack>
          }
        >
          {vm.dueSoonTasks.length === 0 ? (
            <Text color="gray.600" mt={2}>
              Nothing due soon. Future-you says thanks.
            </Text>
          ) : (
            <VStack align="stretch" gap={2} mt={2}>
              {vm.dueSoonTasks.map((task) => {
                const listForTask = listById.get(task.listId);
                if (!listForTask) return null;
                return (
                  <Flex key={task.id} gap={1} alignItems="center" width="100%">
                    <Box flex="1">
                      <TaskRow
                        task={task}
                        list={listForTask}
                        to={linkToTask(task.listId, task.id)}
                        showLists
                        onToggleComplete={handleToggleComplete}
                        onDelete={() => handleDeleteTask(task.id)}
                      />
                    </Box>
                    <VStack gap={1} border={"sm"} borderColor={"blue.400"} borderRadius={"md"} padding={2}>
                      <Button
                        size="sm"
                        minW="81.4792px"
                        variant="outline"
                        bg="red.200"
                        onClick={() => dismiss(task.id)}
                        _hover={{
                          bg: "orange.600",
                          borderColor: "red.600",
                          color: "orange.100",
                          fontWeight: "500",
                          boxShadow: "lg",
                        }}
                      >
                        Ignore
                      </Button>
                      <Button
                        size="sm"
                        bg="orange.200"
                        variant="outline"
                        height="36px"
                        onClick={() => handleEditTask(task)}
                        _hover={{
                          bg: "orange.300",
                          borderColor: "orange.400",
                          color: "orange.700",
                          fontWeight: "500",
                          boxShadow: "lg",
                        }}
                      >
                        <HStack>
                          <Icon size={"sm"} as={FiEdit2} />
                          Edit
                        </HStack>
                      </Button>
                    </VStack>
                  </Flex>
                );
              })}
            </VStack>
          )}
        </AppCollapsible>
      </Box>

      <Tip storageKey="tip:inbox-staging" title="Tip">
        Your Inbox is a staging area. Tasks that live in the system Inbox list stay visible here until you move them to a
        real list (or complete/delete them).
      </Tip>
      <DialogModal
        title="Add Task"
        body={
          <AddTaskForm
            ref={addTaskFormRef}
            newTaskTitle={newTaskTitle}
            setNewTaskTitle={setNewTaskTitle}
            newTaskDescription={newTaskDescription}
            setNewTaskDescription={setNewTaskDescription}
            newTaskDueDate={newTaskDueDate}
            setNewTaskDueDate={setNewTaskDueDate}
            newTaskPriority={newTaskPriority}
            setNewTaskPriority={setNewTaskPriority}
            navigate={navigate}
            parentTaskId={undefined}
            onSavingChange={setAddTaskSaving}
            onCreated={() => {
              // Keep user on Inbox after creating from Inbox.
              navigate("/inbox");
            }}
          />
        }
        open={isAddTaskDialogOpen}
        setOpen={(open) => {
          if (!open) {
            addTaskFormRef.current?.cancel?.();
          }
          setIsAddTaskDialogOpen(open);
        }}
        acceptLabel="Create"
        acceptColorPalette="green"
        acceptVariant="solid"
        cancelLabel="Cancel"
        loading={addTaskSaving}
        onAccept={async () => {
          await addTaskFormRef.current?.submit?.();
        }}
        onCancel={() => {
          addTaskFormRef.current?.cancel?.();
          closeAddTaskDialog();
        }}
      />

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
            draftTaskParentId={draftTaskParentId}
            setDraftTaskParentId={setDraftTaskParentId}
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