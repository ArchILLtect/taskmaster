import { Box, Flex, Heading, Text, VStack, HStack, Badge, Center, Button } from "@chakra-ui/react";
import { Toaster } from "../components/ui/Toaster";
import { toaster } from "../components/ui/toasterInstance";
import { useEffect, useState, useMemo, useRef } from "react";
import { useLocation, useNavigate, useParams, Navigate } from "react-router-dom";
import { useListDetailsPageData } from "./useListDetailsPageData";
import { buildTaskStackPath, parseTaskStackFromPath } from "../routes/taskStack";
import { TaskDetailsPane } from "../components/TaskDetailsPane";
import { TaskRow } from "../components/TaskRow";
import { CompletedTasksToggle } from "../components/CompletedTasksToggle";
import { AddTaskForm } from "../components/AddTaskForm";
import { taskmasterApi } from "../api/taskmasterApi";
import { TaskPriority, TaskStatus } from "../API";
import { EditListForm } from "../components/EditListForm";

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
  const list = lists.find(l => l.id === listId);
  const listName = list?.name || "Unknown List";  

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
    const completedAt = nextStatus === TaskStatus.Done ? new Date().toISOString() : null;

    await taskmasterApi.updateTask({
      id: taskId,
      status: nextStatus,
      completedAt,
    });

    await refresh();
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!listId) return;

    await taskmasterApi.deleteTask({ id: taskId }); // input: DeleteTaskInput
    await refresh();

    const idx = stack.indexOf(taskId);
    if (idx !== -1) {
      const nextStack = stack.slice(0, idx);
      navigate(buildTaskStackPath(listId, nextStack), { replace: true });
    }
  };

  const addListItem = (itemType: "task" | "note" | "event") => () => {
    if (itemType === "task") {
      setShowAddListItemForm(!showAddListItemForm);
    }
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

  const notImplementedToast = () => {
    toaster.create({
      title: "Not Implemented",
      description: "This feature is not yet implemented. Stay tuned!",
      duration: 3000,
      type: "info",
    });
  };

  if (!listId) return <Navigate to="/lists" replace />;
  // TODO add Chakra UI loading and error states:
  if (loading) return <div>Loading…</div>;
  // TODO use ErrorBoundary for errors:
  if (err) return <div>Failed to load list data.</div>;

  return (
    <Flex align="start" gap={4} p={4} bg="white" rounded="md" minHeight="100%" boxShadow="sm" className="ListPageMain" w="max-content">
      <Toaster />
      {/* Left: task list */}
      <Box width="40vw">
        <VStack align="start" gap={2}>
          <Flex justify="space-between" align="center" width="100%" mb={8}>
            <HStack align="start" gap={30}>
              <Heading size="lg">List:</Heading>
              <Badge variant="outline" size={"lg"}>{listName}</Badge>
            </HStack>
            <Button size="sm" variant="outline" onClick={() => setIsEditing(v => !v)}>
              {isEditing ? "Hide Edit" : "Edit"}
            </Button>
            <CompletedTasksToggle showCompletedTasks={showCompletedTasks} setShowCompletedTasks={setShowCompletedTasks} />
          </Flex>

          {isEditing &&
            <EditListForm
              list={list!}
              draftName={draftListName}
              setDraftName={setDraftListName}
              draftDescription={draftListDescription}
              setDraftDescription={setDraftListDescription}
              saving={saving}
              setSaving={setSaving}
              setIsEditing={setIsEditing}
              onCancel={() => setIsEditing(false)}
              refresh={refresh}
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
                {visibleTasks.map(task => (
                  <Box key={task.id} w="100%">
                    <TaskRow
                      task={task}
                      listName={listName}
                      to={buildTaskStackPath(listId, [task.id])}
                      showLists={false}
                      onDelete={handleDeleteTask}
                      onToggleComplete={handleToggleComplete}
                    />
                  </Box>
                ))}
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
                    onClick={() => notImplementedToast()}
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
                    onClick={() => notImplementedToast()}
                  >Add New Note</Button>
                </>
              </VStack>
              {showAddTaskForm && (
                <AddTaskForm
                  listId={listId}
                  stack={stack}
                  tasksInList={tasksInList}   // ✅ add this
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
                  parentTaskId={undefined /* or omit if optional */}
                />
              )}
            </Box>
          )}
        </VStack>
      </Box>

      {/* Right: stacked panes */}
      {stack.length === 0 && (
        <Box h="89.5vh" bg="gray.200" rounded="md" flexShrink={0} w="38.5vw">
          <Center color="gray.600" mt={10} ml={4}>Select a task to view details.</Center>
        </Box>
      )}
      {stack.map((taskId, idx) => (
        <TaskDetailsPane
          key={taskId}
          listId={listId}
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
          onChanged={refresh}
          onDelete={handleDeleteTask}
        />
      ))}
    </Flex>
  );
}