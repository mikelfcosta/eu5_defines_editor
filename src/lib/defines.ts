import type { DefinesData } from "../types/defines";

const modules = import.meta.glob("../data/defines/*.json", { eager: true });

const entries = Object.entries(modules)
  .filter(([path]) => !path.endsWith("manifest.json"))
  .map(([path, module]) => {
    const match = path.match(/\/([^/]+)\.json$/);
    const version = match?.[1] ?? "unknown";
    const data = (module as { default: DefinesData }).default;
    return { version, data };
  })
  .sort((a, b) => a.version.localeCompare(b.version, undefined, { numeric: true }));

export const definesByVersion = Object.fromEntries(entries.map((entry) => [entry.version, entry.data]));

export const availableVersions = entries.map((entry) => entry.version);
