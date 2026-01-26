import { useMemo, useState } from "react";
import { Badge, Box, Button, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { TaskRow } from "../components/TaskRow";
import { buildTaskStackPath } from "../routes/taskStack";
import { TaskStatus } from "../API";
import { useUpdatesPageData } from "./useUpdatesPageData";
import { fireToast } from "../hooks/useFireToast";
import { BasicSpinner } from "../components/ui/BasicSpinner";
import { DialogModal } from "../components/ui/DialogModal";
import { useTaskActions } from "../store/taskStore";
import { useUpdatesActions, useUpdatesView } from "../store/updatesStore";

export function UpdatesPage() {

  const { allTasks, lists, loading } = useUpdatesPageData();
  const vm = useUpdatesView();
  const { clearAll, clearRead, markAllReadNow } = useUpdatesActions();

  const [isClearAllOpen, setIsClearAllOpen] = useState(false);

  const { updateTask, deleteTask } = useTaskActions();

  const taskById = useMemo(() => new Map(allTasks.map((t) => [t.id, t])), [allTasks]);
  const listById = useMemo(() => new Map(lists.map((l) => [l.id, l])), [lists]);

  const hasMissingTaskEvents = useMemo(() => {
    return vm.events.some((e) => e.type !== "task_deleted" && !!e.taskId && !taskById.has(e.taskId));
  }, [vm.events, taskById]);

  const linkToTask = (listId: string, taskId: string) => buildTaskStackPath(listId, [taskId]);

  const handleToggleComplete = async (taskId: string, nextStatus: TaskStatus) => {
    if (!taskId || !nextStatus) return;
    const completedAt = nextStatus === TaskStatus.Done ? new Date().toISOString() : null;

    try {
      await updateTask({
        id: taskId,
        status: nextStatus,
        completedAt,
      });
    } catch (error) {
      console.error("Error updating task status:", error);
      fireToast("error", "Error updating task", "There was an issue updating the task status.");
    } finally {
      fireToast("success", "Task marked as " + nextStatus, "Task is now " + nextStatus.toLowerCase() + ".");
    };
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!taskId) return;

    try {
      await deleteTask({
        id: taskId
      });
    } catch (error) {
      console.error("Failed to delete task:", error);
      fireToast("error", "Failed to delete task", "An error occurred while deleting the task.");
    } finally {
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
          {import.meta.env.DEV && hasMissingTaskEvents ? (
            <Button
              variant="outline"
              onClick={() => {
                setIsClearAllOpen(true);
              }}
            >
              Clear all
            </Button>
          ) : null}
          <Button
            variant="outline"
            onClick={() => {
              clearRead();
            }}
          >
            Clear read
          </Button>
          <Button
            onClick={() => {
              markAllReadNow();
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
            const task = e.taskId ? taskById.get(e.taskId) : null;
            const list = task ? listById.get(task.listId) : listById.get(e.listId);
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
                ) : (
                  <Text mt={2} color="gray.600" fontSize="sm">
                    {e.type === "task_deleted"
                      ? "This update references a task that was deleted."
                      : "This update references a task that isn't available (likely stale after data migration or reset)."}
                    {e.taskId ? ` (taskId: ${e.taskId})` : null}
                  </Text>
                )}
              </Box>
            );
          })}
        </VStack>
      )}

      <DialogModal
        title="Clear all updates?"
        body={
          <VStack align="start" gap={2}>
            <Text>
              This removes all update history stored locally in this browser.
            </Text>
            <Text color="gray.600" fontSize="sm">
              Tasks and lists in your backend are not affected.
            </Text>
          </VStack>
        }
        open={isClearAllOpen}
        setOpen={setIsClearAllOpen}
        onCancel={() => setIsClearAllOpen(false)}
        onAccept={async () => {
          clearAll();
          // TODO: If an opportunity presents itself again, test if this modal closes on acceptance
          // if not, uncomment the following code:
          // setIsClearAllOpen(false);
          fireToast("success", "Updates cleared", "All update events have been removed.");
        }}
      />

      <Text color="gray.500" fontSize="sm">
        Tip: Events are captured from task actions and stored locally.
      </Text>
    </VStack>
  );
}