# Changelog

**1.3.1**
- Minor UI adjustments to the popup form.
- Update labels and copy.

**1.3.0**
- Added support for publishing: the export can be uploaded to a URL you own, so calendar apps subscribe and refresh themselves instead of importing by hand ([setup guide](https://visiomultimedia.com/en/blog/sync-outlook-work-calendar-on-iphone-google-calendar/)).
- Added a reference endpoint for Cloudflare Workers + R2 in `examples/publishing-endpoint/`.
- Added support for consumer Outlook at `outlook.live.com`, which the manifest claimed but neither host check accepted.
- Popup reorganized around the destination: one button, with download or publish chosen above it. Progress now has a bar and a status line, and button labels no longer change while running.
- Narrowed the `*://*.live.com/*` host permission to `*://outlook.live.com/*`.
- The popup and the content script now share one host check instead of keeping two copies that could drift.
- Tentative events are now exported as `TRANSP:TRANSPARENT`, so they appear without blocking your day. Outlook marks both "answered tentative" and "never answered" the same way, and neither should occupy time.
- Fixed `STATUS` being written twice in the same event with `BUSY`/`FREE`, which are not valid iCalendar values (only `TENTATIVE`, `CONFIRMED` and `CANCELLED` are).
- Fixed a successful publish also downloading the file, because closing the popup rejected the in-flight message even though the upload had succeeded.
- Fixed the first click on Publish doing nothing: a permission pre-check consumed the user gesture that `permissions.request()` requires.

**1.2.0**
- Added support for outlook.cloud.microsoft.
- Clearer message in the popup when the current tab is not an Outlook calendar.

**1.1.1**
- Timezone selection now uses real IANA zones (e.g. Europe/London, Europe/Rome), auto-detected from the browser. Fixes one-hour shifts for users whose actual offset differed from the old fixed "UTC±N"-to-representative-zone mapping.
- More robust account name/email detection for the exported calendar name (broader meControl selectors, full dropdown scan, additional boot-data markers).

**1.1.0**
- Event times are now converted to UTC with correct per-date DST handling (fixes one-hour shifts across daylight-saving changes).
- Corrected timezone mapping (UTC+0 = London, UTC+1 = Rome/Berlin, UTC+2 = Helsinki/Athens).
- New flat, minimal popup design with light/dark mode support.
- Added extension icons (16/32/48/128).
- Firefox package now includes the required `browser_specific_settings.gecko` ID.
- Added a semi-transparent overlay that blocks accidental page interactions during export (auto-removed on completion, failure, or after 60 seconds).
- Removed dead email-detection code paths (cookie/iframe scanning) and diagnostic logging of personal data.

**1.0.0**
- Initial release: 28-day export (7 days back, 21 forward) from any Outlook/Office 365 web domain to an ICS file, with timezone selection, view preservation, filtering of declined and out-of-office events, and duplicate detection across weeks.
