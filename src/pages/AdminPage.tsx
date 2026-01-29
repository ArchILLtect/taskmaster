import { Box, Heading, HStack, Spinner, Text, VStack, Badge, Separator, Button, Input } from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { isCurrentUserAdmin } from "../services/authIdentity";
import {
  backfillMissingUserProfileEmails,
  listTaskListsOwnedAdminPage,
  listUserProfilesAdminPage,
  loadTasksForListsAdminPage,
  probeUserProfilesMissingEmail,
  type AdminEmailMode,
} from "../services/adminDataService";
import { TaskPriority, TaskStatus } from "../API";
import type { ListUI } from "../types/list";
import type { TaskUI } from "../types/task";
import type { UserProfileUI } from "../types/userProfile";

function errorToMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (typeof err === "object" && err !== null) {
    if ("errors" in err && Array.isArray((err as { errors?: unknown }).errors)) {
      const errors = (err as { errors: Array<{ message?: unknown; errorType?: unknown }> }).errors;
      const messages = errors
        .map((e) => {
          const msg = typeof e?.message === "string" ? e.message : "Unknown GraphQL error";
          const type = typeof e?.errorType === "string" ? e.errorType : "";
          return type ? `${msg} (${type})` : msg;
        })
        .filter(Boolean);
      if (messages.length) return messages.join("; ");
    }

    if ("message" in err) return String((err as { message: unknown }).message);
  }
  return "Unknown error";
}

function parseStatusFilter(value: string): "all" | TaskStatus {
  if (value === "all") return "all";
  if (value === TaskStatus.Open) return TaskStatus.Open;
  if (value === TaskStatus.Done) return TaskStatus.Done;
  return "all";
}

function parsePriorityFilter(value: string): "all" | TaskPriority {
  if (value === "all") return "all";
  if (value === TaskPriority.Low) return TaskPriority.Low;
  if (value === TaskPriority.Medium) return TaskPriority.Medium;
  if (value === TaskPriority.High) return TaskPriority.High;
  return "all";
}

function parseDemoFilter(value: string): "all" | "demo" | "non-demo" {
  if (value === "all" || value === "demo" || value === "non-demo") return value;
  return "all";
}

export function AdminPage() {
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [err, setErr] = useState<string | null>(null);

  type TabKey = "users" | "lists" | "tasks";
  const [tab, setTab] = useState<TabKey>("users");

  const [selectedOwnerSub, setSelectedOwnerSub] = useState<string | null>(null);
  const [selectedOwnerEmail, setSelectedOwnerEmail] = useState<string | null>(null);

  // Users (paginated)
  const [users, setUsers] = useState<UserProfileUI[]>([]);
  const [usersNextToken, setUsersNextToken] = useState<string | null>(null);
  const [usersEmailMode, setUsersEmailMode] = useState<AdminEmailMode>("full");
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersErr, setUsersErr] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [showUsersListInSafeMode, setShowUsersListInSafeMode] = useState(false);

  // Lists (paginated)
  const [lists, setLists] = useState<ListUI[]>([]);
  const [listsNextToken, setListsNextToken] = useState<string | null>(null);
  const [listsIsDemoMode, setListsIsDemoMode] = useState<"full" | "safe">("full");
  const [listsLoading, setListsLoading] = useState(false);
  const [listsErr, setListsErr] = useState<string | null>(null);

  // Tasks (incremental, per loaded lists)
  const [taskLists, setTaskLists] = useState<ListUI[]>([]);
  const [taskListsNextToken, setTaskListsNextToken] = useState<string | null>(null);
  const [taskListsLoading, setTaskListsLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksErr, setTasksErr] = useState<string | null>(null);
  const [tasksByListId, setTasksByListId] = useState<Record<string, TaskUI[]>>({});
  const [cappedTaskListIds, setCappedTaskListIds] = useState<string[]>([]);
  const [tasksIsDemoMode, setTasksIsDemoMode] = useState<"full" | "safe">("full");

  const [taskSearch, setTaskSearch] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState<"all" | TaskStatus>("all");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<"all" | TaskPriority>("all");
  const [taskDemoFilter, setTaskDemoFilter] = useState<"all" | "demo" | "non-demo">("all");

  const [repairingEmails, setRepairingEmails] = useState(false);
  const [emailRepairMsg, setEmailRepairMsg] = useState<string | null>(null);

  const [probingEmails, setProbingEmails] = useState(false);
  const [probeMsg, setProbeMsg] = useState<string | null>(null);
  const [probeMissingOwners, setProbeMissingOwners] = useState<string[]>([]);

  const initialUsersLoadedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setCheckingAdmin(true);
      try {
        const ok = await isCurrentUserAdmin();
        if (cancelled) return;
        setIsAdmin(ok);
      } catch (e) {
        if (cancelled) return;
        setIsAdmin(false);
        setErr(errorToMessage(e));
      } finally {
        if (!cancelled) setCheckingAdmin(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const loadUsersPage = async (opts?: { reset?: boolean }) => {
    if (!isAdmin) return;
    if (usersLoading) return;

    setUsersLoading(true);
    setUsersErr(null);
    setErr(null);

    try {
      const nextToken = opts?.reset ? null : usersNextToken;
      const emailMode = opts?.reset ? "full" : usersEmailMode;

      const page = await listUserProfilesAdminPage({
        limit: 50,
        nextToken,
        emailMode,
      });

      setUsersEmailMode(page.emailMode);
      if (page.emailMode === "safe") {
        // Default hide in safe mode to avoid "everything missing" confusion.
        setShowUsersListInSafeMode(false);
      }

      setUsers((prev) => (opts?.reset ? page.items : [...prev, ...page.items]));
      setUsersNextToken(page.nextToken);
    } catch (e) {
      setUsersErr(errorToMessage(e));
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    if (initialUsersLoadedRef.current) return;
    initialUsersLoadedRef.current = true;
    void loadUsersPage({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const resetOwnerScopedData = () => {
    setLists([]);
    setListsNextToken(null);
    setListsErr(null);
    setListsIsDemoMode("full");

    setTaskLists([]);
    setTaskListsNextToken(null);
    setTasksByListId({});
    setTasksErr(null);
    setCappedTaskListIds([]);
    setTasksIsDemoMode("full");
  };

  const clearOwnerSelection = () => {
    setSelectedOwnerSub(null);
    setSelectedOwnerEmail(null);
    resetOwnerScopedData();
  };

  const copySelectedOwnerSub = async () => {
    const sub = selectedOwnerSub;
    if (!sub) return;
    try {
      await navigator.clipboard.writeText(sub);
    } catch {
      // ignore
    }
  };

  const runEmailBackfill = async () => {
    setRepairingEmails(true);
    setEmailRepairMsg(null);
    try {
      const res = await backfillMissingUserProfileEmails();
      setEmailRepairMsg(`Backfill complete: updated=${res.updated}, skipped=${res.skipped}, failed=${res.failed}`);
      // Refresh users list after backfill.
      await loadUsersPage({ reset: true });
    } catch (e) {
      setEmailRepairMsg(`Backfill failed: ${errorToMessage(e)}`);
    } finally {
      setRepairingEmails(false);
    }
  };

  const runEmailProbe = async () => {
    setProbingEmails(true);
    setProbeMsg(null);
    setProbeMissingOwners([]);
    try {
      const res = await probeUserProfilesMissingEmail();

      const owners = res.missing
        .map((m) => m.owner || m.id)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));

      setProbeMissingOwners(owners);

      const failedCount = res.failed.length;
      const missingCount = res.missing.length;
      setProbeMsg(
        `Probe complete: ok=${res.ok}, missing=${missingCount}, failed=${failedCount}` +
          (failedCount ? ". See console for details." : "")
      );

      if (failedCount && import.meta.env.DEV) {
        console.warn("[admin probe] unexpected failures", res.failed);
      }
    } catch (e) {
      setProbeMsg(`Probe failed: ${errorToMessage(e)}`);
    } finally {
      setProbingEmails(false);
    }
  };

  const copyProbeList = async () => {
    const text = probeMissingOwners.join("\n");
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setProbeMsg((prev) => (prev ? `${prev} (copied)` : "Copied"));
    } catch {
      // Fallback: show the list; user can manually select/copy.
      setProbeMsg((prev) => (prev ? `${prev} (copy failed; select manually)` : "Copy failed; select manually"));
    }
  };

  const counts = useMemo(() => {
    const listCount = lists.length;
    const taskListCount = taskLists.length;
    const taskCount = Object.values(tasksByListId).reduce((acc, arr) => acc + arr.length, 0);
    return {
      users: users.length,
      lists: listCount,
      taskLists: taskListCount,
      tasks: taskCount,
    };
  }, [lists.length, taskLists.length, tasksByListId, users.length]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const email = (u.email ?? "").toLowerCase();
      const owner = (u.owner ?? "").toLowerCase();
      const id = (u.id ?? "").toLowerCase();
      return email.includes(q) || owner.includes(q) || id.includes(q);
    });
  }, [users, userSearch]);

  const usersHasMore = !!usersNextToken;
  const listsHasMore = !!listsNextToken;
  const taskListsHasMore = !!taskListsNextToken;

  const selectUser = (u: UserProfileUI) => {
    const owner = u.owner || u.id;
    if (!owner) return;
    setSelectedOwnerSub(owner);
    setSelectedOwnerEmail(u.email || null);
    resetOwnerScopedData();
  };

  const loadListsPage = async (opts?: { reset?: boolean }) => {
    const ownerSub = selectedOwnerSub;
    if (!ownerSub) return;
    if (listsLoading) return;

    setListsLoading(true);
    setListsErr(null);

    try {
      const nextToken = opts?.reset ? null : listsNextToken;
      const page = await listTaskListsOwnedAdminPage({ ownerSub, limit: 50, nextToken });

      setListsIsDemoMode(page.isDemoMode);
      setLists((prev) => (opts?.reset ? page.items : [...prev, ...page.items]));
      setListsNextToken(page.nextToken);
    } catch (e) {
      setListsErr(errorToMessage(e));
    } finally {
      setListsLoading(false);
    }
  };

  const loadMoreTaskListsAndTasks = async (opts?: { reset?: boolean }) => {
    const ownerSub = selectedOwnerSub;
    if (!ownerSub) return;
    if (taskListsLoading || tasksLoading) return;

    setTaskListsLoading(true);
    setTasksLoading(true);
    setTasksErr(null);

    try {
      const nextToken = opts?.reset ? null : taskListsNextToken;
      const page = await listTaskListsOwnedAdminPage({ ownerSub, limit: 25, nextToken });

      const prevLists = opts?.reset ? [] : taskLists;
      const mergedLists = [...prevLists, ...page.items];
      setTaskLists(mergedLists);
      setTaskListsNextToken(page.nextToken);

      const newListIds = page.items.map((l) => l.id);

      if (newListIds.length) {
        const res = await loadTasksForListsAdminPage({
          listIds: newListIds,
          concurrency: 4,
          perListPageLimit: 200,
          maxTasksPerList: 300,
        });

        setTasksIsDemoMode(res.isDemoMode);

        setTasksByListId((prev) => {
          const next: Record<string, TaskUI[]> = { ...prev };
          for (const listId of Object.keys(res.tasksByListId)) {
            next[listId] = res.tasksByListId[listId];
          }
          return next;
        });

        setCappedTaskListIds((prev) => {
          const set = new Set([...prev, ...res.cappedLists]);
          return Array.from(set);
        });
      }
    } catch (e) {
      setTasksErr(errorToMessage(e));
    } finally {
      setTaskListsLoading(false);
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    // Auto-load first page of lists when entering Lists tab.
    if (tab !== "lists") return;
    if (!selectedOwnerSub) return;
    if (lists.length) return;
    void loadListsPage({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, selectedOwnerSub]);

  const tasksListNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const l of taskLists) map.set(l.id, l.name);
    return map;
  }, [taskLists]);

  const visibleTasks = useMemo((): Array<TaskUI & { __listName?: string }> => {
    const all: Array<TaskUI & { __listName?: string }> = [];
    for (const [listId, tasks] of Object.entries(tasksByListId)) {
      const listName = tasksListNameById.get(listId) ?? "(unknown list)";
      for (const t of tasks) {
        all.push(Object.assign({ __listName: listName }, t));
      }
    }

    const q = taskSearch.trim().toLowerCase();
    return all
      .filter((t) => {
        if (taskStatusFilter !== "all" && t.status !== taskStatusFilter) return false;
        if (taskPriorityFilter !== "all" && t.priority !== taskPriorityFilter) return false;
        if (taskDemoFilter === "demo" && !t.isDemo) return false;
        if (taskDemoFilter === "non-demo" && t.isDemo) return false;
        if (q && !(t.title ?? "").toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [taskDemoFilter, taskPriorityFilter, taskSearch, taskStatusFilter, tasksByListId, tasksListNameById]);

  if (checkingAdmin) {
    return (
      <VStack align="start" gap={3} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
        <HStack gap={2} color="gray.600">
          <Spinner size="sm" />
          <Text fontSize="sm">Checking admin access…</Text>
        </HStack>
      </VStack>
    );
  }

  if (!isAdmin) {
    return (
      <VStack align="start" gap={2} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
        <Heading size="md">Admin</Heading>
        <Text color="gray.600">Not authorized.</Text>
      </VStack>
    );
  }

  return (
    <VStack align="start" gap={4} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
      <HStack justify="space-between" w="100%">
        <Heading size="md">Admin</Heading>
        <HStack gap={2} align="center">
          <Badge>Users: {counts.users}</Badge>
          <Badge>Lists: {counts.lists}</Badge>
          <Badge>Tasks: {counts.tasks}</Badge>
        </HStack>
      </HStack>

      {err ? (
        <Box bg="red.50" borderWidth="1px" borderColor="red.200" rounded="md" p={3} w="100%">
          <Text color="red.700" fontWeight={600}>
            Failed to load admin data
          </Text>
          <Text color="red.700" fontSize="sm">
            {err}
          </Text>
        </Box>
      ) : null}

      {/* Owner selector (visible on all tabs) */}
      <Box w="100%" borderWidth="1px" borderColor="gray.200" rounded="md" p={3}>
        <HStack justify="space-between" align="start" w="100%" gap={4}>
          <VStack align="start" gap={2} flex={1}>
            <HStack justify="space-between" w="100%">
              <Heading size="sm">Owner</Heading>
              <HStack gap={2}>
                {selectedOwnerSub ? (
                  <>
                    <Button size="xs" variant="outline" onClick={copySelectedOwnerSub}>
                      Copy ownerSub
                    </Button>
                    <Button size="xs" variant="outline" onClick={clearOwnerSelection}>
                      Clear selection
                    </Button>
                  </>
                ) : null}
              </HStack>
            </HStack>

            {selectedOwnerSub ? (
              <Box>
                <Text fontSize="sm" color="gray.700">
                  Selected: <Badge>{selectedOwnerSub}</Badge>
                </Text>
                {selectedOwnerEmail ? (
                  <Text fontSize="sm" color="gray.600">
                    Email: {selectedOwnerEmail}
                  </Text>
                ) : null}
              </Box>
            ) : (
              <Text fontSize="sm" color="gray.600">
                No user selected.
              </Text>
            )}

            <Input
              placeholder="Search users (email / owner / id)"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              size="sm"
            />
          </VStack>

          <VStack align="end" gap={2} minW="240px">
            <HStack gap={2}>
              <Badge>{usersEmailMode === "safe" ? "Safe mode" : "Full"}</Badge>
              <Badge>Loaded: {users.length}</Badge>
            </HStack>
            <HStack gap={2}>
              <Button size="xs" variant="outline" onClick={() => loadUsersPage({ reset: true })} loading={usersLoading}>
                Refresh users
              </Button>
              <Button size="xs" variant="outline" onClick={() => loadUsersPage()} loading={usersLoading} disabled={!usersHasMore}>
                Load more
              </Button>
            </HStack>
          </VStack>
        </HStack>

        {usersErr ? (
          <Box mt={3} bg="red.50" borderWidth="1px" borderColor="red.200" rounded="md" p={2}>
            <Text color="red.700" fontSize="sm">
              {usersErr}
            </Text>
          </Box>
        ) : null}

        {usersEmailMode === "safe" && !showUsersListInSafeMode ? (
          <HStack mt={3} justify="space-between" align="center" bg="yellow.50" borderWidth="1px" borderColor="yellow.200" rounded="md" p={2}>
            <Text fontSize="sm" color="yellow.900">
              Users list hidden because safe mode is active (legacy profiles missing `email` make emails unreliable). You can still select users by owner/sub.
            </Text>
            <Button size="xs" variant="outline" onClick={() => setShowUsersListInSafeMode(true)}>
              Show users
            </Button>
          </HStack>
        ) : (
          <Box mt={3} maxH="240px" overflowY="auto" borderWidth="1px" borderColor="gray.100" rounded="md">
            {filteredUsers.length === 0 ? (
              <Box p={3}>
                <Text fontSize="sm" color="gray.600">
                  No users loaded (or search filtered everything).
                </Text>
              </Box>
            ) : (
              <VStack align="stretch" gap={0}>
                {filteredUsers.slice(0, 200).map((u) => {
                  const isSelected = selectedOwnerSub === (u.owner || u.id);
                  const email = u.email || "(email unavailable)";
                  return (
                    <Box
                      key={u.id}
                      px={3}
                      py={2}
                      borderBottomWidth="1px"
                      borderColor="gray.100"
                      bg={isSelected ? "blue.50" : "white"}
                      _hover={{ bg: "gray.50" }}
                      cursor="pointer"
                      onClick={() => selectUser(u)}
                    >
                      <HStack justify="space-between" align="start" w="100%">
                        <VStack align="start" gap={0}>
                          <Text fontSize="sm" fontWeight={700}>
                            {email}
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            owner={u.owner}
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            id={u.id}
                          </Text>
                        </VStack>
                        {isSelected ? <Badge>Selected</Badge> : null}
                      </HStack>
                    </Box>
                  );
                })}
              </VStack>
            )}
          </Box>
        )}
      </Box>

      {/* Tabs */}
      <HStack gap={2}>
        <Button size="sm" variant={tab === "users" ? "solid" : "outline"} onClick={() => setTab("users")}>
          Users
        </Button>
        <Button size="sm" variant={tab === "lists" ? "solid" : "outline"} onClick={() => setTab("lists")}>
          Lists
        </Button>
        <Button size="sm" variant={tab === "tasks" ? "solid" : "outline"} onClick={() => setTab("tasks")}>
          Tasks
        </Button>
      </HStack>

      {/* Users tab */}
      {tab === "users" ? (
        <VStack align="start" gap={3} w="100%">
          {usersEmailMode === "safe" ? (
            <Box bg="yellow.50" borderWidth="1px" borderColor="yellow.200" rounded="md" p={3} w="100%">
              <HStack justify="space-between" align="start" w="100%" gap={3}>
                <Box>
                  <Text color="yellow.900" fontWeight={700}>
                    UserProfiles loaded in safe mode
                  </Text>
                  <Text color="yellow.900" fontSize="sm">
                    Some legacy UserProfile records are missing the required `email` field, so the full query fails.
                    You can backfill placeholder emails to unblock full admin browsing.
                  </Text>
                  <Text color="yellow.900" fontSize="sm" mt={1}>
                    Alternative (no placeholders): sign into the affected older accounts once. On login, the app will self-heal that account’s `UserProfile.email` from Cognito.
                  </Text>
                  <Text color="yellow.900" fontSize="sm" mt={1}>
                    Tip: use “Detect broken profiles” to list which accounts are missing email.
                  </Text>
                  {emailRepairMsg ? (
                    <Text mt={2} fontSize="sm" color="yellow.900">
                      {emailRepairMsg}
                    </Text>
                  ) : null}
                  {probeMsg ? (
                    <Text mt={2} fontSize="sm" color="yellow.900">
                      {probeMsg}
                    </Text>
                  ) : null}
                  {probeMissingOwners.length ? (
                    <Box mt={2} bg="white" borderWidth="1px" borderColor="yellow.200" rounded="md" p={2}>
                      <HStack justify="space-between" align="center" mb={1}>
                        <Text fontSize="sm" color="yellow.900" fontWeight={700}>
                          Accounts missing email (owner/sub)
                        </Text>
                        <Button size="xs" variant="outline" onClick={copyProbeList}>
                          Copy list
                        </Button>
                      </HStack>
                      <Text fontSize="sm" color="yellow.900" whiteSpace="pre-wrap">
                        {probeMissingOwners.join("\n")}
                      </Text>
                    </Box>
                  ) : null}
                </Box>
                <VStack align="end" gap={2}>
                  <Button size="sm" variant="outline" onClick={runEmailProbe} loading={probingEmails}>
                    Detect broken profiles
                  </Button>
                  <Button size="sm" variant="outline" onClick={runEmailBackfill} loading={repairingEmails}>
                    Backfill placeholder emails
                  </Button>
                </VStack>
              </HStack>
            </Box>
          ) : null}

          {usersEmailMode !== "safe" ? (
            <Box bg="gray.50" borderWidth="1px" borderColor="gray.200" rounded="md" p={3} w="100%">
              <HStack justify="space-between" align="start" w="100%" gap={3}>
                <Box>
                  <Text color="gray.800" fontWeight={700}>
                    Diagnostics
                  </Text>
                  <Text color="gray.600" fontSize="sm">
                    These are only needed if you suspect legacy UserProfiles are missing required fields (like `email`).
                  </Text>
                  {emailRepairMsg ? (
                    <Text mt={2} fontSize="sm" color="gray.700">
                      {emailRepairMsg}
                    </Text>
                  ) : null}
                  {probeMsg ? (
                    <Text mt={2} fontSize="sm" color="gray.700">
                      {probeMsg}
                    </Text>
                  ) : null}
                  {probeMissingOwners.length ? (
                    <Box mt={2} bg="white" borderWidth="1px" borderColor="gray.200" rounded="md" p={2}>
                      <HStack justify="space-between" align="center" mb={1}>
                        <Text fontSize="sm" color="gray.800" fontWeight={700}>
                          Accounts missing email (owner/sub)
                        </Text>
                        <Button size="xs" variant="outline" onClick={copyProbeList}>
                          Copy list
                        </Button>
                      </HStack>
                      <Text fontSize="sm" color="gray.800" whiteSpace="pre-wrap">
                        {probeMissingOwners.join("\n")}
                      </Text>
                    </Box>
                  ) : null}
                </Box>
                <VStack align="end" gap={2}>
                  <Button size="sm" variant="outline" onClick={runEmailProbe} loading={probingEmails}>
                    Detect broken profiles
                  </Button>
                  <Button size="sm" variant="outline" onClick={runEmailBackfill} loading={repairingEmails}>
                    Backfill placeholder emails
                  </Button>
                </VStack>
              </HStack>
            </Box>
          ) : null}

          <Box w="100%">
            <Heading size="sm" mb={2}>
              Pagination
            </Heading>
            <Separator mb={2} />
            <HStack justify="space-between" w="100%">
              <Text fontSize="sm" color="gray.600">
                Loaded {users.length} user profiles{usersHasMore ? " (more available)" : ""}.
              </Text>
              <HStack gap={2}>
                <Button size="sm" variant="outline" onClick={() => loadUsersPage()} loading={usersLoading} disabled={!usersHasMore}>
                  Load more
                </Button>
              </HStack>
            </HStack>
          </Box>
        </VStack>
      ) : null}

      {/* Lists tab */}
      {tab === "lists" ? (
        <VStack align="start" gap={3} w="100%">
          {!selectedOwnerSub ? (
            <Box bg="gray.50" borderWidth="1px" borderColor="gray.200" rounded="md" p={3} w="100%">
              <Text color="gray.700" fontWeight={600}>
                Select a user to view lists.
              </Text>
            </Box>
          ) : (
            <>
              {listsErr ? (
                <Box bg="red.50" borderWidth="1px" borderColor="red.200" rounded="md" p={3} w="100%">
                  <Text color="red.700" fontWeight={600}>
                    Failed to load lists
                  </Text>
                  <Text color="red.700" fontSize="sm">
                    {listsErr}
                  </Text>
                </Box>
              ) : null}

              <HStack justify="space-between" w="100%">
                <Text fontSize="sm" color="gray.600">
                  Loaded {lists.length} lists{listsHasMore ? " (more available)" : ""}.
                </Text>
                <HStack gap={2}>
                  <Badge>{listsIsDemoMode === "safe" ? "isDemo safe" : "isDemo full"}</Badge>
                  <Button size="sm" variant="outline" onClick={() => loadListsPage({ reset: true })} loading={listsLoading}>
                    Refresh
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => loadListsPage()} loading={listsLoading} disabled={!listsHasMore}>
                    Load more
                  </Button>
                </HStack>
              </HStack>

              {listsIsDemoMode === "safe" ? (
                <Box bg="yellow.50" borderWidth="1px" borderColor="yellow.200" rounded="md" p={3} w="100%">
                  <Text color="yellow.900" fontWeight={700} fontSize="sm">
                    Lists loaded without isDemo
                  </Text>
                  <Text color="yellow.900" fontSize="sm">
                    Some legacy TaskList records are missing the required `isDemo` field, so admin is falling back to a safe query.
                    The isDemo column may be incorrect until legacy records are backfilled.
                  </Text>
                </Box>
              ) : null}

              <Box w="100%" borderWidth="1px" borderColor="gray.200" rounded="md" overflowX="auto">
                <HStack px={3} py={2} bg="gray.50" borderBottomWidth="1px" borderColor="gray.200" justify="space-between">
                  <Text fontSize="sm" fontWeight={700} w="240px">
                    Name
                  </Text>
                  <Text fontSize="sm" fontWeight={700} w="90px" textAlign="right">
                    isDemo
                  </Text>
                  <Text fontSize="sm" fontWeight={700} w="100px" textAlign="right">
                    Favorite
                  </Text>
                  <Text fontSize="sm" fontWeight={700} w="100px" textAlign="right">
                    sortOrder
                  </Text>
                  <Text fontSize="sm" fontWeight={700} w="260px" textAlign="right">
                    id
                  </Text>
                </HStack>
                <VStack align="stretch" gap={0}>
                  {lists.map((l) => (
                    <HStack key={l.id} px={3} py={2} borderBottomWidth="1px" borderColor="gray.100" justify="space-between">
                      <Text fontSize="sm" w="240px" fontWeight={600}>
                        {l.name}
                      </Text>
                      <Text fontSize="sm" w="90px" textAlign="right">
                        {String(l.isDemo)}
                      </Text>
                      <Text fontSize="sm" w="100px" textAlign="right">
                        {String(l.isFavorite)}
                      </Text>
                      <Text fontSize="sm" w="100px" textAlign="right">
                        {String(l.sortOrder)}
                      </Text>
                      <Text fontSize="xs" w="260px" textAlign="right" color="gray.600">
                        {l.id}
                      </Text>
                    </HStack>
                  ))}
                  {lists.length === 0 && !listsLoading ? (
                    <Box p={3}>
                      <Text fontSize="sm" color="gray.600">
                        No lists loaded.
                      </Text>
                    </Box>
                  ) : null}
                </VStack>
              </Box>
            </>
          )}
        </VStack>
      ) : null}

      {/* Tasks tab */}
      {tab === "tasks" ? (
        <VStack align="start" gap={3} w="100%">
          {!selectedOwnerSub ? (
            <Box bg="gray.50" borderWidth="1px" borderColor="gray.200" rounded="md" p={3} w="100%">
              <Text color="gray.700" fontWeight={600}>
                Select a user to view tasks.
              </Text>
            </Box>
          ) : (
            <>
              {tasksErr ? (
                <Box bg="red.50" borderWidth="1px" borderColor="red.200" rounded="md" p={3} w="100%">
                  <Text color="red.700" fontWeight={600}>
                    Failed to load tasks
                  </Text>
                  <Text color="red.700" fontSize="sm">
                    {tasksErr}
                  </Text>
                </Box>
              ) : null}

              <HStack justify="space-between" w="100%">
                <Text fontSize="sm" color="gray.600">
                  Loaded tasks for {taskLists.length} lists. Total tasks loaded: {counts.tasks}.
                </Text>
                <HStack gap={2}>
                  <Badge>{tasksIsDemoMode === "safe" ? "isDemo safe" : "isDemo full"}</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => loadMoreTaskListsAndTasks({ reset: true })}
                    loading={taskListsLoading || tasksLoading}
                  >
                    Load tasks (first page)
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => loadMoreTaskListsAndTasks()}
                    loading={taskListsLoading || tasksLoading}
                    disabled={!taskListsHasMore}
                  >
                    Load tasks for more lists
                  </Button>
                </HStack>
              </HStack>

              {tasksIsDemoMode === "safe" ? (
                <Box bg="yellow.50" borderWidth="1px" borderColor="yellow.200" rounded="md" p={3} w="100%">
                  <Text color="yellow.900" fontWeight={700} fontSize="sm">
                    Tasks loaded without isDemo
                  </Text>
                  <Text color="yellow.900" fontSize="sm">
                    Some legacy Task records are missing the required `isDemo` field, so admin is falling back to a safe query.
                    The isDemo filter/column may be incorrect until legacy records are backfilled.
                  </Text>
                </Box>
              ) : null}

              {cappedTaskListIds.length ? (
                <Box bg="yellow.50" borderWidth="1px" borderColor="yellow.200" rounded="md" p={3} w="100%">
                  <Text color="yellow.900" fontWeight={700} fontSize="sm">
                    Task loading capped
                  </Text>
                  <Text color="yellow.900" fontSize="sm">
                    Some lists have more than the per-list cap (currently 300). Loaded partial results for: {cappedTaskListIds.slice(0, 10).join(", ")}
                    {cappedTaskListIds.length > 10 ? " …" : ""}
                  </Text>
                </Box>
              ) : null}

              <Box w="100%" borderWidth="1px" borderColor="gray.200" rounded="md" p={3}>
                <Heading size="sm" mb={2}>
                  Filters
                </Heading>
                <Separator mb={2} />
                <HStack gap={3} flexWrap="wrap">
                  <Input placeholder="Search title" size="sm" value={taskSearch} onChange={(e) => setTaskSearch(e.target.value)} maxW="260px" />
                  <Box borderWidth="1px" rounded="md" px={2} py={1}>
                    <select
                      value={taskStatusFilter}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => setTaskStatusFilter(parseStatusFilter(e.target.value))}
                      style={{ background: "transparent", fontSize: "0.875rem" }}
                    >
                      <option value="all">All statuses</option>
                      <option value={TaskStatus.Open}>Open</option>
                      <option value={TaskStatus.Done}>Done</option>
                    </select>
                  </Box>
                  <Box borderWidth="1px" rounded="md" px={2} py={1}>
                    <select
                      value={taskPriorityFilter}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => setTaskPriorityFilter(parsePriorityFilter(e.target.value))}
                      style={{ background: "transparent", fontSize: "0.875rem" }}
                    >
                      <option value="all">All priorities</option>
                      <option value={TaskPriority.Low}>Low</option>
                      <option value={TaskPriority.Medium}>Medium</option>
                      <option value={TaskPriority.High}>High</option>
                    </select>
                  </Box>
                  <Box borderWidth="1px" rounded="md" px={2} py={1}>
                    <select
                      value={taskDemoFilter}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => setTaskDemoFilter(parseDemoFilter(e.target.value))}
                      style={{ background: "transparent", fontSize: "0.875rem" }}
                    >
                      <option value="all">All</option>
                      <option value="demo">Demo only</option>
                      <option value="non-demo">Non-demo only</option>
                    </select>
                  </Box>
                  <Badge>Visible: {visibleTasks.length}</Badge>
                </HStack>
              </Box>

              <Box w="100%" borderWidth="1px" borderColor="gray.200" rounded="md" overflowX="auto">
                <HStack px={3} py={2} bg="gray.50" borderBottomWidth="1px" borderColor="gray.200" justify="space-between">
                  <Text fontSize="sm" fontWeight={700} w="320px">
                    Title
                  </Text>
                  <Text fontSize="sm" fontWeight={700} w="160px">
                    List
                  </Text>
                  <Text fontSize="sm" fontWeight={700} w="90px" textAlign="right">
                    Status
                  </Text>
                  <Text fontSize="sm" fontWeight={700} w="90px" textAlign="right">
                    Priority
                  </Text>
                  <Text fontSize="sm" fontWeight={700} w="80px" textAlign="right">
                    isDemo
                  </Text>
                </HStack>
                <VStack align="stretch" gap={0}>
                  {visibleTasks.slice(0, 500).map((t) => (
                    <HStack key={t.id} px={3} py={2} borderBottomWidth="1px" borderColor="gray.100" justify="space-between">
                      <Text fontSize="sm" w="320px" fontWeight={600} lineClamp={1}>
                        {t.title}
                      </Text>
                      <Text fontSize="sm" w="160px" color="gray.700" lineClamp={1}>
                        {t.__listName ?? "(unknown list)"}
                      </Text>
                      <Text fontSize="sm" w="90px" textAlign="right">
                        {t.status}
                      </Text>
                      <Text fontSize="sm" w="90px" textAlign="right">
                        {t.priority}
                      </Text>
                      <Text fontSize="sm" w="80px" textAlign="right">
                        {String(t.isDemo)}
                      </Text>
                    </HStack>
                  ))}
                  {visibleTasks.length > 500 ? (
                    <Box p={3}>
                      <Text fontSize="sm" color="gray.600">
                        Showing first 500 matching tasks.
                      </Text>
                    </Box>
                  ) : null}
                  {visibleTasks.length === 0 && !tasksLoading ? (
                    <Box p={3}>
                      <Text fontSize="sm" color="gray.600">
                        No tasks loaded yet (or filters removed everything).
                      </Text>
                    </Box>
                  ) : null}
                </VStack>
              </Box>
            </>
          )}
        </VStack>
      ) : null}
    </VStack>
  );
}
