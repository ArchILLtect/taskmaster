import { Box, Heading, HStack, Spinner, Text, VStack, Badge, Separator, Button } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { isCurrentUserAdmin } from "../services/authIdentity";
import {
  backfillMissingUserProfileEmails,
  fetchAdminSnapshot,
  probeUserProfilesMissingEmail,
  type AdminSnapshot,
} from "../services/adminDataService";

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

export function AdminPage() {
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<AdminSnapshot | null>(null);
  const [repairingEmails, setRepairingEmails] = useState(false);
  const [emailRepairMsg, setEmailRepairMsg] = useState<string | null>(null);

  const [probingEmails, setProbingEmails] = useState(false);
  const [probeMsg, setProbeMsg] = useState<string | null>(null);
  const [probeMissingOwners, setProbeMissingOwners] = useState<string[]>([]);

  const [showUserProfiles, setShowUserProfiles] = useState(true);

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

  useEffect(() => {
    if (!isAdmin) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr(null);
      setEmailRepairMsg(null);
      try {
        const data = await fetchAdminSnapshot();
        if (cancelled) return;
        setSnapshot(data);
      } catch (e) {
        if (cancelled) return;
        setErr(errorToMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const userProfilesEmailMode = snapshot?.meta?.userProfilesEmailMode ?? "full";

  useEffect(() => {
    // Default: when safe-mode is active, hide the per-profile list (since all emails
    // display as missing in safe-mode and it can be confusing/noisy).
    if (userProfilesEmailMode === "safe") {
      setShowUserProfiles(false);
      return;
    }
    setShowUserProfiles(true);
  }, [userProfilesEmailMode]);

  const runEmailBackfill = async () => {
    setRepairingEmails(true);
    setEmailRepairMsg(null);
    try {
      const res = await backfillMissingUserProfileEmails();
      setEmailRepairMsg(`Backfill complete: updated=${res.updated}, skipped=${res.skipped}, failed=${res.failed}`);
      const data = await fetchAdminSnapshot();
      setSnapshot(data);
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
    return {
      lists: snapshot?.lists.length ?? 0,
      tasks: snapshot?.tasks.length ?? 0,
      userProfiles: snapshot?.userProfiles.length ?? 0,
    };
  }, [snapshot]);

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
        <HStack gap={2}>
          <Badge>Lists: {counts.lists}</Badge>
          <Badge>Tasks: {counts.tasks}</Badge>
          <Badge>UserProfiles: {counts.userProfiles}</Badge>
        </HStack>
      </HStack>

      {loading ? (
        <HStack gap={2} color="gray.600">
          <Spinner size="sm" />
          <Text fontSize="sm">Loading global data…</Text>
        </HStack>
      ) : null}

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

      {snapshot && userProfilesEmailMode === "safe" ? (
        <Box bg="yellow.50" borderWidth="1px" borderColor="yellow.200" rounded="md" p={3} w="100%">
          <HStack justify="space-between" align="start" w="100%" gap={3}>
            <Box>
              <Text color="yellow.900" fontWeight={700}>
                UserProfiles loaded in safe mode
              </Text>
              <Text color="yellow.900" fontSize="sm">
                Some legacy UserProfile records are missing the required `email` field, so the full query fails.
                You can backfill placeholder emails to unblock admin views.
              </Text>
              <Text color="yellow.900" fontSize="sm" mt={1}>
                Alternative (no placeholders): sign into the affected older accounts once. On login, the app will
                self-heal that account’s `UserProfile.email` from Cognito, then reload this page.
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

      {snapshot ? (
        <VStack align="start" gap={4} w="100%">
          <Box w="100%">
            <HStack justify="space-between" align="center" mb={2} w="100%">
              <Heading size="sm">User Profiles</Heading>
              {userProfilesEmailMode === "safe" ? (
                <Button size="xs" variant="outline" onClick={() => setShowUserProfiles((v) => !v)}>
                  {showUserProfiles ? "Hide" : "Show"}
                </Button>
              ) : null}
            </HStack>
            <Separator mb={2} />
            {userProfilesEmailMode === "safe" && !showUserProfiles ? (
              <Box bg="yellow.50" borderWidth="1px" borderColor="yellow.200" rounded="md" p={3}>
                <Text fontSize="sm" color="yellow.900" fontWeight={700}>
                  UserProfiles hidden
                </Text>
                <Text fontSize="sm" color="yellow.900">
                  Hidden because safe mode is active (at least one legacy profile is missing `email`, so emails can’t be shown reliably).
                  Use “Detect broken profiles” above to find which accounts need self-heal, or backfill placeholders.
                </Text>
              </Box>
            ) : (
              <VStack align="stretch" gap={2} w="100%">
                {snapshot.userProfiles.slice(0, 25).map((p) => (
                  <HStack key={p.id} justify="space-between" w="100%">
                    <HStack gap={2}>
                      {(() => {
                        const isPlaceholder = p.email.startsWith("missing+") && p.email.endsWith("@taskmaster.local");
                        const isMissing = !p.email || isPlaceholder;
                        const displayEmail = isMissing ? "(missing)" : p.email;
                        return (
                          <>
                            <Text fontWeight={600}>{displayEmail}</Text>
                            {isMissing ? (
                              <Badge bg="red.100" color="red.800" rounded="md">
                                Missing email
                              </Badge>
                            ) : null}
                          </>
                        );
                      })()}
                    </HStack>
                    <HStack gap={3}>
                      <Text fontSize="sm" color="gray.600">
                        owner={p.owner}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        seedVersion={p.seedVersion}
                      </Text>
                    </HStack>
                  </HStack>
                ))}
                {snapshot.userProfiles.length > 25 ? (
                  <Text fontSize="sm" color="gray.500">
                    Showing first 25 of {snapshot.userProfiles.length}.
                  </Text>
                ) : null}
              </VStack>
            )}
          </Box>

          <Box w="100%">
            <Heading size="sm" mb={2}>
              Lists
            </Heading>
            <Separator mb={2} />
            <VStack align="stretch" gap={2} w="100%">
              {snapshot.lists.slice(0, 25).map((l) => (
                <HStack key={l.id} justify="space-between" w="100%">
                  <Text fontWeight={600}>{l.name}</Text>
                  <Text fontSize="sm" color="gray.600">{l.id}</Text>
                </HStack>
              ))}
              {snapshot.lists.length > 25 ? (
                <Text fontSize="sm" color="gray.500">
                  Showing first 25 of {snapshot.lists.length}.
                </Text>
              ) : null}
            </VStack>
          </Box>

          <Box w="100%">
            <Heading size="sm" mb={2}>
              Tasks
            </Heading>
            <Separator mb={2} />
            <Text fontSize="sm" color="gray.600">
              Total tasks loaded: {snapshot.tasks.length}
            </Text>
          </Box>
        </VStack>
      ) : null}
    </VStack>
  );
}
