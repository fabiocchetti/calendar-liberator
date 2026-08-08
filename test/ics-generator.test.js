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

console.log('\nAll tests passed.');
