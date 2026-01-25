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
      if (typeof unsub === "function") unsub();
    };
  }, [hydrateAndRefreshIfStale, opts?.listLimit]);
}
