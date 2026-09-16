# Publishing endpoint

A small Cloudflare Worker that accepts the calendar from the extension and
serves it to your calendar app, storing it in an R2 bucket you own.

This is an example you deploy to your own Cloudflare account. It is not part of
the extension and is not included in any published package.

**The setup guide lives in the main README, under
[Publishing to a URL](../../README.md#publishing-to-a-url).** This directory only
holds the code:

- `worker.js` — the endpoint. `PUT /calendar.ics` with a bearer token writes;
  `GET /<READ_PATH>` serves the file with the right content type.
- `wrangler.toml.example` — the template. Copy it to `wrangler.toml` and put
  your own bucket name in. The copy is gitignored: it is your deployment, not
  part of the example.

The two secrets, `UPLOAD_TOKEN` and `READ_PATH`, are set with
`wrangler secret put` and never live in this directory.

This is one endpoint that answers the shape the extension speaks. A WebDAV
server or a few lines of PHP on any shared hosting would do as well.
