import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LiveRadar from './LiveRadar';
import AnalyticsRow from './AnalyticsRow';
import { prisma } from "@/lib/prisma";
import TestnetToggle from './TestnetToggle';
import WelcomeModal from './WelcomeModal';
import Link from 'next/link';
import { Info } from 'lucide-react';

export const dynamic = 'force-dynamic';



export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    const userId = (session.user as any).id;

    let user: any = null;
    try {
        user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                subscriptions: {
                    include: { strategy: true }
                },
                positions: {
                    orderBy: { createdAt: 'desc' }
                },
                exchangeKeys: {
                    select: { id: true }
                }
            }
        });
    } catch (e) {
        console.warn("Could not fetch user from database. Returning default empty user object.");
        user = {
            id: userId,
            isTestnetMode: false,
            hasCompletedOnboarding: false,
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

    // Filter positions based on mode
    const modePositions = user.positions.filter((p: any) => p.isPaper === isPaperMode);
    const openPositions = modePositions.filter((p: any) => p.isOpen);
    
    // Sort closed positions chronologically oldest to newest for the Equity Curve builder
    const closedPositions = modePositions
        .filter((p: any) => !p.isOpen)
        .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Select appropriate balance
    const totalBalance = isPaperMode
        ? user.paperUsdtBalance + user.paperUsdcBalance
        : user.usdtBalance + user.usdcBalance;

    // Filter subscriptions based on mode
    const modeSubscriptions = user.subscriptions.filter((s: any) => s.isPaper === isPaperMode);

    const isApiConnected = user.exchangeKeys && user.exchangeKeys.length > 0;

    return (
        <div className="p-4 pt-10 pb-32 md:p-10 md:pt-12 md:pb-32 max-w-7xl mx-auto space-y-8 md:space-y-12">
            <WelcomeModal userId={user.id} hasCompletedOnboarding={user.hasCompletedOnboarding ?? false} />
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-4xl font-bold text-foreground tracking-tight">Investor Dashboard</h1>
                        
                        {/* API Status Badge */}
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 dark:bg-white/10 border border-black/5 dark:border-white/10 rounded-full">
                            <div className={`w-2 h-2 rounded-full ${isApiConnected ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`} />
                            <span className="text-xs font-bold tracking-wider uppercase text-foreground/70">
                                {isApiConnected ? 'API Connected' : 'API Disconnected'}
                            </span>
                        </div>

                        <Link href="/dashboard/academy" className="text-foreground/40 hover:text-cyan-500 transition-colors" title="Platform Documentation">
                            <Info className="w-5 h-5" />
                        </Link>
                    </div>
                    <p className="text-foreground/60 mt-2 text-lg">Manage your capital and monitor active positions.</p>
                    <div className="mt-6">
                        <TestnetToggle initialMode={user.isTestnetMode} userId={user.id} />
                    </div>
                </div>

                <div className="flex flex-col gap-3 md:items-end w-full md:w-auto">
                    <div className="w-full md:w-auto bg-white/50 dark:bg-white/5 backdrop-blur-2xl inline-flex flex-col py-4 px-8 rounded-[1.5rem] border border-black/5 dark:border-white/10 shadow-xl relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent" />
                        <span className="text-sm font-bold tracking-wider uppercase mb-1 relative z-10 text-cyan-600 dark:text-cyan-400">
                            {isPaperMode ? 'Paper Capital' : 'Connected Exchange Balance'}
                        </span>
                        <div className="flex items-baseline space-x-1 relative z-10">
                            <span className="text-2xl font-bold text-foreground/50">$</span>
                            <span className="text-4xl font-black text-foreground tracking-tight">{totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    {/* Gas Tank Widget */}
                    <div className="w-full md:w-auto bg-white/50 dark:bg-white/5 backdrop-blur-xl flex items-center justify-between gap-6 py-3 px-6 rounded-xl border border-black/5 dark:border-white/10 shadow-md">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold tracking-wider uppercase text-foreground/50">Gas Tank Balance</span>
                            <span className="text-base font-bold text-foreground">
                                ${(user.usdtBalance + user.usdcBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC
                            </span>
                        </div>
                        <Link href="/dashboard/deposit" className="text-xs font-bold tracking-wider uppercase text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 rounded-lg transition-colors border border-cyan-500/20">
                            Top Up
                        </Link>
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

                {/* Middle Row: Live Radar */}
                <div className="col-span-1 lg:col-span-4 mt-2">
                    <LiveRadar openPositions={openPositions as any} isPaperMode={isPaperMode} />
                </div>
            </div>
        </div>
    );
}
