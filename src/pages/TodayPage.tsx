import { Heading, Text, VStack } from "@chakra-ui/react";

export function TodayPage() {
  return (
    <VStack align="start" gap={2}>
      <Heading size="md">Today</Heading>
      <Text>Scheduled tasks due today will appear here.</Text>
    </VStack>
  );
}
