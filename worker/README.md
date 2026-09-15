# Publishing endpoint

A ~30-line Cloudflare Worker that accepts the calendar from the extension and
serves it to your calendar app. It exists because subscribing needs an HTTPS
URL: Apple Calendar refuses `file://`, and `localhost` is unreachable from a
phone.

The extension knows nothing about Cloudflare — it does a `PUT` to whatever URL
you give it. This is one endpoint that answers that shape; a WebDAV server or a
five-line PHP file on any shared hosting would do as well.

## Setup

You need the R2 bucket and `wrangler` (`npm install -g wrangler`). If npm warns
that the `esbuild` and `workerd` install scripts were skipped, check
`wrangler --version` and carry on: both ship their platform binary as a
prebuilt optional dependency, and the postinstall is only a fallback.

Every `wrangler` command below runs **from this `worker/` directory** — that is
where `wrangler.toml` lives, and wrangler reads it from the working directory.
Run them from the repository root and it will report a missing Worker name.

**0. Log in.** Opens a browser to authorise wrangler against your account. The
token expires, so expect to repeat this occasionally:

```bash
wrangler login
```

**1. Point the config at your bucket.** In `wrangler.toml`, replace
`REPLACE_WITH_YOUR_BUCKET_NAME` with the real name — `wrangler r2 bucket list`
prints it if you don't remember it.

**2. Generate two secrets.** They are what keeps the calendar private, so make
them long and random — not words:

```bash
openssl rand -hex 16   # run twice: one for writing, one for reading
```

**3. Store them:**

```bash
cd worker
wrangler secret put WRITE_PATH   # paste the first
wrangler secret put READ_PATH    # paste the second
```

**4. Deploy:**

```bash
wrangler deploy
```

Wrangler prints the Worker URL, e.g. `https://calendar-liberator.<you>.workers.dev`.

## Using it

**In the extension** — open the popup, expand *Publish to a URL*, and paste:

```
https://calendar-liberator.<you>.workers.dev/<WRITE_PATH>
```

Leave the auth header field empty: the secret is already in the path. Click
**Publish** and grant access to the host when asked.

**In your calendar app** — subscribe to the *read* URL:

```
https://calendar-liberator.<you>.workers.dev/<READ_PATH>
```

On macOS and iOS, swapping `https://` for `webcal://` makes the link open the
subscription dialog directly.

- **macOS Calendar** — File → New Calendar Subscription. Set *Refresh* to every
  15 minutes or every hour; the default of once a day is rarely what you want.
- **iOS** — Settings → Calendar → Accounts → Add Account → Other → Add
  Subscribed Calendar. Refresh follows Fetch New Data and is not per-calendar.
- **Google Calendar** — Other calendars → From URL. Note that Google refreshes
  external calendars on its own schedule, often only every several hours.

## What is and isn't private

The bucket stays private and the write path is never exposed to anything but
the extension. But the read URL has no authentication — it can't, because a
calendar app has no way to log in. Anyone holding that URL can read your
calendar, so treat it like a password: that is exactly why it is a random
string rather than `/calendar.ics`.

To rotate it, `wrangler secret put READ_PATH` with a fresh value and re-subscribe.
