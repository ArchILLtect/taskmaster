import { Heading, Text, VStack } from "@chakra-ui/react";
import { useParams } from "react-router-dom";

export function ListPage() {
  const { listId } = useParams();

  return (
    <VStack align="start" gap={2}>
      <Heading size="md">List: {listId}</Heading>
      <Text>
        This is where tasks for this list will live (including “someday” tasks).
      </Text>
    </VStack>
  );
}