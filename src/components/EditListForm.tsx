import { useEffect } from "react";
import {
  Box,
  Heading,
  VStack,
  CloseButton,
  Input,
  Button,
  Flex,
} from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import type { EditListFormProps } from "../types/list";

export const EditListForm = ({
  list,
  draftName,
  setDraftName,
  draftDescription,
  setDraftDescription,
  saving,
  onSave,
  onCancel,
}: EditListFormProps) => {

  useEffect(() => {
    if (!list) return;
    setDraftName(list.name ?? "");
    setDraftDescription(list.description ?? "");
  }, [list?.id]); // only when list changes

  return (
  <Box w="100%" p={2} bg="gray.200" rounded="md" boxShadow="inset 0 0 5px rgba(0,0,0,0.1)">
    <VStack align="start" gap={2}>
      <Flex justify="space-between" align="center" width="100%">
        <Heading size="sm" fontWeight="bold">Edit List</Heading>
        <CloseButton
          onClick={onCancel}
          size="xs"
        />
      </Flex>

      <div style={{height: "1px", width: "100%", backgroundColor: "gray"}} />

      <FormControl isRequired width="100%">
        <Flex justify="space-between" align="center">
          <FormLabel fontSize="small" fontWeight="bold" htmlFor="list-title">Title</FormLabel>
          <Input
            minW="150px"
            maxW="200px"
            id="list-title"
            bg="white"
            placeholder="List Title"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
          />
        </Flex>
      </FormControl>
      <FormControl w="100%">
        <Flex display="flex" justify="space-between" align="center" width="100%">
          <FormLabel fontSize="small" fontWeight="bold" htmlFor="list-description">Description</FormLabel>
          <Input
            minW="150px"
            maxW="200px"
            id="list-description"
            bg="white"
            placeholder="List Description (optional)"
            value={draftDescription}
            onChange={(e) => setDraftDescription(e.target.value)}
          />
        </Flex>
      </FormControl>

      <Flex justify="space-between" align="center" width="100%">
        <Button variant="ghost" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>

        <Button colorScheme="green" onClick={onSave} loading={saving}>
          Save
        </Button>
      </Flex>
    </VStack>
  </Box>
  );
}