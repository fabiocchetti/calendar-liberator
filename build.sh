#!/bin/bash

# CalendarLiberator Build Script
# Packages extension for Chrome Web Store, Firefox Add-ons, and Edge Add-ons

set -e

echo "Building CalendarLiberator extension packages..."

# Create build directory
BUILD_DIR="build"
DIST_DIR="dist"
VERSION=$(grep '"version"' manifest.json | sed 's/.*"version": "\(.*\)".*/\1/')

rm -rf "$BUILD_DIR" "$DIST_DIR"
mkdir -p "$BUILD_DIR" "$DIST_DIR"

echo "Version: $VERSION"

# Function to generate browser-specific README
generate_readme() {
    local browser=$1
    local store_name=$2
    local install_instructions=$3
    local output_file=$4
    
    # Read template and replace placeholders
    sed -e "s|{{STORE_NAME}}|$store_name|g" \
        -e "/{{INSTALL_INSTRUCTIONS}}/r /dev/stdin" \
        -e "/{{INSTALL_INSTRUCTIONS}}/d" \
        README-template.md <<< "$install_instructions" > "$output_file"
}

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

# Files to include in package
FILES=(
    "manifest.json"
    "popup.html"
    "popup.css"
    "popup.js"
    "content.js"
    "ics-generator.js"
    "LICENSE"
    "icons"
)

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

# Adds the Firefox-specific gecko settings to the manifest inside BUILD_DIR
# (Firefox requires an explicit add-on ID for Manifest V3 extensions)
add_firefox_settings() {
    node -e "
        const fs = require('fs');
        const path = '$BUILD_DIR/manifest.json';
        const manifest = JSON.parse(fs.readFileSync(path, 'utf8'));
        manifest.browser_specific_settings = {
            gecko: {
                id: 'calendar-liberator@fabiocchetti.dev',
                strict_min_version: '109.0'
            }
        };
        fs.writeFileSync(path, JSON.stringify(manifest, null, 2) + '\n');
    "
}

# Chrome package
echo "Creating Chrome package..."
copy_files
generate_readme "chrome" "Chrome Web Store" "$CHROME_INSTALL" "$BUILD_DIR/README.md"
cd "$BUILD_DIR"
zip -r "../$DIST_DIR/calendar-liberator-chrome-$VERSION.zip" . -x "*.DS_Store"
cd ..
echo "  Created dist/calendar-liberator-chrome-$VERSION.zip"
rm -rf "$BUILD_DIR"/*

# Edge package
echo "Creating Edge package..."
copy_files
generate_readme "edge" "Microsoft Edge Add-ons" "$EDGE_INSTALL" "$BUILD_DIR/README.md"
cd "$BUILD_DIR"
zip -r "../$DIST_DIR/calendar-liberator-edge-$VERSION.zip" . -x "*.DS_Store"
cd ..
echo "  Created dist/calendar-liberator-edge-$VERSION.zip"
rm -rf "$BUILD_DIR"/*

# Firefox package
echo "Creating Firefox package..."
copy_files
add_firefox_settings
generate_readme "firefox" "Firefox Add-ons" "$FIREFOX_INSTALL" "$BUILD_DIR/README.md"
cd "$BUILD_DIR"
zip -r "../$DIST_DIR/calendar-liberator-firefox-$VERSION.zip" . -x "*.DS_Store"
cd ..
echo "  Created dist/calendar-liberator-firefox-$VERSION.zip"

# Cleanup
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
