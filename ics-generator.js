// ICS Generator Class
// Handles conversion of calendar events to ICS format (RFC 5545).
//
// Timezone strategy: the popup passes the IANA timezone (e.g. "Europe/Rome")
// that matches the times DISPLAYED in Outlook, auto-detected from the browser.
// A real zone carries its own DST rules, so every event time is converted to
// UTC via the browser's Intl API with the correct offset for its own date.
// (A bare "UTC+1" offset is ambiguous — Rome and London can both be UTC+1
// depending on the season — and mapping it to a representative zone caused
// one-hour shifts for users in a different zone with the same offset.)

class ICSGenerator {
    constructor(timezone = 'UTC', userEmail = null, calendarName = null) {
        this.timezone = timezone;
        this.userEmail = userEmail;
        this.calendarName = calendarName;
    }

    generate(events) {
        // Set calendar name: user-supplied > email-based > default
        const calendarName = this.calendarName
            ? this.calendarName
            : this.userEmail
                ? `${this.userEmail} - Outlook`
                : 'Outlook Calendar Export';

        const lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Calendar Liberator//Calendar Liberator 1.1//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            `X-WR-CALNAME:${this.escapeText(calendarName)}`,
            `X-WR-CALDESC:Exported from Outlook Web Calendar using Calendar Liberator`,
            `X-WR-TIMEZONE:${this.getIANATimezone()}`
        ];

        // Add events
        for (const event of events) {
            lines.push(...this.generateEventLines(event));
        }

        lines.push('END:VCALENDAR');

        return lines.join('\r\n');
    }

    generateEventLines(event) {
        const lines = ['BEGIN:VEVENT'];
        
        // Generate unique ID
        const uid = this.generateUID(event);
        lines.push(`UID:${uid}`);
        
        // Add created and modified timestamps (absolute UTC)
        const now = this.formatDateTimeUTC(new Date());
        lines.push(`DTSTAMP:${now}`);
        lines.push(`CREATED:${now}`);
        lines.push(`LAST-MODIFIED:${now}`);
        
        // Add event title
        lines.push(`SUMMARY:${this.escapeText(event.title)}`);
        
        // Add event times
        if (event.allDay) {
            const dateOnly = this.parseDate(event.date);
            if (dateOnly) {
                // Check if this event has an explicit end date from the parsing
                let endDate = dateOnly;
                if (event.endDate) {
                    endDate = this.parseDate(event.endDate);
                } else {
                    // Check if this is a multi-day event from the location field
                    endDate = this.parseEndDateFromLocation(event.location) || dateOnly;
                }
                
                lines.push(`DTSTART;VALUE=DATE:${this.formatDateOnly(dateOnly)}`);
                
                // For multi-day events, end date should be the day AFTER the last day
                const actualEndDate = new Date(endDate);
                actualEndDate.setDate(actualEndDate.getDate() + 1);
                lines.push(`DTEND;VALUE=DATE:${this.formatDateOnly(actualEndDate)}`);
            }
        } else {
            const day = this.parseDate(event.date);
            const start = this.parseTimeComponents(event.startTime);
            const end = this.parseTimeComponents(event.endTime);
            
            if (day && start && end) {
                // Convert the displayed wall-clock times to absolute UTC instants
                const startUTC = this.wallTimeToUTC(day, start.hours, start.minutes);
                const endUTC = this.wallTimeToUTC(day, end.hours, end.minutes);
                lines.push(`DTSTART:${this.formatDateTimeUTC(startUTC)}`);
                lines.push(`DTEND:${this.formatDateTimeUTC(endUTC)}`);
            }
        }
        
        // Add organizer (only if valid and not "null" string)
        // Also filter out suspicious single-word names that might be incomplete
        if (event.organizer && 
            event.organizer !== 'null' && 
            event.organizer.toLowerCase() !== 'null' &&
            event.organizer !== '(null)' &&
            !event.organizer.toLowerCase().includes('null') &&
            event.organizer.trim().split(/\s+/).length > 1) { // Require at least 2 words (first + last name)
            lines.push(`ORGANIZER:CN=${this.escapeText(event.organizer)}`);
        }
        
        // Add location
        if (event.location) {
            lines.push(`LOCATION:${this.escapeText(event.location)}`);
        }
        
        // Add status
        if (event.status) {
            lines.push(`STATUS:${event.status}`);
            // Map Outlook status to standard
            if (event.status === 'BUSY') {
                lines.push(`TRANSP:OPAQUE`);
            } else if (event.status === 'FREE') {
                lines.push(`TRANSP:TRANSPARENT`);
            } else if (event.status === 'TENTATIVE') {
                lines.push(`TRANSP:OPAQUE`);
                lines.push(`STATUS:TENTATIVE`);
            }
        }
        
        // Add recurrence information
        if (event.isRecurring) {
            if (event.recurrenceType === 'exception') {
                lines.push(`DESCRIPTION:${this.escapeText('Recurring event (modified)')}`);
            } else {
                lines.push(`DESCRIPTION:${this.escapeText('Recurring event')}`);
                // DO NOT add RRULE - we're exporting individual instances, not recurrence patterns
                // Each instance is already captured as a separate event during our 4-week scraping
            }
        }
        
        // Add categories
        lines.push(`CATEGORIES:Outlook Import`);
        
        lines.push('END:VEVENT');
        
        return lines;
    }

    parseEndDateFromLocation(location) {
        if (!location) return null;
        
        try {
            // Look for patterns like "Monday, September 29, 2025 to Friday, October 3, 2025"
            // or "October 8, 2025 to Tuesday, October 14, 2025"
            const toPattern = /to\s+(?:(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s*)?([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i;
            const match = location.match(toPattern);
            
            if (match) {
                const endDateString = match[1].trim();
                const endDate = new Date(endDateString.replace(/,/g, ''));
                
                if (!isNaN(endDate.getTime())) {
                    return endDate;
                }
            }
            
            return null;
        } catch (error) {
            console.warn('Error parsing end date from location:', location, error);
            return null;
        }
    }

    parseDate(dateString) {
        if (!dateString) return null;
        
        try {
            // Handle formats like "October 6, 2025" or "October 6 2025"
            const cleanDate = dateString.replace(/,/g, '').trim();
            const date = new Date(cleanDate);
            
            if (isNaN(date.getTime())) {
                console.warn('Could not parse date:', dateString);
                return null;
            }
            
            return date;
        } catch (error) {
            console.warn('Error parsing date:', dateString, error);
            return null;
        }
    }

    parseTimeComponents(timeString) {
        if (!timeString) return null;
        
        try {
            // Support both 12-hour (with AM/PM) and 24-hour time strings
            // Examples supported: "4:00 PM", "09:30 AM", "16:00", "9:00"
            let hours = null;
            let minutes = 0;

            // Try AM/PM first
            const ampmMatch = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
            if (ampmMatch) {
                hours = parseInt(ampmMatch[1], 10);
                minutes = parseInt(ampmMatch[2], 10);
                const ampm = ampmMatch[3].toUpperCase();
                if (ampm === 'PM' && hours !== 12) hours += 12;
                if (ampm === 'AM' && hours === 12) hours = 0;
            } else {
                // Try 24-hour format
                const hhmmMatch = timeString.match(/(\d{1,2}):(\d{2})/);
                if (hhmmMatch) {
                    hours = parseInt(hhmmMatch[1], 10);
                    minutes = parseInt(hhmmMatch[2], 10);
                }
            }

            if (hours === null) return null;
            return { hours, minutes };
        } catch (error) {
            console.warn('Error parsing time:', timeString, error);
            return null;
        }
    }

    // Offset (in ms) of the mapped IANA zone at a given instant,
    // computed via the browser's Intl API (DST-aware).
    getZoneOffsetMs(instant) {
        const dtf = new Intl.DateTimeFormat('en-US', {
            timeZone: this.getIANATimezone(),
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false
        });
        const parts = {};
        for (const part of dtf.formatToParts(instant)) {
            if (part.type !== 'literal') parts[part.type] = part.value;
        }
        // Some environments report midnight as hour "24"
        const hour = parseInt(parts.hour, 10) % 24;
        const wallAsUTC = Date.UTC(
            parseInt(parts.year, 10),
            parseInt(parts.month, 10) - 1,
            parseInt(parts.day, 10),
            hour,
            parseInt(parts.minute, 10),
            parseInt(parts.second, 10)
        );
        return wallAsUTC - instant.getTime();
    }

    // Interpret wall-clock components as displayed in the selected timezone
    // and return the corresponding absolute UTC instant.
    wallTimeToUTC(day, hours, minutes) {
        const guessUTC = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate(), hours, minutes, 0);
        let utc = guessUTC - this.getZoneOffsetMs(new Date(guessUTC));
        // Refine once: on DST transition days the offset at the first guess
        // may differ from the offset at the computed instant
        utc = guessUTC - this.getZoneOffsetMs(new Date(utc));
        return new Date(utc);
    }

    formatDateTimeUTC(date) {
        // Format an absolute instant as YYYYMMDDTHHMMSSZ
        return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    }

    formatDateOnly(date) {
        // Format as YYYYMMDD for all-day events
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}${month}${day}`;
    }

    getIANATimezone() {
        // The popup sends an IANA timezone name (e.g. "Europe/Rome").
        // Validate it through the Intl API; fall back to UTC if invalid.
        try {
            new Intl.DateTimeFormat('en-US', { timeZone: this.timezone });
            return this.timezone;
        } catch (error) {
            console.warn('Invalid timezone, falling back to UTC:', this.timezone);
            return 'UTC';
        }
    }

    generateUID(event) {
        // Prefer stable calendar item id (if provided by Outlook) so repeated exports can be re-imported without duplicates
        if (event.calItemId) {
            // sanitize calItemId to safe UID characters
            const safeId = event.calItemId.replace(/[^A-Za-z0-9\-_.@]/g, '');
            return `cal-liberator-${safeId}@outlook.com`;
        }

        // Fallback: Generate unique ID based on event details
        const content = `${event.title}-${event.date || ''}-${event.startTime || ''}-${event.organizer || ''}`;
        const hash = this.simpleHash(content);
        return `cal-liberator-${hash}@outlook.com`;
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    escapeText(text) {
        if (!text) return '';
        
        return text
            .replace(/\\/g, '\\\\')
            .replace(/,/g, '\\,')
            .replace(/;/g, '\\;')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '');
    }
}

// Make ICSGenerator available globally for content script
if (typeof window !== 'undefined') {
    window.ICSGenerator = ICSGenerator;
}
