import { VStack, Heading, Text } from "@chakra-ui/react";
import { SidebarItem } from "../components/SidebarItem";
import { listService } from "../services/listService";

export const ListSelectorPage = () => {
  const lists = listService.getAll();

  return (
    <VStack align="start" gap={2} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
      <Heading size="lg">Lists</Heading>
      <Text>Select a list to view its tasks.</Text>

      {lists.length > 0 ? (
        <VStack align="stretch" gap={1}>
          {lists.map((l) => (
            <SidebarItem key={l.id} to={`/lists/${l.id}`} label={l.name} />
          ))}
        </VStack>
      ) : (
        <Text>No lists available. Create a new list to get started.</Text>
      )}
    </VStack>
  );
}