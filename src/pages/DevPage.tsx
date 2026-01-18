import { Heading, Text, VStack } from "@chakra-ui/react";
import { GraphQLSmokeTest } from "../dev/GraphQLSmokeTest";

export function DevPage() {
  return (
    <VStack align="start" gap={2} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
      <Heading size="md">Dev</Heading>
      <Text>This page is for development and testing purposes.</Text>
      {import.meta.env.DEV ? <GraphQLSmokeTest /> : null}
    </VStack>
  );
}