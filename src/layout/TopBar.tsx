import { HStack, Heading, Flex, Badge, Button, Box, Spinner, Text } from "@chakra-ui/react";
import { RouterLink } from "../components/RouterLink";
import type { AuthUserLike, UserUI } from "../types";
import { IoSettingsSharp } from "react-icons/io5";
import { useUserUI } from "../hooks/useUserUI";
import { useTaskStoreView } from "../store/taskStore";
import { formatUsernameForDisplay } from "../services/userDisplay";
import { useDemoMode } from "../hooks/useDemoMode";
import { useDemoTourStore } from "../store/demoTourStore";
import { Tooltip } from "../components/ui/Tooltip";
import { requestOpenWelcomeModal } from "../services/welcomeModalPreference";

type TopBarProps = {
  user?: AuthUserLike | null;
  userUI?: UserUI | null;
};

export function TopBar({ user, userUI }: TopBarProps) {
  const { userUI: hookUserUI } = useUserUI();
  const effectiveUserUI = userUI ?? hookUserUI;

  const { loading, lists, tasks } = useTaskStoreView();
  const refreshing = loading && (lists.length > 0 || tasks.length > 0);

  const authKey = user?.username ?? user?.userId;
  const userUIMatchesAuth =
    !authKey || !effectiveUserUI?.username || effectiveUserUI.username === authKey;

  const safeUserUI = userUIMatchesAuth ? effectiveUserUI : null;

  const username = authKey ?? safeUserUI?.username;
  const role = safeUserUI?.role ?? user?.role;
  const signedIn = Boolean(username);
  const isAdmin = role === "Admin";
  const { isDemo } = useDemoMode(signedIn);
  const demoTourDisabled = useDemoTourStore((s) => s.disabled);
  const openDemoTour = useDemoTourStore((s) => s.openTour);

  const displayUsername = signedIn ? formatUsernameForDisplay(username ?? null) : null;

  return (
    <HStack px={4} py={3} borderBottomWidth="1px" bg="white" position={"sticky"} minW="400px">
      <Flex justifyContent="space-between" alignItems="center" width="100%">
        <RouterLink to="/">{() => <Heading size="lg">{"< TaskMaster />"}</Heading>}</RouterLink>

        <Tooltip content="What’s new" showArrow>
          <Button
            size="sm"
            variant="ghost"
            fontWeight="600"
            color={"blue.600"}
            onClick={() => {
              requestOpenWelcomeModal();
            }}
          >
            What’s new
          </Button>
        </Tooltip>


        <HStack gap={3}>
          {refreshing ? (
            <HStack gap={2} color="gray.600">
              <Spinner size="sm" />
              <Text fontSize="sm">Refreshing…</Text>
            </HStack>
          ) : null}
          {signedIn ? (
            <>
              <RouterLink to="/profile">
              {({ isActive }) => (
                  <Box
                      px={3}
                      py={1}
                      rounded="md"
                      fontWeight="600"
                      bg={isActive ? "blackAlpha.100" : "transparent"}
                      _hover={{ bg: "blackAlpha.100" }}
                  >
                      {displayUsername}
                  </Box>
              )}
              </RouterLink>

              {isAdmin ? (
                <RouterLink to="/admin">
                  {({ isActive }) => (
                    <Badge rounded="md" bg={isActive ? "purple.100" : undefined}>
                      Admin
                    </Badge>
                  )}
                </RouterLink>
              ) : null}

              {isDemo ? (
                demoTourDisabled ? (
                  <Badge rounded="md" bg="orange.100" color="orange.800">
                    Demo Mode
                  </Badge>
                ) : (
                  <Tooltip content="Open demo tour" showArrow>
                    <Badge
                      as="button"
                      rounded="md"
                      bg="orange.100"
                      color="orange.800"
                      cursor="pointer"
                      _hover={{ bg: "orange.200" }}
                      onClick={() => {
                        openDemoTour();
                      }}
                    >
                      Demo Mode
                    </Badge>
                  </Tooltip>
                )
              ) : null}
            </>
          ) : (
            <RouterLink to="/login">{() => <Button as="span" size="sm" variant="solid">Sign in</Button>}</RouterLink>
          )}
          {signedIn ? (
            <RouterLink to={"/settings"}>
              {({ isActive }) => (
                <Button
                  as="span"
                  variant="ghost"
                  justifyContent="flex-start"
                  width="100%"
                  paddingX={2}
                  fontWeight="700"
                  color="black"
                  bg={isActive ? "blackAlpha.100" : "transparent"}
                  _hover={{ bg: "blackAlpha.100" }}
                >
                  <IoSettingsSharp />
                </Button>
              )}
            </RouterLink>
          ) : null}
        </HStack>
      </Flex>
    </HStack>
  );
}