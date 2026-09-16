<!-- PACKAGE_TITLE_START -->
<img src="assets/Calendar-Liberator_Logo.png" alt="Calendar Liberator" width="440" height="97" />
<!-- PACKAGE_TITLE_END -->

**Export your Outlook calendar to ICS format in seconds. Works with any Outlook or Office 365 web domain.**

A browser extension that liberates your work calendar by scraping visible events and exporting them to standard ICS format—perfect for importing into iOS Calendar, Google Calendar, or any calendar application.

<!-- PACKAGE_BADGES_START -->
<p>
  <a href="https://addons.mozilla.org/en-US/firefox/addon/calendar-liberator/"><img src="assets/Calendar-Liberator_Firefox-Badge.png" alt="Get the Firefox add-on" width="129" height="45" /></a>
  <br/>
  <a href="https://chromewebstore.google.com/detail/calendar-liberator/kbbheandepapakjjigfgcodmhmmclmpc"><img src="assets/Calendar-Liberator_Chrome-Badge.png" alt="Available in the Chrome Web Store" width="159" height="45" /></a>
  <br/>
  <a href="https://microsoftedge.microsoft.com/addons/detail/calendar-liberator/omjcoopfimlfbminglnlhmilifmfidhp"><img src="assets/Calendar-Liberator_Edge-Badge.png" alt="Get it on Microsoft Edge Add-ons" width="151" height="45" /></a>
</p>
<!-- PACKAGE_BADGES_END -->

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

**This is never a two-way sync.** The extension reads your Outlook calendar and
writes a file. Nothing is ever written back to Outlook, in either destination
mode, and a subscribed calendar is read-only in every calendar app. Accepting
an invitation, moving a meeting or replying to an organiser remain possible only
in Outlook.

**Use at your own risk.** Always verify exported calendars before relying on them for important meetings or events.

---

## Features

- **Universal Compatibility** — Works with all Outlook/Office domains (outlook.cloud.microsoft, outlook.office.com, office.com, outlook.com, MCAS proxies)
- **28-Day Window** — Exports exactly 28 days of events (7 days back from today + 21 days forward)
- **User-Controlled Export** — Choose timezone and filter declined/out-of-office events
- **Complete Event Data** — Captures titles, times, dates, organizers, locations, recurring patterns, meeting types
- **Stable UIDs** — Uses Outlook's calendar item IDs when available for reliable re-imports and updates
- **Interaction Lock** — A semi-transparent overlay blocks accidental clicks on the page while the export runs (auto-removed on completion, failure, or after 60 seconds)
- **Privacy-First** — All processing happens locally in your browser; no data transmission
- **One-Click Export** — Simple popup interface with real-time progress tracking
- **Optional Publishing** — Upload the export to a URL you own so calendar apps subscribe and refresh themselves, instead of importing by hand — see [Publishing to a URL](#publishing-to-a-url)
- **Strictly One-Way** — Reads Outlook and writes a file. It can never create, edit or delete anything in your Outlook calendar, in either mode

---

<!-- PACKAGE_INSTALL_START -->
## Installation

### From Extension Stores

**Microsoft Edge Add-ons:** [Calendar Liberator](https://microsoftedge.microsoft.com/addons/detail/calendar-liberator/omjcoopfimlfbminglnlhmilifmfidhp)  
**Chrome Web Store:** [Calendar Liberator](https://chromewebstore.google.com/detail/calendar-liberator/kbbheandepapakjjigfgcodmhmmclmpc)  
**Firefox Add-ons:** [Calendar Liberator](https://addons.mozilla.org/en-US/firefox/addon/calendar-liberator/)

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

## Building for Distribution

To create browser-specific packages for store submission:

```bash
./build.sh
```

This generates three packages in `dist/`:
- `calendar-liberator-chrome-[version].zip` - Chrome Web Store
- `calendar-liberator-edge-[version].zip` - Microsoft Edge Add-ons  
- `calendar-liberator-firefox-[version].zip` - Firefox Add-ons

Each package includes a browser-specific README. The build script generates it from this file, swapping the blocks marked by `<!-- PACKAGE_* -->` HTML comments for the installation instructions of the store being built.

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

To avoid the manual round trip entirely, let the extension publish the file to
an address you own and subscribe your calendar app to it — see
[Publishing to a URL](#publishing-to-a-url). A click in the popup then updates
every device that subscribes.

---

## Requirements

- **Language:** Outlook interface must be set to English
- **Browser:** Chrome, Edge, Firefox, or any Chromium-based browser (Brave, Opera)
- **Permissions:** `activeTab`, `storage`, and host permissions limited to Outlook domains. Access to a publishing destination is an optional permission, requested only if you set one up

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
- **Manual Re-Import:** A downloaded ICS is a static snapshot that must be imported by hand, and the procedure differs per platform — see [Importing the File](#importing-the-file). [Publishing to a URL](#publishing-to-a-url) removes this step
- **One-Way Only:** Never a two-way sync. The extension reads Outlook and writes a file; nothing travels back, and a subscribed calendar is read-only in every app. Accepting invitations, moving meetings and replying to organisers remain possible only in Outlook
- **Publishing Needs Somewhere to Publish To:** The extension uploads to an endpoint you provide; it does not host anything for you
- **No Authentication:** Relies on user's existing Outlook session
- **Recurring Events:** Exports individual instances, not recurrence rules (prevents import duplicates)

---

## Roadmap & To Do

Highest priority first. Last reviewed 2026-09-16, against v1.2.0 plus the
unreleased publishing work.

**1. Ship the publishing feature.** Implemented and working end to end, but not
yet released: the store listings and their privacy declarations must be updated
first, since they currently describe a download-only extension.

**2. Make publishing reachable for non-technical users.** Today it needs an
endpoint the user provides, which rules out most people. The intended answer is
a Dropbox adapter — a "Connect" button instead of a URL field — with the generic
`PUT` kept as the advanced option. A one-click Cloudflare deploy template would
cover the semi-technical middle.

**Lower priority:** other calendar web apps (per-site adapters); non-English
Outlook (the scraper parses English `aria-label` strings); a way to distinguish
an unanswered invitation from one answered Tentative, which Outlook's DOM does
not currently expose — both are labelled `Tentative`, and both are now exported
as transparent so neither blocks the day.

## Privacy & Security

- **100% Local Processing:** All scraping and ICS generation happens in your browser
- **No Data Transmission By Default:** With the default Download destination the extension makes no network requests at all
- **Publishing Goes Only Where You Say:** If you configure a destination, the file is uploaded to that address and nowhere else. There is no backend, no account and no third-party service anywhere in the project
- **Minimal Storage:** Only the destination URL and header you typed, plus the last publish result, in `storage.local` — never `storage.sync`, so nothing is copied to your browser vendor
- **Minimal Permissions:** `activeTab` and `storage`, plus host access limited to Outlook/Office 365 domains and, optionally, the destination you chose
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

## Publishing to a URL

Instead of downloading the file, the extension can upload it to an address you
own, and your calendar app subscribes to that address. From then on a single
click in the popup updates every device — no import, no file handling.

This is optional and off by default. If you never set a destination, the
extension makes no network requests at all.

### What you actually need

One thing: **an HTTPS URL that returns the file.** That is the whole mechanism,
and it is why a shared folder is not enough.

- A local file does not work — Apple Calendar refuses `file://` addresses.
- A local web server does not work either, because `localhost` means nothing to
  your phone.
- iCloud Drive cannot be used: it has no API for third-party apps of any kind.
- Google Drive and Dropbox share *pages*, not raw files, and Google stopped
  serving files directly in 2016.

So you need somewhere that accepts an HTTP `PUT` and serves what it received.
Three ways to get one, in increasing order of effort.

### Option 1 — Something you already have

If you run **Nextcloud, ownCloud, Seafile, a Synology or QNAP NAS, pCloud, Box,
Koofr, Fastmail Files**, or any web server with WebDAV enabled, you are done
already: WebDAV speaks `PUT` natively.

Put the file's WebDAV address in **Destination URL**, with your credentials
inline:

```
https://username:password@cloud.example.com/remote.php/dav/files/username/work.ics
```

Leave the header field empty. Then create a public share link for that file and
subscribe your calendar app to it.

If you have **web hosting with PHP**, five lines are enough — and the GET side
is served by the web server for free:

```php
<?php
$token = 'paste-a-long-random-string-here';
if (($_SERVER['HTTP_AUTHORIZATION'] ?? '') !== "Bearer $token") { http_response_code(401); exit; }
file_put_contents(__DIR__ . '/work.ics', file_get_contents('php://input'));
```

### Option 2 — Cloudflare Workers and R2

Free for this purpose, and the file stays in storage you control. This repo
ships a reference endpoint in
[`examples/publishing-endpoint/`](examples/publishing-endpoint/) — it is an
example you deploy to your own account, not part of the extension. What follows
is the whole setup.

**You need** a Cloudflare account, an R2 bucket, and `wrangler`:

```bash
npm install -g wrangler
```

> If npm warns that the install scripts for `esbuild` and `workerd` were
> skipped, ignore it. Both ship their binary as a prebuilt optional dependency
> and the script is only a fallback. Check with `wrangler --version`.

**Every command below runs from inside `examples/publishing-endpoint/`.** Run
them from the repository root and wrangler will say *"Required Worker name
missing"*, because that is where the config lives.

```bash
cd examples/publishing-endpoint
cp wrangler.toml.example wrangler.toml
wrangler login
```

`wrangler.toml` is gitignored — it describes *your* deployment and should never
be committed. Only the `.example` template is tracked.

**1. Point the config at your bucket.** In the `wrangler.toml` you just copied,
replace `YOUR_BUCKET_NAME` with the real name — `wrangler r2 bucket list` prints
it. To keep the calendar separate from anything else you store, create a bucket
for it first:

```bash
wrangler r2 bucket create calendar-liberator
```

**2. Generate the two secrets, and save them before going further.** Neither can
be read back afterwards — Cloudflare stores them but will not show them again:

```bash
openssl rand -hex 16    # run twice
```

Put both in your password manager now. The first becomes `UPLOAD_TOKEN`, which
authorises writing. The second becomes `READ_PATH`, the unguessable address your
calendar app will read from.

**3. Store them.** The *name* is literally `UPLOAD_TOKEN` and `READ_PATH`; the
random value goes in afterwards, at the `Enter a secret value` prompt:

```bash
wrangler secret put UPLOAD_TOKEN
wrangler secret put READ_PATH
```

The first one will ask *"There doesn't seem to be a Worker called…  Do you want
to create it?"* — answer **Y**. The Worker does not exist yet because you have
not deployed; this creates an empty one to hold the secret.

**4. Deploy:**

```bash
wrangler deploy
```

Wrangler prints your Worker's address, something like
`https://calendar-liberator.yourname.workers.dev`.

### Configuring the extension

Open the popup on your Outlook calendar, choose **Publish to a URL**, and fill
in the two fields:

| Field | Value |
|---|---|
| Destination URL | `https://calendar-liberator.yourname.workers.dev/calendar.ics` |
| Auth token | your `UPLOAD_TOKEN` |

Then click **Export calendar**. The first click may close the popup while the
browser asks permission to reach that host — reopen it and click again, the
second time the access is already granted.

A bare value in that field is sent as `Authorization: Bearer <value>`. If your
endpoint wants something else — `AccessKey: …` for Bunny Storage, a plain
`Authorization: …` for Backblaze B2 — write the whole `Name: value` header
instead and it is used verbatim. For a WebDAV destination the URL carries the
credentials and this field stays empty.

### Subscribing your calendar app

Subscribe to the **read** address, which is different from the one above:

```
https://calendar-liberator.yourname.workers.dev/<your READ_PATH>
```

Swapping `https://` for `webcal://` makes macOS and iOS open the subscription
dialog straight away.

- **macOS Calendar** — File → New Calendar Subscription. Set *Refresh* to every
  15 minutes or every hour; the default of once a day makes updates look broken.
- **iOS** — Settings → Calendar → Accounts → Add Account → Other → Add
  Subscribed Calendar. A Mac subscription does not propagate to the phone by
  itself; you add it on each device. Refresh follows Fetch New Data and cannot
  be set per calendar.
- **Google Calendar** — Other calendars → From URL. Google refreshes external
  calendars on its own schedule, often only every several hours.

### It is still one-way, always

Publishing is not synchronisation. The extension reads Outlook and writes a
file; nothing ever travels back. A subscribed calendar is read-only in every
app: you cannot accept an invitation, move a meeting or reply to an organiser
from it. Those actions remain possible only in Outlook.

Each publish also replaces the whole file rather than adding to it, which is
what makes cancelled and rescheduled meetings disappear correctly — and what
makes events older than seven days drop out as the 28-day window moves.

### About that read URL

It has no password, because a calendar app has no way to log in. Anyone holding
it can read your calendar, which is exactly why it is a long random string
rather than `/calendar.ics`. Treat it like a password.

To rotate it, set a new value and re-subscribe:

```bash
wrangler secret put READ_PATH
```

### When something goes wrong

| What you see | What it means |
|---|---|
| `Required Worker name missing` | You are not in `examples/publishing-endpoint/`, or you have not copied `wrangler.toml.example` to `wrangler.toml` yet. |
| The popup downloads the file instead of publishing | The upload failed and the extension fell back so the export is not wasted. The red line under the button says why. |
| `destination replied 404` | The URL or the token does not match what the Worker expects — most often the read secret was pasted where the write one belongs, or a `<PLACEHOLDER>` was left in literally. |
| `could not reach the destination` | Host access was not granted, or the address is wrong. |
| `No destination URL configured` | The field is empty. Note that **uninstalling the extension erases it** — the settings live only on your device. |
| Nothing happens on the first click | The permission prompt closed the popup. Click again. |
| The calendar appears but is empty | Nothing has been published yet, or only a test file was. |
| New events do not show up | The subscription has not refreshed. Right-click the calendar → Refresh, and check the interval. |

To see what the upload actually did, open `chrome://extensions`, find Calendar
Liberator and click **service worker** — the console there records each attempt
and survives the popup closing.

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

## Changelog

### Unreleased

**Added:**
- Optional publishing: the export can be uploaded to a URL you own, so calendar apps subscribe and refresh themselves instead of importing by hand — see [Publishing to a URL](#publishing-to-a-url)
- A reference endpoint for Cloudflare Workers + R2 in `examples/publishing-endpoint/`, with the full setup walkthrough in the README
- Support for consumer Outlook at `outlook.live.com`, which the manifest claimed but neither host check accepted

**Changed:**
- The popup is organised around the destination: one button, with download or publish chosen above it. Progress now has a bar and a status line, and button labels no longer change while running
- Narrowed the `*://*.live.com/*` host permission to `*://outlook.live.com/*`
- The popup and the content script now share one host check instead of keeping two copies that could drift

**Fixed:**
- Tentative events are exported as `TRANSP:TRANSPARENT`, so they appear without blocking your day. Outlook marks both "answered tentative" and "never answered" the same way, and neither should occupy time
- `STATUS` was written twice in the same event, and used `BUSY`/`FREE`, which are not valid iCalendar values — only `TENTATIVE`, `CONFIRMED` and `CANCELLED` are
- A successful publish also downloaded the file, because closing the popup rejected the in-flight message even though the upload had succeeded
- The first click on Publish did nothing: a permission pre-check consumed the user gesture that `permissions.request()` requires

### Version 1.2.0

- Added support for outlook.cloud.microsoft.
- Clearer message in the popup when the current tab is not an Outlook calendar.

### Version 1.1.1

**Fixed:**
- Timezone selection now uses real IANA zones (e.g. Europe/London, Europe/Rome), auto-detected from the browser — fixes one-hour shifts for users whose actual offset differed from the old fixed "UTC±N"-to-representative-zone mapping
- Account name/email detection for the exported calendar name is more robust (broader meControl selectors, full dropdown scan, additional boot-data markers)

### Version 1.1.0

**Improved:**
- Event times now converted to UTC with correct per-date DST handling (fixes one-hour shifts across daylight-saving changes)
- Corrected timezone mapping (UTC+0 = London, UTC+1 = Rome/Berlin, UTC+2 = Helsinki/Athens)
- New flat, minimal popup design with light/dark mode support
- Extension icons included (16/32/48/128)
- Firefox package now includes the required `browser_specific_settings.gecko` ID
- Semi-transparent overlay blocks accidental page interactions during export (auto-removed on completion, failure, or after 60 seconds)

**Removed:**
- Dead email-detection code paths (cookie/iframe scanning)
- Diagnostic logging of personal data

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

MIT License

**Calendar Liberator — Free your time!**
