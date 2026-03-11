import { Box, Checkbox, HStack, Input, InputGroup, InputLeftElement, Select } from "@chakra-ui/react";

interface SearchBarProps {
  search: string;
  categoryFilter: string;
  categoryNames: string[];
  modifiedOnly: boolean;
  onSearchChange: (value: string) => void;
  onCategoryFilterChange: (value: string) => void;
  onModifiedOnlyChange: (value: boolean) => void;
}

export function SearchBar({
  search,
  categoryFilter,
  categoryNames,
  modifiedOnly,
  onSearchChange,
  onCategoryFilterChange,
  onModifiedOnlyChange
}: SearchBarProps) {
  return (
    <Box as="section" aria-label="Define filters" mt={1}>
      <HStack spacing={2} align="center" wrap="wrap">
        <InputGroup minW={{ base: "100%", md: "340px" }} flex="1 1 360px">
          <InputLeftElement pointerEvents="none" color="textSecondary">⌕</InputLeftElement>
          <Input
          id="search-input"
          type="search"
          placeholder="Search key or comment"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          />
        </InputGroup>

        <Select
          id="category-filter"
          w={{ base: "100%", md: "220px" }}
          value={categoryFilter}
          onChange={(event) => onCategoryFilterChange(event.target.value)}
        >
          <option value="all">All Categories</option>
          {categoryNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>

        <Checkbox
          id="modified-only"
          checked={modifiedOnly}
          onChange={(event) => onModifiedOnlyChange(event.target.checked)}
          title="Show only modified values"
          border="1px solid"
          borderColor="borderPrimary"
          px={2}
          py={1}
          borderRadius="sm"
        >
          Modified
        </Checkbox>
      </HStack>
    </Box>
  );
}
