// Calendar Liberator — publishing endpoint
//
// Writing is authenticated with a bearer token, so the destination URL has the
// same shape here as for any other service. Reading cannot be authenticated —
// a calendar app has no way to log in — so the read path is an unguessable
// secret instead, and it is deliberately not the same secret as the token.

const OBJECT_KEY = 'calendar.ics';
const WRITE_PATH = 'calendar.ics';

export default {
    async fetch(request, env) {
        const path = new URL(request.url).pathname.slice(1);

        if (request.method === 'PUT' && path === WRITE_PATH) {
            if (request.headers.get('Authorization') !== `Bearer ${env.UPLOAD_TOKEN}`) {
                return new Response('Unauthorized\n', { status: 401 });
            }
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

        // Same answer for a wrong read secret and a wrong path: nothing to probe
        return new Response('Not found\n', { status: 404 });
    }
};
