// Quick sanity tests for ics-generator.js — run with: node test/ics-generator.test.js
// Not a framework; plain assertions so the repo stays dependency-free.

const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Load the generator the same way the content script does (global window)
global.window = {};
const source = fs.readFileSync(path.join(__dirname, '..', 'ics-generator.js'), 'utf8');
eval(source);
const ICSGenerator = global.window.ICSGenerator;

const baseEvent = {
    title: 'Team Meeting',
    date: 'July 15, 2026',
    startTime: '2:00 PM',
    endTime: '3:00 PM',
    organizer: 'Smith John',
    status: 'BUSY',
    isRecurring: false,
    allDay: false,
    calItemId: 'AAMkADxyz==/'
};

// --- Structure -------------------------------------------------------------
{
    const ics = new ICSGenerator('Europe/Rome').generate([baseEvent]);
    assert.ok(ics.startsWith('BEGIN:VCALENDAR'), 'starts with VCALENDAR');
    assert.ok(ics.includes('VERSION:2.0'), 'has VERSION');
    assert.ok(ics.includes('END:VCALENDAR'), 'ends with VCALENDAR');
    assert.ok(ics.includes('\r\n'), 'uses CRLF line endings');
    assert.ok(!ics.includes('BEGIN:VTIMEZONE'), 'no fixed-offset VTIMEZONE');
    console.log('✓ structure');
}

// --- UID sanitization -------------------------------------------------------
{
    const ics = new ICSGenerator('Europe/Rome').generate([baseEvent]);
    assert.ok(ics.includes('UID:cal-liberator-AAMkADxyz@outlook.com'), 'calItemId sanitized in UID');
    console.log('✓ uid');
}

// --- UTC conversion, summer (DST active in Europe/Rome = UTC+2) ------------
{
    const ics = new ICSGenerator('Europe/Rome').generate([baseEvent]);
    assert.ok(ics.includes('DTSTART:20260715T120000Z'), `summer DTSTART wrong:\n${ics}`);
    assert.ok(ics.includes('DTEND:20260715T130000Z'), 'summer DTEND wrong');
    console.log('✓ summer time (DST) converted to UTC correctly');
}

// --- UTC conversion, winter (Europe/Rome = UTC+1) ---------------------------
{
    const winter = { ...baseEvent, date: 'January 15, 2026', calItemId: undefined };
    const ics = new ICSGenerator('Europe/Rome').generate([winter]);
    assert.ok(ics.includes('DTSTART:20260115T130000Z'), `winter DTSTART wrong:\n${ics}`);
    assert.ok(ics.includes('DTEND:20260115T140000Z'), 'winter DTEND wrong');
    console.log('✓ winter time converted to UTC correctly (per-date DST)');
}

// --- Regression: Europe/London summer (BST = UTC+1, not its winter UTC+0) ---
// A user in London in July must get the +1 conversion. The old design mapped
// a bare "UTC+1" offset to Europe/Rome (UTC+2 in summer), shifting events
// one hour early for London users.
{
    const ics = new ICSGenerator('Europe/London').generate([baseEvent]);
    assert.ok(ics.includes('DTSTART:20260715T130000Z'), `London summer DTSTART wrong:\n${ics}`);
    assert.ok(ics.includes('DTEND:20260715T140000Z'), 'London summer DTEND wrong');
    console.log('✓ Europe/London summer (BST) converted correctly');
}

// --- All-day events ----------------------------------------------------------
{
    const allDay = { ...baseEvent, allDay: true, startTime: null, endTime: null, calItemId: undefined };
    const ics = new ICSGenerator('Europe/Rome').generate([allDay]);
    assert.ok(ics.includes('DTSTART;VALUE=DATE:20260715'), 'all-day DTSTART wrong');
    assert.ok(ics.includes('DTEND;VALUE=DATE:20260716'), 'all-day DTEND should be day after');
    console.log('✓ all-day event as floating date');
}

// --- Text escaping -----------------------------------------------------------
{
    const tricky = { ...baseEvent, title: 'Review, Q3; "final"\nDraft', calItemId: undefined };
    const ics = new ICSGenerator('Europe/Rome').generate([tricky]);
    assert.ok(ics.includes('SUMMARY:Review\\, Q3\\; "final"\\nDraft'), 'text not escaped');
    console.log('✓ text escaping');
}

// --- Organizer filtering -----------------------------------------------------
{
    const noOrg = { ...baseEvent, organizer: 'null', calItemId: undefined };
    const ics = new ICSGenerator('Europe/Rome').generate([noOrg]);
    assert.ok(!ics.includes('ORGANIZER'), '"null" organizer must be filtered out');
    const oneWord = { ...baseEvent, organizer: 'Smith', calItemId: undefined };
    const ics2 = new ICSGenerator('Europe/Rome').generate([oneWord]);
    assert.ok(!ics2.includes('ORGANIZER'), 'single-word organizer must be filtered out');
    console.log('✓ organizer filtering');
}

// --- DTSTAMP is absolute UTC -------------------------------------------------
{
    const ics = new ICSGenerator('America/New_York').generate([baseEvent]);
    const m = ics.match(/DTSTAMP:(\d{8}T\d{6}Z)/);
    assert.ok(m, 'DTSTAMP present and UTC-suffixed');
    console.log('✓ dtstamp');
}

// --- STATUS and TRANSP ------------------------------------------------------
{
    const ics = new ICSGenerator('Europe/Rome').generate([baseEvent]);
    assert.strictEqual((ics.match(/STATUS:/g) || []).length, 1, 'STATUS appears once');
    assert.ok(ics.includes('STATUS:CONFIRMED'), 'busy event is CONFIRMED');
    assert.ok(ics.includes('TRANSP:OPAQUE'), 'busy event blocks time');
    assert.ok(!/STATUS:(BUSY|FREE)/.test(ics), 'BUSY/FREE are not valid STATUS values');

    const tentative = { ...baseEvent, status: 'TENTATIVE' };
    const ics2 = new ICSGenerator('Europe/Rome').generate([tentative]);
    assert.strictEqual((ics2.match(/STATUS:/g) || []).length, 1, 'STATUS appears once when tentative');
    assert.ok(ics2.includes('STATUS:TENTATIVE'), 'tentative event is TENTATIVE');
    assert.ok(ics2.includes('TRANSP:TRANSPARENT'), 'tentative event does not block time');

    const free = { ...baseEvent, status: 'FREE' };
    const ics3 = new ICSGenerator('Europe/Rome').generate([free]);
    assert.ok(ics3.includes('STATUS:CONFIRMED'), 'free event is still CONFIRMED');
    assert.ok(ics3.includes('TRANSP:TRANSPARENT'), 'free event does not block time');
    console.log('✓ status and transparency');
}



// --- Missing date/time must not create malformed calendar events ------------
{
    const incomplete = { ...baseEvent, date: null, startTime: null, endTime: null, title: 'Shift missing timestamps' };
    const good = { ...baseEvent, title: 'Valid meeting' };
    const generator = new ICSGenerator('America/New_York');
    const ics = generator.generate([incomplete, good]);
    assert.strictEqual(generator.lastExportedCount, 1);
    assert.strictEqual(generator.lastSkippedCount, 1);
    assert.strictEqual((ics.match(/BEGIN:VEVENT/g) || []).length, 1, 'incomplete event must be omitted');
    assert.ok(!ics.includes('Shift missing timestamps'), 'incomplete event should not appear');
    assert.ok(ics.includes('SUMMARY:Valid meeting'), 'valid events must remain');
    assert.strictEqual(new ICSGenerator('America/New_York').generate([incomplete]).includes('BEGIN:VEVENT'), false);
    console.log('✓ missing timestamps not exported as broken VEVENT');
}

// --- Overnight clinical shift ends on the next calendar day ----------------
{
    const overnight = { ...baseEvent, date: 'November 21, 2026', startTime: '4:00 PM', endTime: '12:00 AM', title: 'Evening shift' };
    const ics = new ICSGenerator('America/New_York').generate([overnight]);
    assert.ok(ics.includes('DTSTART:20261121T210000Z'), 'overnight start wrong');
    assert.ok(ics.includes('DTEND:20261122T050000Z'), 'overnight end must be next day');
    console.log('✓ overnight shift crosses midnight');
}

// --- Unambiguous same-day event must remain on same day ---------------------
{
    const ics = new ICSGenerator('America/New_York').generate([
        { ...baseEvent, date: 'November 24, 2026', startTime: '6:00 AM', endTime: '2:00 PM' }
    ]);
    assert.ok(ics.includes('DTSTART:20261124T110000Z'));
    assert.ok(ics.includes('DTEND:20261124T190000Z'));
    console.log('✓ ordinary daytime shift unchanged');
}

// --- Equal start/end times are ambiguous: reject, don't invent 24 hours ----
{
    const ics = new ICSGenerator('America/New_York').generate([
        { ...baseEvent, startTime: '6:00 AM', endTime: '6:00 AM' }
    ]);
    assert.ok(!ics.includes('BEGIN:VEVENT'));
    console.log('✓ ambiguous equal start/end rejected');
}

// --- Explicit dates preserve exactly 24-hour call --------------------------
{
    const call = {
        ...baseEvent,
        date: 'November 21, 2026',
        endDate: 'November 22, 2026',
        startTime: '6:00 AM',
        endTime: '6:00 AM',
        title: 'Administrative call'
    };
    const ics = new ICSGenerator('America/New_York').generate([call]);
    assert.ok(ics.includes('DTSTART:20261121T110000Z'), '24-hour start wrong');
    assert.ok(ics.includes('DTEND:20261122T110000Z'), '24-hour end wrong');
    console.log('✓ explicit end date preserves 24-hour call');
}

// --- Explicit end date preserves Friday evening shift ending Saturday ------
{
    const shift = {
        ...baseEvent,
        date: 'December 11, 2026',
        endDate: 'December 12, 2026',
        startTime: '4:00 PM',
        endTime: '12:00 AM',
        title: 'Evening shift'
    };
    const ics = new ICSGenerator('America/New_York').generate([shift]);
    assert.ok(ics.includes('DTSTART:20261211T210000Z'), 'shift start wrong');
    assert.ok(ics.includes('DTEND:20261212T050000Z'), 'shift end wrong');
    console.log('✓ explicit end date preserves evening shift');
}

console.log('\nAll tests passed.');
