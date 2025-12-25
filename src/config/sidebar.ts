import { mockLists } from "../mocks/lists";

export type SidebarLink = { to: string; label: string };

export const viewLinks: SidebarLink[] = [
    { to: "/today", label: "Today" },
    { to: "/week", label: "Week" },
    { to: "/month", label: "Month" },
];

export const favoriteLinks: SidebarLink[] = mockLists
    .filter((l) => l.isFavorite)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((l) => ({ to: `/lists/${l.id}`, label: l.name }));
