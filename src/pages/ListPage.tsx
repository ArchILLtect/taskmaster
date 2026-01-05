import { Box, Flex, Heading, Text, VStack, HStack, Badge, Center } from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { buildTaskStackPath, nextStackOnClick, parseTaskStackFromPath } from "../routes/taskStack";
import { SidebarItem } from "../components/SidebarItem";
import { TaskDetailsPane } from "../components/TaskDetailsPane";

import { TaskRow } from "../components/TaskRow";
import { mockTasks } from "../mocks/tasks";
import { mockLists } from "../mocks/lists";

export function ListPage() {

  const { listId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [pulseTaskId, setPulseTaskId] = useState<string | null>(null);

  const { stack } = parseTaskStackFromPath(location.pathname);
  const activeTaskId = stack.at(-1);

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

  const tasksInList = mockTasks.filter((t) => t.listId === listId);
  const lastPaneRef = useRef<HTMLDivElement | null>(null);

  // (recommended) only top-level tasks in main list:
  const topLevelTasks = tasksInList
    .filter((t) => t.parentTaskId == null)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const closeAll = () => navigate(buildTaskStackPath(listId, []));

  useEffect(() => {
    lastPaneRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "start",
      block: "nearest",
    });
  }, [stack.length]);

  useEffect(() => {
    if (!activeTaskId) return;

    setPulseTaskId(activeTaskId);
    const t = window.setTimeout(() => setPulseTaskId(null), 500);
    return () => window.clearTimeout(t);
  }, [activeTaskId]);

  return (
    <Flex align="start" gap={4} p={4} bg="white" rounded="md" minHeight="100%" boxShadow="sm">
      {/* Left: task list */}
      <Box flex="1" minW={"300px"}>
        <VStack align="start" gap={2}>
          <HStack gap={10}>
          <Heading size="lg">List:</Heading>
          <Badge variant="outline" size={"lg"}>{listId}</Badge>
          </HStack>
          <Text color="gray.600">Tasks for this list (including “someday” tasks).</Text>

          {topLevelTasks.length === 0 ? (
            <Text>No tasks yet. Add your first one ✍️</Text>
          ) : (
            <VStack align="stretch" gap={2} w="100%" h="100%" mt={2}>
              {topLevelTasks.map((task) => (
                <Box key={task.id}>
                  <TaskRow
                    task={task}
                    to={buildTaskStackPath(listId, nextStackOnClick(stack, task.id))}
                    showLists={false}
                  />
                </Box>
              ))}
            </VStack>
          )}
        </VStack>
      </Box>

      {/* Right: stacked panes */}
      {stack.length === 0 && (
        <Box w="40vw" h="89.5vh" bg="gray.200" rounded="md" flexShrink={0}>
          <Center color="gray.600" mt={10} ml={4}>Select a task to view details.</Center>
        </Box>
      )}
      {stack.map((taskId, idx) => (
        <TaskDetailsPane
          key={taskId}
          listId={listId}
          ref={idx === stack.length - 1 ? lastPaneRef : undefined}
          taskId={taskId}
          stack={stack}
          tasksInList={tasksInList}
          onCloseAll={closeAll}
          isPulsing={pulseTaskId === taskId}
        />
      ))}
    </Flex>
  );
}