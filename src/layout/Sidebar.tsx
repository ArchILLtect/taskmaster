import { Box, Separator, Text, VStack, Button } from "@chakra-ui/react";
import { RouterLink } from "../components/RouterLink";

const mockLists = [
  { id: "inbox", name: "Inbox" },
  { id: "school", name: "School" },
  { id: "work", name: "Work" },
];

function SidebarNavItem(props: { to: string; label: string }) {
  const { to, label } = props;

  return (
    <RouterLink to={to}>
      {({ isActive }) => (
        <Button
          as="span"
          variant="ghost"
          justifyContent="flex-start"
          width="100%"
          bg={isActive ? "blackAlpha.100" : "transparent"}
          _hover={{ bg: "blackAlpha.100" }}
        >
          {label}
        </Button>
      )}
    </RouterLink>
  );
}

export function Sidebar() {
  return (
    <Box w="260px" borderRightWidth="1px" p={3} overflow="auto">
      <Text fontSize="sm" fontWeight="700" mb={2}>
        Views
      </Text>

      <VStack align="stretch" gap={1} mb={3}>
        <SidebarNavItem to="/today" label="Today" />
        <SidebarNavItem to="/week" label="Week" />
        <SidebarNavItem to="/month" label="Month" />
      </VStack>

      <Separator my={3} />

      <Text fontSize="sm" fontWeight="700" mb={2}>
        Lists
      </Text>

      <VStack align="stretch" gap={1}>
        {mockLists.map((l) => (
          <SidebarNavItem key={l.id} to={`/lists/${l.id}`} label={l.name} />
        ))}
      </VStack>
    </Box>
  );
}