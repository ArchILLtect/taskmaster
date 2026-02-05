import { Box, Button, HStack, Input, Text } from "@chakra-ui/react";
import { FiInfo } from "react-icons/fi";
import { useId } from "react";

import { FormSelect } from "../forms/FormSelect";
import { Tooltip } from "./Tooltip";

export type Option<T extends string = string> = { label: string; value: T };

export type SelectControlProps = {
  title: string;
  items: Option<string>[];
  value: string;
  onChange: (value: string | null) => void;
  placeholder?: string;
  helperText?: string;
};

export type SearchFilterSortBarProps = {
  search: string;
  setSearch: (value: string) => void;

  searchPlaceholder?: string;
  searchHelperText?: string;

  filter?: SelectControlProps;
  sort?: SelectControlProps;

  onClear?: () => void;
  resultsCount?: number;
};

export function SearchFilterSortBar({
  search,
  setSearch,
  searchPlaceholder,
  searchHelperText,
  filter,
  sort,
  onClear,
  resultsCount,
}: SearchFilterSortBarProps) {
  const reactId = useId();

  return (
    <HStack
      w="100%"
      gap={3}
      flexWrap="wrap"
      align="end"
      justify="space-between"
      mt={2}
      py={3}
      ml={2}
      pl={5}
      borderLeft="5px solid gray"
    >
      <HStack gap={3} flexWrap="wrap" align="end">
        <Box>
          <HStack gap={1} mb={1} align="center">
            <Text fontSize="sm" color="gray.600" fontWeight={500}>
              Search
            </Text>
            {searchHelperText ? (
              <Tooltip content={searchHelperText} showArrow>
                <Box as="span" color="gray.500" cursor="help" lineHeight="0">
                  <FiInfo />
                </Box>
              </Tooltip>
            ) : null}
          </HStack>
          <Input
            placeholder={searchPlaceholder ?? "Search"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            maxW="320px"
            id={`search-${reactId}`}
            name="search"
          />
        </Box>

        {filter ? (
          <FormSelect
            title={filter.title}
            name="filter"
            items={filter.items}
            value={filter.value}
            onChange={filter.onChange}
            placeholder={filter.placeholder}
            helperText={filter.helperText}
          />
        ) : null}

        {sort ? (
          <FormSelect
            title={sort.title}
            name="sort"
            items={sort.items}
            value={sort.value}
            onChange={sort.onChange}
            placeholder={sort.placeholder}
            helperText={sort.helperText}
          />
        ) : null}

        {onClear ? (
          <Button variant="outline" size="sm" onClick={onClear}>
            Clear
          </Button>
        ) : null}
      </HStack>

      {typeof resultsCount === "number" ? (
        <Text fontSize="sm" color="gray.600">
          Results: {resultsCount}
        </Text>
      ) : null}
    </HStack>
  );
}
