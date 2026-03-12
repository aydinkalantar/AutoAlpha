import { NextResponse } from 'next/server';
import { Queue } from 'bullmq';
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


const redisConnection: any = process.env.REDIS_URL 
    ? new (require('ioredis'))(process.env.REDIS_URL, { maxRetriesPerRequest: null, family: 0 }) 
    : {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
    };

const tradeQueue = new Queue('qa-test-queue', {
    connection: redisConnection
});

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Fetch last 50 jobs from BullMQ (completed, failed, active, waiting)
        const jobs = await tradeQueue.getJobs(['completed', 'failed', 'active', 'waiting'], 0, 50, true);

        const serializedJobs = jobs.map(j => ({
            id: j.id,
            name: j.name,
            data: j.data,
            state: j.finishedOn ? (j.failedReason ? 'failed' : 'completed') : 'pending',
            failedReason: j.failedReason,
            timestamp: j.timestamp,
            finishedOn: j.finishedOn,
        }));

        // Fetch last 50 Position updates from Prisma
        const positions = await prisma.position.findMany({
            take: 50,
            orderBy: {
                updatedAt: 'desc'
            },
            include: {
                user: { select: { email: true } },
                strategy: { select: { name: true } }
            }
        });

        return NextResponse.json({
            jobs: serializedJobs,
            positions
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Clean up to 1000 completed and failed jobs
        await tradeQueue.clean(0, 1000, 'completed');
        await tradeQueue.clean(0, 1000, 'failed');

        return NextResponse.json({ success: true, message: 'Queue purged successfully' });
    } catch (error: any) {
        console.error("Failed to purge queue", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
