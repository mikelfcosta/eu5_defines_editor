import type { DefineType, DefineValue } from "../types/defines";

export function parseInputValue(type: DefineType, raw: string): DefineValue {
  if (type === "integer") {
    if (!/^-?\d+$/.test(raw.trim())) {
      throw new Error("Must be a whole number.");
    }

    return Number.parseInt(raw, 10);
  }

  if (type === "float") {
    if (!/^-?(?:\d+\.\d*|\d*\.\d+|\d+)$/.test(raw.trim())) {
      throw new Error("Must be a valid number.");
    }

    return Number.parseFloat(raw);
  }

  if (type === "boolean") {
    if (raw !== "yes" && raw !== "no") {
      throw new Error("Must be yes or no.");
    }

    return raw === "yes";
  }

  return raw;
}

export function stringifyDefineValue(value: DefineValue): string {
  if (typeof value === "boolean") {
    return value ? "yes" : "no";
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join(", ");
  }

  return String(value);
}

export function validateArrayItems(rawItems: string[]): string | null {
  if (rawItems.some((item) => item.trim() === "")) {
    return "Array entries cannot be empty.";
  }

  return null;
}
