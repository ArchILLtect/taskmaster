import { Heading, Text, VStack } from "@chakra-ui/react";
import { useWeekPageData } from "./useWeekPageData";
import { BasicSpinner } from "../components/ui/BasicSpinner";

export function WeekPage() {
  const { loading } = useWeekPageData();

  if (loading) return <BasicSpinner />;

  return (
    <VStack align="start" gap={2} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
      <Heading size="2xl">Week</Heading>
      <Text>Scheduled tasks due this week will appear here.</Text>
    </VStack>
  );
}
