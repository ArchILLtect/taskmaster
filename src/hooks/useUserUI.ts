import { useEffect, useState } from "react";
import { getUserUIResult } from "../services/authService";
import type { UserUI } from "../types";

export function useUserUI(): {
  userUI: UserUI | null;
  loading: boolean;
  error: string | null;
} {
  const [userUI, setUserUI] = useState<UserUI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const { userUI: nextUserUI, error: nextError } = await getUserUIResult();
      if (cancelled) return;

      setUserUI(nextUserUI);

      if (nextError) {
        const message =
          typeof nextError === "object" && nextError !== null && "message" in nextError
            ? String((nextError as { message: unknown }).message)
            : "Failed to load user attributes.";
        setError(message);
      }

      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    userUI,
    loading,
    error,
  };
}
