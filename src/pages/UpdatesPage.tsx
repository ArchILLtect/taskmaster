import { useMemo } from "react";
import { Badge, Box, Button, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { TaskRow } from "../components/TaskRow";
import { buildTaskStackPath } from "../routes/taskStack";
import { updatesService } from "../services/updatesService";
import { TaskStatus } from "../API";
import { taskmasterApi } from "../api/taskmasterApi";
import { useUpdatesPageData } from "./useUpdatesPageData";
import { fireToast } from "../hooks/useFireToast";
import { BasicSpinner } from "../components/ui/BasicSpinner";

export function UpdatesPage() {

  const { allTasks, lists, loading, refreshData } = useUpdatesPageData();
  const vm = updatesService.getViewModel();

  const taskById = useMemo(() => new Map(allTasks.map((t) => [t.id, t])), [allTasks]);

  const linkToTask = (listId: string, taskId: string) => buildTaskStackPath(listId, [taskId]);

  const handleToggleComplete = async (taskId: string, nextStatus: TaskStatus) => {
    if (!taskId || !nextStatus) return;
    const completedAt = nextStatus === TaskStatus.Done ? new Date().toISOString() : null;

    try {
      await taskmasterApi.updateTask({
        id: taskId,
        status: nextStatus,
        completedAt,
      });
    } catch (error) {
      console.error("Error updating task status:", error);
      fireToast("error", "Error updating task", "There was an issue updating the task status.");
    } finally {
      refreshData();
      fireToast("success", "Task marked as " + nextStatus, "Task is now " + nextStatus.toLowerCase() + ".");
    };
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!taskId) return;

    try {
      await taskmasterApi.deleteTask({
        id: taskId
      });
    } catch (error) {
      console.error("Failed to delete task:", error);
      fireToast("error", "Failed to delete task", "An error occurred while deleting the task.");
    } finally {
      refreshData();
      fireToast("success", "Task deleted", "The task has been successfully deleted.");
    }
  };

  // Add a spinner for loading state
  if (loading) return <BasicSpinner />;

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
              refreshData();
            }}
          >
            Clear read
          </Button>
          <Button
            onClick={() => {
              updatesService.markAllReadNow();
              refreshData();
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
            if (e.taskId === null) return null;
            const task = e.taskId ? taskById.get(e.taskId) : null;
            if (!task) return null;
            const list = lists.find((l) => l.id === task.listId)
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

                {task && list ? (
                  <Box mt={2}>
                    <TaskRow
                      task={task}
                      list={list}
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