"use client";

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { Target, TrendingUp, ShieldAlert, PieChart as PieChartIcon, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';

interface AnalyticsRowProps {
    positions: any[];
    subscriptions: any[];
    totalBalance: number;
    isPaperMode: boolean;
    usdtBalance: number;
    usdcBalance: number;
}

export default function AnalyticsRow({ positions, subscriptions, totalBalance, isPaperMode, usdtBalance, usdcBalance }: AnalyticsRowProps) {
    const closedPositions = useMemo(() => positions.filter(p => !p.isOpen), [positions]);

    const { winRate, profitFactor, totalTrades, maxDrawdown, totalRevenue, dailyPnl, roiPercentage } = useMemo(() => {
        if (closedPositions.length === 0) return { winRate: 0, profitFactor: 0, totalTrades: 0, maxDrawdown: 0, totalRevenue: 0, dailyPnl: 0, roiPercentage: 0 };

        let wins = 0;
        let grossProfit = 0;
        let grossLoss = 0;
        let cumulativePnl = 0;
        let peakCumulativePnl = 0;
        let maxDrawdownPct = 0;
        let last24hPnl = 0;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        // Pre-calculate final PnL to infer starting capital for realistic percentage math
        const finalCumulativePnl = closedPositions.reduce((sum, pos) => sum + (pos.realizedPnl || 0), 0);
        const inferredInitialCapital = Math.max(totalBalance - finalCumulativePnl, 100); // Base minimum of 100

        for (const pos of closedPositions) {
            const exitPnl = pos.realizedPnl || 0;

            if (exitPnl > 0) {
                wins++;
                grossProfit += exitPnl;
            } else if (exitPnl < 0) {
                grossLoss += Math.abs(exitPnl);
            }

            cumulativePnl += exitPnl;
            if (cumulativePnl > peakCumulativePnl) {
                peakCumulativePnl = cumulativePnl;
            }

            const currentDrawdown = peakCumulativePnl - cumulativePnl;
            const currentPeakBalance = inferredInitialCapital + peakCumulativePnl;
            const currentDrawdownPct = currentPeakBalance > 0 ? (currentDrawdown / currentPeakBalance) * 100 : 0;

            if (currentDrawdownPct > maxDrawdownPct) {
                maxDrawdownPct = currentDrawdownPct;
            }

            // Check if closed in last 24h
            if (new Date(pos.updatedAt || pos.createdAt) >= yesterday) {
                last24hPnl += exitPnl;
            }
        }

        const winRate = (wins / closedPositions.length) * 100;
        const profitFactor = grossLoss === 0 ? (grossProfit > 0 ? 99.9 : 0) : grossProfit / grossLoss;
        const roiPercentage = totalBalance > 0 ? (cumulativePnl / totalBalance) * 100 : 0;
        const clampedDrawdown = Math.min(maxDrawdownPct, 100); // Prevent impossible >100% drawdowns without explicit leverage models

        return { 
            winRate, 
            profitFactor, 
            totalTrades: closedPositions.length, 
            maxDrawdown: clampedDrawdown,
            totalRevenue: cumulativePnl,
            dailyPnl: last24hPnl,
            roiPercentage
        };
    }, [closedPositions, totalBalance]);

    // Calculate allocation distribution
    const donutData = useMemo(() => {
        let allocated = 0;
        const data = subscriptions.filter(sub => sub.isActive).map(sub => {
            allocated += sub.allocatedCapital;
            return {
                name: `${sub.strategy.name} (${sub.exchange || sub.strategy.targetExchange})`,
                value: sub.allocatedCapital
            };
        });

        const unallocated = totalBalance - allocated;
        if (unallocated > 0) {
            data.push({ name: 'Idle Capital', value: unallocated });
        }

        return data;
    }, [subscriptions, totalBalance]);

    const COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#3b82f6', '#3f3f46'];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* Connected Exchange Balance Box */}
            <div className="col-span-1 md:col-span-2 xl:col-span-2 bg-white/50 dark:bg-white/5 backdrop-blur-2xl flex flex-col justify-center py-6 px-8 rounded-2xl border border-black/5 dark:border-white/10 shadow-xl relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 dark:via-cyan-400/20 to-transparent" />
                <span className="text-sm font-bold tracking-wider uppercase mb-2 relative z-10 text-cyan-600 dark:text-cyan-400">
                    {isPaperMode ? 'Paper Capital' : 'Connected Exchange Balance'}
                </span>
                <div className="flex items-baseline space-x-1 relative z-10">
                    <span className="text-3xl font-bold text-foreground/50">$</span>
                    <span className="text-5xl font-black text-foreground tracking-tight">
                        {!isPaperMode ? '--' : totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>
            </div>

            {/* Gas Tank Widget */}
            <div className="col-span-1 md:col-span-1 xl:col-span-1 bg-white/50 dark:bg-white/5 backdrop-blur-xl flex flex-col justify-between py-6 px-6 rounded-2xl border border-black/5 dark:border-white/10 shadow-xl relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 dark:via-purple-400/20 to-transparent" />
                <div className="flex flex-col mb-4 relative z-10">
                    <span className="text-sm font-bold tracking-wider uppercase text-foreground/50 mb-1">Gas Tank Balance</span>
                    <span className="text-2xl font-black text-foreground">
                        ${(usdtBalance + usdcBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-bold text-foreground/50">USDC</span>
                    </span>
                </div>
                <Link href="/dashboard/deposit" className="relative z-10 self-start text-xs font-bold tracking-wider uppercase text-purple-600 dark:text-purple-400 hover:text-purple-500 bg-purple-500/10 hover:bg-purple-500/20 px-4 py-2 rounded-xl transition-colors border border-purple-500/20">
                    Top Up
                </Link>
            </div>

            {/* Allocation Donut */}
            <div className="col-span-1 md:col-span-3 xl:col-span-1 bg-white/50 dark:bg-white/5 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-2xl shadow-xl p-6 flex flex-col relative overflow-hidden">
                <div className="flex items-center gap-2 mb-4">
                    <PieChartIcon className="w-4 h-4 text-cyan-500" />
                    <h3 className="text-sm font-semibold tracking-tight text-foreground/70 uppercase">Capital Allocation</h3>
                </div>
                <div className="flex-1 min-h-[160px] w-full relative">
                    {donutData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                            <PieChart margin={{ top: 10, right: 0, bottom: 10, left: 0 }} style={{ overflow: 'visible' }}>
                                <Pie
                                    data={donutData}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {donutData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.name === 'Idle Capital' ? '#3f3f46' : COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    formatter={(value: any) => [`$${value.toLocaleString()}`, 'Capital']}
                                    contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff' }}
                                />
                                <Legend 
                                    verticalAlign="bottom" 
                                    height={40} 
                                    iconType="circle" 
                                    wrapperStyle={{ fontSize: '11px', fontWeight: '600', paddingTop: '0px', bottom: '0px' }} 
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="absolute inset-0 m-6 rounded-[50%] border-2 border-dashed border-black/10 dark:border-white/10 flex items-center justify-center text-xs text-foreground/40 font-bold uppercase tracking-wider text-center">
                            No allocations set
                        </div>
                    )}
                </div>
            </div>

            <div className="col-span-1 md:col-span-3 xl:col-span-4 flex overflow-x-auto sm:overflow-visible snap-x snap-mandatory pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 hide-scrollbar mt-2">
                {/* Win Rate KPI */}
                <div className="min-w-[85vw] sm:min-w-0 flex-shrink-0 snap-center bg-white/50 dark:bg-white/5 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-2xl shadow-xl p-6 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-500/10 rounded-xl">
                            <Target className="w-5 h-5 text-emerald-500" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5 mb-1">
                            <h4 className="text-sm font-medium text-foreground/50 truncate">Win Rate</h4>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button aria-label="Info about Win Rate" className="text-foreground/30 hover:text-cyan-500 cursor-help transition-colors focus:outline-none">
                                        <Info className="w-4 h-4" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[250px] bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 text-foreground p-3 rounded-xl shadow-2xl backdrop-blur-xl font-medium leading-relaxed">
                                    <p>The percentage of trades that close in profit. A high win rate indicates consistent accuracy, but must be balanced with the average win/loss ratio.</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold tracking-tight">{winRate.toFixed(1)}%</span>
                            <span className="text-xs text-foreground/40 font-medium whitespace-nowrap">{totalTrades} trades</span>
                        </div>
                    </div>
                </div>

                {/* Profit Factor KPI */}
                <div className="min-w-[85vw] sm:min-w-0 flex-shrink-0 snap-center bg-white/50 dark:bg-white/5 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-2xl shadow-xl p-6 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-cyan-500/10 rounded-xl">
                            <TrendingUp className="w-5 h-5 text-cyan-500" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5 mb-1">
                            <h4 className="text-sm font-medium text-foreground/50 truncate">Profit Factor</h4>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-4 w-4 text-foreground/30 hover:bg-transparent hover:text-cyan-500 cursor-help p-0">
                                        <Info className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[250px] bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 text-foreground p-3 rounded-xl shadow-2xl backdrop-blur-xl font-medium leading-relaxed">
                                    <p>Gross Profit divided by Gross Loss. A Profit Factor greater than 1.0 indicates a profitable system. Above 1.5 is generally considered mathematically excellent.</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold tracking-tight">{profitFactor.toFixed(2)}</span>
                            <span className="text-xs text-emerald-500 font-medium whitespace-nowrap">Gross Prof / Loss</span>
                        </div>
                    </div>
                </div>

                {/* Max Drawdown KPI */}
                <div className="min-w-[85vw] sm:min-w-0 flex-shrink-0 snap-center bg-white/50 dark:bg-white/5 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-2xl shadow-xl p-6 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-rose-500/10 rounded-xl">
                            <ShieldAlert className="w-5 h-5 text-rose-500" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5 mb-1">
                            <h4 className="text-sm font-medium text-foreground/50 truncate">Max Drawdown</h4>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button className="text-foreground/30 hover:text-cyan-500 cursor-help transition-colors focus:outline-none">
                                        <Info className="w-4 h-4" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[250px] bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 text-foreground p-3 rounded-xl shadow-2xl backdrop-blur-xl font-medium leading-relaxed">
                                    <p>The maximum observed percentage loss from a peak to a trough. It indicates the largest historical drop in portfolio value before a new peak is achieved, reflecting downside risk.</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold tracking-tight text-rose-500">-{Math.abs(maxDrawdown).toFixed(2)}%</span>
                            <span className="text-xs text-rose-500 font-medium whitespace-nowrap">Peak-to-Trough</span>
                        </div>
                    </div>
                </div>

                {/* Total Return (ROI) KPI */}
                <div className="min-w-[85vw] sm:min-w-0 flex-shrink-0 snap-center bg-white/50 dark:bg-white/5 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-2xl shadow-xl p-4 md:p-6 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-indigo-500/10 rounded-xl">
                            <PieChartIcon className="w-5 h-5 text-indigo-500" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5 mb-1">
                            <h4 className="text-sm font-medium text-foreground/50 truncate">Total Return (ROI)</h4>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button className="text-foreground/30 hover:text-cyan-500 cursor-help transition-colors focus:outline-none">
                                        <Info className="w-4 h-4" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[250px] bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 text-foreground p-3 rounded-xl shadow-2xl backdrop-blur-xl font-medium leading-relaxed">
                                    <p>Total Return on Investment represents the net percentage gain or loss relative to the initial capital deployed.</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-3xl font-bold tracking-tight ${roiPercentage >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {roiPercentage >= 0 ? '+' : ''}{roiPercentage.toFixed(2)}%
                            </span>
                            <span className="text-xs text-foreground/40 font-medium whitespace-nowrap">On Active Capital</span>
                        </div>
                    </div>
                </div>

                {/* Total Revenue KPI */}
                <div className="min-w-[85vw] sm:min-w-0 flex-shrink-0 snap-center bg-white/50 dark:bg-white/5 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-2xl shadow-xl p-4 md:p-6 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-purple-500/10 rounded-xl">
                            <TrendingUp className="w-5 h-5 text-purple-500" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5 mb-1">
                            <h4 className="text-sm font-medium text-foreground/50 truncate">Total Revenue</h4>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button className="text-foreground/30 hover:text-cyan-500 cursor-help transition-colors focus:outline-none">
                                        <Info className="w-4 h-4" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[250px] bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 text-foreground p-3 rounded-xl shadow-2xl backdrop-blur-xl font-medium leading-relaxed">
                                    <p>The absolute gross profit generated across all closed positions over the lifetime of the account.</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-3xl font-bold tracking-tight ${totalRevenue >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {totalRevenue >= 0 ? '+' : '-'}${Math.abs(totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-xs text-foreground/40 font-medium whitespace-nowrap">Realized PnL</span>
                        </div>
                    </div>
                </div>

                {/* 24h PnL KPI */}
                <div className="min-w-[85vw] sm:min-w-0 flex-shrink-0 snap-center bg-white/50 dark:bg-white/5 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-2xl shadow-xl p-4 md:p-6 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-amber-500/10 rounded-xl">
                            <Target className="w-5 h-5 text-amber-500" />
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-foreground/50 mb-1 truncate">24h Daily PnL</h4>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-3xl font-bold tracking-tight ${dailyPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {dailyPnl >= 0 ? '+' : '-'}${Math.abs(dailyPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-xs text-foreground/40 font-medium whitespace-nowrap">Last 24 hours</span>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}
