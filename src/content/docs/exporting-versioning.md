# Exporting and Versioning

When you're ready to use your changes in game, export your project as a mod `.zip` file. This page explains the export process, what the package contains, and how version numbers work.

---

## The Export Dialog

Click the **⇩ export button** in the bottom bar to open the export dialog. You can review and customize three fields before downloading:

| Field | Description | Default |
|---|---|---|
| **Mod name** | Display name shown in the game's Mods menu | Kebab-case version of your project name |
| **Mod description** | Short summary shown in the Mods menu | Your project name |
| **Version bump** | How to increment the version number (see below) | Patch |

Once everything looks right, click **Export** to download the `.zip`.

---

## What's Inside the ZIP

The exported package contains everything EU5 needs to load your mod:

| File | Purpose |
|---|---|
| `loading_screen/common/defines/00_defines.txt` | Your modified values in Paradox script format. The game merges these on top of its own defaults at startup. |
| `.metadata/metadata.json` | Mod metadata — name, version, supported game version, and tags. |
| `editor.json` | A snapshot of your full project data. Import it back into the editor to continue editing, or share it with others. |

---

## Semantic Versioning

Each project tracks its own mod version using **semantic versioning** (`MAJOR.MINOR.PATCH`). Every time you export, you choose how to bump the version:

| Bump | When to use | Example |
|---|---|---|
| **Patch** | Small tweaks or corrections | `1.2.3` → `1.2.4` |
| **Minor** | New defines changed or meaningful balance adjustments | `1.2.3` → `1.3.0` |
| **Major** | Breaking changes or a full redesign of the mod | `1.2.3` → `2.0.0` |

> **Rule of thumb:** Use **patch** bumps freely while iterating. Reserve **major** bumps for changes that would require your players to start a new campaign.

---

## After Exporting

See **How to Install a Mod** for instructions on placing the exported ZIP into your game's mod folder.

---

## Tips

- **Export often** — your data lives in browser local storage, so exports double as backups.
- **Keep the mod name consistent** across exports so the game recognizes updates as the same mod.
- **Share your `editor.json`** with other modders so they can import your project and build on your work.
- **Separate mods, separate projects** — if you want to ship distinct balance passes as independent mods, create a separate project for each one.
