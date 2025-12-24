import { HStack, Heading, Spacer, Badge, Button, Box } from "@chakra-ui/react";
import { RouterLink } from "../components/RouterLink";
import type { User } from "../types";

type TopBarProps = {
  user?: User | null;
  onSignOut?: () => void;
};

export function TopBar({ user, onSignOut }: TopBarProps) {
  return (
    <HStack px={4} py={3} borderBottomWidth="1px">
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
      </HStack>
    </HStack>
  );
}