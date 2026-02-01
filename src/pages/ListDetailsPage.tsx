import { Box, Flex, Heading, Text, VStack, HStack, Center, Button, Spinner } from "@chakra-ui/react";
import { Toaster } from "../components/ui/Toaster";
import { useEffect, useState, useMemo, useRef } from "react";
import { useLocation, useNavigate, useParams, Navigate } from "react-router-dom";
import { useListDetailsPageData } from "./useListDetailsPageData";
import { buildTaskStackPath, parseTaskStackFromPath } from "../routes/taskStack";
import { TaskDetailsPane } from "../components/TaskDetailsPane";
import { TaskRow } from "../components/TaskRow";
import { CompletedTasksToggle } from "../components/CompletedTasksToggle";
import { AddTaskForm } from "../components/AddTaskForm";
import { TaskPriority, TaskStatus } from "../API";
import type { TaskUI } from "../types/task";
import { EditListForm } from "../components/EditListForm";
import { getInboxListId, SYSTEM_INBOX_NAME } from "../config/inboxSettings";
import { fireToast } from "../hooks/useFireToast";
import { Tooltip } from "../components/ui/Tooltip"
import { useTaskActions } from "../store/taskStore";

// Get current timezone
const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
// Set today's date as default due date in YYYY-MM-DD format
const todayDate = new Date().toLocaleDateString('en-CA', { timeZone: userTimeZone });

export function ListDetailsPage() {

  const [pulseTaskId, setPulseTaskId] = useState<string | null>(null);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [showAddListItemForm, setShowAddListItemForm] = useState(false);
  const [showCompletedTasks, setShowCompletedTasks] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("New Task");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState(todayDate);
  const [newTaskPriority, setNewTaskPriority] = useState(TaskPriority.Medium);
  const [draftListName, setDraftListName] = useState("");
  const [draftListDescription, setDraftListDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { listId } = useParams<{ listId: string }>();
  const { lists, tasks, loading, err, refresh } = useListDetailsPageData(listId);
  const { updateTask, updateTaskList, deleteTask, sendTaskToInbox } = useTaskActions();
  const listById = useMemo(() => new Map(lists.map(l => [l.id, l])), [lists]);
  const currentList = listId ? listById.get(listId) : null;
  const listName = currentList?.name || "Unknown List";

  const isOffLimits = currentList?.id === (getInboxListId() ?? "");

  const location = useLocation();
  const navigate = useNavigate();
  
  const lastPaneRef = useRef<HTMLDivElement | null>(null);

  const { stack } = parseTaskStackFromPath(location.pathname);
  const activeTaskId = stack.at(-1);

  const tasksInList = tasks;
  const topLevelTasks = useMemo(
    () => tasksInList.filter(t => t.parentTaskId == null).slice().sort((a,b) => a.sortOrder - b.sortOrder),
    [tasksInList]
  );

  const completedCount = topLevelTasks.filter(t => t.status === TaskStatus.Done).length;

  //if a task is completed, re-render with different message
  const allTasksCompleted = topLevelTasks.every(task => task.status === TaskStatus.Done);
    const taskMessage = allTasksCompleted ? "All tasks completed! 🎉" : "Tasks for this list (including “someday” tasks).";

  // Show or hide completed tasks
  const visibleTasks = showCompletedTasks
  ? topLevelTasks
  : topLevelTasks.filter(t => t.status !== TaskStatus.Done);

  const closeAll = () => {
    if (!listId) return;
    navigate(buildTaskStackPath(listId, []));
  };

  useEffect(() => {
    lastPaneRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "start",
      block: "nearest",
    });
  }, [stack.length]);

  useEffect(() => {
    if (!activeTaskId) return;
    const startTimer = window.setTimeout(() => setPulseTaskId(activeTaskId), 0);
    const clearTimer = window.setTimeout(() => setPulseTaskId(null), 500);
    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(clearTimer);
    };
  }, [activeTaskId]);

  const handleToggleComplete = async (taskId: string, nextStatus: TaskStatus) => {
    if (!taskId || !nextStatus) return;
    const completedAt = nextStatus === TaskStatus.Done ? new Date().toISOString() : null;

    try {
      await updateTask({
        id: taskId,
        status: nextStatus,
        completedAt,
      });
      await fireToast("success", "Task marked as " + nextStatus, "Task is now " + nextStatus.toLowerCase() + ".");
    } catch (error) {
      console.error("Error updating task status:", error);
      await fireToast("error", "Error updating task", "There was an issue updating the task status.");
    }
  };

  const handleSave = async () => {
    if (!currentList) return;

    const trimmed = draftListName.trim();
    const isInvalidName =
      !trimmed ||
      trimmed === SYSTEM_INBOX_NAME;

      if (saving || isInvalidName) {
        // Toast notification for unimplemented feature
        await fireToast("error", "List not saved", (saving ? "Please wait until the current save is complete." : "List name is invalid.")  );
        return;
      };
  
    setSaving(true);
    try {
      await updateTaskList({
        id: currentList.id,
        name: draftListName.trim() || "Untitled List",
        // description: draftDescription,
      });
      setIsEditing(false);
      await fireToast("success", "List Saved", "Your changes have been saved successfully.");

    } catch (error) {
      // Fire toast notification for unimplemented feature
      await fireToast("error", "Save Failed", "There was an error saving the list. Please try again. Error details: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setSaving(false);
    }
  };

  const handleSendToInbox = async (task: TaskUI) => {
    const inboxId = getInboxListId();
    // If inbox id isn't initialized yet (fresh session / cache cleared), still attempt the move.
    // The store action will resolve/create the inbox list if needed.
    if (inboxId && task.listId === inboxId) return;

    try {
      await sendTaskToInbox(task.id);
      await fireToast("success", "Task sent to Inbox", "The task has been successfully sent to your Inbox.");
    } catch (error) {
      console.error("Error sending task to inbox:", error);
      await fireToast("error", "Failed to send to Inbox", "An error occurred while sending the task to the Inbox.");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!taskId) return;

    try {
      await deleteTask({ id: taskId }); // input: DeleteTaskInput
      await fireToast("success", "Task deleted", "The task has been successfully deleted.");

      const idx = stack.indexOf(taskId);
      if (idx !== -1) {
        const nextStack = stack.slice(0, idx);
        navigate(buildTaskStackPath(currentList?.id ?? listId ?? "", nextStack), { replace: true });
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
      await fireToast("error", "Failed to delete task", "An error occurred while deleting the task.");
    }
  };

  const handleCancel = async () => {
    if (!currentList) return;
    setDraftListName(currentList.name ?? "");
    setDraftListDescription(currentList.description ?? "");
    setIsEditing(false);

    // Fire toast notification for canceled edit
    await fireToast("info", "Edit Canceled", "Your changes have been discarded.");

    refresh();
  };

  const addListItem = (itemType: "task" | "note" | "event") => () => {
    if (itemType === "task") {
      setShowAddListItemForm(!showAddListItemForm);
    }
  };

  const toggleShowCompletedTasks = async () => {
    setShowCompletedTasks((prev) => !prev);

    await fireToast("info", "Toggle Completed Tasks", `Completed tasks are now ${showCompletedTasks ? "hidden" : "visible"}.`);
  }

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

  // Note: `lists` comes from an async hook; don't redirect until loading is finished.
  // Add a spinner for loading state
  if (loading) {
    return (
      <Flex align="start" gap={4} p={4} bg="white" rounded="md" minHeight="100%" boxShadow="sm" className="ListPageMain" w="max-content">
        <Center width={"40vw"} height={"75vh"}>
          <Spinner size={"xl"} />
        </Center>
        <Box h="89.5vh" bg="gray.200" rounded="md" flexShrink={0} w="38.5vw">
          <Center color="gray.600" mt={10} ml={4}>Select a task to view details.</Center>
        </Box>
      </Flex>
    );
  }
  if (err) return <div>Failed to load list data.</div>;

  if (!listId) return <Navigate to="/lists" replace />;
  if (!currentList) return <Navigate to="/lists" replace />;

  return (
    <Flex align="start" gap={4} p={4} bg="white" rounded="md" minHeight="100%" boxShadow="sm" className="ListPageMain" w="max-content">
      <Toaster />
      {/* Left: task list */}
        <VStack align="start" gap={2} w={"40vw"}>
          <Flex flexDir={"column"} w={"100%"} mb={4} gap={2}>
            <Flex justify="space-between" align="center">
              <HStack align="center" gap={3} maxW={"60%"}>
                <Heading size="lg">List:</Heading>
                <Flex gap={2} alignItems={"center"} maxW={"100%"}>
                  <Text fontSize={"md"} truncate>
                    {listName}
                  </Text>
                </Flex>
              </HStack>
              
              <Tooltip content={isOffLimits ? "Editing is disabled for the system Inbox list." : "Edit list details for list " + listName}>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(v => !v)} disabled={isOffLimits}>
                  {isEditing ? "Hide Edit" : "Edit"}
                </Button>
              </Tooltip>
            </Flex>
            <Flex justifyContent={"right"} w={"100%"}>
              <CompletedTasksToggle showCompletedTasks={showCompletedTasks} setShowCompletedTasks={toggleShowCompletedTasks} />
            </Flex>
          </Flex>

          {isEditing && currentList &&
            <EditListForm
              list={currentList}
              draftName={draftListName}
              setDraftName={setDraftListName}
              draftDescription={draftListDescription}
              setDraftDescription={setDraftListDescription}
              saving={saving}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          }

          {topLevelTasks.length === 0 ? (
            <Text>No tasks yet. Add your first one ✍️</Text>
          ) : (
            <>
            <Flex justify="space-between" align="center" width="100%" mt={2}>
              <Text>{taskMessage}</Text>
              <Text color="gray.600" fontSize="sm">
                {completedCount} of {topLevelTasks.length} total completed.
              </Text>
              </Flex>
              <VStack align="stretch" gap={2} mt={2} width="100%">
                {visibleTasks.map(task => {
                  if (!currentList) return null;
                  return (
                  <Box key={task.id} w="100%">
                    <TaskRow
                      task={task}
                      list={currentList}
                      to={buildTaskStackPath(currentList.id, [task.id])}
                      showLists={false}
                      onMove={handleSendToInbox}
                      onDelete={handleDeleteTask}
                      onToggleComplete={handleToggleComplete}
                    />
                  </Box>
                );
              })}
              </VStack>
            </>
          )}

          {/* Add new list item section */}
          <Box mt={4} p={2} bg="green.200" rounded="md" cursor="pointer" onClick={addListItem("task")}>
            <Text>Add New Item</Text>
          </Box>
          {showAddListItemForm && (
            <Box w="100%" mt={2} p={2} bg="gray.50" rounded="md" boxShadow="inset 0 0 5px rgba(0,0,0,0.1)">
              <VStack align="start" gap={2}>
                <Heading size="sm">New List Item</Heading>
                <>
                  <Button
                    bg="green.200"
                    variant="outline"
                    onClick={() => fireToast("info", "Not Implemented", "This feature is coming soon!")}
                  >Add New Event</Button>
                  {!showAddTaskForm && (
                    <Button
                      bg="green.200"
                      variant="outline"
                      onClick={() => prepAddTaskForm()}
                    > Add New Task</Button>
                  )}
                  <Button
                    bg="green.200"
                    variant="outline"
                    onClick={() => fireToast("info", "Not Implemented", "This feature is coming soon!")}
                  >Add New Note</Button>
                </>
              </VStack>
              {showAddTaskForm && (
                <AddTaskForm
                  listId={currentList?.id}
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
                  parentTaskId={undefined}
                />
              )}
            </Box>
          )}
        </VStack>

      {/* Right: stacked panes */}
      {stack.length === 0 && (
        <Box h="84vh" bg="gray.200" rounded="md" flexShrink={0} w="38.5vw">
          <Center color="gray.600" mt={10} ml={4}>Select a task to view details.</Center>
        </Box>
      )}
      {stack.map((taskId, idx) => (
        <TaskDetailsPane
          key={taskId}
          listId={currentList.id}
          ref={idx === stack.length - 1 ? lastPaneRef : undefined}
          taskId={taskId}
          stack={stack}
          tasksInList={tasksInList}
          isPulsing={pulseTaskId === taskId}
          newTaskTitle={newTaskTitle}
          newTaskDescription={newTaskDescription}
          newTaskDueDate={newTaskDueDate}
          newTaskPriority={newTaskPriority}
          setNewTaskTitle={setNewTaskTitle}
          setNewTaskDescription={setNewTaskDescription}
          setNewTaskDueDate={setNewTaskDueDate}
          setNewTaskPriority={setNewTaskPriority}
          navigate={navigate}
          refresh={refresh}
          onCloseAll={closeAll}
          onDelete={handleDeleteTask}
        />
      ))}
    </Flex>
  );
}