import { Heading, Text, VStack } from "@chakra-ui/react";

export function TodayPage() {
  return (
    <VStack align="start" gap={2} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
      <Heading size="md">Today</Heading>
      <Text>Scheduled tasks due today will appear here.</Text>
    </VStack>
  );
}
