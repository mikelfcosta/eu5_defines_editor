import type { DefineEntry } from "../../types/defines";

interface DefineRowProps {
  entry: DefineEntry;
  value: string;
  isModified: boolean;
  error?: string;
  onUpdate: (entry: DefineEntry, raw: string) => void;
  onReset: (entry: DefineEntry) => void;
}

export function DefineRow({ entry, value, isModified, error, onUpdate, onReset }: DefineRowProps) {
  return (
    <div className={`define-row ${isModified ? "modified" : ""}`}>
      <div className="define-header">
        <div>
          <h3>{entry.key}</h3>
          <p className="muted">Type: {entry.type}</p>
        </div>
        <button className="btn-ghost" onClick={() => onReset(entry)} disabled={!isModified}>
          Reset
        </button>
      </div>

      {entry.type === "boolean" ? (
        <div className="toggle-row">
          <button
            className="btn-secondary"
            role="switch"
            aria-checked={value === "yes"}
            onClick={() => onUpdate(entry, value === "yes" ? "no" : "yes")}
          >
            {value === "yes" ? "Yes" : "No"}
          </button>
        </div>
      ) : entry.type === "variable" || entry.type === "expression" ? (
        <input type="text" value={value} disabled aria-readonly="true" />
      ) : entry.type === "array" ? (
        <div>
          <label htmlFor={`input-${entry.id}`}>List values (comma-separated)</label>
          <textarea id={`input-${entry.id}`} rows={3} value={value} onChange={(event) => onUpdate(entry, event.target.value)} />
        </div>
      ) : (
        <div>
          <label htmlFor={`input-${entry.id}`}>Value</label>
          <input
            id={`input-${entry.id}`}
            type={entry.type === "string" ? "text" : "number"}
            step={entry.type === "float" ? "any" : "1"}
            value={value}
            onChange={(event) => onUpdate(entry, event.target.value)}
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
}
