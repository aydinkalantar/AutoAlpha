"use client";

import React, { useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Mock Data
const MOCK_EQUITY_DATA = [
    { date: "2023-10-01", equity: 10000 },
    { date: "2023-10-05", equity: 10250 },
    { date: "2023-10-10", equity: 10100 },
    { date: "2023-10-15", equity: 10600 },
    { date: "2023-10-20", equity: 10450 },
    { date: "2023-10-25", equity: 11200 },
    { date: "2023-11-01", equity: 11500 },
    { date: "2023-11-05", equity: 11300 },
    { date: "2023-11-10", equity: 11800 },
    { date: "2023-11-15", equity: 12100 },
];

const MOCK_TRADES = [
    { id: "1", date: "2023-11-15 14:30", side: "LONG", entry: 35000, exit: 36000, size: 0.5, pnl: 500 },
    { id: "2", date: "2023-11-12 09:15", side: "SHORT", entry: 37000, exit: 36500, size: 0.5, pnl: 250 },
    { id: "3", date: "2023-11-10 16:45", side: "LONG", entry: 36200, exit: 35800, size: 0.5, pnl: -200 },
    { id: "4", date: "2023-11-08 11:20", side: "LONG", entry: 34500, exit: 35500, size: 0.5, pnl: 500 },
    { id: "5", date: "2023-11-05 08:00", side: "SHORT", entry: 35200, exit: 35800, size: 0.5, pnl: -300 },
];

const MOCK_STATS = {
    netPnl: 2100,
    netPnlPercent: 21.0,
    winRate: 65.5,
    totalTrades: 42,
    maxDrawdown: -4.5,
    profitFactor: 1.8,
    avgWin: 350,
    avgLoss: -150,
    bestTrade: 800,
    worstTrade: -400,
};

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background border border-border p-3 rounded-lg shadow-xl">
                <p className="text-sm font-semibold text-foreground/70 mb-1">{label}</p>
                <p className="text-base font-bold text-foreground">
                    Equity: <span className="text-primary">${payload[0].value.toLocaleString()}</span>
                </p>
            </div>
        );
    }
    return null;
};

export default function StrategyPerformance() {
    const [activeTab, setActiveTab] = useState<'overview' | 'trades'>('overview');

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
                            <div className="bg-white/50 dark:bg-black/40 backdrop-blur-xl border border-border rounded-xl p-6 shadow-lg">
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Total Net P&L</h3>
                                <div className="text-2xl font-bold flex items-baseline gap-2">
                                    <span className={MOCK_STATS.netPnl >= 0 ? "text-emerald-500" : "text-rose-500"}>
                                        ${MOCK_STATS.netPnl.toLocaleString()}
                                    </span>
                                    <span className={`text-sm ${MOCK_STATS.netPnlPercent >= 0 ? "text-emerald-500/80" : "text-rose-500/80"}`}>
                                        ({MOCK_STATS.netPnlPercent > 0 ? '+' : ''}{MOCK_STATS.netPnlPercent}%)
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white/50 dark:bg-black/40 backdrop-blur-xl border border-border rounded-xl p-6 shadow-lg">
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Win Rate</h3>
                                <div className="text-2xl font-bold text-foreground">
                                    {MOCK_STATS.winRate}%
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Over {MOCK_STATS.totalTrades} Trades</p>
                            </div>

                            <div className="bg-white/50 dark:bg-black/40 backdrop-blur-xl border border-border rounded-xl p-6 shadow-lg">
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Max Drawdown</h3>
                                <div className="text-2xl font-bold text-rose-500">
                                    {MOCK_STATS.maxDrawdown}%
                                </div>
                            </div>

                            <div className="bg-white/50 dark:bg-black/40 backdrop-blur-xl border border-border rounded-xl p-6 shadow-lg">
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Profit Factor</h3>
                                <div className="text-2xl font-bold text-foreground">
                                    {MOCK_STATS.profitFactor}
                                </div>
                            </div>
                        </div>

                        {/* Equity Curve */}
                        <div className="bg-white/50 dark:bg-black/40 backdrop-blur-xl border border-border rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6 border-b border-border">
                                <h3 className="text-lg font-bold text-foreground">Equity Curve</h3>
                                <p className="text-sm text-muted-foreground">Account balance growth over time.</p>
                            </div>
                            <div className="p-6">
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={MOCK_EQUITY_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                            <div className="bg-white/30 dark:bg-black/20 p-4 rounded-xl border border-border flex flex-col items-center justify-center text-center">
                                <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1">Avg Win</span>
                                <span className="text-lg font-bold text-emerald-500">${MOCK_STATS.avgWin}</span>
                            </div>
                            <div className="bg-white/30 dark:bg-black/20 p-4 rounded-xl border border-border flex flex-col items-center justify-center text-center">
                                <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1">Avg Loss</span>
                                <span className="text-lg font-bold text-rose-500">${Math.abs(MOCK_STATS.avgLoss)}</span>
                            </div>
                            <div className="bg-white/30 dark:bg-black/20 p-4 rounded-xl border border-border flex flex-col items-center justify-center text-center">
                                <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1">Best Trade</span>
                                <span className="text-lg font-bold text-emerald-500">${MOCK_STATS.bestTrade}</span>
                            </div>
                            <div className="bg-white/30 dark:bg-black/20 p-4 rounded-xl border border-border flex flex-col items-center justify-center text-center">
                                <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1">Worst Trade</span>
                                <span className="text-lg font-bold text-rose-500">${Math.abs(MOCK_STATS.worstTrade)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'trades' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2">
                        <div className="bg-white/50 dark:bg-black/40 backdrop-blur-xl border border-border rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6 border-b border-border">
                                <h3 className="text-lg font-bold text-foreground">Trade History</h3>
                                <p className="text-sm text-muted-foreground">Recent algorithmic executions.</p>
                            </div>
                            <div className="p-0 md:p-6">
                                {/* Desktop Table View */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-muted-foreground uppercase border-b border-border">
                                            <tr>
                                                <th className="py-3 px-4 font-semibold">Date / Time</th>
                                                <th className="py-3 px-4 font-semibold">Side</th>
                                                <th className="py-3 px-4 font-semibold text-right">Entry Price</th>
                                                <th className="py-3 px-4 font-semibold text-right">Exit Price</th>
                                                <th className="py-3 px-4 font-semibold text-right">Size</th>
                                                <th className="py-3 px-4 font-semibold text-right">Net P&L</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {MOCK_TRADES.map((trade) => (
                                                <tr key={trade.id} className="border-b border-border hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                                    <td className="py-4 px-4 font-medium text-foreground/80">{trade.date}</td>
                                                    <td className="py-4 px-4">
                                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${trade.side === 'LONG' ? 'bg-blue-500/10 text-blue-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                            {trade.side}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-right tabular-nums text-foreground/80">${trade.entry.toLocaleString()}</td>
                                                    <td className="py-4 px-4 text-right tabular-nums text-foreground/80">${trade.exit.toLocaleString()}</td>
                                                    <td className="py-4 px-4 text-right tabular-nums text-foreground/80">{trade.size}</td>
                                                    <td className={`py-4 px-4 text-right tabular-nums font-bold ${trade.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                        {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Stacked View */}
                                <div className="md:hidden space-y-4 p-4 md:p-0">
                                    {MOCK_TRADES.map((trade) => (
                                        <div key={trade.id} className="flex justify-between items-center p-4 rounded-xl border border-border bg-black/5 dark:bg-white/5">
                                            <div className="space-y-1 mt-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded ${trade.side === 'LONG' ? 'bg-blue-500/10 text-blue-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                        {trade.side}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">{trade.date}</span>
                                                </div>
                                                <div className="text-sm font-semibold text-foreground/80">
                                                    ${trade.entry.toLocaleString()} → ${trade.exit.toLocaleString()}
                                                </div>
                                            </div>
                                            <div className={`text-lg font-bold text-right ${trade.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
