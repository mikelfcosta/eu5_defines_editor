import { useState } from "react";
import { exportProjectZip } from "../../../lib/exporter";
import type { DefinesData, Project } from "../../../types/defines";
import { downloadBlob, stripGeneratedChangeSummary, summarizeChangedCategories, toKebabCase } from "../../../utils";

interface UseExportManagementParams {
  activeProject: Project | null;
  defines?: DefinesData;
  hasErrors: boolean;
  updateProject: (updater: (project: Project) => Project) => void;
}

interface ExportPayload {
  modName: string;
  modDescription: string;
  bumpType: "patch" | "minor" | "major";
  nextVersion: string;
}

export function useExportManagement({
  activeProject,
  defines,
  hasErrors,
  updateProject
}: UseExportManagementParams) {
  const [bumpType, setBumpType] = useState<"patch" | "minor" | "major">("patch");
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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

  const exportDisabled = !activeProject || hasErrors || isExporting;

  const openExportDialog = () => {
    if (!activeProject || hasErrors) {
      return;
    }

    setIsExportDialogOpen(true);
  };

  const closeExportDialog = () => {
    setIsExportDialogOpen(false);
  };

  const runExport = async (payload: ExportPayload) => {
    if (!activeProject || hasErrors || !defines) {
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

      updateProject(() => nextProject);

      const blob = await exportProjectZip(nextProject, defines);
      downloadBlob(blob, `${nextProject.modName.replace(/\s+/g, "_")}_${nextProject.modVersion}.zip`);
      closeExportDialog();
    } finally {
      setIsExporting(false);
    }
  };

  return {
    bumpType,
    isExportDialogOpen,
    isExporting,
    exportDisabled,
    exportInitialModName,
    exportInitialModDescription,
    openExportDialog,
    closeExportDialog,
    runExport
  };
}
