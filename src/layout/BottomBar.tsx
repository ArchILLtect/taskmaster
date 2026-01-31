import { useEffect, useMemo, useState } from "react";
import { Button, CloseButton, Dialog, HStack, Portal, Spacer, Text, VStack } from "@chakra-ui/react";
import { RouterLink } from "../components/RouterLink";
import { isDemoSessionActive } from "../services/demoSession";
import { resetDemoData } from "../services/resetDemoData";
import { fireToast } from "../hooks/useFireToast";
import { fetchAuthSession } from "aws-amplify/auth";

export function BottomBar({
  signedIn,
  onSignOut,
}: {
  signedIn: boolean;
  onSignOut?: () => void;
}) {
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [isDemoIdentity, setIsDemoIdentity] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!signedIn) {
      setIsDemoIdentity(false);
      return;
    }

    void (async () => {
      try {
        const session = await fetchAuthSession();
        const payload = session.tokens?.idToken?.payload as Record<string, unknown> | undefined;

        const groupsRaw = payload?.["cognito:groups"];
        const groups = Array.isArray(groupsRaw) ? groupsRaw.map(String) : [];

        const roleRaw = payload?.["custom:role"];
        const role = typeof roleRaw === "string" ? roleRaw : "";

        const next = groups.includes("Demo") || role === "Demo";
        if (!cancelled) setIsDemoIdentity(next);
      } catch {
        // Best-effort only.
        if (!cancelled) setIsDemoIdentity(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  const showReset = useMemo(() => {
    if (!signedIn) return false;
    // Prefer durable identity markers when available, but keep the session flag
    // for the "first token might miss groups" timing gotcha.
    return isDemoIdentity || isDemoSessionActive();
  }, [signedIn, isDemoIdentity]);

  return (
    <HStack px={4} py={2} borderTopWidth="1px" bg="white">
      <Text fontSize="sm" color="gray.600">
        TaskMaster
      </Text>
      <Spacer />

      <HStack gap={3}>
        {showReset ? (
          <Button
            size="sm"
            variant="outline"
            colorPalette="red"
            onClick={() => {
              setResetError(null);
              setIsResetOpen(true);
            }}
            disabled={resetting}
          >
            Reset demo data
          </Button>
        ) : null}

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

      <Dialog.Root lazyMount open={isResetOpen} onOpenChange={(e) => setIsResetOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header paddingX={4} paddingTop={4} paddingBottom={2}>
                <Dialog.Title>Reset demo data?</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body paddingX={4} paddingY={2}>
                <VStack align="start" gap={2}>
                  <Text>
                    This will delete your demo tasks and lists and restore the original seeded demo dataset.
                  </Text>
                  <Text color="gray.600" fontSize="sm">
                    The system inbox list is preserved, but its tasks will be cleared. Local Inbox + Updates state is
                    also cleared.
                  </Text>
                  {resetError ? (
                    <Text color="red.600" fontSize="sm">
                      {resetError}
                    </Text>
                  ) : null}
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (resetting) return;
                      setIsResetOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                </Dialog.ActionTrigger>
                <Button
                  colorPalette="red"
                  loading={resetting}
                  onClick={async () => {
                    if (resetting) return;
                    setResetting(true);
                    setResetError(null);
                    try {
                      await resetDemoData();
                      setIsResetOpen(false);
                      void fireToast("success", "Demo reset", "Demo lists and tasks were restored.");
                    } catch (err) {
                      const msg =
                        typeof err === "object" && err !== null && "message" in err
                          ? String((err as { message: unknown }).message)
                          : "Failed to reset demo data.";
                      setResetError(msg);
                      void fireToast("error", "Reset failed", msg);
                    } finally {
                      setResetting(false);
                    }
                  }}
                >
                  Reset
                </Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton
                  aria-label="Close"
                  onClick={() => {
                    if (resetting) return;
                    setIsResetOpen(false);
                  }}
                />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </HStack>
  );
}
