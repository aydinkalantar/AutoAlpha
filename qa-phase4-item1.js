const { PrismaClient } = require('@prisma/client');
const { encryptKey } = require('./src/lib/encryption');
const prisma = new PrismaClient();

async function main() {
    console.log("Setting up QA Phase 4: Desync Recovery Test");

    const userId = 'qa_desync_user_' + Date.now();
    const strategyId = 'qa_desync_strat_' + Date.now();
    const token = 'qa_desync_token_' + Date.now();
    const subId = 'qa_desync_sub_' + Date.now();

    // 1. Setup Mock User, Strategy, Subscription, and Fake API Key
    await prisma.user.create({
        data: { id: userId, email: `qa_d_${Date.now()}@autoalpha.ai`, usdtBalance: 10000, isTestnetMode: true }
    });

    // Mock an invalid API Key to simulate a Desync/Credential expiration
    const mockEncryptedApi = encryptKey('invalid_key', 'my_secret_iv');
    const mockEncryptedSecret = encryptKey('invalid_secret', 'my_secret_iv');

    await prisma.exchangeKey.create({
        data: {
            userId,
            exchange: 'OKX',
            encryptedApiKey: mockEncryptedApi,
            encryptedSecret: mockEncryptedSecret,
            iv: 'my_secret_iv',
            isTestnet: true,
            isValid: true
        }
    });

    await prisma.strategy.create({
        data: {
            id: strategyId, name: 'Desync QA', targetExchange: 'OKX', marketType: 'FUTURES', settlementCurrency: 'USDT',
            webhookToken: token, pair: 'BTC/USDT:USDT', leverage: 1, defaultEquityPercentage: 100, isActive: true
        }
    });

    await prisma.subscription.create({
        data: { id: subId, userId, strategyId, allocatedCapital: 10000, currentVirtualBalance: 10000, isActive: true, isPaper: false }
    });

    // 2. Inject an OPEN Live Position
    const pos = await prisma.position.create({
        data: {
            id: 'desync_pos_' + Date.now(), userId, strategyId, subscriptionId: subId, symbol: 'BTC/USDT:USDT',
            side: 'LONG', isOpen: true, isPaper: false, entryPrice: 60000,
            requestedAmount: 10000, filledAmount: 0.166, exchangeOrderId: 'LIVE_1'
        }
    });

    console.log(`[ACTION] Firing SHORT webhook (reversal) to force close the LIVE position with invalid API keys...`);

    // 3. Dispatch Webhook to trigger exit
    await fetch('http://localhost:3000/api/webhook/tradingview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookToken: token, symbol: 'BTC/USDT:USDT', action: 'SHORT', price: 61000 })
    });

    console.log("Waiting 4 seconds for execution error mapping...");
    setTimeout(async () => {
        const checkPos = await prisma.position.findUnique({ where: { id: pos.id } });

        console.log("\n===== QA PHASE 4: ITEM 1 (DESYNC RECOVERY) =====");
        if (checkPos && !checkPos.isOpen) {
            console.log(`PASSED: The position was gracefully closed in the database after the CCXT exception trace.`);
            console.log(`Post-Closed State -> RealizedPnL: $${checkPos.realizedPnl}, Exit Price: ${checkPos.exitPrice}`);
        } else {
            console.log(`FAILED: Position is still open. The exception crashed the BullMQ evaluation.`);
        }
        console.log("================================================\n");

        await prisma.$disconnect();
        process.exit(0);
    }, 4000);
}

main().catch(console.error);
