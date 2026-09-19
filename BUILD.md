# Build Guide

## Quick Build

Run the build script to create distribution packages:

```bash
./build.sh
```

This creates three packages in `dist/`:
- `calendar-liberator-chrome-{version}.zip` — Chrome Web Store
- `calendar-liberator-firefox-{version}.zip` — Firefox Add-ons
- `calendar-liberator-edge-{version}.zip` — Microsoft Edge Add-ons

The version number is read automatically from `manifest.json`.

## What the Build Does

1. Copies the extension files (`manifest.json`, `popup.*`, `content.js`, `ics-generator.js`, `LICENSE`, `icon-*.png`, `fonts/`) into a clean build directory.
2. Generates a **browser-specific README** from `README.md` — the single source of truth — by swapping three blocks delimited by `<!-- PACKAGE_*_START/END -->` comments:
   - `PACKAGE_TITLE` — the logo, replaced by a plain `# Calendar Liberator` heading (the package ships no `assets/`)
   - `PACKAGE_BADGES` — the store badges, dropped for the same reason
   - `PACKAGE_INSTALL` — the installation section, replaced by the one store's listing link (`*_URL` in `build.sh`) and installation steps (`*_INSTALL` in `build.sh`)

   The markers are HTML comments, so they never show up when GitHub renders `README.md`. Removing one from `README.md` fails the build rather than shipping a half-substituted README.
3. For **Firefox only**, adds the 96px icon and injects `browser_specific_settings.gecko` (add-on ID and `strict_min_version`) into the manifest — required by Firefox for Manifest V3 extensions. Chrome and Edge packages use the manifest as-is.
4. Zips each package into `dist/` and cleans up.

To change the store README content, edit `README.md` (keeping the three marker pairs). To change installation steps, edit the `*_INSTALL` variables in `build.sh`; to change the listing links, edit the `*_URL` variables.

## Verifying a Build

```bash
# Inspect the generated README inside a package
unzip -p dist/calendar-liberator-chrome-*.zip README.md | less

# Check that the Firefox manifest has the gecko ID and the 96px icon
unzip -p dist/calendar-liberator-firefox-*.zip manifest.json
```

## Icons

The packaged icons (`icon-*.png` at the project root) are final assets — do
not modify them. The SVG sources live in `assets/` (`Calendar-Liberator_Icon.svg` for 48px and up,
`Calendar-Liberator_Icon-Small.svg` for the simplified 16/32px versions) in case new
sizes are ever needed (e.g. the 300x300 Edge store icon).

## Testing Before Publishing

1. **Chrome:** `chrome://extensions` → Developer mode → Load unpacked → select project folder
2. **Edge:** `edge://extensions` → Developer mode → Load unpacked → select project folder
3. **Firefox:** `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → select `manifest.json` (temporary add-ons are removed on restart)

Test a full export on a real Outlook calendar in each browser before submitting.
