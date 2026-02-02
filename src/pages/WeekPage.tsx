import { Heading, Box, Text, VStack, HStack, Badge } from "@chakra-ui/react";
import { useWeekPageData } from "./useWeekPageData";
import { BasicSpinner } from "../components/ui/BasicSpinner";
import { TaskRow } from "../components/TaskRow";
import { formatUtcDayKeyWithWeekday } from "../services/dateTime";
import { AppCollapsible } from "../components/AppCollapsible";
import { OverdueHeader } from "../components/ui/OverdueHeader";

export function WeekPage() {
  const { loading, overdueTasks, dueThisWeekTasks, days, listsById } = useWeekPageData();

  if (loading) return <BasicSpinner />;

  const startDayKey = days[0]?.dayKey;
  const endDayKey = days[days.length - 1]?.dayKey;

  return (
    <VStack align="start" gap={2} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
      <HStack justify="space-between" w="100%">
        <Heading size="2xl">Week</Heading>
        <HStack gap={2}>
          <Badge colorPalette={overdueTasks.length > 0 ? "red" : "gray"} variant="outline">
            Overdue: {overdueTasks.length}
          </Badge>
          <Badge colorPalette={dueThisWeekTasks.length > 0 ? "blue" : "gray"} variant="outline">
            This week: {dueThisWeekTasks.length}
          </Badge>
        </HStack>
      </HStack>

      {startDayKey && endDayKey ? (
        <Text color="gray.600">{`${formatUtcDayKeyWithWeekday(startDayKey)} to ${formatUtcDayKeyWithWeekday(endDayKey)}`}</Text>
      ) : null}

      {overdueTasks.length === 0 && dueThisWeekTasks.length === 0 ? (
        <Text color="gray.600">Nothing scheduled for the next 7 days.</Text>
      ) : null}

      {overdueTasks.length > 0 ? (
        <VStack
          align="stretch"
          bg="gray.50"
          p="3"
          rounded="md"
          boxShadow="sm"
          gap={2}
          w="100%"
          mt={2}
          mb={4}
        >
          <OverdueHeader />
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

      <Box w="100%" bg="gray.50" p="3" rounded="md" boxShadow="sm" mb={4}>
        <Text
          fontSize="xl"
          fontWeight="700"
          color="blue.600"
          p={1}
          mb={2}
        >{startDayKey ? `Week of ${formatUtcDayKeyWithWeekday(startDayKey)}` : "Week"}</Text>
        {days.map((d) => (
          <VStack key={d.dayKey} align="stretch" bg="gray.100" mb={4} p="3" rounded="md" boxShadow="sm" gap={2} w="100%">
            <Box w="100%">
              <AppCollapsible
                title={formatUtcDayKeyWithWeekday(d.dayKey)}
                defaultOpen={d.tasks.length > 0}
                mt="0"
                mb="0"
              >
                {d.tasks.length === 0 ? (
                  <Text color="gray.600" mt={2}>
                    No tasks.
                  </Text>
                ) : (
                  <VStack align="stretch" gap={2} w="100%" mt={2}>
                    {d.tasks.map((task, idx) => {
                      const list = listsById.get(task.listId);
                      if (!list) return null;

                      return (
                        <Box key={task.id} w="100%">
                          <TaskRow
                            task={task}
                            list={list}
                            to={`/lists/${task.listId}/tasks/${task.id}`}
                            showLists
                          />
                          {idx !== d.tasks.length - 1 ? (
                            <Box height="1px" width="100%" bg="gray.200" mt={4} mb={2} />
                          ) : null}
                        </Box>
                      );
                    })}
                  </VStack>
                )}
              </AppCollapsible>
            </Box>
          </VStack>
        ))}
      </Box>
    </VStack>
  );
}
