import { Button, Code, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { GraphQLSmokeTest } from "../dev/GraphQLSmokeTest";
import { useDevPageData } from "./useDevPageData";
import { BasicSpinner } from "../components/ui/BasicSpinner";
import { Toaster } from "../components/ui/Toaster";
import { fireToast } from "../hooks/useFireToast";
import { isCacheFresh, useTaskStoreView, useTaskActions } from "../store/taskStore";

export function DevPage() {

  const { loading } = useDevPageData();
  const { lastLoadedAtMs } = useTaskStoreView();
  const { expireTaskCache, refreshAll } = useTaskActions();

  const fresh = isCacheFresh(lastLoadedAtMs);

  if (loading) return <BasicSpinner />;

  return (
    <VStack align="start" gap={2} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
      <Toaster />
      <Heading size="md">Dev</Heading>
      <Text>This page is for development and testing purposes.</Text>

      <VStack align="start" gap={2} w="100%" p={3} bg="gray.50" rounded="md" borderWidth="1px">
        <Heading size="sm">Task cache (taskmaster:taskStore)</Heading>
        <Text color="gray.700">
          lastLoadedAtMs: <Code>{typeof lastLoadedAtMs === "number" ? String(lastLoadedAtMs) : "(none)"}</Code> —
          fresh: <Code>{String(fresh)}</Code>
        </Text>
        <HStack gap={2} flexWrap="wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              expireTaskCache();
              fireToast("success", "Task cache expired", "lastLoadedAtMs set to 0 (stale). Reload to test hydrate+refresh.");
            }}
          >
            Expire task cache
          </Button>
          <Button
            size="sm"
            colorPalette="blue"
            variant="solid"
            onClick={async () => {
              expireTaskCache();
              await refreshAll();
              fireToast("success", "Refreshed", "Cache expired and refreshAll completed.");
            }}
          >
            Expire + refresh now
          </Button>
        </HStack>
      </VStack>

      {import.meta.env.DEV ? <GraphQLSmokeTest /> : null}
    </VStack>
  );
}