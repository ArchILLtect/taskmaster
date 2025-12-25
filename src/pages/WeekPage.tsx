import { Heading, Text, VStack } from "@chakra-ui/react";

export function WeekPage() {
  return (
    <VStack align="start" gap={2} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
      <Heading size="md">Week</Heading>
      <Text>Scheduled tasks due this week will appear here.</Text>
    </VStack>
  );
}
