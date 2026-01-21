import { Box, HStack, VStack, Text, Badge, Button, Flex } from "@chakra-ui/react";
import { IoRefreshCircleOutline, IoCheckmarkCircleOutline, IoTrash } from "react-icons/io5";
import { RouterLink } from "./RouterLink";
import { Tooltip } from "./Tooltip";
import type { TaskRowProps } from "../types";
import { taskmasterApi } from "../api/taskmasterApi";
import { TaskStatus } from "../API";

export const TaskRow = ({ task, listName, to, showLists, onChanged, onDelete, onToggleComplete }: TaskRowProps) => {

  const onComplete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

  const nextStatus =
    task.status === TaskStatus.Done ? TaskStatus.Open : TaskStatus.Done;

  await taskmasterApi.updateTask({
    id: task.id,
    status: nextStatus,
    completedAt: nextStatus === TaskStatus.Done ? new Date().toISOString() : null,
  });

  await onChanged?.();
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
          <HStack justify="space-between" align="start">
            <Box>
              <Text fontWeight="700">{task.title}</Text>
              {task.description ? (
                <Text color="gray.600" lineClamp={1}>
                  {task.description}
                </Text>
              ) : null}
            </Box>

            <HStack align="center" gap={1}>
              {showLists ? (
                <Box w="75px" textAlign="right">
                  <Badge fontSize="sm" color="gray.500">
                    {listName || "Unknown List"}
                  </Badge>
                </Box>
              ) : null}

              <VStack align="end" gap={1} w="75px">
                <Badge>{task.priority}</Badge>
                <Badge variant="outline">{task.status}</Badge>
              </VStack>
              <Box border="none" padding="0">
                {task.status === "Done" ? (
                  <Tooltip content="Revive task">
                    <Button bg={"blue.100"} height={"32px"} width={"33px"} justifyContent={"center"} alignItems={"center"} display={"flex"} onClick={onComplete} variant="outline">
                        <IoRefreshCircleOutline size="24px" color="blue" />
                    </Button>
                  </Tooltip>
                ) : (
                  <Flex gap={1} w="50px" flexDirection={"column"} alignItems={"end"}>
                    <Tooltip content="Mark as complete">
                      <Button bg={"green.100"} height={"32px"} width={"33px"} justifyContent={"center"} alignItems={"center"} display={"flex"} onClick={onComplete} variant={"ghost"}>
                            <IoCheckmarkCircleOutline size="30px" color="green" />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Delete task">
                    <Button bg={"red.100"} height={"32px"} width={"33px"} justifyContent={"center"} alignItems={"center"} display={"flex"} onClick={onDeleteClick} variant={"ghost"}>
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