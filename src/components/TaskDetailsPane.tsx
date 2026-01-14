import { forwardRef, useState } from "react";
import { Box, Button, Heading, HStack, Text, VStack, Badge } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { buildTaskStackPath, nextStackOnClick } from "../routes/taskStack";
import type { Task } from "../types/task";
import { AddTaskForm } from "./AddTaskForm";
import { TaskRowDetails } from "./TaskRowDetails";

const pulse = keyframes`
  0%   { box-shadow: 0 0 0 rgba(0,0,0,0); transform: translateY(0); }
  30%  { box-shadow: 0 0 0 4px rgba(66,153,225,0.35); transform: translateY(-1px); }
  100% { box-shadow: 0 0 0 rgba(0,0,0,0); transform: translateY(0); }
`;

type Props = {
  listId: string;
  taskId: string;
  stack: string[];
  tasksInList: Task[];
  isPulsing?: boolean;
  newTaskTitle: string;
  newTaskDescription: string;
  newTaskDueDate: string;
  newTaskPriority: string;
  setNewTaskTitle: (title: string) => void;
  setNewTaskDescription: (description: string) => void;
  setNewTaskDueDate: (dueDate: string) => void;
  setNewTaskPriority: (priority: string) => void;
  refresh: () => void;
  navigate: (path: string) => void;
  onCloseAll: () => void;
  onChanged?: () => void;
  onDelete?: (taskId: string) => void;
};

// Get current timezone
const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
// Set today's date as default due date in YYYY-MM-DD format
const todayDate = new Date().toLocaleDateString('en-CA', { timeZone: userTimeZone });

export const TaskDetailsPane = forwardRef<HTMLDivElement, Props>(
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
    onChanged,
    onDelete }, ref
  ) {
  
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const selected = tasksInList.find((t) => t.id === taskId);

  const children = selected
    ? tasksInList
        .filter((t) => t.parentTaskId === selected.id)
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
    : [];
  
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

        <Button as="span" size="sm" variant="ghost" onClick={onCloseAll}>
          Close
        </Button>
      </HStack>

      {!selected ? (
        <Text color="gray.600">Task not found.</Text>
      ) : (
        <Box w="100%">
          <VStack align="start" gap={2}>
            <Text fontWeight="700" fontSize="lg">
              {selected.title}
            </Text>
            {selected.description ? <Text>{selected.description}</Text> : null}

            <HStack>
              <Badge>{selected.priority}</Badge>
              <Badge variant="outline">{selected.status}</Badge>
            </HStack>

            <Text color="gray.600" fontSize="sm">
              Due: {selected.dueAt ?? "Someday"}
            </Text>
          </VStack>

          <VStack align="start" gap={2} mt={4}>
            <Heading size="sm">Subtasks:</Heading>

            {children.length === 0 ? (
              <Text color="gray.600">No subtasks.</Text>
            ) : (
              <Box w="100%">
              {(() => {
                // Get all completed children
                const completed = children.filter(c => c.status === "Done");
                // Get all incomplete children
                const incomplete = children.filter(c => c.status !== "Done");
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
                            <TaskRowDetails
                              to={buildTaskStackPath(listId, nextStackOnClick(stack, child.id))}
                              task={child}
                              showLists={false}
                              onChanged={onChanged}
                              onDelete={onDelete}
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
                            <TaskRowDetails
                              to={buildTaskStackPath(listId, nextStackOnClick(stack, child.id))}
                              task={child}
                              showLists={false}
                              onChanged={onChanged}
                              onDelete={onDelete}
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
              parentTaskId={selected.id}
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
    </Box>
  );
});

TaskDetailsPane.displayName = "TaskDetailsPane";