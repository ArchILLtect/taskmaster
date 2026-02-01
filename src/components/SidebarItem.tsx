import { Button, Text } from "@chakra-ui/react";
import { RouterLink } from "./RouterLink";

export const SidebarItem = ({ to, label, main }: { to: string; label: string ; main?: boolean }) => {
  return (
    <RouterLink to={to}>
      {({ isActive }) => (
        <Button
          as="span"
          variant="ghost"
          justifyContent="flex-start"
          width="100%"
          paddingX={main ? 2 : 5}
          fontWeight={main ? "700" : "500"}
          color={main ? "black" : ""}
          bg={isActive ? "blackAlpha.100" : "transparent"}
          _hover={{ bg: "blackAlpha.100" }}
        >
          <Text truncate>
            {label}
          </Text>
        </Button>
      )}
    </RouterLink>
  );
}