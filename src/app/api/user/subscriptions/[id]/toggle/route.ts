import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTradeQueue } from "@/lib/queue";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const subscriptionId = id;
        const userId = (session.user as any).id;

        const sub = await prisma.subscription.findFirst({
            where: { id: subscriptionId, userId: userId },
            include: { strategy: true }
        });

        if (!sub) {
            return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
        }

        const newIsActive = !sub.isActive;

        await prisma.subscription.update({
            where: { id: subscriptionId },
            data: { isActive: newIsActive }
        });

        let exitsQueued = 0;

        // Auto Close Positions logic if toggled OFF
        if (newIsActive === false) {
            const strategy = sub.strategy;

            const openPositions = await prisma.position.findMany({
                where: {
                    subscriptionId: subscriptionId,
                    isOpen: true
                },
                include: {
                    user: { include: { exchangeKeys: true } }
                }
            });

            if (openPositions.length > 0) {
                const jobs = openPositions
                    .filter(pos => {
                        if (pos.isPaper) return true;
                        // For real live positions, ensure the user has a valid API key attached
                        const execExchange = (strategy.targetExchange as string) === 'UNIVERSAL' ? sub.exchange : strategy.targetExchange;
                        const validKey = pos.user.exchangeKeys.find(key => key.exchange === execExchange && key.isValid);
                        return !!validKey;
                    })
                    .map(pos => {
                        // Reverse the side to close
                        const closeSide = ['LONG', 'BUY'].includes(pos.side) ? 'SELL' : 'BUY';
                        const execExchange = (strategy.targetExchange as string) === 'UNIVERSAL' ? sub.exchange : strategy.targetExchange;
                        
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
                                virtualBalance: sub.currentVirtualBalance || strategy.defaultEquityPercentage,
                                leverage: pos.leverage,
                                isPaper: pos.isPaper
                            }
                        };
                    });

                const tradeQueue = getTradeQueue();
                if (jobs.length > 0) {
                    await tradeQueue.addBulk(jobs);
                    exitsQueued = jobs.length;
                }
            }
        }

        return NextResponse.json({ success: true, isActive: newIsActive, exitsQueued });
    } catch (error) {
        console.error("Toggle strategy error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
