# CalendarLiberator

**Liberate your work Outlook calendar! Export 28 days of events (7 days back + 21 days forward) from ANY Outlook or Office 365 web domain. Export your meetings—including correct timezone—directly to an ICS file for instant use in iOS, Google Calendar, or anywhere.**

## DISCLAIMER

**This extension uses UI scraping instead of official APIs.** This design choice provides several benefits:
- **Lightweight** — No complex API authentication or server-side processing
- **Minimal permissions** — Only requires `activeTab` permission
- **Undetectable** — No API calls means no audit trails (as long as browser monitoring isn't in place)
- **Privacy-first** — All processing happens locally in your browser

**However, this approach has limitations:**
- **UI-dependent** — If Microsoft updates Outlook's interface, scraping may break until updated
- **Best-effort accuracy** — Event detection uses heuristics that work for most cases but may miss edge cases
- **English only** — Requires Outlook interface to be set to English
- **No guarantees** — The author is not responsible for missed events, incomplete data, or any consequences from using this tool

## Features

- **Universal Compatibility:** Works with all Outlook/Office domains (outlook.office.com, office.com, etc.)
- **28-Day Window:** Exports exactly 28 days of events (7 days back from today + 21 days forward)
- **User-Selectable Timezone:** Set your displayed calendar timezone for accurate event times
- **Intelligent Navigation:** Saves current view, switches to weekly mode, navigates systematically
- **Complete Event Data:** Captures titles, times, organizers, meeting types, recurrence patterns
- **One-Click Export:** Simple popup interface with progress tracking
- **Privacy-First:** All processing happens locally in your browser - no data transmission

<!-- BROWSER_SPECIFIC_SECTION_START -->
## Installation

### From {{STORE_NAME}}
_(Coming soon - extension pending review)_

### Manual Installation (Developer Mode)

{{INSTALL_INSTRUCTIONS}}

<!-- BROWSER_SPECIFIC_SECTION_END -->

## Requirements

**IMPORTANT: Before using CalendarLiberator, ensure your Outlook settings are configured correctly:**

### Required Outlook Settings:
1. **Language: English** 
   - Go to Outlook Settings → General → Language and time
   - Set "Display language" to English
   
**The extension will show an error if the language is not set to English.**

## How To Use

1. **Configure Outlook language** (see Requirements above)
2. **Navigate to your Outlook Web calendar** (any supported domain)
3. **Click the CalendarLiberator extension icon** in your browser toolbar
4. **Select your timezone** from the dropdown (auto-detected by default)
5. **Click "Export Outlook Calendar to ICS"**
6. **Wait for completion** - the extension will:
   - Save your current view
   - Switch to weekly view
   - Navigate and collect events from a 28-day window
   - Filter events to exact date range (7 days back + 21 days forward)
   - Generate and download the ICS file
   - Restore your original view
6. **Import the downloaded file** into iOS Calendar, Google Calendar, or any calendar app

## Technical Implementation

### File Structure
```
calendar-liberator/
├── manifest.json          # Extension configuration
├── popup.html             # Extension popup interface
├── popup.css              # Popup styling
├── popup.js               # Popup logic and UI interactions
├── content.js             # Main calendar interaction logic
├── ics-generator.js       # ICS file generation module
└── README.md             # This file
```

### Key Features

#### **Robust DOM Interaction**
- Uses semantic selectors (aria-labels, roles) instead of fragile class names
- Multiple fallback strategies for finding UI elements
- Graceful degradation when elements aren't found

#### **Smart Navigation System**
- Detects current view state and saves it
- Switches to weekly view for consistent event extraction
- Navigates systematically: back 1 week → current → next → next
- Restores original view when complete

#### **Comprehensive Event Parsing**
- Extracts from `aria-label` attributes for reliability
- Parses titles, times, dates, organizers, meeting types
- Detects recurring events and exceptions
- Handles both timed events and all-day events

#### **Professional ICS Generation**
- Full timezone support with VTIMEZONE definitions
- Proper datetime formatting (ISO 8601)
- Recurrence rule support
- Standard-compliant ICS format

#### **Error Handling & Recovery**
- Validates Outlook page before starting
- Continues processing even if individual weeks fail
- Deduplicates events across weeks
- Always attempts to restore original view

### Building for Distribution

This extension uses Manifest V3, which is compatible with Chrome, Edge, and Firefox. The build script generates browser-specific packages with tailored documentation:

```bash
./build.sh
```

This creates three packages in the `dist/` folder:
- `calendar-liberator-chrome-[version].zip` - For Chrome Web Store
- `calendar-liberator-edge-[version].zip` - For Microsoft Edge Add-ons
- `calendar-liberator-firefox-[version].zip` - For Firefox Add-ons

Each package includes a browser-specific README with appropriate installation instructions.

## Development

### Architecture
- **Manifest V3** for cross-browser compatibility
- **Content Script** for DOM interaction and event extraction
- **Popup Script** for user interface and progress tracking
- **Modular ICS Generator** for calendar format conversion

### Extension Permissions
- `activeTab`: Access to current Outlook tab
- Host permissions for Outlook domains (no background scripts or broad permissions)

## Privacy & Security

- **Zero data transmission** - everything processes locally
- **No cloud storage** - files generated in your browser
- **No credentials access** - works with what's already visible
- **Minimal permissions** - only accesses active Outlook tabs

## Troubleshooting

### Common Issues

1. **"Extension not ready" error**
   - Refresh the Outlook page and try again
   - Ensure you're on a calendar view (not email)
   - Verify Outlook language is set to English

2. **Language Error**
   - Change Outlook Settings → General → Language to English
   - Refresh the page and try again

2. **No events found**
   - Make sure you have events in your calendar
   - Check that events are visible in the current view
   - Try switching to weekly view manually first

3. **Navigation errors**
   - Some Outlook interfaces load slowly - wait a moment and retry
   - Clear browser cache if persistent issues occur

4. **Timezone issues**
   - Double-check your timezone selection matches Outlook's display
   - Use the format shown in the dropdown (e.g., "UTC+1", "UTC-5")

## License

MIT License - Feel free to modify and distribute!

## Contributing

Found a bug or have an improvement? Feel free to:
1. Open an issue describing the problem
2. Submit a pull request with fixes
3. Share feedback on compatibility with different Outlook configurations

## Changelog

### Version 1.0.0 (Initial Release)

**Features:**
- Universal Outlook/Office 365 domain support
- 28-day event extraction (7 days back from today + 21 days forward)
- User-selectable timezone with auto-detection
- Intelligent navigation with view preservation
- Complete event data parsing (titles, times, organizers, recurrence)
- ICS file generation with proper timezone support
- One-click export with progress tracking
- Privacy-first local processing

**Event Filtering:**
- Automatic filtering of declined events
- Automatic filtering of out-of-office entries
- Duplicate event detection across weeks
- Enhanced organizer validation

**Requirements:**
- Outlook interface must be set to English
- Chrome or Chromium-based browser
- Active Outlook/Office 365 web calendar session

---

**CalendarLiberator — Free your time!**