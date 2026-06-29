# Building CalendarLiberator for Distribution

This document explains the build process for creating browser-specific packages.

## Overview

The extension uses a template-based build system to generate browser-specific README files for each target platform. This ensures that users on Chrome see Chrome-specific instructions, Firefox users see Firefox instructions, etc.

## File Structure

- **README-template.md** - Source template with placeholders for browser-specific content
- **build.sh** - Build script that generates packages with browser-specific READMEs
- **dist/** - Output directory containing browser-specific packages

## Template System

The `README-template.md` file contains placeholders that are replaced during build:

```markdown
## Installation

### From {{STORE_NAME}}
_(Coming soon - extension pending review)_

### Manual Installation (Developer Mode)

{{INSTALL_INSTRUCTIONS}}
```

### Placeholders

- `{{STORE_NAME}}` - Replaced with "Chrome Web Store", "Microsoft Edge Add-ons", or "Firefox Add-ons"
- `{{INSTALL_INSTRUCTIONS}}` - Replaced with browser-specific installation steps

## Building Packages

Run the build script:

```bash
./build.sh
```

This will:
1. Extract version number from `manifest.json`
2. Create a clean build directory
3. Generate three separate packages:
   - **calendar-liberator-chrome-[version].zip** - For Chrome Web Store
   - **calendar-liberator-edge-[version].zip** - For Microsoft Edge Add-ons
   - **calendar-liberator-firefox-[version].zip** - For Firefox Add-ons

Each package contains:
- All extension files (manifest.json, popup.*, content.js, ics-generator.js)
- LICENSE file
- Browser-specific README.md

## Browser-Specific Instructions

### Chrome
```
1. Download the extension from the Chrome Web Store
2. Click "Add to Chrome" and confirm the installation
3. Pin the extension icon to your toolbar for easy access
```

### Edge
```
1. Download the extension from Microsoft Edge Add-ons
2. Click "Get" and confirm the installation
3. Pin the extension icon to your toolbar for easy access
```

### Firefox
```
1. Download the extension from Firefox Add-ons
2. Click "Add to Firefox" and confirm the installation
3. Pin the extension icon to your toolbar for easy access
```

## Modifying the Build Process

To change the README content:
1. Edit `README-template.md`
2. Keep the `{{STORE_NAME}}` and `{{INSTALL_INSTRUCTIONS}}` placeholders
3. Run `./build.sh` to regenerate packages

To change browser-specific instructions:
1. Edit the `CHROME_INSTALL`, `EDGE_INSTALL`, or `FIREFOX_INSTALL` variables in `build.sh`
2. Run `./build.sh` to regenerate packages

## Testing

After building, you can verify the generated READMEs:

```bash
# View Chrome README
unzip -p dist/calendar-liberator-chrome-1.0.0.zip README.md | less

# View Firefox README
unzip -p dist/calendar-liberator-firefox-1.0.0.zip README.md | less

# View Edge README
unzip -p dist/calendar-liberator-edge-1.0.0.zip README.md | less
```

## Submission Checklist

Before submitting to stores:

1. **Build packages**: Run `./build.sh`
2. **Create icons**: Add 16x16, 32x32, 48x48, 128x128 PNG files to `icons/` folder
3. **Test manually**: Load each package as an unpacked extension
4. **Take screenshots**: Capture the extension in action for store listings
5. **Submit**:
   - Chrome Web Store: https://chrome.google.com/webstore/devconsole
   - Firefox Add-ons: https://addons.mozilla.org/developers/
   - Edge Add-ons: https://partner.microsoft.com/dashboard/microsoftedge

## Notes

- All three packages currently use the same `manifest.json` (Manifest V3 is cross-compatible)
- If future browser-specific changes are needed (e.g., Firefox-specific APIs), modify `build.sh` to create browser-specific manifests
- The build script removes the `build/` directory after creating each package, ensuring clean builds
