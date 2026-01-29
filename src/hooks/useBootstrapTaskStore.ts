import { useEffect, useMemo, useRef } from "react";
import { isCacheFresh, useTaskActions, useTaskStore } from "../store/taskStore";

export function useBootstrapTaskStore(opts?: {
  listLimit?: number;
  enabled?: boolean;
  authKey?: string | null;
}) {
  const { hydrateAndRefreshIfStale, refreshAll } = useTaskActions();
  const lastRunKeyRef = useRef<string | null>(null);

  const runKey = useMemo(() => {
    if (opts?.enabled === false) return null;
    // When signed in, key the bootstrap to the auth identity so user switches re-trigger.
    return opts?.authKey ?? "signed-in";
  }, [opts?.authKey, opts?.enabled]);

  useEffect(() => {
    if (!runKey) {
      lastRunKeyRef.current = null;
      return;
    }

    const isFirstForKey = lastRunKeyRef.current !== runKey;
    lastRunKeyRef.current = runKey;

    const persistApi = (useTaskStore as unknown as { persist?: unknown }).persist as
      | {
          hasHydrated?: () => boolean;
          onFinishHydration?: (fn: () => void) => (() => void) | void;
        }
      | undefined;

    let prevLoading = useTaskStore.getState().loading;
    const unsubscribeRefreshComplete = useTaskStore.subscribe((s) => {
      if (!import.meta.env.DEV) return;

      // Log only when a refresh completes (loading flips true -> false).
      if (prevLoading && !s.loading) {
        const refreshAtIso =
          typeof s.lastRefreshAtMs === "number" && Number.isFinite(s.lastRefreshAtMs)
            ? new Date(s.lastRefreshAtMs).toISOString()
            : null;
        const loadedAtIso =
          typeof s.lastLoadedAtMs === "number" && Number.isFinite(s.lastLoadedAtMs)
            ? new Date(s.lastLoadedAtMs).toISOString()
            : null;
        const fresh = isCacheFresh(s.lastLoadedAtMs);

        console.debug(
          `[taskStore] refresh complete source=${s.lastRefreshSource ?? "unknown"} reason=${
            s.lastRefreshReason ?? "unknown"
          } refreshAt=${refreshAtIso ?? "n/a"} loadedAt=${loadedAtIso ?? "n/a"} fresh=${String(
            fresh
          )} error=${s.error ? JSON.stringify(s.error) : "null"} lists=${s.lists.length} tasks=${s.tasks.length}`
        );
      }

      prevLoading = s.loading;
    });

    const logStatus = (phase: string) => {
      if (!import.meta.env.DEV) return;
      const s = useTaskStore.getState();
      const fresh = isCacheFresh(s.lastLoadedAtMs);
      console.debug(
        `[taskStore bootstrap] ${phase} hydrated=${Boolean(persistApi?.hasHydrated?.())} lastLoadedAtMs=${String(
          s.lastLoadedAtMs
        )} fresh=${String(fresh)} lists=${s.lists.length} tasks=${s.tasks.length}`
      );
    };

    logStatus("start");

    const markHydratedFromCache = () => {
      // Fallback: mark hydration as cache render (onRehydrateStorage should also do this).
      const s = useTaskStore.getState();
      s.setRefreshMeta?.({ source: "cache", reason: "hydrate" });
    };

    const run = () => {
      logStatus("run");

      // On sign-in (or user switch), always force a network refresh so the UI is correct immediately.
      if (isFirstForKey) {
        void refreshAll({ listLimit: opts?.listLimit }, { reason: "manual" });
        return;
      }

      void hydrateAndRefreshIfStale({ listLimit: opts?.listLimit });
    };

    if (!persistApi) {
      markHydratedFromCache();
      run();
      return () => {
        unsubscribeRefreshComplete();
      };
    }

    if (persistApi.hasHydrated?.()) {
      logStatus("already-hydrated");
      markHydratedFromCache();
      run();
      return () => {
        unsubscribeRefreshComplete();
      };
    }

    const unsub = persistApi.onFinishHydration?.(() => {
      logStatus("finish-hydration");
      markHydratedFromCache();
      run();
    });

    return () => {
      unsubscribeRefreshComplete();
      if (typeof unsub === "function") unsub();
    };
  }, [hydrateAndRefreshIfStale, refreshAll, runKey, opts?.listLimit]);
}
