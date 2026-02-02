import { Navigate, Route, Routes } from "react-router-dom";
import "@aws-amplify/ui-react/styles.css";

import { AppShell } from "./layout/AppShell";
import { InboxPage } from "./pages/InboxPage";
import { TodayPage } from "./pages/TodayPage";
import { WeekPage } from "./pages/WeekPage";
import { MonthPage } from "./pages/MonthPage";
import { ListsPage } from "./pages/ListsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { TasksPage } from "./pages/TasksPage";
import { UpdatesPage } from "./pages/UpdatesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { ListDetailsPage } from "./pages/ListDetailsPage";
import { AdminPage } from "./pages/AdminPage";
import { lazy, Suspense, useLayoutEffect } from "react";
import { BasicSpinner } from "./components/ui/BasicSpinner";
import { Hub } from "aws-amplify/utils";
import { resetUserSessionState } from "./store/clearUserCaches";
import { USER_UI_STORAGE_KEY } from "./services/userUICacheStore";
import { useAuthUser } from "./hooks/useAuthUser";
import { RequireAuth } from "./routes/RequireAuth";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { AboutPage } from "./pages/AboutPage";
import { setUserStorageScopeKey } from "./services/userScopedStorage";


const DevPage = lazy(() => import("./pages/DevPage").then(m => ({ default: m.DevPage })));

let didRegisterAuthHubListener = false;
function ensureAuthLifecycleCacheGuards() {
  if (didRegisterAuthHubListener) return;
  didRegisterAuthHubListener = true;

  Hub.listen("auth", ({ payload }) => {
    const evt = String((payload as { event?: unknown } | undefined)?.event ?? "");

    // Belt + suspenders: clear caches if sign-out happens outside our TopBar flow.
    if (evt === "signOut" || evt === "signedOut") {
      setUserStorageScopeKey(null);
      resetUserSessionState();
      return;
    }
  });
}

ensureAuthLifecycleCacheGuards();

function readLegacyPersistedUsername(): string | null {
  try {
    const raw = localStorage.getItem(USER_UI_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    const envelope = parsed as { state?: unknown };
    const state = envelope.state as { userUI?: unknown } | undefined;
    const userUI = state?.userUI as { username?: unknown } | undefined;
    return typeof userUI?.username === "string" ? userUI.username : null;
  } catch {
    return null;
  }
}

function hasAnyLegacyUnscopedCacheKeys(): boolean {
  try {
    return Boolean(
      localStorage.getItem("taskmaster:taskStore") ||
        localStorage.getItem("taskmaster:inbox") ||
        localStorage.getItem("taskmaster:updates") ||
        localStorage.getItem(USER_UI_STORAGE_KEY)
    );
  } catch {
    return false;
  }
}

function clearLegacyUnscopedCaches(): void {
  try {
    localStorage.removeItem("taskmaster:taskStore");
    localStorage.removeItem("taskmaster:inbox");
    localStorage.removeItem("taskmaster:updates");
    localStorage.removeItem(USER_UI_STORAGE_KEY);
  } catch {
    // ignore
  }
}

let lastAuthedUserKey: string | null = null;
function maybeClearCachesBeforeFirstAuthedRender(user?: { username?: string; userId?: string } | null) {
  const authKey = user?.username || user?.userId || null;
  if (!authKey) {
    lastAuthedUserKey = null;
    return;
  }

  if (lastAuthedUserKey === authKey) return;
  lastAuthedUserKey = authKey;

  // Only legacy (pre-user-scoped) caches can cause cross-user flashes.
  if (!hasAnyLegacyUnscopedCacheKeys()) return;

  const persistedUsername = readLegacyPersistedUsername();
  if (persistedUsername && persistedUsername === authKey) return;

  // If we have legacy unscoped caches but no matching persisted user identity,
  // clear ONLY those legacy keys to prevent accidental migration/leakage.
  clearLegacyUnscopedCaches();
  resetUserSessionState();
}

export default function App() {
  const { user, signedIn, loading: authLoading, signOutWithCleanup } = useAuthUser();

  // Only relevant once we have a signed-in identity.
  // Important: don't call this during render (it can trigger store updates and React warnings).
  useLayoutEffect(() => {
    maybeClearCachesBeforeFirstAuthedRender(user);
  }, [user]);

  return (
    <Routes>
      <Route element={<AppShell user={user} onSignOut={signOutWithCleanup} signedIn={signedIn} authLoading={authLoading} />}>
        {/* Public routes */}
        <Route path="/" element={<HomePage signedIn={signedIn} />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage signedIn={signedIn} authLoading={authLoading} />} />

        {/* Protected routes */}
        <Route element={<RequireAuth signedIn={signedIn} loading={authLoading} />}>
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/today" element={<TodayPage />} />
          <Route path="/week" element={<WeekPage />} />
          <Route path="/month" element={<MonthPage />} />
          <Route path="/updates" element={<UpdatesPage />} />
          <Route path="/lists" element={<ListsPage />} />
          <Route path="/lists/:listId" element={<ListDetailsPage />} />
          <Route path="/lists/:listId/tasks/*" element={<ListDetailsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/profile" element={<ProfilePage user={user} />} />
          <Route path="/settings" element={<SettingsPage />} />
          {import.meta.env.DEV ? (
            <Route
              path="/dev"
              element={
                <Suspense fallback={<BasicSpinner />}>
                  <DevPage />
                </Suspense>
              }
            />
          ) : null}
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}