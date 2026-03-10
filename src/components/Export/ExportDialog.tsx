import { useEffect, useState } from "react";
import { bumpSemver } from "../../lib/storage";

interface ExportDialogProps {
  isOpen: boolean;
  isExporting: boolean;
  initialModName: string;
  initialModDescription: string;
  initialVersion: string;
  initialBumpType: "patch" | "minor" | "major";
  onCancel: () => void;
  onConfirm: (payload: {
    modName: string;
    modDescription: string;
    bumpType: "patch" | "minor" | "major";
    nextVersion: string;
  }) => void;
}

export function ExportDialog({
  isOpen,
  isExporting,
  initialModName,
  initialModDescription,
  initialVersion,
  initialBumpType,
  onCancel,
  onConfirm
}: ExportDialogProps) {
  const [modName, setModName] = useState(initialModName);
  const [modDescription, setModDescription] = useState(initialModDescription);
  const [bumpType, setBumpType] = useState<"patch" | "minor" | "major">(initialBumpType);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setModName(initialModName);
    setModDescription(initialModDescription);
    setBumpType(initialBumpType);
  }, [initialBumpType, initialModDescription, initialModName, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  const nextVersion = bumpSemver(initialVersion, bumpType);

  return (
    <div className="modal-overlay" role="presentation" onClick={onCancel}>
      <div
        className="export-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="export-dialog-title">Export Mod</h2>

        <div>
          <label htmlFor="export-mod-name">Mod Name</label>
          <input
            id="export-mod-name"
            type="text"
            value={modName}
            onChange={(event) => setModName(event.target.value)}
            disabled={isExporting}
          />
        </div>

        <div>
          <label htmlFor="export-mod-description">Mod Description</label>
          <textarea
            id="export-mod-description"
            rows={3}
            value={modDescription}
            onChange={(event) => setModDescription(event.target.value)}
            disabled={isExporting}
          />
        </div>

        <fieldset className="export-version-group" disabled={isExporting}>
          <legend>Version Bump</legend>
          <label>
            <input
              type="radio"
              name="export-bump-type"
              value="patch"
              checked={bumpType === "patch"}
              onChange={() => setBumpType("patch")}
            />
            Patch ({bumpSemver(initialVersion, "patch")})
          </label>
          <label>
            <input
              type="radio"
              name="export-bump-type"
              value="minor"
              checked={bumpType === "minor"}
              onChange={() => setBumpType("minor")}
            />
            Minor ({bumpSemver(initialVersion, "minor")})
          </label>
          <label>
            <input
              type="radio"
              name="export-bump-type"
              value="major"
              checked={bumpType === "major"}
              onChange={() => setBumpType("major")}
            />
            Major ({bumpSemver(initialVersion, "major")})
          </label>
        </fieldset>

        <p className="muted">Exporting will set project version to {nextVersion}.</p>

        <div className="button-row">
          <button className="btn-ghost" onClick={onCancel} disabled={isExporting}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={() =>
              onConfirm({
                modName: modName.trim() || initialModName,
                modDescription: modDescription.trim(),
                bumpType,
                nextVersion
              })
            }
            disabled={isExporting || modName.trim().length === 0}
          >
            {isExporting ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
}
