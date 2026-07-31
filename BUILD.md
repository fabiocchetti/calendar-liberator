# Build & Publishing Guide

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

1. Copies the extension files (`manifest.json`, `popup.*`, `content.js`, `ics-generator.js`, `LICENSE`, `icons/`) into a clean build directory.
2. Generates a **browser-specific README** from `README-template.md`, replacing two placeholders:
   - `{{STORE_NAME}}` — store name shown in the installation section
   - `{{INSTALL_INSTRUCTIONS}}` — per-browser installation steps (defined as variables in `build.sh`)
3. For **Firefox only**, injects `browser_specific_settings.gecko` (add-on ID and `strict_min_version`) into the manifest — required by Firefox for Manifest V3 extensions. Chrome and Edge packages use the manifest as-is.
4. Zips each package into `dist/` and cleans up.

To change the store README content, edit `README-template.md` (keeping the two placeholders). To change installation steps, edit the `*_INSTALL` variables in `build.sh`.

## Verifying a Build

```bash
# Inspect the generated README inside a package
unzip -p dist/calendar-liberator-chrome-*.zip README.md | less

# Check that the Firefox manifest has the gecko ID
unzip -p dist/calendar-liberator-firefox-*.zip manifest.json
```

## Regenerating Icons

Icons are generated programmatically (see `BRAND.md`):

```bash
python3 -m venv .venv
.venv/bin/pip install Pillow
.venv/bin/python scripts/generate_icons.py
```

## Testing Before Publishing

1. **Chrome:** `chrome://extensions` → Developer mode → Load unpacked → select project folder
2. **Edge:** `edge://extensions` → Developer mode → Load unpacked → select project folder
3. **Firefox:** `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → select `manifest.json` (temporary add-ons are removed on restart)

Test a full export on a real Outlook calendar in each browser before submitting.

## Publishing

### Chrome Web Store
1. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay the one-time $5 developer fee (first extension only)
3. Upload `calendar-liberator-chrome-{version}.zip`
4. Fill in the store listing and the **Privacy practices** tab (see `PRIVACY.md`; declare that no data is collected and justify the host permissions)
5. Submit for review (typically 1–3 days)

### Firefox Add-ons
1. Go to the [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
2. Create an account (free)
3. Upload `calendar-liberator-firefox-{version}.zip`
4. Fill in listing details
5. Submit for review (typically 1–7 days)

### Microsoft Edge Add-ons
1. Go to the [Edge Partner Center](https://partner.microsoft.com/dashboard/microsoftedge)
2. Create a developer account (free)
3. Upload `calendar-liberator-edge-{version}.zip`
4. Fill in the listing
5. Submit for review (typically 1–3 days)

## Version Updates

1. Update `version` in `manifest.json`
2. Run `./build.sh` to create new packages
3. Upload to each store with a changelog
4. Users auto-update within 24–48 hours

## Store Listing Assets

See `ASSETS_NEEDED.md` for the checklist of screenshots and listing content.
