<!-- PACKAGE_TITLE_START -->
<img src="assets/Calendar-Liberator_Logo.png" alt="Calendar Liberator" width="440" height="97" />
<!-- PACKAGE_TITLE_END -->

**Export your Outlook calendar to ICS format in seconds. Works with any Outlook or Office 365 web domain.**

A browser extension that liberates your work calendar by reading the events shown in Outlook on the web and exporting them to a standard ICS file, ready for iOS Calendar, Google Calendar or any calendar app. It can also publish the file to a URL you own, so your calendar apps stay up to date on their own.

<!-- PACKAGE_BADGES_START -->
<p>
  <a href="https://addons.mozilla.org/en-US/firefox/addon/calendar-liberator/"><img src="assets/Calendar-Liberator_Firefox-Badge.png" alt="Get the Firefox add-on" width="129" height="45" /></a>
  <br/>
  <a href="https://chromewebstore.google.com/detail/calendar-liberator/kbbheandepapakjjigfgcodmhmmclmpc"><img src="assets/Calendar-Liberator_Chrome-Badge.png" alt="Available in the Chrome Web Store" width="159" height="45" /></a>
  <br/>
  <a href="https://microsoftedge.microsoft.com/addons/detail/calendar-liberator/omjcoopfimlfbminglnlhmilifmfidhp"><img src="assets/Calendar-Liberator_Edge-Badge.png" alt="Get it on Edge Add-ons" width="151" height="45" /></a>
</p>
<!-- PACKAGE_BADGES_END -->

---

## Features

- **Universal Compatibility** — Works with all Outlook/Office domains (outlook.cloud.microsoft, outlook.office.com, office.com, outlook.com, outlook.live.com, MCAS proxies)
- **28-Day Window** — Exports exactly 28 days of events (7 days back from today + 21 days forward)
- **User-Controlled Export** — Choose timezone and filter declined/out-of-office events
- **Complete Event Data** — Captures titles, times, dates, organizers, locations, recurring patterns, meeting types
- **Stable UIDs** — Uses Outlook's calendar item IDs when available for reliable re-imports and updates
- **Interaction Lock** — A semi-transparent overlay blocks accidental clicks on the page while the export runs (auto-removed on completion, failure, or after 60 seconds)
- **Optional Publishing** — Upload the export to a URL you own so calendar apps subscribe and refresh themselves, instead of importing by hand — see [Publishing to a URL](#publishing-to-a-url)
- **Privacy-First** — All processing happens locally in your browser; with the default Download destination, no data is transmitted

> [!IMPORTANT]
> Calendar Liberator reads Outlook's web interface instead of using official APIs, and it is strictly one-way: nothing is ever written back to Outlook. Always verify exported calendars before relying on them for important meetings. See [Requirements & Limitations](#requirements--limitations).

---

<!-- PACKAGE_INSTALL_START -->
## Installation

### From Extension Stores

**Firefox Add-ons:** [Calendar Liberator](https://addons.mozilla.org/en-US/firefox/addon/calendar-liberator/)  
**Chrome Web Store:** [Calendar Liberator](https://chromewebstore.google.com/detail/calendar-liberator/kbbheandepapakjjigfgcodmhmmclmpc)  
**Microsoft Edge Add-ons:** [Calendar Liberator](https://microsoftedge.microsoft.com/addons/detail/calendar-liberator/omjcoopfimlfbminglnlhmilifmfidhp)

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
<!-- PACKAGE_INSTALL_END -->

---

## Usage

1. **Navigate to your Outlook Web calendar** (any supported domain)
2. **Click the Calendar Liberator extension icon**
3. **Select your timezone** from the dropdown (auto-detected by default)
4. **Choose a destination** — download the file, or publish it to a URL you own (see [Publishing to a URL](#publishing-to-a-url))
5. **(Optional) Enable filters:**
   - Check "include declined" to export declined events
   - Check "include out-of-office" to export OOO events
6. **Click "Export calendar"**
7. **Wait for export to complete** — the extension will:
   - Save your current view
   - Switch to weekly view
   - Navigate and collect events from a 28-day window
   - Filter events to exact date range (7 days back + 21 days forward)
   - Generate an ICS file
   - Download it, or upload it to your destination
   - Restore your original view and navigate to today
8. **Import the downloaded ICS file**, or subscribe your calendar app to the published URL — see below

### Importing the File

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

The exported file is a snapshot of your calendar at the moment of export: when
meetings are added, moved or canceled in Outlook, you export again and
re-import. Events carry stable UIDs (Outlook's calendar item IDs where
available), so calendar apps that match on UID update existing events instead
of duplicating them. To skip the manual round trip entirely, publish the file
instead — see below.

### Publishing to a URL

Instead of downloading the file, the extension can upload it to an address you
own, and your calendar app subscribes to that address. From then on a single
click in the popup updates every device, with no file to import.

This is optional and off by default. If you never set a destination, the
extension makes no network requests at all.

The full setup is explained in
[Sync your Outlook work calendar on iPhone and Google Calendar](https://visiomultimedia.com/en/blog/sync-outlook-work-calendar-on-iphone-google-calendar/).
The reference endpoint it uses is in [`examples/publishing-endpoint/`](examples/publishing-endpoint/).

### How It Works

**Technical approach:**
- **DOM Scraping:** Uses semantic selectors (aria-labels, roles) for robust event extraction
- **Multiple Fallbacks:** Implements fallback strategies when primary selectors fail
- **View Management:** Preserves and restores user's original calendar view
- **Deduplication:** Automatically removes duplicate events across week boundaries
- **ICS Generation:** Produces RFC 5545-compliant ICS files with proper timezone definitions

**Event coverage:**
- Exports **28 days** of events: 7 days back from today + 21 days forward
- Includes all event types: meetings, all-day events, recurring events, modified recurrences
- Captures: title, time, date, location, organizer, status, recurrence info
- Filters: declined and out-of-office events excluded by default (user-configurable)

**Timezone handling:**
- You pick the IANA timezone (e.g. Europe/Rome) matching the timezone displayed in Outlook — auto-detected from your browser by default
- Each event time is converted to UTC using the browser's timezone database, applying the correct DST rule for each event's own date
- Events import at the right local time in any calendar app — no manual conversion needed
- All-day events are exported as floating dates (no timezone shift)

---

## Requirements & Limitations

- **Browser:** Chrome, Edge, Firefox, or any Chromium-based browser (Brave, Opera)
- **English Only:** The Outlook interface must be set to English
- **UI-Dependent:** The extension reads Outlook's web interface, so a Microsoft redesign can break it until an update ships
- **Best-Effort Accuracy:** Event detection uses heuristics that work for most cases but may miss edge cases
- **28-Day Window:** Exports are limited to 28 days (7 back + 21 forward), not the entire calendar history
- **Manual Re-Import:** A downloaded ICS is a static snapshot that must be imported by hand — see [Importing the File](#importing-the-file). [Publishing to a URL](#publishing-to-a-url) removes this step
- **One-Way Only:** Never a two-way sync. The extension reads Outlook and writes a file; nothing travels back, and a subscribed calendar is read-only in every app. Accepting invitations, moving meetings and replying to organizers remain possible only in Outlook
- **Publishing Needs Somewhere to Publish To:** The extension uploads to an endpoint you provide; it does not host anything for you
- **No Authentication:** Relies on your existing Outlook session
- **Recurring Events:** Exports individual instances, not recurrence rules (prevents import duplicates)
- **Permissions:** `activeTab`, `storage`, and host permissions limited to Outlook domains. Access to a publishing destination is an optional permission, requested only if you set one up
- **No Guarantees:** Use at your own risk. The author is not responsible for missed events, incomplete data, or any consequences from using this tool

---

## Privacy

- **100% Local Processing:** All scraping and ICS generation happens in your browser
- **No Data Transmission By Default:** With the default Download destination the extension makes no network requests at all
- **Publishing Goes Only Where You Say:** If you configure a destination, the file is uploaded to that address and nowhere else. There is no backend, no account and no third-party service anywhere in the project
- **Minimal Storage:** Only the destination URL and header you typed, plus the last publish result, in `storage.local` — never `storage.sync`, so nothing is copied to your browser vendor
- **Privacy Policy:** See [PRIVACY.md](PRIVACY.md)

---

## Troubleshooting

**Extension doesn't work / button disabled:**
- Ensure you're on an Outlook calendar page (not email/other Office apps)
- Refresh the page and try again
- If you installed from source, check that Developer mode is enabled

**Empty or incomplete export:**
- Verify you have events in the 28-day window (7 days back to 21 days forward)
- Check that events aren't all declined/OOO (enable filters if needed)
- Ensure English language is set in Outlook

**Events import as duplicates:**
- Extension uses stable UIDs; duplicates may occur if:
  - Re-importing older exports without deleting previous imports
  - Calendar app doesn't support UID-based matching
- Solution: Delete old calendar subscription before re-importing

**Publishing doesn't work:**
- If the popup downloads the file instead, the upload failed and the extension fell back so the export is not wasted; the red line under the button says why
- See the troubleshooting table in the [setup guide](https://visiomultimedia.com/en/blog/sync-outlook-work-calendar-on-iphone-google-calendar/)

**Can I export more than one month?**
- Not yet. Future versions may support longer ranges

---

## Development

### File Structure
```
calendar-liberator/
├── manifest.json          # Extension configuration
├── popup.html             # Extension popup UI
├── popup.css              # Popup styling
├── popup.js               # Popup logic
├── background.js          # Service worker: uploads the file when publishing
├── content.js             # Calendar scraping logic
├── host-check.js          # Shared Outlook host test, used by popup and content script
├── ics-generator.js       # ICS file generation
├── icons/                 # Extension icons (16/32/48/96/128 px, shipped)
├── fonts/                 # Space Grotesk 600 (wordmark, bundled locally)
├── assets/                # Brand sources, store screenshots and promo tile — not shipped
├── test/                  # ICS generator tests
├── examples/              # Reference publishing endpoint (Cloudflare Worker + R2)
├── LICENSE                # MIT License
├── PRIVACY.md             # Privacy policy
├── BUILD.md               # Build guide
├── STORE.md               # Store listing texts
├── CHANGELOG.md           # Release history
└── README.md              # This file
```

### Build & Package

To create browser-specific packages for store submission:

```bash
./build.sh
```

This generates three packages in `dist/`:
- `calendar-liberator-firefox-[version].zip` - Firefox Add-ons
- `calendar-liberator-chrome-[version].zip` - Chrome Web Store
- `calendar-liberator-edge-[version].zip` - Microsoft Edge Add-ons

Each package includes a browser-specific README. The build script generates it from this file, swapping the blocks marked by `<!-- PACKAGE_* -->` HTML comments for the installation instructions of the store being built.

See [BUILD.md](BUILD.md) for the full build guide.

---

## To Do

- Dropbox adapter for publishing (a "Connect" button instead of the URL field)
- One-click Cloudflare deploy template for the publishing endpoint
- Support for other calendar web apps
- Support for non-English Outlook

---

## Contributing

Contributions welcome! Please:
- Test changes thoroughly on multiple Outlook configurations
- Follow existing code style and patterns
- Update documentation for new features
- Ensure privacy and security standards are maintained

For bugs, feature requests or questions, please [open an issue](https://github.com/fabiocchetti/calendar-liberator/issues).

---

## License

MIT License — see [LICENSE](LICENSE) file for details.

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
