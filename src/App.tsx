import { useEffect, useMemo, useState } from "react";
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
  Text,
  useColorMode
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
  const { colorMode, toggleColorMode } = useColorMode();

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
      <Text color="textSecondary">{saveStatus}</Text>
      <HStack spacing={2} ml="auto">
        <IconButton aria-label="Save project" variant="outline" icon={<span>💾</span>} onClick={onSave} isDisabled={saveDisabled} />
        <IconButton aria-label="Export project" variant="outline" icon={<span>⇩</span>} onClick={onExport} isDisabled={exportDisabled} />
        <IconButton
          aria-label={colorMode === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          variant="outline"
          icon={<span>{colorMode === "dark" ? "☀" : "☾"}</span>}
          onClick={toggleColorMode}
        />
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
  const [newProjectName, setNewProjectName] = useState("");
  const [saveStatus, setSaveStatus] = useState("All changes saved");

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

  const createNewProject = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    const project = createProject(selectedVersion, trimmedName);
    setProjectState((state) => ({
      projects: [...state.projects, project],
      activeProjectId: project.id
    }));
    setNewProjectName("");
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
        initialModName={activeProject?.modName ?? "euv-defines-mod"}
        initialModDescription={activeProject?.modDescription ?? ""}
        initialVersion={activeProject?.modVersion ?? "0.0.0"}
        initialBumpType={bumpType}
        onCancel={() => setIsExportDialogOpen(false)}
        onConfirm={runExport}
      />

      <Modal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} isCentered>
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent bg="panelBg" border="1px solid" borderColor="borderPrimary">
          <ModalHeader color="brand.gold">Project Selection</ModalHeader>
          <ModalBody display="grid" gap={3}>
            <FormControl>
              <FormLabel htmlFor="project-modal-select">Current project</FormLabel>
              <Select
                id="project-modal-select"
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
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="new-project-name">Create new project</FormLabel>
              <HStack>
                <Input
                  id="new-project-name"
                  type="text"
                  value={newProjectName}
                  placeholder="New Project"
                  onChange={(event) => setNewProjectName(event.target.value)}
                />
                <Button onClick={() => createNewProject(newProjectName)} colorScheme="yellow">Create</Button>
              </HStack>
            </FormControl>
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
    </>
  );
}
