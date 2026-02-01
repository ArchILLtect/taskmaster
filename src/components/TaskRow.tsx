import { Box, HStack, VStack, Text, Badge, Button, Flex } from "@chakra-ui/react";
import { IoRefreshCircleOutline, IoCheckmarkCircleOutline, IoTrash } from "react-icons/io5";
import { RouterLink } from "./RouterLink";
import { Tooltip } from "./ui/Tooltip";
import { SendTaskToInboxButton } from "./buttons/SendTaskToInboxButton"
import type { TaskUI, TaskRowProps } from "../types";
import { TaskStatus } from "../API";
import { getInboxListId } from "../config/inboxSettings";
import { useMemo } from "react";

export const TaskRow = ({ task, list, to, showLists, onMove, onToggleComplete, onDelete }: TaskRowProps) => {

  const inboxListId = useMemo(() => getInboxListId(), []);

  const isOffLimits = task.listId === (inboxListId ?? "");

  const onComplete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const nextStatus =
      task.status === TaskStatus.Done ? TaskStatus.Open : TaskStatus.Done;

    await onToggleComplete?.(task.id, nextStatus);
  };

  const onDeleteClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    await onDelete?.(task.id);
  };

  const handleSendToInbox = async (e: React.MouseEvent<HTMLButtonElement>, task: TaskUI) => {
    e.preventDefault();
    e.stopPropagation();

    await onMove?.(task);
    // fireToast("success", "Task sent to Inbox", "The task has been moved to your Inbox.");
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
            <Box w={"40%"}>
              <Text fontWeight="700">{task.title}</Text>
              {task.description ? (
                <Text color="gray.600" lineClamp={1}>
                  {task.description}
                </Text>
              ) : null}
            </Box>
            <SendTaskToInboxButton
              task={task}
              isActive={isActive}
              onSend={handleSendToInbox}
              disabled={isOffLimits}
            />
            <HStack align="center" gap={1}>
              {showLists ? (
                <Box w="150px" textAlign="right" truncate>
                  <Badge fontSize="sm" color="gray.500">
                    <Text>
                      {list.name || "Unknown List"}
                    </Text>
                  </Badge>
                </Box>
              ) : null}

              <VStack align="end" gap={1} w="75px">
                {task.isDemo ? <Badge colorScheme="purple">Demo</Badge> : null}
                <Badge>{task.priority}</Badge>
                <Badge variant="outline">{task.status}</Badge>
              </VStack>

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
                  <Flex gap={1} w="50px" flexDirection="column" alignItems="end">
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