import { Heading, Text, VStack, Center, Spinner } from "@chakra-ui/react";
import { GraphQLSmokeTest } from "../dev/GraphQLSmokeTest";
import { useDevPageData } from "./useDevPageData";

export function DevPage() {

  const { loading } = useDevPageData();
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
      <Heading size="md">Dev</Heading>
      <Text>This page is for development and testing purposes.</Text>
      {import.meta.env.DEV ? <GraphQLSmokeTest /> : null}
    </VStack>
  );
}