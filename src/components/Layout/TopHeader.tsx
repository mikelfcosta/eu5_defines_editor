interface TopHeaderProps {
  modifiedCount: number;
  bumpType: "patch" | "minor" | "major";
  nextVersion: string;
  onToggleMenu: () => void;
  onBumpTypeChange: (value: "patch" | "minor" | "major") => void;
  onExport: () => void;
  exportDisabled: boolean;
  isExporting: boolean;
}

export function TopHeader({
  modifiedCount,
  bumpType,
  nextVersion,
  onToggleMenu,
  onBumpTypeChange,
  onExport,
  exportDisabled,
  isExporting
}: TopHeaderProps) {
  return (
    <header className="top-header">
      <button className="btn-ghost mobile-only" onClick={onToggleMenu}>
        Menu
      </button>
      <div className="top-header-meta">
        <p className="muted">Modified: {modifiedCount}</p>
        <p className="muted">Next version: {nextVersion}</p>
      </div>
      <div className="button-row">
        <label htmlFor="bump-type" className="visually-hidden">
          Version bump
        </label>
        <select
          id="bump-type"
          value={bumpType}
          onChange={(event) => onBumpTypeChange(event.target.value as "patch" | "minor" | "major")}
        >
          <option value="patch">Patch</option>
          <option value="minor">Minor</option>
          <option value="major">Major</option>
        </select>
        <button className="btn-primary" onClick={onExport} disabled={exportDisabled}>
          {isExporting ? "Exporting..." : "Export Mod ZIP"}
        </button>
      </div>
    </header>
  );
}
