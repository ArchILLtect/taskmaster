import { useMemo, useState } from "react";
import { Badge, Box, Button, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { TaskRow } from "../components/TaskRow";
import { buildTaskStackPath } from "../routes/taskStack";
import { updatesService } from "../services/updatesService";
import { taskService } from "../services/taskService";
import { TaskStatus } from "../API";
import { taskmasterApi } from "../api/taskmasterApi";

export function UpdatesPage() {
  const [tick, setTick] = useState(0);
  const vm = useMemo(() => updatesService.getViewModel(), [tick]);

  const refresh = () => setTick((t) => t + 1);

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
          <HStack>
            <Heading size="md">Updates</Heading>
            {vm.unreadCount > 0 ? <Badge rounded="md">{vm.unreadCount} unread</Badge> : null}
          </HStack>
          <Text color="gray.600">Informational activity log (persisted event feed).</Text>
        </VStack>

        <HStack>
          <Button
            variant="outline"
            onClick={() => {
              updatesService.clearRead();
              refresh();
            }}
          >
            Clear read
          </Button>
          <Button
            onClick={() => {
              updatesService.markAllReadNow();
              refresh();
            }}
          >
            Mark all read
          </Button>
        </HStack>
      </HStack>

      {vm.events.length === 0 ? (
        <Text color="gray.600">No updates yet.</Text>
      ) : (
        <VStack align="stretch" gap={2} w="100%">
          {vm.events.map((e) => {
            const task = taskService.getById(e.taskId);
            return (
              <Box key={e.id} borderWidth="1px" rounded="md" p={3}>
                <HStack justify="space-between" align="start">
                  <VStack align="start" gap={0} flex="1">
                    <Text fontWeight="700">{e.title}</Text>
                    <Text color="gray.600" fontSize="sm">
                      {new Date(e.occurredAt).toLocaleString()}
                    </Text>
                  </VStack>

                  <Badge variant="outline">{e.type}</Badge>
                </HStack>

                {task ? (
                  <Box mt={2}>
                    <TaskRow
                      task={task}
                      to={linkToTask(task.listId, task.id)}
                      showLists
                      onToggleComplete={handleToggleComplete}
                      onDelete={handleDeleteTask}
                    />
                  </Box>
                ) : null}
              </Box>
            );
          })}
        </VStack>
      )}

      <Text color="gray.500" fontSize="sm">
        Tip: Events are captured from task actions and stored locally (will move into Zustand persistence later).
      </Text>
    </VStack>
  );
}