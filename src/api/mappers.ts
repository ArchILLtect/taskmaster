import type { DefaultVisibility, PlanTier, TaskPriority, TaskStatus } from "../API";
import type { TaskUI } from "../types/task";
import type { ListUI } from "../types/list";
import type { UserProfileUI } from "../types/userProfile";

/*
* Map from GraphQL types (from AppSync) to local types
* This is useful to decouple the rest of the app from the GraphQL schema
* and to handle any necessary transformations
* For example, if the GraphQL schema changes, only this file needs to be updated
* rather than the entire app.
* Also, it makes unit testing easier.
*/

// API shapes are often "selection set" objects (not necessarily the full generated model types).
// Keep these structural so callers can pass query items directly.
type ApiListLike = {
  id: string;
  name: string;
  isDemo?: boolean | null;
  isFavorite: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  description?: string | null;
};

type ApiTaskLike = {
  id: string;
  listId: string;
  sortOrder: number;
  parentTaskId?: string | null;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt?: string | null;
  completedAt?: string | null;
  assigneeId?: string | null;
  tagIds?: string[];
  isDemo?: boolean | null;
  createdAt: string;
  updatedAt: string;
};

type ApiUserProfileLike = {
  id: string;
  owner?: string | null;

  planTier: PlanTier;
  defaultVisibility: DefaultVisibility;

  seedVersion: number;
  seededAt?: string | null;

  onboardingVersion: number;
  onboarding?: unknown | null;
  onboardingUpdatedAt?: string | null;

  settingsVersion: number;
  settings?: unknown | null;
  settingsUpdatedAt?: string | null;

  displayName?: string | null;
  avatarUrl?: string | null;
  lastSeenAt?: string | null;
  preferredName?: string | null;
  bio?: string | null;
  timezone?: string | null;
  locale?: string | null;

  lastDeviceId?: string | null;
  acceptedTermsAt?: string | null;

  createdAt?: string;
  updatedAt?: string;
};

export function toListUI(apiList: ApiListLike): ListUI {
  return {
    id: apiList.id,
    name: apiList.name,
    description: apiList.description ?? null,
    isDemo: Boolean(apiList.isDemo),
    isFavorite: apiList.isFavorite,
    sortOrder: apiList.sortOrder,
    createdAt: apiList.createdAt,
    updatedAt: apiList.updatedAt,
  };
}

export function toTaskUI(apiTask: ApiTaskLike): TaskUI {
  return {
    id: apiTask.id,
    listId: apiTask.listId,
    sortOrder: apiTask.sortOrder,
    parentTaskId: apiTask.parentTaskId ?? null,
    title: apiTask.title,
    description: apiTask.description ?? null,
    status: apiTask.status,
    priority: apiTask.priority,
    dueAt: apiTask.dueAt ?? null,
    completedAt: apiTask.completedAt ?? null,
    assigneeId: apiTask.assigneeId ?? null,
    tagIds: apiTask.tagIds ?? [],
    isDemo: Boolean(apiTask.isDemo),
    createdAt: apiTask.createdAt,
    updatedAt: apiTask.updatedAt,
  };
}

export function toUserProfileUI(api: ApiUserProfileLike): UserProfileUI {
  return {
    id: api.id,
    owner: api.owner ?? null,

    planTier: api.planTier,
    defaultVisibility: api.defaultVisibility,

    seedVersion: api.seedVersion,
    seededAt: api.seededAt ?? null,

    onboardingVersion: api.onboardingVersion,
    onboarding: api.onboarding ?? null,
    onboardingUpdatedAt: api.onboardingUpdatedAt ?? null,

    settingsVersion: api.settingsVersion,
    settings: api.settings ?? null,
    settingsUpdatedAt: api.settingsUpdatedAt ?? null,

    displayName: api.displayName ?? null,
    avatarUrl: api.avatarUrl ?? null,
    lastSeenAt: api.lastSeenAt ?? null,
    preferredName: api.preferredName ?? null,
    bio: api.bio ?? null,
    timezone: api.timezone ?? null,
    locale: api.locale ?? null,

    lastDeviceId: api.lastDeviceId ?? null,
    acceptedTermsAt: api.acceptedTermsAt ?? null,

    createdAt: api.createdAt ?? null,
    updatedAt: api.updatedAt ?? null,
  };
}
