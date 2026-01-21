import { useCallback, useEffect, useState } from "react";
import { listTaskListsMinimal } from "../graphql/operations";
import type { ListItem } from "../types/list";
import { getClient } from "../amplifyClient";

export function useListSelectorData() {
  const [lists, setLists] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<unknown>(null);

  const refresh = useCallback(async () => {
    const client = getClient();
    try {
      setLoading(true);
      setErr(null);

      const res = await client.graphql({
        query: listTaskListsMinimal,
        variables: { limit: 200 },
      });

      // listTaskListsMinimal is typed, but the graphql() return type is annoying
      // so we safely extract what we need.
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const items =
        (res as any)?.data?.listTaskLists?.items?.filter(Boolean) ?? [];

      // Sort like your UI expects
      /* eslint-disable @typescript-eslint/no-explicit-any */
      items.sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

      setLists(items);
    } catch (e) {
      setErr(e);
      setLists([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { lists, loading, err, refresh };
}