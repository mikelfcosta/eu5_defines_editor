import type { Project, ProjectState } from "../types/defines";

const STORAGE_KEY = "euv-defines-editor-projects-v1";

function newProject(version: string, name = "My Project"): Project {
  const id = crypto.randomUUID();
  const updatedAt = new Date().toISOString();
  return {
    id,
    name,
    updatedAt,
    version,
    modVersion: "0.0.0",
    modName: "euv-defines-mod",
    modDescription: "Created with EUV Defines Editor",
    delta: {},
    lastExportedDelta: {}
  };
}

export function loadProjectState(defaultVersion: string): ProjectState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const first = newProject(defaultVersion);
      return { projects: [first], activeProjectId: first.id };
    }

    const parsed = JSON.parse(raw) as ProjectState;
    if (!parsed.projects?.length) {
      const first = newProject(defaultVersion);
      return { projects: [first], activeProjectId: first.id };
    }

    const projects = parsed.projects.map((project) => ({
      ...project,
      updatedAt: project.updatedAt ?? new Date().toISOString(),
      lastExportedDelta: project.lastExportedDelta ?? {}
    }));

    return {
      projects,
      activeProjectId: parsed.activeProjectId
    };
  } catch {
    const first = newProject(defaultVersion);
    return { projects: [first], activeProjectId: first.id };
  }
}

export function saveProjectState(state: ProjectState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function createProject(version: string, name?: string): Project {
  return newProject(version, name ?? "New Project");
}

export function bumpSemver(version: string, bump: "major" | "minor" | "patch"): string {
  const parts = version.split(".").map((part) => Number.parseInt(part, 10));
  while (parts.length < 3) {
    parts.push(0);
  }

  const [major, minor, patch] = parts;

  if (bump === "major") {
    return `${major + 1}.0.0`;
  }

  if (bump === "minor") {
    return `${major}.${minor + 1}.0`;
  }

  return `${major}.${minor}.${patch + 1}`;
}
