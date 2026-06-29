# Build & Publishing Guide

## Quick Build

Run the build script to create distribution packages:

```bash
./build.sh
```

This creates three packages in `dist/`:
- `calendar-liberator-chrome-{version}.zip` — For Chrome Web Store
- `calendar-liberator-firefox-{version}.zip` — For Firefox Add-ons
- `calendar-liberator-edge-{version}.zip` — For Edge Add-ons (same as Chrome)

## Manual Build

If you prefer manual packaging:

### Chrome/Edge
```bash
zip -r calendar-liberator.zip manifest.json popup.html popup.css popup.js content.js ics-generator.js LICENSE icons/
```

### Firefox
Same as Chrome — Manifest V3 works across all browsers.

## Testing Before Publishing

1. **Load unpacked in Chrome:**
   ```
   chrome://extensions → Developer mode → Load unpacked → select folder
   ```

2. **Test in Firefox:**
   ```
   about:debugging → This Firefox → Load Temporary Add-on → select zip
   ```

3. **Test in Edge:**
   ```
   edge://extensions → Developer mode → Load unpacked → select folder
   ```

## Publishing

### Chrome Web Store
1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay one-time $5 developer fee (if first extension)
3. Upload `calendar-liberator-chrome-{version}.zip`
4. Fill in store listing (see assets needed below)
5. Submit for review (typically 1-3 days)

### Firefox Add-ons
1. Go to [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
2. Create account (free)
3. Upload `calendar-liberator-firefox-{version}.zip`
4. Fill in listing details
5. Submit for review (typically 1-7 days)

### Microsoft Edge Add-ons
1. Go to [Edge Partner Center](https://partner.microsoft.com/dashboard/microsoftedge)
2. Create developer account (free)
3. Upload `calendar-liberator-edge-{version}.zip`
4. Fill in listing
5. Submit for review (typically 1-3 days)

## Version Updates

1. Update version in `manifest.json`
2. Run `./build.sh` to create new packages
3. Upload to each store with changelog
4. Users auto-update within 24-48 hours

## Store Listing Requirements

See `ASSETS_NEEDED.md` for complete list of required assets.