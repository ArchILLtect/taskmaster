import { HStack, Heading, Spacer, Badge, Button, Box, Spinner, Text } from "@chakra-ui/react";
import { RouterLink } from "../components/RouterLink";
import type { AuthUserLike, UserUI } from "../types";
import { IoSettingsSharp } from "react-icons/io5";
import { useUserUI } from "../hooks/useUserUI";
import { useTaskStoreView } from "../store/taskStore";

type TopBarProps = {
  user?: AuthUserLike | null;
  userUI?: UserUI | null;
};

export function TopBar({ user, userUI }: TopBarProps) {
  const { userUI: hookUserUI } = useUserUI();
  const effectiveUserUI = userUI ?? hookUserUI;

  const { loading, lists, tasks } = useTaskStoreView();
  const refreshing = loading && (lists.length > 0 || tasks.length > 0);

  const username = effectiveUserUI?.username ?? user?.username ?? user?.userId;
  const role = effectiveUserUI?.role ?? user?.role;
  const signedIn = Boolean(username);
  const isAdmin = role === "Admin";

  return (
    <HStack px={4} py={3} borderBottomWidth="1px" bg="white" position={"sticky"} minW="400px">
      <RouterLink to="/">{() => <Heading size="lg">{"< TaskMaster />"}</Heading>}</RouterLink>
      <Spacer />

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
                    {username}
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
    </HStack>
  );
}