export type DefineType =
  | "integer"
  | "float"
  | "string"
  | "boolean"
  | "array"
  | "variable"
  | "expression";

export type DefineValue = string | number | boolean | Array<string | number | boolean>;

export interface DefineEntry {
  id: string;
  category: string;
  key: string;
  type: DefineType;
  defaultValue: DefineValue;
  itemTypes?: string[];
  comment?: string;
  aiComment?: string;
}

export interface DefineCategory {
  name: string;
  defines: DefineEntry[];
}

export interface DefinesData {
  version: string;
  generatedAt: string;
  categories: DefineCategory[];
  totalDefines: number;
}

export interface Project {
  id: string;
  name: string;
  updatedAt: string;
  version: string;
  modVersion: string;
  modName: string;
  modDescription: string;
  delta: Record<string, DefineValue>;
}

export interface ProjectState {
  projects: Project[];
  activeProjectId: string | null;
}
