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
not modify them. The SVG sources live in `assets/brand/` in case new sizes are ever
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

Copy-paste blocks for the three stores. Character limits are noted where the
store enforces one. Keep the wording consistent across stores — reviewers and
users compare them.

### Extension Name

Do **not** put "Outlook" or "Microsoft" first in the name: all three stores
reject names that imply affiliation with the trademark owner. The current form
is safe because the brand name leads and Outlook appears only as a
compatibility statement.

**Chrome (75 characters max)** — 51 characters:
```
Calendar Liberator — Export Outlook Calendar to ICS
```

**Edge and Firefox (50 characters max)** — 44 characters:
```
Calendar Liberator — Outlook Calendar to ICS
```

### Short Description / Summary

**Chrome Web Store — 132 characters max**
```
Export your Outlook Web calendar to an .ics file and import it into Google, Apple or any calendar app. Local, private, no sign-in.
```
(130 characters)

**Microsoft Edge Add-ons — 200 characters max**
```
Export your Outlook Web calendar to a standard .ics file in one click, then import it into Google Calendar, Apple Calendar or any calendar app. Runs entirely in your browser — no sign-in, no servers.
```
(199 characters)

**Firefox Add-ons — 250 characters max**
```
Sync your work calendar without enrolling your phone. Calendar Liberator exports the events shown in Outlook on the web to a standard .ics file you can import into Google Calendar, Apple Calendar or any calendar app. No sign-in, no tracking.
```
(241 characters)

### Detailed Description

Same text for all three stores. Chrome and Edge render plain text only (the
bullets below are literal characters, not markup); Firefox accepts a limited
set of HTML tags, so `<b>`/`<ul>` can be added there if desired.

```
Calendar Liberator exports the events from your Outlook Web calendar into a standard .ics (iCalendar) file, so you can import your work schedule into Google Calendar, Apple Calendar, Fastmail, Proton Calendar, Thunderbird or any app that reads calendar files — and finally see work and personal life side by side.

WHY CALENDAR LIBERATOR

Many companies will only sync your work calendar to your phone if you enrol the device in their mobile device management (Intune/MDM), which means handing over a degree of control of a personal device and granting access to your entire Microsoft account. If you would rather not do that, the usual alternatives are retyping every meeting by hand, or going without.

Calendar Liberator takes a third road. It asks for no password, connects to no Microsoft API, registers no OAuth application, and runs no server. It reads the calendar you are already looking at, in the browser session you have already signed into, and writes it to a file on your own disk. Nothing leaves your computer.

HOW IT WORKS

1. Open your calendar in Outlook on the web and sign in as you normally would.
2. Click the Calendar Liberator icon in the toolbar.
3. Check the calendar name and timezone (both auto-detected) and decide whether to include declined and out-of-office events.
4. Click "Export .ics".
5. The extension walks through a 28-day window — 7 days back and 21 days ahead — in week view, collects the events it can see, then restores your original view and returns to today.
6. Import the downloaded .ics file into whichever calendar app you use.

WHAT GETS EXPORTED

Always:
• Event title
• Date, start time and end time
• All-day and multi-day events, kept as all-day
• Busy / free / tentative status
• A note marking recurring instances

When Outlook shows them on the event, and only then:
• The organiser's display name
• The location or meeting room

Those last two are copied across exactly as they appear in the calendar grid, so your imported events keep the context that makes them useful — who called the meeting and which room to walk to. If Outlook doesn't display them, the fields are simply left out: the extension never opens an event, never queries anything, and never fills in a blank.

And that is the whole list. No attendee lists, no invitation bodies or meeting notes, no attachments, no email addresses, no message content, no meeting join links beyond what the location field already shows. The extension only ever reads the calendar grid — it never touches your mailbox, your files or your contacts.

PRIVACY BY DESIGN

• No data collection of any kind
• No external network requests: no backend, no analytics, no telemetry, no ads
• No accounts, no credentials, no OAuth tokens
• Nothing is written to storage — the events exist only in memory during the export, then become the file you download
• Permissions limited to activeTab plus host access to Outlook and Office 365 domains. The extension cannot see any other website
• Fully open source under the MIT licence, so every claim above can be verified line by line

TIMEZONES DONE PROPERLY

You pick the IANA timezone that matches the times shown in Outlook — your browser's zone is preselected. Each event is converted using the correct daylight-saving offset for its own date, so meetings land at the right hour even when the export spans a clock change. All-day events are exported as floating dates and never shift.

WORKS WITH

• outlook.office.com and outlook.office365.com
• outlook.com and Microsoft 365 tenants on office.com
• Corporate MCAS / Defender for Cloud Apps proxy domains
• Chrome, Edge, Firefox, Brave, Opera and other Chromium browsers

IMPORTING THE FILE IS A MANUAL STEP

Calendar Liberator produces the file; putting it into your calendar app is something you do yourself, and every platform words it differently:

• Google Calendar — only from the web version: Settings, then Import & export, then Import. The mobile app cannot import files.
• Apple Calendar on Mac — File, then Import, and pick which calendar receives the events.
• iPhone and iPad — open the .ics from Files or from an email attachment and tap Add All. Importing on a Mac signed into the same iCloud account is usually easier.
• Outlook desktop, Thunderbird, Fastmail, Proton Calendar, Zoho and other iCalendar-compatible apps — look for "Import" in the calendar settings.

A tip worth knowing: import into a dedicated calendar ("Work", say) rather than your main one. It keeps work events visually separate and lets you delete the whole set in one move if you ever want to start clean.

A SNAPSHOT, NOT A LIVE SYNC — PLEASE READ

The exported file captures your calendar as it is at the moment you export it. It does not keep itself up to date. When meetings are added, moved or cancelled in Outlook, the file you already imported will not follow: you export again and re-import to catch up.

In practice this works best as a small habit. The author runs the export at the end of the working day, so the next morning's schedule is already sitting on the phone alongside personal appointments. Because events carry stable identifiers, a calendar app that matches on them updates the events it already has instead of duplicating them.

If you would rather not do it by hand, you can host the exported file yourself today — on GitHub Pages, S3 or any static host — and subscribe to that URL, which makes phones refresh it on their own schedule. The GitHub README walks through it. Making that a one-click option inside the extension, uploading only to storage you own and configure, is the main item on the roadmap.

PERFECT FOR

• Seeing work meetings next to personal appointments on your own phone
• Keeping a personal device free of corporate device management
• Contractors and consultants juggling more than one organisation's calendar
• Sharing your availability without sharing your mailbox
• Keeping an offline snapshot or backup of your schedule

GOOD TO KNOW

• The Outlook interface must be set to English.
• The export covers 28 days (7 back, 21 ahead), not your whole calendar history.
• The extension reads Outlook's web interface, so a major redesign by Microsoft can break it until an update ships.
• It is read-only. It can never create, edit or delete anything in your Outlook calendar.
• Always check the imported result before relying on it for something important.

OPEN SOURCE

Source code, issue tracker and roadmap: https://github.com/fabiocchetti/calendar-liberator
Privacy policy: https://visiomultimedia.com/en/extensions-privacy-policy/#calendar-liberator

Calendar Liberator is an independent project. It is not affiliated with, endorsed by, or sponsored by Microsoft. Outlook, Office 365 and Microsoft 365 are trademarks of Microsoft Corporation; Google Calendar is a trademark of Google LLC; Apple Calendar is a trademark of Apple Inc.
```

### Category

Productivity (all three stores). Firefox secondary tags: "Tabs" is wrong here —
leave only Productivity.

### Search Terms / Tags

Chrome has no keyword field (it indexes the description, and keyword stuffing
is a policy violation there). Edge and Firefox do.

**Microsoft Edge — "Search terms"**
Limits: max 7 terms, 30 characters per term, 21 words total across all terms.
Enter one term per box:

```
export outlook calendar
outlook to google calendar
outlook to apple calendar
ics icalendar
work calendar sync
office 365 calendar
calendar backup
```
Exactly 21/21 words, longest term 26/30 characters. Note that the word budget
is shared, so "calendar" alone spends 6 of the 21 — that is deliberate, since
Edge matches multi-word queries as phrases.

If the form rejects the set (some validators count differently), shorten term 5
to `calendar sync` and term 6 to `office 365`, which brings the total to 19.

**Firefox — "Tags"** (up to 10, no word budget)
```
outlook, calendar, ics, icalendar, export, calendar-sync, google-calendar, apple-calendar, office-365, productivity
```

### Permission Justifications

Chrome and Edge both ask for a per-permission rationale. Firefox asks for the
same information in "Notes for reviewers".

**activeTab**
```
Used only after the user clicks the extension icon and presses Export. It lets the extension read the calendar rendered in the tab the user is currently viewing, in order to build the .ics file. No other tab is accessed.
```

**Host permissions (Outlook / Office 365 domains)**
```
The content script that reads the calendar grid must be injected into the Outlook Web page itself. Outlook is served from several domains depending on the tenant (outlook.office.com, outlook.office365.com, office.com, outlook.com, live.com, and MCAS/Defender proxy variants), so each is listed. Access is limited to these domains; no other site is matched.
```

**Single purpose (Chrome)**
```
Export the events displayed in the user's Outlook Web calendar to a standard .ics file downloaded to the user's device.
```

**Data usage disclosures (Chrome "Privacy practices" tab)**
Tick nothing in the data-collection matrix, then confirm all three statements:
no sale of data, no use unrelated to the single purpose, no use for
creditworthiness or lending. Privacy policy URL:
https://visiomultimedia.com/en/extensions-privacy-policy/#calendar-liberator

### Notes for Reviewers (Firefox, and Edge's optional field)

Reviewers usually have no corporate Outlook account, so tell them how to test
and what to expect:

```
Testing the extension requires a signed-in Outlook Web calendar (a free outlook.com account works). Open https://outlook.live.com/calendar with a few events in the next three weeks, click the extension icon and press "Export .ics" — the page will step through four weeks in week view and then download the file.

The extension is unminified and has no build step: the sources in the package are exactly what runs. There are no remote scripts, no eval, and no network requests of any kind — content.js and ics-generator.js read the DOM and produce a Blob that is downloaded via an object URL. The bundled font (fonts/) is Space Grotesk, SIL Open Font License, included locally so the popup makes no external requests.

Source: https://github.com/fabiocchetti/calendar-liberator
```

### Screenshots

Ready in `assets/screenshots/` (unedited originals in `assets/screenshots/originals/`):
- **Chrome + Firefox:** use the `1280x800/` files (Chrome requires exactly 1280x800 or 640x400; Firefox accepts any size)
- **Edge:** use the `1366x768/` files

Upload them in filename order: 1 = Outlook calendar (context), 2 = popup, 3 = export in progress, 4 = imported result.

Suggested captions (Edge and Firefox show them; Chrome does not):
1. `Your work calendar in Outlook on the web, where the export starts`
2. `Export popup: calendar name, timezone, and what to include`
3. `The export walks four weeks and restores your original view`
4. `Work meetings imported next to your personal events`

### Optional Promotional Images
- **Chrome:** small tile 440x280 (search results), marquee 1400x560 (featured)
- **Edge:** store icon 300x300 (already generated as `assets/brand/icon-300.png`, or re-export from `assets/brand/icon-source.svg`)
- **Firefox:** none

## Review Times & Submission Order

- **Firefox Add-ons:** 1–7 days (automated review possible for simple extensions)
- **Edge Add-ons:** 1–3 business days
- **Chrome Web Store:** 1–3 business days (sometimes up to 7 days)

Recommended order: Firefox → Edge → Chrome.
