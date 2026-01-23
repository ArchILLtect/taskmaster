import { VStack, HStack, Box, Flex, Heading, Text } from "@chakra-ui/react";
import { useListsPageData } from "./useListsPageData";
import { ListRow } from "../components/ListRow";
import { taskmasterApi } from "../api/taskmasterApi";
import { getInboxListId, isInboxList } from "../config/inboxSettings";
import { fireToast } from "../hooks/useFireToast";
import { Toaster } from "../components/ui/Toaster";
import { DialogModal } from "../components/ui/DialogModal";
import { useState } from "react";
import { isInboxListId } from "../lists/listVisibility";

export function FavoritesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [favorite, setFavorite] = useState<{ id: string; isFavorite: boolean }>({ id: "", isFavorite: true });
  const { visibleFavorites, refresh } = useListsPageData();
  const inboxListId = getInboxListId();

  const handleDeleteList = async (listId: string) => {   
    const list = visibleFavorites.find(l => l.id === listId);
    if (!list || !listId) return;
    if (isInboxListId(list.id, inboxListId)) return;

    await taskmasterApi.deleteTaskListSafeById(listId);
    await refresh();

    // Fire toast notification for unimplemented feature
    await fireToast("info", "List Deleted", "The list has been successfully deleted.");
  };

  const confirmUnfavorite = (id: string, isFavorite: boolean) => {
    console.log("Opening unfavorite dialog for list:", id);
    console.log("Current favorite status:", isFavorite);
    setFavorite({ id, isFavorite });
    setIsDialogOpen(true);
  }

  const handleUnFavorite = async (listId: string, isFavorite: boolean) => {

    console.log("Toggling favorite for list:", listId, "to", isFavorite);

    const reverseFavorite = !isFavorite;

    // Prevent changing favorite status of the inbox list
    const list = visibleFavorites.find(l => l.id === listId);
    if (!list || !listId || isFavorite === undefined) return;
    if (isInboxListId(list.id, inboxListId)) return;

    // Update favorite status
    await taskmasterApi.updateTaskList({ id: listId, isFavorite: reverseFavorite });
    await refresh();

    // Fire toast notification for unimplemented feature
    await fireToast("warning", "Favorite Toggled", `The list has been ${isFavorite ? "added to" : "removed from"} favorites.`);
  };

  const acceptUnfavorite = async (id: string, isFavorite: boolean) => {
    console.log("Accepting unfavorite for list:", id);
    await handleUnFavorite(id, isFavorite)
    setIsDialogOpen(false);
  }

  const cancelUnfavorite = () => {
    setIsDialogOpen(false);
  }

  return (
    <VStack align="start" gap={2} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
      <Toaster />
      <Box w="100%" mb={4}>
        <HStack justify="space-between" width="100%">
          <VStack align="start">
            <Heading size="md">Favorites</Heading>
            {/* TODO: add icon here */}
            <Text>Manage your favorite items for quick access and organization.</Text>
          </VStack>
        </HStack>
      </Box>
      <Flex gap={4} w="100%">
        <Box w="50%">
        {visibleFavorites.length === 0 ? (
          <Text>No favorite items found.</Text>
        ) : (
          <VStack align="stretch" gap={2} width={"100%"}>
            {visibleFavorites.map((favorite) => {
              const system = isInboxList(favorite, inboxListId);
              return (
                <ListRow
                  key={favorite.id}
                  list={favorite}
                  to={`/lists/${favorite.id}`}
                  isActive={false}
                  isEditable={false}
                  onDelete={system ? undefined : () => handleDeleteList(favorite.id)}
                  onToggleFavorite={system ? undefined : () => confirmUnfavorite(favorite.id, favorite.isFavorite)}
                />
              );
            })}
          </VStack>
        )}
        </Box>
      </Flex>
      <DialogModal
        list={favorite}
        title="Remove Favorite"
        body="Are you sure you want to remove this favorite item? This action can be undone from the lists page."
        open={isDialogOpen}
        setOpen={setIsDialogOpen}
        onAccept={acceptUnfavorite}
        onCancel={cancelUnfavorite}
      />
    </VStack>
  );
}