import type { DefineCategory, DefineEntry } from "../../types/defines";
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
  return (
    <article className="category-card" id={`category-${category.name}`}>
      <button
        className="category-toggle"
        onClick={() => onToggleCollapse(category.name)}
        aria-expanded={!isCollapsed}
        aria-controls={`category-panel-${category.name}`}
      >
        <span className="category-title">{category.name}</span>
        <span className="category-meta">
          {category.defines.length} entries / {modifiedCount} modified
        </span>
      </button>

      {!isCollapsed ? (
        <div className="define-list" id={`category-panel-${category.name}`}>
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
        </div>
      ) : null}
    </article>
  );
}
