# Publishing endpoint

A small Cloudflare Worker that accepts the calendar from the extension and
serves it to your calendar app, storing it in an R2 bucket you own.

**The setup guide lives in the main README, under
[Publishing to a URL](../README.md#publishing-to-a-url).** This directory only
holds the code:

- `worker.js` — the endpoint. `PUT /calendar.ics` with a bearer token writes;
  `GET /<READ_PATH>` serves the file with the right content type.
- `wrangler.toml` — Worker name, R2 binding, and the explicit `preview_urls`
  and `workers_dev` settings.

The two secrets, `UPLOAD_TOKEN` and `READ_PATH`, are set with
`wrangler secret put` and never live in this directory.

This is one endpoint that answers the shape the extension speaks. A WebDAV
server or a few lines of PHP on any shared hosting would do as well.
