import { Navigate, Outlet, useLocation } from "react-router-dom";

function sanitizeRedirect(raw: string | null): string {
  if (!raw) return "/today";
  // Only allow internal paths to prevent open redirects.
  if (!raw.startsWith("/")) return "/today";
  if (raw.startsWith("//")) return "/today";
  if (raw.includes("://")) return "/today";
  return raw;
}

export function RequireAuth({ signedIn }: { signedIn: boolean }) {
  const location = useLocation();

  if (signedIn) return <Outlet />;

  const next = sanitizeRedirect(`${location.pathname}${location.search}`);
  const to = `/login?redirect=${encodeURIComponent(next)}`;
  return <Navigate to={to} replace />;
}
