import { Heading, Text, VStack } from "@chakra-ui/react";

export function InboxPage() {
  return (
    <VStack align="start" gap={2} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
      <Heading size="md">Inbox</Heading>
      {/* TODO: add icon here */}
      <Text>Manage all new and incoming tasks -- create, move, schedule, and prioritize them.</Text>
    </VStack>
  );
}
