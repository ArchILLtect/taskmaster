import { Heading, Text, VStack } from "@chakra-ui/react";

export function SettingsPage() {
  return (
    <VStack align="start" gap={2} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
      <Heading size="md">Settings</Heading>
        <Text>This is the settings page for TaskMaster.</Text>
    </VStack>
  );
}