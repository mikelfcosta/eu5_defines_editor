import type { DefineCategory, DefineEntry } from "../../types/defines";
import { CategoryCard } from "./CategoryCard";
import { SearchBar } from "./SearchBar";

interface EditorViewProps {
  search: string;
  categoryFilter: string;
  categoryNames: string[];
  modifiedOnly: boolean;
  filteredCategories: DefineCategory[];
  getCategoryModifiedCount: (category: DefineCategory) => number;
  isCategoryCollapsed: (categoryName: string) => boolean;
  getDisplayValue: (entry: DefineEntry) => string;
  getIsModified: (entry: DefineEntry) => boolean;
  getError: (entry: DefineEntry) => string | undefined;
  onSearchChange: (value: string) => void;
  onCategoryFilterChange: (value: string) => void;
  onModifiedOnlyChange: (value: boolean) => void;
  onToggleCategory: (categoryName: string) => void;
  onUpdateDefine: (entry: DefineEntry, raw: string) => void;
  onResetDefine: (entry: DefineEntry) => void;
}

export function EditorView({
  search,
  categoryFilter,
  categoryNames,
  modifiedOnly,
  filteredCategories,
  getCategoryModifiedCount,
  isCategoryCollapsed,
  getDisplayValue,
  getIsModified,
  getError,
  onSearchChange,
  onCategoryFilterChange,
  onModifiedOnlyChange,
  onToggleCategory,
  onUpdateDefine,
  onResetDefine
}: EditorViewProps) {
  return (
    <div className="editor-view">
      <SearchBar
        search={search}
        categoryFilter={categoryFilter}
        categoryNames={categoryNames}
        modifiedOnly={modifiedOnly}
        onSearchChange={onSearchChange}
        onCategoryFilterChange={onCategoryFilterChange}
        onModifiedOnlyChange={onModifiedOnlyChange}
      />

      <section className="category-list" aria-label="Defines by category">
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
        {filteredCategories.length === 0 ? <p>No defines match the current filters.</p> : null}
      </section>
    </div>
  );
}
