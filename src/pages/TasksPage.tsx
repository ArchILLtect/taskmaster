import { Box, Heading, HStack, Text, VStack, Button } from "@chakra-ui/react";
import { TaskRow } from "../components/TaskRow";
import { useMemo, useState } from "react";
import { taskService } from "../services/taskService";

export function TasksPage() {

  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [tick, setTick] = useState(0);
  const tasks = useMemo(() => taskService.getAll(), [tick]);
  const refresh = () => setTick(t => t + 1);
  
  return (
    <VStack minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
      <VStack w="100%" gap={4} align="start">
        <HStack justify="space-between" w="100%">
          <VStack align="start" gap={2}>
            <Heading size="md">Tasks</Heading>
            {/* TODO: add icon here */}
            <Text>View, sort, and manage all your tasks in one place.</Text>
          </VStack>
          <Box>
            <Button onClick={() => setShowCompletedTasks(!showCompletedTasks)} variant="outline">
              {showCompletedTasks ? "Hide Completed Tasks" : "Show Completed Tasks"}
            </Button>
          </Box>
        </HStack>

        <HStack gap={2} align="end" justify="space-between" w="100%" px={2}>
          <Heading size="sm" w="150px">Task Name & Details</Heading>
          <HStack align="end" gap={1}>
            <Heading size="sm" w="100px" textAlign="right">List</Heading>
            <Heading size="sm" w="100px" textAlign="right">Priority & Status</Heading>
          </HStack>
        </HStack>
      </VStack>
      {!showCompletedTasks ? (
        tasks.length === 0 ? (
          <Text>No tasks available.</Text>
        ) : (
          <VStack align="stretch" gap={2} w="100%">
            {tasks.map((task) => (
              task.status !== "Done" ? (
                <Box key={task.id}>
                  <TaskRow task={task} to={`/lists/${task.listId}/tasks/${task.id}`} showLists={true} onChanged={refresh} />
                </Box>
              ) : null
            ))}
          </VStack>
        )
      ) : (
        <VStack align="stretch" gap={2} w="100%">
          {tasks.map((task) => (
            task.status === "Done" && (
              <Box key={task.id}>
                <TaskRow task={task} to={`/lists/${task.listId}/tasks/${task.id}`} showLists={true} onChanged={refresh} />
              </Box>
            )
          ))}
          
        </VStack>
      )}
    </VStack>
  );
}