import { Box, VStack, Input, Flex } from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { buildTaskStackPath } from "../../routes/taskStack";
import { TaskStatus, TaskPriority } from "../../API";
import type { TaskUI, AddTaskFormProps } from "../../types/task";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { getInboxListId } from "../../config/inboxSettings";
import { useTaskmasterData } from "../../hooks/useTaskmasterData";
import { useTaskActions } from "../../store/taskStore";
import { FormSelect } from "./FormSelect";
import { getTodayDateInputValue } from "../../services/dateTime";

export type AddTaskFormHandle = {
  submit: () => Promise<void>;
  cancel: () => void;
};

type Option<T extends string> = { label: string; value: T };

const isTaskPriority = (v: string): v is TaskPriority =>
  (Object.values(TaskPriority) as string[]).includes(v);

const isTaskStatus = (v: string): v is TaskStatus =>
  (Object.values(TaskStatus) as string[]).includes(v);

const todayDate = getTodayDateInputValue();

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

function nextSortOrder(tasks: TaskUI[], parentTaskId: string | null) {
  const max = tasks
    .filter(t => (t.parentTaskId ?? null) === parentTaskId)
    .reduce((acc, t) => Math.max(acc, t.sortOrder ?? 0), 0);

  return max + 1;
}

export const AddTaskForm = forwardRef<AddTaskFormHandle, AddTaskFormProps>(({
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
  navigate,
  parentTaskId,
  onCreated,
  onSavingChange,
}: AddTaskFormProps, ref) => {

  const [saving, setSaving] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>(TaskStatus.Open);
  const inboxListId = getInboxListId();
  const [selectedListId, setSelectedListId] = useState<string>(listId ? listId : inboxListId || "");

  const { visibleLists: allLists } = useTaskmasterData();

  const { createTask } = useTaskActions();

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

  const cancel = () => {
    resetForm();
  };

  const submit = async () => {
    if (saving) return;

    setSaving(true);
    try {
      const dueAtIso = dateInputToIso(newTaskDueDate);
      const parent = parentTaskId ?? null;
      const status = newTaskStatus ?? TaskStatus.Open;
      const completedAt = status === TaskStatus.Done ? new Date().toISOString() : null;

      const created = await createTask({
        listId: selectedListId,
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
        isDemo: false,
      });

      const nextStack = parentTaskId ? stack : [...(stack || []), created.id];

      if (onCreated) {
        onCreated({ id: created.id, listId: selectedListId });
      } else {
        // Default navigation behavior (legacy):
        // - if invoked from a list route, keep the pane-stack semantics
        // - otherwise, return to inbox
        if (!listId) {
          navigate("/inbox");
        } else {
          navigate(buildTaskStackPath(listId, nextStack || []));
        }
      }

      resetForm();

    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskDueDate("");
    setNewTaskPriority(TaskPriority.Medium);
    setNewTaskStatus(TaskStatus.Open);
  };

  useImperativeHandle(
    ref,
    () => ({
      submit,
      cancel,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [submit]
  );

  useEffect(() => {
    onSavingChange?.(saving);
  }, [onSavingChange, saving]);

  return (
    <Box w="100%" mt={2} p={2} bg="gray.200" rounded="md" boxShadow="inset 0 0 5px rgba(0,0,0,0.1)">
      <VStack align="start" gap={2}>

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

      <FormSelect
        title="List"
        items={listItems}
        value={selectedListId}
        onChange={(v) => setSelectedListId(v || "")}
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
            value={newTaskDueDate}
            onChange={(e) => setNewTaskDueDate(e.target.value)}
          />
        </Flex>
      </FormControl>

      <FormSelect
        title="Priority"
        items={PRIORITY_OPTIONS}
        value={newTaskPriority}
        onChange={(v) => setNewTaskPriority(v && isTaskPriority(v) ? v : TaskPriority.Medium)}
        placeholder="Select a priority"
        layout="row"
        minW="200px"
        maxW="200px"
      />

      <FormSelect
        title="Status"
        items={STATUS_OPTIONS}
        value={newTaskStatus}
        onChange={(v) => setNewTaskStatus(v && isTaskStatus(v) ? v : TaskStatus.Open)}
        placeholder="Select a status"
        layout="row"
        minW="200px"
        maxW="200px"
      />
      </VStack>
    </Box>
  );
});

AddTaskForm.displayName = "AddTaskForm";