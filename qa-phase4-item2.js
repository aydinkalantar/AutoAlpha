const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Setting up QA Phase 4: Rate Limiting & Concurrency Test");

    const userId = 'qa_rate_user_' + Date.now();
    await prisma.user.create({
        data: { id: userId, email: `qa_r_${Date.now()}@autoalpha.ai`, usdtBalance: 10000, isTestnetMode: true }
    });

    console.log(`[ACTION] Pre-generating 20 Strategies and Subscriptions...`);
    const strategies = [];
    for (let i = 0; i < 20; i++) {
        const stratId = 'qa_rate_strat_' + i + '_' + Date.now();
        const token = 'qa_rate_token_' + i + '_' + Date.now();
        const subId = 'qa_rate_sub_' + i + '_' + Date.now();

        await prisma.strategy.create({
            data: {
                id: stratId, name: 'Concurrency QA ' + i, targetExchange: 'BINANCE', marketType: 'FUTURES', settlementCurrency: 'USDT',
                webhookToken: token, pair: 'BTC/USDT', leverage: 1, defaultEquityPercentage: 100, isActive: true
            }
        });

        await prisma.subscription.create({
            data: { id: subId, userId, strategyId: stratId, allocatedCapital: 10000, currentVirtualBalance: 10000, isActive: true, isPaper: true }
        });
        strategies.push(token);
    }

    console.log(`[ACTION] Blasting 20 concurrent LONG webhooks via Promise.all() in Paper Mode...`);

    const requests = strategies.map(token => {
        return fetch('http://localhost:3000/api/webhook/tradingview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                webhookToken: token,
                symbol: `BTCUSDT`,
                action: `LONG`,
                price: 60000
            })
        });
    });

    const startTime = Date.now();

    const responses = await Promise.all(requests);
    const endTime = Date.now();
    const durationMs = endTime - startTime;

    console.log(`All 20 POST requests dispatched in ${durationMs}ms`);

    const successes = responses.filter(r => r.ok).length;
    console.log(`200 OK Responses: ${successes} / 20`);

    console.log("Waiting 3 seconds for BullMQ to process the Paper positions...");
    await new Promise(res => setTimeout(res, 3000));

    const openedPositions = await prisma.position.findMany({
        where: { userId, isOpen: true }
    });

    console.log("\n===== QA PHASE 4: ITEM 2 (RATE LIMITING) =====");
    if (successes === 20 && openedPositions.length === 20 && durationMs < 3000) {
        console.log(`PASSED: Handled 20 webhooks asynchronously in ${durationMs}ms with 20 successful Paper db insertions.`);
    } else {
        console.log(`FAILED: Handled 20 webhooks in ${durationMs}ms. Expected 20 successes, got ${successes}. DB saved ${openedPositions.length} positions.`);
    }
    console.log("================================================\n");

    await prisma.$disconnect();
    process.exit(0);
}

main().catch(console.error);
