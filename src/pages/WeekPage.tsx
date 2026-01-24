import { Heading, Text, VStack, Center, Spinner } from "@chakra-ui/react";
import { useWeekPageData } from "./useWeekPageData";

export function WeekPage() {
  const { loading } = useWeekPageData();

  // Add a spinner for loading state
  if (loading) {
    return (
      <Center width={"100%"} height={"75vh"}>
        <Spinner size={"xl"} />
      </Center>
    );
  }

  return (
    <VStack align="start" gap={2} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
      <Heading size="md">Week</Heading>
      <Text>Scheduled tasks due this week will appear here.</Text>
    </VStack>
  );
}
