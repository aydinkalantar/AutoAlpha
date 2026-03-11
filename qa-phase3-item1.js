const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Setting up QA Phase 3: Item 1 - Dashboard 1-to-1 Matching Test");

    const userId = 'qa_match_user_' + Date.now();
    const strategyId = 'qa_match_strat_' + Date.now();
    const token = 'qa_match_token_' + Date.now();
    const subId = 'qa_match_sub_' + Date.now();

    // The explicit TV Order ID we expect to perfectly match in the Dashboard DB
    const expectedTradingViewOrderId = 'TV_ORDER_' + Date.now() + '_LONG_ENTRY';

    // 1. Setup Mock User & Strategy
    await prisma.user.create({
        data: { id: userId, email: `qa_${Date.now()}@autoalpha.ai`, paperUsdtBalance: 10000, isTestnetMode: true }
    });

    await prisma.strategy.create({
        data: {
            id: strategyId, name: 'Matching QA', targetExchange: 'UNIVERSAL', marketType: 'FUTURES', settlementCurrency: 'USDT',
            webhookToken: token, pair: 'BTC/USDT:USDT', leverage: 1, defaultEquityPercentage: 100, isActive: true
        }
    });

    await prisma.subscription.create({
        data: { id: subId, userId, strategyId, allocatedCapital: 10000, currentVirtualBalance: 10000, isActive: true, isPaper: true }
    });

    console.log(`[ACTION] Firing standard incoming webhook with explicit Order ID: ${expectedTradingViewOrderId}`);

    // 2. Dispatch the Webhook referencing our TV Order ID string inside the typical payload
    const response = await fetch('http://localhost:3000/api/webhook/tradingview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            webhookToken: token,
            symbol: 'BTCUSD',
            action: 'LONG',
            // In TV, users pass {{strategy.order.id}}. We mock it in the payload.
            order_id: expectedTradingViewOrderId
        })
    });

    const json = await response.json();
    console.log(`[WEBHOOK RESPONSE]`, json);

    // Give the background worker 3 seconds to process the queue and write to standard DB
    console.log("\nWaiting 3 seconds for BullMQ execution to hydrate Database...\n");
    setTimeout(async () => {
        console.log("===== QA PHASE 3: MATCHING RESULT =====");

        const executedPosition = await prisma.position.findFirst({
            where: { subscriptionId: subId }
        });

        if (!executedPosition) {
            console.log("FAILED: The trade was never opened in the Database.");
        } else {
            console.log(`Expected DB exchangeOrderId: ${expectedTradingViewOrderId}`);
            console.log(`Actual DB exchangeOrderId  : ${executedPosition.exchangeOrderId}`);

            if (executedPosition.exchangeOrderId === expectedTradingViewOrderId) {
                console.log("Verdict: PASSED. The DB actively captures the TradingView exact match string.");
            } else {
                console.log("Verdict: FAILED. The system overrides the user's TV ID with a local stub ID.");
            }
        }
        console.log("=======================================\n");

        await prisma.$disconnect();
        process.exit(0);
    }, 3000);
}

main().catch(console.error);
