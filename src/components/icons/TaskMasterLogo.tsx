import { HStack, Text, Box } from "@chakra-ui/react";

export function TaskMasterLogo({
  size = 44,
}: {
  size?: number;
}) {
  return (
    <HStack gap={3} align="center">
      {/* Mark */}
      <Box
        w={`${size}px`}
        h={`${size}px`}
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        rounded="lg"
        bg="blackAlpha.50"
        borderWidth="1px"
      >
        <svg
          width={Math.round(size * 0.75)}
          height={Math.round(size * 0.75)}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          {/* < */}
          <path
            d="M9 6L4 12L9 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* /> */}
          <path
            d="M15 6L20 12L15 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* check */}
          <path
            d="M9.5 12.5L11.3 14.3L14.8 10.8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Box>

      {/* Wordmark */}
      <Text mb={1} fontSize="5xl" fontWeight="800" letterSpacing="-0.02em">
        TaskMaster
      </Text>
    </HStack>
  );
}
