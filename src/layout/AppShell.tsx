import { Outlet } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/react";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar.tsx";

export function AppShell() {
  // TEMP: mocked user until Amplify Auth is wired
  const username = "NickHansonSr";
  const roleLabel: "Admin" | "User" = "Admin";

  return (
    <Flex direction="column" minH="100vh">
      <TopBar username={username} roleLabel={roleLabel} />

      <Flex flex="1" minH={0}>
        <Sidebar />
        <Box flex="1" p={4} overflow="auto">
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
}