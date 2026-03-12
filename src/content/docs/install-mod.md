# How to Install a Mod

This guide walks you through placing your exported mod into the correct location so Europa Universalis V can load it.

---

## 1. Locate Your Mod Directory

EU5 loads mods from a specific folder in your user documents. Find the path for your operating system:

| OS | Path |
|---|---|
| **Windows** | `%USERPROFILE%\Documents\Paradox Interactive\Europa Universalis V\mod\` |
| **macOS** | `~/Documents/Paradox Interactive/Europa Universalis V/mod/` |
| **Linux** | `~/.local/share/Paradox Interactive/Europa Universalis V/mod/` |

> **Note:** If the `mod` folder does not exist yet, create it manually.

---

## 2. Export and Extract

1. In the editor, click the **⇩ export button** in the bottom bar to download a `.zip` file.
2. Open your mod directory (see path above).
3. **Extract the ZIP** directly into the `mod` folder.

After extraction, you should have a folder named after your mod containing the following structure:

```
mod/
└── my-economy-overhaul/
    ├── editor.json
    ├── .metadata/
    │   └── metadata.json
    └── loading_screen/
        └── common/
            └── defines/
                └── 00_defines.txt
```

| File | Purpose |
|---|---|
| `loading_screen/common/defines/00_defines.txt` | All your modified values — the only defines file the game loads. |
| `.metadata/metadata.json` | Mod metadata (name, version, tags) used by the game. |
| `editor.json` | Project snapshot — import it back into the editor to continue editing, or share it with others. |

---

## 3. Enable the Mod

1. **Launch the game** and open the **Mods** section from the **main menu**.
2. **Enable the mod** by ticking the checkbox next to your mod's name.
3. **Start a new game or load a save**. EU5 will merge your custom defines on top of the game defaults at startup.

---

## Updating an Existing Mod

When you export a new version with the **same mod name**, simply overwrite the contents of the existing mod folder. The game picks up the updated version the next time it loads — no need to re-enable it.

---

## Sharing and Importing Projects

The exported ZIP includes an `editor.json` file containing all your project data. Share this file with other modders so they can **import** it into the editor to load your changes and continue from where you left off.

---

## Load Order

> **Important:** Because the defines file is always placed at `loading_screen/common/defines/00_defines.txt`, only **one** defines mod can be active at a time. If you enable multiple mods that modify defines, only the last one loaded will take effect.

Other mod types (events, decisions, map changes) are unaffected and can be used alongside a defines mod without conflict.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| **Mod not appearing in the main menu** | Verify that `.metadata/metadata.json` exists inside the mod folder, and that the mod folder is inside the `mod/` directory. |
| **Changes not taking effect in-game** | Confirm the mod is enabled in the Mods menu, and that `loading_screen/common/defines/00_defines.txt` is in the correct location. |
| **Wrong game version warning** | The metadata targets the game version you selected in the editor. Re-export after switching to the correct version to clear this warning. It's generally cosmetic for defines mods. |
