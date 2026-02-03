import { Box, Flex, Heading, Icon } from "@chakra-ui/react"
import { Tooltip } from "./Tooltip";
import { FcHighPriority } from "react-icons/fc";


export const OverdueHeader = () => {
  return (
    <Flex align="center">
      <Tooltip content="Tasks that are past their due date." bg="red.400" colorScheme="tomato" placement="right" p={1} rounded="2xl" showArrow>
        <Box display="flex" alignItems="center">
          <Icon as={FcHighPriority} boxSize={6} mr={2} />
          <Heading size="xl" fontWeight={"700"} color={"red.600"}>Overdue</Heading>
          <Icon as={FcHighPriority} boxSize={6} ml={2} />
        </Box>
      </Tooltip>
    </Flex>
  )
}