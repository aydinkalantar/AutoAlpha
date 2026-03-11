const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { Queue } = require('bullmq');

async function main() {
    console.log("Setting up controlled Phase 2 Test Environment...");

    // Create isolated QA user & matching mock data to ensure clean math
    const qaUser = await prisma.user.create({
        data: {
            id: 'qa_user_' + Date.now(),
            email: `qa_${Date.now()}@autoalpha.ai`,
            isTestnetMode: true,
            paperUsdtBalance: 10000,
        }
    });

    const qaStrategy = await prisma.strategy.create({
        data: {
            id: 'qa_strategy_' + Date.now(),
            name: 'QA 3x Long Strategy',
            targetExchange: 'UNIVERSAL',
            marketType: 'FUTURES',
            settlementCurrency: 'USDT',
            webhookToken: 'qa_webhook_' + Date.now(),
            pair: 'BTC/USDT:USDT',
            leverage: 3,                 // Test Condition
            maxLeverage: 3,
            defaultEquityPercentage: 100, // Test Condition
            isActive: true,
        }
    });

    const qaSubscription = await prisma.subscription.create({
        data: {
            id: 'qa_sub_' + Date.now(),
            userId: qaUser.id,
            strategyId: qaStrategy.id,
            allocatedCapital: 10000,
            currentVirtualBalance: 10000, // Exactly $10,000 for easy QA math
            isActive: true,
            isPaper: true,
        }
    });

    // Fire test job directly into the queue referencing our mocked 10k 3x 100% user
    const qaQueue = new Queue('trade-execution', {
        connection: { host: 'localhost', port: 6379 } // Requires Redis running
    });

    await qaQueue.add('enter-trade', {
        symbol: 'BTCUSD',
        side: 'LONG',
        strategyId: qaStrategy.id,
        subscriptionId: qaSubscription.id,
        userId: qaUser.id,
        isPaper: true,
        exchange: 'UNIVERSAL',
        marketType: 'FUTURES',
        settlementCurrency: 'USDT',
        performanceFeePercentage: 30,
        // The webhook passes these to the worker natively now:
        virtualBalance: 10000,
        leverage: 3
    });

    console.log("Dispatched 10k 3xLONG test. Checking database positions in 3 seconds...");

    setTimeout(async () => {
        const result = await prisma.position.findFirst({
            where: { subscriptionId: qaSubscription.id }
        });

        console.log("\n===== QA PHASE 2: SIZING RESULT =====");
        console.log(`Expected requestedAmount: $30,000  (100% of $10,000 * 3x Leverage)`);
        console.log(`Actual requestedAmount:   $${result ? result.requestedAmount : 'FAILED - Missing'}`);
        console.log("=====================================\n");

        await prisma.$disconnect();
        process.exit(0);
    }, 3000);
}

main().catch(console.error);
