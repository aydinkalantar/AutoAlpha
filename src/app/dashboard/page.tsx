import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LiveRadar from './LiveRadar';
import AnalyticsRow from './AnalyticsRow';
import StrategyPerformance from './StrategyPerformance';
import DashboardChart from './DashboardChart';
import { prisma } from "@/lib/prisma";
import TestnetToggle from './TestnetToggle';

export const dynamic = 'force-dynamic';



export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            subscriptions: {
                include: { strategy: true }
            },
            positions: {
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!user) {
        redirect("/api/auth/signin");
    }

    const isPaperMode = user.isTestnetMode;

    // Filter positions based on mode
    const modePositions = user.positions.filter((p: any) => p.isPaper === isPaperMode);
    const openPositions = modePositions.filter((p: any) => p.isOpen);

    // Select appropriate balance
    const totalBalance = isPaperMode
        ? user.paperUsdtBalance + user.paperUsdcBalance
        : user.usdtBalance + user.usdcBalance;

    // Filter subscriptions based on mode
    const modeSubscriptions = user.subscriptions.filter((s: any) => s.isPaper === isPaperMode);

    return (
        <div className="p-8 pt-20 md:p-12 md:pt-24 max-w-7xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-foreground tracking-tight">Investor Dashboard</h1>
                    <p className="text-foreground/60 mt-2 text-lg">Manage your capital and monitor active positions.</p>
                    <div className="mt-6">
                        <TestnetToggle initialMode={user.isTestnetMode} userId={user.id} />
                    </div>
                </div>

                <div className="bg-white/50 dark:bg-black/40 backdrop-blur-2xl inline-flex flex-col py-4 px-8 rounded-[1.5rem] border border-black/5 dark:border-white/10 shadow-xl relative overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent" />
                    <span className="text-sm font-bold tracking-wider uppercase mb-1 relative z-10 text-cyan-600 dark:text-cyan-400">
                        {isPaperMode ? 'Paper Capital' : 'Available Capital'}
                    </span>
                    <div className="flex items-baseline space-x-1 relative z-10">
                        <span className="text-2xl font-bold text-foreground/50">$</span>
                        <span className="text-4xl font-black text-foreground tracking-tight">{totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Top Row: Analytics (KPIs + Donut) */}
                <div className="col-span-1 lg:col-span-4">
                    <AnalyticsRow
                        positions={modePositions}
                        subscriptions={modeSubscriptions}
                        totalBalance={totalBalance}
                    />
                </div>

                {/* Middle Row: Live Radar (with integrated chart) */}
                <div className="col-span-1 lg:col-span-4 mt-2">
                    <LiveRadar openPositions={openPositions as any} />
                </div>

                {/* Bottom Row: Strategy Performance & Trade History Tabs */}
                {modeSubscriptions.length > 0 && (
                    <div className="col-span-1 lg:col-span-4 mt-4">
                        <StrategyPerformance />
                    </div>
                )}
            </div>
        </div>
    );
}
