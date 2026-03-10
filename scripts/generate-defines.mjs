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
  await fs.mkdir(outputDir, { recursive: true });
  const entries = await fs.readdir(assetsDir, { withFileTypes: true });
  const defineFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".txt"));

  const versions = [];

  for (const file of defineFiles) {
    const version = file.name.replace(/\.txt$/, "");
    const fullPath = path.join(assetsDir, file.name);
    const text = await fs.readFile(fullPath, "utf8");
    const parsed = parseDefinesText(text, version);

    await fs.writeFile(
      path.join(outputDir, `${version}.json`),
      `${JSON.stringify(parsed, null, 2)}\n`,
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
