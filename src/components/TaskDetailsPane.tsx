import { forwardRef, useState } from "react";
import { Box, Button, Heading, HStack, Text, VStack, Badge } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { buildTaskStackPath, nextStackFromLevel } from "../routes/taskStack";
import { AddTaskForm } from "./AddTaskForm";
import { SubTaskRow } from "./SubTaskRow";
import type { TaskDetailsPaneProps } from "../types/task";
import { taskmasterApi } from "../api/taskmasterApi";
import { EditTaskForm } from "./EditTaskForm";
import { TaskPriority, TaskStatus } from "../API";
import { fireToast } from "../hooks/useFireToast";
import { Flex } from "@aws-amplify/ui-react";
import type { Task } from "../types/task";

// --- animations
const pulse = keyframes`
  0%   { box-shadow: 0 0 0 rgba(0,0,0,0); transform: translateY(0); }
  30%  { box-shadow: 0 0 0 4px rgba(66,153,225,0.35); transform: translateY(-1px); }
  100% { box-shadow: 0 0 0 rgba(0,0,0,0); transform: translateY(0); }
`;

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

const formatDue = (iso?: string | null) => {
  if (!iso) return "Someday";
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? "Someday"
    : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

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
  
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const selected = tasksInList.find((t) => t.id === taskId);
  const [isEditing, setIsEditing] = useState(false);

  const [draftTaskTitle, setDraftTaskTitle] = useState("");
  const [draftTaskDescription, setDraftTaskDescription] = useState("");
  const [draftTaskPriority, setDraftTaskPriority] = useState(TaskPriority.Medium);
  const [draftTaskStatus, setDraftTaskStatus] = useState(TaskStatus.Open);
  const [draftTaskDueDate, setDraftTaskDueDate] = useState(""); // YYYY-MM-DD
  const [saving, setSaving] = useState(false);
  const closeLast = () => navigate(buildTaskStackPath(listId, stack.slice(0, -1)));

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

    await taskmasterApi.updateTask({
      id: taskId,
      status: nextStatus as TaskStatus,
      completedAt,
    });

    await refresh();
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

  const handleSave = async (selectedTask: Task) => {
    if (!selectedTask) return;

    try {
      setSaving(true);
      await taskmasterApi.updateTask({
        id: selectedTask.id,
        listId: selectedTask.listId,
        title: draftTaskTitle.trim() || "Untitled Task",
        description: draftTaskDescription,
        // Cast to generated enums (type-level only) so TS stops screaming.
        priority: draftTaskPriority as unknown as TaskPriority,
        status: draftTaskStatus as unknown as TaskStatus,
        dueAt: dateInputToIso(draftTaskDueDate),
        completedAt:
          draftTaskStatus === TaskStatus.Done ? (selectedTask.completedAt ?? new Date().toISOString()) : null,
      });
    } catch (error) {
      console.error("Error saving task:", error);
      fireToast("error", "Error saving task", "There was an issue saving the task.");
    } finally {
      setSaving(false);
      refresh();
      resetFormAndClose();
      fireToast("success", "Task saved", "The task has been successfully updated.");
    }
  };

  const resetFormAndClose = () => {
    setDraftTaskTitle("");
    setDraftTaskDescription("");
    setDraftTaskDueDate("");
    setDraftTaskPriority(TaskPriority.Medium);
    setDraftTaskStatus(TaskStatus.Open);
  };

  return (
    <Box
      borderWidth="1px"
      rounded="md"
      ref={ref}
      p={4}
      minH="85vh"
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
                      setDraftTaskPriority((selected.priority as TaskPriority) ?? TaskPriority.Medium);
                      setDraftTaskStatus((selected.status as TaskStatus) ?? TaskStatus.Open);
                      setDraftTaskDueDate(isoToDateInput(selected.dueAt));
                    }
                    setIsEditing((v) => !v);
                  }}
                >
                  {isEditing ? "Hide Edit" : "Edit"}
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
                draftTaskPriority={draftTaskPriority}
                setDraftTaskPriority={setDraftTaskPriority}
                draftTaskStatus={draftTaskStatus}
                setDraftTaskStatus={setDraftTaskStatus}
                draftTaskDueDate={draftTaskDueDate}
                setDraftTaskDueDate={setDraftTaskDueDate}
                skipModal={true}
                saving={saving}
                setSaving={setSaving}
                onSave={() => handleSave(selected)}
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
                    Due: {formatDue(selected.dueAt)}
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
          {!showAddTaskForm ? (
            <Button
              bg="green.200"
              variant="outline"
              onClick={() => prepAddTaskForm()}
            > Add New Task</Button>
            ) : null}
          {showAddTaskForm && (
            <AddTaskForm
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
              setShowAddTaskForm={setShowAddTaskForm}
              navigate={navigate}
              refresh={refresh}
              parentTaskId={selected.id}
            />
          )}
        </Box>
      )}
    </Box>
  );
});

TaskDetailsPane.displayName = "TaskDetailsPane";