import { Authenticator } from "@aws-amplify/ui-react";
import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { signIn } from "aws-amplify/auth";
import { BasicSpinner } from "../components/ui/BasicSpinner";
import { DemoConfirmDialog } from "../components/ui/DemoConfirmDialog";
import { Tip } from "../components/ui/Tip";
import { createDemoCredentials } from "../services/demoAuthService";
import { clearDemoSessionActive, setDemoSessionActive } from "../services/demoSession";
import { useDefaultLandingRoute } from "../store/localSettingsStore";

function sanitizeRedirect(raw: string | null, fallback: string): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//")) return fallback;
  if (raw.includes("://")) return fallback;
  // Avoid loops / confusing flows.
  if (raw === "/login") return fallback;
  return raw;
}

export function LoginPage({ signedIn, authLoading }: { signedIn: boolean; authLoading: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const defaultLandingRoute = useDefaultLandingRoute();

  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);
  const [demoDialogOpen, setDemoDialogOpen] = useState(false);

  const redirectTarget = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return sanitizeRedirect(params.get("redirect"), defaultLandingRoute);
  }, [defaultLandingRoute, location.search]);

  const intent = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("intent");
  }, [location.search]);

  useEffect(() => {
    if (!signedIn) return;
    navigate(redirectTarget, { replace: true });
  }, [navigate, redirectTarget, signedIn]);

  const onTryDemo = async () => {
    if (demoLoading) return;

    setDemoLoading(true);
    setDemoError(null);

    try {
      const creds = await createDemoCredentials();
      setDemoSessionActive();
      await signIn({ username: creds.username, password: creds.password });
      navigate(redirectTarget || defaultLandingRoute || "/today", { replace: true });
    } catch (err) {
      clearDemoSessionActive();
      const message =
        typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to create demo account.";
      setDemoError(message);
    } finally {
      setDemoLoading(false);
    }
  };

  if (authLoading) return <BasicSpinner />;

  return (
    <VStack align="start" gap={4} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm" w="100%">
      <VStack p={4} align="start" bg="gray.50" rounded="md" boxShadow="sm" w="100%" h="87.5vh" gap={3}>
        <Heading size="2xl">Login</Heading>

        <Tip storageKey="tip:login-redirect" title="Tip">
          If you were sent here from a shared link, just sign in — you’ll be redirected back to the page you were trying
          to open.
        </Tip>

        {!signedIn ? (
          <Box
            p={3}
            bg={intent === "demo" ? "purple.50" : "gray.50"}
            borderWidth="1px"
            borderColor={intent === "demo" ? "purple.200" : "gray.200"}
            rounded="md"
            w="100%"
          >
            <Text fontSize="xl" fontWeight="700" mb={3}>Try Demo (No Signup)</Text>
            <Text fontSize="sm">
              Demo mode: one click creates a temporary demo user, signs you in, and seeds data.
            </Text>
            <Text fontSize="sm">
              No signup. No email. Takes ~5 seconds.
            </Text>
            <Text fontSize="sm" mb={3}>
              Local state is scoped per user to prevent cross-account mixing on shared browsers.
            </Text>
            <Button
              size="sm"
              colorPalette="purple"
              onClick={() => {
                setDemoError(null);
                setDemoDialogOpen(true);
              }}
              loading={demoLoading}
              disabled={demoLoading}
            >
              {demoLoading ? "Creating demo account…" : "Start demo"}
            </Button>
            {demoError ? (
              <Box mt={3} p={3} bg="red.50" borderWidth="1px" borderColor="red.200" rounded="md">
                <Text fontWeight="600" color="red.800">
                  Demo sign-in failed
                </Text>
                <Text fontSize="sm" color="red.700">
                  {demoError}
                </Text>
              </Box>
            ) : null}
          </Box>
        ) : null}

        <VStack justifyContent="center" align="center" h="90%" w="100%">
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
      </VStack>

      {!signedIn ? (
        <DemoConfirmDialog
          open={demoDialogOpen}
          setOpen={setDemoDialogOpen}
          loading={demoLoading}
          error={demoError}
          onConfirm={async () => {
            await onTryDemo();
          }}
        />
      ) : null}
    </VStack>
  );
}
