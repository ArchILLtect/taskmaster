import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { SidebarItem } from "../components/SidebarItem";

import { TaskRow } from "../components/TaskRow";
import { mockTasks } from "../mocks/tasks";
import { mockLists } from "../mocks/lists";

function buildStackUrl(listId: string, stack: string[]) {
  return stack.length === 0
    ? `/lists/${listId}`
    : `/lists/${listId}/tasks/${stack.join("/")}`;
}

export function ListPage() {
  const navigate = useNavigate();
  const params = useParams();

  const listId = params.listId;
  const taskPath = params["*"]; // React Router splat param for /tasks/*

  const stackIds = (taskPath ?? "")
    .split("/")
    .filter(Boolean); // ["a","b","c"]

  if (!listId) {
    return (
      <VStack align="start" gap={2} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
        <Heading size="lg">Lists</Heading>
        <Text>Select a list to view its tasks.</Text>

        {mockLists.length > 0 ? (
          <VStack align="stretch" gap={1}>
            {mockLists.map((l) => (
              <SidebarItem key={l.id} to={`/lists/${l.id}`} label={l.name} />
            ))}
          </VStack>
        ) : (
          <Text>No lists available. Create a new list to get started.</Text>
        )}
      </VStack>
    );
  }

  const tasks = mockTasks.filter((t) => t.listId === listId);

  // Helper for clicking a task (push to stack)
  const pushTask = (taskId: string) => {
    navigate(buildStackUrl(listId, [...stackIds, taskId]));
  };

  // Helper for closing (pop from stack)
  const popTo = (index: number) => {
    navigate(buildStackUrl(listId, stackIds.slice(0, index)));
  };

  return (
    <Flex align="start" gap={4} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
      {/* Left: task list */}
      <Box flex="1" minH="90vh" minW={"300px"}>
        <VStack align="start" gap={2}>
          <HStack gap={10} w="30vw">
          <Heading size="lg">List:</Heading>
          <Badge variant="outline" size={"lg"}>{listId}</Badge>
          </HStack>
          <Text color="gray.600">Tasks for this list (including “someday” tasks).</Text>

          {tasks.length === 0 ? (
            <Text>No tasks yet. Add your first one ✍️</Text>
          ) : (
            <VStack align="stretch" gap={2} w="100%" mt={2}>
              {tasks.map((task) => (
                <Box key={task.id}>
                  {/* Keep your TaskRow, but route to stack */}
                  <TaskRow
                    task={task}
                    to={buildStackUrl(listId, [...stackIds, task.id])}
                    showLists={false}
                  />
                </Box>
              ))}
            </VStack>
          )}
        </VStack>
      </Box>

      {/* Right: stacked panes */}
      {stackIds.map((id, idx) => {
        const selected = mockTasks.find((t) => t.id === id && t.listId === listId);

        return (
          <Box
            key={`${id}-${idx}`}
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

              {/* Close this pane and everything to its right */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => popTo(idx)}
              >
                Close
              </Button>
            </HStack>

            {!selected ? (
              <Text color="gray.600">Task not found.</Text>
            ) : (
              <>
                <VStack align="start" gap={2}>
                  <Text fontWeight="700" fontSize="lg">{selected.title}</Text>
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

                  {/* NOTE: Your current model has subtasks as inline objects,
                      not real Tasks. We'll upgrade that next. */}
                  {selected.subtasks?.length ? (
                    <VStack align="start" gap={1} w="100%">
                      {selected.subtasks.map((st) => (
                        <Box
                          key={st}
                          borderWidth="1px"
                          rounded="md"
                          p={2}
                          w="100%"
                          cursor="pointer"
                          onClick={() => pushTask(st)} // will show “Task not found” until model update
                        >
                          <Text>{st}</Text>
                        </Box>
                      ))}
                    </VStack>
                  ) : (
                    <Text color="gray.600">No subtasks.</Text>
                  )}
                </VStack>
              </>
            )}
          </Box>
        );
      })}
    </Flex>
  );
}