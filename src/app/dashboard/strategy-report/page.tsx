import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from "@/lib/prisma";
import StrategyReportClient from './StrategyReportClient';
import NotificationBell from '@/components/dashboard/NotificationBell';

export const dynamic = 'force-dynamic';

export default async function StrategyReportPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    const userId = (session.user as any).id;

    let user: any = null;
    try {
        // Pull accurate User data specifically populated with strategy subscriptions and trade history
        user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                subscriptions: {
                    include: { strategy: true },
                    orderBy: { createdAt: 'asc' }
                },
                positions: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
    } catch (e) {
        console.warn("Could not fetch user strategy reports from database. Returning empty reports.");
        user = {
            id: userId,
            isTestnetMode: false,
            usdtBalance: 0,
            usdcBalance: 0,
            paperUsdtBalance: 0,
            paperUsdcBalance: 0,
            subscriptions: [],
            positions: []
        };
    }

    if (!user) {
        redirect("/api/auth/signin");
    }

    const isPaperMode = user.isTestnetMode;

    // Filter positions and subscriptions based on the currently active toggle environment
    const modePositions = user.positions.filter((p: any) => p.isPaper === isPaperMode);
    
    // Pass strictly logically closed trades for graphing purposes (chronologically mapped earliest to latest)
    const closedPositions = modePositions
        .filter((p: any) => !p.isOpen)
        .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const modeSubscriptions = user.subscriptions.filter((s: any) => s.isPaper === isPaperMode);

    // Calculate current running margins to deduct base principle properly
    const totalBalance = isPaperMode
        ? user.paperUsdtBalance + user.paperUsdcBalance
        : user.usdtBalance + user.usdcBalance;

    return (
        <div className="p-8 pt-8 md:p-12 md:pt-12 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-row items-start justify-between gap-4 w-full">
                <div className="flex flex-col gap-2 w-full break-words">
                    <h1 className="text-4xl font-bold text-foreground tracking-tight break-words w-full">Strategy Report</h1>
                    <p className="text-foreground/60 text-lg">Analyze individual algorithmic performance and historical execution logs.</p>
                </div>
                <div className="flex-shrink-0">
                    <NotificationBell userId={user.id} className="hidden md:block" />
                </div>
            </div>

            <StrategyReportClient 
                subscriptions={modeSubscriptions} 
                positions={closedPositions} 
                totalBalance={totalBalance} 
            />
        </div>
    );
}
