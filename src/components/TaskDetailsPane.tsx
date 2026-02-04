import { forwardRef, useRef, useState } from "react";
import { Box, Flex, Button, Heading, HStack, Text, VStack, Badge, Center, Spinner, Icon } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { buildTaskStackPath, nextStackFromLevel } from "../routes/taskStack";
import { AddTaskForm, type AddTaskFormHandle } from "./forms/AddTaskForm";
import { SubTaskRow } from "./SubTaskRow";
import type { TaskDetailsPaneProps } from "../types/task";
import { EditTaskForm } from "./forms/EditTaskForm";
import { TaskPriority, TaskStatus } from "../API";
import { fireToast } from "../hooks/useFireToast";
import type { TaskUI } from "../types/task";
import { useTaskmasterData } from "../hooks/useTaskmasterData";
import { useTaskActions } from "../store/taskStore";
import { formatDueDate, getTodayDateInputValue } from "../services/dateTime";
import { DialogModal } from "./ui/DialogModal";
import { FiEdit2 } from "react-icons/fi";
import { FIELD_LIMITS } from "../config/fieldConstraints";
import {
  normalizeDateInputToIso,
  normalizeOptionalSingleLineText,
  normalizeRequiredTitle,
} from "../services/inputNormalization";

// --- animations
const pulse = keyframes`
  0%   { box-shadow: 0 0 0 rgba(0,0,0,0); transform: translateY(0); }
  30%  { box-shadow: 0 0 0 4px rgba(66,153,225,0.35); transform: translateY(-1px); }
  100% { box-shadow: 0 0 0 rgba(0,0,0,0); transform: translateY(0); }
`;

function isoToDateInput(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

const todayDate = getTodayDateInputValue();

export const TaskDetailsPane = forwardRef<HTMLDivElement, TaskDetailsPaneProps>(
  function TaskDetailsPane({
    listId,
    taskId,
    stack,
    tasksInList,
    isPulsing,
    newTaskTitle,
    newTaskDescription,
    newTaskDueDate,
    newTaskPriority,
    setNewTaskTitle,
    setNewTaskDescription,
    setNewTaskDueDate,
    setNewTaskPriority,
    refresh,
    navigate,
    onCloseAll,
    onDelete }, ref
  ) {
  
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [addTaskSaving, setAddTaskSaving] = useState(false);
  const addTaskFormRef = useRef<AddTaskFormHandle | null>(null);
  const selected = tasksInList.find((t) => t.id === taskId);
  const [isEditing, setIsEditing] = useState(false);

  const [draftTaskTitle, setDraftTaskTitle] = useState("");
  const [draftTaskDescription, setDraftTaskDescription] = useState("");
  const [draftTaskListId, setDraftTaskListId] = useState("");
  const [draftTaskPriority, setDraftTaskPriority] = useState(TaskPriority.Medium);
  const [draftTaskStatus, setDraftTaskStatus] = useState(TaskStatus.Open);
  const [draftTaskDueDate, setDraftTaskDueDate] = useState(""); // YYYY-MM-DD
  const [saving, setSaving] = useState(false);

  const closeLast = () => navigate(buildTaskStackPath(listId, stack.slice(0, -1)));
  const { loading } = useTaskmasterData();
  const { updateTask } = useTaskActions();

  const children = selected
    ? tasksInList
        .filter((t) => t.parentTaskId === selected.id)
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
    : []
  ;

  // Initialize draft when selection changes
  if (selected && draftTaskTitle === "" && draftTaskDescription === "" && !isEditing) {
    // (This "guard" prevents re-init on every render; we’ll do it properly with useEffect below.)
  }

  const handleToggleComplete = async (taskId: string, nextStatus: TaskStatus) => {
    const completedAt = nextStatus === TaskStatus.Done ? new Date().toISOString() : null;

    await updateTask({
      id: taskId,
      status: nextStatus as TaskStatus,
      completedAt,
    });
  };

  const openAddTaskDialog = () => {
    // Avoid overlapping an inline edit form with a modal flow.
    setIsEditing(false);
    setAddTaskSaving(false);
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

  const handleSave = async (selectedTask: TaskUI) => {
    if (!selectedTask) return;

    const nextListId = draftTaskListId || selectedTask.listId;
    const didMoveLists = nextListId !== selectedTask.listId;
    const didMoveSubtask = didMoveLists ? selectedTask.parentTaskId != null : false;
    const didMoveLastTopLevelTask = didMoveLists
      ? tasksInList.some((t) => t.parentTaskId == null && t.id === selectedTask.id) &&
        tasksInList.every((t) => t.id === selectedTask.id || t.parentTaskId != null)
      : false;

    let didSucceed = false;
    try {
      setSaving(true);

      const title = normalizeRequiredTitle(draftTaskTitle, "Untitled Task", { maxLen: FIELD_LIMITS.task.titleMax });
      const description = normalizeOptionalSingleLineText(draftTaskDescription, { maxLen: FIELD_LIMITS.task.descriptionMax });
      const dueAt = normalizeDateInputToIso(draftTaskDueDate);

      await updateTask({
        id: selectedTask.id,
        listId: nextListId,
        ...(didMoveLists ? { parentTaskId: null, sortOrder: 0 } : null),
        title,
        description,
        // Cast to generated enums (type-level only) so TS stops screaming.
        priority: draftTaskPriority as unknown as TaskPriority,
        status: draftTaskStatus as unknown as TaskStatus,
        dueAt,
        completedAt:
          draftTaskStatus === TaskStatus.Done ? (selectedTask.completedAt ?? new Date().toISOString()) : null,
      });

      // If this move emptied the current list (from the user's POV), follow the task.
      // Also follow moved subtasks: staying on this stack would otherwise lead to a "task not found" pane.
      if (didMoveLastTopLevelTask || didMoveSubtask) {
        navigate(buildTaskStackPath(nextListId, [selectedTask.id]));
      }

      didSucceed = true;
      fireToast("success", "Task saved", "The task has been successfully updated.");
      setIsEditing(false);
      resetFormAndClose();
    } catch (error) {
      console.error("Error saving task:", error);
      fireToast("error", "Error saving task", "There was an issue saving the task.");
    } finally {
      setSaving(false);
    }

    return didSucceed;
  };

  const resetFormAndClose = () => {
    setDraftTaskTitle("");
    setDraftTaskDescription("");
    setDraftTaskListId("");
    setDraftTaskDueDate("");
    setDraftTaskPriority(TaskPriority.Medium);
    setDraftTaskStatus(TaskStatus.Open);
  };

  // Add a spinner for loading state
  if (loading) {
    return (
      <Flex align={"start"} gap={4} p={4} bg="white" rounded="md" minHeight="100%" borderWidth="1px" className="ListPageMain" w="max-content">
        <Center width={"40vw"} height={"85vh"}>
          <Spinner size={"xl"} />
        </Center>
      </Flex>
    );
  }

  return (
    <Box
      borderWidth="1px"
      rounded="md"
      ref={ref}
      p={4}
      minH="84vh"
      w="38.5vw"
      flexShrink={0}
      animation={isPulsing ? `${pulse} 1s ease-out` : undefined}
    >
      <HStack justify="space-between" mb={2}>
        <Heading size="md">Details</Heading>

        <HStack gap={2} align={"center"} fontWeight={"medium"}>
          <Text fontSize="sm">Close:</Text>
          <Button as="span" size="xs" variant="ghost" onClick={closeLast}>
            Last
          </Button>
          <Button as="span" size="xs" variant="ghost" onClick={onCloseAll}>
            All
          </Button>
        </HStack>
      </HStack>

      {!selected ? (
        <Text color="gray.600">Task not found.</Text>
      ) : (
        <Box w="100%">
          <VStack align="start" gap={2}>
            <HStack justify="space-between" w="100%">
              <Text fontWeight="700" fontSize="lg">
                {selected.title}
              </Text>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (selected && !isEditing) {
                      setDraftTaskTitle(selected.title ?? "");
                      setDraftTaskDescription(selected.description ?? "");
                      setDraftTaskListId(selected.listId ?? "");
                      setDraftTaskPriority((selected.priority as TaskPriority) ?? TaskPriority.Medium);
                      setDraftTaskStatus((selected.status as TaskStatus) ?? TaskStatus.Open);
                      setDraftTaskDueDate(isoToDateInput(selected.dueAt));
                    }
                    setIsEditing((v) => !v);
                  }}
                >
                  <HStack gap={2}>
                    {!isEditing ? <Icon as={FiEdit2} /> : null}
                    <Text>{isEditing ? "Hide Edit" : "Edit (inline)"}</Text>
                  </HStack>
                </Button>
            </HStack>

            {isEditing ? (
              <EditTaskForm
                key={selected.id}
                task={selected}
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
                skipModal={true}
                saving={saving}
                setSaving={setSaving}
                onSave={async () => {
                  await handleSave(selected);
                }}
                onClose={() => setIsEditing(false)}
                refresh={refresh}
              />
            ) : (
              <>
                <Box w="100%" pt={2} pb={4} marginTop={2} marginBottom={6} borderBottom="sm" borderColor="gray.200">
                  <Text>{selected.description || <i>No description.</i>}</Text>
                </Box>
                <Flex gap={2} width="100%" justifyContent={"space-between"}>
                  <HStack>
                    <Badge>{selected.priority}</Badge>
                    <Badge variant="outline">{selected.status}</Badge>
                  </HStack>

                  <Text color="gray.600" fontSize="sm">
                    Due: {formatDueDate(selected.dueAt)}
                  </Text>
                </Flex>
              </>
            )}
          </VStack>

          <VStack align="start" gap={2} mt={4}>
            <Heading size="sm">Subtasks:</Heading>

            {children.length === 0 ? (
              <Text color="gray.600">No subtasks.</Text>
            ) : (
              <Box w="100%">
              {(() => {
                // Get all completed children
                const completed = children.filter(c => c.status === TaskStatus.Done);
                // Get all incomplete children
                const incomplete = children.filter(c => c.status !== TaskStatus.Done);
                const completedCount = completed.length;
                return (
                  <Box w={"100%"}>
                    <Text color="gray.600" fontSize="sm">
                      {completedCount} of {children.length} completed
                    </Text>

                    {/* Incomplete subtasks first */}
                    <VStack align="start" gap={1} w="100%" mb={3}>
                      <Text>Current:</Text>
                      {incomplete.length > 0 ? (
                        incomplete.map((child) => (
                          <Box key={child.id} w={"100%"}>
                            <SubTaskRow
                              to={buildTaskStackPath(listId, nextStackFromLevel(stack, taskId, child.id))}
                              task={child}
                              onDelete={onDelete}
                              onToggleComplete={handleToggleComplete}
                            />
                          </Box>
                        ))
                      ) : (
                        <Text color="gray.600">No current subtasks.</Text>
                      )}
                    </VStack>
                    <VStack align="start" gap={1} w="100%">
                      <Text>Completed:</Text>
                      {completed.length > 0 ? (
                        completed.map((child) => (
                          <Box key={child.id} w={"100%"}>
                            <SubTaskRow
                              to={buildTaskStackPath(listId, nextStackFromLevel(stack, taskId, child.id))}
                              task={child}
                              onDelete={onDelete}
                              onToggleComplete={handleToggleComplete}
                            />
                          </Box>
                        ))
                      ) : (
                        <Text color="gray.600">No completed subtasks.</Text>
                      )}
                    </VStack>
                  </Box>
                );
              })()}
              </Box>
            )}
          </VStack>
          <Button color="black.500" bg={"green.200"} variant={"outline"} mt={3} onClick={openAddTaskDialog}>
            Add New Task
          </Button>

          <DialogModal
            title="Add Task"
            body={
              <AddTaskForm
                ref={addTaskFormRef}
                listId={listId}
                stack={stack}
                tasksInList={tasksInList}
                newTaskTitle={newTaskTitle}
                setNewTaskTitle={setNewTaskTitle}
                newTaskDescription={newTaskDescription}
                setNewTaskDescription={setNewTaskDescription}
                newTaskDueDate={newTaskDueDate}
                setNewTaskDueDate={setNewTaskDueDate}
                newTaskPriority={newTaskPriority}
                setNewTaskPriority={setNewTaskPriority}
                navigate={navigate}
                parentTaskId={selected.id}
                onSavingChange={setAddTaskSaving}
                onCreated={(created) => {
                  setAddTaskSaving(false);
                  setIsAddTaskDialogOpen(false);
                  navigate(buildTaskStackPath(listId, nextStackFromLevel(stack, taskId, created.id)));
                }}
              />
            }
            open={isAddTaskDialogOpen}
            setOpen={(open) => {
              if (!open) {
                addTaskFormRef.current?.cancel();
                setAddTaskSaving(false);
              }
              setIsAddTaskDialogOpen(open);
            }}
            acceptLabel="Create"
            acceptColorPalette="green"
            acceptVariant="solid"
            cancelLabel="Cancel"
            loading={addTaskSaving}
            onAccept={async () => {
              await addTaskFormRef.current?.submit();
            }}
            onCancel={() => {
              addTaskFormRef.current?.cancel();
              setAddTaskSaving(false);
              setIsAddTaskDialogOpen(false);
            }}
          />
        </Box>
      )}
    </Box>
  );
});

TaskDetailsPane.displayName = "TaskDetailsPane";