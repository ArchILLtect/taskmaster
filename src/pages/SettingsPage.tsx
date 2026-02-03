import { Box, Button, Heading, HStack, NumberInput, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { useSettingsPageData } from "./useSettingsPageData";
import { BasicSpinner } from "../components/ui/BasicSpinner";
import {
  useDefaultViewRoute,
  useDefaultLandingRoute,
  useDueSoonWindowDays,
  useSetDefaultViewRoute,
  useSetDefaultLandingRoute,
  useSetDueSoonWindowDays,
  useSetSidebarWidthPreset,
  useSidebarWidthPreset,
  type DefaultViewRoute,
  type DefaultLandingRoute,
  type SidebarWidthPreset,
} from "../store/localSettingsStore";
import { clearUserScopedKeysByPrefix } from "../services/userScopedStorage";
import { Tip } from "../components/ui/Tip";
import { FormSelect } from "../components/forms/FormSelect";
import { useInboxActions } from "../store/inboxStore";
import { fireToast } from "../hooks/useFireToast";
import { DialogModal } from "../components/ui/DialogModal";
import {
  clearDemoDataOnly,
  resetDemoDataPreservingNonDemo,
  addMoreDemoLists,
  addMoreDemoTasks,
  addMoreDemoTasksAndLists,
} from "../services/demoDataService";

export function SettingsPage() {
  
  const { loading } = useSettingsPageData();
  const dueSoonWindowDays = useDueSoonWindowDays();
  const setDueSoonWindowDays = useSetDueSoonWindowDays();

  const sidebarWidthPreset = useSidebarWidthPreset();
  const setSidebarWidthPreset = useSetSidebarWidthPreset();

  const defaultViewRoute = useDefaultViewRoute();
  const setDefaultViewRoute = useSetDefaultViewRoute();

  const defaultLandingRoute = useDefaultLandingRoute();
  const setDefaultLandingRoute = useSetDefaultLandingRoute();

  const { clearDismissed } = useInboxActions();

  const [isResetIgnoredOpen, setIsResetIgnoredOpen] = useState(false);

  const [isClearDemoOpen, setIsClearDemoOpen] = useState(false);
  const [isResetDemoOpen, setIsResetDemoOpen] = useState(false);
  const [demoActionLoading, setDemoActionLoading] = useState<"clear" | "reset" | "addTasks" | "addLists" | "addBoth" | null>(null);
  const [demoActionError, setDemoActionError] = useState<string | null>(null);

  const [addDemoTaskCount, setAddDemoTaskCount] = useState(10);
  const [addDemoListCount, setAddDemoListCount] = useState(3);

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

        <HStack gap={3} align="center" pt={3}>
          <Text fontWeight={600}>Ignored notifications:</Text>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setIsResetIgnoredOpen(true);
            }}
          >
            Reset ignored
          </Button>
        </HStack>

        <DialogModal
          title="Reset ignored notifications?"
          body={
            <VStack align="start" gap={2}>
              <Text>
                This will clear your ignored overdue/due-soon notifications. Tasks may show up in those sections again.
              </Text>
              <Text color="gray.600" fontSize="sm">
                This does not delete tasks.
              </Text>
            </VStack>
          }
          open={isResetIgnoredOpen}
          setOpen={setIsResetIgnoredOpen}
          acceptLabel="Reset"
          acceptColorPalette="red"
          acceptVariant="solid"
          cancelLabel="Cancel"
          cancelVariant="outline"
          onAccept={() => {
            clearDismissed();
            fireToast("success", "Ignored notifications reset", "Overdue/Due soon notices will show again.");
          }}
          onCancel={() => {
            // no-op
          }}
        />
      </Box>

      <Box pt={6} w="100%">
        <Heading size="lg">Navigation</Heading>
        <Text color="gray.600" fontSize="sm">
          Customize your sidebar and default “Views” landing destination.
        </Text>

        <VStack align="stretch" gap={4} pt={3}>
          <FormSelect
            title="Sidebar width"
            items={[
              { label: "Small", value: "small" },
              { label: "Medium", value: "medium" },
              { label: "Large", value: "large" },
            ]}
            value={sidebarWidthPreset}
            onChange={(v) => setSidebarWidthPreset(v as SidebarWidthPreset)}
            helperText="Controls the fixed width of the left sidebar."
            helperMode="below"
          />

          <FormSelect
            title="Default View"
            items={[
              { label: "Today", value: "/today" },
              { label: "Week", value: "/week" },
              { label: "Month", value: "/month" },
            ]}
            value={defaultViewRoute}
            onChange={(v) => setDefaultViewRoute(v as DefaultViewRoute)}
            helperText="Used when clicking the “Views” section header in the sidebar."
            helperMode="below"
          />

          <FormSelect
            title="Post-login landing page"
            items={[
              { label: "Today", value: "/today" },
              { label: "Inbox", value: "/inbox" },
              { label: "Tasks", value: "/tasks" },
              { label: "Lists", value: "/lists" },
              { label: "Favorites", value: "/favorites" },
              { label: "Updates", value: "/updates" },
              { label: "Week", value: "/week" },
              { label: "Month", value: "/month" },
            ]}
            value={defaultLandingRoute}
            onChange={(v) => setDefaultLandingRoute(v as DefaultLandingRoute)}
            helperText="Used after signing in when no redirect target is present."
            helperMode="below"
          />
        </VStack>
      </Box>

      <Box pt={6} w="100%">
        <Heading size="lg">Demo Data</Heading>
        <Text color="gray.600" fontSize="sm">
          Manage demo lists and tasks. These actions only affect items marked as demo.
        </Text>

        <HStack pt={3} gap={3} align="center" flexWrap="wrap">
          <Button
            size="sm"
            variant="outline"
            colorPalette="red"
            onClick={() => {
              setDemoActionError(null);
              setIsClearDemoOpen(true);
            }}
            disabled={demoActionLoading !== null}
          >
            Clear demo data
          </Button>

          <Button
            size="sm"
            variant="outline"
            colorPalette="orange"
            onClick={() => {
              setDemoActionError(null);
              setIsResetDemoOpen(true);
            }}
            disabled={demoActionLoading !== null}
          >
            Reset demo data
          </Button>
        </HStack>

        <Box pt={4}>
          <Heading size="sm">Add more demo data</Heading>
          <Text color="gray.600" fontSize="sm">
            These actions only create items marked as demo.
          </Text>

          <VStack align="start" gap={3} pt={3}>
            <HStack gap={3} align="center" flexWrap="wrap">
              <Text fontWeight={600}>Tasks:</Text>
              <NumberInput.Root
                size="sm"
                width="90px"
                min={1}
                max={200}
                value={String(addDemoTaskCount)}
                onValueChange={({ valueAsNumber }) => {
                  if (!Number.isFinite(valueAsNumber)) return;
                  setAddDemoTaskCount(valueAsNumber);
                }}
              >
                <NumberInput.Input />
              </NumberInput.Root>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  if (demoActionLoading) return;
                  setDemoActionLoading("addTasks");
                  setDemoActionError(null);
                  try {
                    const res = await addMoreDemoTasks(addDemoTaskCount);
                    fireToast("success", "Demo tasks added", `Added ${res.createdDemoTaskCount} demo task(s).`);
                  } catch (err) {
                    const msg =
                      typeof err === "object" && err !== null && "message" in err
                        ? String((err as { message: unknown }).message)
                        : "Failed to add demo tasks.";
                    setDemoActionError(msg);
                    fireToast("error", "Add failed", msg);
                  } finally {
                    setDemoActionLoading(null);
                  }
                }}
                disabled={demoActionLoading !== null}
                loading={demoActionLoading === "addTasks"}
              >
                Add {addDemoTaskCount} tasks
              </Button>
            </HStack>

            <HStack gap={3} align="center" flexWrap="wrap">
              <Text fontWeight={600}>Lists:</Text>
              <NumberInput.Root
                size="sm"
                width="90px"
                min={1}
                max={50}
                value={String(addDemoListCount)}
                onValueChange={({ valueAsNumber }) => {
                  if (!Number.isFinite(valueAsNumber)) return;
                  setAddDemoListCount(valueAsNumber);
                }}
              >
                <NumberInput.Input />
              </NumberInput.Root>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  if (demoActionLoading) return;
                  setDemoActionLoading("addLists");
                  setDemoActionError(null);
                  try {
                    const res = await addMoreDemoLists(addDemoListCount);
                    fireToast("success", "Demo lists added", `Added ${res.createdDemoListCount} demo list(s).`);
                  } catch (err) {
                    const msg =
                      typeof err === "object" && err !== null && "message" in err
                        ? String((err as { message: unknown }).message)
                        : "Failed to add demo lists.";
                    setDemoActionError(msg);
                    fireToast("error", "Add failed", msg);
                  } finally {
                    setDemoActionLoading(null);
                  }
                }}
                disabled={demoActionLoading !== null}
                loading={demoActionLoading === "addLists"}
              >
                Add {addDemoListCount} lists
              </Button>
            </HStack>

            <HStack gap={3} align="center" flexWrap="wrap">
              <Text fontWeight={600}>Both:</Text>
              <Button
                size="sm"
                variant="outline"
                colorPalette="purple"
                onClick={async () => {
                  if (demoActionLoading) return;
                  setDemoActionLoading("addBoth");
                  setDemoActionError(null);
                  try {
                    const res = await addMoreDemoTasksAndLists({
                      tasks: addDemoTaskCount,
                      lists: addDemoListCount,
                    });
                    fireToast(
                      "success",
                      "Demo data added",
                      `Added ${res.createdDemoTaskCount} demo task(s) and ${res.createdDemoListCount} demo list(s).`
                    );
                  } catch (err) {
                    const msg =
                      typeof err === "object" && err !== null && "message" in err
                        ? String((err as { message: unknown }).message)
                        : "Failed to add demo data.";
                    setDemoActionError(msg);
                    fireToast("error", "Add failed", msg);
                  } finally {
                    setDemoActionLoading(null);
                  }
                }}
                disabled={demoActionLoading !== null}
                loading={demoActionLoading === "addBoth"}
              >
                Add {addDemoTaskCount} tasks and {addDemoListCount} lists
              </Button>
            </HStack>

            {demoActionError ? (
              <Text color="red.600" fontSize="sm">
                {demoActionError}
              </Text>
            ) : null}
          </VStack>
        </Box>

        <DialogModal
          title="Clear demo data?"
          body={
            <VStack align="start" gap={2}>
              <Text>
                This deletes demo-marked lists and tasks only. Non-demo items are preserved.
              </Text>
              <Text color="gray.600" fontSize="sm">
                If a demo list contains any non-demo tasks, those tasks will be moved to your Inbox first.
              </Text>
              {demoActionError ? (
                <Text color="red.600" fontSize="sm">
                  {demoActionError}
                </Text>
              ) : null}
            </VStack>
          }
          open={isClearDemoOpen}
          setOpen={setIsClearDemoOpen}
          acceptLabel="Clear"
          acceptColorPalette="red"
          acceptVariant="solid"
          cancelLabel="Cancel"
          cancelVariant="outline"
          loading={demoActionLoading === "clear"}
          disableClose={demoActionLoading !== null}
          onAccept={async () => {
            if (demoActionLoading) return;
            setDemoActionLoading("clear");
            setDemoActionError(null);
            try {
              const res = await clearDemoDataOnly();
              fireToast(
                "success",
                "Demo data cleared",
                `Deleted ${res.deletedDemoTaskCount} demo tasks and ${res.deletedDemoListCount} demo lists.` +
                  (res.movedNonDemoTaskCount > 0
                    ? ` Moved ${res.movedNonDemoTaskCount} non-demo task(s) to Inbox.`
                    : "")
              );
            } catch (err) {
              const msg =
                typeof err === "object" && err !== null && "message" in err
                  ? String((err as { message: unknown }).message)
                  : "Failed to clear demo data.";
              setDemoActionError(msg);
              fireToast("error", "Clear failed", msg);
              throw err;
            } finally {
              setDemoActionLoading(null);
            }
          }}
          onCancel={() => {
            if (demoActionLoading) return;
            setDemoActionError(null);
            setIsClearDemoOpen(false);
          }}
        />

        <DialogModal
          title="Reset demo data?"
          body={
            <VStack align="start" gap={2}>
              <Text>
                This clears demo-marked items and re-seeds the original demo dataset. Non-demo items are preserved.
              </Text>
              {demoActionError ? (
                <Text color="red.600" fontSize="sm">
                  {demoActionError}
                </Text>
              ) : null}
            </VStack>
          }
          open={isResetDemoOpen}
          setOpen={setIsResetDemoOpen}
          acceptLabel="Reset"
          acceptColorPalette="orange"
          acceptVariant="solid"
          cancelLabel="Cancel"
          cancelVariant="outline"
          loading={demoActionLoading === "reset"}
          disableClose={demoActionLoading !== null}
          onAccept={async () => {
            if (demoActionLoading) return;
            setDemoActionLoading("reset");
            setDemoActionError(null);
            try {
              const res = await resetDemoDataPreservingNonDemo();
              fireToast(
                "success",
                "Demo data reset",
                `Cleared ${res.deletedDemoTaskCount} demo task(s) and ${res.deletedDemoListCount} demo list(s), then re-seeded demo data.` +
                  (res.movedNonDemoTaskCount > 0
                    ? ` Moved ${res.movedNonDemoTaskCount} non-demo task(s) to Inbox.`
                    : "")
              );
            } catch (err) {
              const msg =
                typeof err === "object" && err !== null && "message" in err
                  ? String((err as { message: unknown }).message)
                  : "Failed to reset demo data.";
              setDemoActionError(msg);
              fireToast("error", "Reset failed", msg);
              throw err;
            } finally {
              setDemoActionLoading(null);
            }
          }}
          onCancel={() => {
            if (demoActionLoading) return;
            setDemoActionError(null);
            setIsResetDemoOpen(false);
          }}
        />
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