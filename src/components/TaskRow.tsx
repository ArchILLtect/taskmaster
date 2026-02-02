import { Box, HStack, VStack, Text, Badge, Button, Grid } from "@chakra-ui/react";
import { IoRefreshCircleOutline, IoCheckmarkCircleOutline, IoTrash } from "react-icons/io5";
import { RouterLink } from "./RouterLink";
import { Tooltip } from "./ui/Tooltip";
import { SendTaskToInboxButton } from "./buttons/SendTaskToInboxButton"
import type { TaskUI, TaskRowProps } from "../types";
import { TaskStatus } from "../API";
import { getInboxListId } from "../config/inboxSettings";

export const TaskRow = ({ task, list, to, showLists, onMove, onToggleComplete, onDelete }: TaskRowProps) => {

  const inboxListId = getInboxListId();

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
            <Box minW={"0"} w={"40%"}>
              <Text fontWeight="700" truncate>{task.title}</Text>
              {task.description ? (
                <Text color="gray.600" lineClamp={1}>
                  {task.description}
                </Text>
              ) : null}
            </Box>
            <HStack align="center" gap={1}>
              {showLists ? (
                <VStack w="150px" textAlign="right" truncate>
                  <Badge fontSize="sm" color="gray.500">
                    <Text>
                      {list.name || "Unknown List"}
                    </Text>
                  </Badge>
                  <Badge fontSize="sm" color="gray.500">
                    <Text>
                      {task.dueAt ? new Date(task.dueAt).toLocaleString() : "Anytime"}
                    </Text>
                  </Badge>
                </VStack>
              ) : null}

              <VStack align="end" gap={1} w="75px">
                {task.isDemo ? <Badge colorScheme="purple">Demo</Badge> : null}
                <Badge>{task.priority}</Badge>
                <Badge variant="outline">{task.status}</Badge>
              </VStack>

              <Box border="none" padding="0">
                {task.status === TaskStatus.Done ? (
                  <Box width="84px" height="68px" justifyItems="center" alignContent="center">
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
                        <IoRefreshCircleOutline color="blue" />
                      </Button>
                    </Tooltip>
                  </Box>
                ) : (
                  <Grid gap={1} templateColumns='repeat(2, 1fr)'>
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
                        <IoCheckmarkCircleOutline color="green" />
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
                        <IoTrash color="red" />
                      </Button>
                    </Tooltip>
                    <SendTaskToInboxButton
                      task={task}
                      isActive={isActive}
                      onSend={handleSendToInbox}
                      disabled={isOffLimits}
                    />
                  </Grid>
                )}
              </Box>
            </HStack>
          </HStack>
        </Box>
      )}
    </RouterLink>
  );
}