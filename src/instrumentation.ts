export async function register() {
    // Only run these in the Node.js runtime (not Edge) to prevent Vercel Edge build failures
    // since BullMQ/Redis connections require a full Node environment.
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        // Skip background workers during the build phase to prevent ECONNREFUSED spam
        if (process.env.DATABASE_URL?.includes('mock')) {
            console.log('[Instrumentation] Build step detected. Skipping background workers.');
            return;
        }

        try {
            // Dynamically import the background workers so their side-effects (new Worker) trigger.
            // This ensures they automatically start when `npm run dev` or `npm start` boots up.
            await import('./workers/tradeWorker');
            await import('./workers/cronJobs');
            console.log('[Instrumentation] Successfully registered background Trade and Cron workers.');
        } catch (error) {
            console.error('[Instrumentation] Error booting background workers:', error);
        }
    }
}
