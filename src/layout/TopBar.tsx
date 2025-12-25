import { HStack, Heading, Spacer, Badge, Button, Box } from "@chakra-ui/react";
import { RouterLink } from "../components/RouterLink";
import type { User } from "../types";
import { IoSettingsSharp } from "react-icons/io5";

type TopBarProps = {
  user?: User | null;
  onSignOut?: () => void;
};

export function TopBar({ user, onSignOut }: TopBarProps) {
  return (
    <HStack px={4} py={3} borderBottomWidth="1px" bg="white" boxShadow="sm">
      <Heading size="lg">{"< TaskMaster />"}</Heading>
      <Spacer />

      <HStack gap={3}>
        {user ? (
          <>
            {/* Username link to Profile */}
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
                    {user.username}
                </Box>
            )}
            </RouterLink>

            {/* Role indicator (Badge is simplest/most stable) */}
            {user.role ? <Badge rounded="md">{user.role}</Badge> : null}

            {/* Optional sign out later */}
            {onSignOut ? (
              <Button size="sm" variant="outline" onClick={onSignOut}>
                Sign out
              </Button>
            ) : null}
          </>
        ) : (
          <Button size="sm" variant="solid">
            Sign in
          </Button>
        )}
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
      </HStack>
    </HStack>
  );
}