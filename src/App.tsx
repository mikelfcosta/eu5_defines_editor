import { useCallback, useEffect, useMemo, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Text,
  Tr,
} from "@chakra-ui/react";
import type { DefineEntry, DefineValue, Project } from "./types/defines";
import { AboutPage } from "./components/About/AboutPage";
import { DocsPage } from "./components/Docs/DocsPage";
import { EditorView } from "./components/Editor/EditorView";
import { ExportDialog } from "./components/Export/ExportDialog";
import { AppShell } from "./components/Layout/AppShell";
import { LeftSidebar } from "./components/Layout/LeftSidebar";
import { RightSidebar } from "./components/Layout/RightSidebar";
import { TopHeader } from "./components/Layout/TopHeader";
import { SearchBar } from "./components/Editor/SearchBar";
import { availableVersions, definesByVersion } from "./lib/defines";
import { parseInputValue, stringifyDefineValue, validateArrayItems } from "./lib/validation";
import { createProject, loadProjectState, saveProjectState } from "./lib/storage";
import { exportProjectZip } from "./lib/exporter";

import docsIndex from "./content/docs/index.md?raw";
import docsGettingStarted from "./content/docs/getting-started.md?raw";
import docsInstallMod from "./content/docs/install-mod.md?raw";
import docsUsingEditor from "./content/docs/using-editor.md?raw";
import docsExporting from "./content/docs/exporting-versioning.md?raw";

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

function toCategoryId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function toKebabCase(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "euv-defines-mod";
}

function summarizeChangedCategories(delta: Record<string, DefineValue>): string {
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

function stripGeneratedChangeSummary(description: string): string {
  const lines = description
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const filtered = lines.filter(
    (line) => !/^Changed\s.+\(\d+\)(,\s*.+\(\d+\))*$/i.test(line)
  );

  return filtered.join("\n").trim();
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString();
}

function hasDeltaChangedSinceExport(
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

const PROJECT_TABLE_MAX_VISIBLE_ROWS = 10;
const PROJECT_TABLE_ROW_HEIGHT = 52;
const PROJECT_TABLE_OVERSCAN = 3;

interface BottomFooterProps {
  saveStatus: string;
  saveDisabled: boolean;
  exportDisabled: boolean;
  onSave: () => void;
  onExport: () => void;
}

function BottomFooter({
  saveStatus,
  saveDisabled,
  exportDisabled,
  onSave,
  onExport
}: BottomFooterProps) {
  return (
    <Box
      as="footer"
      bg="transparent"
      px={6}
      py={2}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap={4}
      flex="0 0 auto"
      position="relative"
      boxShadow="0 -10px 18px -14px rgba(0, 0, 0, 0.8)"
      _before={{
        content: '""',
        position: "absolute",
        left: 6,
        right: 6,
        top: 0,
        height: "1px",
        bg: "borderPrimary"
      }}
    >
      <HStack spacing={2} ml="auto">
        <Text color="textSecondary" textAlign="right">{saveStatus}</Text>
        <IconButton aria-label="Save project" variant="outline" icon={<span>💾</span>} onClick={onSave} isDisabled={saveDisabled} />
        <IconButton aria-label="Export project" variant="outline" icon={<span>⇩</span>} onClick={onExport} isDisabled={exportDisabled} />
      </HStack>
    </Box>
  );
}

export default function App() {
  const location = useLocation();
  const defaultVersion = availableVersions[0];
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
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [pendingVersion, setPendingVersion] = useState(defaultVersion);
  const [saveStatus, setSaveStatus] = useState("All changes saved");
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState("");
  const [pendingDeleteProjectId, setPendingDeleteProjectId] = useState<string | null>(null);
  const [projectTableScrollTop, setProjectTableScrollTop] = useState(0);
  const [projectTableRowHeight, setProjectTableRowHeight] = useState(PROJECT_TABLE_ROW_HEIGHT);

  const [projectState, setProjectState] = useState(() => loadProjectState(defaultVersion));

  const activeProject = useMemo(() => {
    const found = projectState.projects.find((project) => project.id === projectState.activeProjectId);
    return found ?? projectState.projects[0] ?? null;
  }, [projectState]);

  useEffect(() => {
    saveProjectState(projectState);
    setSaveStatus("All changes saved");
  }, [projectState]);

  useEffect(() => {
    if (activeProject && activeProject.version !== selectedVersion) {
      setSelectedVersion(activeProject.version);
    }
  }, [activeProject, selectedVersion]);

  useEffect(() => {
    if (!isProjectModalOpen) {
      setProjectTableScrollTop(0);
      setPendingDeleteProjectId(null);
    }
  }, [isProjectModalOpen]);

  const defines = definesByVersion[selectedVersion];
  const hasErrors = Object.keys(errors).length > 0;
  const isDocsRoute = location.pathname.startsWith("/docs");

  const normalizedCategories = useMemo(() => {
    if (!defines) {
      return [];
    }

    const byName = new Map<string, typeof defines.categories[number]>();

    for (const category of defines.categories) {
      const existing = byName.get(category.name);
      if (!existing) {
        byName.set(category.name, { ...category, defines: [...category.defines] });
        continue;
      }

      byName.set(category.name, {
        ...existing,
        defines: [...existing.defines, ...category.defines]
      });
    }

    return Array.from(byName.values());
  }, [defines]);

  useEffect(() => {
    if (!normalizedCategories.length) {
      return;
    }

    setCollapsedCategories(
      Object.fromEntries(normalizedCategories.map((category) => [category.name, true]))
    );
  }, [normalizedCategories]);

  useEffect(() => {
    if (!normalizedCategories.length) {
      return;
    }

    if (categoryFilter === "all") {
      setCollapsedCategories(
        Object.fromEntries(normalizedCategories.map((category) => [category.name, true]))
      );
      return;
    }

    setCollapsedCategories(
      Object.fromEntries(
        normalizedCategories.map((category) => [category.name, category.name !== categoryFilter])
      )
    );
  }, [categoryFilter, normalizedCategories]);

  if (!defaultVersion || !defines) {
    return <p>Unable to load defines data. Run npm run generate:defines.</p>;
  }

  const categoryNames = normalizedCategories.map((category) => category.name);

  const updateProject = (updater: (project: Project) => Project) => {
    if (!activeProject) {
      return;
    }

    setProjectState((state) => ({
      ...state,
      projects: state.projects.map((project) =>
        project.id === activeProject.id ? { ...updater(project), updatedAt: new Date().toISOString() } : project
      )
    }));
  };

  const selectProject = (projectId: string) => {
    setProjectState((state) => ({ ...state, activeProjectId: projectId }));
    setErrors({});
    setDrafts({});
  };

  const beginProjectRename = (project: Project) => {
    setEditingProjectId(project.id);
    setEditingProjectName(project.name);
  };

  const commitProjectRename = (projectId: string) => {
    const trimmed = editingProjectName.trim();
    if (!trimmed) {
      setEditingProjectId(null);
      setEditingProjectName("");
      return;
    }

    setProjectState((state) => ({
      ...state,
      projects: state.projects.map((project) =>
        project.id === projectId
          ? {
            ...project,
            name: trimmed,
            updatedAt: new Date().toISOString()
          }
          : project
      )
    }));
    setEditingProjectId(null);
    setEditingProjectName("");
  };

  const removeProject = (projectId: string) => {
    setProjectState((state) => {
      if (state.projects.length <= 1) {
        return state;
      }

      const projects = state.projects.filter((project) => project.id !== projectId);
      const nextActiveProjectId =
        state.activeProjectId === projectId
          ? projects[0]?.id ?? null
          : state.activeProjectId;

      return {
        projects,
        activeProjectId: nextActiveProjectId
      };
    });
    setErrors({});
    setDrafts({});
  };

  const requestProjectDelete = (projectId: string) => {
    setPendingDeleteProjectId(projectId);
  };

  const confirmProjectDelete = () => {
    if (!pendingDeleteProjectId) {
      return;
    }

    removeProject(pendingDeleteProjectId);
    setPendingDeleteProjectId(null);
  };

  useEffect(() => {
    if (!pendingDeleteProjectId) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }

      if (event.key.toLowerCase() === "c") {
        event.preventDefault();
        confirmProjectDelete();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pendingDeleteProjectId]);

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

  const filteredCategories = normalizedCategories
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
    const sourceCategory = normalizedCategories.find((category) => category.name === categoryName);
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

  const createNewProject = (name: string): Project | null => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return null;
    }

    const project = createProject(selectedVersion, trimmedName);
    setProjectState((state) => ({
      projects: [...state.projects, project],
      activeProjectId: project.id
    }));
    return project;
  };

  const createNewProjectFromTable = () => {
    const project = createNewProject("My new project");
    if (!project) {
      return;
    }

    setEditingProjectId(project.id);
    setEditingProjectName(project.name);
  };

  const applyVersionChange = (version: string) => {
    setSelectedVersion(version);
    if (activeProject) {
      updateProject((project) => ({ ...project, version, delta: {} }));
    }
    setErrors({});
    setDrafts({});
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
        modVersion: payload.nextVersion,
        updatedAt: new Date().toISOString(),
        lastExportedDelta: Object.fromEntries(
          Object.entries(activeProject.delta).map(([key, value]) => [
            key,
            Array.isArray(value) ? [...value] : value
          ])
        )
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
  const changedSummary = activeProject ? summarizeChangedCategories(activeProject.delta) : "Changed no categories";
  const fallbackModName = activeProject ? toKebabCase(activeProject.name) : "euv-defines-mod";
  const exportInitialModName = activeProject
    ? activeProject.modName.trim() && activeProject.modName.trim() !== "euv-defines-mod"
      ? activeProject.modName
      : fallbackModName
    : "euv-defines-mod";
  const baseExportDescription = activeProject
    ? stripGeneratedChangeSummary(activeProject.modDescription)
    : "";
  const exportInitialModDescription = [baseExportDescription, changedSummary].filter(Boolean).join("\n");
  const categoryStats = new Map(
    normalizedCategories.map((category) => [
      category.name,
      {
        defineCount: category.defines.length,
        modifiedCount: getCategoryModifiedCount(category.name)
      }
    ])
  );

  const rightSidebarCategories = filteredCategories.map((category) => {
    const stats = categoryStats.get(category.name);
    return {
      id: toCategoryId(category.name),
      name: category.name,
      defineCount: stats?.defineCount ?? 0,
      modifiedCount: stats?.modifiedCount ?? 0
    };
  });
  const showRightSidebar = location.pathname === "/";
  const hasChangesSinceExport = activeProject
    ? hasDeltaChangedSinceExport(activeProject.delta, activeProject.lastExportedDelta)
    : false;
  const pendingDeleteProject = pendingDeleteProjectId
    ? projectState.projects.find((project) => project.id === pendingDeleteProjectId) ?? null
    : null;

  const shouldVirtualizeProjects = projectState.projects.length > PROJECT_TABLE_MAX_VISIBLE_ROWS;
  const projectTableViewportHeight = PROJECT_TABLE_MAX_VISIBLE_ROWS * projectTableRowHeight;

  const measureProjectRowHeight = useCallback((node: HTMLTableRowElement | null) => {
    if (!node) {
      return;
    }

    const nextHeight = node.getBoundingClientRect().height;
    if (nextHeight > 0 && Math.abs(nextHeight - projectTableRowHeight) > 0.5) {
      setProjectTableRowHeight(nextHeight);
    }
  }, [projectTableRowHeight]);

  const projectRowsWindow = useMemo(() => {
    const total = projectState.projects.length;
    if (!shouldVirtualizeProjects || total === 0) {
      return {
        startIndex: 0,
        endIndex: total,
        offsetTop: 0,
        offsetBottom: 0
      };
    }

    const startIndex = Math.max(0, Math.floor(projectTableScrollTop / projectTableRowHeight) - PROJECT_TABLE_OVERSCAN);
    const endIndex = Math.min(
      total,
      Math.ceil((projectTableScrollTop + projectTableViewportHeight) / projectTableRowHeight) + PROJECT_TABLE_OVERSCAN
    );

    const offsetTop = startIndex * projectTableRowHeight;
    const renderedHeight = (endIndex - startIndex) * projectTableRowHeight;
    const offsetBottom = Math.max(0, total * projectTableRowHeight - offsetTop - renderedHeight);

    return {
      startIndex,
      endIndex,
      offsetTop,
      offsetBottom
    };
  }, [projectState.projects.length, projectTableRowHeight, projectTableScrollTop, projectTableViewportHeight, shouldVirtualizeProjects]);

  const visibleProjects = shouldVirtualizeProjects
    ? projectState.projects.slice(projectRowsWindow.startIndex, projectRowsWindow.endIndex)
    : projectState.projects;

  const toggleCategory = (categoryName: string) => {
    setCollapsedCategories((state) => ({
      ...state,
      [categoryName]: !state[categoryName]
    }));
  };

  const openOnlyCategory = (categoryName: string) => {
    setCollapsedCategories(
      Object.fromEntries(normalizedCategories.map((category) => [category.name, category.name !== categoryName]))
    );
  };

  return (
    <>
      <AppShell
        leftSidebar={
          <LeftSidebar
            menuOpen={menuOpen}
            selectedVersion={selectedVersion}
            docsPages={docsPages}
            isDocsRoute={isDocsRoute}
            onOpenVersionModal={() => {
              setPendingVersion(selectedVersion);
              setIsVersionModalOpen(true);
            }}
          />
        }
        topHeader={
          <TopHeader
            projectName={activeProject?.name ?? "No active project"}
            projectVersion={activeProject?.modVersion ?? "0.0.0"}
            hasChangesSinceExport={hasChangesSinceExport}
            onToggleMenu={() => setMenuOpen((open) => !open)}
            onOpenProjectModal={() => setIsProjectModalOpen(true)}
            filters={
              showRightSidebar ? (
                <SearchBar
                  search={search}
                  categoryFilter={categoryFilter}
                  categoryNames={categoryNames}
                  modifiedOnly={modifiedOnly}
                  onSearchChange={setSearch}
                  onCategoryFilterChange={setCategoryFilter}
                  onModifiedOnlyChange={setModifiedOnly}
                />
              ) : null
            }
          />
        }
        footer={
          <BottomFooter
            saveStatus={saveStatus}
            saveDisabled={!activeProject}
            exportDisabled={!activeProject || hasErrors || isExporting}
            onSave={() => {
              saveProjectState(projectState);
              setSaveStatus(`Saved at ${new Date().toLocaleTimeString()}`);
            }}
            onExport={openExportDialog}
          />
        }
        rightSidebar={
          showRightSidebar ? (
            <RightSidebar categories={rightSidebarCategories} onSelectCategory={openOnlyCategory} />
          ) : null
        }
      >
        <Routes>
          <Route
            path="/"
            element={
              <EditorView
                filteredCategories={filteredCategories}
                isCategoryFiltered={categoryFilter !== "all"}
                getCategoryModifiedCount={(category) => getCategoryModifiedCount(category.name)}
                isCategoryCollapsed={(categoryName) => collapsedCategories[categoryName] ?? true}
                getDisplayValue={getDisplayValue}
                getIsModified={getIsModified}
                getError={(entry) => errors[entry.id]}
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
        initialModName={exportInitialModName}
        initialModDescription={exportInitialModDescription}
        initialVersion={activeProject?.modVersion ?? "0.0.0"}
        initialBumpType={bumpType}
        onCancel={() => setIsExportDialogOpen(false)}
        onConfirm={runExport}
      />

      <Modal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} isCentered size="4xl">
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent bg="surface.900" border="1px solid" borderColor="borderPrimary">
          <ModalHeader color="brand.gold">Project Selection</ModalHeader>
          <ModalBody display="grid" gap={3}>
            <Box
              border="none"
              borderRadius="md"
              overflow="hidden"
              bg="transparent"
              fontFamily="sans-serif"
              maxH={shouldVirtualizeProjects ? `${projectTableViewportHeight}px` : undefined}
              overflowY={shouldVirtualizeProjects ? "auto" : "visible"}
              onScroll={(event) => {
                if (shouldVirtualizeProjects) {
                  setProjectTableScrollTop(event.currentTarget.scrollTop);
                }
              }}
            >
              <Table size="sm" variant="simple" tableLayout="fixed">
                <colgroup>
                  <col style={{ width: "40%" }} />
                  <col style={{ width: "25%" }} />
                  <col style={{ width: "15%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "10%" }} />
                </colgroup>
                <Thead bg="transparent">
                  <Tr borderBottom="1px solid" borderColor="borderSecondary">
                    <Th py={3}>Project Name</Th>
                    <Th py={3}>Last Updated</Th>
                    <Th py={3}>Latest Version</Th>
                    <Th py={3} textAlign="center">Edit</Th>
                    <Th py={3} textAlign="center">Delete</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {shouldVirtualizeProjects && projectRowsWindow.offsetTop > 0 ? (
                    <Tr>
                      <Td colSpan={5} p={0} h={`${projectRowsWindow.offsetTop}px`} borderBottom="none" />
                    </Tr>
                  ) : null}

                  {visibleProjects.map((project, index) => {
                    const isActive = project.id === activeProject?.id;
                    const isEditing = editingProjectId === project.id;

                    return (
                      <Tr
                        key={project.id}
                        ref={index === 0 ? measureProjectRowHeight : undefined}
                        bg={isActive ? "rgba(255, 210, 103, 0.2)" : undefined}
                        _hover={{ bg: isActive ? "rgba(255, 210, 103, 0.24)" : "surface.700" }}
                        cursor="pointer"
                        onClick={() => selectProject(project.id)}
                      >
                        <Td>
                          {isEditing ? (
                            <Input
                              size="sm"
                              value={editingProjectName}
                              onChange={(event) => setEditingProjectName(event.target.value)}
                              onBlur={() => commitProjectRename(project.id)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  commitProjectRename(project.id);
                                }

                                if (event.key === "Escape") {
                                  setEditingProjectId(null);
                                  setEditingProjectName("");
                                }
                              }}
                              autoFocus
                            />
                          ) : (
                            <Text>{project.name}</Text>
                          )}
                        </Td>
                        <Td>{formatDateTime(project.updatedAt)}</Td>
                        <Td>{project.modVersion}</Td>
                        <Td textAlign="center" verticalAlign="middle">
                          <Box display="flex" justifyContent="center" alignItems="center">
                            <IconButton
                              aria-label={`Edit ${project.name}`}
                              size="sm"
                              variant="outline"
                              icon={<span>✎</span>}
                              onClick={(event) => {
                                event.stopPropagation();
                                beginProjectRename(project);
                              }}
                            />
                          </Box>
                        </Td>
                        <Td textAlign="center" verticalAlign="middle">
                          <Box display="flex" justifyContent="center" alignItems="center">
                            <IconButton
                              aria-label={`Delete ${project.name}`}
                              size="sm"
                              variant="outline"
                              icon={<span>✕</span>}
                              colorScheme="red"
                              isDisabled={projectState.projects.length <= 1}
                              onClick={(event) => {
                                event.stopPropagation();
                                requestProjectDelete(project.id);
                              }}
                            />
                          </Box>
                        </Td>
                      </Tr>
                    );
                  })}

                  {shouldVirtualizeProjects && projectRowsWindow.offsetBottom > 0 ? (
                    <Tr>
                      <Td colSpan={5} p={0} h={`${projectRowsWindow.offsetBottom}px`} borderBottom="none" />
                    </Tr>
                  ) : null}

                  <Tr
                    _hover={{ bg: "surface.700" }}
                    cursor="pointer"
                    onClick={createNewProjectFromTable}
                  >
                    <Td colSpan={5} py={4} borderBottom="none" w="100%">
                      <Text color="brand.gold" fontWeight={600}>+ Create new project</Text>
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="yellow" onClick={() => setIsProjectModalOpen(false)}>Done</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isVersionModalOpen} onClose={() => setIsVersionModalOpen(false)} isCentered>
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent bg="panelBg" border="1px solid" borderColor="borderPrimary">
          <ModalHeader color="brand.gold">Select Game Version</ModalHeader>
          <ModalBody display="grid" gap={3}>
            <FormControl>
              <FormLabel htmlFor="version-modal-select">Version</FormLabel>
              <Select id="version-modal-select" value={pendingVersion} onChange={(event) => setPendingVersion(event.target.value)}>
                {availableVersions.map((version) => (
                  <option key={version} value={version}>
                    {version}
                  </option>
                ))}
              </Select>
            </FormControl>
            <Text color="textSecondary">Applying a new version resets current project define overrides.</Text>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="outline" onClick={() => setIsVersionModalOpen(false)}>Cancel</Button>
            <Button
              colorScheme="yellow"
              onClick={() => {
                applyVersionChange(pendingVersion);
                setIsVersionModalOpen(false);
              }}
            >
              Apply
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={Boolean(pendingDeleteProject)} onClose={() => setPendingDeleteProjectId(null)} isCentered>
        <ModalOverlay bg="blackAlpha.700" />
        <ModalContent bg="surface.900" border="1px solid" borderColor="borderPrimary">
          <ModalHeader color="brand.gold">Delete Project?</ModalHeader>
          <ModalBody>
            <Text color="textSecondary">
              Delete <Text as="span" color="textPrimary" fontWeight={700}>{pendingDeleteProject?.name ?? "this project"}</Text>? This action cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="outline" onClick={() => setPendingDeleteProjectId(null)}>Cancel</Button>
            <Button colorScheme="red" onClick={confirmProjectDelete} isDisabled={!pendingDeleteProject}>Delete</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
