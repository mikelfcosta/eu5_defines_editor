import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseDefinesText } from "./defines-parser.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const assetsDir = path.join(root, "assets");
const outputDir = path.join(root, "src", "data", "defines");

async function generate() {
  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });
  const entries = await fs.readdir(assetsDir, { withFileTypes: true });
  const defineFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".txt"));

  const versions = [];

  for (const file of defineFiles) {
    const version = file.name.replace(/\.txt$/, "");
    const fullPath = path.join(assetsDir, file.name);
    const text = await fs.readFile(fullPath, "utf8");
    const parsed = parseDefinesText(text, version);

    // Create a subdirectory per version
    const versionDir = path.join(outputDir, version);
    await fs.mkdir(versionDir, { recursive: true });

    // Write one file per category
    for (const category of parsed.categories) {
      await fs.writeFile(
        path.join(versionDir, `${category.name}.json`),
        `${JSON.stringify(category, null, 2)}\n`,
        "utf8"
      );
    }

    // Write a version index that references category names and metadata
    const index = {
      version: parsed.version,
      generatedAt: parsed.generatedAt,
      totalDefines: parsed.totalDefines,
      categories: parsed.categories.map((c) => c.name),
    };
    await fs.writeFile(
      path.join(versionDir, "index.json"),
      `${JSON.stringify(index, null, 2)}\n`,
      "utf8"
    );

    versions.push({
      version,
      totalDefines: parsed.totalDefines,
      categories: parsed.categories.length
    });
  }

  await fs.writeFile(path.join(outputDir, "manifest.json"), `${JSON.stringify({ versions }, null, 2)}\n`, "utf8");

  console.log(`Generated defines JSON for ${versions.length} version(s).`);
}

generate().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
