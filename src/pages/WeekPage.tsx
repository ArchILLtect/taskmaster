import { Heading, Text, VStack } from "@chakra-ui/react";

export function WeekPage() {
  return (
    <VStack align="start" gap={2}>
      <Heading size="md">Week</Heading>
      <Text>Scheduled tasks due this week will appear here.</Text>
    </VStack>
  );
}
