// Calendar Liberator — publishing endpoint
//
// Sits in front of an R2 bucket and does two things: accept the calendar from
// the extension, and serve it to whatever app subscribes. The bucket itself
// stays private — nothing here is world-writable and nothing is listable.
//
// Two unguessable paths, one per direction:
//   PUT /<WRITE_PATH>  — only the extension knows this one
//   GET /<READ_PATH>   — this is the URL you give your calendar app
// Keeping them separate means the subscription URL, which ends up pasted into
// apps and synced between devices, can never be used to overwrite the calendar.

const OBJECT_KEY = 'calendar.ics';

export default {
    async fetch(request, env) {
        const path = new URL(request.url).pathname.slice(1);

        if (request.method === 'PUT' && path === env.WRITE_PATH) {
            // Buffered rather than streamed: the R2 binding wants a known
            // length, and a month of events is a few tens of KB.
            await env.CAL.put(OBJECT_KEY, await request.arrayBuffer());
            return new Response('Published\n');
        }

        if (request.method === 'GET' && path === env.READ_PATH) {
            const object = await env.CAL.get(OBJECT_KEY);
            if (!object) {
                return new Response('Nothing published yet\n', { status: 404 });
            }

            return new Response(object.body, {
                headers: {
                    'Content-Type': 'text/calendar; charset=utf-8',
                    // Deliberately short: a long CDN cache would sit in front of
                    // Calendar.app's own refresh and make updates look stuck.
                    'Cache-Control': 'public, max-age=300'
                }
            });
        }

        // Same answer for a wrong secret and a wrong path: nothing to probe
        return new Response('Not found\n', { status: 404 });
    }
};
