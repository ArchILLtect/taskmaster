import { Badge, Box, Button, Heading, HStack, NumberInput, Text, VStack, Flex, Icon } from "@chakra-ui/react";
import { TaskRow } from "../components/TaskRow";
import { buildTaskStackPath } from "../routes/taskStack";
import { TaskPriority, TaskStatus } from "../API";
import { useInboxPageData } from "./useInboxPageData";
import { useMemo, useState } from "react";
import { AddTaskForm } from "../components/forms/AddTaskForm";
import { useNavigate } from "react-router-dom";
import { fireToast } from "../hooks/useFireToast";
import { DialogModal } from "../components/ui/DialogModal";
import { EditTaskForm } from "../components/forms/EditTaskForm";
import type { TaskUI } from "../types";
import { Toaster } from "../components/ui/Toaster";
import { BasicSpinner } from "../components/ui/BasicSpinner";
import { useTaskActions } from "../store/taskStore";
import { useInboxActions } from "../store/inboxStore";
import { FcPlus, FcHighPriority, FcExpired } from "react-icons/fc";


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

// Get current timezone
const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
// Set today's date as default due date in YYYY-MM-DD format
const todayDate = new Date().toLocaleDateString('en-CA', { timeZone: userTimeZone });

export function InboxPage() {
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

  const { vm, lists, loading, err, refreshData } = useInboxPageData();

  const { markViewedNow, setDueSoonWindowDays, dismiss } = useInboxActions();

  const { updateTask, deleteTask } = useTaskActions();

  const navigate = useNavigate();
  const isDialogOpen = !!selectedTask;
  const linkToTask = (listId: string, taskId: string) => buildTaskStackPath(listId, [taskId]);
  const listById = useMemo(() => new Map(lists.map(l => [l.id, l])), [lists]);

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

  const handleSave = async (selectedTask: TaskUI | null) => {
    if (!selectedTask) return;

    const nextListId = draftTaskListId || selectedTask.listId;
    const didMoveLists = nextListId !== selectedTask.listId;

    try {
      setSaving(true);
      await updateTask({
        id: selectedTask.id,
        listId: nextListId,
        ...(didMoveLists ? { parentTaskId: null, sortOrder: 0 } : null),
        title: draftTaskTitle.trim() || "Untitled Task",
        description: draftTaskDescription,
        // Cast to generated enums (type-level only) so TS stops screaming.
        priority: draftTaskPriority as unknown as TaskPriority,
        status: draftTaskStatus as unknown as TaskStatus,
        dueAt: dateInputToIso(draftTaskDueDate),
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
    setSelectedTask(null); // closes dialog
  };

  if (loading) return <BasicSpinner />;

  if (err) return <div>Failed to load inbox data.</div>;

  // Optional: if inboxListId is missing, nothing to show
  // (in your hook, inboxTasks becomes [])
  // if (!vm.newTasks.length && !vm.dueSoonTasks.length) {
  //   return <div>Your inbox is empty. Hooray!</div>;
  // }

  return (
    <VStack align="start" gap={4} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
      <Toaster />
      <HStack w="100%" justify="space-between" align="start">
        <VStack align="start" gap={1}>
          <Heading size="2xl">Inbox</Heading>
          <Text color="gray.600">Actionable triage: new tasks + overdue + due soon. Dismiss stuff to shrink the pile.</Text>
        </VStack>

        <Button
          onClick={() => {
            markViewedNow();
          }}
        >
          Done triaging
        </Button>
      </HStack>

      {/* TODO : Add a "Tip" component that is a small window that can be closed (x) with a 'hover-over' type
                 tooltip that says something like 'click to dismiss this tip' and provides a tip. Then use
                 it here to give a tip that the "Due soon" window can be set on the settings page. */}
      {/* TODO : Move this Due soon window setting to the seetings page. */}
      <HStack gap={3} align="center">
        <Text fontWeight="600">Due soon window:</Text>
        <NumberInput.Root
          size="sm"
          width="90px"
          min={1}
          max={30}
          value={String(vm.state.dueSoonWindowDays)}
          onValueChange={({ valueAsNumber }) => {
            if (!Number.isFinite(valueAsNumber)) return;
            setDueSoonWindowDays(valueAsNumber);
          }}
        >
          <NumberInput.Input />
        </NumberInput.Root>
        <Text color="gray.600" fontSize="sm">
          days
        </Text>
      </HStack>

      {/* New tasks */}
      <Box w="100%">
        <HStack mb={2} gap={2} alignItems="center">
          <Icon as={FcPlus} size="lg"/>
          <Heading size="lg" fontWeight={700}>New tasks</Heading>
          <Badge rounded="md">{vm.newTasks.length}</Badge>
        </HStack>

        {vm.newTasks.length === 0 ? (
          <Text color="gray.600">No new tasks since your last inbox pass. Nice. ✨</Text>
        ) : (
          <VStack align="stretch" gap={2}>
            {vm.newTasks.map((t) => {
              const listForTask = listById.get(t.listId);
              if (!listForTask) return null;
              return (
                <Flex
                  key={t.id}
                  gap={1}
                  alignItems={"center"}
                  width={"100%"}
                >
                  <Box flex="1">
                    <TaskRow
                      task={t}
                      list={listForTask}
                      to={linkToTask(t.listId, t.id)}
                      showLists
                      onToggleComplete={handleToggleComplete}
                      onDelete={() => handleDeleteTask(t.id)}
                    />
                  </Box>
                  <VStack gap={1} border={"sm"} borderColor={"blue.400"} borderRadius={"md"} padding={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        dismiss(t.id);
                      }}
                    >
                      Dismiss
                    </Button>
                    <Button
                      size="2xl"
                      bg="orange.200"
                      variant="outline"
                      height={"36px"}
                      onClick={() => handleEditTask(t)}
                      _hover={{ bg: "orange.300", borderColor: "orange.400", color: "orange.700", fontWeight: "500", boxShadow: "lg" }}
                    >
                      Edit
                    </Button>
                  </VStack>
                </Flex>
            )})}
          </VStack>
        )}
      </Box>

      {/* Overdue */}
      <Box w="100%" pt={2}>
        <HStack mb={2} gap={2}>
          <HStack gap={1} alignItems="center">
            <Icon as={FcHighPriority} size="lg"/>
            <Heading size="lg" fontWeight={700}>
              Overdue
            </Heading>
          </HStack>
          <Badge rounded="md">{vm.overdueTasks.length}</Badge>
        </HStack>

        {vm.overdueTasks.length === 0 ? (
          <Text color="gray.600">No overdue tasks. Keep it up.</Text>
        ) : (
          <VStack align="stretch" gap={2}>
            {vm.overdueTasks.map((t) => {
              const listForTask = listById.get(t.listId);
              if (!listForTask) return null;
              return (
                <Flex key={t.id} gap={1} alignItems={"center"} width={"100%"}>
                  <Box flex="1">
                    <TaskRow
                      task={t}
                      list={listForTask}
                      to={linkToTask(t.listId, t.id)}
                      showLists
                      onToggleComplete={handleToggleComplete}
                      onDelete={() => handleDeleteTask(t.id)}
                    />
                  </Box>
                  <VStack gap={1} border={"sm"} borderColor={"blue.400"} borderRadius={"md"} padding={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        dismiss(t.id);
                      }}
                    >
                      Acknowledge
                    </Button>
                    <Button
                      size="2xl"
                      bg="orange.200"
                      variant="outline"
                      height={"36px"}
                      onClick={() => handleEditTask(t)}
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
                  </VStack>
                </Flex>
              );
            })}
          </VStack>
        )}
      </Box>

      {/* Due soon */}
      <Box w="100%" pt={2}>
        <HStack mb={2} gap={2}>
          <HStack gap={1} alignItems="center">
            <Icon as={FcExpired} size="lg"/>
            <Heading size="lg" fontWeight={700}>Due soon</Heading>
          </HStack>
          <Badge rounded="md">{vm.dueSoonTasks.length}</Badge>
        </HStack>

        {vm.dueSoonTasks.length === 0 ? (
          <Text color="gray.600">Nothing due soon. Future-you says thanks.</Text>
        ) : (
          <VStack align="stretch" gap={2}>
            {vm.dueSoonTasks.map((t) => {
              const listForTask = listById.get(t.listId);
              if (!listForTask) return null;
              return (
                <Flex
                  key={t.id}
                  gap={1}
                  alignItems={"center"}
                  width={"100%"}
                >
                  <Box flex="1">
                    <TaskRow
                      task={t}
                      list={listForTask}
                      to={linkToTask(t.listId, t.id)}
                      showLists
                      onToggleComplete={handleToggleComplete}
                      onDelete={() => handleDeleteTask(t.id)}
                    />
                  </Box>
                  <VStack gap={1} border={"sm"} borderColor={"blue.400"} borderRadius={"md"} padding={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        dismiss(t.id);
                    }}
                  >
                    Acknowledge
                  </Button>
                    <Button
                      size="2xl"
                      bg="orange.200"
                      variant="outline"
                      height={"36px"}
                      onClick={() => handleEditTask(t)}
                      _hover={{ bg: "orange.300", borderColor: "orange.400", color: "orange.700", fontWeight: "500", boxShadow: "lg" }}
                    >
                      Edit
                    </Button>
                </VStack>
              </Flex>
            )})}
          </VStack>
        )}
      </Box>

      {vm.state.lastViewedAt ? (
        <Text color="gray.500" fontSize="sm">
          Last triage: {new Date(vm.state.lastViewedAt).toLocaleString()}
        </Text>
      ) : (
        <Text color="gray.500" fontSize="sm">
          First time here — everything counts as “new” once.
        </Text>
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