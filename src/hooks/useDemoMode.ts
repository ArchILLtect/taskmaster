import { useEffect, useMemo, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";

import { isDemoSessionActive } from "../services/demoSession";

function payloadToGroups(payload?: Record<string, unknown>): string[] {
  const raw = payload?.["cognito:groups"];
  if (!Array.isArray(raw)) return [];
  return raw.map(String);
}

function payloadToRole(payload?: Record<string, unknown>): string {
  const raw = payload?.["custom:role"];
  return typeof raw === "string" ? raw : "";
}

export function useDemoMode(signedIn: boolean): {
  isDemo: boolean;
  isDemoIdentity: boolean;
  isDemoSession: boolean;
} {
  const [isDemoIdentity, setIsDemoIdentity] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!signedIn) {
      const t = window.setTimeout(() => {
        if (!cancelled) setIsDemoIdentity(false);
      }, 0);
      return () => {
        cancelled = true;
        window.clearTimeout(t);
      };
    }

    void (async () => {
      try {
        const session = await fetchAuthSession();
        const payload = session.tokens?.idToken?.payload as Record<string, unknown> | undefined;

        const groups = payloadToGroups(payload);
        const role = payloadToRole(payload);

        const next = groups.includes("Demo") || role === "Demo";
        if (!cancelled) setIsDemoIdentity(next);
      } catch {
        if (!cancelled) setIsDemoIdentity(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  const isDemoSession = useMemo(() => {
    if (!signedIn) return false;
    return isDemoSessionActive();
  }, [signedIn]);

  const isDemo = isDemoIdentity || isDemoSession;

  return { isDemo, isDemoIdentity, isDemoSession };
}
