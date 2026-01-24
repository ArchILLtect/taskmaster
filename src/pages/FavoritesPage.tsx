import { VStack, HStack, Box, Flex, Heading, Text, Center, Spinner } from "@chakra-ui/react";
import { useListsPageData } from "./useListsPageData";
import { ListRow } from "../components/ListRow";
import { taskmasterApi } from "../api/taskmasterApi";
import { getInboxListId, isInboxList } from "../config/inboxSettings";
import { fireToast } from "../hooks/useFireToast";
import { Toaster } from "../components/ui/Toaster";
import { DialogModal } from "../components/ui/DialogModal";
import { useState } from "react";

export function FavoritesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [favorite, setFavorite] = useState<{ id: string; isFavorite: boolean }>({ id: "", isFavorite: true });
  const { visibleFavorites, loading, refresh } = useListsPageData();
  const inboxListId = getInboxListId();

  const handleDeleteList = async (listId: string) => {   
    const list = visibleFavorites.find(l => l.id === listId);
    if (!list || !listId) return;
    if (isInboxList(list, inboxListId)) return;

    try {
    await taskmasterApi.deleteTaskListSafeById(listId);
    } catch (error) {
      console.error("Error deleting list:", error);
      fireToast("error", "Error deleting list", "There was an issue deleting the list.");
    } finally {
      console.log("List deleted successfully.");
      // Fire toast notification for list deletion
      fireToast("info", "List Deleted", "The list has been successfully deleted.");
      refresh();
    }
  };

  const confirmUnfavorite = (id: string, isFavorite: boolean) => {
    console.log("Opening unfavorite dialog for list:", id);
    console.log("Current favorite status:", isFavorite);
    setFavorite({ id, isFavorite });
    setIsDialogOpen(true);
  }

  const handleUnFavorite = async (listId?: string, isFavorite?: boolean) => {
    const list = visibleFavorites.find(l => l.id === listId);

    if (!list || !listId || isFavorite === undefined) return;
    if (isInboxList(list, inboxListId)) return;

    const reverseFavorite = !isFavorite;

    try {
      await taskmasterApi.updateTaskList({
        id: listId,
        isFavorite: reverseFavorite
      });
    } catch (error) {
      console.error("Error updating favorite status:", error);
      fireToast("error", "Error updating favorite", "There was an issue updating the favorite status.");
    } finally {
      console.log("Favorite status updated successfully.");
      // Fire toast notification for favorite toggle
      fireToast("warning", "Favorite Toggled", `The list has been ${reverseFavorite ? "added to" : "removed from"} favorites.`);
      refresh();
    }
  };

  const acceptUnfavorite = async (id?: string, isFavorite?: boolean) => {
    console.log("Accepting unfavorite for list:", id);
    const list = visibleFavorites.find(l => l.id === id);
    if (!list || !id || isFavorite === undefined) return;
    if (isInboxList(list, inboxListId)) return;
    await handleUnFavorite(id, isFavorite)
    setIsDialogOpen(false);
  }

  const cancelUnfavorite = () => {
    setIsDialogOpen(false);
  }

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