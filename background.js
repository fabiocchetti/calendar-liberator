// Calendar Liberator — Background Service Worker
//
// The only reason this file exists: since Chrome 85 a content script's fetch is
// subject to the host page's CORS rules, so a PUT issued from the Outlook page
// would die in preflight against most endpoints. From the service worker the
// extension has real cross-origin access through its host permissions.

const CONFIG_KEY = 'publishTarget';

// Turns the single URL the user configured into a request. Credentials inlined
// in the URL (https://user:pass@host/work.ics) are moved into a Basic header:
// fetch() rejects URLs that carry them, but that spelling is how every WebDAV
// server documents itself, so it is worth supporting with five lines.
function buildRequest(target) {
    const url = new URL(target.url);
    const headers = { 'Content-Type': 'text/calendar; charset=utf-8' };

    if (url.username) {
        const user = decodeURIComponent(url.username);
        const pass = decodeURIComponent(url.password);
        headers['Authorization'] = 'Basic ' + btoa(`${user}:${pass}`);
        url.username = '';
        url.password = '';
    }

    // Optional free-form header, written by the user as "Name: value"
    if (target.header) {
        const separator = target.header.indexOf(':');
        if (separator > 0) {
            const name = target.header.slice(0, separator).trim();
            const value = target.header.slice(separator + 1).trim();
            if (name && value) headers[name] = value;
        }
    }

    return { url: url.toString(), headers };
}

async function publishICS(ics) {
    const stored = await chrome.storage.local.get(CONFIG_KEY);
    const target = stored[CONFIG_KEY];

    if (!target || !target.url) {
        throw new Error('No destination URL configured.');
    }

    const { url, headers } = buildRequest(target);

    let response;
    try {
        response = await fetch(url, { method: 'PUT', headers, body: ics });
    } catch (error) {
        // Network-level failure: unreachable host, DNS, offline, TLS
        throw new Error(`could not reach the destination (${error.message})`);
    }

    if (!response.ok) {
        throw new Error(`destination replied ${response.status} ${response.statusText}`);
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action !== 'publishICS') return false;

    publishICS(message.ics)
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }));

    // Keep the message port open for the async sendResponse above
    return true;
});
