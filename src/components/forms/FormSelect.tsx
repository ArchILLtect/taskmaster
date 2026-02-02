import { Box, Flex, HStack, Select, Text, useListCollection } from "@chakra-ui/react";
import { useEffect } from "react";
import { FiInfo } from "react-icons/fi";
import { Tooltip } from "../ui/Tooltip";

type SelectItem = { label: string; value: string };

type FormSelectProps = {
  title: string;
  items: SelectItem[];
  value: string;
  onChange: (nextValue: string) => void;
  placeholder?: string;
  helperText?: string;
  helperMode?: "tooltip" | "below";
  layout?: "stacked" | "row";
  minW?: string;
  maxW?: string;
  labelFontSize?: React.ComponentProps<typeof Select.Label>["fontSize"];
  labelFontWeight?: React.ComponentProps<typeof Select.Label>["fontWeight"];
  labelColor?: React.ComponentProps<typeof Select.Label>["color"];
};

export function FormSelect({
  title,
  items,
  value,
  onChange,
  placeholder,
  helperText,
  helperMode = "tooltip",
  layout = "stacked",
  minW,
  maxW,
  labelFontSize,
  labelFontWeight,
  labelColor,
}: FormSelectProps) {
  const { collection, set: setCollection } = useListCollection<SelectItem>({
    initialItems: items,
    itemToValue: (item) => item.value,
    itemToString: (item) => item.label,
  });

  useEffect(() => {
    setCollection(items);
  }, [items, setCollection]);

  const helper = helperText ? (
    helperMode === "below" ? (
      <Text fontSize="xs" color="gray.500" mt={1}>
        {helperText}
      </Text>
    ) : (
      <Tooltip content={helperText} showArrow>
        <Box as="span" color="gray.500" cursor="help" lineHeight="0">
          <FiInfo />
        </Box>
      </Tooltip>
    )
  ) : null;

  const computedLabelColor = labelColor ?? "gray.600";

  return (
    <Select.Root
      collection={collection}
      value={[value]}
      onValueChange={(e) => onChange(e.value[0] ?? "")}
    >
      {layout === "row" ? (
        <Flex justify="space-between" align="center" width="100%">
          <HStack gap={1} align="center">
            <Select.Label
              fontSize={labelFontSize ?? "small"}
              color={computedLabelColor}
              fontWeight={labelFontWeight ?? "bold"}
            >
              {title}
            </Select.Label>
            {helperMode === "tooltip" ? helper : null}
          </HStack>

          <Select.Control bg="white" minW={minW ?? "200px"} maxW={maxW ?? "200px"}>
            <Select.Trigger>
              <Select.ValueText placeholder={placeholder ?? "Select an option"} />
              <Select.Indicator />
            </Select.Trigger>
          </Select.Control>
          <Select.Positioner>
            <Select.Content>
              {collection.items.map((item) => (
                <Select.Item item={item} key={item.value}>
                  <Select.ItemText>{item.label}</Select.ItemText>
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Flex>
      ) : (
        <Box>
          <HStack gap={1} align="center" mb={1}>
            <Select.Label
              fontSize={labelFontSize ?? "sm"}
              color={computedLabelColor}
              fontWeight={labelFontWeight}
              mb={0}
            >
              {title}
            </Select.Label>
            {helperMode === "tooltip" ? helper : null}
          </HStack>

          <Select.Control bg="white" minW={minW ?? "220px"} maxW={maxW}>
            <Select.Trigger>
              <Select.ValueText placeholder={placeholder ?? "Select an option"} />
              <Select.Indicator />
            </Select.Trigger>
          </Select.Control>
          <Select.Positioner>
            <Select.Content>
              {collection.items.map((item) => (
                <Select.Item item={item} key={item.value}>
                  <Select.ItemText>{item.label}</Select.ItemText>
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>

          {helperMode === "below" ? helper : null}
        </Box>
      )}
    </Select.Root>
  );
}