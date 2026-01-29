import { Button, HStack, Spacer, Text } from "@chakra-ui/react";
import { RouterLink } from "../components/RouterLink";

export function BottomBar({
  signedIn,
  onSignOut,
}: {
  signedIn: boolean;
  onSignOut?: () => void;
}) {
  return (
    <HStack px={4} py={2} borderTopWidth="1px" bg="white">
      <Text fontSize="sm" color="gray.600">
        TaskMaster
      </Text>
      <Spacer />

      <HStack gap={3}>
        <Button asChild size="sm" variant="ghost">
          <a href="https://nickhanson.me" target="_blank" rel="noreferrer">
            Showcase Site
          </a>
        </Button>

        {signedIn ? (
          <Button size="sm" variant="outline" onClick={onSignOut}>
            Sign out
          </Button>
        ) : (
          <RouterLink to="/login">
            {() => (
              <Button as="span" size="sm" variant="outline">
                Sign in
              </Button>
            )}
          </RouterLink>
        )}
      </HStack>
    </HStack>
  );
}
