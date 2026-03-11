import type { DefineCategory, DefineEntry } from "../../types/defines";
import { EditorView } from "./components/EditorView";

interface EditorPageProps {
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

export function EditorPage(props: EditorPageProps) {
  return <EditorView {...props} />;
}
