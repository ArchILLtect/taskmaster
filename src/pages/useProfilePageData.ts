import { useUserUI } from "../hooks/useUserUI";

export function useProfilePageData(): {
  userUI: ReturnType<typeof useUserUI>["userUI"];
  loading: ReturnType<typeof useUserUI>["loading"];
  error: ReturnType<typeof useUserUI>["error"];
} {
  return useUserUI();
}