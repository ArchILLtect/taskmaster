import { Heading, Text, VStack } from "@chakra-ui/react";
import { mockLists } from "../mocks/lists";
import { SidebarItem } from "../components/SidebarItem";


export function FavoritesPage() {
  const favorites = mockLists.filter((list) => list.isFavorite);
  return (
    <VStack align="start" gap={2} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
      <Heading size="md">Favorites</Heading>
      {/* TODO: add icon here */}
      <Text>Manage your favorite items for quick access and organization.</Text>
      {favorites.length === 0 ? (
        <Text>No favorite items found.</Text>
      ) : (
        favorites.map((favorite) => (
          <SidebarItem key={favorite.id} to={`/lists/${favorite.id}`} label={favorite.name} />
        ))
      )}
    </VStack>
  );
}
