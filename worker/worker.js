// Calendar Liberator — publishing endpoint
//
// Two unguessable paths, one per direction, so the subscription URL that ends
// up pasted into calendar apps can never be used to overwrite the calendar:
//   PUT /<WRITE_PATH>  — only the extension knows this one
//   GET /<READ_PATH>   — the URL you give your calendar app

const OBJECT_KEY = 'calendar.ics';

export default {
    async fetch(request, env) {
        const path = new URL(request.url).pathname.slice(1);

        if (request.method === 'PUT' && path === env.WRITE_PATH) {
            // Buffered, not streamed: the R2 binding wants a known length
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
                    // Short: a long CDN cache would sit in front of the
                    // calendar app's own refresh and make updates look stuck
                    'Cache-Control': 'public, max-age=300'
                }
            });
        }

        // Same answer for a wrong secret and a wrong path: nothing to probe
        return new Response('Not found\n', { status: 404 });
    }
};
