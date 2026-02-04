import { getCurrentUser } from "aws-amplify/auth";

import { toUserProfileUI } from "../api/mappers";
import { taskmasterApi } from "../api/taskmasterApi";
import type { UserProfileUI } from "../types";

export async function fetchUserProfileUIById(profileId: string): Promise<UserProfileUI | null> {
  if (!profileId) return null;
  const raw = await taskmasterApi.getUserProfile(profileId);
  if (!raw) return null;
  return toUserProfileUI(raw as Parameters<typeof toUserProfileUI>[0]);
}

export async function fetchMyUserProfileUI(): Promise<UserProfileUI | null> {
  const current = await getCurrentUser();
  const profileId = current.userId;
  return fetchUserProfileUIById(profileId);
}
