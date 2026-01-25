import { Heading, Text, VStack } from "@chakra-ui/react";
import { useMonthPageData } from "./useMonthPageData";
import { BasicSpinner } from "../components/ui/BasicSpinner";

export function MonthPage() {

  const { loading } = useMonthPageData();

  if (loading) return <BasicSpinner />;

  return (
    <VStack align="start" gap={2} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
      <Heading size="md">Month</Heading>
      <Text>Scheduled tasks due this month will appear here.</Text>
    </VStack>
  );
}
