import { Box, Heading, VStack, CloseButton, Input, Button, Flex, Select, Portal, useListCollection } from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { buildTaskStackPath } from "../routes/taskStack";
import { taskmasterApi } from "../api/taskmasterApi";
import { TaskStatus, TaskPriority } from "../API";
import type { Task, AddTaskFormProps } from "../types/task";

type Option = { label: string; value: string }

// Get current timezone
const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
// Set today's date as default due date in YYYY-MM-DD format
const todayDate = new Date().toLocaleDateString('en-CA', { timeZone: userTimeZone });

function nextSortOrder(tasks: Task[], parentTaskId: string | null) {
  const max = tasks
    .filter(t => (t.parentTaskId ?? null) === parentTaskId)
    .reduce((acc, t) => Math.max(acc, t.sortOrder ?? 0), 0);

  return max + 1;
}

export const AddTaskForm = ({
  listId,
  stack,
  tasksInList,
  newTaskTitle,
  setNewTaskTitle,
  newTaskDescription,
  setNewTaskDescription,
  newTaskDueDate,
  setNewTaskDueDate,
  newTaskPriority,
  setNewTaskPriority,
  setShowAddTaskForm,
  navigate,
  refresh,
  parentTaskId
}: AddTaskFormProps) => {

  const options: Option[] = [
    { label: "Low", value: "Low" },
    { label: "Medium", value: "Medium" },
    { label: "High", value: "High" },
  ]

  const { collection } = useListCollection<Option>({
    initialItems: options,
    itemToValue: (item) => item.value,
    itemToString: (item) => item.label,
  })

  const handleAddTask = async () => {
    const dueAtIso = newTaskDueDate
      ? new Date(`${newTaskDueDate}T00:00:00`).toISOString()
      : null;

    const parent = parentTaskId ?? null;

    const created = await taskmasterApi.createTask({
      listId,
      sortOrder: nextSortOrder(tasksInList, parent),
      parentTaskId: parent,
      title: newTaskTitle,
      description: newTaskDescription || "",
      status: TaskStatus.Open,
      priority:
        newTaskPriority === "Low"
          ? TaskPriority.Low
          : newTaskPriority === "High"
            ? TaskPriority.High
            : TaskPriority.Medium,
      dueAt: dueAtIso,
      completedAt: null,
      assigneeId: null,
      tagIds: [],
    });

    // refresh the page-level data from AppSync
    await refresh();

    // navigate same as before (open the task pane for top-level tasks)
    const nextStack = parentTaskId ? stack : [...stack, created.id];
    navigate(buildTaskStackPath(listId, nextStack));
  };

  return (
  <Box w="100%" mt={2} p={2} bg="gray.200" rounded="md" boxShadow="inset 0 0 5px rgba(0,0,0,0.1)">
    <VStack align="start" gap={2}>
      <Flex justify="space-between" align="center" width="100%">
        <Heading size="sm" fontWeight="bold">New Task</Heading>
        <CloseButton
          onClick={() => { 
            if (setShowAddTaskForm) setShowAddTaskForm(false);
            setNewTaskTitle("");
            setNewTaskDescription("");
            setNewTaskDueDate("");
            setNewTaskPriority("Medium");
          }}
          size="xs"
        />
      </Flex>

      <div style={{height: "1px", width: "100%", backgroundColor: "gray"}} />

      <FormControl isRequired width="100%">
        <Flex justify="space-between" align="center">
          <FormLabel fontSize="small" fontWeight="bold" htmlFor="task-title">Title</FormLabel>
          <Input
            minW="150px"
            maxW="200px"
            id="task-title"
            bg="white"
            placeholder="Task Title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
        </Flex>
      </FormControl>
      <FormControl w="100%">
        <Flex display="flex" justify="space-between" align="center" width="100%">
          <FormLabel fontSize="small" fontWeight="bold" htmlFor="task-description">Description</FormLabel>
          <Input
            minW="150px"
            maxW="200px"
            id="task-description"
            bg="white"
            placeholder="Task Description (optional)"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
          />
        </Flex>
      </FormControl>
      <FormControl w="100%">
        <Flex justify="space-between" align="center" width="100%">
          <FormLabel flex="none" fontSize="small" fontWeight="bold" htmlFor="task-due-date">Due Date</FormLabel>
          <Input
            minW="150px"
            maxW="200px"
            type="date"
            min={todayDate}
            id="task-due-date"
            bg="white"
            placeholder="Due Date (optional)"
            value={newTaskDueDate}
            onChange={(e) => setNewTaskDueDate(e.target.value)}
          />
        </Flex>
      </FormControl>
      <Select.Root collection={collection} value={[newTaskPriority]} onValueChange={(e) => { setNewTaskPriority(e.value[0] ?? "Medium"); }}>
        <Flex justify="space-between" align="center" width="100%">
          <Select.Label fontSize="small" fontWeight="bold" htmlFor="task-priority">Priority</Select.Label>

          <Select.Control bg="white" minW="200px" maxW="200px" id="task-priority">
            <Select.Trigger>
              <Select.ValueText placeholder="Select a priority" />
              <Select.Indicator />
            </Select.Trigger>
          </Select.Control>

          <Portal>
            <Select.Positioner>
              <Select.Content>
                {/* Renders all items in the collection */}
                {collection.items.map((item) => (
                  <Select.Item
                    item={item}
                    key={item.value}
                  >
                    <Select.ItemText>{item.label}</Select.ItemText>
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Flex>
      </Select.Root>

      <Flex justify="space-between" align="center" width="100%">
        <Button
          bg="green.200"
          variant="outline"
          onClick={async () => {
            await handleAddTask();
            setShowAddTaskForm?.(false);
          }}
        > Create Task</Button>
        <Box gap="2" display="flex">
          <Button
            bg={"blue.200"}
            variant="outline"
            onClick={() => { 
              setNewTaskTitle("");
              setNewTaskDescription("");
              setNewTaskDueDate("");
              setNewTaskPriority("Low");
            }}
          > Clear</Button>
          <Button
            bg={"red.200"}
            variant="outline"
            onClick={() => { 
              if (setShowAddTaskForm) setShowAddTaskForm(false);
              setNewTaskTitle("");
              setNewTaskDescription("");
              setNewTaskDueDate("");
              setNewTaskPriority("Low");
            }}
          > Cancel</Button>
        </Box>
      </Flex>
    </VStack>
  </Box>
  );
}