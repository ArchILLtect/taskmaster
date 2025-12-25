import { Heading, Text, VStack } from "@chakra-ui/react";

export function InboxPage() {
  return (
    <VStack align="start" gap={2}>
      <Heading size="md">Inbox</Heading>
      {/* TODO: add icon here */}
      <Text>Manage all new and incoming tasks -- create, move, schedule, and prioritize them.</Text>
    </VStack>
  );
}
