import { Worker, Job } from 'bullmq';
import { prisma } from "@/lib/prisma";
import { executeTrade } from '@/lib/exchangeRouter';
import { decryptKey } from '@/lib/encryption';

async function updateStrategyMetrics(tx: any, strategyId: string) {
    const allPositions = await tx.position.findMany({
        where: { strategyId, isOpen: false },
        orderBy: { createdAt: 'asc' }
    });

    if (allPositions.length === 0) return;

    const totalTrades = allPositions.length;
    const winningTrades = allPositions.filter((p: any) => p.realizedPnl > 0).length;
    const winRatePercentage = (winningTrades / totalTrades) * 100;

    let cumulative = 10000; // Simulated 10k start for calculation
    let peak = cumulative;
    let maxDrawdown = 0;

    for (const pos of allPositions) {
        cumulative += pos.realizedPnl;
        if (cumulative > peak) peak = cumulative;
        const drop = ((peak - cumulative) / peak) * 100;
        if (drop > maxDrawdown) maxDrawdown = drop;
    }

    await tx.strategy.update({
        where: { id: strategyId },
        data: {
            winRatePercentage,
            drawdownPercentage: maxDrawdown
        }
    });
}

async function handlePaperTrade(data: any, isExit: boolean, actionSide: string) {
    const {
        strategyId, subscriptionId, userId, symbol,
        positionId, filledAmount, performanceFeePercentage,
        exchange, marketType, settlementCurrency,
        virtualBalance, leverage
    } = data;

    let binanceSymbol = symbol.replace('/', '').toUpperCase();

    // Auto-correct standard TradingView FOREX pairs (e.g. BTCUSD) to Binance Spot defaults (BTCUSDT)
    if (binanceSymbol.endsWith('USD') && !binanceSymbol.endsWith('USDT')) {
        binanceSymbol = binanceSymbol + 'T';
    }

    let currentPrice = 0;
    try {
        const res = await fetch(`https://api.binance.us/api/v3/ticker/price?symbol=${binanceSymbol}`);
        const json = await res.json();
        if (json.price) {
            currentPrice = parseFloat(json.price);
        } else {
            throw new Error(`Invalid price response: ${JSON.stringify(json)}`);
        }
    } catch (e: any) {
        throw new Error(`Paper trading failed: could not fetch market price for ${symbol} - ${e.message}`);
    }

    if (isExit) {
        const orderPos = await prisma.position.findUnique({ where: { id: positionId } });
        if (!orderPos) throw new Error('Paper position not found for exit');

        const entryPrice = orderPos.entryPrice || currentPrice;
        const notional = orderPos.filledAmount * entryPrice;

        let grossPnl = 0;
        if (orderPos.side === 'LONG' || orderPos.side === 'BUY') {
            grossPnl = (currentPrice - entryPrice) * orderPos.filledAmount;
        } else {
            grossPnl = (entryPrice - currentPrice) * orderPos.filledAmount;
        }

        grossPnl = grossPnl * (orderPos.leverage || 1);
        const simFees = notional * 0.002;
        const netPnl = grossPnl - simFees;

        await prisma.$transaction(async (tx: any) => {
            await tx.position.update({
                where: { id: positionId },
                data: { isOpen: false, realizedPnl: netPnl, exitPrice: currentPrice }
            });

            if (subscriptionId) {
                await tx.subscription.update({
                    where: { id: subscriptionId },
                    data: { currentVirtualBalance: { increment: netPnl } }
                });
            }

            if (netPnl > 0) {
                const platformFee = netPnl * ((performanceFeePercentage || 30) / 100);
                const updateField = settlementCurrency === 'USDT' ? 'paperUsdtBalance' : 'paperUsdcBalance';

                await tx.user.update({
                    where: { id: userId },
                    data: { [updateField]: { decrement: platformFee } }
                });

                await tx.ledger.create({
                    data: {
                        userId,
                        amount: -platformFee,
                        currency: settlementCurrency,
                        description: `[PAPER] Performance Fee Deducted for ${symbol} Trade`,
                        type: 'FEE',
                        status: 'COMPLETED',
                        isPaper: true
                    }
                });
            }

            await tx.notification.create({
                data: {
                    userId,
                    title: 'Paper Trade Closed',
                    message: `Closed simulated ${symbol} position. Net PnL: $${netPnl.toFixed(2)}`,
                    type: 'TRADE'
                }
            });

            await updateStrategyMetrics(tx, strategyId);
        });

    } else {
        const _leverage = leverage || 1;
        const totalNotionalExposure = virtualBalance * _leverage;
        const amountOfCoins = totalNotionalExposure / currentPrice;

        await prisma.$transaction(async (tx: any) => {
            await tx.position.create({
                data: {
                    userId,
                    strategyId,
                    subscriptionId,
                    symbol,
                    side: actionSide,
                    requestedAmount: totalNotionalExposure,
                    filledAmount: amountOfCoins,
                    entryPrice: currentPrice,
                    leverage: leverage || 1,
                    exchangeOrderId: data.orderId || `PAPER_SIM_${Date.now()}`,
                    tvPrice: data.tvPrice,
                    slippage: data.tvPrice && currentPrice ? ((currentPrice - data.tvPrice) / data.tvPrice) * 100 : null,
                    isOpen: true,
                    isPaper: true
                }
            });

            await tx.notification.create({
                data: {
                    userId,
                    title: 'Paper Trade Opened',
                    message: `Opened simulated ${actionSide} position on ${symbol} at $${currentPrice}.`,
                    type: 'TRADE'
                }
            });
        });
    }
}

const worker = new Worker('qa-test-queue', async (job: Job) => {
    const {
        strategyId,
        subscriptionId,
        userId,
        symbol,
        side, // For entry
        closeSide, // For exit
        positionId, // For exit
        filledAmount, // For exit
        performanceFeePercentage, // For exit
        exchange,
        marketType,
        settlementCurrency,
        virtualBalance,
        leverage,
        isTestnet,
        orderId, // Extract the TV string from the payload
        tvPrice  // Extract the webhook price for slippage
    } = job.data;

    try {
        const isExit = job.name === 'exit-trade';
        const actionSide = isExit ? closeSide : side;

        const isPaperTrade = job.data.isPaper === true || String(job.data.isPaper) === 'true';

        if (isPaperTrade) {
            await handlePaperTrade(job.data, isExit, actionSide);
            return;
        }

        // 1. Fetch valid exchange key matching the Testnet mode
        const exchangeKey = await prisma.exchangeKey.findFirst({
            where: { userId, exchange, isTestnet }
        });

        if (!exchangeKey) {
            throw new Error(`No API key found for user ${userId} on exchange ${exchange}`);
        }

        const {
            encryptedApiKey,
            encryptedSecret,
            encryptedPrivateKey,
            exchangePassphrase,
            iv
        } = exchangeKey;

        let apiKey = '';
        let apiSecret = '';
        let privateKey = undefined;

        // 2. Decrypt keys
        if (encryptedApiKey && encryptedSecret) {
            apiKey = decryptKey(encryptedApiKey, iv);
            apiSecret = decryptKey(encryptedSecret, iv);
            if (encryptedPrivateKey) {
                privateKey = decryptKey(encryptedPrivateKey, iv);
            }
        } else {
            throw new Error('Exchange key missing encrypted payload');
        }

        if (isExit) {
            // Logic for Exiting
            const orderPos = await prisma.position.findUnique({
                where: { id: positionId }
            });

            await executeTrade(
                exchange,
                symbol,
                actionSide, // We pass the reversed side
                filledAmount, // We want to sell exactly what we hold
                marketType,
                apiKey,
                apiSecret,
                privateKey, // RE-ADD DELETED PARAMETER
                exchangePassphrase || undefined,
                undefined, // leverage
                isTestnet, // Ensure testnet logic runs
                undefined,
                undefined,
                undefined,
                true // isExit flag
            );

            // We need to fetch exact fees and Net PnL. For CEX we use ccxt directly here.
            let netPnl = 0;
            let grossPnl = 0;
            let exitPrice = 0;

            // Stub: in reality, we wait for ccxt.fetchClosedOrders()
            // For this prototype, we simulate a randomized PnL between -5% and +10%
            const simulatedReturnPercent = (Math.random() * 0.15) - 0.05;

            // Calculate based on the position data
            if (orderPos) {
                const entryPrice = orderPos.entryPrice || 0;

                // Ensure correct mock exit price based on Long/Short
                if (orderPos.side === 'LONG' || orderPos.side === 'BUY') {
                    exitPrice = entryPrice * (1 + simulatedReturnPercent);
                } else {
                    exitPrice = entryPrice * (1 - simulatedReturnPercent); // Opposite mapping since short wins if price drops
                }

                // Correct notional value mapping
                const notional = orderPos.filledAmount * entryPrice;
                grossPnl = notional * simulatedReturnPercent;

                // Simulate exchange fees calculation (0.1% typical CEX taker fee)
                const simFees = notional * 0.001 * 2; // entry + exit
                netPnl = grossPnl - simFees;
            }

            await prisma.$transaction(async (tx: any) => {
                // 1. Close the position in Prisma
                await tx.position.update({
                    where: { id: positionId },
                    data: { isOpen: false, realizedPnl: netPnl, exitPrice }
                });

                // 2. Add Net PnL to currentVirtualBalance (compounding)
                if (subscriptionId) {
                    await tx.subscription.update({
                        where: { id: subscriptionId },
                        data: { currentVirtualBalance: { increment: netPnl } }
                    });
                }

                // 3. Fee Routing (If Profitable)
                if (netPnl > 0) {
                    const platformFee = netPnl * (performanceFeePercentage / 100);

                    if (settlementCurrency === 'USDT') {
                        await tx.user.update({
                            where: { id: userId },
                            data: { usdtBalance: { decrement: platformFee } }
                        });
                    } else {
                        await tx.user.update({
                            where: { id: userId },
                            data: { usdcBalance: { decrement: platformFee } }
                        });
                    }

                    // Log deduction to Ledger
                    await tx.ledger.create({
                        data: {
                            userId,
                            amount: -platformFee,
                            currency: settlementCurrency,
                            description: `Performance Fee Deducted for ${symbol} Trade`
                        }
                    });
                }

                // Create Notification
                await tx.notification.create({
                    data: {
                        userId,
                        title: 'Trade Closed',
                        message: `Closed ${symbol} position. Net PnL: $${netPnl.toFixed(2)}`,
                        type: 'TRADE'
                    }
                });

                await updateStrategyMetrics(tx, strategyId);
            });

        } else {
            // Logic for Entry (Existing code)
            const _leverage = leverage || 1;
            const totalNotionalExposure = virtualBalance * _leverage;

            const order: any = await executeTrade(
                exchange,
                symbol,
                actionSide,
                totalNotionalExposure, // Pass the mathematically leveraged absolute exposure
                marketType,
                apiKey,
                apiSecret,
                privateKey,
                exchangePassphrase || undefined,
                leverage,
                isTestnet // Ensure testnet logic runs
            );

            // 4. Record Trade to Prisma (Position or Ledger tracking)
            if (order) {
                await prisma.$transaction(async (tx: any) => {
                    await tx.position.create({
                        data: {
                            userId,
                            strategyId,
                            subscriptionId,
                            symbol,
                            side: actionSide as any,
                            requestedAmount: totalNotionalExposure,
                            filledAmount: Number(order?.amount || 0),
                            entryPrice: Number(order?.average || order?.price || 0),
                            exchangeOrderId: orderId || order?.id || 'stub_id',
                            tvPrice: tvPrice,
                            slippage: tvPrice && (order?.average || order?.price) ? ((Number(order?.average || order?.price) - tvPrice) / tvPrice) * 100 : null,
                            isOpen: true
                        }
                    });

                    await tx.notification.create({
                        data: {
                            userId,
                            title: 'Trade Opened',
                            message: `Opened ${actionSide} position on ${symbol}.`,
                            type: 'TRADE'
                        }
                    });
                });
            }
        }
    } catch (error: any) {
        console.error(`[Worker] Failed task ${job.name}`, error);

        if (job.name === 'exit-trade' && error?.message?.match(/insufficient|reduce|balance|not found|margin|position|dust|signature|api|key|credential|precision/i)) {
            // Silently close local record
            const { positionId, strategyId, userId, symbol } = job.data;
            if (positionId) {
                await prisma.$transaction(async (tx: any) => {
                    await tx.position.update({
                        where: { id: positionId },
                        data: { isOpen: false, exitPrice: 0, realizedPnl: 0 }
                    });

                    await tx.notification.create({
                        data: {
                            userId,
                            title: 'Trade Force-Closed (Desync)',
                            message: `Local ${symbol} position closed following exchange desync.`,
                            type: 'SYSTEM'
                        }
                    });

                    await updateStrategyMetrics(tx, strategyId);
                });
                return; // Gracefully resolve the BullMQ job
            }
        }

        // Ideally we flag this to a DLQ or error table
        throw error;
    }
}, {
    connection: process.env.REDIS_URL ? new (require('ioredis'))(process.env.REDIS_URL, { maxRetriesPerRequest: null }) : {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
    }
});

worker.on('failed', (job: any, err: any) => {
    console.error(`[Worker] Job ${job?.id} failed with error ${err.message}`);
});

console.info('[Worker] BullMQ Trade Execution Worker started...');
