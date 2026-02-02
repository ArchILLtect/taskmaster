import { useMemo, useState } from "react";
import { Button, HStack, Spacer, Text, VStack } from "@chakra-ui/react";
import { RouterLink } from "../components/RouterLink";
import { resetDemoData } from "../services/resetDemoData";
import { fireToast } from "../hooks/useFireToast";
import { useDemoMode } from "../hooks/useDemoMode";
import { DialogModal } from "../components/ui/DialogModal";

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
  const { isDemo } = useDemoMode(signedIn);

  const showReset = useMemo(() => {
    if (!signedIn) return false;
    return isDemo;
  }, [signedIn, isDemo]);

  const handleAcceptResetDemoData = async () => {
    if (resetting) return;

    setResetting(true);
    setResetError(null);

    try {
      await resetDemoData();
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
  };

  return (
    <HStack px={4} py={2} borderTopWidth="1px" bg="white">
      <Text fontSize="sm" color="gray.600">
        TaskMaster
      </Text>
      <Spacer />
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

      <DialogModal
        title="Reset demo data?"
        body={
          <VStack align="start" gap={2}>
            <Text>
              This will delete your demo tasks and lists and restore the original seeded demo dataset.
            </Text>
            <Text color="gray.600" fontSize="sm">
              The system inbox list is preserved, but its tasks will be cleared. Local Inbox + Updates state is also
              cleared.
            </Text>
            {resetError ? (
              <Text color="red.600" fontSize="sm">
                {resetError}
              </Text>
            ) : null}
          </VStack>
        }
        open={isResetOpen}
        setOpen={setIsResetOpen}
        onCancel={() => {
          setResetError(null);
          setIsResetOpen(false);
        }}
        onAccept={handleAcceptResetDemoData}
        acceptLabel="Reset"
        cancelLabel="Cancel"
        acceptColorPalette="red"
        acceptVariant="solid"
        loading={resetting}
        disableClose={resetting}
      />
    </HStack>
  );
}
