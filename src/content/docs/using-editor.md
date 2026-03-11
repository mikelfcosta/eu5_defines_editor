# Using the Editor

The editor is the main workspace of EUV Defines Editor. This page explains every part of the interface.

## Layout overview

- **Left sidebar** — primary navigation between the Editor, Docs, and About pages, plus the game version selector.
- **Top bar** — displays the active project name and version, and contains the search and filter controls.
- **Main area** — the list of define categories and their editable values.
- **Right sidebar** — a quick-jump list of all categories. Click any category name to scroll directly to it and collapse all others.
- **Bottom bar** — save status indicator and the Save (💾) and Export (⇩) action buttons.

## Finding defines

With hundreds of defines across many categories, filtering is the fastest way to find what you need.

- **Search bar** — type any part of a define's key name or its description. Results update instantly as you type.
- **Category filter** — select a specific category from the dropdown to show only that category's defines.
- **Modified only** — check this box to show only the defines you have already changed in the current project. Useful for reviewing your changes before exporting.

## Define types

Each define has a type that controls how its input works:

| Type | Description |
|---|---|
| `integer` | A whole number. Use the numeric input field. |
| `float` | A decimal number (e.g. `0.25`). Use the numeric input field. |
| `boolean` | A `yes` / `no` toggle. Use the dropdown. |
| `string` | Free-form text. Use the text input field. |
| `variable` | A reference to another define — read-only, cannot be changed. |
| `expression` | A computed value — read-only, cannot be changed. |

## Editing values

Click into any editable input field and type a new value. For numeric fields, you can also use your mouse wheel or the up/down arrow keys.

- A **gold border** on the input indicates the value has been changed from the game default.
- For numeric changes, a small **percentage delta badge** (e.g. `+25%`) appears inside the input to show how far the value has moved from the default.
- Hovering over a define's name shows the full key in a tooltip, which is useful for long names that are truncated in the list.

## Resetting values

- **Reset a single define** — click the circular ↺ button that appears to the right of any modified input. This reverts that field to the game default.
- **Reset all changes** — if you want to start over, create a new project.

## Managing projects

You can maintain multiple independent sets of changes as separate projects— for example, one for an economy overhaul and another for a military balance mod.

- Click the **project name** in the top bar to open the Project Selection dialog.
- Use the table to switch between projects, rename them (✎), or delete them (✕).
- Click **+ Create new project** to start a fresh one.
- The active project is highlighted in gold in the table.

Each project stores its own define changes and mod version independently.
