import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from "@/lib/prisma";
import DashboardClientWrapper from '../DashboardClientWrapper';
import { getActiveStrategies } from '../actions';
import NotificationBell from '@/components/dashboard/NotificationBell';

export const dynamic = 'force-dynamic';



export default async function MarketPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    const userId = (session.user as any).id;
    let strategies: any[] = [];
    let user: any = null;

    try {
        strategies = await getActiveStrategies();
        user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                subscriptions: {
                    include: { strategy: true },
                    orderBy: { createdAt: 'asc' }
                },
                exchangeKeys: true
            }
        });
    } catch (e) {
        console.warn("Could not fetch strategies or user from database. Returning empty array.");
        user = {
            id: userId,
            isTestnetMode: false,
            usdtBalance: 0,
            usdcBalance: 0,
            paperUsdtBalance: 0,
            paperUsdcBalance: 0,
            subscriptions: [],
            exchangeKeys: []
        };
    }

    if (!user) {
        redirect("/api/auth/signin");
    }

    const isPaperMode = user.isTestnetMode;
    const usdtBalance = isPaperMode ? user.paperUsdtBalance : user.usdtBalance;
    const usdcBalance = isPaperMode ? user.paperUsdcBalance : user.usdcBalance;
    const modeSubscriptions = user.subscriptions.filter((s: any) => s.isPaper === isPaperMode);
    
    // Filter purely valid exchange keys matching the active sandbox mode environment
    const connectedExchanges = user.exchangeKeys
        .filter((key: any) => key.isTestnet === isPaperMode && key.isValid)
        .map((key: any) => key.exchange);

    return (
        <div className="p-4 pt-8 pb-32 md:p-10 md:pt-12 md:pb-32 max-w-7xl mx-auto space-y-8 md:space-y-12">
            <div className="flex flex-row items-start justify-between gap-4 w-full">
                <div className="flex flex-col gap-3 w-full break-words">
                    <h1 className="text-4xl font-bold text-foreground tracking-tight break-words w-full">Strategy Marketplace</h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
                        <p className="text-foreground/60 text-lg">
                            Browse and subscribe to institutional-grade trading algorithms.
                        </p>
                        {isPaperMode && (
                            <div className="w-fit inline-flex items-center px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs sm:text-sm font-bold uppercase tracking-wider">
                                Testnet Mode
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex-shrink-0">
                    <NotificationBell userId={user.id} className="hidden md:block" />
                </div>
            </div>

            <DashboardClientWrapper
                strategies={strategies}
                subscriptions={modeSubscriptions}
                userId={user.id}
                usdtBalance={usdtBalance}
                usdcBalance={usdcBalance}
                isPaperMode={isPaperMode}
                connectedExchanges={connectedExchanges}
            />
        </div>
    );
}
