import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { availableVersions, definesByVersion } from "../../../lib/defines";
import { createProject, loadProjectState, saveProjectState } from "../../../lib/storage";
import type { Project } from "../../../types/defines";
import { parseImportedProjectPayload } from "../../../utils";

interface UseProjectManagementParams {
  defaultVersion: string;
  onResetEditorTransientState: () => void;
}

export function useProjectManagement({
  defaultVersion,
  onResetEditorTransientState
}: UseProjectManagementParams) {
  const [selectedVersion, setSelectedVersion] = useState(defaultVersion);
  const [projectState, setProjectState] = useState(() => loadProjectState(defaultVersion));
  const [saveStatus, setSaveStatus] = useState("All changes saved");

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [pendingVersion, setPendingVersion] = useState(defaultVersion);

  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState("");
  const [pendingDeleteProjectId, setPendingDeleteProjectId] = useState<string | null>(null);

  const activeProject = useMemo(() => {
    const found = projectState.projects.find((project) => project.id === projectState.activeProjectId);
    return found ?? projectState.projects[0] ?? null;
  }, [projectState]);

  useEffect(() => {
    saveProjectState(projectState);
    setSaveStatus("All changes saved");
  }, [projectState]);

  useEffect(() => {
    if (!activeProject) {
      if (!definesByVersion[selectedVersion]) {
        setSelectedVersion(defaultVersion);
      }
      return;
    }

    if (!definesByVersion[activeProject.version]) {
      const fallbackVersion = defaultVersion;
      setProjectState((state) => ({
        ...state,
        projects: state.projects.map((project) =>
          project.id === activeProject.id
            ? { ...project, version: fallbackVersion, updatedAt: new Date().toISOString() }
            : project
        )
      }));
      if (selectedVersion !== fallbackVersion) {
        setSelectedVersion(fallbackVersion);
      }
      return;
    }

    if (activeProject.version !== selectedVersion) {
      setSelectedVersion(activeProject.version);
    }
  }, [activeProject, defaultVersion, selectedVersion]);

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
    onResetEditorTransientState();
  };

  const beginProjectRename = (project: Project) => {
    setEditingProjectId(project.id);
    setEditingProjectName(project.name);
  };

  const cancelProjectRename = () => {
    setEditingProjectId(null);
    setEditingProjectName("");
  };

  const commitProjectRename = (projectId: string) => {
    const trimmed = editingProjectName.trim();
    if (!trimmed) {
      cancelProjectRename();
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
    cancelProjectRename();
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
    onResetEditorTransientState();
  };

  const requestProjectDelete = (projectId: string) => {
    setPendingDeleteProjectId(projectId);
  };

  const closeDeleteProjectDialog = () => {
    setPendingDeleteProjectId(null);
  };

  const confirmProjectDelete = () => {
    if (!pendingDeleteProjectId) {
      return;
    }

    removeProject(pendingDeleteProjectId);
    closeDeleteProjectDialog();
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

  const handleFileImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = "";

    if (!file) {
      return;
    }

    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw) as unknown;
      const payload = parseImportedProjectPayload(parsed);

      if (!payload) {
        window.alert("Invalid editor.json file. Missing editorProject metadata.");
        return;
      }

      const importedName = typeof payload.editorProject.name === "string" && payload.editorProject.name.trim().length > 0
        ? payload.editorProject.name.trim()
        : file.name.replace(/\.json$/i, "").trim() || "Imported project";

      const importedVersion = typeof payload.editorProject.gameVersion === "string" && payload.editorProject.gameVersion.trim().length > 0
        ? payload.editorProject.gameVersion.trim()
        : defaultVersion;
      const resolvedVersion = definesByVersion[importedVersion] ? importedVersion : defaultVersion;

      const project = createProject(resolvedVersion, importedName);
      const importedModName = typeof payload.editorProject.modName === "string" && payload.editorProject.modName.trim().length > 0
        ? payload.editorProject.modName.trim()
        : project.modName;
      const importedModVersion = typeof payload.editorProject.version === "string" && payload.editorProject.version.trim().length > 0
        ? payload.editorProject.version.trim()
        : project.modVersion;

      const importedProject: Project = {
        ...project,
        name: importedName,
        version: resolvedVersion,
        modName: importedModName,
        modVersion: importedModVersion,
        delta: payload.modifiedValues,
        lastExportedDelta: {}
      };

      setProjectState((state) => ({
        projects: [...state.projects, importedProject],
        activeProjectId: importedProject.id
      }));
      onResetEditorTransientState();
      cancelProjectRename();
    } catch (error) {
      console.error("Failed to import project:", error);
      window.alert("Could not import editor.json. Please verify the file and try again.");
    }
  };

  const applyVersionChange = (version: string) => {
    setSelectedVersion(version);
    if (activeProject) {
      updateProject((project) => ({ ...project, version, delta: {} }));
    }
    onResetEditorTransientState();
  };

  const openVersionModal = () => {
    setPendingVersion(selectedVersion);
    setIsVersionModalOpen(true);
  };

  const openProjectModal = () => {
    setIsProjectModalOpen(true);
  };

  const closeProjectModal = () => {
    setIsProjectModalOpen(false);
    closeDeleteProjectDialog();
  };

  const closeVersionModal = () => {
    setIsVersionModalOpen(false);
  };

  const applyPendingVersionChange = () => {
    applyVersionChange(pendingVersion);
    closeVersionModal();
  };

  const saveNow = () => {
    saveProjectState(projectState);
    setSaveStatus(`Saved at ${new Date().toLocaleTimeString()}`);
  };

  const pendingDeleteProject = pendingDeleteProjectId
    ? projectState.projects.find((project) => project.id === pendingDeleteProjectId) ?? null
    : null;

  return {
    availableVersions,
    selectedVersion,
    setSelectedVersion,
    projectState,
    activeProject,
    saveStatus,
    updateProject,
    saveNow,

    isProjectModalOpen,
    openProjectModal,
    closeProjectModal,

    isVersionModalOpen,
    openVersionModal,
    closeVersionModal,
    pendingVersion,
    setPendingVersion,
    applyPendingVersionChange,

    editingProjectId,
    editingProjectName,
    setEditingProjectName,
    beginProjectRename,
    commitProjectRename,
    cancelProjectRename,

    requestProjectDelete,
    confirmProjectDelete,
    closeDeleteProjectDialog,
    pendingDeleteProject,

    selectProject,
    createNewProjectFromTable,
    handleFileImport,
    applyVersionChange
  };
}
