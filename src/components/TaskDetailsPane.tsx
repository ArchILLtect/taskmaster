import { Box, Button, Heading, HStack, Text, VStack, Badge } from "@chakra-ui/react";
import { RouterLink } from "./RouterLink";
import { buildTaskStackPath, nextStackOnClick } from "../routes/taskStack";
import type { Task } from "../types/task";

type Props = {
  listId: string;
  taskId: string;
  stack: string[];
  tasksInList: Task[];
  onCloseAll: () => void;
};

export function TaskDetailsPane({ listId, taskId, stack, tasksInList, onCloseAll }: Props) {
  const selected = tasksInList.find((t) => t.id === taskId);

  const children = selected
    ? tasksInList
        .filter((t) => t.parentTaskId === selected.id)
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
    : [];

  return (
    <Box
      w="30vw"
      borderWidth="1px"
      rounded="md"
      p={4}
      bg="white"
      minH="85vh"
      flexShrink={0}
    >
      <HStack justify="space-between" mb={2}>
        <Heading size="md">Details</Heading>

        <Button as="span" size="sm" variant="ghost" onClick={onCloseAll}>
          Close
        </Button>
      </HStack>

      {!selected ? (
        <Text color="gray.600">Task not found.</Text>
      ) : (
        <>
          <VStack align="start" gap={2}>
            <Text fontWeight="700" fontSize="lg">
              {selected.title}
            </Text>
            {selected.description ? <Text>{selected.description}</Text> : null}

            <HStack>
              <Badge>{selected.priority}</Badge>
              <Badge variant="outline">{selected.status}</Badge>
            </HStack>

            <Text color="gray.600" fontSize="sm">
              Due: {selected.dueAt ?? "Someday"}
            </Text>
          </VStack>

          <VStack align="start" gap={2} mt={4}>
            <Heading size="sm">Subtasks</Heading>

            {children.length === 0 ? (
              <Text color="gray.600">No subtasks.</Text>
            ) : (
              <VStack align="start" gap={1} w="100%">
                {children.map((child) => (
                  <RouterLink
                    key={child.id}
                    to={buildTaskStackPath(listId, nextStackOnClick(stack, child.id))}
                  >
                    {() => (
                      <Box borderWidth="1px" rounded="md" p={2} w="100%">
                        <Text>{child.title}</Text>
                      </Box>
                    )}
                  </RouterLink>
                ))}
              </VStack>
            )}
          </VStack>
        </>
      )}
    </Box>
  );
}