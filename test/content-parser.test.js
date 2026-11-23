// Regression tests for Outlook's accessible event-label format.
// Run: node test/content-parser.test.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const source = fs.readFileSync(path.join(__dirname, '..', 'content.js'), 'utf8');
// We only test the parser; do not instantiate a Chrome content script.
const isolated = source.replace(
    /const calendarLiberator = new CalendarLiberator\(\);\s*$/,
    'globalThis.CalendarLiberator = CalendarLiberator;'
);
assert.notStrictEqual(isolated, source, 'content.js bootstrap anchor not found');
const context = { console };
vm.runInNewContext(isolated, context);
const parser = Object.create(context.CalendarLiberator.prototype);

const testCases = [
    {
        label: 'CIA Eve 4p-12a [J.Lubin], 4:00 PM Friday, December 11, 2026 to 12:00 AM Saturday, December 12, 2026, Free, Categorized as Clinical Shift',
        title: 'CIA Eve 4p-12a [J.Lubin]',
        date: 'December 11, 2026',
        endDate: 'December 12, 2026',
        startTime: '4:00 PM',
        endTime: '12:00 AM'
    },
    {
        label: 'Adm Call 6a-6a [J.Lubin], 6:00 AM Saturday, November 21, 2026 to 6:00 AM Sunday, November 22, 2026, Free, Categorized as On Call',
        title: 'Adm Call 6a-6a [J.Lubin]',
        date: 'November 21, 2026',
        endDate: 'November 22, 2026',
        startTime: '6:00 AM',
        endTime: '6:00 AM'
    },
    {
        label: 'Team Meeting, 4:00 PM to 4:30 PM, Monday, October 6, 2025, By Smith John, Busy',
        title: 'Team Meeting',
        date: 'October 6, 2025',
        startTime: '4:00 PM',
        endTime: '4:30 PM'
    }
];
for (const item of testCases) {
    const parsed = parser.parseEventFromAriaLabel(item.label);
    assert.ok(parsed, 'parser rejected ' + item.title);
    for (const field of ['title', 'date', 'startTime', 'endTime']) {
        assert.strictEqual(parsed[field], item[field], field + ' mismatch for ' + item.title);
    }
    if (item.endDate) assert.strictEqual(parsed.endDate, item.endDate, 'endDate mismatch');
    console.log('✓ parsed ' + item.title);
}
console.log('All Outlook parser tests passed.');
