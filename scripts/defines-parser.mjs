const CATEGORY_START = /^([A-Za-z0-9_]+)\s*=\s*\{\s*$/;
const ASSIGNMENT = /^([A-Za-z0-9_@]+)\s*=\s*(.*)$/;

function splitInlineComment(line) {
  let inString = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"' && line[i - 1] !== "\\") {
      inString = !inString;
      continue;
    }

    if (char === "#" && !inString) {
      return {
        value: line.slice(0, i).trim(),
        comment: line.slice(i + 1).trim()
      };
    }
  }

  return { value: line.trim(), comment: "" };
}

function countBraces(text) {
  let inString = false;
  let depth = 0;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"' && text[i - 1] !== "\\") {
      inString = !inString;
      continue;
    }

    if (!inString && char === "{") {
      depth += 1;
    }

    if (!inString && char === "}") {
      depth -= 1;
    }
  }

  return depth;
}

function parseScalar(token) {
  const normalized = token.replace(/;$/, "").trim();

  if (normalized.startsWith('"') && normalized.endsWith('"')) {
    return { type: "string", value: normalized.slice(1, -1) };
  }

  if (normalized === "yes" || normalized === "no") {
    return { type: "boolean", value: normalized === "yes" };
  }

  if (normalized.startsWith("@[") && normalized.endsWith("]")) {
    return { type: "expression", value: normalized };
  }

  if (normalized.startsWith("@")) {
    return { type: "variable", value: normalized };
  }

  if (/^-?\d+$/.test(normalized)) {
    return { type: "integer", value: Number.parseInt(normalized, 10) };
  }

  if (/^-?(?:\d+\.\d*|\d*\.\d+)(?:f)?$/i.test(normalized)) {
    return { type: "float", value: Number.parseFloat(normalized.replace(/f$/i, "")) };
  }

  return { type: "string", value: normalized };
}

function parseArray(rawValue) {
  const inner = rawValue.trim().replace(/^\{/, "").replace(/\}$/, "").trim();
  const tokens = inner.match(/"(?:\\.|[^"\\])*"|\S+/g) ?? [];
  const parsedItems = tokens.map((token) => parseScalar(token));

  return {
    type: "array",
    value: parsedItems.map((item) => item.value),
    itemTypes: parsedItems.map((item) => item.type)
  };
}

function parseValue(rawValue) {
  const cleaned = rawValue.trim().replace(/;$/, "");
  if (cleaned.startsWith("{")) {
    return parseArray(cleaned);
  }

  return parseScalar(cleaned);
}

export function parseDefinesText(content, version) {
  const lines = content.replace(/\r/g, "").split("\n");
  const categories = [];
  let currentCategory = null;

  for (let i = 0; i < lines.length; i += 1) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      continue;
    }

    if (!currentCategory) {
      const categoryMatch = trimmed.match(CATEGORY_START);
      if (categoryMatch) {
        currentCategory = {
          name: categoryMatch[1],
          defines: []
        };
      }
      continue;
    }

    if (trimmed.startsWith("}")) {
      categories.push(currentCategory);
      currentCategory = null;
      continue;
    }

    const assignmentMatch = trimmed.match(ASSIGNMENT);
    if (!assignmentMatch) {
      continue;
    }

    const key = assignmentMatch[1];
    let valueText = assignmentMatch[2];
    let comment = "";

    let split = splitInlineComment(valueText);
    valueText = split.value;
    comment = split.comment;

    if (valueText.startsWith("{") && countBraces(valueText) > 0) {
      let depth = countBraces(valueText);
      const collected = [valueText];

      while (depth > 0 && i + 1 < lines.length) {
        i += 1;
        const nextSplit = splitInlineComment(lines[i].trim());
        if (nextSplit.value) {
          collected.push(nextSplit.value);
          depth += countBraces(nextSplit.value);
        }
      }

      valueText = collected.join(" ");
    }

    if (!valueText) {
      continue;
    }

    const parsed = parseValue(valueText);

    currentCategory.defines.push({
      id: `${currentCategory.name}.${key}`,
      category: currentCategory.name,
      key,
      type: parsed.type,
      defaultValue: parsed.value,
      itemTypes: parsed.type === "array" ? parsed.itemTypes : undefined,
      comment: comment || undefined
    });
  }

  return {
    version,
    generatedAt: new Date().toISOString(),
    categories,
    totalDefines: categories.reduce((acc, category) => acc + category.defines.length, 0)
  };
}
