import type { DefineCategory, DefineEntry } from "../../types/defines";
import { Box, Text } from "@chakra-ui/react";
import { CategoryCard } from "./CategoryCard";

interface EditorViewProps {
  filteredCategories: DefineCategory[];
  isCategoryFiltered: boolean;
  getCategoryModifiedCount: (category: DefineCategory) => number;
  isCategoryCollapsed: (categoryName: string) => boolean;
  getDisplayValue: (entry: DefineEntry) => string;
  getIsModified: (entry: DefineEntry) => boolean;
  getError: (entry: DefineEntry) => string | undefined;
  onToggleCategory: (categoryName: string) => void;
  onUpdateDefine: (entry: DefineEntry, raw: string) => void;
  onResetDefine: (entry: DefineEntry) => void;
}

export function EditorView({
  filteredCategories,
  isCategoryFiltered,
  getCategoryModifiedCount,
  isCategoryCollapsed,
  getDisplayValue,
  getIsModified,
  getError,
  onToggleCategory,
  onUpdateDefine,
  onResetDefine
}: EditorViewProps) {
  const shouldFillFilteredCategoryHeight = isCategoryFiltered && filteredCategories.length === 1;

  return (
    <Box h={shouldFillFilteredCategoryHeight ? "full" : undefined}>
      <Box as="section" aria-label="Defines by category" display="grid" gap={2} h={shouldFillFilteredCategoryHeight ? "full" : undefined}>
        {filteredCategories.map((category) => (
          <CategoryCard
            key={category.name}
            category={category}
            modifiedCount={getCategoryModifiedCount(category)}
            isCollapsed={isCategoryCollapsed(category.name)}
            fillAvailableHeight={shouldFillFilteredCategoryHeight}
            getDisplayValue={getDisplayValue}
            getIsModified={getIsModified}
            getError={getError}
            onToggleCollapse={onToggleCategory}
            onUpdateDefine={onUpdateDefine}
            onResetDefine={onResetDefine}
          />
        ))}
        {filteredCategories.length === 0 ? <Text>No defines match the current filters.</Text> : null}
      </Box>
    </Box>
  );
}
