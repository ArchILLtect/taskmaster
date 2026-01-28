import { Authenticator } from "@aws-amplify/ui-react";
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
import { lazy, Suspense } from "react";
import { BasicSpinner } from "./components/ui/BasicSpinner";
import { Hub } from "aws-amplify/utils";
import { clearAllUserCaches } from "./store/clearUserCaches";
import { USER_UI_STORAGE_KEY } from "./services/userUICacheStore";


const DevPage = lazy(() => import("./pages/DevPage").then(m => ({ default: m.DevPage })));

let didRegisterAuthHubListener = false;
function ensureAuthLifecycleCacheGuards() {
  if (didRegisterAuthHubListener) return;
  didRegisterAuthHubListener = true;

  Hub.listen("auth", ({ payload }) => {
    const evt = String((payload as { event?: unknown } | undefined)?.event ?? "");

    // Belt + suspenders: clear caches if sign-out happens outside our TopBar flow.
    if (evt === "signOut" || evt === "signedOut") {
      clearAllUserCaches();
      return;
    }
  });
}

ensureAuthLifecycleCacheGuards();

function readPersistedUsername(): string | null {
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

function hasAnyUserScopedCacheKeys(): boolean {
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

let lastAuthedUserKey: string | null = null;
function maybeClearCachesBeforeFirstAuthedRender(user?: { username?: string; userId?: string } | null) {
  const authKey = user?.username || user?.userId || null;
  if (!authKey) {
    lastAuthedUserKey = null;
    return;
  }

  if (lastAuthedUserKey === authKey) return;
  lastAuthedUserKey = authKey;

  if (!hasAnyUserScopedCacheKeys()) return;

  const persistedUsername = readPersistedUsername();
  if (persistedUsername && persistedUsername === authKey) return;

  // If we have caches but no matching persisted user identity, clear before rendering
  // any authenticated routes to prevent cross-user cache flashes.
  clearAllUserCaches();
}

export default function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => {
        maybeClearCachesBeforeFirstAuthedRender(user as unknown as { username?: string; userId?: string } | null);

        console.log(user);
        const signOutWithCleanup = async () => {
          try {
            await signOut?.();
          } finally {
            // Clear after signOut so that if Amplify triggers any downstream auth events,
            // we are already in a signed-out state when caches disappear.
            clearAllUserCaches();
          }
        };

        return (
        <>
          <Routes>
            <Route element={<AppShell user={user} onSignOut={signOutWithCleanup} />}>
              <Route path="/" element={<Navigate to="/today" replace />} />
              <Route path="/inbox" element={<InboxPage />} />
              <Route path="/today" element={<TodayPage />} />
              <Route path="/week" element={<WeekPage />} />
              <Route path="/month" element={<MonthPage />} />
              <Route path="/updates" element={<UpdatesPage />} />
              <Route path="/lists" element={<ListsPage />} />
              <Route path="/lists/:listId" element={<ListDetailsPage />} />

              {/* Optional focus route (single pane), if you want it later */}
              <Route path="/lists/:listId/tasks/*" element={<ListDetailsPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/profile" element={<ProfilePage user={user} onSignOut={signOutWithCleanup} />} />
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

              {/* Optional: catch-all */}
              <Route path="*" element={<Navigate to="/today" replace />} />
            </Route>
          </Routes>
        </>
        );
      }}
    </Authenticator>
  );
}