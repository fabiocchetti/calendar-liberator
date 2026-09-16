# Privacy Policy — Calendar Liberator

**Last updated: September 2026**

Calendar Liberator is a browser extension that exports events from your Outlook
Web calendar to an ICS file.

## Summary

The extension has no backend, no accounts, no analytics and no tracking. By
default nothing leaves your device. It can optionally upload the exported file
to a destination **you** configure and control — that is off until you set it
up, and the destination is never one of ours.

## What the Extension Accesses

To perform the export, the extension reads, **only when you explicitly start an
export**:

- The calendar events currently displayed in your Outlook Web tab (titles,
  dates, times, organizers, locations).
- Your email address as displayed in the Outlook interface, used solely to name
  the exported calendar.

This information is used exclusively to generate the ICS file.

## Where the File Goes

**Download (the default).** The file is saved to your device. Nothing is
transmitted anywhere, and nothing is retained after the export completes.

**Publish to a URL (optional, off by default).** If you enter a destination URL,
the generated ICS is uploaded to that address by HTTP PUT when you run an
export. In that case:

- The calendar data leaves your device, to the server **you** chose.
- The author of this extension does not operate, host or have access to that
  destination, and receives no copy of your data.
- What happens to the file afterwards is governed by whoever runs that server —
  your own hosting, your employer's, or a provider you signed up with.
- Anyone who knows the resulting subscription URL can read your calendar,
  because a calendar app cannot authenticate. Treat that URL as a secret.

You can stop publishing at any time by clearing the destination field or
choosing the Download option; the extension then transmits nothing again.

## Data Storage

Stored locally on your device, using `chrome.storage.local`:

- The destination URL and optional authentication header you entered.
- The outcome and timestamp of the last publish, so the popup can report it.

This is deliberately **not** `storage.sync`, so your destination and its
credentials are never copied to your browser vendor's servers. Uninstalling the
extension deletes all of it. No calendar data, credentials or personal
information are stored beyond this.

## Permissions

- **`activeTab`** — lets the extension interact with the Outlook tab you are
  currently viewing, only after you click the extension icon.
- **`storage`** — stores the publishing settings described above.
- **Host permissions for Outlook/Office 365 domains** — required for the content
  script that reads the calendar view on those pages.
- **Optional host access** — requested at the moment you first publish, and only
  for the destination you entered. If you never publish, it is never granted.

## Third Parties

The extension contains no advertising, no analytics and no third-party
services. The only outbound request it can ever make is the upload to the
destination you configured yourself.

## Source Code

The full source code is available for audit at:
https://github.com/fabiocchetti/calendar-liberator

## Contact

For questions about this privacy policy, please open an issue on the GitHub
repository above.
