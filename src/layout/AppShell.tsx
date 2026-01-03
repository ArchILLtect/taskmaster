import { Outlet } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/react";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar.tsx";
import { currentUser } from "../mocks/currentUser.ts";

export function AppShell() {
  // TEMP: mocked user until Amplify Auth is wired
  const user = currentUser;
  return (
    <Flex direction="column" minH="100vh" bg="gray.50">
      <TopBar user={user} />
      <Flex flex="1" minH={0} w="fit-content">
        <Sidebar />
        <Box flex="1" p={4}>
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
}