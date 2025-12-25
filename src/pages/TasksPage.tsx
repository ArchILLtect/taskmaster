import { Heading, Text, VStack } from "@chakra-ui/react";

export function TasksPage() {
  return (
    <VStack align="start" gap={2}>
      <Heading size="md">Tasks</Heading>
      {/* TODO: add icon here */}
      <Text>View, sort, and manage all your tasks in one place.</Text>
    </VStack>
  );
}