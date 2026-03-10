# EUV Defines Editor — Project Plan

## 1. Project Overview

The EUV Defines Editor is a web-based tool that lets Europa Universalis V players customize gameplay defines without any modding knowledge. The app ships with a bundled defines file from the game, presents every value in an organized, editable interface, and exports a ready-to-use mod folder as a ZIP file.

The app is a static single-page application deployed to GitHub Pages. It works fully offline with no backend services. When new game versions release, the project owner adds a new versioned defines file to `assets/` and rebuilds.

### Purpose

EU5 defines files control hundreds of gameplay constants — combat values, AI behavior, economy tuning, diplomacy thresholds, and more. Editing them manually requires knowledge of Paradox script syntax and mod folder structure. This project removes that barrier entirely: users see a clean form, change the values they want, and download a mod.

## 2. Target Users

### Primary: Casual Players
- Want to tweak gameplay (e.g., make wars shorter, adjust economy) but don't know how to mod.
- Need a simple, approachable interface with no jargon.
- Need the exported mod to "just work" — extract and play.

### Secondary: Experienced Players
- Already know how to mod but want faster iteration.
- Benefit from search, filtering, and organized categories instead of scrolling through a raw text file.

### User Needs
- Browse defines by category (NGame, NCountry, NCombat, etc.)
- Search for specific keys by name
- See developer comments and descriptions alongside values
- Save work in progress (browser localStorage)
- Export a complete, valid mod folder as a ZIP

## 3. Core Features (MVP)

### 3.1 Defines Parsing
- Parse the bundled Paradox script defines file at build time using the Jomini library.
- Produce a structured JSON representation with:
  - **Category** (e.g., `NGame`, `NCountry`)
  - **Key** (e.g., `START_DATE`, `HOUR_TICK`)
  - **Value** (original default value)
  - **Type** (inferred: integer, float, string, boolean, array, variable)
  - **Developer comment** (inline `#` comment from the source file, if present)
- Handle all value formats found in the defines file:
  - Integers (`2`, `100000`)
  - Floats (`0.5`, `0.25`) and floats with `f` suffix (`10.0f`)
  - Strings (`"1337.4.1"`)
  - Booleans (`yes` / `no`)
  - Variables (`@world_height`) and expressions (`@[ world_height * water_level_percentage ]`)
  - Arrays/lists in curly braces (`GAME_SPEED_TICKS = { 1 0.5 0.25 ... }`)
- The parsed JSON is bundled into the app as static data.

### 3.2 Category Browser
- Display all 26+ define categories as navigable groups.
- Each category is collapsible/expandable.
- Sidebar or tab-based navigation to jump between categories.
- Show the count of defines per category and the count of modified values.

### 3.3 Value Editor
- Render an appropriate input control for each value type:
  - Number input for integers and floats
  - Text input for strings
  - Toggle for booleans (`yes`/`no`)
  - Inline list editor for arrays
  - Read-only display for variables and expressions
- Show the developer comment (from the `#` inline comment) next to each field.
- Show the technical writer's description (from a markdown-based descriptions file) when available.
- Visually distinguish modified values from defaults (e.g., highlight, badge, or color).
- Provide a "reset to default" action per value.

### 3.4 Search and Filter
- Global search bar that filters defines by key name across all categories.
- Filter by category.
- Filter to show only modified values.
- Results update as the user types (debounced).

### 3.5 Validation
- Validate inputs by type:
  - Integer fields reject non-integer input.
  - Float fields reject non-numeric input.
  - String fields accept any text.
- Show inline validation errors.
- Prevent export when validation errors exist.

### 3.6 Project / Preset Management
- Users create a "project" (preset) that stores their modifications.
- Projects are persisted in browser localStorage.
- Support multiple saved projects.
- Users can switch between projects, rename, and delete them.
- Each project tracks only the delta from the default values.

### 3.7 Mod Export
- Export generates a ZIP file containing a complete, valid EU5 mod folder structure.
- Before export, prompt the user for:
  - Mod name
  - Mod description (optional)
  - Mod version (semver: major.minor.patch, starting at `0.0.0`)
  - Any other metadata required by the EU5 mod descriptor format
- **Mod versioning:** Each project tracks its own version number starting at `0.0.0`. On every export, prompt the user to bump major, minor, or patch before generating the ZIP. The version is stored with the project in localStorage and written into the mod descriptor.
- The ZIP contains:
  - A mod descriptor file (`.mod` file) including the version number
  - The modified defines file with all values written in valid Paradox script syntax
  - Correct folder structure so the user can extract directly into the EU5 mod directory
- Only modified values are written (or the full file is written with modified values applied — whichever the mod system requires).
- Uses a client-side ZIP library (e.g., JSZip) — no server needed.

### 3.8 Documentation Pages
- A dedicated **Docs** section in the app with a main index page and sub-pages for each type of documentation.
- All content is written in markdown by the technical writer and parsed/rendered by the app.
- **Main docs page:** Links to all available documentation sub-pages with brief summaries.
- **Sub-pages** (each its own route):
  - **Getting Started** — What this tool does, how to use it for the first time.
  - **How to Install a Mod** — Where to extract the exported ZIP, how to enable it in-game.
  - **Using the Editor** — How to create projects, edit values, search/filter, and save.
  - **Exporting & Versioning** — How the export process works, mod versioning, and folder structure.
- Additional sub-pages can be added later by dropping new markdown files into the docs content folder.

### 3.9 Version Support
- The app bundles one or more defines files in `assets/`, named by game version (e.g., `1.0.9.txt`).
- A version selector lets users pick which version of the defines file to edit.
- When a new game version releases, the owner adds the new file and rebuilds.

## 4. Future Features (Post-MVP)

These are explicitly **not** in scope for the first release but are planned for later:

- **Descriptions / tooltips:** The technical writer will author detailed descriptions for each define after the app is functional. The system is ready for them (markdown descriptions file), but content is deferred.
- **Preset sharing:** Users can clone the repo and contribute community presets via pull requests.
- **Import defines file:** Allow users to upload their own defines file instead of using the bundled one.
- **Dark mode / themes:** CSS custom property–based theming.
- **Diff view:** Show a side-by-side comparison of default vs. modified values.
- **Undo/redo:** Not planned — reset-to-default per field is sufficient.

## 5. Technical Architecture

### Stack
| Layer | Technology |
|---|---|
| Language | TypeScript |
| UI Framework | React |
| Build Tool | Vite |
| Defines Parser | Jomini (npm package) |
| ZIP Generation | JSZip (or similar client-side library) |
| Markdown Rendering | A lightweight markdown parser (e.g., marked, react-markdown) |
| State Management | React state + localStorage (no external state library unless needed) |
| Deployment | GitHub Pages via GitHub Actions |

### Project Structure
```
euv_defines_editor/
├── public/                  # Static assets served as-is
├── assets/                  # Raw defines files by version
│   └── 1.0.9.txt
├── src/
│   ├── main.tsx             # App entry point
│   ├── App.tsx              # Root component, routing
│   ├── components/          # React components
│   │   ├── CategoryNav/     # Sidebar/tab navigation
│   │   ├── DefineEditor/    # Individual define field editor
│   │   ├── DefineList/      # List of defines in a category
│   │   ├── ExportDialog/    # Export modal with mod metadata form
│   │   ├── SearchBar/       # Global search
│   │   └── HowTo/           # How-to page (rendered markdown)
│   ├── data/                # Parsed defines JSON (generated at build time)
│   ├── hooks/               # Custom React hooks (localStorage, search, etc.)
│   ├── lib/                 # Parsing logic, export logic, validation
│   │   ├── parser.ts        # Defines file parser (uses Jomini)
│   │   ├── exporter.ts      # ZIP mod export
│   │   └── validation.ts    # Type-based validation
│   ├── types/               # TypeScript type definitions
│   └── styles/              # Global styles, CSS custom properties
├── docs/                    # Planning and documentation
│   ├── plan.md              # This file
│   └── howto.md             # Technical writer's how-to content (later)
├── dist/                    # Build output (gitignored)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .github/
    └── workflows/
        └── deploy.yml       # GitHub Actions deployment workflow
```

### Data Flow
1. **Build time:** A Vite plugin or build script reads `assets/[version].txt`, parses it with Jomini, and emits a structured JSON file into `src/data/`.
2. **Runtime:** The React app imports the JSON data as the "defaults" for each version.
3. **Editing:** User modifications are stored as a delta object in localStorage keyed by project name and version.
4. **Export:** The exporter merges defaults + delta, serializes back to Paradox script syntax, packages into a mod folder structure, and generates a ZIP via JSZip.

### Deployment
- GitHub Actions workflow triggers on push to `main`.
- Runs `npm ci && npm run build`.
- Deploys the `dist/` folder to GitHub Pages.
- The app is fully static — no server, no API, no external dependencies at runtime.

## 6. Milestones

### Phase 1: Foundation
**Goal:** Project scaffolding, defines parsing, and data pipeline.

1. **Initialize project** — Set up Vite + React + TypeScript. Configure `tsconfig.json`, ESLint, and basic folder structure.
   - *Acceptance:* `npm run dev` starts a blank React app. `npm run build` produces output in `dist/`.

2. **Implement defines parser** — Write a parser (using Jomini) that reads `assets/1.0.9.txt` and produces structured JSON with categories, keys, values, types, and comments.
   - *Acceptance:* Running the parser on `1.0.9.txt` outputs JSON with all 26+ categories, correct value types, and extracted `#` comments. Arrays, floats with `f` suffix, variables, and booleans are all handled.

3. **Build-time data pipeline** — Integrate the parser into the Vite build so the JSON is available as an importable module at runtime.
   - *Acceptance:* The React app can `import defines from './data/defines.json'` and access all parsed categories and values.

### Phase 2: Core UI
**Goal:** Users can browse and edit defines.

4. **Category navigation** — Build a sidebar or tab navigation listing all categories. Clicking a category shows its defines.
   - *Acceptance:* All 26+ categories are listed. Clicking one displays its defines. Active category is visually indicated.

5. **Define list and editor** — Render each define as an editable form field with the correct input type. Show developer comments.
   - *Acceptance:* Every define in every category is rendered. Integers show number inputs, strings show text inputs, booleans show toggles, arrays show list editors. Developer comments appear next to the field. Variables/expressions are read-only.

6. **Search and filter** — Add a global search bar and category filter. Add a "show modified only" toggle.
   - *Acceptance:* Typing a key name filters results across all categories. Category filter works. Modified-only filter works.

7. **Validation** — Add type-based validation to inputs. Show inline errors.
   - *Acceptance:* Entering a string in an integer field shows an error. Entering a non-numeric value in a float field shows an error. Valid inputs show no error.

### Phase 3: Persistence and Export
**Goal:** Users can save projects and export mods.

8. **Project management** — Implement project create/switch/rename/delete with localStorage persistence.
   - *Acceptance:* Users can create a named project. Modifications persist across page reloads. Users can switch between multiple projects. Deleting a project removes its data.

9. **Mod export** — Implement ZIP export with mod descriptor and modified defines file in correct folder structure.
   - *Acceptance:* Clicking "Export" prompts for mod name, then downloads a ZIP. The ZIP contains a valid `.mod` descriptor and the defines file. Extracting the ZIP into the EU5 mod folder makes the mod appear in-game.

10. **Reset to default** — Per-field and per-project reset functionality.
    - *Acceptance:* Clicking "reset" on a modified field restores the default. A "reset all" option clears all modifications in the current project.

### Phase 4: Content and Polish
**Goal:** How-to page, version support, and deployment.

11. **How-to page** — Parse and render the technical writer's markdown content as a separate page.
    - *Acceptance:* A "How To" page is accessible from the app navigation. It renders markdown content with proper formatting.

12. **Version selector** — Add a version dropdown. When switched, the editor loads the corresponding defines data.
    - *Acceptance:* Adding a new `[version].txt` to `assets/` and rebuilding makes it available in the dropdown. Switching versions reloads the defines. Projects are scoped to a version.

13. **Deployment** — Set up GitHub Actions workflow to build and deploy to GitHub Pages on push to `main`.
    - *Acceptance:* Pushing to `main` triggers the workflow. The app is live and accessible at the GitHub Pages URL. The app works fully offline once loaded.

14. **Visual polish** — Consistent styling, responsive layout, accessible markup, loading states.
    - *Acceptance:* The app is usable on desktop and tablet viewports. All interactive elements are keyboard-accessible. Semantic HTML and ARIA attributes are used where appropriate.

## 7. Out of Scope

The following are explicitly excluded from this project:

- **Backend / server:** The app is 100% client-side. No APIs, databases, or server logic.
- **User accounts / authentication:** No login system. All data is local to the browser.
- **Multiplayer mod sync:** No sharing mods between users via the app.
- **Game file extraction:** The app does not read from the user's game installation. Defines files are bundled by the project owner.
- **Localization / i18n:** English only.
- **Mobile-first design:** The app should be usable on tablets but is designed primarily for desktop.
- **Automated testing of exported mods:** The app generates the mod structure but does not verify it loads in-game.
- **Support for other Paradox games:** EU5 only.
