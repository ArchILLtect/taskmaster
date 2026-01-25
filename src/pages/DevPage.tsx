import { Heading, Text, VStack } from "@chakra-ui/react";
import { GraphQLSmokeTest } from "../dev/GraphQLSmokeTest";
import { useDevPageData } from "./useDevPageData";
import { BasicSpinner } from "../components/ui/BasicSpinner";

export function DevPage() {

  const { loading } = useDevPageData();

  if (loading) return <BasicSpinner />;

  return (
    <VStack align="start" gap={2} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
      <Heading size="md">Dev</Heading>
      <Text>This page is for development and testing purposes.</Text>
      {import.meta.env.DEV ? <GraphQLSmokeTest /> : null}
    </VStack>
  );
}