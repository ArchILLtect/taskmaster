import { useMemo, useState } from "react";
import { Badge, Box, Button, Heading, HStack, NumberInput, Text, VStack, } from "@chakra-ui/react";
import { TaskRow } from "../components/TaskRow";
import { buildTaskStackPath } from "../routes/taskStack";
import { inboxService } from "../services/inboxService";
import { taskService } from "../services/taskService";
import { TaskStatus } from "../API";
import { taskmasterApi } from "../api/taskmasterApi";

export function InboxPage() {
  const [tick, setTick] = useState(0);

  const vm = useMemo(() => inboxService.getViewModel(), [tick]);

  const refresh = () => setTick((t) => t + 1);

  // TODO: Optional: if you want “new since last view” to be stable while on the page,
  // do NOT auto-mark viewed here. Keep it explicit via “Done triaging”.
  // useEffect(() => {
  //   inboxService.markViewedNow();
  //   refresh();
  // }, []);

  const linkToTask = (listId: string, taskId: string) => buildTaskStackPath(listId, [taskId]);

  const handleToggleComplete = async (taskId: string, nextStatus: TaskStatus) => {
    const completedAt = nextStatus === TaskStatus.Done ? new Date().toISOString() : null;

    await taskmasterApi.updateTask({
      id: taskId,
      status: nextStatus,
      completedAt,
    });

    await refresh();
  };

  const handleDeleteTask = (taskId: string) => {
    taskService.delete(taskId);
    refresh();
  };

  return (
    <VStack align="start" gap={4} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
      <HStack w="100%" justify="space-between" align="start">
        <VStack align="start" gap={1}>
          <Heading size="md">Inbox</Heading>
          <Text color="gray.600">
            Actionable triage: new tasks + due soon. Dismiss stuff to shrink the pile.
          </Text>
        </VStack>

        <Button
          onClick={() => {
            inboxService.markViewedNow();
            refresh();
          }}
        >
          Done triaging
        </Button>
      </HStack>

      <HStack gap={3} align="center">
        <Text fontWeight="600">Due soon window:</Text>
        <NumberInput.Root
          size="sm"
          width="90px"
          min={1}
          max={30}
          value={String(vm.state.dueSoonWindowDays)}
          onValueChange={({ valueAsNumber }) => {
            if (!Number.isFinite(valueAsNumber)) return;
            inboxService.setDueSoonWindowDays(valueAsNumber);
            refresh();
          }}
        >
          <NumberInput.Input />
        </NumberInput.Root>
        <Text color="gray.600" fontSize="sm">
          days
        </Text>
      </HStack>

      {/* New tasks */}
      <Box w="100%">
        <HStack mb={2} gap={2}>
          <Heading size="sm">New tasks</Heading>
          <Badge rounded="md">{vm.newTasks.length}</Badge>
        </HStack>

        {vm.newTasks.length === 0 ? (
          <Text color="gray.600">No new tasks since your last inbox pass. Nice. ✨</Text>
        ) : (
          <VStack align="stretch" gap={2}>
            {vm.newTasks.map((t) => (
              <HStack key={t.id} gap={2} align="stretch">
                <Box flex="1">
                  <TaskRow
                    task={t}
                    to={linkToTask(t.listId, t.id)}
                    showLists
                    onDelete={() => handleDeleteTask(t.id)}
                    onToggleComplete={handleToggleComplete}
                  />
                </Box>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    inboxService.dismiss(t.id);
                    refresh();
                  }}
                >
                  Dismiss
                </Button>
              </HStack>
            ))}
          </VStack>
        )}
      </Box>

      {/* Due soon */}
      <Box w="100%" pt={2}>
        <HStack mb={2} gap={2}>
          <Heading size="sm">Due soon</Heading>
          <Badge rounded="md">{vm.dueSoonTasks.length}</Badge>
        </HStack>

        {vm.dueSoonTasks.length === 0 ? (
          <Text color="gray.600">Nothing due soon. Future-you says thanks.</Text>
        ) : (
          <VStack align="stretch" gap={2}>
            {vm.dueSoonTasks.map((t) => (
              <HStack key={t.id} gap={2} align="stretch">
                <Box flex="1">
                  <TaskRow
                    task={t}
                    to={linkToTask(t.listId, t.id)}
                    showLists
                    onToggleComplete={handleToggleComplete}
                    onDelete={() => handleDeleteTask(t.id)}
                  />
                </Box>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    inboxService.dismiss(t.id);
                    refresh();
                  }}
                >
                  Acknowledge
                </Button>
              </HStack>
            ))}
          </VStack>
        )}
      </Box>

      {vm.state.lastViewedAt ? (
        <Text color="gray.500" fontSize="sm">
          Last triage: {new Date(vm.state.lastViewedAt).toLocaleString()}
        </Text>
      ) : (
        <Text color="gray.500" fontSize="sm">
          First time here — everything counts as “new” once.
        </Text>
      )}
    </VStack>
  );
}