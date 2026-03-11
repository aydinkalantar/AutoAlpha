const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0'; // Bind to all interfaces for Docker
const port = parseInt(process.env.PORT || '3000', 10);

// Initialize Next.js application
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url || '/', true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    })
    .once('error', (err) => {
        console.error('Server failed to start:', err);
        process.exit(1);
    })
    .listen(port, hostname, () => {
        console.log(`> Ready on http://${hostname}:${port}`);

        // Initialize Background Workers securely after HTTP server binds
        console.log('> Starting Background Workers...');
        try {
            if (dev) {
                console.log('> Dev environment detected. Workers should be run via separate terminal (npm run worker).');
            } else {
                // In production, require the esbuild transpiled JS files
                const tradeWorkerPath = path.join(__dirname, 'dist/workers/tradeWorker.js');
                const cronJobsPath = path.join(__dirname, 'dist/workers/cronJobs.js');
                
                require(tradeWorkerPath);
                require(cronJobsPath);
                console.log('> Workers & Cron Jobs initialized successfully.');
            }
        } catch (e) {
            console.error('> Critical Error: Could not initialize workers:', e);
        }
    });
});
