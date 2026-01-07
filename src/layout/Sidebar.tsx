import { Box, Separator } from "@chakra-ui/react";
import { SidebarCollapse } from "../components/SidebarCollapse";
import { SidebarItem } from "../components/SidebarItem";
import { viewLinks, favoriteLinks } from "../config/sidebar";

export function Sidebar() {
  return (
    <Box minW="18vw" borderRightWidth="1px" p={3} bg="white" boxShadow="sm" position={"sticky"} minH="100%">

      <SidebarItem to="/inbox" label="Inbox" main />

      <Separator my={3} />

      <SidebarCollapse to="/views" label="Views" items={viewLinks} defaultOpen />

      <Separator my={3} />

      <SidebarItem to="/tasks" label="Tasks" main />

      <Separator my={3} />

      <SidebarItem to="/updates" label="Updates" main />

      <Separator my={3} />

      <SidebarItem to="/lists" label="Lists" main />
      
      <Separator my={3} />

      <SidebarCollapse to="/favorites" label="Favorites" items={favoriteLinks} defaultOpen />

      <Separator my={3} />

    </Box>
  );
}