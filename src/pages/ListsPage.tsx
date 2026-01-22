import { Box, Flex, VStack, HStack, Heading, Text, Button } from "@chakra-ui/react";
import { useListsPageData } from "./useListsPageData";
import { ListRow } from "../components/ListRow";
import { Toaster } from "../components/ui/toaster";
import { toaster } from "../components/ui/toasterInstance";
import { useState } from "react";
import { EditListForm } from "../components/EditListForm";
import { AddListForm } from "../components/AddListForm";
import { useNavigate } from "react-router-dom";
// import { taskmasterApi } from "../api/taskmasterApi";

export const ListsPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [showAddListForm, setShowAddListForm] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [draftListName, setDraftListName] = useState("");
  const [draftListDescription, setDraftListDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const { lists, loading, err, refresh } = useListsPageData();
  const selected = lists.find((l) => l.id === selectedList); // Replace ListId with actual selected list ID logic
  const navigate = useNavigate();

  const handleDeleteList = async (listId: string) => {
    if (!listId) return;

    // Toast notification
    notImplementedToast();

    // add API logic when ready
    //await taskmasterApi.deleteList({ id: listId }); // input: DeleteListInput
    await refresh();
  };

  const onToggleFavorite = async (listId: string, isFavorite: boolean) => {
    if (!listId || isFavorite === undefined) return;

    // Toast notification
    notImplementedToast();

    // add API logic when ready
    //await taskmasterApi.updateList({ id: listId, isFavorite });
    await refresh();
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

  const getSelectedList = () => {
    return (listId: string) => {
      setSelectedList(listId);
    };
  };

  const notImplementedToast = () => {
    toaster.create({
      title: "Not Implemented",
      description: "This feature is not yet implemented. Stay tuned!",
      duration: 3000,
      type: "info",
    });
  };

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
            lists.length > 0 ? (

              <VStack align="stretch" gap={1} width={"100%"}>
                {lists.map((l) => (
                  <ListRow
                    key={l.id}
                    list={l}
                    setSelectedList={getSelectedList()}
                    to={`/lists/${l.id}`}
                    isActive={false}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    onDelete={() => handleDeleteList(l.id)}
                    onToggleFavorite={() => onToggleFavorite(l.id, !l.isFavorite)}
                  />
                ))}
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
              setShowAddListForm={setShowAddListForm}
              navigate={navigate}
              refresh={refresh}
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
            setSaving={setSaving}
            setIsEditing={setIsEditing}
            onClose={() => setIsEditing(false)}
            refresh={refresh}
          />
        }
      </Box>
      </Flex>
    </VStack>
  );
};