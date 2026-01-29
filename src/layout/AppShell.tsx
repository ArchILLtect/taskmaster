import { Outlet, useLocation } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/react";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar.tsx";
import { ErrorBoundary } from "./ErrorBoundary.tsx";
import type { AuthUserLike } from "../types";
import { useBootstrapTaskStore } from "../hooks/useBootstrapTaskStore";
import { useBootstrapUserProfile } from "../hooks/useBootstrapUserProfile";
import { BottomBar } from "./BottomBar";

const TOPBAR_H = "64px";
const BOTTOMBAR_H = "52px";

export function AppShell({
  user,
  onSignOut,
  signedIn,
}: {
  user?: AuthUserLike | null;
  onSignOut?: () => void;
  signedIn: boolean;
}) {
  const location = useLocation();

  const isPublicRoute =
    location.pathname === "/" ||
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/about");

  useBootstrapUserProfile(user);
  useBootstrapTaskStore({ enabled: signedIn });

  return (
    <Flex direction="column" h="100vh" bg="gray.50" overflow={"hidden"} className="AppShell">

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
          <Sidebar variant={isPublicRoute ? "public" : "app"} />
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