import { Heading, Text, VStack } from "@chakra-ui/react";

export function UpdatesPage() {
  return (
    <VStack align="start" gap={2} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
      <Heading size="md">Updates</Heading>
      {/* TODO: add icon here */}
      <Text>Newly received updates from tasks, messages, and lists.</Text>
      {/* TODO: add a filter for: all, tasks, messages, lists */}
    </VStack>
  );
}