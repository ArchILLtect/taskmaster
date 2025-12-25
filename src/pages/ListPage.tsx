import { Heading, Text, VStack } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { SidebarItem } from "../components/SidebarItem";
import { mockLists } from "../mocks/lists";

export function ListPage() {
  const { listId } = useParams();

  if (!listId) {
    return (
      <VStack align="start" gap={2}>
        <Heading size="lg">Lists</Heading>
        <Text>Select a list to view its tasks.</Text>
        {mockLists.length > 0 && (
          <VStack align="stretch" gap={1}>
            {mockLists.map((l) => (
              <SidebarItem key={l.id} to={`/lists/${l.id}`} label={l.name} />
            ))}
          </VStack>
        )}
        {mockLists.length === 0 && (
          <Text>
            No lists available. Create a new list to get started.
          </Text>
        )}
      </VStack>
    );
  }

  return (
    <VStack align="start" gap={2}>
      <Heading size="lg">List: {listId}</Heading>
      <Text>
        This is where tasks for this list will live (including “someday” tasks).
      </Text>
    </VStack>
  );
}