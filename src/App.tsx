import { Authenticator } from "@aws-amplify/ui-react";
import { Navigate, Route, Routes } from "react-router-dom";
import "@aws-amplify/ui-react/styles.css";

import { AppShell } from "./layout/AppShell";
import { InboxPage } from "./pages/InboxPage";
import { TodayPage } from "./pages/TodayPage";
import { WeekPage } from "./pages/WeekPage";
import { MonthPage } from "./pages/MonthPage";
import { ListPage } from "./pages/ListPage";
import { ProfilePage } from "./pages/ProfilePage";
import { TasksPage } from "./pages/TasksPage";
import { UpdatesPage } from "./pages/UpdatesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { ListSelectorPage } from "./pages/ListSelectorPage";
import { DevPage } from "./pages/DevPage";

export default function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <>
          {/* optional quick top bar */}
          <div style={{ padding: 12, display: "flex", gap: 12, alignItems: "center" }}>
            <span>Signed in as: {user?.username}</span>
            <button onClick={signOut}>Sign out</button>
          </div>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<Navigate to="/today" replace />} />
              <Route path="/inbox" element={<InboxPage />} />
              <Route path="/today" element={<TodayPage />} />
              <Route path="/week" element={<WeekPage />} />
              <Route path="/month" element={<MonthPage />} />
              <Route path="/updates" element={<UpdatesPage />} />
              <Route path="/lists" element={<ListSelectorPage />} />
              <Route path="/lists/:listId" element={<ListPage />} />

              {/* Optional focus route (single pane), if you want it later */}
              <Route path="/lists/:listId/tasks/*" element={<ListPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/dev" element={<DevPage />} />

              {/* Optional: catch-all */}
              <Route path="*" element={<Navigate to="/today" replace />} />
            </Route>
          </Routes>
        </>
      )}
    </Authenticator>
  );
}