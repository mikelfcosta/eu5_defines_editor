# Using the Editor

The editor is the main workspace where you browse, search, and modify game defines. This page covers every part of the interface.

---

## Layout Overview

The editor is divided into five areas:

| Area | Purpose |
|---|---|
| **Left sidebar** | Navigate between Editor, Docs, and About pages. The game version selector is at the bottom. |
| **Top bar** | Shows the active project name and version. Contains the search bar and filter controls. |
| **Main area** | Displays define categories and their editable values. |
| **Right sidebar** | A quick-jump list of all categories. Click a category name to scroll to it and collapse the others. |
| **Bottom bar** | Shows save status and contains the Save (💾) and Export (⇩) action buttons. |

---

## Finding Defines

With hundreds of defines across 25+ categories, the filtering tools help you zero in on what you need.

### Search

Type any part of a define's **key name** or **description** into the search bar. Results update instantly as you type.

### Category Filter

Select a specific category from the dropdown to show only that category's defines.

### Modified Only

Check this box to show only the defines you have already changed in the current project — useful for reviewing your work before exporting.

---

## Define Types

Each define has a type that determines how its input control works:

| Type | Input | Editable? |
|---|---|---|
| **Integer** | Numeric input (whole numbers) | Yes |
| **Float** | Numeric input (decimals, e.g. `0.25`) | Yes |
| **Boolean** | `yes` / `no` dropdown | Yes |
| **String** | Free-form text input | Yes |
| **Variable** | Read-only display (references another define) | No |
| **Expression** | Read-only display (a computed value) | No |

---

## Editing Values

Click any editable input field and type a new value. For numeric fields, you can also use your **mouse wheel** or the **↑/↓ arrow keys**.

### Visual Indicators

- **Gold border** — the value has been changed from the game default.
- **Percentage badge** (e.g. `+25%`) — appears inside numeric inputs to show how far the value has moved from the default.
- **Name tooltip** — hover over a define's name to see the full key, useful when long names are truncated.

---

## Resetting Values

| Action | How |
|---|---|
| **Reset a single define** | Click the **↺ button** to the right of any modified input. It reverts to the game default. |
| **Reset all changes** | Create a new project to start from a clean slate. |

---

## Managing Projects

You can maintain **multiple independent projects** — for example, one for an economy overhaul and another for a military balance mod. Each project stores its own define changes and mod version independently.

### Project Actions

| Action | How |
|---|---|
| **Open project manager** | Click the **project name** in the top bar |
| **Switch projects** | Click a row in the project table |
| **Create a project** | Click **+ Create new project** |
| **Rename a project** | Click the **✎ icon** next to a project name |
| **Delete a project** | Click the **✕ icon** next to a project name |

The active project is highlighted in **gold** in the table.
