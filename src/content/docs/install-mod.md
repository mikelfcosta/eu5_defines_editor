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

3. **Extract the ZIP** directly into the `mod` folder. After extraction you should have:
   - A `descriptor.mod` file — this file must sit **directly inside** your named mod folder.
   - A folder named after your mod (e.g. `my-economy-overhaul/`) containing the defines file.

   The final structure inside `mod/` should look like this:

   ```
   mod/
   └── my-economy-overhaul/
       ├── descriptor.mod
       └── common/
           └── defines/
               └── my-economy-overhaul.txt
   ```

4. **Open the EU5 launcher**. If the launcher was already open, restart it so it detects the new mod.

5. **Enable the mod** in the launcher's Mods tab by ticking the checkbox next to your mod's name.

6. **Start the game**. EU5 will merge your custom defines on top of the game defaults at startup.

## Updating an existing mod

When you export a new version of a mod with the same mod name, simply overwrite the contents of the existing mod folder. The launcher will pick up the updated version automatically. No need to re-enable it.

## Load order

Defines mods generally do not conflict with other mod types (events, decisions, map changes). However, if two mods both override the same define key, the one loaded **later** in the load order wins. You can drag mods in the launcher to adjust load order.

## Troubleshooting

- **Mod not appearing in launcher** — make sure the `descriptor.mod` file is inside the mod folder, not loose in the `mod/` directory.
- **Changes not taking effect in-game** — verify the mod is checked in the launcher, and that you launched through the launcher rather than the executable directly.
- **Wrong game version warning** — the descriptor targets the game version you selected in the editor. A version mismatch warning in the launcher is cosmetic for defines mods, but you can re-export after switching to the correct version to clear it.
