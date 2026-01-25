import { Heading, Text, VStack } from "@chakra-ui/react";
import { useSettingsPageData } from "./useSettingsPageData";
import { BasicSpinner } from "../components/ui/BasicSpinner";

export function SettingsPage() {
  
  const { loading } = useSettingsPageData();

  if (loading) return <BasicSpinner />;

  return (
    <VStack align="start" gap={2} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
      <Heading size="md">Settings</Heading>
        <Text>This is the settings page for TaskMaster.</Text>
    </VStack>
  );
}