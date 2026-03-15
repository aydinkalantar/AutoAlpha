import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from "@/lib/prisma";
import Link from 'next/link';
import { Info, AlertTriangle, ArrowRight, LayoutDashboard } from 'lucide-react';
import NotificationBell from '@/components/dashboard/NotificationBell';
import TestnetToggle from './TestnetToggle';
import WelcomeModal from './WelcomeModal';

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
                    include: { strategy: true },
                    orderBy: { createdAt: 'asc' }
                },
                positions: {
                    orderBy: { createdAt: 'desc' } // Realized PnL logic depends on this
                },
                exchangeKeys: {
                    select: { id: true, isValid: true }
                }
            }
        });
    } catch (e) {
        console.warn("Could not fetch user from database.");
        redirect("/api/auth/signin");
    }

    if (!user) {
        redirect("/api/auth/signin");
    }

    const isPaperMode = user.isTestnetMode;
    const isApiConnected = user.exchangeKeys && user.exchangeKeys.some((k: any) => k.isValid === true);

    // Capital & Balance Logic
    const totalBalance = isPaperMode
        ? user.paperUsdtBalance + user.paperUsdcBalance
        : (isApiConnected ? (user.usdtBalance + user.usdcBalance) : 0);

    const gasTankBalance = user.usdtBalance + user.usdcBalance; // Gas tank is always real balance
    const isGasTankLow = gasTankBalance < 10 && !isPaperMode;

    // Filter Arrays by Mode
    const modePositions = user.positions.filter((p: any) => p.isPaper === isPaperMode);
    const closedPositions = modePositions.filter((p: any) => !p.isOpen);
    const modeSubscriptions = user.subscriptions.filter((s: any) => s.isPaper === isPaperMode);

    // Calculate Global PnL
    const cumulativePnl = closedPositions.reduce((sum: number, pos: any) => sum + (pos.realizedPnl || 0), 0);
    const roiPercentage = totalBalance > 0 ? (cumulativePnl / totalBalance) * 100 : 0;
    
    const pnlFormatted = roiPercentage === 0 ? "0.00" : `${roiPercentage > 0 ? '+' : ''}${roiPercentage.toFixed(2)}`;
    const isPositivePnl = roiPercentage > 0;
    const isZeroPnl = roiPercentage === 0;

    return (
        <div className="p-4 pt-8 pb-32 md:p-10 md:pt-12 md:pb-32 max-w-7xl mx-auto space-y-8 md:space-y-12">
            <WelcomeModal userId={user.id} hasCompletedOnboarding={user.hasCompletedOnboarding ?? false} />
            
            <div className="flex flex-col gap-8 md:gap-12 w-full">
                
                {/* 1. The Macro Header (The Money) */}
                <div className="flex flex-col md:flex-row items-start justify-between gap-6 w-full">
                    <div className="flex flex-col w-full relative z-10">
                        <span className="text-sm font-bold tracking-wider uppercase text-foreground/50 mb-1">
                            {isPaperMode ? 'Paper Portfolio Value' : 'Live Portfolio Value'}
                        </span>
                        <div className="flex flex-wrap items-baseline gap-4 md:gap-6">
                            <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter">
                                ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h1>
                            
                            {/* PnL Neon Glow Effect */}
                            <div className="flex items-center">
                                <span className={`text-2xl md:text-4xl font-bold tracking-tight ${
                                    isZeroPnl ? 'text-foreground/40' : 
                                    isPositivePnl ? 'text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'text-rose-500'
                                }`}>
                                    {pnlFormatted}%
                                </span>
                                <span className="text-sm font-medium text-foreground/40 ml-2 mb-1 self-end uppercase tracking-widest hidden md:inline">
                                    All-Time
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end gap-3 w-full md:w-auto shrink-0 relative z-50">
                        <div className="hidden md:block mb-4">
                            <NotificationBell userId={user.id} />
                        </div>
                        <TestnetToggle initialMode={isPaperMode} userId={user.id} />
                    </div>
                </div>

                {/* 2. System Status & Prerequisites Grid (Operations) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    
                    {/* Connected Exchange Balance Card */}
                    <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl border border-black/5 dark:border-white/10 p-6 md:p-8 rounded-[2rem] shadow-xl flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-duration-500" />
                        <div>
                            <span className="text-xs font-bold tracking-wider uppercase text-foreground/50 mb-2 block">
                                {isPaperMode ? 'Testnet Sandbox Engine' : 'Connected Exchange Margin'}
                            </span>
                            {isPaperMode ? (
                                <span className="text-3xl font-black text-foreground tracking-tight">Active</span>
                            ) : (
                                <span className="text-3xl font-black text-foreground tracking-tight">
                                    ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            )}
                        </div>

                        {!isPaperMode && !isApiConnected && (
                            <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl">
                                <div className="p-2 bg-rose-500/20 rounded-full text-rose-500">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-rose-500">API Key Missing</h4>
                                    <p className="text-xs font-medium text-rose-500/80">Connect your exchange to enable live trading.</p>
                                </div>
                                <Link href="/dashboard/settings" className="w-full sm:w-auto px-4 py-2 bg-rose-500 text-white text-xs font-bold uppercase rounded-lg hover:bg-rose-600 transition-colors text-center whitespace-nowrap">
                                    Connect API
                                </Link>
                            </div>
                        )}
                        {/* Only show "Connected" status nicely if connected and in live mode */}
                        {!isPaperMode && isApiConnected && (
                            <div className="mt-4 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                                <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Sys. Nom</span>
                            </div>
                        )}
                        {isPaperMode && (
                             <div className="mt-4 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] animate-pulse" />
                                <span className="text-xs font-bold text-cyan-500 uppercase tracking-widest">Sim. Nom</span>
                             </div>
                        )}
                    </div>

                    {/* Gas Tank Balance Card */}
                    <div className={`bg-white/50 backdrop-blur-2xl border p-6 md:p-8 rounded-[2rem] shadow-xl flex flex-col justify-between relative overflow-hidden transition-colors ${
                        isGasTankLow ? 'dark:bg-amber-900/20 border-amber-500/30 dark:border-amber-500/30' : 'dark:bg-white/5 border-black/5 dark:border-white/10'
                    }`}>
                        <div className={`absolute inset-0 bg-gradient-to-br transition-duration-500 opacity-0 group-hover:opacity-100 pointer-events-none ${
                            isGasTankLow ? 'from-amber-500/10 to-transparent' : 'from-purple-500/5 to-transparent'
                        }`} />
                        <div>
                            <span className="text-xs font-bold tracking-wider uppercase text-foreground/50 mb-2 block">
                                Prepaid Gas Tank
                            </span>
                            <span className={`text-3xl font-black tracking-tight ${isGasTankLow ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>
                                ${gasTankBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>

                        {isGasTankLow && (
                            <div className="mt-6 flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                                    Low funds. Strategies will pause if balance hits $0.00.
                                </span>
                            </div>
                        )}

                        <div className="mt-6 flex justify-end">
                            <Link href="/dashboard/deposit" className="inline-flex items-center justify-center px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-foreground hover:bg-foreground/80 dark:bg-white dark:text-black dark:hover:bg-white/90 rounded-full transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-black/10 dark:shadow-white/10">
                                Fund Network
                            </Link>
                        </div>
                    </div>

                </div>

                {/* 3. Active Allocations (The Drill-Down) */}
                <div className="pt-4 flex flex-col gap-6">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Active Strategy Allocations</h2>

                    {modeSubscriptions.length === 0 ? (
                        /* 4. The Empty State */
                        <div className="w-full bg-white/50 dark:bg-white/5 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-[2rem] shadow-xl text-center py-20 px-6 sm:px-12 relative overflow-hidden flex flex-col items-center justify-center">
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 dark:via-cyan-400/20 to-transparent" />
                            
                            <div className="w-20 h-20 bg-black/5 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-8 border border-black/10 dark:border-white/10 shadow-inner">
                                <LayoutDashboard className="w-10 h-10 text-foreground/40" />
                            </div>
                            
                            <h3 className="text-3xl md:text-4xl font-black tracking-tighter mb-4">Your Radar is Quiet.</h3>
                            <p className="text-base md:text-lg text-foreground/50 max-w-lg leading-relaxed mb-10">
                                You have no active capital deployed {isPaperMode ? 'in the sandbox' : 'in live markets'}. Deploy an AI strategy to auto-pilot your crypto portfolio.
                            </p>

                            <Link 
                                href="/dashboard/market"
                                className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold text-base px-8 py-4 rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                            >
                                Explore Marketplace
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    ) : (
                        /* Active Allocations Grid */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {modeSubscriptions.map((sub: any) => {
                                // Calculate Strategy-Specific PnL
                                const stratPositions = closedPositions.filter((p: any) => p.strategyId === sub.strategyId);
                                const stratPnl = stratPositions.reduce((sum: number, p: any) => sum + (p.realizedPnl || 0), 0);
                                const stratPnlPerc = sub.allocatedCapital > 0 ? ((stratPnl / sub.allocatedCapital) * 100) : 0;
                                
                                const isStratPositive = stratPnlPerc > 0;
                                const isStratZero = stratPnlPerc === 0;

                                return (
                                    <Link 
                                        key={sub.id} 
                                        href={`/dashboard/strategy-report/${sub.strategyId}`}
                                        className="group block bg-white/50 dark:bg-white/5 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-[2rem] p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-transparent to-transparent group-hover:from-cyan-500/5 transition-colors duration-500" />
                                        
                                        <div className="flex flex-col h-full justify-between gap-8 relative z-10">
                                            <div className="flex justify-between items-start gap-4">
                                                <h3 className="font-bold text-xl tracking-tight leading-tight line-clamp-2">
                                                    {sub.strategy.name}
                                                </h3>
                                                <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-cyan-500 group-hover:text-white transition-colors duration-300">
                                                    <ArrowRight className="w-4 h-4 text-foreground/40 group-hover:text-white" />
                                                </div>
                                            </div>

                                            <div className="flex items-end justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold tracking-widest uppercase text-foreground/40 mb-1">
                                                        Allocated
                                                    </span>
                                                    <span className="font-bold text-lg">
                                                        ${sub.allocatedCapital.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </div>

                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] font-bold tracking-widest uppercase text-foreground/40 mb-1">
                                                        Net Return
                                                    </span>
                                                    <span className={`font-bold text-lg ${
                                                        isStratZero ? 'text-foreground/50' :
                                                        isStratPositive ? 'text-emerald-500' : 'text-rose-500'
                                                    }`}>
                                                        {stratPnlPerc === 0 ? "0.00" : `${isStratPositive ? '+' : ''}${stratPnlPerc.toFixed(2)}`}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
