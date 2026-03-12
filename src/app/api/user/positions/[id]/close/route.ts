import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Queue } from "bullmq";



const tradeQueue = new Queue('qa-test-queue', {
    connection: process.env.REDIS_URL ? new (require('ioredis'))(process.env.REDIS_URL, { maxRetriesPerRequest: null, family: 0 }) : {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
    }
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const positionId = id;
        const userId = (session.user as any).id;

        // Verify the position belongs to the user and is OPEN
        const position = await prisma.position.findFirst({
            where: {
                id: positionId,
                subscription: {
                    userId: userId
                },
                isOpen: true
            },
            include: {
                subscription: {
                    include: { strategy: true }
                }
            }
        });

        if (!position || !position.subscription) {
            return NextResponse.json({ error: "Position not found, already closed, or not linked to a subscription." }, { status: 404 });
        }

        // To cleanly exit, we map real payload expectations matching tradeWorker
        const closeSide = ['LONG', 'BUY'].includes(position.side) ? 'SELL' : 'BUY';
        const strategy = position.subscription.strategy;
        const execExchange = (strategy.targetExchange as string) === 'UNIVERSAL' ? position.subscription.exchange : strategy.targetExchange;

        // Enqueue Exit Job specifically for this user's subscription
        await tradeQueue.add('exit-trade', {
            positionId: position.id,
            strategyId: strategy.id,
            subscriptionId: position.subscription.id,
            userId: userId,
            symbol: position.symbol,
            closeSide,
            filledAmount: position.filledAmount,
            exchange: execExchange,
            marketType: strategy.marketType,
            settlementCurrency: strategy.settlementCurrency,
            performanceFeePercentage: strategy.performanceFeePercentage,
            virtualBalance: position.subscription.currentVirtualBalance,
            leverage: strategy.leverage,
            isPaper: position.isPaper
        });

        return NextResponse.json({ success: true, message: "Emergency close dispatched." });
    } catch (error) {
        console.error("Force close specific error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
