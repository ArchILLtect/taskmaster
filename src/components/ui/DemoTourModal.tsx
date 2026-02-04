import { Box, Button, Checkbox, HStack, Text, VStack } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDemoMode } from "../../hooks/useDemoMode";
import { useDemoTourStore } from "../../store/demoTourStore";
import { DialogModal } from "./DialogModal";

export function DemoTourModal({ signedIn }: { signedIn: boolean }) {
  const navigate = useNavigate();
  const [dismissedThisSession, setDismissedThisSession] = useState(false);
  const [dontShowAgainChecked, setDontShowAgainChecked] = useState(false);

  const { isDemo } = useDemoMode(signedIn);

  const openRequested = useDemoTourStore((s) => s.open);
  const setOpenRequested = useDemoTourStore((s) => s.setOpen);
  const disabled = useDemoTourStore((s) => s.disabled);
  const refreshDisabledFromStorage = useDemoTourStore((s) => s.refreshDisabledFromStorage);
  const setDisabled = useDemoTourStore((s) => s.setDisabled);

  useEffect(() => {
    if (!signedIn) return;
    refreshDisabledFromStorage();
  }, [refreshDisabledFromStorage, signedIn]);

  const shouldOffer = useMemo(() => {
    if (!signedIn) return false;
    if (!isDemo) return false;
    return !disabled;
  }, [disabled, isDemo, signedIn]);

  const open = (shouldOffer && !dismissedThisSession) || (shouldOffer && openRequested);
  const setOpen = (next: boolean) => {
    // Only close from the explicit Accept action.
    // Ignore overlay clicks / escape / close triggers.
    if (!next) return;
    setOpenRequested(true);
  };

  if (!signedIn) return null;
  if (!shouldOffer) return null;

  return (
    <DialogModal
      title="Demo quick tour"
      body={
        <VStack align="start" gap={3}>
          <Text color="gray.700">
            A short walkthrough you can use for a showcase. Demo accounts are throw-away: when you’re done,
            sign out and create a regular account for real use.
          </Text>

          <Box bg="orange.50" borderWidth="1px" borderColor="orange.200" rounded="md" p={3} w="100%">
            <Text fontSize="sm" color="orange.900" fontWeight={700}>
              Demo account note
            </Text>
            <Text fontSize="sm" color="orange.900">
              This account is meant for temporary evaluation only. Use Settings → Demo Data to reset/clear demo items
              anytime.
            </Text>
          </Box>

          <Box bg="gray.50" borderWidth="1px" borderColor="gray.200" rounded="md" p={3} w="100%">
            <VStack align="start" gap={2}>
              <Text fontWeight="700">Recommended steps</Text>

              <VStack align="start" gap={3} w="100%">
                <Box w="100%">
                  <Text fontSize="sm" color="gray.800" fontWeight={700}>
                    1) Inbox = triage and quick actions
                  </Text>
                  <Text fontSize="sm" color="gray.700">
                    The Inbox is a staging area for new work. Today it’s tasks; later it can grow into collaboration
                    items. “Triage” here means deciding what to do next: keep it, complete it, delete it, or move it
                    into a list.
                  </Text>
                  <Text fontSize="sm" color="gray.700">
                    Try: look for overdue/due-soon indicators, then use row actions (complete/revive, delete, send to
                    Inbox). Snooze is not implemented yet (ignore now → snooze later).
                  </Text>
                  <Button mt={2} size="sm" variant="outline" onClick={() => navigate("/inbox")}>
                    Go to Inbox
                  </Button>
                </Box>

                <Box w="100%">
                  <Text fontSize="sm" color="gray.800" fontWeight={700}>
                    2) Lists + pane-stack task details
                  </Text>
                  <Text fontSize="sm" color="gray.700">
                    Open a list, then click a task. The right side opens task details. Click another task to “stack”
                    panes; the URL encodes the stack so refresh/share keeps context.
                  </Text>
                  <Button mt={2} size="sm" variant="outline" onClick={() => navigate("/lists")}>
                    Go to Lists
                  </Button>
                </Box>

                <Box w="100%">
                  <Text fontSize="sm" color="gray.800" fontWeight={700}>
                    3) Manual reparenting (subtasks)
                  </Text>
                  <Text fontSize="sm" color="gray.700">
                    Pick a task, click Edit, then change the Parent field to move it under another task (or clear the
                    parent to make it top-level). This demonstrates hierarchy without drag-and-drop yet.
                  </Text>
                  <Button mt={2} size="sm" variant="outline" onClick={() => navigate("/tasks")}>
                    Go to Tasks
                  </Button>
                </Box>

                <Box w="100%">
                  <Text fontSize="sm" color="gray.800" fontWeight={700}>
                    4) Settings + demo tools
                  </Text>
                  <Text fontSize="sm" color="gray.700">
                    Settings includes general knobs (like the Inbox due-soon window) and demo-only tools.
                  </Text>
                  <Text fontSize="sm" color="gray.700">
                    Demo tools: Clear demo data (remove demo-marked items), Reset demo data (restore the seeded demo
                    dataset), and “Add more demo data” for bigger lists.
                  </Text>
                  <Button mt={2} size="sm" variant="outline" onClick={() => navigate("/settings")}>
                    Go to Settings
                  </Button>
                </Box>
              </VStack>
            </VStack>
          </Box>

          <HStack gap={2} w="100%" justify="space-between" align="center">
            <Checkbox.Root
              checked={dontShowAgainChecked}
              onCheckedChange={(details) => {
                setDontShowAgainChecked(details.checked === true);
              }}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label>
                <Text fontSize="sm">Don’t display again</Text>
              </Checkbox.Label>
            </Checkbox.Root>

            <Text fontSize="xs" color="gray.600">
              You can re-enable this in Settings.
            </Text>
          </HStack>
        </VStack>
      }
      open={open}
      setOpen={setOpen}
      acceptLabel="Close"
      acceptColorPalette="purple"
      acceptVariant="solid"
      hideCancelButton
      hideCloseButton
      disableClose
      onAccept={() => {
        if (dontShowAgainChecked) {
          setDisabled(true);
        }
        setOpenRequested(false);
        setDismissedThisSession(true);
      }}
      onCancel={() => {
        // no-op (modal only closes via Accept)
      }}
      closeOnAccept
    />
  );
}
