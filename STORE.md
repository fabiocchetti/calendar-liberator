# Store Listings

## Name

```
Calendar Liberator
```

## Summary

**Firefox**
```
Sync your work calendar without enrolling your phone. Calendar Liberator exports the events shown in Outlook on the web to a standard .ics file for any calendar app, or publishes it to your own URL for auto-refresh. No sign-in, no tracking.
```

**Chrome and Edge**
```
Export your Outlook Web calendar to .ics for any calendar app, or publish it to your own URL for auto-refresh. Private, no sign-in.
```

## Description

```
Calendar Liberator exports the events from your Outlook Web calendar to a standard .ics file, so you can see your work meetings in the calendar app you already use, right next to your personal appointments.

Many companies only sync your work calendar to your phone if you enroll it in their device management (Intune/MDM). Calendar Liberator is a lighter alternative: no password, no Microsoft API, no server. It reads the calendar you already have open in your browser and turns it into a file.

How it works:
1. Open your calendar in Outlook on the web.
2. Click the Calendar Liberator icon, check the timezone and choose which events to include.
3. Click "Export calendar". The extension goes through 28 days (7 back, 21 ahead) in week view, then puts your view back as it was.
4. Import the file into your calendar app. Or publish it to a URL you own and subscribe to it once: from then on, one click updates every device.

What gets exported:
• Title, date, start and end time, and all-day events
• Busy, free or tentative status
• Organizer and location, when Outlook shows them
• Times converted with the correct daylight-saving offset for each date

Nothing else: no attendee lists, meeting notes, attachments or email addresses. The extension only reads the calendar grid and never touches your mailbox, files or contacts.

Your privacy:
Everything happens in your browser. There are no accounts, no analytics and no servers of ours, and by default the extension makes no network requests at all. If you choose to publish, the file goes only to the address you set. Access is limited to Outlook and Office 365 pages.

Good to know:
• Works with Outlook on the web for work, school and personal Microsoft accounts, including company setups that route Outlook through a security proxy.
• The Outlook interface must be set to English.
• It is one-way and read-only: nothing is ever changed in Outlook, where you still accept invitations and move meetings.
• A downloaded file is a snapshot: export again to refresh it, or publish it instead.
• Publishing needs somewhere to publish to. The setup guide below explains how.
• If Microsoft redesigns Outlook, the extension may stop working until an update ships.

Free and open source under the MIT license.
Setup guide: https://visiomultimedia.com/en/blog/sync-outlook-work-calendar-on-iphone-google-calendar/
Source code and issues: https://github.com/fabiocchetti/calendar-liberator
Privacy policy: https://visiomultimedia.com/en/extensions-privacy-policy/#calendar-liberator

Calendar Liberator is an independent project, not affiliated with or endorsed by Microsoft. Outlook, Office 365 and Microsoft 365 are trademarks of Microsoft Corporation.
```

## Edge Search Terms

```
export outlook calendar
outlook to google calendar
outlook to apple calendar
ics icalendar
work calendar sync
office 365 calendar
calendar backup
```

## Permission Justifications

**activeTab**
```
Used only after the user clicks the extension icon and presses Export. It lets the extension read the calendar rendered in the tab the user is currently viewing, in order to build the .ics file. No other tab is accessed.
```

**Host permissions**
```
The content script that reads the calendar grid must be injected into the Outlook Web page itself. Outlook is served from several domains depending on the tenant (outlook.cloud.microsoft, outlook.office.com, outlook.office365.com, office.com, outlook.com, outlook.live.com, and MCAS/Defender proxy variants), so each is listed. Access is limited to these domains; no other site is matched.
```

**storage**
```
Stores the optional publishing settings the user types into the popup: the destination URL and an optional authentication header, plus the result of the last upload so the popup can report it. Deliberately storage.local rather than storage.sync, so the user's endpoint credentials are never copied off the device. No calendar data is stored.
```

**Optional host permissions**
```
Requested at runtime, and only for the single origin the user enters as a publishing destination — never at install time and never broadly. Publishing is off by default; a user who only downloads the .ics is never asked and grants nothing. The permission is required because the upload is an HTTP PUT to an arbitrary address the extension cannot know in advance.
```

**Single purpose**
```
Export the events displayed in the user's Outlook Web calendar to a standard .ics file, either downloaded to the user's device or uploaded to a destination the user configures.
```

## Notes for Reviewers

```
Testing the extension requires a signed-in Outlook Web calendar (a free outlook.com account works). Open https://outlook.live.com/calendar with a few events in the next three weeks, click the extension icon and press "Export calendar" with the default Download destination — the page will step through four weeks in week view and then download the file. No account, endpoint or configuration of any kind is needed to review this path.

The extension is unminified and has no build step: the sources in the package are exactly what runs. There are no remote scripts and no eval. With the default destination there are no network requests at all — content.js and ics-generator.js read the DOM and produce a Blob that is downloaded via an object URL.

The second destination, "Publish to a URL", is opt-in and inert until the user types an address. It uploads the generated .ics by HTTP PUT to that address and nothing else; background.js contains the only fetch in the extension. The host permission for it is optional and requested at the click, so a reviewer who does not configure a destination will never see it asked for. There is no server, service or endpoint belonging to the author anywhere in this feature — a reference endpoint for self-hosting is published in the repository, not operated by us.

The bundled font (fonts/) is Space Grotesk, SIL Open Font License, included locally so the popup makes no external requests.

Source: https://github.com/fabiocchetti/calendar-liberator
```

## Screenshots

Firefox and Chrome: `-1280x800` files. Edge: `-1366x768` files.

1. `Your work calendar in Outlook on the web, where the export starts`
2. `Export popup: calendar name, timezone, and what to include`
3. `The export walks four weeks and restores your original view`
4. `Work meetings imported next to your personal events`
