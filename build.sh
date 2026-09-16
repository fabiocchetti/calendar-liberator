#!/bin/bash

# CalendarLiberator Build Script
# Packages extension for Chrome Web Store, Firefox Add-ons, and Edge Add-ons

set -e

echo "Building CalendarLiberator extension packages..."

BUILD_DIR="build"
DIST_DIR="dist"
VERSION=$(grep '"version"' manifest.json | sed 's/.*"version": "\(.*\)".*/\1/')

rm -rf "$BUILD_DIR" "$DIST_DIR"
mkdir -p "$BUILD_DIR" "$DIST_DIR"

echo "Version: $VERSION"

# Generates the README shipped inside a package from README.md, which is the
# single source of truth. Three blocks delimited by <!-- PACKAGE_*_START/END -->
# comments are swapped out: the logo and the store badges, which point at
# assets/ files the package doesn't ship, and the installation section, which
# becomes the instructions for the one store being built. The markers are HTML
# comments, so they stay invisible when GitHub renders README.md.
generate_readme() {
    local store_name=$1
    local store_url=$2
    local install_instructions=$3
    local output_file=$4

    STORE_NAME="$store_name" \
    STORE_URL="$store_url" \
    INSTALL_INSTRUCTIONS="$install_instructions" \
    OUTPUT_FILE="$output_file" \
    node -e "
        const fs = require('fs');
        let readme = fs.readFileSync('README.md', 'utf8');

        const replaceBlock = (name, replacement) => {
            const start = '<!-- ' + name + '_START -->';
            const end = '<!-- ' + name + '_END -->';
            const from = readme.indexOf(start);
            const to = readme.indexOf(end);
            if (from === -1 || to === -1) {
                console.error('  ERROR: ' + name + ' markers missing from README.md');
                process.exit(1);
            }
            readme = readme.slice(0, from) + replacement + readme.slice(to + end.length);
        };

        replaceBlock('PACKAGE_TITLE', '# Calendar Liberator');
        replaceBlock('PACKAGE_BADGES', '');
        replaceBlock('PACKAGE_INSTALL', [
            '## Installation',
            '',
            '### From ' + process.env.STORE_NAME,
            '[Calendar Liberator](' + process.env.STORE_URL + ')',
            '',
            '### Manual Installation (Developer Mode)',
            '',
            process.env.INSTALL_INSTRUCTIONS
        ].join('\n'));

        // Removing a block leaves a gap behind
        readme = readme.replace(/\n{3,}/g, '\n\n');

        fs.writeFileSync(process.env.OUTPUT_FILE, readme);
    "
}

# Published store listings
CHROME_URL="https://chromewebstore.google.com/detail/calendar-liberator/kbbheandepapakjjigfgcodmhmmclmpc"
EDGE_URL="https://microsoftedge.microsoft.com/addons/detail/calendar-liberator/omjcoopfimlfbminglnlhmilifmfidhp"
FIREFOX_URL="https://addons.mozilla.org/en-US/firefox/addon/calendar-liberator/"

# Chrome installation instructions
CHROME_INSTALL="1. Download the extension from the Chrome Web Store
2. Click \"Add to Chrome\" and confirm the installation
3. Pin the extension icon to your toolbar for easy access

**For manual installation:**
1. Download or clone this repository
2. Open Chrome and go to \`chrome://extensions\`
3. Enable \"Developer mode\" (toggle at top right)
4. Click \"Load unpacked\" and select the \`calendar-liberator\` folder
5. Pin the extension for easy access"

# Edge installation instructions
EDGE_INSTALL="1. Download the extension from Microsoft Edge Add-ons
2. Click \"Get\" and confirm the installation
3. Pin the extension icon to your toolbar for easy access

**For manual installation:**
1. Download or clone this repository
2. Open Edge and go to \`edge://extensions\`
3. Enable \"Developer mode\" (toggle at bottom left)
4. Click \"Load unpacked\" and select the \`calendar-liberator\` folder
5. Pin the extension for easy access"

# Firefox installation instructions
FIREFOX_INSTALL="1. Download the extension from Firefox Add-ons
2. Click \"Add to Firefox\" and confirm the installation
3. Pin the extension icon to your toolbar for easy access

**For manual installation:**
1. Download or clone this repository
2. Open Firefox and go to \`about:debugging#/runtime/this-firefox\`
3. Click \"Load Temporary Add-on\"
4. Navigate to the extension folder and select \`manifest.json\`
5. Pin the extension for easy access

Note: Temporary add-ons are removed when Firefox restarts. For permanent installation, install from Firefox Add-ons store."

FILES=(
    "manifest.json"
    "popup.html"
    "popup.css"
    "popup.js"
    "content.js"
    "ics-generator.js"
    "background.js"
    "LICENSE"
    "icons"
    "fonts"
)

# The 96px icon is required only by Firefox; remove it from Chrome/Edge builds
remove_non_firefox_icons() {
    rm -f "$BUILD_DIR/icons/icon-96.png"
}

copy_files() {
    for file in "${FILES[@]}"; do
        if [ -e "$file" ]; then
            if [ -d "$file" ]; then
                cp -r "$file" "$BUILD_DIR/"
            else
                cp "$file" "$BUILD_DIR/"
            fi
        else
            echo "  ERROR: $file not found"
            exit 1
        fi
    done
}

# Adds the Firefox-specific gecko settings and 96px icon to the manifest
# inside BUILD_DIR (Firefox requires an explicit add-on ID for Manifest V3
# extensions; the 96px icon is used only by Firefox)
add_firefox_settings() {
    node -e "
        const fs = require('fs');
        const path = '$BUILD_DIR/manifest.json';
        const manifest = JSON.parse(fs.readFileSync(path, 'utf8'));
        manifest.browser_specific_settings = {
            gecko: {
                id: 'calendar-liberator@fabiocchetti.dev',
                // 128 is the first release with optional_host_permissions
                strict_min_version: '128.0',
                // REVIEW BEFORE THE NEXT SUBMISSION: true only for the default
                // flow — a configured publish destination does upload data
                data_collection_permissions: {
                    required: ['none']
                }
            }
        };
        // Firefox MV3 has no background.service_worker; it runs an event page
        manifest.background = { scripts: ['background.js'] };
        manifest.icons['96'] = 'icons/icon-96.png';
        manifest.action.default_icon['96'] = 'icons/icon-96.png';
        fs.writeFileSync(path, JSON.stringify(manifest, null, 2) + '\n');
    "
}

echo "Creating Chrome package..."
copy_files
remove_non_firefox_icons
generate_readme "Chrome Web Store" "$CHROME_URL" "$CHROME_INSTALL" "$BUILD_DIR/README.md"
cd "$BUILD_DIR"
zip -r "../$DIST_DIR/calendar-liberator-chrome-$VERSION.zip" . -x "*.DS_Store"
cd ..
echo "  Created dist/calendar-liberator-chrome-$VERSION.zip"
rm -rf "$BUILD_DIR"/*

echo "Creating Edge package..."
copy_files
remove_non_firefox_icons
generate_readme "Microsoft Edge Add-ons" "$EDGE_URL" "$EDGE_INSTALL" "$BUILD_DIR/README.md"
cd "$BUILD_DIR"
zip -r "../$DIST_DIR/calendar-liberator-edge-$VERSION.zip" . -x "*.DS_Store"
cd ..
echo "  Created dist/calendar-liberator-edge-$VERSION.zip"
rm -rf "$BUILD_DIR"/*

echo "Creating Firefox package..."
copy_files
add_firefox_settings
generate_readme "Firefox Add-ons" "$FIREFOX_URL" "$FIREFOX_INSTALL" "$BUILD_DIR/README.md"
cd "$BUILD_DIR"
zip -r "../$DIST_DIR/calendar-liberator-firefox-$VERSION.zip" . -x "*.DS_Store"
cd ..
echo "  Created dist/calendar-liberator-firefox-$VERSION.zip"

rm -rf "$BUILD_DIR"

echo ""
echo "Build complete!"
echo ""
echo "Packages created in dist/:"
ls -lh "$DIST_DIR"
echo ""
echo "Next steps:"
echo "  1. Test the extension by loading the unpacked folder"
echo "  2. Take screenshots for store listings"
echo "  3. Submit to:"
echo "     - Chrome Web Store: https://chrome.google.com/webstore/devconsole"
echo "     - Firefox Add-ons: https://addons.mozilla.org/developers/"
echo "     - Edge Add-ons: https://partner.microsoft.com/dashboard/microsoftedge"
