import { useEffect, useRef } from "react";
import { isCacheFresh, useTaskActions, useTaskStore } from "../store/taskStore";

export function useBootstrapTaskStore(opts?: { listLimit?: number }) {
  const { hydrateAndRefreshIfStale } = useTaskActions();
  const didRunRef = useRef(false);

  useEffect(() => {
    if (didRunRef.current) return;
    didRunRef.current = true;

    const persistApi = (useTaskStore as unknown as { persist?: unknown }).persist as
      | {
          hasHydrated?: () => boolean;
          onFinishHydration?: (fn: () => void) => (() => void) | void;
        }
      | undefined;

    let prevRefreshing = false;
    const unsubscribeRefreshing = useTaskStore.subscribe((s) => {
      if (!import.meta.env.DEV) return;
      const refreshing = Boolean(s.loading && (s.lists.length > 0 || s.tasks.length > 0));
      if (refreshing === prevRefreshing) return;
      prevRefreshing = refreshing;

      if (refreshing) {
        console.debug(
          `[taskStore] refreshing=true lists=${s.lists.length} tasks=${s.tasks.length} lastLoadedAtMs=${String(
            s.lastLoadedAtMs
          )}`
        );
      } else {
        console.debug(`[taskStore] refreshing=false error=${s.error ? JSON.stringify(s.error) : "null"}`);
      }
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

    const run = () => {
      logStatus("run");
      void hydrateAndRefreshIfStale({ listLimit: opts?.listLimit });
    };

    if (!persistApi) {
      run();
      return;
    }

    if (persistApi.hasHydrated?.()) {
      logStatus("already-hydrated");
      run();
      return;
    }

    const unsub = persistApi.onFinishHydration?.(() => {
      logStatus("finish-hydration");
      run();
    });

    return () => {
      unsubscribeRefreshing();
      if (typeof unsub === "function") unsub();
    };
  }, [hydrateAndRefreshIfStale, opts?.listLimit]);
}
