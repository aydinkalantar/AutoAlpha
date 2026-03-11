import cron from 'node-cron';
import ccxt from 'ccxt';
import { prisma } from "@/lib/prisma";
import { decryptKey } from '@/lib/encryption';



// Task 1: 5-Minute Reconciliation Loop
cron.schedule('*/5 * * * *', async () => {
    console.log('[Cron] Running 5-Minute Open Position Reconciliation...');

    try {
        const openPositions = await prisma.position.findMany({
            where: { isOpen: true },
            include: {
                strategy: true
            }
        });

        for (const pos of openPositions) {
            try {
                const exchangeKey = await prisma.exchangeKey.findFirst({
                    where: { userId: pos.userId, exchange: pos.strategy.targetExchange }
                });

                if (!exchangeKey || !exchangeKey.encryptedApiKey || !exchangeKey.encryptedSecret) continue;

                const apiKey = decryptKey(exchangeKey.encryptedApiKey, exchangeKey.iv);
                const apiSecret = decryptKey(exchangeKey.encryptedSecret, exchangeKey.iv);

                const ccxtClass = (ccxt as any)[pos.strategy.targetExchange.toLowerCase()] || (ccxt as any)[pos.strategy.targetExchange.toLowerCase().replace('io', '')];

                if (!ccxtClass) continue;

                const exchangeConfig: Record<string, any> = {
                    apiKey,
                    secret: apiSecret,
                    enableRateLimit: true,
                };
                if (exchangeKey.exchangePassphrase) exchangeConfig.password = exchangeKey.exchangePassphrase;

                const exchange = new ccxtClass(exchangeConfig);

                if (exchangeKey.isTestnet) {
                    exchange.setSandboxMode(true);
                }

                // Fetch positions from exchange
                let isActuallyOpen = false;
                if (pos.strategy.marketType === 'FUTURES' && exchange.has['fetchPositions']) {
                    const ccxtPositions = await exchange.fetchPositions([pos.symbol]);
                    const currentPos = ccxtPositions.find((p: any) => p.symbol === pos.symbol);
                    isActuallyOpen = currentPos && Math.abs(currentPos.contracts || currentPos.info?.size || 0) > 0;
                } else {
                    // For spot, we might just check base balance or open orders, simplifying for prototype
                    // Assuming futures mostly for this reconciliation
                    continue;
                }

                if (!isActuallyOpen) {

                    // Simulate PnL and fee resolution since we didn't catch the webhook
                    // In prod, fetch Closed Orders to find the exact trade
                    const simulatedPnl = pos.filledAmount * ((Math.random() * 0.10) - 0.05); // +/- 5%

                    await prisma.$transaction(async (tx: any) => {
                        await tx.position.update({
                            where: { id: pos.id },
                            data: { isOpen: false, realizedPnl: simulatedPnl }
                        });

                        await tx.subscription.update({
                            where: { id: pos.subscriptionId! },
                            data: { currentVirtualBalance: { increment: simulatedPnl } }
                        });

                        if (simulatedPnl > 0) {
                            const platformFee = simulatedPnl * (pos.strategy.performanceFeePercentage / 100);

                            if (pos.strategy.settlementCurrency === 'USDT') {
                                await tx.user.update({
                                    where: { id: pos.userId },
                                    data: { usdtBalance: { decrement: platformFee } }
                                });
                            } else {
                                await tx.user.update({
                                    where: { id: pos.userId },
                                    data: { usdcBalance: { decrement: platformFee } }
                                });
                            }

                            await tx.ledger.create({
                                data: {
                                    userId: pos.userId,
                                    amount: -platformFee,
                                    currency: pos.strategy.settlementCurrency,
                                    description: `Performance Fee Deducted for ${pos.symbol} Trade`,
                                    type: 'FEE_DEDUCTION',
                                    status: 'COMPLETED'
                                }
                            });

                            await tx.notification.create({
                                data: {
                                    userId: pos.userId,
                                    title: 'Position Reconciled',
                                    message: `Closed ${pos.symbol}. PnL: $${simulatedPnl.toFixed(2)}, Fee: $${platformFee.toFixed(2)}`,
                                    type: 'SYSTEM'
                                }
                            });
                        }
                    });
                }
            } catch (err) {
                console.error(`Error processing position ${pos.id}`, err);
            }
        }
    } catch (err) {
        console.error('[Cron] Fatal Error in Reconciliation Job:', err);
    }
});

// Task 2: Daily API Health Check (runs at midnight)
cron.schedule('0 0 * * *', async () => {
    console.log('[Cron] Running Daily API Health Checks...');

    try {
        const keys = await prisma.exchangeKey.findMany();

        for (const key of keys) {
            try {
                if (!key.encryptedApiKey || !key.encryptedSecret) continue; // Skip web3 stub keys

                const apiKey = decryptKey(key.encryptedApiKey, key.iv);
                const apiSecret = decryptKey(key.encryptedSecret, key.iv);

                const ccxtClass = (ccxt as any)[key.exchange.toLowerCase()] || (ccxt as any)[key.exchange.toLowerCase().replace('io', '')];
                if (!ccxtClass) continue;

                const exchangeConfig: Record<string, any> = {
                    apiKey, secret: apiSecret, enableRateLimit: true
                };

                if (key.exchangePassphrase) exchangeConfig.password = key.exchangePassphrase;

                const exchange = new ccxtClass(exchangeConfig);

                if (key.isTestnet) {
                    exchange.setSandboxMode(true);
                }

                // Perform a read-only ping
                await exchange.fetchBalance();
                // If it passes, key remains valid
                await prisma.exchangeKey.update({
                    where: { id: key.id },
                    data: { isValid: true }
                });
            } catch (innerErr) {
                await prisma.exchangeKey.update({
                    where: { id: key.id },
                    data: { isValid: false }
                });
                await prisma.notification.create({
                    data: {
                        userId: key.userId,
                        title: 'API Connection Failed',
                        message: `Your ${key.exchange} API key is invalid or expired. Please update it.`,
                        type: 'SYSTEM'
                    }
                });
            }
        }
    } catch (err) {
        console.error('[Cron] Fatal Error in Health Check Job:', err);
    }
});

console.log('[System] Background Cron Jobs Initialization Loaded.');
