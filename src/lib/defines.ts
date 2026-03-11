import type { DefineCategory, DefinesData } from "../types/defines";

interface VersionIndex {
  version: string;
  generatedAt: string;
  totalDefines: number;
  categories: string[];
}

const indexModules = import.meta.glob("../data/defines/*/index.json", { eager: true });
const categoryModules = import.meta.glob("../data/defines/*/*.json", { eager: true });

const entries = Object.entries(indexModules)
  .map(([indexPath, indexModule]) => {
    const index = (indexModule as { default: VersionIndex }).default;
    const dirPrefix = indexPath.replace(/index\.json$/, "");

    const categories: DefineCategory[] = index.categories.map((name) => {
      const catPath = `${dirPrefix}${name}.json`;
      const catModule = categoryModules[catPath] as { default: DefineCategory } | undefined;
      if (!catModule) {
        throw new Error(`Missing category file: ${catPath}`);
      }
      return catModule.default;
    });

    const data: DefinesData = {
      version: index.version,
      generatedAt: index.generatedAt,
      totalDefines: index.totalDefines,
      categories,
    };

    return { version: index.version, data };
  })
  .sort((a, b) => a.version.localeCompare(b.version, undefined, { numeric: true }));

export const definesByVersion = Object.fromEntries(entries.map((entry) => [entry.version, entry.data]));

export const availableVersions = entries.map((entry) => entry.version);
