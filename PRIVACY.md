# Privacy Policy — CalendarLiberator

**Last updated: July 2026**

CalendarLiberator is a browser extension that exports events from your Outlook Web calendar to a local ICS file.

## Data Collection

**CalendarLiberator collects, transmits, and stores absolutely no personal data.**

- All processing happens locally in your browser.
- No data is ever sent to external servers, analytics platforms, or third parties.
- The extension has no backend, no accounts, and no tracking of any kind.

## What the Extension Accesses

To perform the export, the extension reads, **only when you explicitly start an export**:

- The calendar events currently displayed in your Outlook Web tab (titles, dates, times, organizers, locations).
- Your email address as displayed in the Outlook interface, used solely to name the exported calendar file.

This information is used exclusively to generate the ICS file, which is downloaded directly to your device. Nothing is retained after the export completes.

## Permissions

- **`activeTab`** — allows the extension to interact with the Outlook tab you are currently viewing, only after you click the extension icon.
- **Host permissions for Outlook/Office 365 domains** — required for the content script that reads the calendar view on those pages. The extension cannot access any other website.

## Data Storage

The extension does not use cookies, local storage, or any other persistence mechanism. No calendar data, credentials, or personal information are stored.

## Third Parties

The extension communicates with no third-party services. It contains no advertising, no analytics, and no external network requests.

## Source Code

The full source code is available for audit at:
https://github.com/fabiocchetti/calendar-liberator

## Contact

For questions about this privacy policy, please open an issue on the GitHub repository above.
