import { Box, HStack, Text, Badge, Button, Flex } from "@chakra-ui/react";
import { IoRefreshCircleOutline, IoCheckmarkCircleOutline, IoTrash } from "react-icons/io5";
import { RouterLink } from "./RouterLink";
import { Tooltip } from "./Tooltip";
import type { TaskDetailsRowProps } from "../types/task";
import { taskService } from "../services/taskService";

export const TaskDetailsRow = ({ task, to, onChanged, onDelete }: TaskDetailsRowProps) => {

  const onComplete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    taskService.setStatus(task.id, task.status === "Done" ? "Open" : "Done");
    onChanged?.();
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
              <HStack align="center" gap={1} w="75px">
                <Badge>{task.priority}</Badge>
                <Badge variant="outline">{task.status}</Badge>
              </HStack>
              <Box border="none" padding="0">
                {task.status === "Done" ? (
                  <Tooltip content="Revive task">
                    <Button bg={"blue.100"} height={"32px"} width={"33px"} justifyContent={"center"} alignItems={"center"} display={"flex"} onClick={onComplete} variant="outline">
                        <IoRefreshCircleOutline size="24px" color="blue" />
                    </Button>
                  </Tooltip>
                ) : (
                  <Flex gap={1} w="90px" flexDirection={"row"} justifyContent={"end"}>
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