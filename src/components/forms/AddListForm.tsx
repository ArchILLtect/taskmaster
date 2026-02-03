import { Box, Heading, VStack, CloseButton, Input, Button, Flex } from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import type { AddListFormProps } from "../../types/list";

export const AddListForm = ({
  newListName,
  setNewListName,
  newListDescription,
  setNewListDescription,
  saving,
  onCreate,
  onCancel,
}: AddListFormProps) => {

  return (
  <Box w="100%" mt={2} p={2} bg="gray.200" rounded="md" boxShadow="inset 0 0 5px rgba(0,0,0,0.1)">
    <VStack align="start" gap={2}>
      <Flex justify="space-between" align="center" width="100%">
        <Heading size="sm" fontWeight="bold">New List</Heading>
        <CloseButton
          onClick={onCancel}
          size="xs"
        />
      </Flex>

      <Box height="1px" width="100%" bg="gray.400" />

      <FormControl isRequired width="100%">
        <Flex justify="space-between" align="center">
          <FormLabel fontSize="small" fontWeight="bold" htmlFor="list-name">Name</FormLabel>
          <Input
            minW="150px"
            maxW="200px"
            id="list-name"
            bg="white"
            placeholder="List Name"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
          />
        </Flex>
      </FormControl>
      <FormControl w="100%">
        <Flex justify="space-between" align="center" width="100%">
          <FormLabel fontSize="small" fontWeight="bold" htmlFor="list-description">Description</FormLabel>
          <Input
            minW="150px"
            maxW="200px"
            id="list-description"
            bg="white"
            placeholder="List Description (optional)"
            value={newListDescription}
            onChange={(e) => setNewListDescription(e.target.value)}
          />
        </Flex>
      </FormControl>

      <Flex justify="space-between" align="center" width="100%">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>

        <Button colorPalette="green" variant="solid" onClick={onCreate} loading={saving}>
          Create
        </Button>
      </Flex>
    </VStack>
  </Box>
  );
}