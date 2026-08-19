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

1. Copies the extension files (`manifest.json`, `popup.*`, `content.js`, `ics-generator.js`, `LICENSE`, `icon-*.png`, `fonts/`) into a clean build directory.
2. Generates a **browser-specific README** from `README-template.md`, replacing two placeholders:
   - `{{STORE_NAME}}` — store name shown in the installation section
   - `{{INSTALL_INSTRUCTIONS}}` — per-browser installation steps (defined as variables in `build.sh`)
3. For **Firefox only**, adds the 96px icon and injects `browser_specific_settings.gecko` (add-on ID and `strict_min_version`) into the manifest — required by Firefox for Manifest V3 extensions. Chrome and Edge packages use the manifest as-is.
4. Zips each package into `dist/` and cleans up.

To change the store README content, edit `README-template.md` (keeping the two placeholders). To change installation steps, edit the `*_INSTALL` variables in `build.sh`.

## Verifying a Build

```bash
# Inspect the generated README inside a package
unzip -p dist/calendar-liberator-chrome-*.zip README.md | less

# Check that the Firefox manifest has the gecko ID and the 96px icon
unzip -p dist/calendar-liberator-firefox-*.zip manifest.json
```

## Icons

The packaged icons (`icon-*.png` at the project root) are final assets — do
not modify them. The SVG masters live in `assets/` in case new sizes are ever
needed (e.g. the 300x300 Edge store icon).

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
4. Fill in the store listing and the **Privacy practices** tab (privacy policy URL: https://visiomultimedia.com/en/extensions-privacy-policy/#calendar-liberator; declare that no data is collected and justify the host permissions — see `PRIVACY.md`)
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

## Store Listing Content

### Short Description (132 characters max for Chrome)
```
Export your Outlook calendar to ICS format. One-click export with timezone selection. Works with all Outlook/Office 365 domains.
```

### Detailed Description

```markdown
Calendar Liberator exports your Outlook calendar to standard ICS format in seconds.

✨ KEY FEATURES
• One-click export with simple popup interface
• Auto-detects your timezone (customizable)
• Filter declined and out-of-office events
• Exports a 28-day window (7 days back + 21 days forward)
• Works with all Outlook and Office 365 domains
• 100% private — all processing happens locally
• No data transmission or cloud storage

🚀 HOW IT WORKS
1. Click the extension icon on any Outlook calendar page
2. Select your timezone (auto-detected)
3. Choose export options (include/exclude declined, OOO)
4. Click "Export to ICS"
5. Import the file into any calendar app

🔒 PRIVACY & SECURITY
• Zero data collection
• No external servers or analytics
• Minimal permissions (activeTab only)
• Open source for full transparency

📱 WORKS WITH
• iOS Calendar
• Google Calendar
• Microsoft Calendar
• Any calendar application supporting ICS import

Perfect for:
✓ Backing up work calendars
✓ Syncing to personal devices
✓ Importing to non-corporate calendar apps
✓ Creating offline calendar archives
```

### Category
Productivity (all three stores)

### Tags/Keywords
```
outlook, calendar, export, ics, office 365, calendar backup, calendar sync, productivity
```

### Screenshots

Ready in `assets/screenshots/` (masters in `assets/screenshots/masters/`):
- **Chrome + Firefox:** use the `1280x800/` files (Chrome requires exactly 1280x800 or 640x400; Firefox accepts any size)
- **Edge:** use the `1366x768/` files

Upload them in filename order: 1 = Outlook calendar (context), 2 = popup, 3 = export in progress, 4 = imported result.

### Optional Promotional Images
- **Chrome:** small tile 440x280 (search results), marquee 1400x560 (featured)
- **Edge:** store icon 300x300 (export from `assets/icon-master.svg`)
- **Firefox:** none

### Privacy Practices (Chrome tab)
- Privacy policy URL: https://visiomultimedia.com/en/extensions-privacy-policy/#calendar-liberator
- Declare that no data is collected and justify the host permissions (see `PRIVACY.md`)

## Review Times & Submission Order

- **Firefox Add-ons:** 1–7 days (automated review possible for simple extensions)
- **Edge Add-ons:** 1–3 business days
- **Chrome Web Store:** 1–3 business days (sometimes up to 7 days)

Recommended order: Firefox → Edge → Chrome.
