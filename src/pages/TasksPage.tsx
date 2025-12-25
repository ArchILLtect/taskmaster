import { Box, Flex, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { mockTasks } from "../mocks/tasks";
import { TaskRow } from "../components/TaskRow";

export function TasksPage() {
  
  return (
    <VStack minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
      <Flex w="100%" gap={4}>
        <Heading size="md">Tasks</Heading>
        {/* TODO: add icon here */}
        <Text>View, sort, and manage all your tasks in one place.</Text>
        <HStack gap={2} align="start" justify="space-between" w="100%" px={2}>
          <Heading size="sm" w="150px">Task Name & Details</Heading>
          <HStack align="center" gap={1}>
            <Heading size="sm" w="100px" textAlign="right">List</Heading>
            <Heading size="sm" w="100px" textAlign="right">Priority & Status</Heading>
          </HStack>
        </HStack>
      </Flex>
      {mockTasks.length === 0 ? (
        <Text>No tasks available.</Text>
      ) : (
        <VStack align="stretch" gap={2} w="100%">
          {mockTasks.map((task) => (
            <Box key={task.id}>
              <TaskRow task={task} to={`/lists/${task.listId}/tasks/${task.id}`} showLists={true} />
            </Box>
          ))}
        </VStack>
      )}

    </VStack>
  );
}