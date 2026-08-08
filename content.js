// CalendarLiberator Content Script
// Main logic for interacting with Outlook calendar and extracting events

class CalendarLiberator {
    constructor() {
        this.originalView = null;
        this.allEvents = [];
        this.timezone = 'UTC';
        this.currentWeek = 0; // -1, 0, 1, 2 (past, current, next, next)
        this.includeDeclined = false;
        this.includeOOO = false;
        this.userEmail = null;
        this.userDisplayName = null;
        
        this.init();
    }

    init() {
        // Listen for messages from popup
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sendResponse);
            // Return true to keep the message port open for the async sendResponse
            // in handleMessage (otherwise Chrome closes it and the popup sees
            // "The message port closed before a response was received").
            return true;
        });
        
        console.log('[CalendarLiberator] Content script loaded and ready');
    }

    async handleMessage(message, sendResponse) {
        try {
            switch (message.action) {
                case 'ping':
                    sendResponse({ success: true, ready: true });
                    break;
                    
                case 'exportCalendar':
                    this.timezone = message.timezone;
                    this.calendarName = message.calendarName || null;
                    this.includeDeclined = message.includeDeclined || false;
                    this.includeOOO = message.includeOOO || false;
                    const result = await this.exportCalendar();
                    sendResponse(result);
                    break;
                    
                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async exportCalendar() {
        try {
            // Validate we're on an Outlook page
            if (!this.validateOutlookPage()) {
                throw new Error('This extension only works on Outlook calendar pages');
            }

            // Block user interactions with the page while scraping is in progress
            this.showExportOverlay();

            // Detect user email BEFORE any navigation (profile dropdown is available now)
            this.userEmail = await this.detectUserEmail();
            console.log('[CalendarLiberator] User email detection:', this.userEmail ? 'found' : 'not found',
                '| display name:', this.userDisplayName ? 'found' : 'not found');
            
            this.sendProgress('Saving current view...', 5);
            await this.saveCurrentView();
            
            this.sendProgress('Switching to weekly view...', 10);
            await this.switchToWeeklyView();
            
            this.sendProgress('Navigating to current week...', 15);
            await this.navigateToToday();
            
            // Reset events collection
            this.allEvents = [];
            
            // Calculate exact date range: 7 days back from today + today + 21 days forward = 28 days total
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            this.startDate = new Date(today);
            this.startDate.setDate(today.getDate() - 7);
            this.endDate = new Date(today);
            this.endDate.setDate(today.getDate() + 21);
            this.endDate.setHours(23, 59, 59, 999);
            
            console.log(`[CalendarLiberator] Target date range: ${this.startDate.toLocaleDateString()} to ${this.endDate.toLocaleDateString()} (28 days)`);
            
            // Collect events from 4 weeks with error recovery
            // Note: We collect 4 full weeks to ensure we capture all events in the 28-day window
            const weekTasks = [
                { name: 'past week', offset: -1, progress: [20, 30] },
                { name: 'current week', offset: 0, progress: [30, 45] },
                { name: 'next week', offset: 1, progress: [45, 60] },
                { name: 'second next week', offset: 2, progress: [60, 75] }
            ];
            
            // Go back one week first
            this.sendProgress('Going back one week...', 20);
            await this.navigatePreviousWeek();
            this.currentWeek = -1;
            
            for (const task of weekTasks) {
                try {
                    this.sendProgress(`Collecting events from ${task.name}...`, task.progress[0]);
                    
                    if (task.offset > this.currentWeek) {
                        // Move forward to reach target week
                        while (this.currentWeek < task.offset) {
                            await this.navigateNextWeek();
                            this.currentWeek++;
                        }
                    }
                    
                    await this.collectCurrentWeekEvents();
                    console.log(`[CalendarLiberator] Collected ${task.name}: ${this.allEvents.length} total events so far`);
                    this.sendProgress(`Completed ${task.name}`, task.progress[1]);
                    
                } catch (error) {
                    console.warn(`[CalendarLiberator] Error collecting ${task.name}:`, error.message);
                    // Continue with other weeks
                }
            }
            
            // Filter events to exact 28-day window (7 days back + 21 days forward from today)
            const originalCount = this.allEvents.length;
            this.allEvents = this.allEvents.filter(event => {
                const eventDate = this.parseEventDate(event);
                if (!eventDate) return false;
                return eventDate >= this.startDate && eventDate <= this.endDate;
            });
            
            const filteredCount = originalCount - this.allEvents.length;
            if (filteredCount > 0) {
                console.log(`[CalendarLiberator] Filtered out ${filteredCount} events outside 28-day window`)
            }
            console.log(`[CalendarLiberator] Final event count: ${this.allEvents.length} events within date range`);
            
            if (this.allEvents.length === 0) {
                throw new Error('No events found in the 28-day window. Please ensure you have events in your calendar and try again.');
            }
            
            this.sendProgress('Generating ICS file...', 85);
            const icsContent = this.generateICS();
            
            this.sendProgress('Downloading file...', 90);
            this.downloadICS(icsContent);
            
            this.sendProgress('Restoring original view...', 95);
            await this.restoreOriginalView();
            // Ensure the calendar is showing today's date after restore
            try {
                await this.navigateToToday();
            } catch (err) {
                // Non-fatal: if Today button can't be found or navigation fails, continue
                console.warn('Could not navigate to Today after restore:', err);
            }
            
            this.sendProgress('Export complete!', 100);
            
            return { 
                success: true, 
                eventCount: this.allEvents.length,
                message: `Successfully exported ${this.allEvents.length} events!`
            };
            
        } catch (error) {
            console.error('Export failed:', error);
            
            // Attempt to restore view even on failure
            try {
                await this.restoreOriginalView();
            } catch (restoreError) {
                console.warn('Failed to restore view after error:', restoreError);
            }
            
            return { 
                success: false, 
                error: error.message || 'Export failed for unknown reason'
            };
        } finally {
            this.hideExportOverlay();
        }
    }

    // Show a semi-transparent overlay that blocks clicks and other page
    // interactions while the export is running, and makes it visually clear
    // that the page is busy. Synthetic clicks issued by this content script
    // (view switching, week navigation) are unaffected. Progress feedback
    // lives in the popup, so the overlay carries no text. A 60-second safety
    // timeout removes the overlay even if the export hangs.
    showExportOverlay() {
        this.hideExportOverlay();

        const overlay = document.createElement('div');
        overlay.id = 'calendar-liberator-overlay';
        overlay.style.cssText = [
            'position:fixed',
            'inset:0',
            'z-index:2147483647',
            'background:rgba(128,128,128,0.25)',
            'cursor:wait'
        ].join(';');

        document.body.appendChild(overlay);

        this.overlayTimeout = setTimeout(() => {
            console.warn('[CalendarLiberator] Export overlay auto-removed after 60s timeout');
            this.hideExportOverlay();
        }, 60000);
    }

    hideExportOverlay() {
        if (this.overlayTimeout) {
            clearTimeout(this.overlayTimeout);
            this.overlayTimeout = null;
        }
        document.getElementById('calendar-liberator-overlay')?.remove();
    }

    validateOutlookPage() {
        const url = window.location.href;
        let isOutlookPage = false;

        try {
            const { hostname } = new URL(url);
            isOutlookPage = (
                hostname.includes('outlook.office.com') ||
                hostname.endsWith('office.com') ||
                hostname.includes('outlook.com') ||
                (hostname.endsWith('mcas.ms') && hostname.includes('outlook'))
            );
        } catch (err) {
            isOutlookPage = false;
        }
        
        if (!isOutlookPage) {
            return false;
        }
        
        // Enforce strict language requirement: must be English locale
        const pageLanguage = document.documentElement.lang ||
                              document.querySelector('html')?.getAttribute('lang') ||
                              '';

        if (!pageLanguage.toLowerCase().startsWith('en')) {
            throw new Error(`Language Error: Calendar Liberator requires the Outlook interface to be set to English. Detected language: "${pageLanguage || 'unknown'}". Please change your Outlook language to English in Settings and try again.`);
        }

        // Accept either 12-hour or 24-hour time formats. Time parsing will handle AM/PM or 24-hour strings.
        
        console.log('CalendarLiberator: Validation passed - Compatible Outlook interface detected');
        return true;
    }

    sendProgress(status, progress) {
        chrome.runtime.sendMessage({
            action: 'exportProgress',
            status,
            progress
        });
    }

    async saveCurrentView() {
        // Find currently active view button
        const viewButtons = document.querySelectorAll('button[aria-pressed]');
        
        for (const button of viewButtons) {
            if (button.getAttribute('aria-pressed') === 'true') {
                this.originalView = {
                    element: button,
                    label: button.getAttribute('aria-label'),
                    uniqueId: button.getAttribute('data-unique-id')
                };
                break;
            }
        }
        
        // Fallback: look for checked buttons
        if (!this.originalView) {
            const checkedButton = document.querySelector('button.is-checked, button[aria-pressed="true"]');
            if (checkedButton) {
                this.originalView = {
                    element: checkedButton,
                    label: checkedButton.getAttribute('aria-label'),
                    uniqueId: checkedButton.getAttribute('data-unique-id')
                };
            }
        }
        
        console.log('[CalendarLiberator] Saved original view:', this.originalView?.label);
    }

    async switchToWeeklyView() {
        // Find week view button using multiple selectors for robustness
        const weekButton = this.findWeekButton();
        
        if (!weekButton) {
            throw new Error('Could not find weekly view button');
        }
        
        if (weekButton.getAttribute('aria-pressed') !== 'true') {
            weekButton.click();
            await this.waitForViewChange();
        }
    }

    findWeekButton() {
        // Prefer an exact aria-label match; Outlook has Day / Work week / Week / Month toggles.
        const selectors = [
            'button[aria-label="Week"]',
            'button[aria-label*="Week"]:not([aria-label*="Work week"]):not([aria-label*="work week"])',
            'button[title="Week"]',
            'button[title*="Week"]:not([title*="Work week"]):not([title*="work week"])'
        ];

        for (const selector of selectors) {
            const button = document.querySelector(selector);
            if (button && !/work\s*week/i.test(button.getAttribute('aria-label') || '')) {
                return button;
            }
        }

        // Fallback: manual search for a toggle whose label is exactly "Week".
        return Array.from(document.querySelectorAll('button')).find(button => {
            const label = (button.getAttribute('aria-label') || '').trim();
            return label === 'Week';
        });
    }

    async navigateToToday() {
        const todayButton = this.findTodayButton();

        if (!todayButton) {
            throw new Error('Could not find Today button');
        }

        todayButton.click();
        await this.waitForNavigation();
    }

    findTodayButton() {
        // The Today button carries the literal text "Go to today" and a CalendarToday icon.
        const selectors = [
            'button[aria-label*="Go to today"]',
            'button[title*="Go to today"]',
            'button[data-icon-name="CalendarTodayRegular"]',
            'button i[data-icon-name="CalendarTodayRegular"]'
        ];

        for (const selector of selectors) {
            const button = document.querySelector(selector);
            if (button) {
                // If the selector matched the icon, return the closest button ancestor.
                return button.closest ? button.closest('button') : button;
            }
        }

        // Fallback: search by text content, but reject anything that looks like a command button.
        return Array.from(document.querySelectorAll('button')).find(button => {
            const text = (button.textContent || '').trim().toLowerCase();
            const label = (button.getAttribute('aria-label') || '').toLowerCase();
            return (text === 'today' || label.includes('go to today')) &&
                   !label.includes('new') && !text.includes('new');
        });
    }

    async navigatePreviousWeek() {
        const prevButton = this.findPreviousButton();

        if (!prevButton) {
            throw new Error('Could not find previous week button');
        }

        prevButton.click();
        await this.waitForNavigation();
    }

    async navigateNextWeek() {
        const nextButton = this.findNextButton();

        if (!nextButton) {
            throw new Error('Could not find next week button');
        }

        nextButton.click();
        await this.waitForNavigation();
    }

    findDateRangeButton() {
        // This is the ONLY fui-MenuButton in the calendar navbar that mentions
        // "Jump to a specific date". Never match the "New options" menu button.
        return document.querySelector('button[aria-label*="Jump to a specific date"]');
    }

    findCalendarNavButtons() {
        const dateRangeButton = this.findDateRangeButton();
        if (!dateRangeButton) return null;

        // The prev/next arrow buttons live in the fui-ToolbarGroup immediately before
        // the date-range button inside the same calendar toolbar.
        let group = dateRangeButton.previousElementSibling;
        while (group && !group.classList.contains('fui-ToolbarGroup')) {
            group = group.previousElementSibling;
        }

        if (group) {
            const buttons = Array.from(group.querySelectorAll('button'));
            if (buttons.length >= 2) {
                return { prev: buttons[0], next: buttons[1] };
            }
        }

        return null;
    }

    findButtonByIconGlyphs(glyphs) {
        // Outlook's prev/next arrows are icon-only; match by the actual icon glyph codepoints.
        const glyphSet = new Set(glyphs);
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(button => {
            const iconEls = button.querySelectorAll('i.fui-Icon-font, i.ms-Icon');
            for (const icon of iconEls) {
                const text = (icon.textContent || '').trim();
                if (glyphSet.has(text)) return true;
            }
            return false;
        });
    }

    findPreviousButton() {
        // Strategy A: date-range toolbar position.
        const navButtons = this.findCalendarNavButtons();
        if (navButtons && navButtons.prev) return navButtons.prev;

        // Strategy B: icon glyphs used by Outlook's "previous" chevron (filled + regular).
        const glyphButton = this.findButtonByIconGlyphs(['', '']);
        if (glyphButton) return glyphButton;

        // Strategy C: legacy Outlook selectors.
        const legacy = ['button[aria-label*="Go to previous"]', 'button[aria-label*="previous week"]', 'button[title*="previous"]']
            .map(selector => document.querySelector(selector))
            .find(button => button !== null);
        if (legacy) return legacy;

        return null;
    }

    findNextButton() {
        const navButtons = this.findCalendarNavButtons();
        if (navButtons && navButtons.next) return navButtons.next;

        const glyphButton = this.findButtonByIconGlyphs(['', '']);
        if (glyphButton) return glyphButton;

        const legacy = ['button[aria-label*="Go to next"]', 'button[aria-label*="next week"]', 'button[title*="next"]']
            .map(selector => document.querySelector(selector))
            .find(button => button !== null);
        if (legacy) return legacy;

        return null;
    }

    async collectCurrentWeekEvents() {
        try {
            // Wait for calendar to load
            await this.waitForCalendarLoad();
            
            // Get current date range for context
            const dateRange = this.getCurrentDateRange();
            
            // Extract all events from current view
            const weekEvents = this.extractEventsFromCurrentView();
            
            // Add to total collection with deduplication
            for (const event of weekEvents) {
                if (!this.isDuplicateEvent(event)) {
                    this.allEvents.push(event);
                }
            }
            
            console.log(`[CalendarLiberator] Week complete: ${weekEvents.length} events found (${this.allEvents.length} total)`);
            
        } catch (error) {
            console.warn('[CalendarLiberator] Error collecting events for current week:', error.message);
            // Don't throw - continue with partial data
        }
    }

    isDuplicateEvent(newEvent) {
        return this.allEvents.some(existingEvent => {
            return existingEvent.title === newEvent.title &&
                   existingEvent.date === newEvent.date &&
                   existingEvent.startTime === newEvent.startTime &&
                   existingEvent.organizer === newEvent.organizer;
        });
    }

    getCurrentDateRange() {
        const selectors = [
            '.zytMo', '.pYMRV span', '[class*="dateRange"]',
            'button[aria-label*="week"] .zytMo', '[role="toolbar"] button span', '.xW7lm span'
        ];
        
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element?.textContent?.trim()) {
                return element.textContent.trim();
            }
        }
        
        return 'Unknown date range';
    }

    extractEventsFromCurrentView() {
        const events = [];
        
        try {
            // Find all event elements with multiple selectors
            const eventSelectors = [
                '[data-calitemid]',
                '[class*="calendar-event"]',
                '[role="button"][aria-label*="AM"], [role="button"][aria-label*="PM"]',
                '[role="button"][aria-label*="all day"]'
            ];
            
            let eventElements = [];
            for (const selector of eventSelectors) {
                try {
                    const elements = document.querySelectorAll(selector);
                    eventElements.push(...elements);
                } catch (error) {
                    console.warn(`Event selector failed: ${selector}`, error);
                }
            }
            
            // Remove duplicates
            eventElements = [...new Set(eventElements)];
            
            for (const eventEl of eventElements) {
                try {
                    const eventData = this.parseEventElement(eventEl);
                    if (eventData && eventData.title) {
                        events.push(eventData);
                    }
                } catch (error) {
                    console.warn('[CalendarLiberator] Failed to parse event:', error.message);
                }
            }
            
        } catch (error) {
            console.error('[CalendarLiberator] Error extracting events from view:', error);
        }
        
        console.log(`[CalendarLiberator] Parsed ${events.length} events from current view`);
        return events;
    }

    parseEventElement(eventElement) {
        // Filter out selected/highlighted cells that aren't real events
        // These are calendar selection boxes without actual event data
        if (eventElement.classList && eventElement.classList.contains('calendar-SelectionStyles-resizeBoxParent')) {
            const buttonElement = eventElement.querySelector('[role="button"]');
            if (buttonElement) {
                const ariaLabel = buttonElement.getAttribute('aria-label') || '';
                // If aria-label is empty or very short, it's likely a selected cell, not an event
                if (!ariaLabel || ariaLabel.length < 10) {
                    return null;
                }
            }
        }

        // The passed element may be the clickable button itself, or an ancestor/container.
        // Handle both cases: try to find a child [role="button"], else use the element itself,
        // or the nearest ancestor/descendant that carries the aria attributes.
        let buttonElement = null;
        try {
            buttonElement = eventElement.querySelector && eventElement.querySelector('[role="button"]');
        } catch (e) {
            buttonElement = null;
        }

        if (!buttonElement) {
            // If the eventElement itself is the button
            if (eventElement.getAttribute && eventElement.getAttribute('role') === 'button') {
                buttonElement = eventElement;
            } else if (eventElement.closest) {
                // Look for the nearest button descendant/ancestor as a fallback
                const descendant = eventElement.querySelector && eventElement.querySelector('[role="button"]');
                if (descendant) buttonElement = descendant;
                else buttonElement = eventElement.closest('[role="button"]');
            }
        }

        if (!buttonElement) return null;

        const ariaLabel = buttonElement.getAttribute('aria-label') || '';
        const title = buttonElement.getAttribute('title') || '';
        
        // Filter out empty events or time-only labels (e.g., "12:00 PM to 12:30 PM")
        // These are selected calendar cells, not actual events
        const timeOnlyPattern = /^\d{1,2}:\d{2}\s*(?:AM|PM)\s+to\s+\d{1,2}:\d{2}\s*(?:AM|PM)$/i;
        if (!ariaLabel || ariaLabel.length < 15 || timeOnlyPattern.test(ariaLabel.trim())) {
            return null;
        }
        
        // Check for declined events (skip unless user opted in)
        // Outlook uses "Declined:" prefix for declined events and "Canceled event" prefix for canceled ones
        const ariaLabelLower = ariaLabel.toLowerCase();
        const titleLower = title.toLowerCase();
        const isDeclined = ariaLabelLower.includes('declined:') ||
                          titleLower.includes('declined:') ||
                          /^canceled\s+event/i.test(ariaLabel) ||
                          /^canceled\s+event/i.test(title);
        if (isDeclined && !this.includeDeclined) {
            return null;
        }

        // Check for out-of-office events (skip unless user opted in)
        const ariaLower = ariaLabelLower;
        const isOOO = ariaLower.includes('out of office') || 
                     titleLower.includes('out of office') ||
                     /\booo\b/.test(ariaLower) || // Match "ooo" as whole word
                     /\booo\b/.test(titleLower) ||
                     ariaLower.startsWith('ooo ') || // Match "OOO " at start
                     ariaLower.startsWith('ooo-') || // Match "OOO-" at start
                     titleLower.startsWith('ooo ') ||
                     titleLower.startsWith('ooo-');
        if (isOOO && !this.includeOOO) {
            console.log('[CalendarLiberator] Filtering out OOO event:', ariaLabel.substring(0, 60));
            return null;
        }
        
        // Parse aria-label for comprehensive event data
    let eventData = this.parseEventFromAriaLabel(ariaLabel);
        // If we couldn't parse a structured aria-label, build a fallback event data
        if (!eventData) {
            // Try to recover a title from the button title attribute, aria-label, or element text
            const raw = (title || ariaLabel || (eventElement.textContent || '')).trim();
            let recovered = raw.split('\n')[0].trim();
            if (recovered.includes(', ')) {
                recovered = recovered.split(', ')[0].trim();
            }
            // Remove trailing time fragments like "4:00 PM" or "16:00"
            recovered = recovered.replace(/\s+\d{1,2}:\d{2}\s*(?:AM|PM)?/i, '').trim();

            eventData = {
                title: recovered || 'No Title',
                startTime: null,
                endTime: null,
                date: null,
                organizer: null,
                status: null,
                isRecurring: false,
                recurrenceType: null,
                location: null,
                allDay: false
            };

            console.warn(`CalendarLiberator: Could not parse aria-label, recovered fallback title \"${eventData.title}\" for element`, { calItemId: eventElement.getAttribute('data-calitemid') });
        }
        
        // Final validation: reject events with time-only titles (selected cells)
        if (eventData && eventData.title) {
            const timeOnlyPattern = /^\d{1,2}:\d{2}\s*(?:AM|PM)\s+to\s+\d{1,2}:\d{2}\s*(?:AM|PM)$/i;
            if (timeOnlyPattern.test(eventData.title.trim())) {
                console.log('[CalendarLiberator] Filtering out empty/time-only event:', eventData.title);
                return null;
            }
        }
        
        // Enhance with additional details from title
        if (title) {
            const titleLines = title.split('\n').map(line => line.trim()).filter(line => line);
            if (titleLines.length > 1) {
                eventData.location = titleLines[1];
            }
        }
        
        // Extract recurrence information
        const recurrenceIcon = eventElement.querySelector('[data-icon-name*="ArrowRepeat"]');
        if (recurrenceIcon) {
            const recurrenceLabel = recurrenceIcon.getAttribute('aria-label') || '';
            eventData.isRecurring = true;
            eventData.recurrenceType = recurrenceLabel.includes('modified') ? 'exception' : 'recurring';
        }
        
        // Extract organizer and additional details
        const organizerElement = eventElement.querySelector('.Cns89, .ErL8v');
        if (organizerElement) {
            const organizerText = organizerElement.textContent.trim();
            // Only set organizer if it's valid and not empty/null
            if (!eventData.organizer && organizerText && 
                organizerText.toLowerCase() !== 'null' && 
                organizerText !== '(null)') {
                eventData.organizer = organizerText;
            }
        }

        // Attach stable calendar item ID
        const calNode = eventElement.closest('[data-calitemid]') || eventElement;
        const calItemId = calNode?.getAttribute?.('data-calitemid') || calNode?.dataset?.calitemid;
        if (calItemId) eventData.calItemId = calItemId;
        
        return eventData;
    }

    parseEventFromAriaLabel(ariaLabel) {
        // Example: "Team Meeting, 4:00 PM to 4:30 PM, Monday, October 6, 2025, By Smith John, Busy, Recurring event"
        
        // Note: Declined and OOO filtering is now handled in parseEventElement before calling this method
        // This method focuses on parsing the structure of the aria-label
        
        const parts = ariaLabel.split(', ');
        if (parts.length < 3) return null;
        
        // Extract title
        let title = parts[0].trim();
        
        const eventData = {
            title: title,
            startTime: null,
            endTime: null,
            date: null,
            organizer: null,
            status: null,
            isRecurring: false,
            recurrenceType: null,
            location: null,
            allDay: false
        };
        
        // Parse time ranges. Support both 12-hour (AM/PM) and 24-hour formats
        const timePatterns = [
            /(\d{1,2}:\d{2}\s*(?:AM|PM))\s*to\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i,
            /(\d{1,2}:\d{2})\s*to\s*(\d{1,2}:\d{2})/i
        ];

        let matched = false;
        for (const pat of timePatterns) {
            const m = ariaLabel.match(pat);
            if (m) {
                eventData.startTime = m[1].trim();
                eventData.endTime = m[2].trim();
                matched = true;
                break;
            }
        }

        if (!matched) {
            if (ariaLabel.toLowerCase().includes('all day')) {
                eventData.allDay = true;
            }
        }
        
        // Parse date (e.g., "Monday, October 6, 2025" or date ranges)
        const datePattern = /(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i;
        const dateMatch = ariaLabel.match(datePattern);
        if (dateMatch) {
            eventData.date = dateMatch[1].trim();
        }
        
        // For all-day events, check if there's a date range in the aria-label
        if (eventData.allDay) {
            const dateRangePattern = /(\w+,?\s*[A-Za-z]+\s+\d{1,2},?\s+\d{4})\s+to\s+(\w+,?\s*[A-Za-z]+\s+\d{1,2},?\s+\d{4})/i;
            const rangeMatch = ariaLabel.match(dateRangePattern);
            if (rangeMatch) {
                eventData.date = rangeMatch[1].trim(); // Start date
                eventData.endDate = rangeMatch[2].trim(); // End date
            }
        }
        
        // Parse organizer (e.g., "By Smith John")
        const organizerPattern = /By\s+([^,]+)/i;
        const organizerMatch = ariaLabel.match(organizerPattern);
        if (organizerMatch) {
            const organizer = organizerMatch[1].trim();
            // Only set if it's a valid name (not null, not empty, and doesn't contain "null")
            if (organizer && 
                organizer.toLowerCase() !== 'null' && 
                organizer !== '(null)' &&
                !organizer.toLowerCase().includes('null')) {
                eventData.organizer = organizer;
            }
        }
        
        // Parse status
        if (ariaLabel.includes('Busy')) eventData.status = 'BUSY';
        else if (ariaLabel.includes('Tentative')) eventData.status = 'TENTATIVE';
        else if (ariaLabel.includes('Free')) eventData.status = 'FREE';
        else eventData.status = 'BUSY'; // Default
        
        return eventData;
    }

    parseEventDate(event) {
        // Parse event date from the event object for filtering
        // Events should have date/time info in their structure
        try {
            if (event.date) {
                const date = new Date(event.date);
                if (!isNaN(date.getTime())) return date;
            }
            
            // Try to parse from startTime if available
            if (event.startTime) {
                const date = new Date(event.startTime);
                if (!isNaN(date.getTime())) return date;
            }
            
            // For all-day events or events with just a date string
            if (event.dateStr) {
                const date = new Date(event.dateStr);
                if (!isNaN(date.getTime())) return date;
            }
            
            return null;
        } catch (error) {
            console.warn('[CalendarLiberator] Could not parse event date:', error.message);
            return null;
        }
    }

    generateICS() {
        // Load ICS generator if not already loaded
        if (typeof ICSGenerator === 'undefined') {
            throw new Error('ICS Generator not loaded');
        }
        
        // userEmail was detected early in exportCalendar() before any navigation;
        // fall back to the display name ("John Doe - Outlook") if no email was found
        const accountIdentity = this.userEmail || this.userDisplayName || null;
        const icsGenerator = new ICSGenerator(this.timezone, accountIdentity, this.calendarName || null);
        return icsGenerator.generate(this.allEvents);
    }

    async detectUserEmail() {
        const emailPattern = /([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/;
        const extractEmail = (text) => {
            if (!text) return null;
            const match = String(text).match(emailPattern);
            return match ? match[1].toLowerCase() : null;
        };

        // The meControl trigger is always in the DOM and carries the account
        // display name. Classic Outlook: aria-label "Account manager for John Doe".
        // New Outlook (Monarch): #owa-me-control-container button, whose
        // aria-label IS the display name ("John Doe"). No click needed either
        // way — capture it upfront as a fallback name.
        const meTrigger = document.querySelector(
            '#mectrl_main_trigger, ' +
            'button[id^="mectrl"][id$="_trigger"], ' +
            'button[id*="mectrl"], ' +
            'button[class*="mectrl"], ' +
            '#owa-me-control-container button, ' +
            '[aria-label^="Account manager for"]'
        );
        if (meTrigger) {
            const label = meTrigger.getAttribute('aria-label') || meTrigger.getAttribute('title') || '';
            const nameMatch = label.match(/^Account manager for\s*(.+)$/i);
            const isNewOutlookMeControl = !!meTrigger.closest('#owa-me-control-container');
            const name = nameMatch
                ? nameMatch[1].trim()
                : (isNewOutlookMeControl ? label.trim() : '');
            if (name && !name.includes('@')) {
                this.userDisplayName = name;
                console.log('[CalendarLiberator] Display name found in meControl trigger:', this.userDisplayName);
            }
        } else {
            console.log('[CalendarLiberator] No meControl account trigger found in the DOM');
        }

        // Strategy A: #mectrl_currentAccount_secondary already in DOM (dropdown already open)
        const immediate = document.querySelector('#mectrl_currentAccount_secondary');
        if (immediate) {
            const email = extractEmail(immediate.textContent);
            if (email) {
                console.log('[CalendarLiberator] Email found in existing dropdown element');
                return email;
            }
        }

        // Strategy B: page title ("Calendar - user@company.com - Outlook")
        const titleEmail = extractEmail(document.title);
        if (titleEmail) {
            console.log('[CalendarLiberator] Email found in page title');
            return titleEmail;
        }

        // Strategy C: login_hint in any always-present hrefs
        for (const link of document.querySelectorAll('a[href*="login_hint"]')) {
            try {
                const decoded = decodeURIComponent(link.getAttribute('href') || '');
                const m = decoded.match(/login_hint[=:]+([^&\s"']+)/i);
                if (m) {
                    const email = extractEmail(decodeURIComponent(m[1]));
                    if (email) {
                        console.log('[CalendarLiberator] Email found in login_hint href');
                        return email;
                    }
                }
            } catch (e) { /* ignore */ }
        }

        // Strategy D: scan inline <script> contents for boot-config email markers.
        // Content scripts run in an isolated world, so window._owaSeed and friends
        // are NOT accessible from here — but the same session data is embedded
        // verbatim in the page's script tags, which we can read from the DOM.
        try {
            const markerPattern = /"(?:UserEmailAddress|userEmailAddress|smtpAddress|primarySmtpAddress|userPrincipalName|UserPrincipalName|emailAddress|EmailAddress|mail)"\s*:\s*"([^"@\s]+@[^"@\s]+)"/;
            for (const script of document.scripts) {
                const m = (script.textContent || '').match(markerPattern);
                const email = m && extractEmail(m[1]);
                if (email) {
                    console.log('[CalendarLiberator] Email found in inline script boot data');
                    return email;
                }
            }
        } catch (e) { /* ignore */ }

        // Strategy E: open the profile dropdown, read the email, close it.
        // The account panel renders only on click, so we snapshot every email
        // already present in the page (calendar events can show other people's
        // addresses) and then wait for a NEW one to appear: that is the user's.
        try {
            // Target the exact meControl triggers (classic Outlook ids and the
            // new Outlook me-control container). Avoid generic selectors like
            // [aria-label*="Profile"]: they can match links whose click
            // navigates away from the page.
            const profileButton = meTrigger || document.querySelector(
                '#owa-me-control-container button, ' +
                '#O365_MainLink_MePhoto, ' +
                'button[id*="mectrl"], ' +
                'button[class*="mectrl"]'
            );

            if (profileButton) {
                console.log('[CalendarLiberator] Opening profile dropdown to detect email...');
                const globalEmailPattern = new RegExp(emailPattern.source, 'g');
                const emailsBeforeClick = new Set(
                    (document.body.textContent.match(globalEmailPattern) || [])
                        .map(e => e.toLowerCase())
                );
                profileButton.click();

                // Wait up to 2 s for the email to appear, either in
                // #mectrl_currentAccount_secondary or in a login_hint href
                // (e.g. the "View account" link rendered inside the dropdown)
                const email = await new Promise((resolve) => {
                    const maxWait = 2000;
                    const interval = 100;
                    let waited = 0;
                    const findEmailInDropdown = () => {
                        const el = document.querySelector('#mectrl_currentAccount_secondary');
                        if (el) {
                            const found = extractEmail(el.textContent);
                            if (found) return found;
                        }
                        for (const link of document.querySelectorAll('#mectrl_main_body a[href*="login_hint"]')) {
                            try {
                                const decoded = decodeURIComponent(link.getAttribute('href') || '');
                                const m = decoded.match(/login_hint[=:]+([^&\s"']+)/i);
                                const found = m && extractEmail(decodeURIComponent(m[1]));
                                if (found) return found;
                            } catch (e) { /* ignore */ }
                        }
                        // Scan every meControl element, classic or new Outlook
                        // (the panel only contains the user's own accounts)
                        for (const container of document.querySelectorAll('[id*="mectrl"], #owa-me-control-container')) {
                            const found = extractEmail(container.textContent);
                            if (found) return found;
                        }
                        // Last resort: any email that was NOT in the page before
                        // the click — rendered by the account panel just opened
                        const currentEmails = document.body.textContent.match(globalEmailPattern) || [];
                        for (const candidate of currentEmails) {
                            const lower = candidate.toLowerCase();
                            if (!emailsBeforeClick.has(lower)) return lower;
                        }
                        return null;
                    };
                    const poll = setInterval(() => {
                        const found = findEmailInDropdown();
                        if (found) {
                            clearInterval(poll);
                            resolve(found);
                            return;
                        }
                        waited += interval;
                        if (waited >= maxWait) {
                            clearInterval(poll);
                            resolve(null);
                        }
                    }, interval);
                });

                // Close the dropdown by clicking the trigger again (toggle),
                // falling back to a synthetic click elsewhere
                try {
                    if (profileButton.getAttribute('aria-expanded') === 'true') {
                        profileButton.click();
                    } else {
                        document.body.click();
                    }
                } catch (e) { /* ignore */ }

                if (email) {
                    console.log('[CalendarLiberator] Email found via profile dropdown');
                    return email;
                }
            }
        } catch (e) {
            console.log('[CalendarLiberator] Profile dropdown click strategy failed:', e.message);
        }

        // The account email/name only feeds the exported calendar name:
        // if it is not found, log quietly and never surface it as an error
        console.log('[CalendarLiberator] Could not detect user email');
        return null;
    }

    downloadICS(icsContent) {
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const now = new Date();
        const dateString = now.toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
        const filename = `outlook-calendar-${dateString}.ics`;
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }

    async restoreOriginalView() {
        if (this.originalView && this.originalView.element) {
            try {
                // Check if the element still exists
                if (document.contains(this.originalView.element)) {
                    this.originalView.element.click();
                    await this.waitForViewChange();
                    console.log('Successfully restored original view');
                } else {
                    // Try to find the view button by label
                    const viewButtons = document.querySelectorAll('button[aria-pressed]');
                    for (const button of viewButtons) {
                        if (button.getAttribute('aria-label') === this.originalView.label) {
                            button.click();
                            await this.waitForViewChange();
                            console.log('Restored view by label match');
                            return;
                        }
                    }
                    console.warn('Could not find original view button to restore');
                }
            } catch (error) {
                console.warn('Could not restore original view:', error);
            }
        } else {
            console.log('No original view to restore');
        }
    }

    async waitForViewChange() {
        await this.sleep(1000); // Wait for UI to update
    }

    async waitForNavigation() {
        await this.sleep(1500); // Wait for navigation to complete
    }

    async waitForCalendarLoad() {
        await this.sleep(1000); // Wait for calendar events to render
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the content script
const calendarLiberator = new CalendarLiberator();