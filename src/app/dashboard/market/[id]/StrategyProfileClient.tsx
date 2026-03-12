"use client";

import { useState } from "react";
import { Strategy } from "@prisma/client";
import SubscribeModal from "../../SubscribeModal";
import CapitalAllocationModal from "../../CapitalAllocationModal";
import { updateSubscriptionCapital } from "../../subscriptionActions";
import Link from "next/link";
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis
} from "recharts";

interface Props {
    strategy: any; // Strategy with JSON fields
    subscription: any | null;
    userId: string;
    usdtBalance: number;
    usdcBalance: number;
    isPaperMode: boolean;
    connectedExchanges: string[];
}

export default function StrategyProfileClient({
    strategy,
    subscription,
    userId,
    usdtBalance,
    usdcBalance,
    isPaperMode,
    connectedExchanges
}: Props) {
    const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
    const [isCapitalOpen, setIsCapitalOpen] = useState(false);

    // Format Backtest Data for Chart
    const rawBacktestData = strategy.backtestData || [];
    const chartData = rawBacktestData.map((dp: any) => ({
        ...dp,
        date: dp.date && typeof dp.date === 'string' && dp.date.includes(' ') ? dp.date.split(' ')[0] : dp.date,
        equity: Number(dp.equity)
    }));

    const hasChartData = chartData.length > 0;
    
    // Risk Params
    const riskRules = Array.isArray(strategy.riskParameters) ? strategy.riskParameters : [];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header / Nav */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/market" className="p-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-colors">
                    <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-4">
                        {strategy.name}
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                            {strategy.targetExchange}
                        </span>
                    </h1>
                </div>
            </div>

            {/* Top Grid: Main Info & Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Key Stats Panel */}
                <div className="lg:col-span-1 border border-black/5 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-[2rem] p-8 space-y-8 shadow-xl">
                    <div className="space-y-6">
                        <div>
                            <p className="text-xs uppercase tracking-wider font-bold text-foreground/50 mb-1">Status</p>
                            <div className="flex items-center gap-2 text-emerald-500 font-bold">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                                Active & Trading
                            </div>
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wider font-bold text-foreground/50 mb-1">Target Market</p>
                            <p className="text-lg font-bold text-foreground">{strategy.marketType === 'SPOT' ? 'Spot Markets' : 'Futures (Perpetual)'}</p>
                        </div>
                        
                        <div>
                            <p className="text-xs uppercase tracking-wider font-bold text-foreground/50 mb-1">Settlement Asset</p>
                            <p className="text-lg font-bold text-foreground">{strategy.settlementCurrency}</p>
                        </div>
                        
                        {strategy.marketType === 'FUTURES' && (
                            <div>
                                <p className="text-xs uppercase tracking-wider font-bold text-foreground/50 mb-1">Operating Leverage</p>
                                <p className="text-lg font-bold text-foreground">{strategy.leverage}x (Max: {strategy.maxLeverage}x)</p>
                            </div>
                        )}
                        
                        <div>
                            <p className="text-xs uppercase tracking-wider font-bold text-foreground/50 mb-1">Performance Fee</p>
                            <p className="text-lg font-bold text-emerald-500">{strategy.performanceFeePercentage}% (High Watermark)</p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-black/5 dark:border-white/10">
                        {subscription ? (
                            <div className="space-y-3">
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-between">
                                    <span>Subscribed</span>
                                    <span>Allocated: {subscription.allocatedCapital} {strategy.settlementCurrency}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="relative inline-flex items-center cursor-pointer justify-center py-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={subscription.isActive}
                                            onChange={async () => {
                                                const res = await fetch(`/api/user/subscriptions/${subscription.id}/toggle`, { method: "POST" });
                                                if (res.ok) window.location.reload();
                                            }}
                                        />
                                        <div className="w-9 h-5 bg-rose-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[14px] after:left-[calc(50%-18px)] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                                        <span className="ml-3 text-sm font-bold text-foreground">Active</span>
                                    </label>
                                    <button
                                        onClick={() => setIsCapitalOpen(true)}
                                        className="py-3 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-foreground rounded-xl text-sm font-bold transition-all"
                                    >
                                        Edit Capital
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsSubscribeOpen(true)}
                                className="w-full py-4 bg-gradient-to-br from-cyan-400 to-purple-600 shadow-lg shadow-purple-500/30 text-white rounded-xl font-bold text-lg hover:-translate-y-0.5 transition-all hover:shadow-purple-500/40"
                            >
                                Subscribe Now
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Side: Chart & Metrics */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Key Metrics Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard title="Total Return" value={strategy.expectedRoiPercentage != null ? `${strategy.expectedRoiPercentage > 0 ? '+' : ''}${strategy.expectedRoiPercentage.toFixed(1)}%` : "N/A"} color={strategy.expectedRoiPercentage >= 0 ? "text-emerald-500" : "text-rose-500"} />
                        <MetricCard title="Max Drawdown" value={strategy.drawdownPercentage != null ? `-${Math.abs(strategy.drawdownPercentage).toFixed(1)}%` : "N/A"} color="text-rose-500" />
                        <MetricCard title="Win Rate" value={strategy.winRatePercentage != null ? `${strategy.winRatePercentage.toFixed(1)}%` : "N/A"} color="text-blue-500" />
                        <MetricCard title="Profit Factor" value={strategy.profitFactor != null ? strategy.profitFactor.toFixed(2) : "N/A"} color="text-amber-500" />
                    </div>

                    {/* Equity Curve Chart */}
                    <div className="border border-black/5 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-[2rem] p-6 lg:p-8 shadow-xl">
                        <h3 className="text-lg font-bold text-foreground mb-6">Historical Equity Curve</h3>
                        <div className="h-[400px] w-full">
                            {hasChartData ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis 
                                            dataKey="date" 
                                            stroke="#888888" 
                                            fontSize={12} 
                                            tickLine={false} 
                                            axisLine={false} 
                                            minTickGap={30}
                                        />
                                        <YAxis 
                                            stroke="#888888" 
                                            fontSize={12} 
                                            tickLine={false} 
                                            axisLine={false} 
                                            tickFormatter={(value) => `$${value}`}
                                        />
                                        <RechartsTooltip 
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-md border border-black/10 dark:border-white/10 p-3 rounded-xl shadow-xl">
                                                            <p className="text-foreground/60 text-xs mb-1 font-bold">{payload[0].payload.date}</p>
                                                            <p className="text-emerald-500 font-bold text-lg">${Number(payload[0].value).toFixed(2)}</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="equity" 
                                            stroke="#10b981" 
                                            strokeWidth={3}
                                            fillOpacity={1} 
                                            fill="url(#colorEquity)" 
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-foreground/40 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                                    <svg className="w-10 h-10 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <p className="font-medium text-sm">No backtest data available</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-6 p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 flex items-start gap-4">
                            <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-xs text-foreground/60 leading-relaxed font-medium">
                                <span className="font-bold text-foreground">Disclaimer:</span> Backtest data and performance metrics are generated using Binance market data as the primary oracle. Execution prices on other supported exchanges (like Bybit or OKX) may vary slightly due to real-time liquidity and spread differences.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Description & Rules Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="border border-black/5 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-[2rem] p-8 shadow-xl">
                    <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                        <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        How It Works
                    </h3>
                    <div className="prose dark:prose-invert max-w-none text-foreground/80 whitespace-pre-wrap text-sm leading-relaxed">
                        {strategy.description || "The algorithm developer has not provided a detailed description. This typically indicates a proprietary quantitative strategy focused heavily on purely technical momentum or mean-reversion anomalies."}
                    </div>
                </div>

                <div className="border border-black/5 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-[2rem] p-8 shadow-xl">
                    <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                        <svg className="w-6 h-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Risk Parameters
                    </h3>
                    {riskRules.length > 0 ? (
                        <ul className="space-y-4">
                            {riskRules.map((rule: any, i: number) => (
                                <li key={i} className="flex gap-4 items-start bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/5 dark:border-white/5">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-sm">
                                        {i + 1}
                                    </span>
                                    <div>
                                        <p className="font-bold text-sm text-foreground">{rule.name}</p>
                                        <p className="text-sm text-foreground/60">{rule.value}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-foreground/50 text-sm italic py-4">No explicit risk constraints provided. Standard exchange liquidation limits apply.</div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {isSubscribeOpen && (
                <SubscribeModal
                    strategy={strategy}
                    userId={userId}
                    usdtBalance={usdtBalance}
                    usdcBalance={usdcBalance}
                    isPaperMode={isPaperMode}
                    connectedExchanges={connectedExchanges}
                    isOpen={isSubscribeOpen}
                    onClose={() => setIsSubscribeOpen(false)}
                />
            )}

            {isCapitalOpen && subscription && (
                <CapitalAllocationModal
                    isOpen={isCapitalOpen}
                    onClose={() => setIsCapitalOpen(false)}
                    strategy={strategy}
                    totalMasterBalance={subscription.allocatedCapital + (strategy.settlementCurrency === 'USDT' ? usdtBalance : usdcBalance)}
                    currentAllocation={subscription.allocatedCapital}
                    onSave={async (amount) => {
                        await updateSubscriptionCapital(subscription.id, amount);
                        setIsCapitalOpen(false);
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
}

function MetricCard({ title, value, color }: { title: string, value: string, color: string }) {
    return (
        <div className="border border-black/5 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider font-bold text-foreground/40 mb-2">{title}</p>
            <p className={`text-2xl font-black tracking-tight ${color}`}>{value}</p>
        </div>
    );
}

