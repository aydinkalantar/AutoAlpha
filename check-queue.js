const { Queue } = require('bullmq');

async function checkFailed() {
    const tradeQueue = new Queue('trade-execution', {
        connection: { host: 'localhost', port: 6379 }
    });

    const failed = await tradeQueue.getFailed(0, 10);
    console.log('Failed Jobs: ', failed.map(j => ({ id: j.id, name: j.name, data: j.data, failedReason: j.failedReason })));

    const waiting = await tradeQueue.getWaiting(0, 10);
    console.log('Waiting Jobs: ', waiting.map(j => ({ id: j.id, name: j.name, data: j.data })));

    const active = await tradeQueue.getActive(0, 10);
    console.log('Active Jobs: ', active.map(j => ({ id: j.id, name: j.name, data: j.data })));

    process.exit(0);
}
checkFailed().catch(console.error);
