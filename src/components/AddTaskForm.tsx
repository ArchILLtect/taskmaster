import { Box, Heading, VStack, CloseButton, Input, Button, Flex, Select, Portal, useListCollection } from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { taskService } from "../services/taskService";
import { buildTaskStackPath } from "../routes/taskStack";
import type { AddTaskFormProps } from "../types/task";

type Option = { label: string; value: string }

// Get current timezone
const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
// Set today's date as default due date in YYYY-MM-DD format
const todayDate = new Date().toLocaleDateString('en-CA', { timeZone: userTimeZone });

export const AddTaskForm = ({ parentTaskId, listId, stack, newTaskTitle, setNewTaskTitle, newTaskDescription, setNewTaskDescription, newTaskDueDate, setNewTaskDueDate, newTaskPriority, setNewTaskPriority, setShowAddTaskForm, navigate, refresh }: AddTaskFormProps) => {

    const dueAtIso = newTaskDueDate ? new Date(`${newTaskDueDate}T00:00:00`).toISOString() : null;

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

  const handleAddTask = () => {
    // create new task name consisting of "New Task" plus a unique
    // sequence of 10 digits of both numbers and letters to avoid collisions
    
    const newTask = taskService.create({
      listId,
      title: newTaskTitle,
      description: newTaskDescription,
      dueAt: dueAtIso || null,
      priority: (newTaskPriority as "Low" | "Medium" | "High") || "Medium",
      parentTaskId: parentTaskId ?? null,
    });
    refresh();
    const nextStack =
      parentTaskId ? stack : [...stack, newTask.id];

    navigate(buildTaskStackPath(listId, nextStack));
  };

  return (
  <Box w="100%" mt={2} p={2} bg="gray.200" rounded="md" boxShadow="inset 0 0 5px rgba(0,0,0,0.1)">
    <VStack align="start" gap={2}>
      <Flex justify="space-between" align="center" width="100%">
        <Heading size="sm" fontWeight="bold">New Task</Heading>
        <CloseButton
          onClick={() => { 
            setShowAddTaskForm && setShowAddTaskForm(false);
            setNewTaskTitle("");
            setNewTaskDescription("");
            setNewTaskDueDate("");
            setNewTaskPriority("Low");
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
          onClick={() => { 
            handleAddTask();
            setShowAddTaskForm && setShowAddTaskForm(false);
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
              setShowAddTaskForm && setShowAddTaskForm(false);
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