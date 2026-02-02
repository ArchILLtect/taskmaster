import { Text, Box, HStack, Collapsible } from "@chakra-ui/react";
import { FiChevronDown } from "react-icons/fi";
import type { ReactNode } from "react";

type AppCollapsibleProps = {
  title: ReactNode;
  fontSize?: string;
  fontWeight?: string;
  fontColor?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  width?: string;
  mt?: string;
  mb?: string;
};

export function AppCollapsible({ title, fontSize = "lg", fontWeight = "600", fontColor = "black", children, defaultOpen = false, width = "100%", mt = "5", mb = "5" }: AppCollapsibleProps) {
  return (
    <Collapsible.Root defaultOpen={defaultOpen} w={width} mt={mt} mb={mb}>
      <Collapsible.Trigger asChild>
        <HStack
          p="1"
          cursor="pointer"
          userSelect="none"
          justify="space-between"
          rounded="md"
          _hover={{ bg: "blackAlpha.50" }}
        >
          {typeof title === "string" ? (
            <Text fontSize={fontSize} fontWeight={fontWeight} color={fontColor}>
              {title}
            </Text>
          ) : (
            <Box fontSize={fontSize} fontWeight={fontWeight} color={fontColor}>
              {title}
            </Box>
          )}

          {/* rotate chevron when open */}
          <Collapsible.Indicator asChild>
            <Box transition="transform 150ms" _open={{ transform: "rotate(180deg)" }}>
              <FiChevronDown />
            </Box>
          </Collapsible.Indicator>
        </HStack>
      </Collapsible.Trigger>
      <Collapsible.Content>

      {/* content goes here */}
      {children}

      </Collapsible.Content>
    </Collapsible.Root>

  )
}