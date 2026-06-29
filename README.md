# CalendarLiberator

**Export your Outlook calendar to ICS format in seconds. Works with any Outlook or Office 365 web domain.**

A browser extension that liberates your work calendar by scraping visible events and exporting them to standard ICS format—perfect for importing into iOS Calendar, Google Calendar, or any calendar application.

---

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

**Use at your own risk.** Always verify exported calendars before relying on them for important meetings or events.

---

## Features

- **Universal Compatibility** — Works with all Outlook/Office domains (outlook.office.com, office.com, outlook.com, MCAS proxies)
- **28-Day Window** — Exports exactly 28 days of events (7 days back from today + 21 days forward)
- **User-Controlled Export** — Choose timezone and filter declined/out-of-office events
- **Complete Event Data** — Captures titles, times, dates, organizers, locations, recurring patterns, meeting types
- **Stable UIDs** — Uses Outlook's calendar item IDs when available for reliable re-imports and updates
- **Privacy-First** — All processing happens locally in your browser; no data transmission
- **One-Click Export** — Simple popup interface with real-time progress tracking

---

## Installation

### From Extension Stores

**Chrome Web Store:** _(Coming soon)_  
**Microsoft Edge Add-ons:** _(Coming soon)_  
**Firefox Add-ons:** _(Coming soon)_

### From Source (Developer Mode)

**Chrome / Edge / Chromium-based browsers:**
1. Download or clone this repository
2. Open your browser's extensions page:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Brave: `brave://extensions`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked**
5. Select the `calendar-liberator` folder
6. Pin the extension to your toolbar for quick access

**Firefox:**
1. Download or clone this repository
2. Open Firefox and go to `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on**
4. Navigate to the extension folder and select `manifest.json`
5. Pin the extension to your toolbar for quick access

Note: Temporary Firefox add-ons are removed when Firefox restarts.

---

## Building for Distribution

To create browser-specific packages for store submission:

```bash
./build.sh
```

This generates three packages in `dist/`:
- `calendar-liberator-chrome-[version].zip` - Chrome Web Store
- `calendar-liberator-edge-[version].zip` - Microsoft Edge Add-ons  
- `calendar-liberator-firefox-[version].zip` - Firefox Add-ons

Each package includes a browser-specific README with tailored installation instructions. The build script uses `README-template.md` as the source and replaces placeholders with browser-specific content.

---

## Usage

1. **Navigate to your Outlook Web calendar** (any supported domain)
2. **Click the CalendarLiberator extension icon**
3. **Select your timezone** from the dropdown (auto-detected by default)
4. **(Optional) Enable filters:**
   - Check "include declined" to export declined events
   - Check "include out-of-office" to export OOO events
5. **Click "Export to ICS"**
6. **Wait for export to complete** — the extension will:
   - Save your current view
   - Switch to weekly view
   - Navigate and collect events from a 28-day window
   - Filter events to exact date range (7 days back + 21 days forward)
   - Generate an ICS file
   - Restore your original view and navigate to today
7. **Import the downloaded ICS file** into any calendar application

---

## Requirements

- **Language:** Outlook interface must be set to English
- **Browser:** Any Chromium-based browser (Chrome, Edge, Brave, Opera)
- **Permissions:** Extension only requests `activeTab` and limited host permissions for Outlook domains

---

## How It Works

### Technical Approach
- **DOM Scraping:** Uses semantic selectors (aria-labels, roles) for robust event extraction
- **Multiple Fallbacks:** Implements fallback strategies when primary selectors fail
- **View Management:** Preserves and restores user's original calendar view
- **Deduplication:** Automatically removes duplicate events across week boundaries
- **ICS Generation:** Produces RFC 5545-compliant ICS files with proper timezone definitions

### Event Coverage
- Exports **28 days** of events: 7 days back from today + 21 days forward
- Includes all event types: meetings, all-day events, recurring events, modified recurrences
- Captures: title, time, date, location, organizer, status, recurrence info
- Filters: declined and out-of-office events excluded by default (user-configurable)

### Timezone Handling
- User selects the displayed timezone in Outlook
- Events are exported with TZID tags referencing that timezone
- ICS file includes proper VTIMEZONE definitions
- No time conversion occurs—times exported as displayed

---

## Limitations

- **English Only:** Currently requires Outlook interface to be in English
- **28-Day Window:** Exports limited to exactly 28 days (7 days back + 21 forward, not entire calendar history)
- **Read-Only:** Cannot modify Outlook calendar, only read/export
- **No Authentication:** Relies on user's existing Outlook session
- **Recurring Events:** Exports individual instances, not recurrence rules (prevents import duplicates)

---

## Privacy & Security

- **100% Local Processing:** All scraping and ICS generation happens in your browser
- **No Data Transmission:** Extension never sends data to external servers
- **No Storage:** Doesn't store credentials, calendar data, or any personal information
- **Minimal Permissions:** Only requests access to Outlook domains when active tab is open
- **Open Source:** Full source code available for audit

---

## Troubleshooting

**Extension doesn't work / button disabled:**
- Ensure you're on an Outlook calendar page (not email/other Office apps)
- Refresh the page and try again
- Check that Developer mode is enabled

**Empty or incomplete export:**
- Verify you have events in the 28-day window (7 days back to 21 days forward)
- Check that events aren't all declined/OOO (enable filters if needed)
- Ensure English language is set in Outlook

**Events import as duplicates:**
- Extension uses stable UIDs; duplicates may occur if:
  - Re-importing older exports without deleting previous imports
  - Calendar app doesn't support UID-based matching
- Solution: Delete old calendar subscription before re-importing

---

## Advanced: Self-Hosting for Auto-Updates

Want iOS Calendar to auto-refresh? Host the exported ICS file:

### Option 1: GitHub Pages (Recommended)
1. Create a public GitHub repo
2. Upload `outlook-calendar.ics` to repo
3. Enable GitHub Pages in repo settings
4. Subscribe to: `https://username.github.io/repo/outlook-calendar.ics`

### Option 2: Cloud Storage (S3, Cloudflare R2)
1. Upload ICS to public bucket
2. Set proper headers: `Content-Type: text/calendar; charset=utf-8`
3. Subscribe to the public URL

### Option 3: Static Hosting (Netlify, Vercel)
1. Deploy folder containing ICS to hosting service
2. Subscribe to the hosted URL

**Note:** iOS refreshes subscribed calendars periodically (not configurable). For immediate updates, manually re-import the ICS.

---

## Development

### File Structure
```
calendar-liberator/
├── manifest.json          # Extension configuration
├── popup.html             # Extension popup UI
├── popup.css              # Popup styling
├── popup.js               # Popup logic
├── content.js             # Calendar scraping logic
├── ics-generator.js       # ICS file generation
├── LICENSE                # MIT License
├── .gitignore             # Git exclusions
└── README.md              # This file
```

### Build & Package
See build scripts for creating distribution packages for Chrome Web Store, Firefox Add-ons, and Edge Add-ons.

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Contributing

Contributions welcome! Please:
- Test changes thoroughly on multiple Outlook configurations
- Follow existing code style and patterns
- Update documentation for new features
- Ensure privacy and security standards are maintained

---

## Support

For issues, feature requests, or questions, please open an issue on GitHub.

**Q: Can I export more than one month?**  
A: Future versions may support automated navigation/pagination for longer ranges.

---

MIT License

**CalendarLiberator — Free your time!**
