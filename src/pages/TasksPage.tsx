import { Box, Heading, HStack, Text, VStack, Button } from "@chakra-ui/react";
import { TaskRow } from "../components/TaskRow";
import { useState } from "react";
import { CompletedTasksToggle } from "../components/CompletedTasksToggle";
import { TaskPriority, TaskStatus } from "../API";
import { taskmasterApi } from "../api/taskmasterApi";
import { useTasksPageData } from "./useTasksPageData";
import { fireToast } from "../hooks/useFireToast";
import { Toaster } from "../components/ui/Toaster";
import { AddTaskForm } from "../components/AddTaskForm";
import { useNavigate } from "react-router-dom";
import { Flex } from "@aws-amplify/ui-react";
import { DialogModal } from "../components/ui/DialogModal";
import { EditTaskForm } from "../components/EditTaskForm";

// --- helpers (keep local, simple)
function dateInputToIso(date: string) {
  if (!date) return null;
  return new Date(`${date}T00:00:00.000Z`).toISOString();
}

// Get current timezone
const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
// Set today's date as default due date in YYYY-MM-DD format
const todayDate = new Date().toLocaleDateString('en-CA', { timeZone: userTimeZone });

export function TasksPage() {

  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("New Task");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState(todayDate);
  const [newTaskPriority, setNewTaskPriority] = useState(TaskPriority.Medium);
  const [draftTaskTitle, setDraftTaskTitle] = useState("");
  const [draftTaskDescription, setDraftTaskDescription] = useState("");
  const [draftTaskDueDate, setDraftTaskDueDate] = useState("");
  const [draftTaskPriority, setDraftTaskPriority] = useState(TaskPriority.Medium);
  const [draftTaskStatus, setDraftTaskStatus] = useState(TaskStatus.Open);
  const [saving, setSaving] = useState(false);

  const { allTasks, lists, refreshData } = useTasksPageData();
  const navigate = useNavigate();

  const isDialogOpen = !!selectedTask;

  const handleToggleComplete = async (taskId: string, nextStatus: TaskStatus) => {
    if (!taskId || !nextStatus) return;
    const completedAt = nextStatus === TaskStatus.Done ? new Date().toISOString() : null;

    try {
      await taskmasterApi.updateTask({
        id: taskId,
        status: nextStatus,
        completedAt,
      });
    } catch (error) {
      console.error("Error updating task status:", error);
      fireToast("error", "Error updating task", "There was an issue updating the task status.");
    } finally {
      refreshData();
      fireToast("success", "Task marked as " + nextStatus, "Task is now " + nextStatus.toLowerCase() + ".");
    };
  };

  const handleEditTask = async (task: any) => {
    setSelectedTask(task);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!taskId) return;

    try {
      await taskmasterApi.deleteTask({
        id: taskId
      });
    } catch (error) {
      console.error("Failed to delete task:", error);
      fireToast("error", "Failed to delete task", "An error occurred while deleting the task.");
    } finally {
      refreshData();
      fireToast("success", "Task deleted", "The task has been successfully deleted.");
    }
  };

  const handleSave = async (selectedTask: any) => {
    if (!selectedTask) return;

    try {
      setSaving(true);
      await taskmasterApi.updateTask({
        id: selectedTask.id,
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
      refreshData();
      resetFormAndClose();
      fireToast("success", "Task saved", "The task has been successfully updated.");
    }
  };

  const acceptChanges = async () => {
    console.log("Updating task:", selectedTask);
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
    setDraftTaskDueDate("");
    setDraftTaskPriority(TaskPriority.Medium);
    setDraftTaskStatus(TaskStatus.Open);
    setSelectedTask(null);
  };
  
  return (
    <VStack minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
      <Toaster />
      <VStack w="100%" gap={4} align="start">
        <HStack justify="space-between" w="100%">
          <VStack align="start" gap={2}>
            <Heading size="md">Tasks</Heading>
            {/* TODO: add icon here */}
            <Text>View, sort, and manage all your tasks in one place.</Text>
          </VStack>
          <CompletedTasksToggle showCompletedTasks={showCompletedTasks} setShowCompletedTasks={setShowCompletedTasks} />
        </HStack>
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
      {!showCompletedTasks ? (
        allTasks.length === 0 ? (
          <Text>No tasks available.</Text>
        ) : (
          <VStack align="stretch" gap={2} w="100%">
            
            {allTasks.map((task) => {
              const list = lists.find((l) => l.id === task.listId);
              if (!list) return null;
              if (task.status !== "Done") {
                return (
                <Flex
                  key={task.id}
                  gap={4}
                  alignItems={"center"}
                  width={"100%"}
                >
                  <Box flex="1">
                    <TaskRow
                      task={task}
                      list={list}
                      to={`/lists/${task.listId}/tasks/${task.id}`}
                      showLists
                      onToggleComplete={handleToggleComplete}
                      onDelete={() => handleDeleteTask(task.id)}
                    />
                  </Box>
                  <Button
                    size="2xl"
                    bg="orange.200"
                    variant="outline"
                    height={"94px"}
                    onClick={() => handleEditTask(task)}
                    _hover={{ bg: "orange.300", borderColor: "orange.400", color: "orange.700", fontWeight: "500", boxShadow: "lg" }}
                  >
                    Edit
                  </Button>
                </Flex>
                );
              } else {
                return null;
              }
            })}
          </VStack>
        )
      ) : (
        <VStack align="stretch" gap={2} w="100%">
          {allTasks.map((task) => {
              const list = lists.find((l) => l.id === task.listId);
              if (!list) return null;
              if (task.status === "Done") {
                return (
              <Flex
                  key={task.id}
                  gap={4}
                  alignItems={"center"}
                  width={"100%"}
                >
                  <Box flex="1">
                    <TaskRow
                      task={task}
                      list={list}
                      to={`/lists/${task.listId}/tasks/${task.id}`}
                      showLists
                      onToggleComplete={handleToggleComplete}
                      onDelete={() => handleDeleteTask(task.id)}
                    />
                  </Box>
                  <Button
                    size="2xl"
                    bg="orange.200"
                    variant="outline"
                    height={"74px"}
                    onClick={() => handleEditTask(task)}
                    _hover={{ bg: "orange.300", borderColor: "orange.400", color: "orange.700", fontWeight: "500", boxShadow: "lg" }}
                  >
                    Edit
                  </Button>
                </Flex>
                );
              } else {
                return null;
              }
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
            task={selectedTask}
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