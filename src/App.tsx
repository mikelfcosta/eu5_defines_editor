import { useEffect, useMemo, useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import type { DefineEntry, DefineValue, Project } from "./types/defines";
import { availableVersions, definesByVersion } from "./lib/defines";
import { parseInputValue, stringifyDefineValue, validateArrayItems } from "./lib/validation";
import { bumpSemver, createProject, loadProjectState, saveProjectState } from "./lib/storage";
import { exportProjectZip } from "./lib/exporter";

import docsIndex from "./content/docs/index.md?raw";
import docsGettingStarted from "./content/docs/getting-started.md?raw";
import docsInstallMod from "./content/docs/install-mod.md?raw";
import docsUsingEditor from "./content/docs/using-editor.md?raw";
import docsExporting from "./content/docs/exporting-versioning.md?raw";

type Theme = "dark" | "light";

const docsPages = [
  { path: "/docs", title: "Docs", markdown: docsIndex },
  { path: "/docs/getting-started", title: "Getting Started", markdown: docsGettingStarted },
  { path: "/docs/install-mod", title: "How to Install a Mod", markdown: docsInstallMod },
  { path: "/docs/using-editor", title: "Using the Editor", markdown: docsUsingEditor },
  { path: "/docs/exporting-versioning", title: "Exporting and Versioning", markdown: docsExporting }
];

function equalsValue(left: DefineValue, right: DefineValue): boolean {
  if (Array.isArray(left) && Array.isArray(right)) {
    return JSON.stringify(left) === JSON.stringify(right);
  }

  return left === right;
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function defineMatchesQuery(entry: DefineEntry, query: string): boolean {
  if (!query) {
    return true;
  }

  const normalized = query.toLowerCase();
  return entry.key.toLowerCase().includes(normalized) || entry.comment?.toLowerCase().includes(normalized) === true;
}

export default function App() {
  const defaultVersion = availableVersions[0];
  const [theme, setTheme] = useState<Theme>("dark");
  const [selectedVersion, setSelectedVersion] = useState(defaultVersion);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modifiedOnly, setModifiedOnly] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [bumpType, setBumpType] = useState<"patch" | "minor" | "major">("patch");
  const [isExporting, setIsExporting] = useState(false);

  const [projectState, setProjectState] = useState(() => loadProjectState(defaultVersion));

  const activeProject = useMemo(() => {
    const found = projectState.projects.find((project) => project.id === projectState.activeProjectId);
    return found ?? projectState.projects[0] ?? null;
  }, [projectState]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    saveProjectState(projectState);
  }, [projectState]);

  useEffect(() => {
    if (activeProject && activeProject.version !== selectedVersion) {
      setSelectedVersion(activeProject.version);
    }
  }, [activeProject, selectedVersion]);

  const defines = definesByVersion[selectedVersion];
  const hasErrors = Object.keys(errors).length > 0;

  if (!defaultVersion || !defines) {
    return <p>Unable to load defines data. Run npm run generate:defines.</p>;
  }

  const categoryNames = defines.categories.map((category) => category.name);

  const updateProject = (updater: (project: Project) => Project) => {
    if (!activeProject) {
      return;
    }

    setProjectState((state) => ({
      ...state,
      projects: state.projects.map((project) => (project.id === activeProject.id ? updater(project) : project))
    }));
  };

  const updateDefine = (entry: DefineEntry, raw: string) => {
    if (!activeProject) {
      return;
    }

    setDrafts((state) => ({ ...state, [entry.id]: raw }));

    if (entry.type === "array") {
      const rawItems = raw.split(",").map((item) => item.trim());
      const validation = validateArrayItems(rawItems);
      if (validation) {
        setErrors((state) => ({ ...state, [entry.id]: validation }));
        return;
      }

      const nextValue = rawItems;
      setErrors((state) => {
        const next = { ...state };
        delete next[entry.id];
        return next;
      });

      updateProject((project) => {
        const nextDelta = { ...project.delta };
        if (equalsValue(nextValue, entry.defaultValue)) {
          delete nextDelta[entry.id];
        } else {
          nextDelta[entry.id] = nextValue;
        }

        return { ...project, delta: nextDelta };
      });
      return;
    }

    try {
      const nextValue = parseInputValue(entry.type, raw);
      setErrors((state) => {
        const next = { ...state };
        delete next[entry.id];
        return next;
      });

      updateProject((project) => {
        const nextDelta = { ...project.delta };
        if (equalsValue(nextValue, entry.defaultValue)) {
          delete nextDelta[entry.id];
        } else {
          nextDelta[entry.id] = nextValue;
        }
        return { ...project, delta: nextDelta };
      });
    } catch (error) {
      setErrors((state) => ({
        ...state,
        [entry.id]: error instanceof Error ? error.message : "Invalid value"
      }));
    }
  };

  const resetDefine = (entry: DefineEntry) => {
    setDrafts((state) => {
      const next = { ...state };
      delete next[entry.id];
      return next;
    });
    setErrors((state) => {
      const next = { ...state };
      delete next[entry.id];
      return next;
    });

    updateProject((project) => {
      const nextDelta = { ...project.delta };
      delete nextDelta[entry.id];
      return { ...project, delta: nextDelta };
    });
  };

  const filteredCategories = defines.categories
    .map((category) => {
      if (categoryFilter !== "all" && category.name !== categoryFilter) {
        return { ...category, defines: [] };
      }

      const filteredDefines = category.defines.filter((entry) => {
        const currentValue = activeProject?.delta[entry.id] ?? entry.defaultValue;
        const isModified = !equalsValue(currentValue, entry.defaultValue);
        return defineMatchesQuery(entry, search) && (!modifiedOnly || isModified);
      });

      return {
        ...category,
        defines: filteredDefines
      };
    })
    .filter((category) => category.defines.length > 0);

  const getDisplayValue = (entry: DefineEntry): string => {
    if (drafts[entry.id] !== undefined) {
      return drafts[entry.id];
    }

    const value = activeProject?.delta[entry.id] ?? entry.defaultValue;
    return stringifyDefineValue(value);
  };

  const createNewProject = () => {
    const name = window.prompt("Project name", "New Project");
    if (!name) {
      return;
    }

    const project = createProject(selectedVersion, name.trim());
    setProjectState((state) => ({
      projects: [...state.projects, project],
      activeProjectId: project.id
    }));
  };

  const renameProject = () => {
    if (!activeProject) {
      return;
    }

    const nextName = window.prompt("Rename project", activeProject.name);
    if (!nextName) {
      return;
    }

    updateProject((project) => ({ ...project, name: nextName.trim() }));
  };

  const deleteProject = () => {
    if (!activeProject || projectState.projects.length <= 1) {
      return;
    }

    if (!window.confirm(`Delete project ${activeProject.name}?`)) {
      return;
    }

    setProjectState((state) => {
      const remaining = state.projects.filter((project) => project.id !== activeProject.id);
      return {
        projects: remaining,
        activeProjectId: remaining[0]?.id ?? null
      };
    });
  };

  const resetProject = () => {
    if (!activeProject) {
      return;
    }

    if (!window.confirm("Reset all changes in this project?")) {
      return;
    }

    setErrors({});
    setDrafts({});
    updateProject((project) => ({ ...project, delta: {} }));
  };

  const runExport = async () => {
    if (!activeProject || hasErrors) {
      return;
    }

    setIsExporting(true);
    try {
      const nextVersion = bumpSemver(activeProject.modVersion, bumpType);
      const modName = window.prompt("Mod Name", activeProject.modName) ?? activeProject.modName;
      const modDescription =
        window.prompt("Mod Description", activeProject.modDescription) ?? activeProject.modDescription;

      const nextProject: Project = {
        ...activeProject,
        modName,
        modDescription,
        modVersion: nextVersion
      };

      setProjectState((state) => ({
        ...state,
        projects: state.projects.map((project) =>
          project.id === activeProject.id ? nextProject : project
        )
      }));

      const blob = await exportProjectZip(nextProject, defines);
      downloadBlob(blob, `${nextProject.modName.replace(/\s+/g, "_")}_${nextProject.modVersion}.zip`);
    } finally {
      setIsExporting(false);
    }
  };

  const modifiedCount = activeProject ? Object.keys(activeProject.delta).length : 0;

  return (
    <div className="app-shell">
      <aside className={`left-sidebar ${menuOpen ? "open" : ""}`}>
        <h1>EUV Defines Editor</h1>
        <p className="muted">Version {selectedVersion}</p>
        <nav aria-label="Primary navigation" className="left-nav">
          <NavLink to="/" end>
            Editor
          </NavLink>
          <NavLink to="/docs">Docs</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>

        <section className="sidebar-card">
          <h2>Projects</h2>
          <label htmlFor="project-select">Current project</label>
          <select
            id="project-select"
            value={activeProject?.id ?? ""}
            onChange={(event) => {
              const selected = projectState.projects.find((project) => project.id === event.target.value);
              setProjectState((state) => ({ ...state, activeProjectId: selected?.id ?? null }));
              setErrors({});
              setDrafts({});
            }}
          >
            {projectState.projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <div className="button-row">
            <button className="btn-secondary" onClick={createNewProject}>
              New
            </button>
            <button className="btn-ghost" onClick={renameProject} disabled={!activeProject}>
              Rename
            </button>
            <button
              className="btn-ghost"
              onClick={deleteProject}
              disabled={!activeProject || projectState.projects.length <= 1}
            >
              Delete
            </button>
          </div>
          <button className="btn-ghost" onClick={resetProject} disabled={!activeProject || modifiedCount === 0}>
            Reset Project
          </button>
        </section>

        <section className="sidebar-card">
          <label htmlFor="version-select">Game Version</label>
          <select
            id="version-select"
            value={selectedVersion}
            onChange={(event) => {
              const nextVersion = event.target.value;
              setSelectedVersion(nextVersion);
              if (activeProject) {
                updateProject((project) => ({ ...project, version: nextVersion, delta: {} }));
              }
            }}
          >
            {availableVersions.map((version) => (
              <option key={version} value={version}>
                {version}
              </option>
            ))}
          </select>

          <button
            className="btn-primary"
            onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
          >
            Toggle {theme === "dark" ? "Light" : "Dark"} Theme
          </button>
        </section>
      </aside>

      <div className="content-shell">
        <header className="top-header">
          <button className="btn-ghost mobile-only" onClick={() => setMenuOpen((open) => !open)}>
            Menu
          </button>
          <div>
            <p className="muted">Modified: {modifiedCount}</p>
          </div>
          <div className="button-row">
            <label htmlFor="bump-type" className="visually-hidden">
              Version bump
            </label>
            <select id="bump-type" value={bumpType} onChange={(event) => setBumpType(event.target.value as never)}>
              <option value="patch">Patch</option>
              <option value="minor">Minor</option>
              <option value="major">Major</option>
            </select>
            <button className="btn-primary" onClick={runExport} disabled={!activeProject || hasErrors || isExporting}>
              {isExporting ? "Exporting..." : "Export Mod ZIP"}
            </button>
          </div>
        </header>

        <main>
          <Routes>
            <Route
              path="/"
              element={
                <div className="editor-view">
                  <section className="search-bar" aria-label="Define filters">
                    <div>
                      <label htmlFor="search-input">Search</label>
                      <input
                        id="search-input"
                        type="search"
                        placeholder="Search key or comment"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="category-filter">Category</label>
                      <select
                        id="category-filter"
                        value={categoryFilter}
                        onChange={(event) => setCategoryFilter(event.target.value)}
                      >
                        <option value="all">All Categories</option>
                        {categoryNames.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="checkbox-wrap">
                      <input
                        id="modified-only"
                        type="checkbox"
                        checked={modifiedOnly}
                        onChange={(event) => setModifiedOnly(event.target.checked)}
                      />
                      <label htmlFor="modified-only">Modified only</label>
                    </div>
                  </section>

                  <section className="category-list" aria-label="Defines by category">
                    {filteredCategories.map((category) => (
                      <article className="category-card" id={`category-${category.name}`} key={category.name}>
                        <h2>{category.name}</h2>
                        <p className="muted">{category.defines.length} entries</p>
                        <div className="define-list">
                          {category.defines.map((entry) => {
                            const value = getDisplayValue(entry);
                            const currentValue = activeProject?.delta[entry.id] ?? entry.defaultValue;
                            const isModified = !equalsValue(currentValue, entry.defaultValue);
                            const error = errors[entry.id];

                            return (
                              <div className={`define-row ${isModified ? "modified" : ""}`} key={entry.id}>
                                <div className="define-header">
                                  <div>
                                    <h3>{entry.key}</h3>
                                    <p className="muted">Type: {entry.type}</p>
                                  </div>
                                  <button className="btn-ghost" onClick={() => resetDefine(entry)} disabled={!isModified}>
                                    Reset
                                  </button>
                                </div>

                                {entry.type === "boolean" ? (
                                  <div className="toggle-row">
                                    <button
                                      className="btn-secondary"
                                      role="switch"
                                      aria-checked={value === "yes"}
                                      onClick={() => updateDefine(entry, value === "yes" ? "no" : "yes")}
                                    >
                                      {value === "yes" ? "Yes" : "No"}
                                    </button>
                                  </div>
                                ) : entry.type === "variable" || entry.type === "expression" ? (
                                  <input type="text" value={value} disabled aria-readonly="true" />
                                ) : entry.type === "array" ? (
                                  <div>
                                    <label htmlFor={`input-${entry.id}`}>List values (comma-separated)</label>
                                    <textarea
                                      id={`input-${entry.id}`}
                                      rows={3}
                                      value={value}
                                      onChange={(event) => updateDefine(entry, event.target.value)}
                                    />
                                  </div>
                                ) : (
                                  <div>
                                    <label htmlFor={`input-${entry.id}`}>Value</label>
                                    <input
                                      id={`input-${entry.id}`}
                                      type={entry.type === "string" ? "text" : "number"}
                                      step={entry.type === "float" ? "any" : "1"}
                                      value={value}
                                      onChange={(event) => updateDefine(entry, event.target.value)}
                                    />
                                  </div>
                                )}

                                {entry.comment ? <p className="comment">{entry.comment}</p> : null}
                                {error ? (
                                  <p className="error" role="alert">
                                    {error}
                                  </p>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      </article>
                    ))}
                    {filteredCategories.length === 0 ? <p>No defines match the current filters.</p> : null}
                  </section>
                </div>
              }
            />

            {docsPages.map((page) => (
              <Route
                key={page.path}
                path={page.path}
                element={
                  <article className="docs-page">
                    <h2>{page.title}</h2>
                    <ReactMarkdown>{page.markdown}</ReactMarkdown>
                  </article>
                }
              />
            ))}

            <Route
              path="/about"
              element={
                <article className="docs-page">
                  <h2>About</h2>
                  <p>
                    EUV Defines Editor is an offline-first frontend app for customizing Europa Universalis V defines
                    and exporting valid mod files.
                  </p>
                </article>
              }
            />
          </Routes>
        </main>
      </div>

      <aside className="right-sidebar" aria-label="Category anchors">
        <h2>Categories</h2>
        <nav>
          {filteredCategories.map((category) => (
            <a key={category.name} href={`#category-${category.name}`}>
              {category.name}
            </a>
          ))}
        </nav>
      </aside>
    </div>
  );
}
