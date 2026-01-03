import { Navigate, Route, Routes } from "react-router-dom";
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

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/today" replace />} />
        <Route path="/inbox" element={<InboxPage />} />
        <Route path="/today" element={<TodayPage />} />
        <Route path="/week" element={<WeekPage />} />
        <Route path="/month" element={<MonthPage />} />
        <Route path="/updates" element={<UpdatesPage />} />
        <Route path="/lists" element={<ListPage />} />
        <Route path="/lists/:listId" element={<ListPage />} />

        {/* Infinite pane stack: /lists/work/tasks/a/b/c */}
        <Route path="/lists/:listId/tasks/*" element={<ListPage />} />

        {/* Optional focus route (single pane), if you want it later */}
        <Route path="/lists/:listId/task/:taskId" element={<ListPage />} />

        {/* Back-compat: old single-task URL redirects into the new stack form */}
        <Route
          path="/lists/:listId/tasks/:taskId"
          element={<Navigate to="." replace />}
        />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* Optional: catch-all */}
        <Route path="*" element={<Navigate to="/today" replace />} />
      </Route>
    </Routes>
  );
}