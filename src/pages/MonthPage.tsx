import { Heading, Box, Text, VStack, HStack, Badge } from "@chakra-ui/react";
import { useMonthPageData } from "./useMonthPageData";
import { BasicSpinner } from "../components/ui/BasicSpinner";
import { AppCollapsible } from "../components/AppCollapsible";
import { TaskRow } from "../components/TaskRow";
import { formatUtcDayKeyWithWeekday, formatUtcMonthYear } from "../services/dateTime";
import { OverdueHeader } from "../components/ui/OverdueHeader";

export function MonthPage() {
  const { loading, monthStartKey, monthEndKey, overdueTasks, tasksInMonth, weeks, listsById } = useMonthPageData();

  if (loading) return <BasicSpinner />;

  return (
    <VStack align="start" gap={2} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
      <HStack justify="space-between" w="100%">
        <Heading size="2xl">Month</Heading>
        <HStack gap={2}>
          <Badge colorPalette={overdueTasks.length > 0 ? "red" : "gray"} variant="outline">
            Overdue: {overdueTasks.length}
          </Badge>
          <Badge colorPalette={tasksInMonth.length > 0 ? "blue" : "gray"} variant="outline">
            This month: {tasksInMonth.length}
          </Badge>
        </HStack>
      </HStack>

      <Text color="gray.600">{formatUtcMonthYear(monthStartKey)}</Text>

      {overdueTasks.length === 0 && tasksInMonth.length === 0 ? (
        <Text color="gray.600">Nothing scheduled for this month.</Text>
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

      <Box
        w="100%"
        bg="gray.50"
        p="3"
        rounded="md"
        boxShadow="sm"
        mb={4}
      >
        <Text
          fontSize="2xl"
          fontWeight="700"
          color="blue.600"
          p={1}
          mb={2}
        >
          {formatUtcDayKeyWithWeekday(monthStartKey)} to {formatUtcDayKeyWithWeekday(monthEndKey)}
        </Text>
        {weeks.map((w) => {
          const hasAnyInWeek = w.days.some((d) => d.tasks.length > 0);

          return (
            <Box
              key={w.weekStartKey} w="100%"
              bg="gray.100"
              p="3"
              rounded="md"
              boxShadow="sm"
              mb={4}
            >
              <AppCollapsible
                title={`Week of ${formatUtcDayKeyWithWeekday(w.weekStartKey)}`}
                defaultOpen={hasAnyInWeek}
                fontSize="xl"
                fontWeight="600"
                fontColor="blue.600"
                mt="0"
                mb="0"
              >
                <VStack
                  align="stretch"
                  bg="gray.50"
                  p="3"
                  rounded="md"
                  boxShadow="sm"
                  gap={2}
                  w="100%"
                  mt={2}
                >
                  {w.days.map((d, idx) => {
                    return (
                      <Box key={d.dayKey} w="100%">
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
                              {d.tasks.map((task) => {
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
                          )}
                        </AppCollapsible>
                        {idx !== w.days.length - 1 ? (
                          <Box height="1px" width="100%" bg="gray.200" mt={4} mb={2} />
                        ) : null}
                      </Box>
                    )
                  })}
                </VStack>
              </AppCollapsible>
            </Box>
          );
        })}
      </Box>
    </VStack>
  );
}
