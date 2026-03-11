"use client";

import React, { useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format } from "date-fns";

type PositionRecord = {
    id: string;
    symbol: string;
    side: "LONG" | "SHORT" | "BUY" | "SELL";
    entryPrice: number;
    exitPrice: number | null;
    filledAmount: number;
    realizedPnl: number | null;
    createdAt: Date;
    updatedAt: Date | null;
    leverage: number;
};

interface StrategyPerformanceProps {
    closedPositions: PositionRecord[];
    currentBalance: number;
}

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background border border-black/5 dark:border-white/10 p-3 rounded-lg shadow-xl">
                <p className="text-sm font-semibold text-foreground/70 mb-1">{label}</p>
                <p className="text-base font-bold text-foreground">
                    Equity: <span className="text-primary">${payload[0].value.toLocaleString()}</span>
                </p>
            </div>
        );
    }
    return null;
};

export default function StrategyPerformance({ closedPositions = [], currentBalance = 0 }: StrategyPerformanceProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'trades'>('overview');

    // 1. Calculate Real-Time Mathematical KPIs based entirely on the Prisma objects
    const stats = React.useMemo(() => {
        let netPnl = 0;
        let totalWins = 0;
        let totalLosses = 0;
        let grossProfit = 0;
        let grossLoss = 0;
        let bestTrade = 0;
        let worstTrade = 0;

        closedPositions.forEach((pos) => {
            const pnl = pos.realizedPnl || 0;
            netPnl += pnl;

            if (pnl > 0) {
                totalWins++;
                grossProfit += pnl;
                if (pnl > bestTrade) bestTrade = pnl;
            } else if (pnl < 0) {
                totalLosses++;
                grossLoss += Math.abs(pnl);
                if (pnl < worstTrade) worstTrade = pnl;
            }
        });

        const totalTrades = closedPositions.length;
        const winRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0;
        const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? grossProfit : 0);
        
        const avgWin = totalWins > 0 ? grossProfit / totalWins : 0;
        const avgLoss = totalLosses > 0 ? grossLoss / totalLosses : 0;
        
        // Reverse engineer Starting Principal to calculate true net margin ROI %
        const startingPrincipal = currentBalance - netPnl;
        const netPnlPercent = startingPrincipal > 0 ? (netPnl / startingPrincipal) * 100 : 0;

        // Max Drawdown (Calculated precisely during the Equity Curve generation below)
        return {
            netPnl,
            netPnlPercent,
            winRate,
            totalTrades,
            profitFactor,
            avgWin,
            avgLoss,
            bestTrade,
            worstTrade,
            startingPrincipal
        };
    }, [closedPositions, currentBalance]);

    // 2. Synthesize accurate Recharts Line mapping
    const equityData = React.useMemo(() => {
        const data: { date: string; equity: number }[] = [];
        
        // Seed the array with the exact calculated starting principle before the engine went active
        if (closedPositions.length > 0) {
            data.push({
                date: "Start",
                equity: stats.startingPrincipal
            });
        } else {
            // New user, generic baseline flatline
            return [{ date: "Today", equity: currentBalance }];
        }

        let rollingEquity = stats.startingPrincipal;
        
        // As defined in the parent, closedPositions is already chronologically sorted oldest->newest
        closedPositions.forEach((pos) => {
            rollingEquity += (pos.realizedPnl || 0);
            const closeDate = pos.updatedAt ? new Date(pos.updatedAt) : new Date(pos.createdAt);
            
            data.push({
                date: format(closeDate, 'MMM dd HH:mm'),
                equity: Number(rollingEquity.toFixed(2))
            });
        });

        return data;
    }, [closedPositions, stats.startingPrincipal, currentBalance]);

    // Calculate Dynamic Max Drawdown iterating through the equityData timeline
    const maxDrawdown = React.useMemo(() => {
        let maxPeak = stats.startingPrincipal;
        let maxDD = 0;

        equityData.forEach(point => {
            if (point.equity > maxPeak) {
                maxPeak = point.equity;
            }
            const currentDrawdown = maxPeak > 0 ? ((maxPeak - point.equity) / maxPeak) * 100 : 0;
            if (currentDrawdown > maxDD) {
                maxDD = currentDrawdown;
            }
        });

        return -Number(maxDD.toFixed(2));
    }, [equityData, stats.startingPrincipal]);

    // 3. Reverse chronological map for Trade Logs (Latest history at the top)
    const reversedHistory = [...closedPositions].reverse();

    return (
        <div className="w-full space-y-6">
            {/* Native Tailwind Tabs */}
            <div className="w-full">
                <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl w-full max-w-md mb-6 relative">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex-1 text-center py-2 text-sm font-semibold rounded-lg transition-all ${
                            activeTab === 'overview' 
                            ? 'bg-background shadow text-foreground' 
                            : 'text-foreground/60 hover:text-foreground/80'
                        }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('trades')}
                        className={`flex-1 text-center py-2 text-sm font-semibold rounded-lg transition-all ${
                            activeTab === 'trades' 
                            ? 'bg-background shadow text-foreground' 
                            : 'text-foreground/60 hover:text-foreground/80'
                        }`}
                    >
                        List of Trades
                    </button>
                </div>

                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        {/* KPI Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white/50 dark:bg-black/40 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-xl p-6 shadow-lg">
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Total Net P&L</h3>
                                <div className="text-2xl font-bold flex items-baseline gap-2">
                                    <span className={stats.netPnl >= 0 ? "text-emerald-500" : "text-rose-500"}>
                                        ${stats.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                    <span className={`text-sm ${stats.netPnlPercent >= 0 ? "text-emerald-500/80" : "text-rose-500/80"}`}>
                                        ({stats.netPnlPercent > 0 ? '+' : ''}{stats.netPnlPercent.toFixed(2)}%)
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white/50 dark:bg-black/40 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-xl p-6 shadow-lg">
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Win Rate</h3>
                                <div className="text-2xl font-bold text-foreground">
                                    {stats.winRate.toFixed(1)}%
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Over {stats.totalTrades} Trades</p>
                            </div>

                            <div className="bg-white/50 dark:bg-black/40 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-xl p-6 shadow-lg">
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Max Drawdown</h3>
                                <div className="text-2xl font-bold text-rose-500">
                                    {maxDrawdown}%
                                </div>
                            </div>

                            <div className="bg-white/50 dark:bg-black/40 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-xl p-6 shadow-lg">
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Profit Factor</h3>
                                <div className="text-2xl font-bold text-foreground">
                                    {stats.profitFactor.toFixed(2)}
                                </div>
                            </div>
                        </div>

                        {/* Equity Curve */}
                        <div className="bg-white/50 dark:bg-black/40 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6 border-b border-black/5 dark:border-white/10">
                                <h3 className="text-lg font-bold text-foreground">Equity Curve</h3>
                                <p className="text-sm text-muted-foreground">Mathematical algorithmic growth over time.</p>
                            </div>
                            <div className="p-6">
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={equityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis 
                                                dataKey="date" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fill: '#6b7280', fontSize: 12 }} 
                                                dy={10}
                                            />
                                            <YAxis 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fill: '#6b7280', fontSize: 12 }} 
                                                tickFormatter={(value) => `$${value}`}
                                                domain={['dataMin - 100', 'dataMax + 100']}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area 
                                                type="monotone" 
                                                dataKey="equity" 
                                                stroke="#2563eb" 
                                                strokeWidth={3}
                                                fillOpacity={1} 
                                                fill="url(#colorEquity)" 
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Quick Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white/30 dark:bg-black/20 p-4 rounded-xl border border-black/5 dark:border-white/10 flex flex-col items-center justify-center text-center">
                                <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1">Avg Win</span>
                                <span className="text-lg font-bold text-emerald-500">${stats.avgWin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="bg-white/30 dark:bg-black/20 p-4 rounded-xl border border-black/5 dark:border-white/10 flex flex-col items-center justify-center text-center">
                                <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1">Avg Loss</span>
                                <span className="text-lg font-bold text-rose-500">${Math.abs(stats.avgLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="bg-white/30 dark:bg-black/20 p-4 rounded-xl border border-black/5 dark:border-white/10 flex flex-col items-center justify-center text-center">
                                <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1">Best Trade</span>
                                <span className="text-lg font-bold text-emerald-500">${stats.bestTrade.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="bg-white/30 dark:bg-black/20 p-4 rounded-xl border border-black/5 dark:border-white/10 flex flex-col items-center justify-center text-center">
                                <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1">Worst Trade</span>
                                <span className="text-lg font-bold text-rose-500">${Math.abs(stats.worstTrade).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'trades' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2">
                        <div className="bg-white/50 dark:bg-black/40 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6 border-b border-black/5 dark:border-white/10">
                                <h3 className="text-lg font-bold text-foreground">Trade History</h3>
                                <p className="text-sm text-muted-foreground">Recent algorithmic executions.</p>
                            </div>
                            <div className="p-0 md:p-6">
                                {/* Desktop Table View */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-muted-foreground uppercase border-b border-black/5 dark:border-white/10">
                                            <tr>
                                                <th className="py-3 px-4 font-semibold">Date / Time</th>
                                                <th className="py-3 px-4 font-semibold">Asset</th>
                                                <th className="py-3 px-4 font-semibold">Side</th>
                                                <th className="py-3 px-4 font-semibold text-right">Entry Price</th>
                                                <th className="py-3 px-4 font-semibold text-right">Exit Price</th>
                                                <th className="py-3 px-4 font-semibold text-right">Size</th>
                                                <th className="py-3 px-4 font-semibold text-right">Net P&L</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reversedHistory.map((trade) => (
                                                <tr key={trade.id} className="border-b border-black/5 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                                    <td className="py-4 px-4 font-medium text-foreground/80 lowercase">{format(new Date(trade.updatedAt || trade.createdAt), 'MMM dd HH:mm')}</td>
                                                    <td className="py-4 px-4 font-bold text-foreground uppercase">{trade.symbol}</td>
                                                    <td className="py-4 px-4">
                                                        <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${trade.side === 'LONG' || trade.side === 'BUY' ? 'bg-blue-500/10 text-blue-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                            {trade.side} {trade.leverage}x
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-right tabular-nums text-foreground/80">${trade.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</td>
                                                    <td className="py-4 px-4 text-right tabular-nums text-foreground/80">${trade.exitPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 }) || '...'}</td>
                                                    <td className="py-4 px-4 text-right tabular-nums text-foreground/80">{trade.filledAmount}</td>
                                                    <td className={`py-4 px-4 text-right tabular-nums font-bold ${(trade.realizedPnl || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                        {(trade.realizedPnl || 0) >= 0 ? '+' : ''}${(trade.realizedPnl || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            ))}
                                            {reversedHistory.length === 0 && (
                                                <tr>
                                                    <td colSpan={7} className="py-8 text-center text-muted-foreground italic">No historical trades found. Waiting for engine to execute...</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Stacked View */}
                                <div className="md:hidden space-y-4 p-4 md:p-0">
                                    {reversedHistory.map((trade) => (
                                        <div key={trade.id} className="flex flex-col gap-2 p-4 rounded-xl border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded ${trade.side === 'LONG' || trade.side === 'BUY' ? 'bg-blue-500/10 text-blue-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                        {trade.symbol} {trade.side}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">{format(new Date(trade.updatedAt || trade.createdAt), 'MMM dd')}</span>
                                                </div>
                                                <div className={`text-lg font-bold text-right ${(trade.realizedPnl || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {(trade.realizedPnl || 0) >= 0 ? '+' : ''}${(trade.realizedPnl || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </div>
                                            </div>
                                            <div className="text-xs font-mono text-foreground/80 border-t border-black/5 dark:border-white/10 pt-2">
                                                Entry: ${trade.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}  ·  Exit: ${trade.exitPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 }) || '...'}
                                            </div>
                                        </div>
                                    ))}
                                    {reversedHistory.length === 0 && (
                                        <div className="p-8 text-center text-muted-foreground italic border bg-black/5 dark:bg-white/5 rounded-xl border-black/5 dark:border-white/10">
                                            No historical algorithmic executions found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
