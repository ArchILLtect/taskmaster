import { useCallback, useEffect, useMemo, useState } from "react";
import { getCurrentUser, signOut as amplifySignOut } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

import type { AuthUserLike } from "../types";
import { clearAllUserCaches } from "../store/clearUserCaches";

function isNotSignedInError(err: unknown): boolean {
  const name = typeof err === "object" && err !== null && "name" in err ? String((err as { name: unknown }).name) : "";
  return (
    name === "UserUnAuthenticatedException" ||
    name === "NotAuthorizedException" ||
    name === "NotAuthenticatedException" ||
    name === "NoCurrentUser"
  );
}

export function useAuthUser(): {
  user: AuthUserLike | null;
  loading: boolean;
  signedIn: boolean;
  signOutWithCleanup: () => Promise<void>;
  refresh: () => Promise<void>;
} {
  const [user, setUser] = useState<AuthUserLike | null>(null);
  const [loading, setLoading] = useState(true);

  const signedIn = useMemo(() => Boolean(user?.userId || user?.username), [user?.userId, user?.username]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const current = await getCurrentUser();
      setUser({ username: current.username, userId: current.userId });
    } catch (err) {
      if (isNotSignedInError(err)) {
        setUser(null);
      } else {
        // Non-auth errors shouldn't brick the app; treat as signed out but log in DEV.
        setUser(null);
        if (import.meta.env.DEV) {
          console.warn("[auth] failed to resolve current user", err);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const signOutWithCleanup = useCallback(async () => {
    try {
      await amplifySignOut();
    } finally {
      clearAllUserCaches();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void refresh();

    const cancel = Hub.listen("auth", ({ payload }) => {
      const evt = String((payload as { event?: unknown } | undefined)?.event ?? "");
      if (evt === "signIn" || evt === "signedIn") {
        void refresh();
      }
      if (evt === "signOut" || evt === "signedOut") {
        // Cache cleanup is handled by signOutWithCleanup or the global listener.
        setUser(null);
      }
    });

    return () => {
      cancel();
    };
  }, [refresh]);

  return { user, loading, signedIn, signOutWithCleanup, refresh };
}
