import { Heading, Text, VStack, HStack, Badge } from "@chakra-ui/react";
import { useTodayPageData } from "./useTodayPageData";
import { BasicSpinner } from "../components/ui/BasicSpinner";
import { TaskRow } from "../components/TaskRow";

export function TodayPage() {
  const { loading, overdueTasks, dueTodayTasks, listsById } = useTodayPageData();

  if (loading) return <BasicSpinner />;

  return (
    <VStack align="start" gap={2} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
      <HStack justify="space-between" w="100%">
        <Heading size="2xl">Today</Heading>
        <HStack gap={2}>
          <Badge colorPalette={overdueTasks.length > 0 ? "red" : "gray"} variant="outline">
            Overdue: {overdueTasks.length}
          </Badge>
          <Badge colorPalette={dueTodayTasks.length > 0 ? "blue" : "gray"} variant="outline">
            Due today: {dueTodayTasks.length}
          </Badge>
        </HStack>
      </HStack>

      {overdueTasks.length === 0 && dueTodayTasks.length === 0 ? (
        <Text color="gray.600">No tasks due today. Nice.</Text>
      ) : null}

      {overdueTasks.length > 0 ? (
        <VStack align="stretch" gap={2} w="100%" mt={2}>
          <Heading size="md">Overdue</Heading>
          {overdueTasks.map((task) => {
            const list = listsById.get(task.listId);
            if (!list) return null;

            return (
              <TaskRow
                key={task.id}
                task={task}
                list={list}
                to={`/lists/${task.listId}/tasks/${task.id}`}
                showLists
              />
            );
          })}
        </VStack>
      ) : null}

      {dueTodayTasks.length > 0 ? (
        <VStack align="stretch" gap={2} w="100%" mt={4}>
          <Heading size="md">Due today</Heading>
          {dueTodayTasks.map((task) => {
            const list = listsById.get(task.listId);
            if (!list) return null;

            return (
              <TaskRow
                key={task.id}
                task={task}
                list={list}
                to={`/lists/${task.listId}/tasks/${task.id}`}
                showLists
              />
            );
          })}
        </VStack>
      ) : null}
    </VStack>
  );
}
