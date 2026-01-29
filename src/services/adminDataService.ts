import { taskmasterApi } from "../api/taskmasterApi";
import { toListUI, toTaskUI, toUserProfileUI } from "../api/mappers";
import { ModelAttributeTypes } from "../API";
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

function shouldFallbackUserProfilesWithoutEmail(err: unknown): boolean {
  const msg = errorToMessage(err);
  return msg.includes("Cannot return null for non-nullable type") && msg.includes("UserProfile") && msg.includes("email");
}

function shouldFallbackMissingIsDemo(err: unknown): boolean {
  const msg = errorToMessage(err);
  return msg.includes("Cannot return null for non-nullable type") && msg.includes("isDemo");
}

function isConditionalCheckFailed(err: unknown): boolean {
  const msg = errorToMessage(err).toLowerCase();
  return msg.includes("conditional") || msg.includes("conditionalcheckfailed");
}

function placeholderEmailForProfile(profileId: string): string {
  // Valid AWSEmail placeholder to satisfy schema for legacy records.
  // The UI can treat `missing+...@taskmaster.local` as "missing".
  const safe = profileId.replace(/[^a-zA-Z0-9._-]/g, "-");
  return `missing+${safe}@taskmaster.local`;
}

function mapWithConcurrency<T, R>(items: T[], concurrency: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const safeConcurrency = Math.max(1, Math.floor(concurrency || 1));
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  const workerCount = Math.min(safeConcurrency, items.length);
  const workers = Array.from({ length: workerCount }, async () => {
    while (true) {
      const idx = nextIndex;
      nextIndex += 1;
      if (idx >= items.length) return;
      results[idx] = await fn(items[idx]);
    }
  });

  return Promise.all(workers).then(() => results);
}

export type AdminSnapshot = {
  lists: ListUI[];
  tasks: TaskUI[];
  userProfiles: UserProfileUI[];
  meta?: {
    userProfilesEmailMode?: "full" | "safe";
  };
};

async function fetchAllTaskLists(limit = 200): Promise<ListUI[]> {
  const all: ListUI[] = [];
  let nextToken: string | null | undefined = null;

  do {
    const page = await taskmasterApi.listTaskLists({
      limit,
      nextToken,
    });

    all.push(...page.items.map((l) => toListUI(l as Parameters<typeof toListUI>[0])));
    nextToken = page.nextToken ?? null;
  } while (nextToken);

  return all;
}

async function fetchAllUserProfiles(limit = 200): Promise<{ userProfiles: UserProfileUI[]; emailMode: "full" | "safe" }> {
  const all: UserProfileUI[] = [];
  let nextToken: string | null | undefined = null;

  // Prefer full query (includes email). If legacy records violate non-nullable email,
  // fall back to the safe query (omits email) so the admin page can still load.
  let emailMode: "full" | "safe" = "full";
  let useSafe = false;

  do {
    let page: Awaited<ReturnType<typeof taskmasterApi.listUserProfiles>>;

    if (!useSafe) {
      try {
        page = await taskmasterApi.listUserProfiles({
          limit,
          nextToken,
        });
      } catch (err) {
        if (!shouldFallbackUserProfilesWithoutEmail(err)) throw err;
        useSafe = true;
        emailMode = "safe";
        page = await taskmasterApi.listUserProfilesSafe({
          limit,
          nextToken,
        });
      }
    } else {
      page = await taskmasterApi.listUserProfilesSafe({
        limit,
        nextToken,
      });
    }

    all.push(...page.items.map((p) => toUserProfileUI(p as Parameters<typeof toUserProfileUI>[0])));
    nextToken = page.nextToken ?? null;
  } while (nextToken);

  return { userProfiles: all, emailMode };
}

async function fetchAllTasksForList(listId: string, perPageLimit = 500): Promise<TaskUI[]> {
  const all: TaskUI[] = [];
  let nextToken: string | null | undefined = null;

  do {
    const page = await taskmasterApi.tasksByList({
      listId,
      sortOrder: { ge: 0 },
      limit: perPageLimit,
      nextToken,
    });

    all.push(...page.items.map((t) => toTaskUI(t as Parameters<typeof toTaskUI>[0])));
    nextToken = page.nextToken ?? null;
  } while (nextToken);

  return all;
}

export async function fetchAdminSnapshot(opts?: {
  listPageLimit?: number;
  userProfilePageLimit?: number;
  tasksPerListPageLimit?: number;
}): Promise<AdminSnapshot> {
  const lists = await fetchAllTaskLists(opts?.listPageLimit ?? 200);
  const userProfilesRes = await fetchAllUserProfiles(opts?.userProfilePageLimit ?? 200);
  const userProfiles = userProfilesRes.userProfiles;

  // Keep this sequential to avoid slamming AppSync with N parallel queries.
  const allTasks: TaskUI[] = [];
  for (const l of lists) {
    const tasks = await fetchAllTasksForList(l.id, opts?.tasksPerListPageLimit ?? 500);
    allTasks.push(...tasks);
  }

  // Deterministic ordering
  lists.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  allTasks.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  userProfiles.sort((a, b) => {
    const ak = a.email || a.owner || a.id;
    const bk = b.email || b.owner || b.id;
    const primary = ak.localeCompare(bk);
    if (primary !== 0) return primary;
    return (a.id || "").localeCompare(b.id || "");
  });

  return { lists, tasks: allTasks, userProfiles, meta: { userProfilesEmailMode: userProfilesRes.emailMode } };
}

export async function backfillMissingUserProfileEmails(opts?: { limit?: number }): Promise<{
  updated: number;
  skipped: number;
  failed: number;
}> {
  // We must use the safe listing so we don't trip the non-null email error.
  const { userProfiles } = await fetchAllUserProfiles(opts?.limit ?? 200);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const p of userProfiles) {
    // Conditional update: only set placeholder if `email` attribute does not exist.
    try {
      await taskmasterApi.updateUserProfile(
        {
          id: p.id,
          email: placeholderEmailForProfile(p.id),
        },
        {
          or: [
            { email: { attributeExists: false } },
            { email: { attributeType: ModelAttributeTypes._null } },
          ],
        }
      );
      updated += 1;
    } catch (err) {
      if (isConditionalCheckFailed(err)) {
        skipped += 1;
        continue;
      }
      failed += 1;
      if (import.meta.env.DEV) {
        console.error("[admin backfill] failed", err);
      }
    }
  }

  return { updated, skipped, failed };
}

export async function probeUserProfilesMissingEmail(opts?: { limit?: number }): Promise<{
  missing: Array<{ id: string; owner: string }>;
  ok: number;
  failed: Array<{ id: string; owner: string; error: string }>;
}> {
  const { userProfiles } = await fetchAllUserProfiles(opts?.limit ?? 200);

  const missing: Array<{ id: string; owner: string }> = [];
  const failed: Array<{ id: string; owner: string; error: string }> = [];
  let ok = 0;

  // Sequential to avoid hammering AppSync.
  for (const p of userProfiles) {
    try {
      const res = await taskmasterApi.getUserProfileEmailProbe(p.id);
      const email = typeof (res as { email?: unknown } | null)?.email === "string" ? String((res as { email?: unknown }).email) : "";
      if (!email) {
        missing.push({ id: p.id, owner: p.owner });
      } else {
        ok += 1;
      }
    } catch (err) {
      const msg = errorToMessage(err);
      if (shouldFallbackUserProfilesWithoutEmail(err)) {
        missing.push({ id: p.id, owner: p.owner });
      } else {
        failed.push({ id: p.id, owner: p.owner, error: msg });
      }
    }
  }

  return { missing, ok, failed };
}

// -----------------------------
// AdminPage v2 (owner-first)
// -----------------------------

export type AdminEmailMode = "full" | "safe";

export type AdminUserProfilesPage = {
  items: UserProfileUI[];
  nextToken: string | null;
  emailMode: AdminEmailMode;
};

export async function listUserProfilesAdminPage(opts?: {
  limit?: number;
  nextToken?: string | null;
  emailMode?: AdminEmailMode;
}): Promise<AdminUserProfilesPage> {
  const limit = opts?.limit ?? 50;
  const nextToken = opts?.nextToken ?? null;
  const requestedMode: AdminEmailMode | undefined = opts?.emailMode;

  if (requestedMode === "safe") {
    const page = await taskmasterApi.listUserProfilesSafe({ limit, nextToken });
    return {
      items: page.items.map((p) => toUserProfileUI(p as Parameters<typeof toUserProfileUI>[0])),
      nextToken: page.nextToken ?? null,
      emailMode: "safe",
    };
  }

  try {
    const page = await taskmasterApi.listUserProfiles({ limit, nextToken });
    return {
      items: page.items.map((p) => toUserProfileUI(p as Parameters<typeof toUserProfileUI>[0])),
      nextToken: page.nextToken ?? null,
      emailMode: "full",
    };
  } catch (err) {
    if (!shouldFallbackUserProfilesWithoutEmail(err)) throw err;
    const page = await taskmasterApi.listUserProfilesSafe({ limit, nextToken });
    return {
      items: page.items.map((p) => toUserProfileUI(p as Parameters<typeof toUserProfileUI>[0])),
      nextToken: page.nextToken ?? null,
      emailMode: "safe",
    };
  }
}

export type AdminTaskListsPage = {
  items: ListUI[];
  nextToken: string | null;
  isDemoMode: "full" | "safe";
};

export async function listTaskListsOwnedAdminPage(opts: {
  ownerSub: string;
  limit?: number;
  nextToken?: string | null;
}): Promise<AdminTaskListsPage> {
  try {
    const page = await taskmasterApi.listTaskListsOwnedAdmin({
      ownerSub: opts.ownerSub,
      limit: opts.limit ?? 50,
      nextToken: opts.nextToken ?? null,
    });

    return {
      items: page.items.map((l) => toListUI(l as Parameters<typeof toListUI>[0])),
      nextToken: page.nextToken ?? null,
      isDemoMode: "full",
    };
  } catch (err) {
    if (!shouldFallbackMissingIsDemo(err)) throw err;

    // Safe fallback: omit isDemo selection (will map to false).
    const page = await taskmasterApi.listTaskListsOwned({
      ownerSub: opts.ownerSub,
      limit: opts.limit ?? 50,
      nextToken: opts.nextToken ?? null,
    });

    return {
      items: page.items.map((l) => toListUI(l as Parameters<typeof toListUI>[0])),
      nextToken: page.nextToken ?? null,
      isDemoMode: "safe",
    };
  }
}

export type AdminTasksLoadResult = {
  tasksByListId: Record<string, TaskUI[]>;
  loadedListCount: number;
  loadedTaskCount: number;
  cappedLists: string[];
  hasMoreByListId: Record<string, boolean>;
  isDemoMode: "full" | "safe";
};

async function fetchTasksForListCapped(listId: string, opts?: { perPageLimit?: number; maxTasks?: number }) {
  const perPageLimit = opts?.perPageLimit ?? 200;
  const maxTasks = opts?.maxTasks ?? 300;

  const tasks: TaskUI[] = [];
  let nextToken: string | null | undefined = null;

  let isDemoMode: "full" | "safe" = "full";

  do {
    const limit = Math.min(perPageLimit, Math.max(1, maxTasks - tasks.length));

    let page: Awaited<ReturnType<typeof taskmasterApi.tasksByListAdmin>>;
    try {
      page = await taskmasterApi.tasksByListAdmin({
        listId,
        sortOrder: { ge: 0 },
        limit,
        nextToken,
      });
    } catch (err) {
      if (!shouldFallbackMissingIsDemo(err)) throw err;
      isDemoMode = "safe";
      page = await taskmasterApi.tasksByList({
        listId,
        sortOrder: { ge: 0 },
        limit,
        nextToken,
      });
    }

    tasks.push(...page.items.map((t) => toTaskUI(t as Parameters<typeof toTaskUI>[0])));
    nextToken = page.nextToken ?? null;

    if (tasks.length >= maxTasks) {
      // Cap reached: stop even if server has more.
      break;
    }
  } while (nextToken);

  const capped = tasks.length >= maxTasks && !!nextToken;
  const hasMore = !!nextToken && !capped;

  return { listId, tasks, capped, hasMore, isDemoMode };
}

export async function loadTasksForListsAdminPage(opts: {
  listIds: string[];
  concurrency?: number;
  perListPageLimit?: number;
  maxTasksPerList?: number;
}): Promise<AdminTasksLoadResult> {
  const listIds = (opts.listIds ?? []).filter(Boolean);
  const concurrency = opts.concurrency ?? 4;
  const perListPageLimit = opts.perListPageLimit ?? 200;
  const maxTasksPerList = opts.maxTasksPerList ?? 300;

  const results = await mapWithConcurrency(listIds, concurrency, async (listId) => {
    return await fetchTasksForListCapped(listId, { perPageLimit: perListPageLimit, maxTasks: maxTasksPerList });
  });

  const tasksByListId: Record<string, TaskUI[]> = {};
  const hasMoreByListId: Record<string, boolean> = {};
  const cappedLists: string[] = [];
  let isDemoMode: "full" | "safe" = "full";

  for (const r of results) {
    tasksByListId[r.listId] = r.tasks;
    hasMoreByListId[r.listId] = r.hasMore;
    if (r.capped) cappedLists.push(r.listId);
    if (r.isDemoMode === "safe") isDemoMode = "safe";
  }

  const loadedTaskCount = Object.values(tasksByListId).reduce((acc, arr) => acc + arr.length, 0);

  return {
    tasksByListId,
    loadedListCount: listIds.length,
    loadedTaskCount,
    cappedLists,
    hasMoreByListId,
    isDemoMode,
  };
}
