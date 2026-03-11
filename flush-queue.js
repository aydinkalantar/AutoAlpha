const { Queue } = require('bullmq');

async function flush() {
    const q = new Queue('trade-execution', {
        connection: { host: 'localhost', port: 6379 }
    });
    await q.obliterate({ force: true });
    console.log("Queue obliterated");
    process.exit(0);
}

flush().catch(console.error);
