import { Box, Separator } from "@chakra-ui/react";
import { SidebarCollapse } from "../components/SidebarCollapse";
import { SidebarItem } from "../components/SidebarItem";

export function Sidebar() {
  return (
    <Box w="260px" borderRightWidth="1px" p={3} overflow="auto">

      <SidebarItem to="/inbox" label="Inbox" main />

      <Separator my={3} />

      <SidebarCollapse to="/views" label="Views" main />

      <Separator my={3} />

      <SidebarItem to="/tasks" label="Tasks" main />

      <Separator my={3} />

      <SidebarItem to="/updates" label="Updates" main />

      <Separator my={3} />

      <SidebarCollapse to="/lists" label="Lists" main />

      <Separator my={3} />

    </Box>
  );
}