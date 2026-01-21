import { useCallback, useEffect, useMemo, useState } from "react";
import { taskmasterApi } from "../api/taskmasterApi";
import { mapTaskList } from "../api/mappers";
import type { ListItem } from "../types/list";

export function useListSelectorData() {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const [rawLists, setRawLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<unknown>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);

      const page = await taskmasterApi.listTaskLists({ limit: 200 });

      // keep raw storage separate from mapped output (helps debugging)
      /* eslint-disable @typescript-eslint/no-explicit-any */
      setRawLists(page.items as any[]);
    } catch (e) {
      setErr(e);
      setRawLists([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const lists: ListItem[] = useMemo(() => {
    const mapped = rawLists.map(mapTaskList);
    mapped.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    return mapped;
  }, [rawLists]);

  return { lists, loading, err, refresh };
}