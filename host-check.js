// Calendar Liberator — shared host check
//
// Loaded by both the content script and the popup so the two can never disagree
// about what counts as an Outlook calendar page.

function isOutlookCalendarHost(hostname) {
    return (
        hostname.includes('outlook.office.com') ||
        hostname.endsWith('office.com') ||
        hostname.includes('outlook.com') ||
        // Consumer Outlook. Spelled out because it does not contain
        // "outlook.com" as a substring.
        hostname === 'outlook.live.com' ||
        // Exact host, never *.cloud.microsoft, which would also cover Teams,
        // OneDrive, Word and the rest.
        hostname === 'outlook.cloud.microsoft' ||
        (hostname.endsWith('mcas.ms') && hostname.includes('outlook'))
    );
}

function isTeamsHost(hostname) {
    return (
        hostname === 'teams.microsoft.com' ||
        hostname === 'teams.live.com' ||
        hostname === 'teams.cloud.microsoft' ||
        (hostname.endsWith('mcas.ms') && hostname.includes('teams'))
    );
}

function outlookCalendarUrlForTeamsHost(hostname) {
    const outlookHost = hostname.replace(/^teams\./, 'outlook.');

    if (outlookHost === hostname || !isOutlookCalendarHost(outlookHost)) return null;

    return `https://${outlookHost}/calendar/`;
}

if (typeof window !== 'undefined') {
    window.isOutlookCalendarHost = isOutlookCalendarHost;
    window.isTeamsHost = isTeamsHost;
    window.outlookCalendarUrlForTeamsHost = outlookCalendarUrlForTeamsHost;
}
