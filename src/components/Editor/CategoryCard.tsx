import type { DefineCategory, DefineEntry } from "../../types/defines";
import { Box, Button, Collapse, Text, VStack } from "@chakra-ui/react";
import { DefineRow } from "./DefineRow";

interface CategoryCardProps {
  category: DefineCategory;
  modifiedCount: number;
  isCollapsed: boolean;
  getDisplayValue: (entry: DefineEntry) => string;
  getIsModified: (entry: DefineEntry) => boolean;
  getError: (entry: DefineEntry) => string | undefined;
  onToggleCollapse: (categoryName: string) => void;
  onUpdateDefine: (entry: DefineEntry, raw: string) => void;
  onResetDefine: (entry: DefineEntry) => void;
}

export function CategoryCard({
  category,
  modifiedCount,
  isCollapsed,
  getDisplayValue,
  getIsModified,
  getError,
  onToggleCollapse,
  onUpdateDefine,
  onResetDefine
}: CategoryCardProps) {
  const categoryId = category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  return (
    <Box as="article" id={`category-${categoryId}`} bg="panelBg" border="1px solid" borderColor="borderPrimary" borderRadius="md" scrollMarginTop="140px">
      <Button
        variant="ghost"
        w="full"
        justifyContent="space-between"
        borderRadius={0}
        px={4}
        py={2}
        color="textPrimary"
        _hover={{ bg: "surface.700" }}
        onClick={() => onToggleCollapse(category.name)}
        aria-expanded={!isCollapsed}
        aria-controls={`category-panel-${category.name}`}
      >
        <Text fontSize="xl" fontWeight={600}>{category.name}</Text>
        <Text color="textSecondary" fontSize="sm" ml="auto" mr={4}>
          {category.defines.length} entries / {modifiedCount} modified
        </Text>
        <Text color="textSecondary" aria-hidden="true">
          {isCollapsed ? "+" : "-"}
        </Text>
      </Button>

      <Collapse in={!isCollapsed} animateOpacity unmountOnExit>
        <VStack id={`category-panel-${category.name}`} spacing={0} align="stretch">
          {category.defines.map((entry) => (
            <DefineRow
              key={entry.id}
              entry={entry}
              value={getDisplayValue(entry)}
              isModified={getIsModified(entry)}
              error={getError(entry)}
              onUpdate={onUpdateDefine}
              onReset={onResetDefine}
            />
          ))}
        </VStack>
      </Collapse>
    </Box>
  );
}
