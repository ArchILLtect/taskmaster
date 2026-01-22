export type SidebarLink = { to: string; label: string };

export const viewLinks: SidebarLink[] = [
    { to: "/today", label: "Today" },
    { to: "/week", label: "Week" },
    { to: "/month", label: "Month" },
];