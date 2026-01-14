import { Box, Flex, Heading, Text, VStack, HStack, Badge, Center, Button } from "@chakra-ui/react";
import { Toaster, toaster } from "../components/ui/toaster"
import { useEffect, useState, useMemo, useRef } from "react";
import { useLocation, useNavigate, useParams, Navigate } from "react-router-dom";
import { buildTaskStackPath, nextStackOnClick, parseTaskStackFromPath } from "../routes/taskStack";
import { TaskDetailsPane } from "../components/TaskDetailsPane";
import { TaskRow } from "../components/TaskRow";
import { taskService } from "../services/taskService";
import { CompletedTasksToggle } from "../components/CompletedTasksToggle";
import { AddTaskForm } from "../components/AddTaskForm";

// Get current timezone
const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
// Set today's date as default due date in YYYY-MM-DD format
const todayDate = new Date().toLocaleDateString('en-CA', { timeZone: userTimeZone });

export function ListPage() {

  const [tick, setTick] = useState(0);
  const [pulseTaskId, setPulseTaskId] = useState<string | null>(null);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [showAddListItemForm, setShowAddListItemForm] = useState(false);
  const [showCompletedTasks, setShowCompletedTasks] = useState(true); // Add toggle button later
  const [newTaskTitle, setNewTaskTitle] = useState("New Task");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState(todayDate);
  const [newTaskPriority, setNewTaskPriority] = useState("Medium");

  const { listId } = useParams<{ listId: string }>();

  const location = useLocation();
  const navigate = useNavigate();
  const refresh = () => setTick(t => t + 1);
  
  const lastPaneRef = useRef<HTMLDivElement | null>(null);

  let taskMessage: string;

  // This is not possible, but TypeScript doesn't know that
  if (!listId) throw new Error("List ID is required");
  if (!listId) return <Navigate to="/lists" replace />;

  const { stack } = parseTaskStackFromPath(location.pathname);
  const activeTaskId = stack.at(-1);

  const tasksInList = useMemo(() => taskService.getByListId(listId), [listId, tick]);
  const topLevelTasks = useMemo(() => taskService.getTopLevel(tasksInList), [tasksInList]);
  const completedCount = topLevelTasks.filter(t => t.status === "Done").length;

  //if a task is completed, re-render with different message
  const allTasksCompleted = topLevelTasks.every(task => task.status === "Done");
  allTasksCompleted ? taskMessage = "All tasks completed! 🎉" : taskMessage = "Here are your tasks.";

  // Show or hide completed tasks
  const visibleTasks = showCompletedTasks
  ? topLevelTasks
  : topLevelTasks.filter(t => t.status !== "Done");

  const closeAll = () => navigate(buildTaskStackPath(listId, []));

  useEffect(() => {
    lastPaneRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "start",
      block: "nearest",
    });
  }, [stack.length]);

  useEffect(() => {
    if (!activeTaskId) return;
    setPulseTaskId(activeTaskId);
    const t = window.setTimeout(() => setPulseTaskId(null), 500);
    return () => window.clearTimeout(t);
  }, [activeTaskId]);

  const handleDeleteTask = (taskId: string) => {
    taskService.delete(taskId);
    refresh();

    // If the deleted task is in the open stack, remove it (and anything after it if you want)
    const idx = stack.indexOf(taskId);
    if (idx !== -1) {
      const nextStack = stack.slice(0, idx); // drop deleted + anything after
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
      setNewTaskPriority("Medium");
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

  return (
    <Flex align="start" gap={4} p={4} bg="white" rounded="md" minHeight="100%" boxShadow="sm" className="ListPageMain" w="max-content">
      <Toaster />
      {/* Left: task list */}
      <Box width="40vw">
        <VStack align="start" gap={2}>
          <Flex justify="space-between" align="center" width="100%">
            <HStack gap={10}>
              <Heading size="lg">List:</Heading>
              <Badge variant="outline" size={"lg"}>{listId}</Badge>
            </HStack>
            <CompletedTasksToggle showCompletedTasks={showCompletedTasks} setShowCompletedTasks={setShowCompletedTasks} />
          </Flex>
          <Text color="gray.600">Tasks for this list (including “someday” tasks).</Text>

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
                      to={buildTaskStackPath(listId, nextStackOnClick(stack, task.id))}
                      showLists={false}
                      onChanged={refresh}
                      onDelete={handleDeleteTask}
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