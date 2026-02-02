import { Box, Button, Heading, HStack, NumberInput, Text, VStack } from "@chakra-ui/react";
import { useSettingsPageData } from "./useSettingsPageData";
import { BasicSpinner } from "../components/ui/BasicSpinner";
import { useDueSoonWindowDays, useSetDueSoonWindowDays } from "../store/localSettingsStore";
import { clearUserScopedKeysByPrefix } from "../services/userScopedStorage";
import { Tip } from "../components/ui/Tip";

export function SettingsPage() {
  
  const { loading } = useSettingsPageData();
  const dueSoonWindowDays = useDueSoonWindowDays();
  const setDueSoonWindowDays = useSetDueSoonWindowDays();

  if (loading) return <BasicSpinner />;

  return (
    <VStack align="start" gap={2} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
      <Heading size="2xl">Settings</Heading>

      <Tip storageKey="tip:settings-local" title="Tip">
        Settings and dismissed tips are stored per user in this browser. If you switch devices or clear storage, you’ll
        see onboarding tips again.
      </Tip>

      <Box pt={2} w="100%">
        <Heading size="lg">Inbox</Heading>
        <Text color="gray.600" fontSize="sm">
          Configure which tasks appear in your Inbox’s “Due soon” section.
        </Text>

        <HStack gap={3} align="center" pt={3}>
          <Text fontWeight={600}>Due soon window:</Text>
          <NumberInput.Root
            size="sm"
            width="90px"
            min={1}
            max={30}
            value={String(dueSoonWindowDays)}
            onValueChange={({ valueAsNumber }) => {
              if (!Number.isFinite(valueAsNumber)) return;
              setDueSoonWindowDays(valueAsNumber);
            }}
          >
            <NumberInput.Input />
          </NumberInput.Root>
          <Text color="gray.600" fontSize="sm">
            days
          </Text>
        </HStack>
      </Box>

      <Box pt={6} w="100%">
        <Heading size="lg">Tips</Heading>
        <Text color="gray.600" fontSize="sm">
          Tips can be dismissed and are remembered per user.
        </Text>

        <HStack pt={3} gap={3} align="center">
          <Text fontWeight={600}>Reset dismissed tips:</Text>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              clearUserScopedKeysByPrefix("tip:");
            }}
          >
            Reset Tips
          </Button>
        </HStack>
      </Box>
    </VStack>
  );
}