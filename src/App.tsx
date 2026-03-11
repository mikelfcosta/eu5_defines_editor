import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { definesByVersion } from "./lib/defines";

import { AppShell } from "./components/Layout/AppShell";
import { LeftSidebar } from "./components/Layout/LeftSidebar";
import { RightSidebar } from "./components/Layout/RightSidebar";
import { TopHeader } from "./components/Layout/TopHeader";
import { ExportDialog } from "./components/Export/ExportDialog";
import { AppErrorBoundary } from "./components/App/AppErrorBoundary";
import { BottomFooter } from "./components/App/BottomFooter";
import { DeleteProjectModal } from "./components/App/DeleteProjectModal";
import { ProjectManagerModal } from "./components/App/ProjectManagerModal";
import { VersionSelectionModal } from "./components/App/VersionSelectionModal";

import { AboutPage } from "./pages/About";
import { docsPages, DocsRoutePage } from "./pages/Docs";
import { EditorPage } from "./pages/Editor";
import { SearchBar } from "./pages/Editor/components/SearchBar";
import { useDefineManagement } from "./components/App/hooks/useDefineManagement";
import { useExportManagement } from "./components/App/hooks/useExportManagement";
import { useProjectManagement } from "./components/App/hooks/useProjectManagement";
import {
  hasDeltaChangedSinceExport,
  toCategoryId
} from "./utils";

export default function App() {
  const resetEditorTransientRef = useRef<() => void>(() => {});
  const location = useLocation();
  const defaultVersion = "1.1.9";

  const [menuOpen, setMenuOpen] = useState(false);

  const projectManager = useProjectManagement({
    defaultVersion,
    onResetEditorTransientState: () => resetEditorTransientRef.current()
  });

  const defines = definesByVersion[projectManager.selectedVersion];
  const defineManager = useDefineManagement({
    defines,
    activeProject: projectManager.activeProject,
    updateProject: projectManager.updateProject
  });

  useEffect(() => {
    resetEditorTransientRef.current = defineManager.clearTransientState;
  }, [defineManager.clearTransientState]);

  const hasErrors = defineManager.hasErrors;
  const isDocsRoute = location.pathname.startsWith("/docs");

  const exportManager = useExportManagement({
    activeProject: projectManager.activeProject,
    defines,
    hasErrors,
    updateProject: projectManager.updateProject
  });

  const categoryStats = new Map(
    defineManager.normalizedCategories.map((category) => [
      category.name,
      {
        defineCount: category.defines.length,
        modifiedCount: defineManager.getCategoryModifiedCount(category.name)
      }
    ])
  );

  const rightSidebarCategories = defineManager.filteredCategories.map((category) => {
    const stats = categoryStats.get(category.name);
    return {
      id: toCategoryId(category.name),
      name: category.name,
      defineCount: stats?.defineCount ?? 0,
      modifiedCount: stats?.modifiedCount ?? 0
    };
  });
  const showCategoriesSidebar = location.pathname === "/";
  const hasChangesSinceExport = projectManager.activeProject
    ? hasDeltaChangedSinceExport(projectManager.activeProject.delta, projectManager.activeProject.lastExportedDelta)
    : false;

  return (
    <AppErrorBoundary>
      <AppShell
        leftSidebar={
          <LeftSidebar
            menuOpen={menuOpen}
            selectedVersion={projectManager.selectedVersion}
            onOpenVersionModal={projectManager.openVersionModal}
          />
        }
        topHeader={
          <TopHeader
            projectName={projectManager.activeProject?.name ?? "No active project"}
            projectVersion={projectManager.activeProject?.modVersion ?? "0.0.0"}
            hasChangesSinceExport={hasChangesSinceExport}
            onToggleMenu={() => setMenuOpen((open) => !open)}
            onOpenProjectModal={projectManager.openProjectModal}
            filters={
              showCategoriesSidebar ? (
                <SearchBar
                  search={defineManager.search}
                  categoryFilter={defineManager.categoryFilter}
                  categoryNames={defineManager.categoryNames}
                  modifiedOnly={defineManager.modifiedOnly}
                  onSearchChange={defineManager.setSearch}
                  onCategoryFilterChange={defineManager.setCategoryFilter}
                  onModifiedOnlyChange={defineManager.setModifiedOnly}
                />
              ) : null
            }
          />
        }
        footer={
          <BottomFooter
            saveStatus={projectManager.saveStatus}
            saveDisabled={!projectManager.activeProject}
            exportDisabled={exportManager.exportDisabled}
            onSave={projectManager.saveNow}
            onExport={exportManager.openExportDialog}
          />
        }
        rightSidebar={
          showCategoriesSidebar ? (
            <RightSidebar categories={rightSidebarCategories} onSelectCategory={defineManager.openOnlyCategory} />
          ) : isDocsRoute ? (
            <RightSidebar docsPages={docsPages} />
          ) : null
        }
      >
        <Routes>
          <Route
            path="/"
            element={
              <EditorPage
                filteredCategories={defineManager.filteredCategories}
                isCategoryFiltered={defineManager.categoryFilter !== "all"}
                getCategoryModifiedCount={(category) => defineManager.getCategoryModifiedCount(category.name)}
                isCategoryCollapsed={(categoryName) => defineManager.collapsedCategories[categoryName] ?? true}
                getDisplayValue={defineManager.getDisplayValue}
                getIsModified={defineManager.getIsModified}
                getError={(entry) => defineManager.errors[entry.id]}
                onToggleCategory={defineManager.toggleCategory}
                onUpdateDefine={defineManager.updateDefine}
                onResetDefine={defineManager.resetDefine}
              />
            }
          />
          <Route path="/docs" element={<Navigate to="/docs/getting-started" replace />} />
          {docsPages.map((page) => (
            <Route key={page.path} path={page.path} element={<DocsRoutePage title={page.title} markdown={page.markdown} />} />
          ))}

          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </AppShell>

      <ExportDialog
        isOpen={exportManager.isExportDialogOpen}
        isExporting={exportManager.isExporting}
        initialModName={exportManager.exportInitialModName}
        initialModDescription={exportManager.exportInitialModDescription}
        initialVersion={projectManager.activeProject?.modVersion ?? "0.0.0"}
        initialBumpType={exportManager.bumpType}
        onCancel={exportManager.closeExportDialog}
        onConfirm={exportManager.runExport}
      />

      <ProjectManagerModal
        isOpen={projectManager.isProjectModalOpen}
        projects={projectManager.projectState.projects}
        activeProjectId={projectManager.activeProject?.id ?? null}
        editingProjectId={projectManager.editingProjectId}
        editingProjectName={projectManager.editingProjectName}
        onClose={projectManager.closeProjectModal}
        onSelectProject={projectManager.selectProject}
        onBeginRename={projectManager.beginProjectRename}
        onEditingNameChange={projectManager.setEditingProjectName}
        onCommitRename={projectManager.commitProjectRename}
        onCancelRename={projectManager.cancelProjectRename}
        onRequestDelete={projectManager.requestProjectDelete}
        onCreateProject={projectManager.createNewProjectFromTable}
        onImportFileChange={projectManager.handleFileImport}
      />

      <VersionSelectionModal
        isOpen={projectManager.isVersionModalOpen}
        pendingVersion={projectManager.pendingVersion}
        availableVersions={projectManager.availableVersions}
        onClose={projectManager.closeVersionModal}
        onPendingVersionChange={projectManager.setPendingVersion}
        onApply={projectManager.applyPendingVersionChange}
      />

      <DeleteProjectModal
        projectName={projectManager.pendingDeleteProject?.name ?? null}
        isOpen={Boolean(projectManager.pendingDeleteProject)}
        onClose={projectManager.closeDeleteProjectDialog}
        onConfirmDelete={projectManager.confirmProjectDelete}
      />
    </AppErrorBoundary>
  );
}
