import { Box, Heading, VStack, CloseButton, Input, Button, Flex } from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import type { EditTaskFormProps } from "../types/task";
import { useMemo } from "react";
import { TaskPriority, TaskStatus } from "../API";
import { getInboxListId } from "../config/inboxSettings";
import { useTaskmasterData } from "../hooks/useTaskmasterData";
import { FormSelect } from "./FormSelect";

type Option<T extends string> = { label: string; value: T };

// --- helpers (keep local, simple)
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
  draftTaskTitle,
  setDraftTaskTitle,
  draftTaskDescription,
  setDraftTaskDescription,
  draftTaskListId,
  setDraftTaskListId,
  draftTaskDueDate,
  setDraftTaskDueDate,
  draftTaskPriority,
  setDraftTaskPriority,
  draftTaskStatus,
  setDraftTaskStatus,
  skipModal,
  saving,
  onSave,
  onClose,
}: EditTaskFormProps) => {

  const inboxListId = getInboxListId();

  const { visibleLists: allLists } = useTaskmasterData();
  const hideButtons = skipModal !== true;

  const listItems = useMemo(() => {
    const items: Option<string>[] = [];
    if (inboxListId) {
      items.push({ label: "Inbox", value: inboxListId });
    }
    allLists.forEach((list) => {
      items.push({ label: list.name || "(Untitled)", value: list.id });
    });
    return items;
  }, [allLists, inboxListId]);

  return (
  <Box w="100%" p={4} bg="gray.200" rounded="md" boxShadow="inset 0 0 5px rgba(0,0,0,0.1)">
    <VStack align="start" gap={2}>
      {!hideButtons ? (
        <>
          <Flex justify="space-between" align="center" width="100%">
            <Heading size="sm" fontWeight="bold">Edit Task</Heading>
            <CloseButton
              onClick={() => { 
                onClose();
              }}
              size="xs"
            />
          </Flex>
          <Box height="1px" width="100%" bg="gray.400" mt={2} mb={4} />
        </>
      ) : null}

      <FormControl isRequired width="100%">
        <Flex justify="space-between" align="center">
          <FormLabel fontSize="small" fontWeight="bold" htmlFor="task-title">Title</FormLabel>
          <Input
            minW="150px"
            maxW="200px"
            id="task-title"
            bg="white"
            placeholder="Task Title"
            value={draftTaskTitle}
            onChange={(e) => setDraftTaskTitle(e.target.value)}
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
            value={draftTaskDescription}
            onChange={(e) => setDraftTaskDescription(e.target.value)}
          />
        </Flex>
      </FormControl>

      <FormSelect
        title="List"
        items={listItems}
        value={draftTaskListId}
        onChange={(v) => setDraftTaskListId(v || inboxListId || "")}
        placeholder="Select a list"
        layout="row"
        minW="200px"
        maxW="200px"
      />
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
            value={draftTaskDueDate}
            onChange={(e) => setDraftTaskDueDate(e.target.value)}
          />
        </Flex>
      </FormControl>

      <FormSelect
        title="Priority"
        items={PRIORITY_OPTIONS}
        value={draftTaskPriority}
        onChange={(v) => setDraftTaskPriority(v && isTaskPriority(v) ? v : TaskPriority.Medium)}
        placeholder="Select a priority"
        layout="row"
        minW="200px"
        maxW="200px"
      />


      <FormSelect
        title="Status"
        items={STATUS_OPTIONS}
        value={draftTaskStatus}
        onChange={(v) => setDraftTaskStatus(v && isTaskStatus(v) ? v : TaskStatus.Open)}
        placeholder="Select a status"
        layout="row"
        minW="200px"
        maxW="200px"
      />

      {!hideButtons ? (
        <Flex justify="space-between" align="center" width="100%">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>

          <Button colorScheme="green" onClick={() => onSave(task)} loading={saving}>
            Save
          </Button>
        </Flex>
      ) : null}
    </VStack>
  </Box>
  );
}