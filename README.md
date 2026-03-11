# EUV Defines Editor

A browser-based visual editor for creating game modifier mods for **Europa Universalis V** without touching files by hand.

## Overview

The EUV Defines Editor lets you browse, search, and customize game defines—the numerical constants that control everything from province development speed to military balance. Create multiple independent mod projects, manage versions with semantic versioning, and export ready-to-use mod packages all through an intuitive web interface.

## Features

- **Visual Define Editor** — Edit game constants using type-specific controls (integers, floats, booleans, strings).
- **Multi-Project Support** — Maintain separate mod ideas as distinct projects. Rename, delete, or switch between them at any time.
- **Smart Search & Filtering** — Find defines by name or description instantly. Filter by category or show only your modifications.
- **Local-First Storage** — All projects are stored in your browser's local storage. Nothing is sent to a server.
- **Semantic Versioning** — Each project tracks its own mod version. Choose patch/minor/major bumps at export time.
- **One-Click Export** — Download a ready-to-use mod ZIP with a proper descriptor and defines file.
- **Built-in Documentation** — Comprehensive guides for getting started, using the editor, and installing mods in-game.

## Quick Start

1. **Open the app** — Navigate to [https://mikelfcosta.github.io/eu5_defines_editor/](https://mikelfcosta.github.io/eu5_defines_editor/) in your browser.
2. **Create a project** — Click your project name in the top bar, then **+ Create new project**.
3. **Find & edit defines** — Use the search bar or category list on the right to navigate, then click any input to modify a value.
4. **Export your mod** — Click the **⇩ export** button to download a ZIP file ready for installation in EU5.

For detailed walkthrough, see **Getting Started** in the app's built-in Docs.

## Installation & Development

### Prerequisites

- Node.js 20+
- npm 10+

### Install Dependencies

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

This will start a development server on `http://localhost:5173/` with hot module reloading. The build script automatically generates define data from source files.

### Build for Production

```bash
npm run build
```

Output is generated in the `dist/` folder, ready for deployment to GitHub Pages or any static host.

### Generate Defines Data

Define data is generated from configuration files using:

```bash
npm run generate:defines
```

This runs `scripts/generate-defines.mjs`, which reads EU5 engine definitions and creates the define list used by the editor.

## Project Structure

```
.
├── .github/
│   └── workflows/              # GitHub Actions CI/CD
│       └── deploy.yml          # Automatic deploy to Pages on push
├── scripts/
│   └── generate-defines.mjs    # Generates define list from EU5 data
├── src/
│   ├── components/
│   │   ├── About/              # About page
│   │   ├── Docs/               # Documentation page renderer
│   │   ├── Editor/             # Main editor UI (categories, define rows, search)
│   │   ├── Export/             # Export dialog and ZIP generation
│   │   └── Layout/             # App shell, header, sidebars
│   ├── content/
│   │   └── docs/               # Markdown documentation files
│   ├── lib/
│   │   ├── defines.ts          # Define data index
│   │   ├── exporter.ts         # ZIP export logic
│   │   ├── storage.ts          # Local storage management
│   │   └── validation.ts       # Input validation
│   ├── types/
│   │   └── defines.ts          # TypeScript types
│   ├── App.tsx                 # Main app component and routing
│   ├── theme.ts                # Chakra UI theme customization
│   └── main.tsx                # Entry point
├── docs/                       # Planning and design docs
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Tech Stack

- **React 19** — UI framework
- **Chakra UI** — Component library
- **React Router** — Page navigation
- **TypeScript** — Type safety
- **Vite** — Build tool & dev server
- **React Markdown** — Markdown rendering for docs
- **JSZip** — ZIP file generation for exports

## How It Works

1. **Define Data** — A scraped/compiled list of EU5 defines (key, type, default value, description) is embedded in the app at build time.
2. **Project Management** — Each project is a collection of define overrides, stored in browser local storage using a unique project ID.
3. **Export Pipeline** — On export, the app generates:
   - A `descriptor.mod` file with mod metadata
   - A defines file (e.g., `my-mod.txt`) containing only the values you changed
   - Packages both into a single `.zip` file
4. **Game Integration** — EU5 reads the ZIP, extracts it into the mod directory, and merges your defines on top of engine defaults at startup.

## Contributing

Contributions are welcome! To get started:

1. Clone the repository.
2. Create a feature branch (`git checkout -b feature/my-feature`).
3. Make your changes and test locally with `npm run dev`.
4. Commit with clear messages.
5. Push to origin and open a pull request.

### Code Style

- Use modern JavaScript/TypeScript conventions.
- Prefer `const` over `let`; avoid `var`.
- Use meaningful, descriptive names.
- Keep functions small and focused.
- Write accessible markup with ARIA attributes.

### Testing

No tests are configured yet. When adding features, think about edge cases and manually test in the browser. If you add fixtures, consider adding unit tests later.

## Deployment

The app is automatically deployed to GitHub Pages via a GitHub Actions workflow on every push to the `main` branch. The workflow:

1. Checks out the code
2. Installs dependencies
3. Generates defines data
4. Builds the Vite project
5. Uploads built artifacts to Pages

## License

ISC

## FAQ

**Q: Will my local changes be safe if I close the browser?**  
A: Yes. All projects are saved to browser local storage and persist across sessions. However, if you clear your browser data, you'll lose everything—so export regularly.

**Q: Can I use this mod with other mods?**  
A: Yes. Defines alone don't conflict with most other mod types (events, decisions, map changes). If two mods change the same define, the one loaded later in the launcher's load order wins.

**Q: What if I want to report a bug or request a feature?**  
A: Open an issue on the GitHub repository. Include details about your browser, the specific define you were editing, and steps to reproduce if applicable.

**Q: Is the app safe to use? Do you collect my data?**  
A: The app runs entirely in your browser—no data is sent to any server. Your projects are stored locally. No tracking, no analytics, no third-party services.
