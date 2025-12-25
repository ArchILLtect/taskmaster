import { Box, HStack, VStack, Text, Badge } from "@chakra-ui/react";
import { RouterLink } from "./RouterLink";
import type { Task } from "../types";
import { mockLists } from "../mocks/lists";



export const TaskRow = ({ task, to, showLists }: { task: Task; to: string; showLists?: boolean }) => {
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
                    {mockLists.find((l) => l.id === task.listId)?.name ?? task.listId}
                  </Badge>
                </Box>
              ) : null}

              <VStack align="end" gap={1} w="75px">
                <Badge>{task.priority}</Badge>
                <Badge variant="outline">{task.status}</Badge>
              </VStack>
            </HStack>
          </HStack>
        </Box>
      )}
    </RouterLink>
  );
}