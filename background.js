// Calendar Liberator — Background Service Worker
//
// Exists because a content script's fetch follows the host page's CORS rules,
// so a PUT issued from the Outlook page dies in preflight. From here the
// extension has cross-origin access through its host permissions.

const CONFIG_KEY = 'publishTarget';
const RESULT_KEY = 'lastPublishResult';

// The popup shares the message channel and closing it rejects an in-flight
// sendMessage even on success, so the outcome is recorded where the content
// script can read it back.
async function recordOutcome(success, error) {
    try {
        await chrome.storage.local.set({
            [RESULT_KEY]: { success, error: error || null, at: Date.now() }
        });
    } catch (storageError) {
        // Nothing to do: the caller still gets the result over the channel
    }
}

function buildRequest(target) {
    const url = new URL(target.url);
    const headers = { 'Content-Type': 'text/calendar; charset=utf-8' };

    // fetch() rejects URLs carrying credentials, but that is how WebDAV
    // documents itself, so move them into a Basic header instead.
    if (url.username) {
        const user = decodeURIComponent(url.username);
        const pass = decodeURIComponent(url.password);
        headers['Authorization'] = 'Basic ' + btoa(`${user}:${pass}`);
        url.username = '';
        url.password = '';
    }

    // "Name: value" is used verbatim; a bare value is taken as a bearer token,
    // which is both the common case and what most people will type.
    if (target.header) {
        const separator = target.header.indexOf(':');
        if (separator > 0) {
            const name = target.header.slice(0, separator).trim();
            const value = target.header.slice(separator + 1).trim();
            if (name && value) headers[name] = value;
        } else {
            headers['Authorization'] = `Bearer ${target.header}`;
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
        throw new Error(`could not reach the destination (${error.message})`);
    }

    if (!response.ok) {
        throw new Error(`destination replied ${response.status} ${response.statusText}`);
    }
}

async function runPublish(ics) {
    try {
        await publishICS(ics);
        await recordOutcome(true, null);
        return { success: true };
    } catch (error) {
        await recordOutcome(false, error.message);
        return { success: false, error: error.message };
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action !== 'publishICS') return false;

    runPublish(message.ics).then(sendResponse);

    // Keep the message port open for the async sendResponse above
    return true;
});
