import { NavLink } from "react-router-dom";
import type { Project } from "../../types/defines";

interface DocsNavPage {
  path: string;
  title: string;
}

interface LeftSidebarProps {
  menuOpen: boolean;
  selectedVersion: string;
  projects: Project[];
  activeProjectId: string | null;
  modifiedCount: number;
  availableVersions: string[];
  theme: "dark" | "light";
  docsPages: DocsNavPage[];
  isDocsRoute: boolean;
  onProjectChange: (projectId: string) => void;
  onCreateProject: () => void;
  onRenameProject: () => void;
  onDeleteProject: () => void;
  onResetProject: () => void;
  onVersionChange: (version: string) => void;
  onToggleTheme: () => void;
}

export function LeftSidebar({
  menuOpen,
  selectedVersion,
  projects,
  activeProjectId,
  modifiedCount,
  availableVersions,
  theme,
  docsPages,
  isDocsRoute,
  onProjectChange,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
  onResetProject,
  onVersionChange,
  onToggleTheme
}: LeftSidebarProps) {
  return (
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

      {isDocsRoute ? (
        <section className="sidebar-card docs-subnav-card">
          <h2>Docs Pages</h2>
          <nav aria-label="Documentation pages" className="docs-subnav">
            {docsPages.map((page) => (
              <NavLink key={page.path} to={page.path} end={page.path === "/docs"}>
                {page.title}
              </NavLink>
            ))}
          </nav>
        </section>
      ) : null}

      <section className="sidebar-card">
        <h2>Projects</h2>
        <label htmlFor="project-select">Current project</label>
        <select id="project-select" value={activeProjectId ?? ""} onChange={(event) => onProjectChange(event.target.value)}>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>

        <div className="button-row">
          <button className="btn-secondary" onClick={onCreateProject}>
            New
          </button>
          <button className="btn-ghost" onClick={onRenameProject} disabled={!activeProjectId}>
            Rename
          </button>
          <button className="btn-ghost" onClick={onDeleteProject} disabled={!activeProjectId || projects.length <= 1}>
            Delete
          </button>
        </div>

        <button className="btn-ghost" onClick={onResetProject} disabled={!activeProjectId || modifiedCount === 0}>
          Reset Project
        </button>
      </section>

      <section className="sidebar-card">
        <label htmlFor="version-select">Game Version</label>
        <select id="version-select" value={selectedVersion} onChange={(event) => onVersionChange(event.target.value)}>
          {availableVersions.map((version) => (
            <option key={version} value={version}>
              {version}
            </option>
          ))}
        </select>

        <button className="btn-primary" onClick={onToggleTheme}>
          Toggle {theme === "dark" ? "Light" : "Dark"} Theme
        </button>
      </section>
    </aside>
  );
}
