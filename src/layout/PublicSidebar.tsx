
import { Box, Separator } from "@chakra-ui/react";
import { SidebarItem } from "../components/SidebarItem";

export function PublicSidebar() {
  return (
    <Box minW="18vw" borderRightWidth="1px" p={3} bg="white" boxShadow="sm" position={"sticky"} minH="100%">
      <SidebarItem to="/" label="Home" main />
      <Separator my={3} />
      <SidebarItem to="/about" label="About" main />
      <Separator my={3} />
      <SidebarItem to="/login" label="Login/Sign Up" main />
    </Box>
  );
}