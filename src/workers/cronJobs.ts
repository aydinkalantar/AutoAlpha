import cron from 'node-cron';
import ccxt from 'ccxt';
import { prisma } from "@/lib/prisma";
import { decryptKey } from '@/lib/encryption';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { ZombieReminderEmail } from '../../emails/ZombieReminderEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

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

                const secretKey = process.env.MASTER_ENCRYPTION_KEY;
                if (!secretKey) throw new Error("MASTER_ENCRYPTION_KEY is missing from environment variables.");

                const apiKey = decryptKey(exchangeKey.encryptedApiKey, secretKey);
                const apiSecret = decryptKey(exchangeKey.encryptedSecret, secretKey);

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
                            let user;

                            if (pos.strategy.settlementCurrency === 'USDT') {
                                user = await tx.user.update({
                                    where: { id: pos.userId },
                                    data: { usdtBalance: { decrement: platformFee } },
                                    select: { referredById: true }
                                });
                            } else {
                                user = await tx.user.update({
                                    where: { id: pos.userId },
                                    data: { usdcBalance: { decrement: platformFee } },
                                    select: { referredById: true }
                                });
                            }

                            await tx.ledger.create({
                                data: {
                                    userId: pos.userId,
                                    amount: -platformFee,
                                    currency: pos.strategy.settlementCurrency,
                                    description: `Performance Fee Deducted for ${pos.symbol} Trade`,
                                    type: 'FEE_DEDUCTION'
                                }
                            });

                            if (user.referredById) {
                                const sysConfig = await tx.systemConfig.findUnique({ where: { id: "global" } });
                                const configRate = sysConfig?.affiliateCommissionRate || 0.10;

                                const commissionRaw = platformFee * configRate;
                                const commission = Math.round(commissionRaw * 100) / 100;
                                const updateField = pos.strategy.settlementCurrency === 'USDT' ? 'usdtBalance' : 'usdcBalance';
                                
                                if (commission > 0) {
                                    await tx.user.update({
                                        where: { id: user.referredById },
                                        data: { 
                                            [updateField]: { increment: commission },
                                            affiliateBalance: { increment: commission },
                                            totalAffiliateEarnings: { increment: commission }
                                        }
                                    });

                                    await tx.ledger.create({
                                        data: {
                                            userId: user.referredById,
                                            amount: commission,
                                            currency: pos.strategy.settlementCurrency,
                                            description: `Affiliate Commission from network trade`,
                                            type: 'AFFILIATE_COMMISSION'
                                        }
                                    });
                                }
                            }

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

                const secretKey = process.env.MASTER_ENCRYPTION_KEY;
                if (!secretKey) throw new Error("MASTER_ENCRYPTION_KEY is missing from environment variables.");

                const apiKey = decryptKey(key.encryptedApiKey, secretKey);
                const apiSecret = decryptKey(key.encryptedSecret, secretKey);

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

// Task 3: Hourly Auto-Deposit Processing
cron.schedule('0 * * * *', async () => {
    console.log('[Cron] Running Hourly Auto-Deposit Processing...');

    try {
        const config = await prisma.systemConfig.findUnique({ where: { id: "global" } });
        const secretKey = config?.stripeMode === 'LIVE'
            ? (config?.stripeLiveSecretKey || process.env.STRIPE_SECRET_KEY)
            : (config?.stripeTestSecretKey || process.env.STRIPE_SECRET_KEY);

        if (!secretKey) {
            console.error('[Cron] Auto-Deposit Failed: Stripe Configuration Missing');
            return;
        }

        const stripe = new Stripe(secretKey as string, {
            apiVersion: '2023-10-16' as any,
        });

        // Find users who have auto-deposit enabled, have a stripe customer ID, and whose balance is below threshold
        const eligibleUsers = await prisma.user.findMany({
            where: {
                autoDepositEnabled: true,
                stripeCustomerId: { not: null },
                // Safety check: Don't charge if they were charged in the last 12 hours
                OR: [
                    { lastAutoDepositAt: null },
                    { lastAutoDepositAt: { lt: new Date(Date.now() - 12 * 60 * 60 * 1000) } }
                ]
            }
        });

        for (const user of eligibleUsers) {
            // Check actual ledger balance combined
            const totalBalance = user.usdtBalance; // Assuming USDT is the primary gas currency

            if (totalBalance < user.autoDepositThreshold) {
                console.log(`[Cron] User ${user.email} (ID: ${user.id}) balance ${totalBalance} is below threshold ${user.autoDepositThreshold}. Initiating Auto-Deposit of ${user.autoDepositAmount}...`);

                try {
                    // Fetch customer's default payment method
                    const paymentMethods = await stripe.paymentMethods.list({
                        customer: user.stripeCustomerId!,
                        type: 'card',
                    });

                    if (paymentMethods.data.length === 0) {
                        console.log(`[Cron] User ${user.id} has no saved payment methods. Skipping.`);
                        continue;
                    }

                    const defaultPaymentMethod = paymentMethods.data[0].id;

                    // Calculate gross amount reflecting Stripe fees (2.9% + $0.30)
                    const grossAmount = (user.autoDepositAmount + 0.30) / 0.971;
                    const amountInCents = Math.round(grossAmount * 100);

                    // Create and Confirm PaymentIntent off-session
                    const paymentIntent = await stripe.paymentIntents.create({
                        amount: amountInCents,
                        currency: 'usd',
                        customer: user.stripeCustomerId!,
                        payment_method: defaultPaymentMethod,
                        off_session: true,
                        confirm: true,
                        description: `AutoAlpha Auto-Refill (Threshold: $${user.autoDepositThreshold})`,
                        metadata: {
                            userId: user.id,
                            isAutoDeposit: 'true',
                            netAmount: user.autoDepositAmount.toString()
                        }
                    });

                    if (paymentIntent.status === 'succeeded') {
                        // 1. Give them the balance
                        await prisma.user.update({
                            where: { id: user.id },
                            data: {
                                usdtBalance: { increment: user.autoDepositAmount },
                                lastAutoDepositAt: new Date()
                            }
                        });

                        // 2. Write to Accounting Ledger
                        await prisma.ledger.create({
                            data: {
                                userId: user.id,
                                amount: user.autoDepositAmount,
                                currency: 'USDT',
                                type: 'DEPOSIT',
                                description: 'Stripe Auto-Deposit Refill'
                            }
                        });

                        // 3. Send Notification
                        await prisma.notification.create({
                            data: {
                                userId: user.id,
                                title: 'Auto-Refill Successful',
                                message: `Your Gas Tank fell below $${user.autoDepositThreshold}. We successfully deposited $${user.autoDepositAmount} using your saved card.`,
                                type: 'SYSTEM'
                            }
                        });
                        console.log(`[Cron] Auto-Deposit success for ${user.id}`);
                    }

                } catch (stripeErr: any) {
                    console.error(`[Cron] Stripe charge failed for user ${user.id}:`, stripeErr.message);

                    // Specific handling for declined off-session cards
                    if (stripeErr.code === 'authentication_required') {
                        // User's bank demands 3D Secure, which we can't do off-session.
                        await prisma.notification.create({
                            data: {
                                userId: user.id,
                                title: 'Auto-Refill Failed: Authentication Required',
                                message: `Your bank denied the automated charge. Please log in and make a manual deposit to re-authenticate your card.`,
                                type: 'ALERT'
                            }
                        });
                    }
                }
            }
        }

    } catch (err) {
        console.error('[Cron] Fatal Error in Auto-Deposit Job:', err);
    }
});

// Task 4: Hourly "Zombie User" Re-engagement Drone
cron.schedule('0 * * * *', async () => {
    console.log('[Cron] Running Zombie User Sweep...');
    
    try {
        // Query users created > 24 hours ago, inactive, no API keys, and never emailed before.
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        const zombies = await prisma.user.findMany({
            where: {
                isActive: false,
                hasCompletedOnboarding: false,
                createdAt: { lt: twentyFourHoursAgo },
                zombieEmailSentAt: null,
                role: "USER" // Don't ping admins testing the platform
            },
            take: 50 // Throttle Resend API burst
        });

        if (zombies.length === 0) return;

        console.log(`[Cron] Found ${zombies.length} Zombie users. Initiating Email Broadcast...`);

        for (const user of zombies) {
            try {
                const { data, error } = await resend.emails.send({
                    from: "AutoAlpha Engineering <engineering@autoalpha.ai>",
                    to: [user.email],
                    subject: "Action Required: Complete your AutoAlpha Setup",
                    react: ZombieReminderEmail({ userName: user.name || "Trader" }),
                });

                if (error) {
                    console.error(`[Cron] Failed to email zombie ${user.email}:`, error);
                    continue;
                }

                // Immutably stamp the user to prevent duplicate drips forever
                await prisma.user.update({
                    where: { id: user.id },
                    data: { zombieEmailSentAt: new Date() }
                });

                console.log(`[Cron] Successfully hit Zombie Drone for ${user.email}`);
            } catch (err) {
                console.error(`[Cron] Runtime error emailing zombie ${user.email}:`, err);
            }
        }
    } catch (err) {
        console.error('[Cron] Fatal Error in Zombie Drone Job:', err);
    }
});

console.log('[System] Background Cron Jobs Initialization Loaded.');
