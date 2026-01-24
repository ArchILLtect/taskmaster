import { Box, HStack, Text, Button, Flex } from "@chakra-ui/react";
import { IoTrash, IoStar, IoStarSharp } from "react-icons/io5";
import { RouterLink } from "./RouterLink";
import { Tooltip } from "./ui/Tooltip";
import type { ListRowProps } from "../types";

export const ListRow = ({ list, setSelectedList, to, isEditable, isEditing, setIsEditing, onDelete, onToggleFavorite }: ListRowProps) => {

  const onToggleFavoriteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(list.id, !list.isFavorite);
  }

  const onDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(list.id);
  };

  const onEditingClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing?.(!isEditing);
    setSelectedList?.(list.id);
  };

  return (
    <RouterLink key={list.id} to={to}>
      {({ isActive }) => (
        <Box
          borderWidth="1px"
          rounded="md"
          p={3}
          bg={isActive ? "blue.50" : "white"}
          borderLeft={isActive ? "4px solid" : undefined}
          borderColor="blue.400"                    
          _hover={{ bg: "blue.100" }}
        >
          <HStack justify="space-between" align="start">
            <Box>
              <Text fontWeight="700">{list.name}</Text>
              {list.description ? (
                <Text color="gray.600" lineClamp={1}>
                  {list.description}
                </Text>
              ) : (
                <Text color="gray.600" lineClamp={1}>
                  No description
                </Text>
              )}
            </Box>

            <HStack align="center" gap={1}>
              <Box border="none" padding="0">
                  <HStack align="center" gap={4}>
                  <Flex gap={1} w="50px" flexDirection="column" alignItems="end">
                    <Tooltip content="Delete list">
                      <Button
                        bg="red.100"
                        h="32px"
                        w="33px"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        onClick={onDeleteClick}
                        variant="ghost"
                      >
                        <IoTrash size="24px" color="red" />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Favorite/Unfavorite List">
                      <Button
                        bg="yellow.100"
                        h="32px"
                        w="33px"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        onClick={onToggleFavoriteClick}
                        variant="ghost"
                      >
                        {list.isFavorite ? <IoStarSharp size="24px" color="gold" /> : <IoStar size="24px" color="gray" />}
                      </Button>
                    </Tooltip>
                  </Flex>
                  {isEditable && (
                  <Flex gap={1} flexDirection="column" alignItems="end">
                    <Tooltip content="Edit list">
                      <Button size="sm" variant="outline" onClick={onEditingClick}>
                        {isEditing ? "Hide Edit" : "Edit"}
                      </Button>
                    </Tooltip>
                  </Flex>
                  )}
                  </HStack>
              </Box>
            </HStack>
          </HStack>
        </Box>
      )}
    </RouterLink>
  );
}