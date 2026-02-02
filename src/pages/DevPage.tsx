import { Button, Code, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { GraphQLSmokeTest } from "../dev/GraphQLSmokeTest";
import { useDevPageData } from "./useDevPageData";
import { BasicSpinner } from "../components/ui/BasicSpinner";
import { Toaster } from "../components/ui/Toaster";
import { fireToast } from "../hooks/useFireToast";
import { isCacheFresh, useTaskStoreView, useTaskActions } from "../store/taskStore";
import { clearAllUserCaches } from "../store/clearUserCaches";
import { getUserUIResult } from "../services/authService";
import { Tip } from "../components/ui/Tip";

export function DevPage() {

  const { loading } = useDevPageData();
  const { lastLoadedAtMs } = useTaskStoreView();
  const { expireTaskCache, refreshAll } = useTaskActions();

  const fresh = isCacheFresh(lastLoadedAtMs);

  if (loading) return <BasicSpinner />;

  return (
    <VStack align="start" gap={2} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
      <Toaster />
      <Heading size="2xl">Dev</Heading>
      <Text>This page is for development and testing purposes.</Text>

      <Tip storageKey="tip:dev-cache" title="Tip">
        “Expire task cache” forces the next render to treat persisted data as stale, which is handy for testing
        hydrate+refresh behavior.
      </Tip>

      <VStack align="start" gap={2} w="100%" p={3} bg="gray.50" rounded="md" borderWidth="1px">
        <Heading size="sm">Task cache (taskmaster:taskStore)</Heading>
        <Text color="gray.700">
          lastLoadedAtMs: <Code>{typeof lastLoadedAtMs === "number" ? String(lastLoadedAtMs) : "(none)"}</Code> —
          fresh: <Code>{String(fresh)}</Code>
        </Text>
        <HStack gap={2} flexWrap="wrap">
          <Button
            size="sm"
            colorPalette="red"
            variant="outline"
            onClick={async () => {
              clearAllUserCaches();

              // Repopulate current session state so the UI updates immediately.
              // (Otherwise you often need a manual browser reload to see user metadata and tasks.)
              await Promise.all([refreshAll(), getUserUIResult()]);

              fireToast(
                "success",
                "Cleared user caches",
                "Removed taskStore/inbox/updates/user caches, refreshed tasks, and re-fetched user metadata."
              );
            }}
          >
            Clear all user caches
          </Button>
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

          {import.meta.env.DEV ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const key = "taskmaster:taskStore";
                const raw = localStorage.getItem(key);

                if (!raw) {
                  console.info(`[dev] ${key} not found in localStorage.`);
                  fireToast("info", "No persisted cache", `${key} is not present in localStorage.`);
                  return;
                }

                try {
                  const parsed = JSON.parse(raw) as unknown;
                  const envelope = parsed as { state?: unknown; version?: unknown };
                  const state = envelope?.state as Record<string, unknown> | undefined;

                  const stateKeys = state && typeof state === "object" ? Object.keys(state) : [];
                  const allowedKeys = ["lists", "tasks", "lastLoadedAtMs"];
                  const extraKeys = stateKeys.filter((k) => !allowedKeys.includes(k));

                  const listsCount = Array.isArray(state?.lists) ? state?.lists.length : null;
                  const tasksCount = Array.isArray(state?.tasks) ? state?.tasks.length : null;

                  console.log(`[dev] ${key} persist envelope`, {
                    version: envelope?.version,
                    stateKeys,
                    extraKeys,
                    listsCount,
                    tasksCount,
                    lastLoadedAtMs: state?.lastLoadedAtMs ?? null,
                    rawBytes: raw.length,
                  });

                  fireToast(
                    "success",
                    "Logged persisted cache",
                    `state keys: ${stateKeys.join(", ") || "(none)"}${extraKeys.length ? ` (extra: ${extraKeys.join(", ")})` : ""}`
                  );
                } catch (err) {
                  console.error(`[dev] Failed to parse ${key} from localStorage`, err);
                  fireToast("error", "Parse failed", `Failed to parse ${key} persisted JSON. See console.`);
                }
              }}
            >
              Log persisted keys
            </Button>
          ) : null}
        </HStack>
      </VStack>

      {import.meta.env.DEV ? <GraphQLSmokeTest /> : null}
    </VStack>
  );
}