import { useEffect, useMemo, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import type { DefineEntry, DefineValue, Project } from "./types/defines";
import { AboutPage } from "./components/About/AboutPage";
import { DocsPage } from "./components/Docs/DocsPage";
import { EditorView } from "./components/Editor/EditorView";
import { ExportDialog } from "./components/Export/ExportDialog";
import { AppShell } from "./components/Layout/AppShell";
import { LeftSidebar } from "./components/Layout/LeftSidebar";
import { RightSidebar } from "./components/Layout/RightSidebar";
import { TopHeader } from "./components/Layout/TopHeader";
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
  const location = useLocation();
  const defaultVersion = availableVersions[0];
  const [theme, setTheme] = useState<Theme>("dark");
  const [selectedVersion, setSelectedVersion] = useState(defaultVersion);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modifiedOnly, setModifiedOnly] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [bumpType, setBumpType] = useState<"patch" | "minor" | "major">("patch");
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
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
  const isDocsRoute = location.pathname.startsWith("/docs");

  useEffect(() => {
    if (!defines) {
      return;
    }

    setCollapsedCategories(
      Object.fromEntries(defines.categories.map((category) => [category.name, true]))
    );
  }, [defines]);

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

  const getIsModified = (entry: DefineEntry): boolean => {
    const currentValue = activeProject?.delta[entry.id] ?? entry.defaultValue;
    return !equalsValue(currentValue, entry.defaultValue);
  };

  const getCategoryModifiedCount = (categoryName: string): number => {
    const sourceCategory = defines.categories.find((category) => category.name === categoryName);
    if (!sourceCategory) {
      return 0;
    }

    return sourceCategory.defines.filter((entry) => getIsModified(entry)).length;
  };

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

  const openExportDialog = () => {
    if (!activeProject || hasErrors) {
      return;
    }

    setIsExportDialogOpen(true);
  };

  const runExport = async (payload: {
    modName: string;
    modDescription: string;
    bumpType: "patch" | "minor" | "major";
    nextVersion: string;
  }) => {
    if (!activeProject || hasErrors) {
      return;
    }

    setIsExporting(true);
    try {
      setBumpType(payload.bumpType);

      const nextProject: Project = {
        ...activeProject,
        modName: payload.modName,
        modDescription: payload.modDescription,
        modVersion: payload.nextVersion
      };

      setProjectState((state) => ({
        ...state,
        projects: state.projects.map((project) =>
          project.id === activeProject.id ? nextProject : project
        )
      }));

      const blob = await exportProjectZip(nextProject, defines);
      downloadBlob(blob, `${nextProject.modName.replace(/\s+/g, "_")}_${nextProject.modVersion}.zip`);
      setIsExportDialogOpen(false);
    } finally {
      setIsExporting(false);
    }
  };

  const modifiedCount = activeProject ? Object.keys(activeProject.delta).length : 0;
  const nextVersion = activeProject ? bumpSemver(activeProject.modVersion, bumpType) : "-";

  const rightSidebarCategories = filteredCategories.map((category) => ({
    name: category.name,
    defineCount: category.defines.length,
    modifiedCount: getCategoryModifiedCount(category.name)
  }));
  const showRightSidebar = location.pathname === "/";

  const toggleCategory = (categoryName: string) => {
    setCollapsedCategories((state) => ({
      ...state,
      [categoryName]: !state[categoryName]
    }));
  };

  return (
    <>
      <AppShell
        leftSidebar={
          <LeftSidebar
            menuOpen={menuOpen}
            selectedVersion={selectedVersion}
            projects={projectState.projects}
            activeProjectId={activeProject?.id ?? null}
            modifiedCount={modifiedCount}
            availableVersions={availableVersions}
            theme={theme}
            docsPages={docsPages}
            isDocsRoute={isDocsRoute}
            onProjectChange={(projectId) => {
              const selected = projectState.projects.find((project) => project.id === projectId);
              setProjectState((state) => ({ ...state, activeProjectId: selected?.id ?? null }));
              setErrors({});
              setDrafts({});
            }}
            onCreateProject={createNewProject}
            onRenameProject={renameProject}
            onDeleteProject={deleteProject}
            onResetProject={resetProject}
            onVersionChange={(version) => {
              setSelectedVersion(version);
              if (activeProject) {
                updateProject((project) => ({ ...project, version, delta: {} }));
              }
            }}
            onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
          />
        }
        topHeader={
          <TopHeader
            modifiedCount={modifiedCount}
            bumpType={bumpType}
            nextVersion={nextVersion}
            onToggleMenu={() => setMenuOpen((open) => !open)}
            onBumpTypeChange={setBumpType}
            onExport={openExportDialog}
            exportDisabled={!activeProject || hasErrors || isExporting}
            isExporting={isExporting}
          />
        }
        rightSidebar={showRightSidebar ? <RightSidebar categories={rightSidebarCategories} /> : null}
      >
        <Routes>
          <Route
            path="/"
            element={
              <EditorView
                search={search}
                categoryFilter={categoryFilter}
                categoryNames={categoryNames}
                modifiedOnly={modifiedOnly}
                filteredCategories={filteredCategories}
                getCategoryModifiedCount={(category) => getCategoryModifiedCount(category.name)}
                isCategoryCollapsed={(categoryName) => collapsedCategories[categoryName] ?? true}
                getDisplayValue={getDisplayValue}
                getIsModified={getIsModified}
                getError={(entry) => errors[entry.id]}
                onSearchChange={setSearch}
                onCategoryFilterChange={setCategoryFilter}
                onModifiedOnlyChange={setModifiedOnly}
                onToggleCategory={toggleCategory}
                onUpdateDefine={updateDefine}
                onResetDefine={resetDefine}
              />
            }
          />

          {docsPages.map((page) => (
            <Route key={page.path} path={page.path} element={<DocsPage title={page.title} markdown={page.markdown} />} />
          ))}

          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </AppShell>

      <ExportDialog
        isOpen={isExportDialogOpen}
        isExporting={isExporting}
        initialModName={activeProject?.modName ?? "euv-defines-mod"}
        initialModDescription={activeProject?.modDescription ?? ""}
        initialVersion={activeProject?.modVersion ?? "0.0.0"}
        initialBumpType={bumpType}
        onCancel={() => setIsExportDialogOpen(false)}
        onConfirm={runExport}
      />
    </>
  );
}
