import { useEffect, useMemo, useRef } from "react";
import type { AuthUserLike } from "../types";
import { bootstrapUser } from "../services/userBootstrapService";
import { useTaskActions } from "../store/taskStore";

function shouldSeedDemoFromLocation(): boolean {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("demo") === "1";
  } catch {
    return false;
  }
}

function shouldSeedDemoFromStorage(): boolean {
  try {
    return localStorage.getItem("taskmaster:seedDemo") === "1";
  } catch {
    return false;
  }
}

export function useBootstrapUserProfile(user?: AuthUserLike | null) {
  const { expireTaskCache, refreshAll } = useTaskActions();

  const didRunForUserKey = useRef<string | null>(null);

  const userKey = useMemo(() => {
    const key = user?.userId || user?.username || null;
    return key;
  }, [user?.userId, user?.username]);

  useEffect(() => {
    if (!userKey) {
      didRunForUserKey.current = null;
      return;
    }

    if (didRunForUserKey.current === userKey) return;
    didRunForUserKey.current = userKey;

    const seedDemo = shouldSeedDemoFromLocation() || shouldSeedDemoFromStorage();

    void (async () => {
      try {
        const res = await bootstrapUser({ seedDemo });
        if (res.didSeedDemo) {
          expireTaskCache();
          await refreshAll(undefined, { reason: "mutation" });
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error("[user bootstrap] failed", err);
        }
      }
    })();
  }, [expireTaskCache, refreshAll, userKey]);
}
