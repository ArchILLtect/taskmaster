import { Box, Flex, Icon, Separator } from "@chakra-ui/react";
import { Tooltip } from "../components/ui/Tooltip";
import { SidebarCollapse } from "../components/SidebarCollapse";
import { SidebarItem } from "../components/SidebarItem";
import { viewLinks } from "../config/sidebar";
import { useListsPageData } from "../pages/useListsPageData";
import { useInboxTriageIndicators } from "../hooks/useInboxTriageIndicators";
import { FcExpired, FcHighPriority } from "react-icons/fc";
import { useDefaultViewRoute, useSidebarWidthPreset } from "../store/localSettingsStore";

export function Sidebar() {

  const { visibleFavorites } = useListsPageData();
  const { hasDueSoon, hasOverdue } = useInboxTriageIndicators();

  const sidebarWidthPreset = useSidebarWidthPreset();
  const defaultViewRoute = useDefaultViewRoute();

  const SIDEBAR_WIDTH = {
    small: "200px",
    medium: "250px",
    large: "300px",
  } as const;

  const CURRENT_SIDEBAR_WIDTH = SIDEBAR_WIDTH[sidebarWidthPreset] ?? SIDEBAR_WIDTH.small;

  const favoriteLinks = visibleFavorites
    .filter((l) => l.isFavorite)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((l) => ({ to: `/lists/${l.id}`, label: l.name }));

  return (
    <Flex flexDirection={"column"} justifyContent={"space-between"} w={CURRENT_SIDEBAR_WIDTH} borderRightWidth="1px" p={3} bg="white" boxShadow="sm" position={"sticky"} minH="100%">
      <Box>
        <SidebarItem
          to="/inbox"
          label="Inbox"
          main
          rightAdornment={
            hasOverdue || hasDueSoon ? (
              <>
                {hasOverdue ? (
                  <Tooltip content="You have overdue tasks" showArrow>
                    <Icon as={FcExpired} boxSize={5} aria-label="Overdue tasks" />
                  </Tooltip>
                ) : null}
                {hasDueSoon ? (
                  <Tooltip content="You have tasks due soon" showArrow>
                    <Icon as={FcHighPriority} boxSize={5} aria-label="Due soon tasks" />
                  </Tooltip>
                ) : null}
              </>
            ) : null
          }
        />
        <Separator my={3} />
        <SidebarCollapse to={defaultViewRoute} label="Views" items={viewLinks} defaultOpen={false} />
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