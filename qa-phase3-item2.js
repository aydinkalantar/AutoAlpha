const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Setting up QA Phase 3: Slippage & Metrics Test");

    const userId = 'qa_metric_user_' + Date.now();
    const strategyId = 'qa_metric_strat_' + Date.now();
    const token = 'qa_metric_token_' + Date.now();
    const subId = 'qa_metric_sub_' + Date.now();

    // 1. Setup Mock User & Strategy
    await prisma.user.create({
        data: { id: userId, email: `qa_m_${Date.now()}@autoalpha.ai`, paperUsdtBalance: 10000, isTestnetMode: true }
    });

    await prisma.strategy.create({
        data: {
            id: strategyId, name: 'Metrics QA', targetExchange: 'UNIVERSAL', marketType: 'FUTURES', settlementCurrency: 'USDT',
            webhookToken: token, pair: 'BTC/USDT:USDT', leverage: 1, defaultEquityPercentage: 100, isActive: true
        }
    });

    await prisma.subscription.create({
        data: { id: subId, userId, strategyId, allocatedCapital: 10000, currentVirtualBalance: 10000, isActive: true, isPaper: true }
    });

    // 2. Inject Historical Closed Positions (For WinRate & Drawdown calculations)
    // Simulated path: +$500 (Win), -$200 (Loss), +$300 (Win)
    // Total Trades = 3. Wins = 2. WinRate = 66.66%
    // Cumulative: 10000 -> 10500 -> 10300 -> 10600.
    // Peak = 10500. Drop to 10300 = (200 / 10500)* 100 = 1.904% Drawdown
    await prisma.position.createMany({
        data: [
            { id: 'hist_1_' + Date.now(), userId, strategyId, subscriptionId: subId, symbol: 'BTCUSDT', side: 'LONG', isOpen: false, isPaper: true, entryPrice: 1000, exitPrice: 1050, realizedPnl: 500, requestedAmount: 10000, filledAmount: 10, exchangeOrderId: 'H1' },
            { id: 'hist_2_' + Date.now(), userId, strategyId, subscriptionId: subId, symbol: 'BTCUSDT', side: 'SHORT', isOpen: false, isPaper: true, entryPrice: 1050, exitPrice: 1070, realizedPnl: -200, requestedAmount: 10500, filledAmount: 10, exchangeOrderId: 'H2' },
            { id: 'hist_3_' + Date.now(), userId, strategyId, subscriptionId: subId, symbol: 'BTCUSDT', side: 'LONG', isOpen: false, isPaper: true, entryPrice: 1070, exitPrice: 1100, realizedPnl: 300, requestedAmount: 10300, filledAmount: 10, exchangeOrderId: 'H3' }
        ]
    });

    console.log(`[ACTION] Firing LONG webhook with TV price 60000...`);

    // 3. Dispatch Entry Webhook to generate slippage
    await fetch('http://localhost:3000/api/webhook/tradingview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookToken: token, symbol: 'BTCUSD', action: 'LONG', price: 60000 })
    });

    console.log("Waiting 4 seconds for entry processing...");
    setTimeout(async () => {
        const activePos = await prisma.position.findFirst({ where: { subscriptionId: subId, isOpen: true } });

        console.log("\n===== QA PHASE 3: ITEM 2 (SLIPPAGE MONITOR) =====");
        if (activePos && activePos.tvPrice === 60000 && activePos.slippage !== null) {
            console.log(`PASSED: The position stored tvPrice ${activePos.tvPrice} and calculated slippage ${activePos.slippage}% vs execution price $${activePos.entryPrice}`);
        } else {
            console.log(`FAILED: Slippage data missing or incorrect. ${JSON.stringify(activePos)}`);
        }

        // 4. Dispatch SHORT webhook to trigger exit and force matrix calculation
        console.log(`\n[ACTION] Firing SHORT webhook (reversal) to close LONG and update Strategy Metrics...`);
        await fetch('http://localhost:3000/api/webhook/tradingview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ webhookToken: token, symbol: 'BTCUSD', action: 'SHORT', price: 61000 })
        });

        console.log("Waiting 4 seconds for exit processing and metrics compilation...");
        setTimeout(async () => {
            const strat = await prisma.strategy.findUnique({ where: { id: strategyId } });

            console.log("\n===== QA PHASE 3: ITEM 3 (METRICS CALCULATIONS) =====");
            if (strat && strat.winRatePercentage !== null && strat.drawdownPercentage !== null) {
                console.log(`PASSED: Strategy metrics compiled! WinRate: ${strat.winRatePercentage.toFixed(2)}%, Max Drawdown: ${strat.drawdownPercentage.toFixed(2)}%`);
            } else {
                console.log(`FAILED: Metrics remain null. DB output: WinRate=${strat?.winRatePercentage}, DD=${strat?.drawdownPercentage}`);
            }
            console.log("=====================================================\n");

            await prisma.$disconnect();
            process.exit(0);
        }, 4000);
    }, 4000);
}

main().catch(console.error);
