import { Heading, Text, VStack } from "@chakra-ui/react";
import { useTodayPageData } from "./useTodayPageData";
import { BasicSpinner } from "../components/ui/BasicSpinner";

export function TodayPage() {
  
  const { loading } = useTodayPageData();

  if (loading) return <BasicSpinner />;

  return (
    <VStack align="start" gap={2} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
      <Heading size="2xl">Today</Heading>
      <Text>Scheduled tasks due today will appear here.</Text>
    </VStack>
  );
}
