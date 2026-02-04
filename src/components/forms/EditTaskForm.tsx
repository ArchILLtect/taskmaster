import { Box, Heading, VStack, CloseButton, Input, Button, Flex, HStack, Text, Switch } from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import type { EditTaskFormProps } from "../../types/task";
import { useCallback, useEffect, useMemo, useRef, useState, type JSX } from "react";
import { TaskPriority, TaskStatus } from "../../API";
import { getInboxListId } from "../../config/inboxSettings";
import { FIELD_LIMITS } from "../../config/fieldConstraints";
import { useTaskmasterData } from "../../hooks/useTaskmasterData";
import { useTaskIndexView } from "../../store/taskStore";
import { FormSelect } from "./FormSelect";
import { getTodayDateInputValue } from "../../services/dateTime";
import type { TaskUI } from "../../types/task";

type Option<T extends string> = { label: string; value: T };

// --- helpers (keep local, simple)
const isTaskPriority = (v: string): v is TaskPriority =>
  (Object.values(TaskPriority) as string[]).includes(v);

const isTaskStatus = (v: string): v is TaskStatus =>
  (Object.values(TaskStatus) as string[]).includes(v);

const todayDate = getTodayDateInputValue();

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

const EMPTY_TASKS: TaskUI[] = [];

export const EditTaskForm = ({
  task,
  draftTaskTitle,
  setDraftTaskTitle,
  draftTaskDescription,
  setDraftTaskDescription,
  draftTaskListId,
  setDraftTaskListId,
  draftTaskParentId,
  setDraftTaskParentId,
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
  const { tasksByListId } = useTaskIndexView();
  const hideButtons = skipModal !== true;

  const selectedListId = draftTaskListId || task.listId;
  const tasksInSelectedList = useMemo(() => {
    return tasksByListId[selectedListId] ?? EMPTY_TASKS;
  }, [selectedListId, tasksByListId]);

  const tasksInSelectedListById = useMemo(() => {
    const map = new Map<string, (typeof tasksInSelectedList)[number]>();
    for (const t of tasksInSelectedList) map.set(t.id, t);
    return map;
  }, [tasksInSelectedList]);

  const childrenByParentId = useMemo(() => {
    const m = new Map<string | null, (typeof tasksInSelectedList)[number][]>();
    for (const t of tasksInSelectedList) {
      const p = t.parentTaskId ?? null;
      const arr = m.get(p) ?? [];
      arr.push(t);
      m.set(p, arr);
    }
    // Keep child ordering stable by sortOrder.
    for (const [k, arr] of m) {
      arr.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      m.set(k, arr);
    }
    return m;
  }, [tasksInSelectedList]);

  const invalidParentIds = useMemo(() => {
    const invalid = new Set<string>();
    invalid.add(task.id);

    // Only enforce descendant-cycle prevention when staying in the same list.
    if (selectedListId !== task.listId) return invalid;

    const stack: string[] = [task.id];
    while (stack.length) {
      const cur = stack.pop()!;
      const children = childrenByParentId.get(cur) ?? [];
      for (const c of children) {
        if (invalid.has(c.id)) continue;
        invalid.add(c.id);
        stack.push(c.id);
      }
    }
    return invalid;
  }, [childrenByParentId, selectedListId, task.id, task.listId]);

  const [enableParentPicker, setEnableParentPicker] = useState<boolean>(false);
  const [parentPath, setParentPath] = useState<string[]>([]);

  const prevSelectedListIdRef = useRef<string>(selectedListId);

  // When list changes (due to user action), keep the intent (enabled/disabled)
  // but clear the specific parent selection. Do NOT run on initial mount.
  useEffect(() => {
    if (prevSelectedListIdRef.current === selectedListId) return;
    prevSelectedListIdRef.current = selectedListId;
    setParentPath([]);
    setDraftTaskParentId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedListId]);

  // Initialize the picker state from draftTaskParentId when editing starts.
  useEffect(() => {
    const parentId = draftTaskParentId ?? null;
    if (!parentId) {
      setEnableParentPicker(false);
      setParentPath([]);
      return;
    }

    setEnableParentPicker(true);

    // Build a path from top-level -> ... -> parentId.
    const nextPath: string[] = [];
    let cur: string | null = parentId;
    const guard = new Set<string>();
    while (cur && !guard.has(cur)) {
      guard.add(cur);
      nextPath.unshift(cur);
      const t = tasksInSelectedListById.get(cur);
      cur = (t?.parentTaskId ?? null) as string | null;
    }
    setParentPath(nextPath);
  }, [draftTaskParentId, tasksInSelectedListById]);

  const topLevelParentOptions = useMemo(() => {
    return (childrenByParentId.get(null) ?? [])
      .filter((t) => !invalidParentIds.has(t.id))
      .map((t) => ({ label: t.title || "(Untitled)", value: t.id }));
  }, [childrenByParentId, invalidParentIds]);

  const getChildOptions = useCallback((parentId: string) => {
    return (childrenByParentId.get(parentId) ?? [])
      .filter((t) => !invalidParentIds.has(t.id))
      .map((t) => ({ label: t.title || "(Untitled)", value: t.id }));
  }, [childrenByParentId, invalidParentIds]);

  const parentPreview = useMemo(() => {
    if (!enableParentPicker || !draftTaskParentId) return "Top-level";
    if (parentPath.length === 0) return "Top-level";
    const labels = parentPath
      .map((id) => tasksInSelectedListById.get(id)?.title)
      .filter((t): t is string => typeof t === "string" && t.length > 0);
    return labels.length ? labels.join(" ▸ ") : "(Selected parent)";
  }, [draftTaskParentId, enableParentPicker, parentPath, tasksInSelectedListById]);

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

  const onListChange = (v: string | null) => {
    const next = v || inboxListId || "";
    setDraftTaskListId(next);
    // Parent selection reset happens in the list-change effect.
  };

  const clearParent = () => {
    setParentPath([]);
    setDraftTaskParentId(null);
  };

  const updateParentAtLevel = useCallback((level: number, nextId: string | null) => {
    // Truncate to the level being edited.
    const nextPath = parentPath.slice(0, level);

    if (nextId) {
      nextPath[level] = nextId;
      setParentPath(nextPath);
      setDraftTaskParentId(nextId);
      return;
    }

    // Clearing the selection at this level means parent becomes previous level (or top-level).
    setParentPath(nextPath);
    const prev = nextPath.at(-1) ?? null;
    setDraftTaskParentId(prev);
  }, [parentPath, setDraftTaskParentId]);

  const parentLevelSelects = useMemo(() => {
    if (!enableParentPicker) return null;

    const selects: JSX.Element[] = [];
    let level = 0;
    let prevParentId: string | null = null;

    while (true) {
      const items = level === 0 ? topLevelParentOptions : (prevParentId ? getChildOptions(prevParentId) : []);
      const value = parentPath[level] ?? "";

      selects.push(
        <FormSelect
          key={`parent-level-${level}`}
          title={level === 0 ? "Parent" : "Under"}
          items={items}
          value={value}
          onChange={(v) => updateParentAtLevel(level, v || null)}
          placeholder={level === 0 ? "No parent (top-level)" : "(Stop here)"}
          helperText={level === 0 ? "Choose a task to make this task a subtask." : "Optionally nest deeper."}
          layout="row"
          minW="200px"
          maxW="200px"
        />
      );

      const selectedAtLevel = value || null;
      if (!selectedAtLevel) break;

      const nextItems = getChildOptions(selectedAtLevel);
      prevParentId = selectedAtLevel;
      level += 1;

      if (nextItems.length === 0) break;
      // Continue; next loop will render the next level with blank selection if needed.
      if (level > 10) break; // safety guard for pathological graphs
    }

    return <VStack align="start" gap={2} w="100%">{selects}</VStack>;
  }, [enableParentPicker, getChildOptions, parentPath, topLevelParentOptions, updateParentAtLevel]);

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
            maxLength={FIELD_LIMITS.task.titleMax}
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
            maxLength={FIELD_LIMITS.task.descriptionMax}
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
        onChange={onListChange}
        placeholder="Select a list"
        layout="row"
        minW="200px"
        maxW="200px"
      />

      <Box w="100%" pt={2}>
        <HStack justify="space-between" w="100%">
          <Text fontSize="sm" fontWeight="bold">
            Parent
          </Text>
          <Switch.Root
            checked={enableParentPicker}
            onCheckedChange={() => {
              setEnableParentPicker((v) => {
                const next = !v;
                if (!next) clearParent();
                return next;
              });
            }}
          >
            <Switch.HiddenInput />
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            <Switch.Label />
          </Switch.Root>
        </HStack>

        {enableParentPicker ? (
          <VStack align="start" gap={2} w="100%" mt={2}>
            {parentLevelSelects}
            <HStack justify="space-between" w="100%">
              <Text fontSize="sm" color="gray.700">
                Will move under: <b>{parentPreview}</b>
              </Text>
              <Button size="xs" variant="outline" onClick={clearParent}>
                Clear parent
              </Button>
            </HStack>
          </VStack>
        ) : (
          <Text fontSize="sm" color="gray.600" mt={1}>
            Top-level task (no parent).
          </Text>
        )}
      </Box>
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
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>

          <Button colorPalette="green" variant="solid" onClick={() => onSave(task)} loading={saving}>
            Save
          </Button>
        </Flex>
      ) : null}
    </VStack>
  </Box>
  );
}