import {
  Box,
  Heading,
  VStack,
  CloseButton,
  Input,
  Button,
  Flex,
  Select,
  Portal,
  useListCollection,
} from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { buildTaskStackPath } from "../routes/taskStack";
import { taskmasterApi } from "../api/taskmasterApi";
import { TaskStatus, TaskPriority } from "../API";
import type { Task, AddTaskFormProps } from "../types/task";
import { useEffect, useMemo, useState } from "react";
import { getInboxListId } from "../config/inboxSettings";
import { useTaskmasterData } from "../hooks/useTaskmasterData";

type Option<T extends string> = { label: string; value: T };

const isTaskPriority = (v: string): v is TaskPriority =>
  (Object.values(TaskPriority) as string[]).includes(v);

const isTaskStatus = (v: string): v is TaskStatus =>
  (Object.values(TaskStatus) as string[]).includes(v);

// Get current timezone
const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
// Set today's date as default due date in YYYY-MM-DD format
const todayDate = new Date().toLocaleDateString('en-CA', { timeZone: userTimeZone });

// --- helpers (keep local, simple)
function dateInputToIso(date: string) {
  if (!date) return null;
  return new Date(`${date}T00:00:00.000Z`).toISOString();
}

const PRIORITY_OPTIONS: Option<TaskPriority>[] = [
  { label: "Low", value: TaskPriority.Low },
  { label: "Medium", value: TaskPriority.Medium },
  { label: "High", value: TaskPriority.High },
];

const STATUS_OPTIONS: Option<TaskStatus>[] = [
  { label: "Open", value: TaskStatus.Open },
  { label: "Done", value: TaskStatus.Done },
];

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

  const [saving, setSaving] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>(TaskStatus.Open);
  const inboxListId = getInboxListId();
  const [selectedListId, setSelectedListId] = useState<string>(listId ? listId : inboxListId || "");

  const { visibleLists: allLists } = useTaskmasterData();

  //  Chakra v3 pattern: destructure `{ collection }`
  const { collection: priorityCollection } = useListCollection<Option<TaskPriority>>({
    initialItems: PRIORITY_OPTIONS,
    itemToValue: (item) => item.value,
    itemToString: (item) => item.label,
  })

  const { collection: statusCollection } = useListCollection<Option<TaskStatus>>({
    initialItems: STATUS_OPTIONS,
    itemToValue: (item) => item.value,
    itemToString: (item) => item.label,
  });

  const listItems = useMemo(() => {
    const items: Option<string>[] = [];
    if (inboxListId) {
      items.push({ label: "Inbox", value: inboxListId });
    }
    allLists.forEach((list) => {
      items.push({ label: list.name, value: list.id });
    });
    return items;
  }, [allLists, inboxListId]);

  const { collection: listCollection, set: setListCollection } = useListCollection<Option<string>>({
    initialItems: listItems,
    itemToValue: (item) => item.value,
    itemToString: (item) => item.label,
  });

  useEffect(() => {
    setListCollection(listItems);
  }, [listItems, setListCollection]);

  const onCancel = () => {
    setShowAddTaskForm?.(false);
    resetFormAndClose();
  };

  const onCreate = async () => {
    if (saving) return;

    setSaving(true);
    try {
      const dueAtIso = dateInputToIso(newTaskDueDate);
      const parent = parentTaskId ?? null;
      const status = newTaskStatus ?? TaskStatus.Open;
      const completedAt = status === TaskStatus.Done ? new Date().toISOString() : null;

      const created = await taskmasterApi.createTask({
        listId: selectedListId,
        // sortOrder: nextSortOrder(tasksInList, parent), --was the previous line--
        // TODO: Will the refactored line break anything?
        sortOrder: tasksInList ? nextSortOrder(tasksInList, parent) : 1,
        parentTaskId: parent,
        title: newTaskTitle.trim() || "Untitled Task",
        description: newTaskDescription,
        status: status as unknown as TaskStatus,
        priority: newTaskPriority as unknown as TaskPriority,
        dueAt: dueAtIso,
        completedAt,
        assigneeId: null,
        tagIds: [],
      });

      // refresh the page-level data from AppSync
      await refresh();

      // navigate same as before (open the task pane for top-level tasks)
      // const nextStack = parentTaskId ? stack : [...stack, created.id]; was the previous line
      // TODO: will the refactored line break anything?
      const nextStack = parentTaskId ? stack : [...(stack || []), created.id];

      // navigate to inbox if no listId
      if (!listId) {
        navigate("/inbox");
      } else {
        // TODO: Had to add " || []" to fix TS error here--will it break anything?
        navigate(buildTaskStackPath(listId, nextStack || []));
      }

      // reset form + close
      resetFormAndClose();

    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setSaving(false);
    }
  };

  const resetFormAndClose = () => {
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskDueDate("");
    setNewTaskPriority(TaskPriority.Medium);
    setNewTaskStatus(TaskStatus.Open);
    setShowAddTaskForm?.(false);
  };

  return (
  <Box w="100%" mt={2} p={2} bg="gray.200" rounded="md" boxShadow="inset 0 0 5px rgba(0,0,0,0.1)">
    <VStack align="start" gap={2}>
      <Flex justify="space-between" align="center" width="100%">
        <Heading size="sm" fontWeight="bold">New Task</Heading>
        <CloseButton
          onClick={onCancel}
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

      <Select.Root
        collection={listCollection}
        value={[selectedListId]}
        onValueChange={(e) => {setSelectedListId(e.value[0]);}}
      >
        <Flex justify="space-between" align="center" width="100%">
          <Select.Label fontSize="small" fontWeight="bold" htmlFor="task-list">List</Select.Label>

          <Select.Control bg="white" minW="200px" maxW="200px" id="task-list">
            <Select.Trigger>
              <Select.ValueText placeholder="Select a list" />
              <Select.Indicator />
            </Select.Trigger>
          </Select.Control>

          <Portal>
            <Select.Positioner>
              <Select.Content>
                {/* Renders all items in the collection */}
                {listCollection.items.map((item) => (
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

      <Select.Root
        collection={priorityCollection}
        value={[newTaskPriority]}
        onValueChange={(e) => {
          const raw = e.value[0];
          setNewTaskPriority(raw && isTaskPriority(raw) ? raw : TaskPriority.Medium);
        }}
      >
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
                {priorityCollection.items.map((item) => (
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

      <Select.Root
        collection={statusCollection}
        value={[newTaskStatus]}
        onValueChange={(e) => {
          const raw = e.value[0];
          setNewTaskStatus(raw && isTaskStatus(raw) ? raw : TaskStatus.Open);
        }}
      >
        <Flex justify="space-between" align="center" width="100%">
          <Select.Label fontSize="small" fontWeight="bold" htmlFor="task-status">
            Status
          </Select.Label>

          <Select.Control bg="white" minW="200px" maxW="200px" id="task-status">
            <Select.Trigger>
              <Select.ValueText placeholder="Select a status" />
              <Select.Indicator />
            </Select.Trigger>
          </Select.Control>

          <Portal>
            <Select.Positioner>
              <Select.Content>
                {statusCollection.items.map((item) => (
                  <Select.Item item={item} key={item.value}>
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
        <Button variant="ghost" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>

        <Button colorScheme="green" onClick={onCreate} loading={saving}>
          Create
        </Button>
      </Flex>
    </VStack>
  </Box>
  );
}