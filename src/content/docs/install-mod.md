# How to Install a Mod

This guide walks you through placing your exported mod into the correct location so Europa Universalis V can load it.

## Mod directory location

EU5 loads mods from a specific folder in your user documents. The path depends on your operating system:

| OS | Path |
|---|---|
| **Windows** | `%USERPROFILE%\Documents\Paradox Interactive\Europa Universalis V\mod\` |
| **macOS** | `~/Documents/Paradox Interactive/Europa Universalis V/mod/` |
| **Linux** | `~/.local/share/Paradox Interactive/Europa Universalis V/mod/` |

If the `mod` folder does not exist yet, create it manually.

## Step-by-step installation

1. **Export** your project from the editor using the ⇩ export button. You will download a `.zip` file.

2. **Open your mod directory** using the path above.

3. **Extract the ZIP** directly into the `mod` folder. After extraction you should have a folder named after your mod (e.g. `my-economy-overhaul/`) containing the defines file, metadata, and an `editor.json` file.

   The final structure inside `mod/` should look like this:

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

   - **`loading_screen/common/defines/00_defines.txt`** — the only defines file the game loads. All your modified values are written here.
   - **`.metadata/metadata.json`** — mod metadata (name, version, tags) used by the game.
   - **`editor.json`** — a snapshot of your project that can be imported back into the editor to continue editing or shared with others.

4. **Launch the game** and open the **Mods** section from the **main menu**.

5. **Enable the mod** by ticking the checkbox next to your mod's name.

6. **Start a new game or load a save**. EU5 will merge your custom defines on top of the game defaults at startup.

## Sharing and importing projects

The exported ZIP includes an `editor.json` file containing all of your modified values. You can share this file with others — they can import it into the editor to load your changes and continue editing from where you left off.

## Updating an existing mod

When you export a new version of a mod with the same mod name, simply overwrite the contents of the existing mod folder. The game will pick up the updated version the next time it loads. No need to re-enable it.

## Load order

Because the defines file is always placed at `loading_screen/common/defines/00_defines.txt`, only one defines mod can be active at a time. If you enable multiple mods that modify defines, only the last one loaded will take effect. Other mod types (events, decisions, map changes) are not affected and can be used alongside a defines mod without conflict.

## Troubleshooting

- **Mod not appearing in the main menu** — make sure the `.metadata/metadata.json` file is in the correct location inside the mod folder and that the mod folder is inside the `mod/` directory.
- **Changes not taking effect in-game** — verify the mod is enabled in the main menu Mods section, and that the defines file is at `loading_screen/common/defines/00_defines.txt` inside the mod folder.
- **Wrong game version warning** — the metadata targets the game version you selected in the editor. A version mismatch warning is generally cosmetic for defines mods, but you can re-export after switching to the correct version to clear it.
