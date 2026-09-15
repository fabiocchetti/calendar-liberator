// Calendar Liberator — Popup Script
// Handles the two popup states (ready / empty) and the communication
// with the content script.

class CalendarLiberatorPopup {
    constructor() {
        this.readyState = document.getElementById('readyState');
        this.emptyState = document.getElementById('emptyState');
        this.exportButton = document.getElementById('exportButton');
        this.calendarNameInput = document.getElementById('calendarName');
        this.timezoneSelect = document.getElementById('timezone');
        this.includeDeclinedCheckbox = document.getElementById('includeDeclined');
        this.includeOOOCheckbox = document.getElementById('includeOOO');
        this.errorText = document.getElementById('errorText');
        this.publishButton = document.getElementById('publishButton');
        this.publishDetails = document.getElementById('publishDetails');
        this.publishUrlInput = document.getElementById('publishUrl');
        this.publishHeaderInput = document.getElementById('publishHeader');
        this.statusText = document.getElementById('statusText');

        this.init();
    }

    init() {
        this.exportButton.addEventListener('click', () => this.startExport('download'));
        this.publishButton.addEventListener('click', () => this.startExport('publish'));

        // Any change to the options clears the result of the previous run
        const clear = () => { this.hideStatus(); this.hideError(); };
        this.calendarNameInput.addEventListener('input', clear);
        this.timezoneSelect.addEventListener('change', clear);
        this.includeDeclinedCheckbox.addEventListener('change', clear);
        this.includeOOOCheckbox.addEventListener('change', clear);

        const onTargetEdited = () => {
            clear();
            this.savePublishTarget();
        };
        this.publishUrlInput.addEventListener('input', onTargetEdited);
        this.publishHeaderInput.addEventListener('input', onTargetEdited);

        // Progress updates from the content script (registered once)
        chrome.runtime.onMessage.addListener((message) => {
            if (message.action === 'exportProgress') {
                this.showStatus(`Exporting… ${message.progress}%`);
            }
        });

        this.loadPublishTarget();
        this.initTimezoneLabels();
        this.detectUserTimezone();
        this.checkOutlookPage();
    }

    // Append the current UTC offset to each option label, e.g.
    // "Europe/Rome (UTC+2)" — computed live, so it always reflects DST.
    initTimezoneLabels() {
        for (const option of this.timezoneSelect.options) {
            option.textContent = `${option.value} (${this.getUtcOffsetLabel(option.value)})`;
        }
    }

    getUtcOffsetLabel(zone) {
        try {
            const parts = new Intl.DateTimeFormat('en-US', {
                timeZone: zone,
                timeZoneName: 'shortOffset'
            }).formatToParts(new Date());
            const tzPart = parts.find(part => part.type === 'timeZoneName');
            return tzPart ? tzPart.value.replace('GMT', 'UTC') : 'UTC';
        } catch (error) {
            return 'UTC';
        }
    }

    detectUserTimezone() {
        try {
            // The browser reports a full IANA zone (e.g. "Europe/London"),
            // which carries the correct DST rules — unlike a bare UTC offset.
            const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (!zone) return;

            let matchingOption = Array.from(this.timezoneSelect.options)
                .find(option => option.value === zone);

            if (!matchingOption) {
                // Zone not in the curated list: add it so detection always works
                matchingOption = new Option(`${zone} (${this.getUtcOffsetLabel(zone)})`, zone);
                this.timezoneSelect.add(matchingOption);
            }
            matchingOption.selected = true;
        } catch (error) {
            // Fail silently: keep the default
        }
    }

    async checkOutlookPage() {
        let tab;
        try {
            [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        } catch (error) {
            this.showEmptyState();
            return;
        }

        let isOutlookUrl = false;
        try {
            const { hostname } = new URL(tab.url);
            isOutlookUrl = (
                hostname.includes('outlook.office.com') ||
                hostname.endsWith('office.com') ||
                hostname.includes('outlook.com') ||
                // New M365 domain: match the exact host, never *.cloud.microsoft,
                // which would also cover Teams, OneDrive, Word and the rest.
                hostname === 'outlook.cloud.microsoft' ||
                (hostname.endsWith('mcas.ms') && hostname.includes('outlook'))
            );
        } catch (err) {
            isOutlookUrl = false;
        }

        if (!isOutlookUrl) {
            this.showEmptyState();
            return;
        }

        chrome.tabs.sendMessage(tab.id, { action: 'ping' }, () => {
            if (chrome.runtime.lastError) {
                // Real error: the page must be refreshed to inject the script
                this.showError("Extension not ready. Please refresh the Outlook page.");
                return;
            }
            this.showReadyState();
        });
    }

    showReadyState() {
        this.emptyState.hidden = true;
        this.readyState.hidden = false;
    }

    showEmptyState() {
        this.readyState.hidden = true;
        this.emptyState.hidden = false;
    }

    // The destination is remembered so it survives the popup closing, which it
    // does every time the user clicks away. Kept in storage.local, never
    // storage.sync: sync would ship the user's endpoint credentials to Google.
    async loadPublishTarget() {
        try {
            const stored = await chrome.storage.local.get('publishTarget');
            const target = stored.publishTarget;
            if (!target || !target.url) return;

            this.publishUrlInput.value = target.url;
            this.publishHeaderInput.value = target.header || '';
            this.publishDetails.open = true;
        } catch (error) {
            // Fail silently: publishing simply stays unconfigured
        }
    }

    savePublishTarget() {
        const target = {
            url: this.publishUrlInput.value.trim(),
            header: this.publishHeaderInput.value.trim()
        };
        chrome.storage.local.set({ publishTarget: target }).catch(() => {});
    }

    // Host access for an arbitrary endpoint is optional and requested only here,
    // on the click itself: an install that never publishes never grants it.
    //
    // This must be the first await in the click handler. permissions.request()
    // needs a live user gesture, and any await before it — including a
    // permissions.contains() pre-check — spends the gesture and makes the call
    // throw. Requesting an already-granted origin just resolves true without
    // prompting, so the pre-check bought nothing anyway.
    async ensureDestinationPermission(rawUrl) {
        let origin;
        try {
            origin = new URL(rawUrl).origin + '/*';
        } catch (error) {
            throw new Error('That destination URL is not valid.');
        }

        let granted;
        try {
            granted = await chrome.permissions.request({ origins: [origin] });
        } catch (error) {
            throw new Error(`Could not request access to that host: ${error.message}`);
        }

        if (!granted) {
            throw new Error('Access to that destination was denied.');
        }
    }

    async startExport(destination = 'download') {
        const selectedTimezone = this.timezoneSelect.value;
        const calendarName = this.calendarNameInput.value.trim();
        const includeDeclined = this.includeDeclinedCheckbox.checked;
        const includeOOO = this.includeOOOCheckbox.checked;

        try {
            this.hideError();
            this.hideStatus();

            if (destination === 'publish') {
                const url = this.publishUrlInput.value.trim();
                if (!url) {
                    this.publishDetails.open = true;
                    this.showError('Add a destination URL first.');
                    return;
                }
                // Granting can close the popup; the next click finds it granted
                await this.ensureDestinationPermission(url);
            }

            this.setButtonDisabled(true);
            this.showStatus('Exporting…');

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            chrome.tabs.sendMessage(tab.id, {
                action: 'exportCalendar',
                destination: destination,
                timezone: selectedTimezone,
                calendarName: calendarName || null,
                includeDeclined: includeDeclined,
                includeOOO: includeOOO
            }, (response) => {
                this.setButtonDisabled(false);

                if (chrome.runtime.lastError) {
                    this.hideStatus();
                    this.showError('Failed to communicate with the page. Please refresh and try again.');
                    return;
                }

                if (response && response.success) {
                    const count = response.eventCount;
                    const label = count === 1 ? '1 event' : `${count} events`;

                    if (response.delivery === 'published') {
                        this.showStatus(`Published ${label}.`);
                    } else {
                        this.showStatus(`Downloaded ${label}.`);
                    }

                    // The scrape succeeded but the upload did not: the file was
                    // downloaded instead, so the run is not lost. Say both.
                    if (response.publishError) {
                        this.showError(`Publish failed — ${response.publishError}`);
                    }
                } else {
                    this.hideStatus();
                    this.showError(response?.error || 'Export failed.');
                }
            });

        } catch (error) {
            this.setButtonDisabled(false);
            this.hideStatus();
            this.showError(error.message);
        }
    }

    setButtonDisabled(disabled) {
        this.exportButton.disabled = disabled;
        this.publishButton.disabled = disabled;
    }

    showStatus(message) {
        this.statusText.textContent = message;
        this.statusText.hidden = false;
    }

    hideStatus() {
        this.statusText.hidden = true;
    }

    showError(message) {
        this.errorText.textContent = message;
        this.errorText.hidden = false;
    }

    hideError() {
        this.errorText.hidden = true;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CalendarLiberatorPopup();
});
