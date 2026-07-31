// CalendarLiberator Popup Script
// Handles UI interactions and communication with content script

class CalendarLiberatorPopup {
    constructor() {
        this.exportButton = document.getElementById('exportButton');
        this.calendarNameInput = document.getElementById('calendarName');
        this.timezoneSelect = document.getElementById('timezone');
        this.includeDeclinedCheckbox = document.getElementById('includeDeclined');
        this.includeOOOCheckbox = document.getElementById('includeOOO');
        this.statusSection = document.getElementById('status');
        this.statusText = document.querySelector('.status-text');
        this.progressBar = document.querySelector('.progress-fill');
        
        this.init();
    }

    init() {
        // Set up event listeners
        this.exportButton.addEventListener('click', () => this.startExport());

        // Listen for progress updates from the content script (registered once)
        chrome.runtime.onMessage.addListener((message) => {
            if (message.action === 'exportProgress') {
                this.updateStatus(message.status, 'loading');
                this.setProgress(message.progress);
            }
        });

        // Detect user's timezone and set as default
        this.detectUserTimezone();
        
        // Check if we're on an Outlook page
        this.checkOutlookPage();
    }

    detectUserTimezone() {
        try {
            // Get browser's timezone offset in hours
            const offset = new Date().getTimezoneOffset();
            const utcOffset = -offset / 60; // Convert to hours (negative because getTimezoneOffset is reversed)
            
            // Build UTC string (e.g., "UTC+1", "UTC-5")
            let utcString;
            if (utcOffset >= 0) {
                // Handle whole numbers and round half-hours to nearest
                const roundedOffset = Math.round(utcOffset);
                utcString = `UTC+${roundedOffset}`;
            } else {
                const roundedOffset = Math.round(utcOffset);
                utcString = `UTC${roundedOffset}`; // negative sign already included
            }
            
            // Try to find matching option in the dropdown
            const matchingOption = Array.from(this.timezoneSelect.options)
                .find(option => option.value === utcString);
                
            if (matchingOption) {
                matchingOption.selected = true;
                console.log('[CalendarLiberator] Auto-detected timezone:', utcString);
            } else {
                console.warn('[CalendarLiberator] Could not find matching option for', utcString, '- using default UTC+0');
            }
        } catch (error) {
            console.warn('[CalendarLiberator] Could not detect timezone, using UTC+0 default:', error.message);
        }
    }

    async checkOutlookPage() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            const isOutlookUrl = (() => {
                try {
                    const { hostname } = new URL(tab.url);
                    return (
                        hostname.includes('outlook.office.com') ||
                        hostname.endsWith('office.com') ||
                        hostname.includes('outlook.com') ||
                        (hostname.endsWith('mcas.ms') && hostname.includes('outlook'))
                    );
                } catch (err) {
                    return false;
                }
            })();

            if (!isOutlookUrl) {
                this.showError('Please navigate to your Outlook calendar first');
                this.exportButton.disabled = true;
                return;
            }
            
            // Check if content script is ready
            chrome.tabs.sendMessage(tab.id, { action: 'ping' }, (response) => {
                if (chrome.runtime.lastError) {
                    this.showError('Extension not ready.\nPlease refresh the Outlook page.');
                    this.exportButton.disabled = true;
                } else {
                    this.updateStatus('Ready to export your calendar', 'ready');
                }
            });
            
        } catch (error) {
            this.showError('Cannot access current tab. Please refresh and try again.');
            this.exportButton.disabled = true;
        }
    }

    async startExport() {
        const selectedTimezone = this.timezoneSelect.value;
        const calendarName = this.calendarNameInput.value.trim();
        const includeDeclined = this.includeDeclinedCheckbox.checked;
        const includeOOO = this.includeOOOCheckbox.checked;
        
        try {
            this.exportButton.disabled = true;
            this.updateStatus('Starting calendar export...', 'loading');
            this.setProgress(0);

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Send export command to content script
            chrome.tabs.sendMessage(tab.id, {
                action: 'exportCalendar',
                timezone: selectedTimezone,
                calendarName: calendarName || null,
                includeDeclined: includeDeclined,
                includeOOO: includeOOO
            }, (response) => {
                if (chrome.runtime.lastError) {
                    this.handleExportError('Failed to communicate with page. Please refresh and try again.');
                    return;
                }
                
                if (response && response.success) {
                    this.handleExportSuccess(response);
                } else {
                    this.handleExportError(response?.error || 'Export failed for unknown reason');
                }
            });

        } catch (error) {
            this.handleExportError(`Export failed: ${error.message}`);
        }
    }

    handleExportSuccess(response) {
        this.updateStatus(`✅ Calendar exported! ${response.eventCount} events saved`, 'success');
        this.setProgress(100);
        
        // Re-enable button after delay
        setTimeout(() => {
            this.exportButton.disabled = false;
            this.updateStatus('Ready to export your calendar', 'ready');
            this.setProgress(0);
        }, 3000);
    }

    handleExportError(errorMessage) {
        this.showError(errorMessage);
        this.exportButton.disabled = false;
        this.setProgress(0);
    }

    updateStatus(text, type = 'ready') {
        // Render as plain text with line breaks (no innerHTML: the text may
        // contain page-derived content, e.g. the detected page language)
        this.statusText.textContent = '';
        String(text).split('\n').forEach((line, index) => {
            if (index > 0) this.statusText.appendChild(document.createElement('br'));
            this.statusText.appendChild(document.createTextNode(line));
        });
        this.statusSection.className = `status-section ${type}`;
    }

    showError(message) {
        this.updateStatus(`❌ ${message}`, 'error');
    }

    setProgress(percentage) {
        this.progressBar.style.width = `${percentage}%`;
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CalendarLiberatorPopup();
});