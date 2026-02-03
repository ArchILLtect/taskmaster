import { Outlet } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/react";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar.tsx";
import { ErrorBoundary } from "./ErrorBoundary.tsx";
import type { AuthUserLike } from "../types";
import { useBootstrapTaskStore } from "../hooks/useBootstrapTaskStore";
import { useBootstrapUserProfile } from "../hooks/useBootstrapUserProfile";
import { BottomBar } from "./BottomBar";
import { PublicSidebar } from "./PublicSidebar.tsx";
import { BasicSpinner } from "../components/ui/BasicSpinner";
import { Toaster } from "../components/ui/Toaster";

const TOPBAR_H = "64px";
const BOTTOMBAR_H = "52px";

export function AppShell({
  user,
  onSignOut,
  signedIn,
  authLoading,
}: {
  user?: AuthUserLike | null;
  onSignOut?: () => void;
  signedIn: boolean;
  authLoading: boolean;
}) {

  useBootstrapUserProfile(user);
  useBootstrapTaskStore({ enabled: signedIn, authKey: user?.username || user?.userId || null });

  return (
    <Flex direction="column" h="100vh" bg="gray.50" overflow={"hidden"} className="AppShell">
      <Toaster />

      {/* Top Bar stays fixed at the top */}
      <Box h={TOPBAR_H} flexShrink={0}>
        <TopBar user={user} />
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
          {authLoading ? (
            <Box w={"25vh"} h="100%">
              <BasicSpinner height="100%" width="100%" size="md" />
            </Box>
          ) : signedIn ? (
            <Sidebar />
          ) : (
            <PublicSidebar />
          )}
        </Box>

        {/* Main area is the primary scroll container */}
        <Box flex="1" minW={0} h="100%" overflow="auto" className="Main">
          <ErrorBoundary title="Page Crashed">
            <Outlet />
          </ErrorBoundary>
        </Box>
      </Flex>

      <Box h={BOTTOMBAR_H} flexShrink={0}>
        <BottomBar signedIn={signedIn} onSignOut={onSignOut} />
      </Box>
    </Flex>
  );
}