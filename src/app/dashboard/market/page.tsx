import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from "@/lib/prisma";
import DashboardClientWrapper from '../DashboardClientWrapper';
import { getActiveStrategies } from '../actions';

export const dynamic = 'force-dynamic';



export default async function MarketPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    const userId = (session.user as any).id;
    const strategies = await getActiveStrategies();

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            subscriptions: {
                include: { strategy: true }
            },
            exchangeKeys: true
        }
    });

    if (!user) {
        redirect("/api/auth/signin");
    }

    const isPaperMode = user.isTestnetMode;
    const usdtBalance = isPaperMode ? user.paperUsdtBalance : user.usdtBalance;
    const usdcBalance = isPaperMode ? user.paperUsdcBalance : user.usdcBalance;
    const modeSubscriptions = user.subscriptions.filter((s: any) => s.isPaper === isPaperMode);
    
    // Filter purely valid exchange keys matching the active sandbox mode environment
    const connectedExchanges = user.exchangeKeys
        .filter(key => key.isTestnet === isPaperMode && key.isValid)
        .map(key => key.exchange);

    return (
        <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-4xl font-bold text-foreground tracking-tight">Strategy Marketplace</h1>
                        <p className="text-foreground/60 mt-2 text-lg">
                            Browse and subscribe to institutional-grade trading algorithms.
                            {isPaperMode && <span className="inline-flex items-center px-3 py-1 ml-3 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-sm font-bold uppercase tracking-wider relative -top-0.5">Sandbox Mode</span>}
                        </p>
                    </div>
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
