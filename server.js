import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
// We import the typescript files so that ts-node or a bundler (if compiled) 
// or Node's new experimental loaders can load them. 
// For a true standalone deployment, we usually compile workers to JS first,
// but for this prototype setup, we'll demonstrate the architecture:
// worker imports would go here.
// e.g., import './dist/workers/tradeWorker.js';
// e.g., import './dist/workers/cronJobs.js';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);
// when using middleware `hostname` and `port` must be provided below
const handle = app.getRequestHandler();

app.prepare().then(() => {
    createServer(async (req, res) => {
        try {
            // Be sure to pass `true` as the second argument to `url.parse`.
            // This tells it to parse the query portion of the URL.
            const parsedUrl = parse(req.url || '/', true);
            const { pathname, query } = parsedUrl;

            if (pathname === '/a') {
                await app.render(req, res, '/a', query);
            } else if (pathname === '/b') {
                await app.render(req, res, '/b', query);
            } else {
                await handle(req, res, parsedUrl);
            }
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    })
        .once('error', (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);

            // Initialize Workers & Cron Jobs
            // In a fully compiled setup, we require the transpiled JS files here
            console.log('> Starting Background Workers...');
            try {
                if (dev) {
                    require('ts-node/register'); // Allow requiring TS files dynamically if needed
                    require('./src/workers/tradeWorker');
                    require('./src/workers/cronJobs');
                } else {
                    require('./dist/workers/tradeWorker.js');
                    require('./dist/workers/cronJobs.js');
                }
                console.log('> Workers & Cron Jobs initialized successfully.');
            } catch (e) {
                console.warn('> Warning: Could not initialize workers. In production, ensure these are compiled to JS. Error:', e.message);
            }
        });
});
