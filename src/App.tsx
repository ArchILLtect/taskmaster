import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./layout/AppShell";

import { TodayPage } from "./pages/TodayPage";
import { WeekPage } from "./pages/WeekPage";
import { MonthPage } from "./pages/MonthPage";
import { ListPage } from "./pages/ListPage";
import { ProfilePage } from "./pages/ProfilePage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/today" replace />} />
        <Route path="/today" element={<TodayPage />} />
        <Route path="/week" element={<WeekPage />} />
        <Route path="/month" element={<MonthPage />} />
        <Route path="/lists/:listId" element={<ListPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Optional: catch-all */}
        <Route path="*" element={<Navigate to="/today" replace />} />
      </Route>
    </Routes>
  );
}