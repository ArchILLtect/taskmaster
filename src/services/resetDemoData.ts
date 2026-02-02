import { getCurrentUser } from "aws-amplify/auth";

import { taskmasterApi } from "../api/taskmasterApi";
import { bootstrapUser } from "./userBootstrapService";
import { getTaskStoreState } from "../store/taskStore";
import { useInboxStore } from "../store/inboxStore";
import { useUpdatesStore } from "../store/updatesStore";
import { findInboxListIdByName, getInboxListId, setInboxListId } from "../config/inboxSettings";

function errorToMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (typeof err === "object" && err !== null && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return "Unknown error";
}

async function listAllTaskListsOwned(): Promise<Array<{ id: string; name?: string | null }>> {
  const all: Array<{ id: string; name?: string | null }> = [];
  let nextToken: string | null | undefined = null;

  do {
    const page = await taskmasterApi.listTaskListsOwned({ limit: 200, nextToken });
    all.push(...page.items.filter((x): x is NonNullable<typeof x> => !!x));
    nextToken = page.nextToken ?? null;
  } while (nextToken);

  return all;
}

async function listAllTaskIdsForList(listId: string): Promise<string[]> {
  const all: string[] = [];
  let nextToken: string | null | undefined = null;

  do {
    const page = await taskmasterApi.tasksByList({ listId, sortOrder: { ge: 0 }, limit: 500, nextToken });
    for (const t of page.items) {
      const id = String((t as { id?: unknown } | null | undefined)?.id ?? "");
      if (id) all.push(id);
    }
    nextToken = page.nextToken ?? null;
  } while (nextToken);

  return all;
}

async function deleteTaskIds(taskIds: string[]): Promise<void> {
  // Keep concurrency modest to avoid tripping API throttles.
  const chunkSize = 10;
  for (let i = 0; i < taskIds.length; i += chunkSize) {
    const chunk = taskIds.slice(i, i + chunkSize);
    const results = await Promise.allSettled(chunk.map((id) => taskmasterApi.deleteTask({ id })));
    const rejected = results.find((r) => r.status === "rejected");
    if (rejected && rejected.status === "rejected") throw rejected.reason;
  }
}

async function deleteListIds(listIds: string[]): Promise<void> {
  for (const listId of listIds) {
    await taskmasterApi.deleteTaskListSafeById(listId);
  }
}

export async function resetDemoData(): Promise<void> {
  // Requires auth; keep this helper strict so callers can surface a clear message.
  await getCurrentUser();

  // Clear UX-only local state first to avoid stale UI while the reset runs.
  useInboxStore.getState().resetAll?.();
  useUpdatesStore.getState().resetAll?.();

  // Clear persisted UX state for the current user scope.
  try {
    await Promise.all([
      useInboxStore.persist.clearStorage(),
      useUpdatesStore.persist.clearStorage(),
    ]);
  } catch {
    // ignore
  }

  // 1) Load all lists (owned by current user)
  const lists = await listAllTaskListsOwned();

  // 2) Determine the system inbox list id (must be preserved)
  const storedInboxId = getInboxListId();
  const byNameInboxId = findInboxListIdByName(lists);
  const inboxListId = byNameInboxId || storedInboxId;

  if (byNameInboxId && byNameInboxId !== storedInboxId) {
    setInboxListId(byNameInboxId);
  }

  // 3) Delete *all tasks* (including those in inbox), then delete all lists except inbox
  for (const l of lists) {
    const listId = String((l as { id?: unknown } | null | undefined)?.id ?? "");
    if (!listId) continue;

    const taskIds = await listAllTaskIdsForList(listId);
    if (taskIds.length) {
      await deleteTaskIds(taskIds);
    }
  }

  const listIdsToDelete = lists
    .map((l) => String((l as { id?: unknown } | null | undefined)?.id ?? ""))
    .filter(Boolean)
    .filter((id) => (inboxListId ? id !== inboxListId : true));

  await deleteListIds(listIdsToDelete);

  // 4) Reset seed gate so demo seed can run again.
  // NOTE: We rely on bootstrapUser() to claim + seed safely (multi-tab safe).
  const current = await getCurrentUser();
  const profileId = current.userId;
  try {
    await taskmasterApi.updateUserProfile({ id: profileId, seedVersion: 0, seededAt: null });
  } catch (err) {
    throw new Error(`Failed to reset seed version: ${errorToMessage(err)}`);
  }

  // 5) Re-seed demo dataset
  await bootstrapUser({ seedDemo: true });

  // 6) Clear updates again so seed events don't flood the feed
  useUpdatesStore.getState().resetAll?.();
  try {
    await useUpdatesStore.persist.clearStorage();
  } catch {
    // ignore
  }

  // 7) Refresh task store (also re-ensures inbox list exists and caches are updated)
  await getTaskStoreState().refreshAll(undefined, { reason: "mutation" });
}
