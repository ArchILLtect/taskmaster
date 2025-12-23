import { Heading, Text, VStack } from "@chakra-ui/react";

export function MonthPage() {
  return (
    <VStack align="start" gap={2}>
      <Heading size="md">Month</Heading>
      <Text>Scheduled tasks due this month will appear here.</Text>
    </VStack>
  );
}
