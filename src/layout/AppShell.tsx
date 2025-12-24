import { Outlet } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/react";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar.tsx";
import { mockUser } from "../mocks/user";

export function AppShell() {
  // TEMP: mocked user until Amplify Auth is wired
  const user = mockUser;

  return (
    <Flex direction="column" minH="100vh">
      <TopBar user={user} />
      <Flex flex="1" minH={0}>
        <Sidebar />
        <Box flex="1" p={4} overflow="auto">
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
}