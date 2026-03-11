import { useEffect, useMemo, useState } from "react";
import { parseInputValue, stringifyDefineValue, validateArrayItems } from "../../../lib/validation";
import type { DefineEntry, DefinesData, Project } from "../../../types/defines";
import { defineMatchesQuery, equalsValue } from "../../../utils";

interface UseDefineManagementParams {
  defines?: DefinesData;
  activeProject: Project | null;
  updateProject: (updater: (project: Project) => Project) => void;
}

export function useDefineManagement({ defines, activeProject, updateProject }: UseDefineManagementParams) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modifiedOnly, setModifiedOnly] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const clearTransientState = () => {
    setErrors({});
    setDrafts({});
  };

  const normalizedCategories = useMemo(() => {
    if (!defines) {
      return [];
    }

    const byName = new Map<string, typeof defines.categories[number]>();

    for (const category of defines.categories) {
      const existing = byName.get(category.name);
      if (!existing) {
        byName.set(category.name, { ...category, defines: [...category.defines] });
        continue;
      }

      byName.set(category.name, {
        ...existing,
        defines: [...existing.defines, ...category.defines]
      });
    }

    return Array.from(byName.values());
  }, [defines]);

  useEffect(() => {
    if (!normalizedCategories.length) {
      return;
    }

    setCollapsedCategories(
      Object.fromEntries(normalizedCategories.map((category) => [category.name, true]))
    );
  }, [normalizedCategories]);

  useEffect(() => {
    if (!normalizedCategories.length) {
      return;
    }

    if (categoryFilter === "all") {
      setCollapsedCategories(
        Object.fromEntries(normalizedCategories.map((category) => [category.name, true]))
      );
      return;
    }

    setCollapsedCategories(
      Object.fromEntries(
        normalizedCategories.map((category) => [category.name, category.name !== categoryFilter])
      )
    );
  }, [categoryFilter, normalizedCategories]);

  const categoryNames = normalizedCategories.map((category) => category.name);

  const updateDefine = (entry: DefineEntry, raw: string) => {
    if (!activeProject) {
      return;
    }

    setDrafts((state) => ({ ...state, [entry.id]: raw }));

    if (entry.type === "array") {
      const rawItems = raw.split(",").map((item) => item.trim());
      const validation = validateArrayItems(rawItems);
      if (validation) {
        setErrors((state) => ({ ...state, [entry.id]: validation }));
        return;
      }

      const nextValue = rawItems;
      setErrors((state) => {
        const next = { ...state };
        delete next[entry.id];
        return next;
      });

      updateProject((project) => {
        const nextDelta = { ...project.delta };
        if (equalsValue(nextValue, entry.defaultValue)) {
          delete nextDelta[entry.id];
        } else {
          nextDelta[entry.id] = nextValue;
        }

        return { ...project, delta: nextDelta };
      });
      return;
    }

    try {
      const nextValue = parseInputValue(entry.type, raw);
      setErrors((state) => {
        const next = { ...state };
        delete next[entry.id];
        return next;
      });

      updateProject((project) => {
        const nextDelta = { ...project.delta };
        if (equalsValue(nextValue, entry.defaultValue)) {
          delete nextDelta[entry.id];
        } else {
          nextDelta[entry.id] = nextValue;
        }
        return { ...project, delta: nextDelta };
      });
    } catch (error) {
      setErrors((state) => ({
        ...state,
        [entry.id]: error instanceof Error ? error.message : "Invalid value"
      }));
    }
  };

  const resetDefine = (entry: DefineEntry) => {
    setDrafts((state) => {
      const next = { ...state };
      delete next[entry.id];
      return next;
    });
    setErrors((state) => {
      const next = { ...state };
      delete next[entry.id];
      return next;
    });

    updateProject((project) => {
      const nextDelta = { ...project.delta };
      delete nextDelta[entry.id];
      return { ...project, delta: nextDelta };
    });
  };

  const filteredCategories = normalizedCategories
    .map((category) => {
      if (categoryFilter !== "all" && category.name !== categoryFilter) {
        return { ...category, defines: [] };
      }

      const filteredDefines = category.defines.filter((entry) => {
        const currentValue = activeProject?.delta[entry.id] ?? entry.defaultValue;
        const isModified = !equalsValue(currentValue, entry.defaultValue);
        return defineMatchesQuery(entry, search) && (!modifiedOnly || isModified);
      });

      return {
        ...category,
        defines: filteredDefines
      };
    })
    .filter((category) => category.defines.length > 0);

  const getIsModified = (entry: DefineEntry): boolean => {
    const currentValue = activeProject?.delta[entry.id] ?? entry.defaultValue;
    return !equalsValue(currentValue, entry.defaultValue);
  };

  const getCategoryModifiedCount = (categoryName: string): number => {
    const sourceCategory = normalizedCategories.find((category) => category.name === categoryName);
    if (!sourceCategory) {
      return 0;
    }

    return sourceCategory.defines.filter((entry) => getIsModified(entry)).length;
  };

  const getDisplayValue = (entry: DefineEntry): string => {
    if (drafts[entry.id] !== undefined) {
      return drafts[entry.id];
    }

    const value = activeProject?.delta[entry.id] ?? entry.defaultValue;
    return stringifyDefineValue(value);
  };

  const toggleCategory = (categoryName: string) => {
    setCollapsedCategories((state) => ({
      ...state,
      [categoryName]: !state[categoryName]
    }));
  };

  const openOnlyCategory = (categoryName: string) => {
    setCollapsedCategories(
      Object.fromEntries(normalizedCategories.map((category) => [category.name, category.name !== categoryName]))
    );
  };

  return {
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    modifiedOnly,
    setModifiedOnly,
    categoryNames,

    normalizedCategories,
    filteredCategories,
    collapsedCategories,

    errors,
    hasErrors: Object.keys(errors).length > 0,
    clearTransientState,

    getDisplayValue,
    getIsModified,
    getCategoryModifiedCount,
    toggleCategory,
    openOnlyCategory,
    updateDefine,
    resetDefine
  };
}
