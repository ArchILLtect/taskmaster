import { Box, Flex, Heading, Text, VStack, HStack, Badge, Center } from "@chakra-ui/react";
import { useEffect, useState, useMemo, useRef } from "react";
import { useLocation, useNavigate, useParams, Navigate } from "react-router-dom";
import { buildTaskStackPath, nextStackOnClick, parseTaskStackFromPath } from "../routes/taskStack";
import { TaskDetailsPane } from "../components/TaskDetailsPane";

import { TaskRow } from "../components/TaskRow";
import { taskService } from "../services/taskService";

export function ListPage() {

  const [tick, setTick] = useState(0);
  const [pulseTaskId, setPulseTaskId] = useState<string | null>(null);

  const { listId } = useParams<{ listId: string }>();

  const location = useLocation();
  const navigate = useNavigate();
  const refresh = () => setTick(t => t + 1);
  
  const lastPaneRef = useRef<HTMLDivElement | null>(null);

  // This is not possible, but TypeScript doesn't know that
  if (!listId) return <Navigate to="/lists" replace />;

  const { stack } = parseTaskStackFromPath(location.pathname);
  const activeTaskId = stack.at(-1);

  const tasksInList = useMemo(() => taskService.getByListId(listId), [listId, tick]);
  const topLevelTasks = useMemo(() => taskService.getTopLevel(tasksInList), [tasksInList]);

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
    <Flex align="start" gap={4} p={4} bg="white" rounded="md" minHeight="100%" boxShadow="sm" className="ListPageMain" w="max-content">
      {/* Left: task list */}
      <Box width="40vw">
        <VStack align="start" gap={2}>
          <HStack gap={10}>
            <Heading size="lg">List:</Heading>
            <Badge variant="outline" size={"lg"}>{listId}</Badge>
          </HStack>
          <Text color="gray.600">Tasks for this list (including “someday” tasks).</Text>

          {topLevelTasks.length === 0 ? (
            <Text>No tasks yet. Add your first one ✍️</Text>
          ) : (
            <VStack align="stretch" gap={2} mt={2} width="100%">
              {topLevelTasks.map((task) => (
                task.status !== "Done" ? (
                  <Box key={task.id}>
                    <TaskRow
                      task={task}
                      to={buildTaskStackPath(listId, nextStackOnClick(stack, task.id))}
                      showLists={false}
                      onChanged={refresh}
                    />
                  </Box>
                ) : (
                  <Text>All tasks completed</Text>
                )
              ))}
            </VStack>
          )}
        </VStack>
      </Box>

      {/* Right: stacked panes */}
      {stack.length === 0 && (
        <Box h="89.5vh" bg="gray.200" rounded="md" flexShrink={0} w="38.5vw">
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