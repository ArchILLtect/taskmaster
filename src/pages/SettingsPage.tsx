import { Heading, Text, VStack, Center, Spinner } from "@chakra-ui/react";
import { useSettingsPageData } from "./useSettingsPageData";

export function SettingsPage() {
  
  const { loading } = useSettingsPageData();

  // Add a spinner for loading state
  if (loading) {
    return (
      <Center width={"100%"} height={"75vh"}>
        <Spinner size={"xl"} />
      </Center>
    );
  }

  return (
    <VStack align="start" gap={2} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
      <Heading size="md">Settings</Heading>
        <Text>This is the settings page for TaskMaster.</Text>
    </VStack>
  );
}