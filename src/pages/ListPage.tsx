import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Badge
} from "@chakra-ui/react";
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

  const { stack } = parseTaskStackFromPath(location.pathname);

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

  // (recommended) only top-level tasks in main list:
  const topLevelTasks = tasksInList
    .filter((t) => t.parentTaskId == null)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const closeAll = () => navigate(buildTaskStackPath(listId, []));

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

          {topLevelTasks.length === 0 ? (
            <Text>No tasks yet. Add your first one ✍️</Text>
          ) : (
            <VStack align="stretch" gap={2} w="100%" mt={2}>
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
      {stack.map((taskId) => (
        <TaskDetailsPane
          key={taskId}
          listId={listId}
          taskId={taskId}
          stack={stack}
          tasksInList={tasksInList}
          onCloseAll={closeAll}
        />
      ))}
    </Flex>
  );
}