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
        this.openOutlookLink = document.getElementById('openOutlook');

        this.init();
    }

    init() {
        this.exportButton.addEventListener('click', () => this.startExport());

        // The empty-state link opens Outlook in a new tab
        this.openOutlookLink.addEventListener('click', (event) => {
            event.preventDefault();
            chrome.tabs.create({ url: 'https://outlook.office.com/calendar' });
            window.close();
        });

        // Any change to the options resets the button to its initial state
        const resetButton = () => this.setButtonLabel('Export .ics');
        this.calendarNameInput.addEventListener('input', resetButton);
        this.timezoneSelect.addEventListener('change', resetButton);
        this.includeDeclinedCheckbox.addEventListener('change', resetButton);
        this.includeOOOCheckbox.addEventListener('change', resetButton);

        // Progress updates from the content script (registered once)
        chrome.runtime.onMessage.addListener((message) => {
            if (message.action === 'exportProgress') {
                this.setButtonLabel(`Exporting… ${message.progress}%`);
            }
        });

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
                (hostname.endsWith('mcas.ms') && hostname.includes('outlook'))
            );
        } catch (err) {
            isOutlookUrl = false;
        }

        if (!isOutlookUrl) {
            this.showEmptyState();
            return;
        }

        // On Outlook: check that the content script is ready
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

    async startExport() {
        const selectedTimezone = this.timezoneSelect.value;
        const calendarName = this.calendarNameInput.value.trim();
        const includeDeclined = this.includeDeclinedCheckbox.checked;
        const includeOOO = this.includeOOOCheckbox.checked;

        try {
            this.exportButton.disabled = true;
            this.hideError();
            this.setButtonLabel('Exporting…');

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            chrome.tabs.sendMessage(tab.id, {
                action: 'exportCalendar',
                timezone: selectedTimezone,
                calendarName: calendarName || null,
                includeDeclined: includeDeclined,
                includeOOO: includeOOO
            }, (response) => {
                this.exportButton.disabled = false;

                if (chrome.runtime.lastError) {
                    this.setButtonLabel('Export .ics');
                    this.showError('Failed to communicate with the page. Please refresh and try again.');
                    return;
                }

                if (response && response.success) {
                    // The event count lives in the button
                    const count = response.eventCount;
                    const label = count === 1 ? '1 event' : `${count} events`;
                    this.setButtonLabel(`Export .ics — ${label}`);
                } else {
                    this.setButtonLabel('Export .ics');
                    this.showError(response?.error || 'Export failed.');
                }
            });

        } catch (error) {
            this.exportButton.disabled = false;
            this.setButtonLabel('Export .ics');
            this.showError(`Export failed: ${error.message}`);
        }
    }

    setButtonLabel(text) {
        this.exportButton.textContent = text;
    }

    showError(message) {
        this.errorText.textContent = message;
        this.errorText.hidden = false;
    }

    hideError() {
        this.errorText.hidden = true;
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CalendarLiberatorPopup();
});
