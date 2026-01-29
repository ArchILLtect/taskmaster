import { Box, Flex, Separator } from "@chakra-ui/react";
import { SidebarCollapse } from "../components/SidebarCollapse";
import { SidebarItem } from "../components/SidebarItem";
import { viewLinks } from "../config/sidebar";
import { useListsPageData } from "../pages/useListsPageData";

export function Sidebar() {

  const { visibleFavorites } = useListsPageData();

  const favoriteLinks = visibleFavorites
    .filter((l) => l.isFavorite)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((l) => ({ to: `/lists/${l.id}`, label: l.name }));

  return (
    <Flex flexDirection={"column"} justifyContent={"space-between"} minW="18vw" borderRightWidth="1px" p={3} bg="white" boxShadow="sm" position={"sticky"} minH="100%">
      <Box>
        <SidebarItem to="/inbox" label="Inbox" main />
        <Separator my={3} />
        <SidebarCollapse to="/views" label="Views" items={viewLinks} defaultOpen={false} />
        <Separator my={3} />
        <SidebarItem to="/tasks" label="Tasks" main />
        <Separator my={3} />
        <SidebarItem to="/updates" label="Updates" main />
        <Separator my={3} />
        <SidebarItem to="/lists" label="Lists" main />
        <Separator my={3} />
        <SidebarCollapse to="/favorites" label="Favorites" items={favoriteLinks} defaultOpen={false} />
        <Separator my={3} />
        <SidebarItem to="/dev" label="Dev" main />
      </Box>
      <Box mt={6}>
        <SidebarItem to="/" label="Home" main />
        <Separator my={3} />
        <SidebarItem to="/about" label="About" main />
      </Box>
    </Flex>
  );
}