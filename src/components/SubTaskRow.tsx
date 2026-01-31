import { Box, HStack, Text, Badge, Button, Flex } from "@chakra-ui/react";
import { IoRefreshCircleOutline, IoCheckmarkCircleOutline, IoTrash } from "react-icons/io5";
import { RouterLink } from "./RouterLink";
import { Tooltip } from "./ui/Tooltip";
import type { SubTaskRowProps } from "../types/task";
import { TaskStatus } from "../API";

export const SubTaskRow = ({ task, to, onDelete, onToggleComplete }: SubTaskRowProps) => {
  const onComplete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const nextStatus =
      task.status === TaskStatus.Done ? TaskStatus.Open : TaskStatus.Done;

    await onToggleComplete?.(task.id, nextStatus);
  };

  const onDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(task.id);
  };

  return (
    <RouterLink key={task.id} to={to}>
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
          <HStack justify="space-between" align="center">
            <Box>
              <Text fontWeight="700">{task.title}</Text>
            </Box>

            <HStack align="center" gap={1}>
              <HStack align="center" gap={1}>
                <Badge>{task.priority}</Badge>
                <Badge variant="outline">{task.status}</Badge>
              </HStack>

              <Box border="none" padding="0">
                {task.status === TaskStatus.Done ? (
                  <Tooltip content="Revive task">
                    <Button
                      bg="blue.100"
                      h="32px"
                      w="33px"
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      onClick={onComplete}
                      variant="outline"
                    >
                      <IoRefreshCircleOutline size="24px" color="blue" />
                    </Button>
                  </Tooltip>
                ) : (
                  <Flex gap={1} w="90px" flexDirection="row" justifyContent="end">
                    <Tooltip content="Mark as complete">
                      <Button
                        bg="green.100"
                        h="32px"
                        w="33px"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        onClick={onComplete}
                        variant="ghost"
                      >
                        <IoCheckmarkCircleOutline size="30px" color="green" />
                      </Button>
                    </Tooltip>

                    <Tooltip content="Delete task">
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
                  </Flex>
                )}
              </Box>
            </HStack>
          </HStack>
        </Box>
      )}
    </RouterLink>
  );
}