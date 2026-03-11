const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const prisma = new PrismaClient();

async function main() {
    console.log("Setting up QA Phase 4: Database Persistence Test");

    const userId = 'qa_persist_user_' + Date.now();
    const strategyId = 'qa_persist_strat_' + Date.now();
    const token = 'qa_persist_token_' + Date.now();
    const subId = 'qa_persist_sub_' + Date.now();

    await prisma.user.create({
        data: { id: userId, email: `qa_p_${Date.now()}@autoalpha.ai`, usdtBalance: 10000, isTestnetMode: true }
    });

    await prisma.strategy.create({
        data: {
            id: strategyId, name: 'Persistence QA', targetExchange: 'BINANCE', marketType: 'FUTURES', settlementCurrency: 'USDT',
            webhookToken: token, pair: 'BTC/USDT', leverage: 1, defaultEquityPercentage: 100, isActive: true
        }
    });

    await prisma.subscription.create({
        data: { id: subId, userId, strategyId, allocatedCapital: 10000, currentVirtualBalance: 10000, isActive: true, isPaper: true }
    });

    console.log(`[ACTION] 1. Firing LONG webhook to open position...`);
    await fetch('http://localhost:3000/api/webhook/tradingview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookToken: token, symbol: `BTC/USDT`, action: `LONG`, price: 60000 })
    });

    console.log("Waiting 3 seconds for BullMQ to process the entry...");
    await new Promise(res => setTimeout(res, 3000));

    const openedPositions = await prisma.position.findMany({ where: { strategyId, isOpen: true } });
    if (openedPositions.length !== 1) {
        console.log("FAILED to create initial test position.");
        process.exit(1);
    }

    console.log(`[ACTION] 2. Position ${openedPositions[0].id} securely saved to Database.`);
    console.log(`[ACTION] 3. SIMULATING SERVER REBOOT (Force Restarting tradeWorker.ts)...`);

    // We restart the trade worker. The API server doesn't even hold active execution state.
    try {
        execSync(`pkill -f "tradeWorker"`);
    } catch (e) { } // ignore if none found

    execSync(`npx tsx src/workers/tradeWorker.ts > worker.log 2>&1 &`);
    console.log("tradeWorker.ts background daemon explicitly wiped and restarted.");

    console.log("Waiting 3 seconds for boot cycle...");
    await new Promise(res => setTimeout(res, 3000));

    console.log(`[ACTION] 4. Firing SHORT webhook (Exit signal) to test Stateless memory handling...`);
    await fetch('http://localhost:3000/api/webhook/tradingview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookToken: token, symbol: `BTC/USDT`, action: `EXIT`, price: 61000 })
    });

    console.log("Waiting 3 seconds for BullMQ queue digestion...");
    await new Promise(res => setTimeout(res, 3000));

    const closedPositions = await prisma.position.findUnique({ where: { id: openedPositions[0].id } });

    console.log("\n===== QA PHASE 4: ITEM 3 (DATABASE PERSISTENCE) =====");
    if (closedPositions && !closedPositions.isOpen) {
        console.log(`PASSED: The completely restarted server correctly closed the position entirely from Postgres disk memory!`);
        console.log(`Post-Closed State -> RealizedPnL: $${closedPositions.realizedPnl}, Exit Price: ${closedPositions.exitPrice}`);
    } else {
        console.log(`FAILED: Position is still open. Server reboot induced amnesia.`);
    }
    console.log("=====================================================\n");

    await prisma.$disconnect();
    process.exit(0);
}

main().catch(console.error);
