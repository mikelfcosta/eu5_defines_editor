# Exporting and Versioning

When you're ready to use your changes in game, export your project as a mod ZIP. This page explains what the export contains and how versioning works.

## The export dialog

Click the **⇩ export button** in the bottom bar to open the export dialog. Before downloading, you can review or change:

- **Mod name** — the display name that will appear in the EU5 launcher. Defaults to a kebab-case version of your project name.
- **Mod description** — a short description for the launcher. The editor automatically appends a summary of which categories you've changed.
- **Version bump** — choose how to increment the mod's version number (see below).

Confirm everything and click **Export** to download a `.zip` file.

## What's inside the ZIP

The exported package contains everything EU5 needs to load your mod:

- `descriptor.mod` — the mod descriptor file, which the launcher reads for the mod name, version, and supported game version.
- A defines file under `common/defines/` — this contains only the values you changed, written in Paradox script format. The game merges this on top of its own defaults at startup.

## Semantic versioning

Each project tracks its own mod version using semantic versioning (`MAJOR.MINOR.PATCH`). Every time you export, you choose how to bump the version:

| Bump type | When to use | Example |
|---|---|---|
| **Patch** | Small tweaks or corrections | `1.2.3` → `1.2.4` |
| **Minor** | New defines changed or meaningful balance adjustments | `1.2.3` → `1.3.0` |
| **Major** | Breaking changes or a significant redesign of the mod | `1.2.3` → `2.0.0` |

Use patch bumps freely during iteration. Reserve major bumps for changes your players would need to take action on (such as starting a new campaign).

## After exporting

See **How to Install a Mod** for instructions on getting the exported ZIP into your game.

## Tips

- Export frequently. Because your data lives in browser local storage, exporting is your backup.
- Keep the mod name consistent across exports so the launcher treats updates as the same mod.
- If you want to share separate balance passes as distinct mods, create separate projects.
