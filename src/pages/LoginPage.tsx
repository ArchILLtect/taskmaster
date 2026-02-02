import { Authenticator } from "@aws-amplify/ui-react";
import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";
import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BasicSpinner } from "../components/ui/BasicSpinner";
import { Tip } from "../components/ui/Tip";

function sanitizeRedirect(raw: string | null): string {
  if (!raw) return "/today";
  if (!raw.startsWith("/")) return "/today";
  if (raw.startsWith("//")) return "/today";
  if (raw.includes("://")) return "/today";
  return raw;
}

export function LoginPage({ signedIn, authLoading }: { signedIn: boolean; authLoading: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTarget = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return sanitizeRedirect(params.get("redirect"));
  }, [location.search]);

  const intent = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("intent");
  }, [location.search]);

  useEffect(() => {
    if (!signedIn) return;
    navigate(redirectTarget, { replace: true });
  }, [navigate, redirectTarget, signedIn]);

  if (authLoading) return <BasicSpinner />;

  return (
    <VStack align="start" gap={4} minH="100%" p={4} bg="white" justify={"center"} alignItems={"center"} rounded="md" boxShadow="sm">
      <Heading size="2xl">Login</Heading>

      <Tip storageKey="tip:login-redirect" title="Tip">
        If you were sent here from a shared link, just sign in — you’ll be redirected back to the page you were trying
        to open.
      </Tip>

      {intent === "demo" ? (
        <Box p={3} bg="purple.50" borderWidth="1px" borderColor="purple.200" rounded="md" w="100%">
          <Text fontWeight="600">Try Demo</Text>
          <Text color="gray.700" fontSize="sm">
            Demo mode (one-click demo user creation) is planned next. For now, use the normal login flow.
          </Text>
        </Box>
      ) : null}

      {signedIn ? (
        <VStack align="start" gap={2} w="100%">
          <Text>You’re already signed in.</Text>
          <Button colorPalette="green" onClick={() => navigate(redirectTarget)}>
            Continue
          </Button>
        </VStack>
      ) : (
        <Authenticator />
      )}
    </VStack>
  );
}
