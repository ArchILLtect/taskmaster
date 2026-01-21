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
import { taskmasterApi } from "../api/taskmasterApi";
import type { EditTaskFormProps } from "../types/task";
import { useEffect } from "react";
import { TaskPriority, TaskStatus } from "../API";

// --- helpers (keep local, simple)
function isoToDateInput(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}
function dateInputToIso(date: string) {
  if (!date) return null;
  return new Date(`${date}T00:00:00.000Z`).toISOString();
}

type Option<T extends string> = { label: string; value: T };

const isTaskPriority = (v: string): v is TaskPriority =>
  (Object.values(TaskPriority) as string[]).includes(v);

const isTaskStatus = (v: string): v is TaskStatus =>
  (Object.values(TaskStatus) as string[]).includes(v);

// Get current timezone
const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const todayDate = new Date().toLocaleDateString("en-CA", { timeZone: userTimeZone });

// IMPORTANT: make these match your API enums/strings
const PRIORITY_OPTIONS: Option<TaskPriority>[] = [
  { label: "Low", value: TaskPriority.Low },
  { label: "Medium", value: TaskPriority.Medium },
  { label: "High", value: TaskPriority.High },
];

const STATUS_OPTIONS: Option<TaskStatus>[] = [
  { label: "Open", value: TaskStatus.Open },
  { label: "Done", value: TaskStatus.Done },
];

export const EditTaskForm = ({
  task,
  draftTitle,
  setDraftTitle,
  draftDescription,
  setDraftDescription,
  draftDueDate,
  setDraftDueDate,
  draftPriority,
  setDraftPriority,
  draftStatus,
  setDraftStatus,
  saving,
  setSaving,
  setIsEditing,
  onClose,
  refresh,
}: EditTaskFormProps) => {

    useEffect(() => {
    if (!task) return;
    setDraftTitle(task.title ?? "");
    setDraftDescription(task.description ?? "");
    setDraftPriority((task.priority as TaskPriority) ?? TaskPriority.Medium);
    setDraftStatus((task.status as TaskStatus) ?? TaskStatus.Open);
    setDraftDueDate(isoToDateInput(task.dueAt));
  }, [task?.id]); // only when task changes

  // ✅ Chakra v3 pattern: destructure `{ collection }`
  const { collection: priorityCollection } = useListCollection<Option<TaskPriority>>({
    initialItems: PRIORITY_OPTIONS,
    itemToValue: (item) => item.value,
    itemToString: (item) => item.label,
  });

  const { collection: statusCollection } = useListCollection<Option<TaskStatus>>({
    initialItems: STATUS_OPTIONS,
    itemToValue: (item) => item.value,
    itemToString: (item) => item.label,
  });

  const onCancel = () => {
    if (!task) return;
    setDraftTitle(task.title ?? "");
    setDraftDescription(task.description ?? "");
    setDraftPriority((task.priority as TaskPriority) ?? TaskPriority.Medium);
    setDraftStatus((task.status as TaskStatus) ?? TaskStatus.Open);
    setDraftDueDate(isoToDateInput(task.dueAt));
    setIsEditing(false);
  };

  const onSave = async () => {
    if (!task) return;

    setSaving(true);
    try {
      await taskmasterApi.updateTask({
        id: task.id,
        title: draftTitle.trim() || "Untitled Task",
        description: draftDescription,
        // Cast to generated enums (type-level only) so TS stops screaming.
        priority: draftPriority as unknown as TaskPriority,
        status: draftStatus as unknown as TaskStatus,
        dueAt: dateInputToIso(draftDueDate),
        completedAt:
          draftStatus === TaskStatus.Done ? (task.completedAt ?? new Date().toISOString()) : null,
      });

      await refresh();
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
  <Box w="100%" mt={2} p={2} bg="gray.200" rounded="md" boxShadow="inset 0 0 5px rgba(0,0,0,0.1)">
    <VStack align="start" gap={2}>
      <Flex justify="space-between" align="center" width="100%">
        <Heading size="sm" fontWeight="bold">Edit Task</Heading>
        <CloseButton
          onClick={() => { 
            onClose();
            onCancel();
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
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
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
            value={draftDescription}
            onChange={(e) => setDraftDescription(e.target.value)}
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
            value={draftDueDate}
            onChange={(e) => setDraftDueDate(e.target.value)}
          />
        </Flex>
      </FormControl>
      <Select.Root
        collection={priorityCollection}
        value={[draftPriority]}
        onValueChange={(e) => {
          const raw = e.value[0];
          setDraftPriority(raw && isTaskPriority(raw) ? raw : TaskPriority.Medium);
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
        value={[draftStatus]}
        onValueChange={(e) => {
          const raw = e.value[0];
          setDraftStatus(raw && isTaskStatus(raw) ? raw : TaskStatus.Open);
        }}
      >
        <Flex justify="space-between" align="center" width="100%">
          <Select.Label fontSize="small" fontWeight="bold" htmlFor="task-status">Status</Select.Label>

          <Select.Control bg="white" minW="200px" maxW="200px" id="task-status">
            <Select.Trigger>
              <Select.ValueText placeholder="Select a status" />
              <Select.Indicator />
            </Select.Trigger>
          </Select.Control>

          <Portal>
            <Select.Positioner>
              <Select.Content>
                {/* Renders all items in the collection */}
                {statusCollection.items.map((item) => (
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
          <Button variant="ghost" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>

          <Button colorScheme="green" onClick={onSave} loading={saving}>
            Save
          </Button>
        </Flex>
    </VStack>
  </Box>
  );
}