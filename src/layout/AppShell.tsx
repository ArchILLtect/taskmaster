import { Outlet } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/react";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar.tsx";
import { currentUser } from "../mocks/currentUser.ts";

const TOPBAR_H = "64px";

export function AppShell() {
  // TEMP: mocked user until Amplify Auth is wired
  const user = currentUser;
  return (
    <Flex direction="column" h="100vh" bg="gray.50" overflow={"hidden"}>

      {/* Top Bar stays fixed at the top */}
      <Box h={TOPBAR_H} flexShrink={0}>
        <TopBar user={user} />
      </Box>

      {/* Body: sidebar + main */}
      <Flex flex="1" minH={0} overflow={"hidden"}>
        {/* Sidebar stays visible, its own scroll if needed */}
        <Box
          flexShrink={0}
          w="15vw"          // keep whatever you like here
          h="100%"
          overflowY="auto"
          borderRightWidth="1px"
        >
          <Sidebar />
        </Box>

        {/* Main area is the primary scroll container */}
        <Box flex="1" minW={0} h="100%" overflow="auto">
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
}