import { Box, Button, HStack, Text, VStack } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isDemoSessionActive } from "../../services/demoSession";
import { userScopedGetItem, userScopedSetItem } from "../../services/userScopedStorage";
import { DialogModal } from "./DialogModal";

const DEMO_TOUR_SEEN_KEY = "demoTourSeen:v1" as const;

export function DemoTourModal({ signedIn }: { signedIn: boolean }) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  const shouldOffer = useMemo(() => {
    if (!signedIn) return false;
    if (!isDemoSessionActive()) return false;
    return userScopedGetItem(DEMO_TOUR_SEEN_KEY) !== "1";
  }, [signedIn]);

  const open = shouldOffer && !dismissed;
  const setOpen = (next: boolean) => {
    if (!next) setDismissed(true);
  };

  if (!signedIn) return null;

  return (
    <DialogModal
      title="Demo quick tour"
      body={
        <VStack align="start" gap={3}>
          <Text color="gray.700">
            Here’s a ~60 second walkthrough you can use for a showcase.
          </Text>

          <Box bg="gray.50" borderWidth="1px" borderColor="gray.200" rounded="md" p={3} w="100%">
            <VStack align="start" gap={2}>
              <Text fontWeight="700">Suggested script</Text>
              <VStack align="start" gap={1}>
                <Text fontSize="sm" color="gray.700">
                  1) Inbox triage indicators + quick actions
                </Text>
                <Text fontSize="sm" color="gray.700">
                  2) Lists → open a list and click tasks (pane-stack URL)
                </Text>
                <Text fontSize="sm" color="gray.700">
                  3) Edit a task → change parent (manual reparent)
                </Text>
                <Text fontSize="sm" color="gray.700">
                  4) Settings → demo data tools
                </Text>
              </VStack>
            </VStack>
          </Box>

          <HStack gap={2} flexWrap="wrap">
            <Button size="sm" variant="outline" onClick={() => navigate("/inbox")}>
              Go to Inbox
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate("/lists")}>
              Go to Lists
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate("/settings")}>
              Go to Settings
            </Button>
          </HStack>
        </VStack>
      }
      open={open}
      setOpen={setOpen}
      acceptLabel="Got it"
      acceptColorPalette="purple"
      acceptVariant="solid"
      cancelLabel="Close"
      cancelVariant="outline"
      onAccept={() => {
        userScopedSetItem(DEMO_TOUR_SEEN_KEY, "1");
        setDismissed(true);
      }}
      onCancel={() => {
        userScopedSetItem(DEMO_TOUR_SEEN_KEY, "1");
        setDismissed(true);
      }}
    />
  );
}
