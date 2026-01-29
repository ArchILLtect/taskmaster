import { useEffect, useRef } from "react";
import { isCacheFresh, useTaskActions, useTaskStore } from "../store/taskStore";

export function useBootstrapTaskStore(opts?: { listLimit?: number; enabled?: boolean }) {
  const { hydrateAndRefreshIfStale } = useTaskActions();
  const didRunRef = useRef(false);

  useEffect(() => {
    if (opts?.enabled === false) return;
    if (didRunRef.current) return;
    didRunRef.current = true;

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
  }, [hydrateAndRefreshIfStale, opts?.enabled, opts?.listLimit]);
}
