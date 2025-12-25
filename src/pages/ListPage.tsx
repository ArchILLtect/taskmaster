import { Box, Flex, Heading, Text, VStack, HStack, Badge, Button } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { SidebarItem } from "../components/SidebarItem";
import { RouterLink } from "../components/RouterLink";
import { mockTasks } from "../mocks/tasks";
import { mockLists } from "../mocks/lists";

export function ListPage() {
  const { listId, taskId } = useParams();

  console.log("Rendering ListPage with listId:", listId, "and taskId:", taskId);

  const tasks = mockTasks.filter((t) => t.listId === listId);
  const selected = mockTasks.find((t) => t.id === taskId && t.listId === listId);

  if (!listId) {
    return (
      <VStack align="start" gap={2}>
        <Heading size="lg">Lists</Heading>
        <Text>Select a list to view its tasks.</Text>
        {mockLists.length > 0 && (
          <VStack align="stretch" gap={1}>
            {mockLists.map((l) => (
              <SidebarItem key={l.id} to={`/lists/${l.id}`} label={l.name} />
            ))}
          </VStack>
        )}
        {mockLists.length === 0 && (
          <Text>
            No lists available. Create a new list to get started.
          </Text>
        )}
      </VStack>
    );
  }

  return (
    <Flex align="start" gap={4} minH="100%">
      {/* Left: task list */}
      <Box flex="1" minW={0}>
        <VStack align="start" gap={2}>
          <Heading size="lg">List: {listId}</Heading>
          <Text color="gray.600">
            Tasks for this list (including “someday” tasks).
          </Text>

          {tasks.length === 0 ? (
            <Text>No tasks yet. Add your first one ✍️</Text>
          ) : (
            <VStack align="stretch" gap={2} w="100%" mt={2}>
              {tasks.map((t) => (
                <RouterLink key={t.id} to={`/lists/${listId}/tasks/${t.id}`}>
                  {({ isActive }) => (
                    <Box
                      borderWidth="1px"
                      rounded="md"
                      p={3}
                      bg={isActive ? "blackAlpha.50" : "white"}
                      _hover={{ bg: "blackAlpha.50" }}
                    >
                      <HStack justify="space-between" align="start">
                        <Box>
                          <Text fontWeight="700">{t.title}</Text>
                          {t.description ? (
                            <Text color="gray.600" lineClamp={1}>
                              {t.description}
                            </Text>
                          ) : null}
                        </Box>

                        <VStack align="end" gap={1}>
                          <Badge>{t.priority}</Badge>
                          <Badge variant="outline">{t.status}</Badge>
                        </VStack>
                      </HStack>
                    </Box>
                  )}
                </RouterLink>
              ))}
            </VStack>
          )}
        </VStack>
      </Box>

      {/* Right: details pane placeholder (Step 3) */}
      {taskId ? (
        <Box w="360px" borderWidth="1px" rounded="md" p={4} bg="white">
          <HStack justify="space-between" mb={2}>
            <Heading size="md">Details</Heading>
            <RouterLink to={`/lists/${listId}`}>
              {() => <Button as="span" size="sm" variant="ghost">Close</Button>}
            </RouterLink>
          </HStack>

          {!selected ? (
            <Text color="gray.600">Task not found.</Text>
          ) : (
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
          )}
        </Box>
      ) : null}
    </Flex>
  );
}