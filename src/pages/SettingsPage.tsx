import { Box, Button, Heading, HStack, NumberInput, Text, VStack, Checkbox } from "@chakra-ui/react";
import { useEffect, useState } from "react";
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
import { useDemoMode } from "../hooks/useDemoMode";
import { useDemoTourStore } from "../store/demoTourStore";
import { isSeedDemoDisabled, setSeedDemoDisabled } from "../services/seedDemoPreference";
import { setDemoModeOptIn } from "../services/demoModeOptIn";
import { clearWelcomeModalSeenVersion, requestOpenWelcomeModal } from "../services/welcomeModalPreference";
import { clearDemoSessionActive } from "../services/demoSession";
import { InlineErrorBanner } from "../components/ui/InlineErrorBanner";
import {
  clearDemoDataOnly,
  resetDemoDataPreservingNonDemo,
  addMoreDemoLists,
  addMoreDemoTasks,
  addMoreDemoTasksAndLists,
} from "../services/demoDataService";

export function SettingsPage() {
  
  const { loading, err, refreshData } = useSettingsPageData();
  const dueSoonWindowDays = useDueSoonWindowDays();
  const setDueSoonWindowDays = useSetDueSoonWindowDays();

  const sidebarWidthPreset = useSidebarWidthPreset();
  const setSidebarWidthPreset = useSetSidebarWidthPreset();

  const defaultViewRoute = useDefaultViewRoute();
  const setDefaultViewRoute = useSetDefaultViewRoute();

  const defaultLandingRoute = useDefaultLandingRoute();
  const setDefaultLandingRoute = useSetDefaultLandingRoute();

  const { clearDismissed } = useInboxActions();
  const { isDemo, isDemoIdentity, isDemoSession, isDemoOptIn } = useDemoMode(true);
  const demoTourDisabled = useDemoTourStore((s) => s.disabled);
  const resetDemoTourDisabled = useDemoTourStore((s) => s.resetDisabled);
  const openDemoTour = useDemoTourStore((s) => s.openTour);

  const [seedOptedOut, setSeedOptedOut] = useState(() => isSeedDemoDisabled());

  const [isResetIgnoredOpen, setIsResetIgnoredOpen] = useState(false);

  const [isClearDemoOpen, setIsClearDemoOpen] = useState(false);
  const [isResetDemoOpen, setIsResetDemoOpen] = useState(false);
  const [demoActionLoading, setDemoActionLoading] = useState<"clear" | "reset" | "addTasks" | "addLists" | "addBoth" | null>(null);
  const [demoActionError, setDemoActionError] = useState<string | null>(null);

  const [isRemoveSampleOpen, setIsRemoveSampleOpen] = useState(false);
  const [removeSampleChecked, setRemoveSampleChecked] = useState(false);
  const [removeSampleLoading, setRemoveSampleLoading] = useState(false);
  const [removeSampleError, setRemoveSampleError] = useState<string | null>(null);

  const [addDemoTaskCount, setAddDemoTaskCount] = useState(10);
  const [addDemoListCount, setAddDemoListCount] = useState(3);

  useEffect(() => {
    // Keep the UI in sync if some other screen changes the preference.
    setSeedOptedOut(isSeedDemoDisabled());
  }, []);

  if (loading) return <BasicSpinner />;

  return (
    <VStack align="start" gap={2} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
      <Heading size="2xl">Settings</Heading>

      <Tip storageKey="tip:settings-local" title="Tip">
        Settings and dismissed tips are stored per user in this browser. If you switch devices or clear storage, you’ll
        see onboarding tips again.
      </Tip>

      {err ? (
        <InlineErrorBanner
          title="Failed to load lists/tasks"
          message={err}
          onRetry={() => {
            void refreshData();
          }}
        />
      ) : null}

      <Box pt={2} w="100%"> {/* Inbox */}
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

      <Box pt={6} w="100%"> {/* Navigation */}
        <Heading size="lg">Navigation</Heading>
        <Text color="gray.600" fontSize="sm">
          Customize your sidebar and default “Views” landing destination.
        </Text>

        <VStack align="stretch" gap={4} pt={3}>
          <FormSelect
            title="Sidebar width"
            name="sidebarWidthPreset"
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
            name="defaultViewRoute"
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
            name="defaultLandingRoute"
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

      <Box pt={6} w="100%"> {/* Demo */}
        <Heading size="lg">{isDemoIdentity ? "Demo Data" : "Sample data"}</Heading>
        <Text color="gray.600" fontSize="sm">
          {isDemoIdentity
            ? "Manage demo lists and tasks. These actions only affect items marked as demo."
            : "Your account can start with sample lists and tasks (marked as demo). You can remove them at any time."}
        </Text>

        {!isDemoIdentity ? (
          <Box pt={3}>
            <Heading size="sm">Remove sample data</Heading>
            <Text color="gray.600" fontSize="sm">
              This deletes demo-marked lists/tasks and permanently disables future sample-data seeding for this account
              on this device.
            </Text>
            <Text color="gray.600" fontSize="sm">
              This cannot be undone from within the app. If you want “temporary demo” items later, create your own and
              prefix them with something like “Demo:” (for example, “Demo: Fake task”).
            </Text>
            <Text color="gray.600" fontSize="sm">
              Note: this also hides the Demo Mode onboarding controls (since sample-data seeding is disabled).
            </Text>

            <HStack pt={2} gap={3} align="center" flexWrap="wrap">
              <Button
                size="sm"
                variant="outline"
                colorPalette="red"
                onClick={() => {
                  setRemoveSampleError(null);
                  setRemoveSampleChecked(false);
                  setIsRemoveSampleOpen(true);
                }}
                disabled={removeSampleLoading || seedOptedOut}
              >
                Remove sample data
              </Button>

              {seedOptedOut ? (
                <Text fontSize="sm" color="gray.600">
                  Sample-data seeding is disabled for this user.
                </Text>
              ) : null}
            </HStack>

            <DialogModal
              title="Remove sample data and disable seeding?"
              body={
                <VStack align="start" gap={3}>
                  <Text>
                    This will delete all demo-marked lists and tasks in your account. It will also disable future
                    sample-data seeding for this user in this browser.
                  </Text>
                  <Checkbox.Root
                    checked={removeSampleChecked}
                    onCheckedChange={(details) => setRemoveSampleChecked(details.checked === true)}
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>
                      <Text fontSize="sm">I understand this action is not reversible.</Text>
                    </Checkbox.Label>
                  </Checkbox.Root>

                  {removeSampleError ? (
                    <Box p={3} bg="red.50" borderWidth="1px" borderColor="red.200" rounded="md" w="100%">
                      <Text fontSize="sm" color="red.800">
                        {removeSampleError}
                      </Text>
                    </Box>
                  ) : null}
                </VStack>
              }
              open={isRemoveSampleOpen}
              setOpen={setIsRemoveSampleOpen}
              acceptLabel="Remove"
              acceptColorPalette="red"
              acceptVariant="solid"
              acceptDisabled={!removeSampleChecked}
              loading={removeSampleLoading}
              cancelLabel="Cancel"
              cancelVariant="outline"
              onAccept={async () => {
                if (removeSampleLoading) return;
                setRemoveSampleLoading(true);
                setRemoveSampleError(null);
                try {
                  await clearDemoDataOnly();
                  setSeedDemoDisabled(true);
                  setSeedOptedOut(true);
                  // If the user has explicitly disabled sample-data seeding, Demo Mode becomes confusing (no data to drive it).
                  // Ensure it's also disabled so the badge/tour controls don't appear in a no-op state.
                  setDemoModeOptIn(false);
                  clearDemoSessionActive();
                  fireToast("success", "Sample data removed", "Demo-marked items were deleted and future seeding is disabled.");
                  setIsRemoveSampleOpen(false);
                } catch (err) {
                  const msg = typeof err === "object" && err !== null && "message" in err ? String((err as { message: unknown }).message) : "Failed to remove sample data.";
                  setRemoveSampleError(msg);
                } finally {
                  setRemoveSampleLoading(false);
                }
              }}
              onCancel={() => {
                // no-op
              }}
            />
          </Box>
        ) : null}

        {isDemoIdentity ? (
          <Box pt={3}>
            <Heading size="sm">Demo tour</Heading>
            <Text color="gray.600" fontSize="sm">
              If you hid the demo tour, you can re-enable it here.
            </Text>
            <HStack pt={2} gap={3} align="center" flexWrap="wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  resetDemoTourDisabled();
                  fireToast("success", "Demo tour reset", "The demo tour can be opened again from the Demo Mode badge.");
                }}
                disabled={demoActionLoading !== null || !demoTourDisabled}
              >
                Reset demo tour
              </Button>
              {!demoTourDisabled ? (
                <Text fontSize="sm" color="gray.600">
                  Demo tour is currently enabled.
                </Text>
              ) : null}
            </HStack>
          </Box>
        ) : null}

        {isDemoIdentity ? (
          <>
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
            </Box>

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
          </>
        ) : null}
      </Box>

      <Box pt={6} w="100%"> {/* Onboarding */}
        <Heading size="lg">Onboarding</Heading>
        <Text color="gray.600" fontSize="sm">
          Control the welcome modal and (optionally) enable Demo Mode for this account on this device.
        </Text>

        <Box pt={3}>
          <Heading size="sm">Welcome modal</Heading>
          <Text color="gray.600" fontSize="sm">
            If you previously chose “Never show again”, you can re-enable the welcome modal here.
          </Text>
          <HStack pt={2} gap={3} align="center" flexWrap="wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                requestOpenWelcomeModal();
              }}
            >
              Open welcome now
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                clearWelcomeModalSeenVersion();
                fireToast("success", "Welcome re-enabled", "The welcome modal will show again on next login.");
              }}
            >
              Show welcome again
            </Button>
          </HStack>
        </Box>

        {!isDemoIdentity && !seedOptedOut ? (
          <Box pt={4}>
            <Heading size="sm">Demo Mode (optional)</Heading>
            <Text color="gray.600" fontSize="sm">
              {isDemoSession
                ? "This is a demo session. Sign out to exit demo mode."
                : isDemoOptIn
                  ? "Demo Mode is enabled for this account on this device."
                  : "Enable Demo Mode to show the Demo Mode badge and allow the guided tour."}
            </Text>

            <HStack pt={2} gap={3} align="center" flexWrap="wrap">
              {!isDemoSession ? (
                isDemoOptIn ? (
                  <Button
                    size="sm"
                    variant="outline"
                    colorPalette="gray"
                    onClick={() => {
                      setDemoModeOptIn(false);
                      clearDemoSessionActive();
                      fireToast("success", "Demo Mode disabled", "You’ve exited Demo Mode for this account on this device.");
                    }}
                  >
                    Exit Demo Mode
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    colorPalette="purple"
                    onClick={() => {
                      setDemoModeOptIn(true);
                      fireToast("success", "Demo Mode enabled", "Demo Mode is now enabled for this account on this device.");
                    }}
                  >
                    Enable Demo Mode
                  </Button>
                )
              ) : null}

              {isDemo ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (demoTourDisabled) {
                        resetDemoTourDisabled();
                      }
                      openDemoTour();
                    }}
                  >
                    Start demo tour
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      resetDemoTourDisabled();
                      fireToast("success", "Demo tour reset", "The demo tour can be opened again from the Demo Mode badge.");
                    }}
                    disabled={!demoTourDisabled}
                  >
                    Reset demo tour
                  </Button>
                </>
              ) : null}
            </HStack>
          </Box>
        ) : null}
      </Box>

      <Box pt={6} w="100%"> {/* Tips */}
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