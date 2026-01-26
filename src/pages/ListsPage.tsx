import { Box, Flex, VStack, HStack, Heading, Text, Button } from "@chakra-ui/react";
import { useListsPageData } from "./useListsPageData";
import { ListRow } from "../components/ListRow";
import { useState } from "react";
import { EditListForm } from "../components/EditListForm";
import { AddListForm } from "../components/AddListForm";
import { getInboxListId, isInboxList } from "../config/inboxSettings";
import { fireToast } from "../hooks/useFireToast";
import { Toaster } from "../components/ui/Toaster";
import type { ListUI } from "../types";
import { SYSTEM_INBOX_NAME } from "../config/inboxSettings";
import { BasicSpinner } from "../components/ui/BasicSpinner";
import { useTaskActions } from "../store/taskStore";

function nextSortOrder(lists: ListUI[]) {
  const max = lists.reduce((acc, t) => Math.max(acc, t.sortOrder ?? 0), 0);

  return max + 1;
}

export const ListsPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [showAddListForm, setShowAddListForm] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [draftListName, setDraftListName] = useState("");
  const [draftListDescription, setDraftListDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const { visibleLists, loading, err, refresh } = useListsPageData();
  const { createTaskList, updateTaskList, deleteTaskListSafeById } = useTaskActions();
  const selected = visibleLists.find((l) => l.id === selectedList);
  const inboxListId = getInboxListId();

  const handleCreate = async () => {

    const trimmed = newListName.trim();
    const isInvalidName =
      !trimmed ||
      trimmed === SYSTEM_INBOX_NAME;
    
    if (saving || isInvalidName) {
      // Toast notification for unimplemented feature
      fireToast("error", "List not created", (saving ? "Please wait until the current save is complete." : "List name is invalid.")  );
      return;
    };

    setSaving(true);
    try {
      await createTaskList({
        name: trimmed || "Untitled List",
        isFavorite: false,
        sortOrder: nextSortOrder(visibleLists),
        // description: newListDescription,
      });
      setShowAddListForm(false);

      // Fire toast notification for unimplemented feature
      await fireToast("success", "List Created", "The new list has been successfully created.");

    } catch (error) {
      // Fire toast notification for unimplemented feature
      await fireToast("error", "Creation Failed", "There was an error creating the list. Please try again. Error:" + (error instanceof Error ? error.message : String(error)));
      setSaving(false);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!selected) return;

    const trimmed = draftListName.trim();
    const isInvalidName =
      !trimmed ||
      trimmed === SYSTEM_INBOX_NAME
    ;

    if (saving || isInvalidName) {
      // Toast notification for unimplemented feature
      fireToast("error", "List not saved", (saving ? "Please wait until the current save is complete." : "List name is invalid.")  );
      return;
    };

    try {
      setSaving(true);
      await updateTaskList({
        id: selected.id,
        name: draftListName.trim() || "Untitled List",
        // description: draftDescription,
      });
      setIsEditing(false);
      // Fire toast notification for unimplemented feature
      await fireToast("success", "List Saved", "Your changes have been saved successfully.");
    } catch (error) {
      // Fire toast notification for unimplemented feature
      await fireToast("error", "Save Failed", "There was an error saving the list. Please try again. Error details: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteList = async (listId: string) => {
    const list = visibleLists.find(l => l.id === listId);
    
    if (!list || !listId) return;
    if (isInboxList(list, inboxListId)) return;

    try {
      await deleteTaskListSafeById(listId);
      await fireToast("info", "List Deleted", "The list has been successfully deleted.");
    } catch (error) {
      console.error("Failed to delete list:", error);
      await fireToast("error", "Failed to delete list", "An error occurred while deleting the list.");
      return;
    }
  };

  const onToggleFavorite = async (listId: string, isFavorite: boolean) => {
    const list = visibleLists.find(l => l.id === listId);

    if (!list || !listId || isFavorite === undefined) return;
    if (isInboxList(list, inboxListId)) return;

    await updateTaskList({ id: listId, isFavorite });

    // Fire toast notification for unimplemented feature
    await fireToast("warning", "Favorite Toggled", `The list has been ${isFavorite ? "added to" : "removed from"} favorites.`);
  };

  const prepAddListForm = () => {
    if (showAddListForm) {
      setShowAddListForm(false);
      return;
    } else {
      setShowAddListForm(!showAddListForm);
      let newListNameUnique = newListName;
      if (newListName === null || newListName === "" || newListName === ("New List")) {
        newListNameUnique = `New List--${Math.random().toString(36).substring(2, 12)}`;
      }
      setNewListName(newListNameUnique);
      setNewListDescription("");
    }
  };

  const handleListSelect = () => {
    return (listId: string) => {
      setSelectedList(listId);
    };
  };

  const handleCancel = (source: "add" | "edit") => {
    switch (source) {
      case "add":
        setNewListName("");
        setNewListDescription("");
        setShowAddListForm(false);
        break;
      case "edit":
        setDraftListName(selected?.name ?? "");
        setDraftListDescription(selected?.description ?? "");
        setIsEditing(false);
        break;
    }
    refresh();

    // Fire toast notification for canceled edit
    fireToast("success", source === "edit" ? "Edit Canceled" : "Add Canceled", "Your changes have been discarded.");
  };

  if (loading) return <BasicSpinner />;

  return (
    <VStack align="start" gap={2} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
      <Toaster />
      <Box w="100%" mb={4}>
        <HStack justify="space-between" width="100%">
          <VStack align="start">
            <Heading size="lg">Lists</Heading>
            <Text>Select a list to view its tasks.</Text>
          </VStack>
        </HStack>
      </Box>
      <Flex gap={4} w="100%">
        <Box w="50%">
          <Box w="100%" mb={4}>

            {loading ? <Text>Loading…</Text> : null}
            {err ? <Text>Failed to load lists.</Text> : null}

            {!loading && !err ? (
              visibleLists.length > 0 ? (

                <VStack align="stretch" gap={2} width={"100%"}>
                  {visibleLists.map((l) => {
                  const system = isInboxList(l, inboxListId);

                  return (
                    <ListRow
                      key={l.id}
                      list={l}
                      setSelectedList={handleListSelect()} 
                      to={`/lists/${l.id}`}
                      isActive={false}
                      isEditing={isEditing}
                      isEditable={!system}
                      setIsEditing={setIsEditing}
                      onDelete={system ? undefined : () => handleDeleteList(l.id)}
                      onToggleFavorite={system ? undefined : () => onToggleFavorite(l.id, !l.isFavorite)}
                    />
                  )})}
                </VStack>
              ) : (
                <Text>No lists available. Create a new list to get started.</Text>
              )
            ) : null}
          </Box>

          <>
            {!showAddListForm ? (
              <Button
                bg="green.200"
                variant="outline"
                onClick={() => prepAddListForm()}
              > Add New List</Button>
              ) : null}

            {showAddListForm && (
              <AddListForm
                newListName={newListName}
                newListDescription={newListDescription}
                setNewListName={setNewListName}
                setNewListDescription={setNewListDescription}
                saving={saving}
                onCreate={handleCreate}
                onCancel={() => handleCancel("add")}
              />
            )}
          </>
        </Box>
        <Box w="50%">
          {isEditing &&
            <EditListForm
              list={selected}
              draftName={draftListName}
              setDraftName={setDraftListName}
              draftDescription={draftListDescription}
              setDraftDescription={setDraftListDescription}
              saving={saving}
              onSave={handleSave}
              onCancel={() => handleCancel("edit")}
            />
          }
        </Box>
      </Flex>
    </VStack>
  );
};