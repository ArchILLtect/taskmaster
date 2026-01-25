import { fetchAuthSession, fetchUserAttributes, getCurrentUser } from "aws-amplify/auth";
import type { UserUI } from "../types";

function isNotSignedInError(err: unknown): boolean {
  const name = typeof err === "object" && err !== null && "name" in err ? String((err as { name: unknown }).name) : "";
  return (
    name === "UserUnAuthenticatedException" ||
    name === "NotAuthorizedException" ||
    name === "NotAuthenticatedException" ||
    name === "NoCurrentUser"
  );
}

function pickFirstGroup(groups: unknown): string | undefined {
  if (Array.isArray(groups) && typeof groups[0] === "string") return groups[0];
  return undefined;
}

export async function getUserUIResult(): Promise<{ userUI: UserUI | null; error: unknown | null }> {
  let currentUser: Awaited<ReturnType<typeof getCurrentUser>>;

  try {
    currentUser = await getCurrentUser();
  } catch (err) {
    if (isNotSignedInError(err)) return { userUI: null, error: null };
    return { userUI: null, error: err };
  }

  const username = currentUser.username || currentUser.userId;

  try {
    const attributes = await fetchUserAttributes();

    const email = attributes.email;
    const roleFromCustom = attributes["custom:role"];

    let role: string | undefined = roleFromCustom;

    if (!role) {
      const session = await fetchAuthSession();
      const groups = session.tokens?.idToken?.payload?.["cognito:groups"];
      role = pickFirstGroup(groups);
    }

    return {
      userUI: {
        username,
        email,
        role,
      },
      error: null,
    };
  } catch (err) {
    // If we can get the current user but not attributes/session, fall back to username only.
    // This avoids breaking UI while still allowing the hook to surface the error.
    return {
      userUI: {
        username,
      },
      error: err,
    };
  }
}

export async function getUserUI(): Promise<UserUI | null> {
  const { userUI } = await getUserUIResult();
  return userUI;
}
