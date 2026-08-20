<img src="assets/Calendar-Liberator_Logo.png" alt="Calendar Liberator" width="440">

**Export your Outlook calendar to ICS format in seconds. Works with any Outlook or Office 365 web domain.**

A browser extension that liberates your work calendar by scraping visible events and exporting them to standard ICS format—perfect for importing into iOS Calendar, Google Calendar, or any calendar application.

---

## DISCLAIMER

**This extension uses UI scraping instead of official APIs.** This design choice provides several benefits:
- **Lightweight** — No complex API authentication or server-side processing
- **Privacy-first** — All processing happens locally in your browser; no data ever leaves your device
- **Minimal permissions** — Only `activeTab` plus host access limited to Outlook/Office 365 domains

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
- **Interaction Lock** — A semi-transparent overlay blocks accidental clicks on the page while the export runs (auto-removed on completion, failure, or after 60 seconds)
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
2. **Click the Calendar Liberator extension icon**
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
7. **Import the downloaded ICS file** into any calendar application — see below

---

## Importing the File

Calendar Liberator generates the `.ics`; getting it into your calendar app is a
manual step, and the wording differs on every platform:

| App | Where to import |
|---|---|
| Google Calendar | Web version only: **Settings → Import & export → Import**. The mobile app cannot import files. |
| Apple Calendar (macOS) | **File → Import**, then choose which calendar receives the events |
| iOS / iPadOS | Open the `.ics` from Files or an email attachment and tap **Add All**. Importing on a Mac on the same iCloud account is usually easier. |
| Outlook desktop | **File → Open & Export → Import/Export → Import an iCalendar (.ics) file** |
| Thunderbird, Fastmail, Proton Calendar, Zoho | Look for **Import** in the calendar settings |

**Import into a dedicated calendar** (e.g. "Work") rather than your main one.
Work events stay visually separate, and you can delete the whole set in one
move if you want to start clean.

### It's a Snapshot — Re-Export to Stay Current

The exported file reflects your calendar at the moment of export. It does not
update itself. When meetings are added, moved or cancelled in Outlook, the file
you already imported does not follow — you export again and re-import.

This works best as a habit: run the export at the end of the working day, and
the next morning's schedule is already on your phone next to your personal
appointments. Events carry stable UIDs (Outlook's calendar item IDs where
available), so calendar apps that match on UID update existing events instead
of duplicating them.

To avoid the manual round trip entirely, you can host the exported file
yourself and subscribe to its URL — see
[Advanced: Self-Hosting for Auto-Updates](#advanced-self-hosting-for-auto-updates).
Making that a one-click option inside the extension is the main item on the
[Roadmap](#roadmap).

---

## Requirements

- **Language:** Outlook interface must be set to English
- **Browser:** Chrome, Edge, Firefox, or any Chromium-based browser (Brave, Opera)
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
- You pick the IANA timezone (e.g. Europe/Rome) matching the timezone displayed in Outlook — auto-detected from your browser by default
- Each event time is converted to UTC using the browser's timezone database, applying the correct DST rule for each event's own date
- Events import at the right local time in any calendar app — no manual conversion needed
- All-day events are exported as floating dates (no timezone shift)

---

## Limitations

- **English Only:** Currently requires Outlook interface to be in English
- **28-Day Window:** Exports limited to exactly 28 days (7 days back + 21 forward, not entire calendar history)
- **Manual Re-Import:** The exported ICS is a static snapshot that must be imported by hand, and the procedure differs per platform — see [Importing the File](#importing-the-file)
- **Read-Only:** Cannot modify Outlook calendar, only read/export
- **No Authentication:** Relies on user's existing Outlook session
- **Recurring Events:** Exports individual instances, not recurrence rules (prevents import duplicates)

---

## Roadmap

Planned ideas, roughly in priority order. Contributions and feedback welcome.

- **Hosted, auto-updating exports** — Today the ICS is a static snapshot you re-import by hand every run. The goal is an optional one-click upload to user-owned hosting (e.g. GitHub Pages, S3/R2, WebDAV) so subscribed devices (iOS Calendar, Google Calendar) refresh automatically. This must stay privacy-first: strictly opt-in, uploads only to storage the user owns and configures, never to a third-party service operated by the extension.
- **Support for other calendar web apps** — Google Calendar, Fastmail, Proton Calendar, etc. Nice-to-have, low priority; the scraping engine would need per-site adapters.

---

## Privacy & Security

- **100% Local Processing:** All scraping and ICS generation happens in your browser
- **No Data Transmission:** Extension never sends data to external servers
- **No Storage:** Doesn't store credentials, calendar data, or any personal information
- **Minimal Permissions:** `activeTab` plus host access limited to Outlook/Office 365 domains — nothing else
- **Open Source:** Full source code available for audit
- **Privacy Policy:** See [PRIVACY.md](PRIVACY.md)

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
├── icons/                 # Extension icons (16/32/48/96/128 px, shipped)
├── fonts/                 # Space Grotesk 600 (wordmark, bundled locally)
├── assets/                # Brand sources, store screenshots and promo tile — not shipped
├── test/                  # ICS generator tests
├── LICENSE                # MIT License
├── PRIVACY.md             # Privacy policy
├── BUILD.md               # Build & publishing guide
├── .gitignore             # Git exclusions
└── README.md              # This file
```

### Build & Package
See [BUILD.md](BUILD.md) for creating distribution packages for Chrome Web Store, Firefox Add-ons, and Edge Add-ons.

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

**Calendar Liberator — Free your time!**
