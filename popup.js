// Calendar Liberator — Popup Script
// Handles the two popup states (ready / empty) and the communication
// with the content script. Publishing is a destination, not a separate
// action: one button runs the export, the choice above it says where it goes.

class CalendarLiberatorPopup {
    constructor() {
        this.readyState = document.getElementById('readyState');
        this.emptyState = document.getElementById('emptyState');
        this.runButton = document.getElementById('runButton');
        this.calendarNameInput = document.getElementById('calendarName');
        this.timezoneSelect = document.getElementById('timezone');
        this.includeDeclinedCheckbox = document.getElementById('includeDeclined');
        this.includeOOOCheckbox = document.getElementById('includeOOO');
        this.errorText = document.getElementById('errorText');
        this.statusText = document.getElementById('statusText');
        this.progressTrack = document.getElementById('progressTrack');
        this.progressFill = document.getElementById('progressFill');
        this.publishConfig = document.getElementById('publishConfig');
        this.publishSummary = document.getElementById('publishSummary');
        this.publishUrlInput = document.getElementById('publishUrl');
        this.publishHeaderInput = document.getElementById('publishHeader');
        this.destinationRadios = document.querySelectorAll('input[name="destination"]');

        this.init();
    }

    init() {
        this.runButton.addEventListener('click', () => this.startExport());

        for (const radio of this.destinationRadios) {
            radio.addEventListener('change', () => {
                this.clearResult();
                this.syncDestinationUI();
            });
        }

        // Any change to the options clears the result of the previous run
        const clear = () => this.clearResult();
        this.calendarNameInput.addEventListener('input', clear);
        this.timezoneSelect.addEventListener('change', clear);
        this.includeDeclinedCheckbox.addEventListener('change', clear);
        this.includeOOOCheckbox.addEventListener('change', clear);

        const onTargetEdited = () => {
            this.clearResult();
            this.savePublishTarget();
            this.syncDestinationUI();
        };
        this.publishUrlInput.addEventListener('input', onTargetEdited);
        this.publishHeaderInput.addEventListener('input', onTargetEdited);

        // Progress updates from the content script (registered once)
        chrome.runtime.onMessage.addListener((message) => {
            if (message.action === 'exportProgress') {
                this.showProgress(message.status, message.progress);
            }
        });

        this.loadPublishTarget();
        this.initTimezoneLabels();
        this.detectUserTimezone();
        this.checkOutlookPage();
        this.syncDestinationUI();
    }

    get destination() {
        const chosen = document.querySelector('input[name="destination"]:checked');
        return chosen ? chosen.value : 'download';
    }

    // The button label is fixed; only the destination fields come and go.
    syncDestinationUI() {
        this.publishConfig.hidden = this.destination !== 'publish';
    }

    destinationHost() {
        try {
            return new URL(this.publishUrlInput.value.trim()).host;
        } catch (error) {
            return null;
        }
    }

    // storage.local, never storage.sync: sync would ship the user's endpoint
    // credentials to Google.
    async loadPublishTarget() {
        try {
            const stored = await chrome.storage.local.get(['publishTarget', 'lastPublishResult']);
            const target = stored.publishTarget;

            if (target && target.url) {
                this.publishUrlInput.value = target.url;
                this.publishHeaderInput.value = target.header || '';

                // A configured destination is the one the user means to use;
                // making them re-pick it on every open would be busywork.
                const publishRadio = document.querySelector('input[name="destination"][value="publish"]');
                if (publishRadio) publishRadio.checked = true;
            }

            this.describeDestination(stored.lastPublishResult);
            this.syncDestinationUI();
        } catch (error) {
            // Fail silently: publishing simply stays unconfigured
        }
    }

    describeDestination(lastResult) {
        const host = this.destinationHost();

        if (!host) {
            this.publishSummary.textContent = 'No destination set yet';
            return;
        }

        if (lastResult && lastResult.success && lastResult.at) {
            this.publishSummary.textContent = `${host} · last published ${this.relativeTime(lastResult.at)}`;
        } else {
            this.publishSummary.textContent = host;
        }
    }

    relativeTime(timestamp) {
        const minutes = Math.round((Date.now() - timestamp) / 60000);
        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes} min ago`;
        const hours = Math.round(minutes / 60);
        if (hours < 24) return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
        const days = Math.round(hours / 24);
        return days === 1 ? 'yesterday' : `${days} days ago`;
    }

    savePublishTarget() {
        const target = {
            url: this.publishUrlInput.value.trim(),
            header: this.publishHeaderInput.value.trim()
        };
        chrome.storage.local.set({ publishTarget: target }).catch(() => {});
    }

    // Must be the first await in the click handler: permissions.request() needs
    // a live user gesture, and any await before it — a permissions.contains()
    // pre-check included — spends it and makes the call throw. Requesting an
    // already-granted origin resolves true without prompting.
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

    async startExport() {
        const destination = this.destination;
        const selectedTimezone = this.timezoneSelect.value;
        const calendarName = this.calendarNameInput.value.trim();
        const includeDeclined = this.includeDeclinedCheckbox.checked;
        const includeOOO = this.includeOOOCheckbox.checked;

        try {
            this.clearResult();

            if (destination === 'publish') {
                const url = this.publishUrlInput.value.trim();
                if (!url) {
                    this.showError('Add a destination URL first.');
                    this.publishUrlInput.focus();
                    return;
                }
                // Granting can close the popup; the next click finds it granted
                await this.ensureDestinationPermission(url);
            }

            this.runButton.disabled = true;
            this.showProgress('Starting…', 0);

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            chrome.tabs.sendMessage(tab.id, {
                action: 'exportCalendar',
                destination: destination,
                timezone: selectedTimezone,
                calendarName: calendarName || null,
                includeDeclined: includeDeclined,
                includeOOO: includeOOO
            }, (response) => {
                this.runButton.disabled = false;
                this.hideProgress();

                if (chrome.runtime.lastError) {
                    this.showError('Failed to communicate with the page. Please refresh and try again.');
                    return;
                }

                if (response && response.success) {
                    this.reportDelivery(response);
                } else {
                    this.showError(response?.error || 'Export failed.');
                }
            });

        } catch (error) {
            this.runButton.disabled = false;
            this.hideProgress();
            this.showError(error.message);
        }
    }

    reportDelivery(response) {
        const count = response.eventCount;
        const label = count === 1 ? '1 event' : `${count} events`;

        if (response.delivery === 'published') {
            const host = this.destinationHost();
            this.showStatus(`Published ${label}${host ? ` to ${host}` : ''}.`);
            this.describeDestination({ success: true, at: Date.now() });
            return;
        }

        this.showStatus(`Downloaded ${label}.`);

        if (response.publishError) {
            this.showError(`Publish failed — ${response.publishError}`);
        }
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
            isOutlookUrl = isOutlookCalendarHost(new URL(tab.url).hostname);
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

    showProgress(status, percent) {
        this.progressTrack.hidden = false;
        this.progressFill.style.width = `${percent}%`;
        this.showStatus(status);
    }

    hideProgress() {
        this.progressTrack.hidden = true;
        this.progressFill.style.width = '0%';
    }

    showStatus(message) {
        this.statusText.textContent = message;
        this.statusText.hidden = false;
    }

    showError(message) {
        this.errorText.textContent = message;
        this.errorText.hidden = false;
    }

    clearResult() {
        this.statusText.hidden = true;
        this.errorText.hidden = true;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CalendarLiberatorPopup();
});
