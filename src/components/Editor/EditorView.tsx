import type { DefineCategory, DefineEntry } from "../../types/defines";
import { Box, Text } from "@chakra-ui/react";
import { CategoryCard } from "./CategoryCard";

interface EditorViewProps {
  filteredCategories: DefineCategory[];
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
  getCategoryModifiedCount,
  isCategoryCollapsed,
  getDisplayValue,
  getIsModified,
  getError,
  onToggleCategory,
  onUpdateDefine,
  onResetDefine
}: EditorViewProps) {
  return (
    <Box>
      <Box as="section" aria-label="Defines by category" display="grid" gap={2}>
        {filteredCategories.map((category) => (
          <CategoryCard
            key={category.name}
            category={category}
            modifiedCount={getCategoryModifiedCount(category)}
            isCollapsed={isCategoryCollapsed(category.name)}
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
