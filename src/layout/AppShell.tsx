import { Outlet } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/react";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar.tsx";
import { ErrorBoundary } from "./ErrorBoundary.tsx";

const TOPBAR_H = "64px";

export function AppShell({ user, onSignOut }: { user?: any; onSignOut?: () => void }) {
  // TEMP: mocked user until Amplify Auth is wired
  
  return (
    <Flex direction="column" h="100vh" bg="gray.50" overflow={"hidden"} className="AppShell">

      {/* Top Bar stays fixed at the top */}
      <Box h={TOPBAR_H} flexShrink={0}>
        <TopBar onSignOut={onSignOut} user={user} />
      </Box>

      {/* Body: sidebar + main */}
      <Flex flex="1" minH={0} overflow={"hidden"}>
        {/* Sidebar stays visible, its own scroll if needed */}
        <Box
          flexShrink={0}
          h="100%"
          overflowY="auto"
          borderRightWidth="1px"
        >
          <Sidebar />
        </Box>

        {/* Main area is the primary scroll container */}
        <Box flex="1" minW={0} h="100%" overflow="auto" className="Main">
          <ErrorBoundary title="Page Crashed">
            <Outlet />
          </ErrorBoundary>
        </Box>
      </Flex>
    </Flex>
  );
}