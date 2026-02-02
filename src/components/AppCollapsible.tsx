import { Text, Box, HStack, Collapsible, Grid } from "@chakra-ui/react";
import { FiChevronDown } from "react-icons/fi";
import type { ReactNode } from "react";

type AppCollapsibleProps = {
  title: ReactNode;
  headerCenter?: ReactNode;
  fontSize?: string;
  fontWeight?: string;
  fontColor?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  width?: string;
  mt?: string;
  mb?: string;
};

export function AppCollapsible({ title, headerCenter, fontSize = "lg", fontWeight = "600", fontColor = "black", children, defaultOpen = false, width = "100%", mt = "5", mb = "5" }: AppCollapsibleProps) {
  return (
    <Collapsible.Root defaultOpen={defaultOpen} w={width} mt={mt} mb={mb}>
      <Grid
        p="1"
        cursor="pointer"
        userSelect="none"
        rounded="md"
        _hover={{ bg: "blackAlpha.50" }}
        alignItems="center"
        templateColumns={headerCenter ? "1fr auto 86px" : "1fr 86px"}
        gap={2}
      >
        {/* Title trigger */}
        <Collapsible.Trigger asChild>
          <Box as="button" bg="transparent" border="0" textAlign="left" w="100%">
            <HStack>
              {typeof title === "string" ? (
                <Text fontSize={fontSize} fontWeight={fontWeight} color={fontColor}>
                  {title}
                </Text>
              ) : (
                <Box fontSize={fontSize} fontWeight={fontWeight} color={fontColor} w="100%">
                  {title}
                </Box>
              )}
            </HStack>
          </Box>
        </Collapsible.Trigger>

        {/* Optional center content (not part of the collapse trigger) */}
        {headerCenter ? (
          <Box justifySelf="center" onClick={(e) => e.stopPropagation()}>
            {headerCenter}
          </Box>
        ) : null}

        {/* Chevron trigger (kept separate so centered content doesn't have to nest inside Trigger) */}
        <Collapsible.Trigger asChild>
          <Box bg="transparent" border="0" minW="86px" justifyContent="right" display={"flex"}>
            <Collapsible.Indicator asChild>
              <Box transition="transform 150ms" _open={{ transform: "rotate(180deg)" }}>
                <FiChevronDown />
              </Box>
            </Collapsible.Indicator>
          </Box>
        </Collapsible.Trigger>
      </Grid>
      <Collapsible.Content>

      {/* content goes here */}
      {children}

      </Collapsible.Content>
    </Collapsible.Root>

  );
}