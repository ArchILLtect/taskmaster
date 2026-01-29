import { Badge, Box, Button, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export function HomePage({ signedIn }: { signedIn: boolean }) {
  const navigate = useNavigate();

  return (
    <VStack align="stretch" gap={6} minH="100%" p={4}>
      <Box
        p={8}
        bg="white"
        rounded="md"
        boxShadow="sm"
        borderWidth="1px"
        borderColor="gray.200"
      >
        <VStack align="start" gap={4}>
          <HStack gap={3} align="center">
            <Badge colorPalette="purple" variant="solid">
              Portfolio build
            </Badge>
            <Badge variant="outline">Amplify + AppSync</Badge>
            <Badge variant="outline">Zustand</Badge>
          </HStack>

          <Heading size="xl">TaskMaster</Heading>
          <Text color="gray.600" fontSize="lg" maxW="2xl">
            A fast, store-driven task app prototype with deep-linkable task navigation, local cache + TTL refresh,
            and a guided Admin console for cross-user inspection.
          </Text>

          <HStack gap={3} pt={2} flexWrap="wrap">
            {!signedIn ? (
              <Button
                size="lg"
                colorPalette="purple"
                onClick={() => navigate("/login?intent=demo")}
              >
                Try Demo (No Signup)
              </Button>
            ) : null}

            <Button
              size="lg"
              variant={signedIn ? "solid" : "outline"}
              colorPalette={signedIn ? "green" : undefined}
              onClick={() => navigate(signedIn ? "/today" : "/login")}
            >
              {signedIn ? "Go to your tasks" : "Sign in / Create account"}
            </Button>

            <Button size="lg" variant="ghost" onClick={() => navigate("/about")}
            >
              About
            </Button>
          </HStack>

          {!signedIn ? (
            <Box pt={2} color="gray.600">
              <Text fontSize="sm">
                Demo mode is the next planned feature: one click creates a temporary demo user and signs you in.
              </Text>
            </Box>
          ) : null}
        </VStack>
      </Box>

      <HStack gap={4} align="stretch" flexWrap="wrap">
        <Box flex="1" minW="280px" p={5} bg="white" rounded="md" boxShadow="sm">
          <Heading size="md" mb={2}>
            Pane-stack navigation
          </Heading>
          <Text color="gray.600">
            List details use a URL-encoded “pane stack” so task context is shareable and refresh-safe.
          </Text>
        </Box>

        <Box flex="1" minW="280px" p={5} bg="white" rounded="md" boxShadow="sm">
          <Heading size="md" mb={2}>
            Store-driven UI
          </Heading>
          <Text color="gray.600">
            Reads go through Zustand selectors; writes go through store actions → GraphQL wrapper → AppSync.
          </Text>
        </Box>

        <Box flex="1" minW="280px" p={5} bg="white" rounded="md" boxShadow="sm">
          <Heading size="md" mb={2}>
            Fast reloads
          </Heading>
          <Text color="gray.600">
            A persisted local cache with TTL renders immediately and refreshes in the background.
          </Text>
        </Box>
      </HStack>
    </VStack>
  );
}
