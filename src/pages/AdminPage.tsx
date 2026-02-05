import { Box, Heading, HStack, Spinner, Text, VStack, Badge, Separator, Button, Input, Checkbox } from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { FiInfo } from "react-icons/fi";
import { isCurrentUserAdmin } from "../services/authIdentity";
import { Tooltip } from "../components/ui/Tooltip";
import { Tip } from "../components/ui/Tip";
import {
  backfillMissingUserProfileEmails,
  listUserProfilesByEmailAdminPage,
  listUserProfilesWithEmailAdminPage,
  listTaskListsOwnedAdminPage,
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

  type TabKey = "emails" | "accounts" | "lists" | "tasks";
  const [tab, setTab] = useState<TabKey>("emails");

  const [selectedOwnerSub, setSelectedOwnerSub] = useState<string | null>(null);

  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  // Emails (paginated): includes only profiles where `email` is a real string.
  const [emailProfiles, setEmailProfiles] = useState<UserProfileUI[]>([]);
  const [emailsNextToken, setEmailsNextToken] = useState<string | null>(null);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [emailsErr, setEmailsErr] = useState<string | null>(null);
  const [emailSearch, setEmailSearch] = useState("");

  // Accounts for selected email (paginated)
  const [accounts, setAccounts] = useState<UserProfileUI[]>([]);
  const [accountsNextToken, setAccountsNextToken] = useState<string | null>(null);
  const [accountsEmailMode, setAccountsEmailMode] = useState<AdminEmailMode>("full");
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accountsErr, setAccountsErr] = useState<string | null>(null);

  // Lists (paginated)
  const [lists, setLists] = useState<ListUI[]>([]);
  const [listsNextToken, setListsNextToken] = useState<string | null>(null);
  const [listsIsDemoMode, setListsIsDemoMode] = useState<"full" | "safe">("full");
  const [listsLoading, setListsLoading] = useState(false);
  const [listsErr, setListsErr] = useState<string | null>(null);

  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);

  // Tasks (selected lists only)
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

  const initialEmailsLoadedRef = useRef(false);

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

  const loadEmailsPage = async (opts?: { reset?: boolean }) => {
    if (!isAdmin) return;
    if (emailsLoading) return;

    setEmailsLoading(true);
    setEmailsErr(null);
    setErr(null);

    try {
      const nextToken = opts?.reset ? null : emailsNextToken;
      const page = await listUserProfilesWithEmailAdminPage({
        limit: 100,
        nextToken,
      });

      setEmailProfiles((prev) => (opts?.reset ? page.items : [...prev, ...page.items]));
      setEmailsNextToken(page.nextToken);
    } catch (e) {
      setEmailsErr(errorToMessage(e));
    } finally {
      setEmailsLoading(false);
    }
  };

  const loadAccountsPage = async (opts?: { reset?: boolean }) => {
    if (!isAdmin) return;
    if (!selectedEmail) return;
    if (accountsLoading) return;

    setAccountsLoading(true);
    setAccountsErr(null);
    setErr(null);

    try {
      const nextToken = opts?.reset ? null : accountsNextToken;
      const page = await listUserProfilesByEmailAdminPage({
        email: selectedEmail,
        limit: 100,
        nextToken,
      });

      setAccountsEmailMode(page.emailMode);
      setAccounts((prev) => (opts?.reset ? page.items : [...prev, ...page.items]));
      setAccountsNextToken(page.nextToken);

      // Convenience: if this email only maps to a single account, auto-select it and
      // jump straight to the next step.
      const isFirstPage = opts?.reset === true;
      const isSingleAccountTotal = isFirstPage && page.items.length === 1 && !page.nextToken;
      if (isSingleAccountTotal && !selectedOwnerSub) {
        const only = page.items[0];
        const owner = only.owner || only.id;
        if (owner) {
          setSelectedOwnerSub(owner);
          resetOwnerScopedData();
          setTab("lists");
        }
      }
    } catch (e) {
      setAccountsErr(errorToMessage(e));
    } finally {
      setAccountsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    if (initialEmailsLoadedRef.current) return;
    initialEmailsLoadedRef.current = true;
    void loadEmailsPage({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const resetOwnerScopedData = () => {
    setLists([]);
    setListsNextToken(null);
    setListsErr(null);
    setListsIsDemoMode("full");

    setSelectedListIds([]);
    setTasksByListId({});
    setTasksErr(null);
    setCappedTaskListIds([]);
    setTasksIsDemoMode("full");
  };

  const clearOwnerSelection = () => {
    setSelectedEmail(null);
    setSelectedOwnerSub(null);
    setAccounts([]);
    setAccountsNextToken(null);
    setAccountsErr(null);
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
      // Refresh email list after backfill.
      await loadEmailsPage({ reset: true });
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
    const taskCount = Object.values(tasksByListId).reduce((acc, arr) => acc + arr.length, 0);
    return {
      emails: emailProfiles.length,
      accounts: accounts.length,
      lists: lists.length,
      tasks: taskCount,
    };
  }, [accounts.length, emailProfiles.length, lists.length, tasksByListId]);

  const emailsHasMore = !!emailsNextToken;
  const accountsHasMore = !!accountsNextToken;
  const listsHasMore = !!listsNextToken;

  const selectEmail = (email: string) => {
    const normalized = email.trim().toLowerCase();
    if (!normalized) return;
    setSelectedEmail(normalized);
    setSelectedOwnerSub(null);
    setAccounts([]);
    setAccountsNextToken(null);
    setAccountsErr(null);
    resetOwnerScopedData();
    setTab("accounts");
  };

  const selectAccount = (u: UserProfileUI) => {
    const owner = u.owner || u.id;
    if (!owner) return;
    setSelectedOwnerSub(owner);
    resetOwnerScopedData();
    setTab("lists");
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

  const loadTasksForSelectedLists = async (opts?: { reset?: boolean }) => {
    if (!selectedOwnerSub) return;
    if (tasksLoading) return;
    if (!selectedListIds.length) return;

    setTasksLoading(true);
    setTasksErr(null);

    try {
      if (opts?.reset) {
        setTasksByListId({});
        setCappedTaskListIds([]);
      }

      const res = await loadTasksForListsAdminPage({
        listIds: selectedListIds,
        concurrency: 4,
        perListPageLimit: 200,
        maxTasksPerList: 300,
      });

      setTasksIsDemoMode(res.isDemoMode);
      setTasksByListId(res.tasksByListId);
      setCappedTaskListIds(res.cappedLists);
    } catch (e) {
      setTasksErr(errorToMessage(e));
    } finally {
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

  useEffect(() => {
    if (tab !== "accounts") return;
    if (!selectedEmail) return;
    if (accounts.length) return;
    void loadAccountsPage({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, selectedEmail]);

  const tasksListNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const l of lists) map.set(l.id, l.name);
    return map;
  }, [lists]);

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

  const emails = useMemo(() => {
    const map = new Map<string, true>();
    const list: string[] = [];

    for (const p of emailProfiles) {
      const email = typeof p.email === "string" ? p.email.trim().toLowerCase() : "";
      if (!email) continue;
      if (map.has(email)) continue;
      map.set(email, true);
      list.push(email);
    }

    list.sort((a, b) => a.localeCompare(b));
    return list;
  }, [emailProfiles]);

  const filteredEmails = useMemo(() => {
    const q = emailSearch.trim().toLowerCase();
    if (!q) return emails;
    return emails.filter((e) => e.includes(q));
  }, [emailSearch, emails]);

  const selectedListsCount = selectedListIds.length;

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
        <Heading size="2xl">Admin</Heading>
        <Tip storageKey="tip:admin-scope" title="Tip">
          This page is restricted to admin users. It exposes cross-user diagnostics, so keep it out of screenshots and
          screen shares.
        </Tip>
        <Text color="gray.600">Not authorized.</Text>
      </VStack>
    );
  }

  return (
    <VStack align="start" gap={4} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
      <HStack justify="space-between" w="100%">
        <Heading size="md">Admin</Heading>
        <HStack gap={2} align="center">
          <Badge>Emails: {filteredEmails.length}</Badge>
          <Badge>Lists: {counts.lists}</Badge>
          <Badge>Tasks: {counts.tasks}</Badge>
        </HStack>
      </HStack>

      <Tip storageKey="tip:admin-modes" title="Tip">
        Some sections support “safe” modes to reduce sensitive data exposure. Use them if you’re demoing or debugging
        in shared environments.
      </Tip>

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

      <Box w="100%" borderWidth="1px" borderColor="gray.200" rounded="md" p={3}>
        <HStack justify="space-between" align="start" w="100%" gap={4}>
          <VStack align="start" gap={1} flex={1}>
            <Heading size="sm">Selection</Heading>
            <Text fontSize="sm" color="gray.600">
              Email: {selectedEmail ?? "(none)"}
            </Text>
            <Text fontSize="sm" color="gray.600">
              Account (owner/sub): {selectedOwnerSub ?? "(none)"}
            </Text>
            <Text fontSize="sm" color="gray.600">
              Lists selected: {selectedListsCount}
            </Text>
          </VStack>
          <VStack align="end" gap={2}>
            <HStack gap={2}>
              {selectedOwnerSub ? (
                <Button size="xs" variant="outline" onClick={copySelectedOwnerSub}>
                  Copy ownerSub
                </Button>
              ) : null}
              <Button size="xs" variant="outline" onClick={clearOwnerSelection}>
                Clear
              </Button>
            </HStack>
          </VStack>
        </HStack>
      </Box>

      {/* Tabs */}
      <HStack gap={2}>
        <Button size="sm" variant={tab === "emails" ? "solid" : "outline"} onClick={() => setTab("emails")}>
          Emails
        </Button>
        <Button
          size="sm"
          variant={tab === "accounts" ? "solid" : "outline"}
          onClick={() => setTab("accounts")}
          disabled={!selectedEmail}
        >
          Accounts
        </Button>
        <Button size="sm" variant={tab === "lists" ? "solid" : "outline"} onClick={() => setTab("lists")} disabled={!selectedOwnerSub}>
          Lists
        </Button>
        <Button
          size="sm"
          variant={tab === "tasks" ? "solid" : "outline"}
          onClick={() => setTab("tasks")}
          disabled={!selectedOwnerSub || selectedListIds.length === 0}
        >
          Tasks
        </Button>
      </HStack>

      {/* Emails tab */}
      {tab === "emails" ? (
        <VStack align="start" gap={3} w="100%">
          <Box w="100%" borderWidth="1px" borderColor="gray.200" rounded="md" p={3}>
            <HStack justify="space-between" align="center" w="100%">
              <Heading size="sm">Pick an email</Heading>
              <HStack gap={2}>
                <Input
                  placeholder="Filter emails"
                  value={emailSearch}
                  onChange={(e) => setEmailSearch(e.target.value)}
                  size="sm"
                  w="260px"
                  name="emailSearch"
                />
                <Button size="sm" variant="outline" onClick={() => loadEmailsPage({ reset: true })} loading={emailsLoading}>
                  Refresh
                </Button>
                <Button size="sm" variant="outline" onClick={() => loadEmailsPage()} loading={emailsLoading} disabled={!emailsHasMore}>
                  Load more
                </Button>
              </HStack>
            </HStack>

            {emailsErr ? (
              <Box mt={3} bg="red.50" borderWidth="1px" borderColor="red.200" rounded="md" p={2}>
                <Text color="red.700" fontSize="sm">
                  {emailsErr}
                </Text>
              </Box>
            ) : null}

            <Box mt={3} maxH="260px" overflowY="auto" borderWidth="1px" borderColor="gray.100" rounded="md">
              {filteredEmails.length === 0 && !emailsLoading ? (
                <Box p={3}>
                  <Text fontSize="sm" color="gray.600">
                    No emails loaded (or filter removed everything).
                  </Text>
                </Box>
              ) : (
                <VStack align="stretch" gap={0}>
                  {filteredEmails.slice(0, 300).map((email) => {
                    const isSelected = selectedEmail === email;
                    return (
                      <Box
                        key={email}
                        px={3}
                        py={2}
                        borderBottomWidth="1px"
                        borderColor="gray.100"
                        bg={isSelected ? "blue.50" : "white"}
                        _hover={{ bg: "gray.50" }}
                        cursor="pointer"
                        onClick={() => selectEmail(email)}
                      >
                        <HStack justify="space-between" align="center" w="100%">
                          <Text fontSize="sm" fontWeight={700}>
                            {email}
                          </Text>
                          {isSelected ? <Badge>Selected</Badge> : null}
                        </HStack>
                      </Box>
                    );
                  })}
                </VStack>
              )}
            </Box>
          </Box>

          <Box bg="gray.50" borderWidth="1px" borderColor="gray.200" rounded="md" p={3} w="100%">
            <HStack justify="space-between" align="start" w="100%" gap={3}>
              <Box>
                <Text color="gray.800" fontWeight={700}>
                  Diagnostics (legacy profiles)
                </Text>
                <Text color="gray.600" fontSize="sm">
                  The Emails list only includes profiles that already have a valid `email`. If some accounts are missing email,
                  use these tools to find/fix them.
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
        </VStack>
      ) : null}

      {/* Accounts tab */}
      {tab === "accounts" ? (
        <VStack align="start" gap={3} w="100%">
          {!selectedEmail ? (
            <Box bg="gray.50" borderWidth="1px" borderColor="gray.200" rounded="md" p={3} w="100%">
              <Text color="gray.700" fontWeight={600}>
                Select an email first.
              </Text>
            </Box>
          ) : (
            <>
              {accountsErr ? (
                <Box bg="red.50" borderWidth="1px" borderColor="red.200" rounded="md" p={3} w="100%">
                  <Text color="red.700" fontWeight={600}>
                    Failed to load accounts
                  </Text>
                  <Text color="red.700" fontSize="sm">
                    {accountsErr}
                  </Text>
                </Box>
              ) : null}

              <HStack justify="space-between" w="100%">
                <Text fontSize="sm" color="gray.600">
                  Loaded {accounts.length} accounts for {selectedEmail}
                  {accountsHasMore ? " (more available)" : ""}.
                </Text>
                <HStack gap={2}>
                  <Badge>{accountsEmailMode === "safe" ? "Safe mode" : "Full"}</Badge>
                  <Button size="sm" variant="outline" onClick={() => loadAccountsPage({ reset: true })} loading={accountsLoading}>
                    Refresh
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => loadAccountsPage()} loading={accountsLoading} disabled={!accountsHasMore}>
                    Load more
                  </Button>
                </HStack>
              </HStack>

              <Box w="100%" borderWidth="1px" borderColor="gray.200" rounded="md" overflowX="auto">
                <HStack px={3} py={2} bg="gray.50" borderBottomWidth="1px" borderColor="gray.200" justify="space-between">
                  <Text fontSize="sm" fontWeight={700} w="260px">
                    Display
                  </Text>
                  <Text fontSize="sm" fontWeight={700} w="360px">
                    owner/sub
                  </Text>
                  <Text fontSize="sm" fontWeight={700} w="260px" textAlign="right">
                    profile id
                  </Text>
                </HStack>
                <VStack align="stretch" gap={0}>
                  {accounts.map((u) => {
                    const ownerSub = u.owner || u.id;
                    const isSelected = selectedOwnerSub === ownerSub;
                    const label = u.displayName || u.email || ownerSub;
                    return (
                      <HStack
                        key={u.id}
                        px={3}
                        py={2}
                        borderBottomWidth="1px"
                        borderColor="gray.100"
                        justify="space-between"
                        bg={isSelected ? "blue.50" : "white"}
                        _hover={{ bg: "gray.50" }}
                        cursor="pointer"
                        onClick={() => selectAccount(u)}
                      >
                        <Text fontSize="sm" w="260px" fontWeight={600} lineClamp={1}>
                          {label}
                        </Text>
                        <Text fontSize="xs" w="360px" color="gray.600" lineClamp={1}>
                          {ownerSub}
                        </Text>
                        <Text fontSize="xs" w="260px" textAlign="right" color="gray.600" lineClamp={1}>
                          {u.id}
                        </Text>
                      </HStack>
                    );
                  })}

                  {accounts.length === 0 && !accountsLoading ? (
                    <Box p={3}>
                      <Text fontSize="sm" color="gray.600">
                        No accounts loaded.
                      </Text>
                    </Box>
                  ) : null}
                </VStack>
              </Box>
            </>
          )}
        </VStack>
      ) : null}

      {/* Lists tab */}
      {tab === "lists" ? (
        <VStack align="start" gap={3} w="100%">
          {!selectedOwnerSub ? (
            <Box bg="gray.50" borderWidth="1px" borderColor="gray.200" rounded="md" p={3} w="100%">
              <Text color="gray.700" fontWeight={600}>
                Select an account to view lists.
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
                  Loaded {lists.length} lists{listsHasMore ? " (more available)" : ""}. Selected: {selectedListsCount}.
                </Text>
                <HStack gap={2}>
                  <Badge>{listsIsDemoMode === "safe" ? "isDemo safe" : "isDemo full"}</Badge>
                  <Button size="sm" variant="outline" onClick={() => loadListsPage({ reset: true })} loading={listsLoading}>
                    Refresh
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => loadListsPage()} loading={listsLoading} disabled={!listsHasMore}>
                    Load more
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedListIds(lists.map((l) => l.id))}
                    disabled={lists.length === 0}
                  >
                    Select all loaded
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setSelectedListIds([])} disabled={selectedListIds.length === 0}>
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setTab("tasks");
                      void loadTasksForSelectedLists({ reset: true });
                    }}
                    disabled={selectedListIds.length === 0 || tasksLoading}
                    loading={tasksLoading}
                  >
                    Load tasks
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
                    Include
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
                      <Box w="90px" textAlign="right">
                        <Checkbox.Root
                          checked={selectedListIds.includes(l.id)}
                          onCheckedChange={() => {
                            setSelectedListIds((prev) =>
                              prev.includes(l.id) ? prev.filter((id) => id !== l.id) : [...prev, l.id]
                            );
                          }}
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control />
                        </Checkbox.Root>
                      </Box>
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
                Select an account to view tasks.
              </Text>
            </Box>
          ) : selectedListIds.length === 0 ? (
            <Box bg="gray.50" borderWidth="1px" borderColor="gray.200" rounded="md" p={3} w="100%">
              <Text color="gray.700" fontWeight={600}>
                Select one or more lists first.
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
                  Selected lists: {selectedListIds.length}. Total tasks loaded: {counts.tasks}.
                </Text>
                <HStack gap={2}>
                  <Badge>{tasksIsDemoMode === "safe" ? "isDemo safe" : "isDemo full"}</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => loadTasksForSelectedLists({ reset: true })}
                    loading={tasksLoading}
                  >
                    Load tasks
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
                  <Box>
                    <HStack gap={1} mb={1} align="center">
                      <Text fontSize="sm" color="gray.600" fontWeight={500}>
                        Search
                      </Text>
                      <Tooltip content="Search tasks by title." showArrow>
                        <Box as="span" color="gray.500" cursor="help" lineHeight="0">
                          <FiInfo />
                        </Box>
                      </Tooltip>
                    </HStack>
                    <Input
                      placeholder="Search title"
                      size="sm"
                      value={taskSearch}
                      onChange={(e) => setTaskSearch(e.target.value)}
                      maxW="260px"
                      name="taskSearch"
                    />
                  </Box>
                  <Box borderWidth="1px" rounded="md" px={2} py={1}>
                    <select
                      value={taskStatusFilter}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => setTaskStatusFilter(parseStatusFilter(e.target.value))}
                      name="taskStatusFilter"
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
                      name="taskPriorityFilter"
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
                      name="taskDemoFilter"
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
