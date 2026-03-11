import JSZip from "jszip";
import type { DefineValue, DefinesData, Project } from "../types/defines";
import packageJson from "../../package.json";

function toKebabCase(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "euv-defines-mod";
}

function valueToScript(value: DefineValue): string {
  if (typeof value === "boolean") {
    return value ? "yes" : "no";
  }

  if (typeof value === "number") {
    return Number.isInteger(value) ? `${value}` : `${value}`;
  }

  if (Array.isArray(value)) {
    const values = value.map((item) => {
      if (typeof item === "boolean") {
        return item ? "yes" : "no";
      }

      if (typeof item === "number") {
        return `${item}`;
      }

      return /^@/.test(item) || /^\@\[/.test(item) ? item : item.includes(" ") ? `"${item}"` : item;
    });

    return `{ ${values.join(" ")} }`;
  }

  if (/^@/.test(value) || /^\@\[/.test(value)) {
    return value;
  }

  return `"${value.replaceAll('"', '\\"')}"`;
}

function buildDefinesFile(defines: DefinesData, delta: Record<string, DefineValue>): string {
  const sections: string[] = [];

  for (const category of defines.categories) {
    sections.push(`${category.name} = {`);

    for (const define of category.defines) {
      const value = delta[define.id] ?? define.defaultValue;
      const comment = define.comment ? ` # ${define.comment}` : "";
      sections.push(`  ${define.key} = ${valueToScript(value)}${comment}`);
    }

    sections.push("}", "");
  }

  return sections.join("\n").trimEnd() + "\n";
}

export async function exportProjectZip(project: Project, defines: DefinesData): Promise<Blob> {
  const zip = new JSZip();
  const safeName = toKebabCase(project.modName || project.name);
  const root = zip.folder(safeName);

  if (!root) {
    throw new Error("Unable to create ZIP root folder.");
  }

  const fullDefines = buildDefinesFile(defines, project.delta);
  const supportedMajor = Number.parseInt(defines.version.split(".")[0] ?? "1", 10);

  const metadata = {
    name: project.name,
    id: toKebabCase(project.modName || project.name),
    version: project.modVersion,
    supported_game_version: `${Number.isFinite(supportedMajor) ? supportedMajor : 1}.*.*`,
    short_description: project.modDescription || project.name,
    tags: ["Balance", "Defines"],
    relationships: [],
    game_custom_data: {}
  };

  const editorExport = {
    editorVersion: packageJson.version,
    editorProject: {
      id: project.id,
      name: project.name,
      modName: project.modName,
      version: project.modVersion,
      gameVersion: project.version,
      updatedAt: project.updatedAt
    },
    modifiedValues: Object.fromEntries(
      Object.entries(project.delta).map(([key, value]) => [
        key,
        Array.isArray(value) ? [...value] : value
      ])
    )
  };

  root.file("loading_screen/common/defines/00_defines.txt", fullDefines);
  root.file(".metadata/metadata.json", `${JSON.stringify(metadata, null, "\t")}\n`);
  root.file("editor.json", `${JSON.stringify(editorExport, null, 2)}\n`);

  return zip.generateAsync({ type: "blob" });
}
