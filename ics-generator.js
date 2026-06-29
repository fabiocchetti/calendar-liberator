// ICS Generator Class
// Handles conversion of calendar events to ICS format with proper timezone support

class ICSGenerator {
    constructor(timezone = 'UTC+0', userEmail = null, calendarName = null) {
        this.timezone = timezone;
        this.timezoneOffset = this.parseTimezoneOffset(timezone);
        this.userEmail = userEmail;
        this.calendarName = calendarName;
    }

    parseTimezoneOffset(timezone) {
        // Parse timezone string like "UTC+1" or "UTC-5"
        const match = timezone.match(/UTC([+-])(\d+)/);
        if (!match) return 0;
        
        const sign = match[1] === '+' ? 1 : -1;
        const hours = parseInt(match[2], 10);
        return sign * hours;
    }

    generate(events) {
        // Set calendar name: user-supplied > email-based > default
        const calendarName = this.calendarName
            ? this.calendarName
            : this.userEmail
                ? `${this.userEmail} - Outlook`
                : 'Outlook Calendar Export';
        
        console.log('ICSGenerator: Calendar name set to:', calendarName);
        console.log('ICSGenerator: User email:', this.userEmail);
        
        const lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//CalendarLiberator//CalendarLiberator 1.0//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            `X-WR-CALNAME:${calendarName}`,
            `X-WR-CALDESC:Exported from Outlook Web Calendar using CalendarLiberator`,
            `X-WR-TIMEZONE:${this.getIANATimezone()}`
        ];

        // Add timezone definition
        lines.push(...this.generateTimezoneDefinition());

        // Add events
        for (const event of events) {
            lines.push(...this.generateEventLines(event));
        }

        lines.push('END:VCALENDAR');

        return lines.join('\r\n');
    }

    generateTimezoneDefinition() {
        const tzid = this.getTimezoneId();
        const standardOffset = this.formatTimezoneOffset(this.timezoneOffset);
        
        return [
            'BEGIN:VTIMEZONE',
            `TZID:${tzid}`,
            'BEGIN:STANDARD',
            `DTSTART:19700101T000000`,
            `TZOFFSETFROM:${standardOffset}`,
            `TZOFFSETTO:${standardOffset}`,
            `TZNAME:${this.timezone}`,
            'END:STANDARD',
            'END:VTIMEZONE'
        ];
    }

    generateEventLines(event) {
        const lines = ['BEGIN:VEVENT'];
        
        // Generate unique ID
        const uid = this.generateUID(event);
        lines.push(`UID:${uid}`);
        
        // Add created and modified timestamps
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
            const startDateTime = this.parseDateTime(event.date, event.startTime);
            const endDateTime = this.parseDateTime(event.date, event.endTime);
            
            if (startDateTime && endDateTime) {
                const tzid = this.getTimezoneId();
                lines.push(`DTSTART;TZID=${tzid}:${this.formatDateTime(startDateTime)}`);
                lines.push(`DTEND;TZID=${tzid}:${this.formatDateTime(endDateTime)}`);
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

    parseDateTime(dateString, timeString) {
        const date = this.parseDate(dateString);
        if (!date || !timeString) return null;
        
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

            const dateTime = new Date(date);
            dateTime.setHours(hours, minutes, 0, 0);
            return dateTime;
        } catch (error) {
            console.warn('Error parsing time:', timeString, error);
            return null;
        }
    }

    formatDateTime(date) {
        // Format as YYYYMMDDTHHMMSS
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}${month}${day}T${hours}${minutes}${seconds}`;
    }

    formatDateTimeUTC(date) {
        // Convert to UTC and format as YYYYMMDDTHHMMSSZ
        const utcDate = new Date(date.getTime() - (this.timezoneOffset * 60 * 60 * 1000));
        return this.formatDateTime(utcDate) + 'Z';
    }

    formatDateOnly(date) {
        // Format as YYYYMMDD for all-day events
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}${month}${day}`;
    }

    formatTimezoneOffset(offsetHours) {
        const sign = offsetHours >= 0 ? '+' : '-';
        const hours = String(Math.abs(offsetHours)).padStart(2, '0');
        return `${sign}${hours}00`;
    }

    getTimezoneId() {
        return `CustomTZ${this.timezone.replace(/[^A-Za-z0-9]/g, '')}`;
    }

    getIANATimezone() {
        // Map common UTC offsets to IANA timezone names
        const timezoneMap = {
            'UTC-12': 'Etc/GMT+12',
            'UTC-11': 'Etc/GMT+11',
            'UTC-10': 'Pacific/Honolulu',
            'UTC-9': 'America/Anchorage',
            'UTC-8': 'America/Los_Angeles',
            'UTC-7': 'America/Denver',
            'UTC-6': 'America/Chicago',
            'UTC-5': 'America/New_York',
            'UTC-4': 'America/Halifax',
            'UTC-3': 'America/Argentina/Buenos_Aires',
            'UTC-2': 'Etc/GMT+2',
            'UTC-1': 'Atlantic/Azores',
            'UTC+0': 'UTC',
            'UTC+1': 'Europe/London',
            'UTC+2': 'Europe/Berlin',
            'UTC+3': 'Europe/Moscow',
            'UTC+4': 'Asia/Dubai',
            'UTC+5': 'Asia/Karachi',
            'UTC+6': 'Asia/Dhaka',
            'UTC+7': 'Asia/Bangkok',
            'UTC+8': 'Asia/Singapore',
            'UTC+9': 'Asia/Tokyo',
            'UTC+10': 'Australia/Sydney',
            'UTC+11': 'Pacific/Noumea',
            'UTC+12': 'Pacific/Auckland'
        };
        
        return timezoneMap[this.timezone] || 'UTC';
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