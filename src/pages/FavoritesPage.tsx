import { Heading, Text, VStack } from "@chakra-ui/react";

export function FavoritesPage() {
  return (
    <VStack align="start" gap={2}>
      <Heading size="md">Favorites</Heading>
      {/* TODO: add icon here */}
      <Text>Manage your favorite items for quick access and organization.</Text>
    </VStack>
  );
}
