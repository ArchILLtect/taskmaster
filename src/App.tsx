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

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/today" replace />} />
        <Route path="/inbox" element={<InboxPage />} />
        <Route path="/today" element={<TodayPage />} />
        <Route path="/week" element={<WeekPage />} />
        <Route path="/month" element={<MonthPage />} />
        <Route path="/lists" element={<ListPage />} />
        <Route path="/updates" element={<UpdatesPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/lists/:listId" element={<ListPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* Optional: catch-all */}
        <Route path="*" element={<Navigate to="/today" replace />} />
      </Route>
    </Routes>
  );
}