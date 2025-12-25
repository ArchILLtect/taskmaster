import { Box, Collapsible, VStack, HStack } from "@chakra-ui/react";
import { SidebarItem } from "./SidebarItem";
import { FiChevronDown } from "react-icons/fi";
import { mockLists } from "../mocks/lists";
    
    
export const SidebarCollapse = ({ to, label, main }: { to: string; label: string ; main?: boolean }) => {
  return (

    <Collapsible.Root defaultOpen>
      <Collapsible.Trigger asChild>
        <HStack
          paddingRight={2}
          cursor="pointer"
          userSelect="none"
          justify="space-between"
          rounded="md"
          _hover={{ bg: "blackAlpha.50" }}
        >
      <SidebarItem to={to} label={label} main={main} />

          {/* rotate chevron when open */}
          <Collapsible.Indicator asChild>
            <Box transition="transform 150ms" _open={{ transform: "rotate(180deg)" }}>
              <FiChevronDown />
            </Box>
          </Collapsible.Indicator>
        </HStack>
      </Collapsible.Trigger>

      {label == "Views" ? (
        <Collapsible.Content>
          <VStack align="stretch" gap={1} mt={2} mb={3}>
            <SidebarItem to="/today" label="Today" />
            <SidebarItem to="/week" label="Week" />
            <SidebarItem to="/month" label="Month" />
          </VStack>
        </Collapsible.Content>
      ) : (
        <Collapsible.Content>
          <VStack align="stretch" gap={1}>
            {mockLists.map((l) => (
              <SidebarItem key={l.id} to={`/lists/${l.id}`} label={l.name} />
            ))}
          </VStack>
        </Collapsible.Content>
      )}
    </Collapsible.Root>
    );
}