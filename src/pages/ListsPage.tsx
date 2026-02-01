import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Badge,
  Input,
  Select,
  Collapsible,
  useListCollection,
} from "@chakra-ui/react";
import { FiChevronDown } from "react-icons/fi";
import { useListsPageData } from "./useListsPageData";
import { ListRow } from "../components/ListRow";
import { useEffect, useMemo, useState } from "react";
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

type Option<T extends string> = { label: string; value: T };

type ListFilterKey = "all" | "favorites";
type ListSortKey = "sortOrder" | "name" | "favorite" | "updated";

const LIST_FILTER_OPTIONS: Option<ListFilterKey>[] = [
  { label: "All lists", value: "all" },
  { label: "Favorites", value: "favorites" },
];

const LIST_SORT_OPTIONS: Option<ListSortKey>[] = [
  { label: "Manual (sort order)", value: "sortOrder" },
  { label: "Name", value: "name" },
  { label: "Favorite (first)", value: "favorite" },
  { label: "Recently updated", value: "updated" },
];

export const ListsPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [showAddListForm, setShowAddListForm] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [draftListName, setDraftListName] = useState("");
  const [draftListDescription, setDraftListDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const [listSearch, setListSearch] = useState("");
  const [listFilter, setListFilter] = useState<ListFilterKey>("all");
  const [listSort, setListSort] = useState<ListSortKey>("sortOrder");

  const { visibleLists, loading, err, refresh } = useListsPageData();
  const { createTaskList, updateTaskList, deleteTaskListSafeById } = useTaskActions();
  const selected = visibleLists.find((l) => l.id === selectedList);
  const inboxListId = getInboxListId();

  const { collection: filterCollection } = useListCollection<Option<ListFilterKey>>({
    initialItems: LIST_FILTER_OPTIONS,
    itemToValue: (item) => item.value,
    itemToString: (item) => item.label,
  });

  const { collection: sortCollection } = useListCollection<Option<ListSortKey>>({
    initialItems: LIST_SORT_OPTIONS,
    itemToValue: (item) => item.value,
    itemToString: (item) => item.label,
  });

  const visibleListItems = useMemo(() => {
    const q = listSearch.trim().toLowerCase();

    const matchesFilter = (l: ListUI) => (listFilter === "favorites" ? l.isFavorite : true);

    const matchesSearch = (l: ListUI) => {
      if (!q) return true;
      const hay = `${l.name ?? ""} ${(l.description ?? "").toString()}`.toLowerCase();
      return hay.includes(q);
    };

    const filtered = visibleLists.filter((l) => matchesFilter(l) && matchesSearch(l));
    const decorated = filtered.map((l, idx) => ({ l, idx }));

    decorated.sort((a, b) => {
      const la = a.l;
      const lb = b.l;

      const stableTieBreak = () => a.idx - b.idx;

      if (listSort === "sortOrder") {
        return (la.sortOrder ?? 0) - (lb.sortOrder ?? 0) || stableTieBreak();
      }

      if (listSort === "name") {
        const na = String(la.name ?? "").toLowerCase();
        const nb = String(lb.name ?? "").toLowerCase();
        return na.localeCompare(nb) || (la.sortOrder ?? 0) - (lb.sortOrder ?? 0) || stableTieBreak();
      }

      if (listSort === "favorite") {
        const fa = la.isFavorite ? 0 : 1;
        const fb = lb.isFavorite ? 0 : 1;
        return fa - fb || (la.sortOrder ?? 0) - (lb.sortOrder ?? 0) || stableTieBreak();
      }

      // listSort === "updated" (newest first)
      return String(lb.updatedAt ?? "").localeCompare(String(la.updatedAt ?? "")) || (la.sortOrder ?? 0) - (lb.sortOrder ?? 0) || stableTieBreak();
    });

    return decorated.map((d) => d.l);
  }, [listFilter, listSearch, listSort, visibleLists]);

  const listCounts = useMemo(() => {
    const total = visibleLists.length;
    const favorites = visibleLists.filter((l) => l.isFavorite).length;
    const showing = visibleListItems.length;

    return { total, favorites, showing };
  }, [visibleListItems, visibleLists]);

  useEffect(() => {
    // If the selected list is filtered away, hide the editor.
    if (!selectedList) return;
    if (visibleListItems.some((l) => l.id === selectedList)) return;
    setIsEditing(false);
  }, [selectedList, visibleListItems]);

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
        isDemo: false,
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
      <Flex gap={4} w="100%">
        <Box w="50%">
          <Box w="100%" mb={4}>
            <Box w="100%" mb={4}>
              <HStack justify="space-between" width="100%">
                <VStack align="start">
                  <Heading size="2xl">Lists</Heading>
                  <Text>Search, filter, sort, and manage your lists.</Text>
                  <HStack gap={2} flexWrap="wrap">
                    <Badge variant="outline">Total: {listCounts.total}</Badge>
                    <Badge variant="outline" colorPalette="yellow">
                      Favorites: {listCounts.favorites}
                    </Badge>
                    <Badge variant="solid" colorPalette="purple">
                      Showing: {listCounts.showing}
                    </Badge>
                  </HStack>
                </VStack>
              </HStack>
            </Box>

            <Collapsible.Root defaultOpen={false} w={"100%"} mb={"5"}>
              <Collapsible.Trigger asChild>
                <HStack
                  paddingRight={2}
                  cursor="pointer"
                  userSelect="none"
                  justify="space-between"
                  rounded="md"
                  _hover={{ bg: "blackAlpha.50" }}
                >
                  <Text fontSize="lg" fontWeight="600">Filters & Sorting</Text>
    
        
                  {/* rotate chevron when open */}
                  <Collapsible.Indicator asChild>
                    <Box transition="transform 150ms" _open={{ transform: "rotate(180deg)" }}>
                      <FiChevronDown />
                    </Box>
                  </Collapsible.Indicator>
                </HStack>
              </Collapsible.Trigger>
              <Collapsible.Content>

              <HStack w="100%" gap={3} flexWrap="wrap" align="end" justify="space-between">
                <HStack gap={3} flexWrap="wrap" align="end">
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Search
                    </Text>
                    <Input
                      placeholder="Search name/description"
                      value={listSearch}
                      onChange={(e) => setListSearch(e.target.value)}
                      maxW="320px"
                    />
                  </Box>

                  <Select.Root collection={filterCollection} value={[listFilter]} onValueChange={(e) => setListFilter((e.value[0] as ListFilterKey) ?? "all")}>
                    <Box>
                      <Select.Label fontSize="sm" color="gray.600" mb={1}>
                        Filter
                      </Select.Label>
                      <Select.Control bg="white" minW="220px">
                        <Select.Trigger>
                          <Select.ValueText placeholder="All lists" />
                          <Select.Indicator />
                        </Select.Trigger>
                      </Select.Control>
                      <Select.Positioner>
                        <Select.Content>
                          {filterCollection.items.map((item) => (
                            <Select.Item item={item} key={item.value}>
                              <Select.ItemText>{item.label}</Select.ItemText>
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Box>
                  </Select.Root>

                  <Select.Root collection={sortCollection} value={[listSort]} onValueChange={(e) => setListSort((e.value[0] as ListSortKey) ?? "sortOrder")}>
                    <Box>
                      <Select.Label fontSize="sm" color="gray.600" mb={1}>
                        Sort
                      </Select.Label>
                      <Select.Control bg="white" minW="220px">
                        <Select.Trigger>
                          <Select.ValueText placeholder="Manual (sort order)" />
                          <Select.Indicator />
                        </Select.Trigger>
                      </Select.Control>
                      <Select.Positioner>
                        <Select.Content>
                          {sortCollection.items.map((item) => (
                            <Select.Item item={item} key={item.value}>
                              <Select.ItemText>{item.label}</Select.ItemText>
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Box>
                  </Select.Root>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setListSearch("");
                      setListFilter("all");
                      setListSort("sortOrder");
                    }}
                  >
                    Clear
                  </Button>
                </HStack>

                <Text fontSize="sm" color="gray.600">
                  Results: {visibleListItems.length}
                </Text>
              </HStack>

              </Collapsible.Content>
            </Collapsible.Root>

            {loading ? <Text>Loading…</Text> : null}
            {err ? <Text>Failed to load lists.</Text> : null}

            {!loading && !err ? (
              visibleLists.length > 0 ? (

                <VStack align="stretch" gap={2} width={"100%"}>
                  {visibleListItems.map((l) => {
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