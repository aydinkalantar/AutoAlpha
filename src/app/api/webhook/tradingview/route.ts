import { prisma } from "@/lib/prisma";
import { Queue } from 'bullmq';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import Redis from 'ioredis';



const redisConnection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const tradeQueue = new Queue('qa-test-queue', {
    connection: redisConnection
});

const redisClient = new Redis(redisConnection);

export async function POST(req: Request) {
    try {
        const payload = await req.json();

        let { webhookToken, symbol, side, action, order_id, price } = payload;

        // Support TradingView's {{strategy.order.action}} dynamic variable
        let rawAction = side || action;

        if (!webhookToken || !symbol || !rawAction) {
            return new Response('Missing required fields', { status: 400 });
        }

        // --- PHASE 1 QA AUDIT FIX: 2-Second Duplicate Payload Prevention ---
        const payloadSignature = `${webhookToken}_${symbol}_${rawAction}`;
        const hash = crypto.createHash('sha256').update(payloadSignature).digest('hex');

        // Try to set a lock in Redis for this specific payload hash. Expires in 2 seconds.
        const lockAcquired = await redisClient.set(`webhook_lock:${hash}`, 'LOCKED', 'EX', 2, 'NX');

        if (!lockAcquired) {
            // Duplicate payload dropped
            return NextResponse.json({ success: true, message: 'Duplicate payload dropped' }, { status: 200 });
        }
        // -------------------------------------------------------------------

        rawAction = String(rawAction).trim().toLowerCase();
        let parsedSide = '';

        if (['buy', 'long', 'enter long'].includes(rawAction)) {
            parsedSide = 'LONG';
        } else if (['sell', 'short', 'enter short'].includes(rawAction)) {
            parsedSide = 'SHORT';
        } else if (['exit', 'close', 'exit long', 'exit short', 'close long', 'close short', 'long exit', 'short exit'].includes(rawAction)) {
            parsedSide = 'EXIT';
        } else {
            return new Response(`Invalid action/side provided: ${rawAction}`, { status: 400 });
        }

        // 1. Validate Webhook Token and get the Strategy
        const strategy = await prisma.strategy.findUnique({
            where: { webhookToken }
        });

        if (!strategy) {
            return new Response('Invalid webhook token', { status: 401 });
        }

        if (!strategy.isActive) {
            return new Response('Strategy is currently inactive', { status: 400 });
        }

        if (parsedSide === 'EXIT') {
            // Determine if the exit is specifically for LONGs or SHORTs
            let sideToClose: ('LONG' | 'SHORT') | undefined = undefined;
            if (rawAction.includes('long') || rawAction.includes('buy')) {
                sideToClose = 'LONG';
            } else if (rawAction.includes('short') || rawAction.includes('sell')) {
                sideToClose = 'SHORT';
            }

            // Logic for Exiting Trades
            const openPositions = await prisma.position.findMany({
                where: {
                    strategyId: strategy.id,
                    symbol,
                    isOpen: true,
                    ...(sideToClose ? { side: { in: sideToClose === 'LONG' ? ['LONG', 'BUY'] : ['SHORT', 'SELL'] } } : {})
                },
                include: {
                    subscription: true,
                    user: { include: { exchangeKeys: true } }
                }
            });

            if (openPositions.length === 0) {
                return new Response('No open positions to close', { status: 200 });
            }

            const jobs = openPositions
                .filter(pos => {
                    if (pos.isPaper) return true;
                    // For real live positions, ensure the user has a valid API key attached
                    const execExchange = (strategy.targetExchange as string) === 'UNIVERSAL' && pos.subscription ? pos.subscription.exchange : strategy.targetExchange;
                    const validKey = pos.user.exchangeKeys.find(key => key.exchange === execExchange && key.isValid);
                    return !!validKey;
                })
                .map(pos => {
                    // Reverse the side to close
                    const closeSide = ['LONG', 'BUY'].includes(pos.side) ? 'SELL' : 'BUY';
                    const execExchange = (strategy.targetExchange as string) === 'UNIVERSAL' && pos.subscription ? pos.subscription.exchange : strategy.targetExchange;
                    return {
                        name: 'exit-trade',
                        data: {
                            positionId: pos.id,
                            strategyId: strategy.id,
                            subscriptionId: pos.subscriptionId,
                            userId: pos.userId,
                            symbol: pos.symbol,
                            closeSide,
                            filledAmount: pos.filledAmount, // Exactly what was bought/shorted
                            exchange: execExchange,
                            marketType: strategy.marketType,
                            settlementCurrency: strategy.settlementCurrency,
                            performanceFeePercentage: strategy.performanceFeePercentage,
                            virtualBalance: pos.subscription?.currentVirtualBalance || strategy.defaultEquityPercentage,
                            leverage: pos.leverage,
                            isPaper: pos.isPaper
                        }
                    };
                });

            await tradeQueue.addBulk(jobs);

            return NextResponse.json({
                success: true,
                exitsQueued: jobs.length
            });
        }

        // Logic for Entry Trades
        const subscriptions = await prisma.subscription.findMany({
            where: {
                strategyId: strategy.id,
                isActive: true, // They must be active
                currentVirtualBalance: { gt: 0 } // Must have balance to trade
            },
            include: {
                user: { include: { exchangeKeys: true } }
            }
        });

        if (subscriptions.length === 0) {
            return new Response('No active subscribers with balance', { status: 200 });
        }

        // --- PHASE 27: AUTO-CLOSE OPPOSITE POSITIONS (Non-Hedging Mode) ---
        // If this is an ENTRY signal, check if there are any open positions on the OPPOSITE side
        // and queue exits for them before we process the new entry.
        const oppositeSide = parsedSide === 'LONG' ? ['SHORT', 'SELL'] : ['LONG', 'BUY'];

        const opposingPositions = await prisma.position.findMany({
            where: {
                strategyId: strategy.id,
                symbol,
                isOpen: true,
                side: { in: oppositeSide }
            },
            include: {
                subscription: true,
                user: { include: { exchangeKeys: true } }
            }
        });

        if (opposingPositions.length > 0) {
            const exitJobs = opposingPositions
                .filter(pos => {
                    if (pos.isPaper) return true;
                    // Ensure the user has a valid API key attached
                    const execExchange = (strategy.targetExchange as string) === 'UNIVERSAL' && pos.subscription ? pos.subscription.exchange : strategy.targetExchange;
                    const validKey = pos.user.exchangeKeys.find(key => key.exchange === execExchange && key.isValid);
                    return !!validKey;
                })
                .map(pos => {
                    // Reverse the side to close
                    const closeSide = ['LONG', 'BUY'].includes(pos.side) ? 'SELL' : 'BUY';
                    const execExchange = (strategy.targetExchange as string) === 'UNIVERSAL' && pos.subscription ? pos.subscription.exchange : strategy.targetExchange;
                    return {
                        name: 'exit-trade',
                        data: {
                            positionId: pos.id,
                            strategyId: strategy.id,
                            subscriptionId: pos.subscriptionId,
                            userId: pos.userId,
                            symbol: pos.symbol,
                            closeSide,
                            filledAmount: pos.filledAmount, // Exactly what was bought/shorted
                            exchange: execExchange,
                            marketType: strategy.marketType,
                            settlementCurrency: strategy.settlementCurrency,
                            performanceFeePercentage: strategy.performanceFeePercentage,
                            virtualBalance: pos.subscription?.currentVirtualBalance || strategy.defaultEquityPercentage,
                            leverage: pos.leverage,
                            isPaper: pos.isPaper
                        }
                    };
                });

            if (exitJobs.length > 0) {
                // Auto-closing opposing positions
                await tradeQueue.addBulk(exitJobs);
            }
        }
        // --- END AUTO-CLOSE LOGIC ---

        // 3. Queue jobs for each subscriber
        const jobs = subscriptions
            .filter(sub => {
                if (sub.isPaper) return true;
                const execExchange = (strategy.targetExchange as string) === 'UNIVERSAL' ? sub.exchange : strategy.targetExchange;
                const validKey = sub.user.exchangeKeys.find(key => key.exchange === execExchange && key.isValid);
                return !!validKey;
            })
            .map(sub => {
                const execExchange = (strategy.targetExchange as string) === 'UNIVERSAL' ? sub.exchange : strategy.targetExchange;
                return {
                    name: 'execute-trade',
                    data: {
                        strategyId: strategy.id,
                        subscriptionId: sub.id,
                        userId: sub.userId,
                        symbol,
                        side: parsedSide,
                        exchange: execExchange,
                        marketType: strategy.marketType,
                        settlementCurrency: strategy.settlementCurrency,
                        virtualBalance: sub.currentVirtualBalance,
                        leverage: strategy.leverage,
                        isPaper: sub.isPaper,
                        orderId: order_id || undefined, // Pass down the TV string if it exists
                        tvPrice: price ? Number(price) : undefined // For Slippage Monitor
                    }
                };
            });

        await tradeQueue.addBulk(jobs);

        return NextResponse.json({
            success: true,
            queued: jobs.length
        });

    } catch (error) {
        console.error('TradingView Webhook Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
