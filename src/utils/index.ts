import type { DefineEntry, DefineValue } from "../types/defines";

export function equalsValue(left: DefineValue, right: DefineValue): boolean {
  if (Array.isArray(left) && Array.isArray(right)) {
    return JSON.stringify(left) === JSON.stringify(right);
  }

  return left === right;
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function defineMatchesQuery(entry: DefineEntry, query: string): boolean {
  if (!query) {
    return true;
  }

  const normalized = query.toLowerCase();
  return entry.key.toLowerCase().includes(normalized) || entry.comment?.toLowerCase().includes(normalized) === true;
}

export function toCategoryId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function toKebabCase(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "euv-defines-mod";
}

export function summarizeChangedCategories(delta: Record<string, DefineValue>): string {
  const counts = new Map<string, number>();

  for (const defineId of Object.keys(delta)) {
    const categoryName = defineId.split(".")[0];
    if (!categoryName) {
      continue;
    }

    counts.set(categoryName, (counts.get(categoryName) ?? 0) + 1);
  }

  if (counts.size === 0) {
    return "Changed no categories";
  }

  const segments = Array.from(counts.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([categoryName, count]) => `${categoryName} (${count})`);

  return `Changed ${segments.join(", ")}`;
}

export function stripGeneratedChangeSummary(description: string): string {
  const lines = description
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const filtered = lines.filter(
    (line) => !/^Changed\s.+\(\d+\)(,\s*.+\(\d+\))*$/i.test(line)
  );

  return filtered.join("\n").trim();
}

export function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString();
}

export function hasDeltaChangedSinceExport(
  current: Record<string, DefineValue>,
  baseline: Record<string, DefineValue>
): boolean {
  const currentKeys = Object.keys(current);
  const baselineKeys = Object.keys(baseline);

  if (currentKeys.length !== baselineKeys.length) {
    return true;
  }

  for (const key of currentKeys) {
    if (!(key in baseline)) {
      return true;
    }

    const currentValue = current[key];
    const baselineValue = baseline[key];
    if (!equalsValue(currentValue, baselineValue)) {
      return true;
    }
  }

  return false;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isDefineValue(value: unknown): value is DefineValue {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return true;
  }

  if (!Array.isArray(value)) {
    return false;
  }

  return value.every(
    (item) => typeof item === "string" || typeof item === "number" || typeof item === "boolean"
  );
}

function sanitizeImportedDelta(value: unknown): Record<string, DefineValue> {
  if (!isRecord(value)) {
    return {};
  }

  const sanitized: Record<string, DefineValue> = {};
  for (const [key, item] of Object.entries(value)) {
    if (isDefineValue(item)) {
      sanitized[key] = Array.isArray(item) ? [...item] : item;
    }
  }

  return sanitized;
}

export function parseImportedProjectPayload(value: unknown): {
  editorProject: Record<string, unknown>;
  modifiedValues: Record<string, DefineValue>;
} | null {
  if (!isRecord(value)) {
    return null;
  }

  const editorProject = isRecord(value.editorProject) ? value.editorProject : null;
  if (!editorProject) {
    return null;
  }

  return {
    editorProject,
    modifiedValues: sanitizeImportedDelta(value.modifiedValues)
  };
}
