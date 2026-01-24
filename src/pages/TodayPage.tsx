import { Heading, Text, VStack, Center, Spinner } from "@chakra-ui/react";
import { useTodayPageData } from "./useTodayPageData";

export function TodayPage() {
  
  const { loading } = useTodayPageData();

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
      <Heading size="md">Today</Heading>
      <Text>Scheduled tasks due today will appear here.</Text>
    </VStack>
  );
}
