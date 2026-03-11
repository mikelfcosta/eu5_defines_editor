import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const definesRootDir = path.join(root, "src", "data", "defines");

function compareSemver(left, right) {
  const leftParts = left.split(".").map((part) => Number.parseInt(part, 10));
  const rightParts = right.split(".").map((part) => Number.parseInt(part, 10));
  const length = Math.max(leftParts.length, rightParts.length, 3);

  for (let index = 0; index < length; index += 1) {
    const leftValue = Number.isFinite(leftParts[index]) ? leftParts[index] : 0;
    const rightValue = Number.isFinite(rightParts[index]) ? rightParts[index] : 0;
    if (leftValue === rightValue) {
      continue;
    }

    return leftValue - rightValue;
  }

  return 0;
}

async function getKnownVersions() {
  const manifestPath = path.join(definesRootDir, "manifest.json");
  const raw = await fs.readFile(manifestPath, "utf8");
  const manifest = JSON.parse(raw);

  const versions = Array.isArray(manifest?.versions)
    ? manifest.versions
      .map((entry) => entry?.version)
      .filter((version) => typeof version === "string" && version.length > 0)
    : [];

  return versions.sort(compareSemver);
}

function getComparableDefine(define) {
  return {
    id: define.id,
    category: define.category,
    key: define.key,
    type: define.type,
    defaultValue: define.defaultValue,
    itemTypes: define.itemTypes ?? null,
    comment: define.comment ?? null,
    aiComment: define.aiComment ?? null
  };
}

async function readVersionDefines(version) {
  const versionDir = path.join(definesRootDir, version);
  const entries = await fs.readdir(versionDir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json") && entry.name !== "index.json")
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  const map = new Map();

  for (const fileName of files) {
    const fullPath = path.join(versionDir, fileName);
    const raw = await fs.readFile(fullPath, "utf8");
    const parsed = JSON.parse(raw);
    const defines = Array.isArray(parsed?.defines) ? parsed.defines : [];

    for (const define of defines) {
      if (typeof define?.id !== "string" || define.id.length === 0) {
        continue;
      }

      map.set(define.id, getComparableDefine(define));
    }
  }

  return map;
}

function fieldDiff(left, right) {
  const changedFields = [];
  for (const key of ["category", "key", "type", "defaultValue", "itemTypes", "comment", "aiComment"]) {
    if (JSON.stringify(left[key]) !== JSON.stringify(right[key])) {
      changedFields.push(key);
    }
  }

  return changedFields;
}

function formatValue(value) {
  return JSON.stringify(value);
}

function printSection(title, lines) {
  if (lines.length === 0) {
    return;
  }

  console.log(`\n${title}`);
  for (const line of lines) {
    console.log(line);
  }
}

async function run() {
  const args = process.argv.slice(2).filter(Boolean);
  const knownVersions = await getKnownVersions();

  if (knownVersions.length < 2) {
    throw new Error("Need at least two generated versions in src/data/defines to compute a diff.");
  }

  let fromVersion = "";
  let toVersion = "";

  if (args.length === 0) {
    fromVersion = knownVersions[knownVersions.length - 2];
    toVersion = knownVersions[knownVersions.length - 1];
  } else if (args.length === 2) {
    [fromVersion, toVersion] = args;
  } else {
    throw new Error("Usage: npm run diff:defines -- <fromVersion> <toVersion>");
  }

  if (!knownVersions.includes(fromVersion)) {
    throw new Error(`Version not found in generated data: ${fromVersion}`);
  }

  if (!knownVersions.includes(toVersion)) {
    throw new Error(`Version not found in generated data: ${toVersion}`);
  }

  const fromDefines = await readVersionDefines(fromVersion);
  const toDefines = await readVersionDefines(toVersion);

  const added = [];
  const removed = [];
  const changed = [];

  for (const [id, rightDefine] of toDefines.entries()) {
    const leftDefine = fromDefines.get(id);
    if (!leftDefine) {
      added.push(`+ ${id}`);
      continue;
    }

    const changedFields = fieldDiff(leftDefine, rightDefine);
    if (changedFields.length > 0) {
      const details = changedFields
        .map((field) => `${field}: ${formatValue(leftDefine[field])} -> ${formatValue(rightDefine[field])}`)
        .join(" | ");
      changed.push(`~ ${id} ${details}`);
    }
  }

  for (const id of fromDefines.keys()) {
    if (!toDefines.has(id)) {
      removed.push(`- ${id}`);
    }
  }

  added.sort((left, right) => left.localeCompare(right));
  removed.sort((left, right) => left.localeCompare(right));
  changed.sort((left, right) => left.localeCompare(right));

  console.log(`Comparing ${fromVersion} -> ${toVersion}`);
  console.log(`Added: ${added.length}`);
  console.log(`Removed: ${removed.length}`);
  console.log(`Changed: ${changed.length}`);

  printSection("Added defines", added);
  printSection("Removed defines", removed);
  printSection("Changed defines", changed);
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});