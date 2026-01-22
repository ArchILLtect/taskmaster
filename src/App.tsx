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
import { lazy, Suspense } from "react";


const DevPage = lazy(() => import("./pages/DevPage").then(m => ({ default: m.DevPage })));

export default function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <>
          <Routes>
            <Route element={<AppShell user={user} onSignOut={signOut} />}>
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
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              {import.meta.env.DEV ? (
                <Route
                  path="/dev"
                  element={
                    <Suspense fallback={<div>Loading...</div>}>
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
      )}
    </Authenticator>
  );
}