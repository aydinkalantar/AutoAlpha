"use client";

import React, { useState, useMemo, useEffect } from 'react';
import StrategyPerformance from '../StrategyPerformance';
import TradingChart, { TradeSignal } from '@/components/dashboard/TradingChart';
import { Activity } from 'lucide-react';
import type { UTCTimestamp } from 'lightweight-charts';

export default function StrategyReportClient({ subscriptions, positions, totalBalance }: { subscriptions: any[], positions: any[], totalBalance: number }) {
    
    // Fail-safe view for a zero-subscription user clicking through the sidebar
    if (subscriptions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 py-24 text-center bg-white/50 dark:bg-black/40 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl shadow-xl">
                <Activity className="w-16 h-16 text-foreground/20 mb-4" />
                <h2 className="text-2xl font-bold text-foreground tracking-tight">No Active Subscriptions</h2>
                <p className="text-foreground/60 mt-2 max-w-lg mx-auto">You are not currently subscribed to any algorithmic vaults in this environment. Visit the Marketplace to allocate capital to a strategy and generate detailed performance reports.</p>
            </div>
        );
    }

    // Default to initializing the first actively subscribed algorithmic vault
    const [selectedStrategyId, setSelectedStrategyId] = useState(subscriptions[0].strategyId);
    const [ohlcvData, setOhlcvData] = useState<any[]>([]);

    const activeSubscription = subscriptions.find(s => s.strategyId === selectedStrategyId);
    
    // Ensure we ONLY pass historical closed trades pertaining to the exact strategy the user clicked on
    const strategyPositions = useMemo(() => {
        return positions.filter(p => p.strategyId === selectedStrategyId);
    }, [positions, selectedStrategyId]);

    // Construct precise Entry and Exit timestamp markers from closed positions
    const tradeSignals = useMemo(() => {
        const signals: TradeSignal[] = [];
        
        strategyPositions.forEach(pos => {
            const isLong = pos.side === "LONG" || pos.side === "BUY";
            
            // 1. Map Entry Node
            signals.push({
                time: Math.floor(new Date(pos.createdAt).getTime() / 1000) as UTCTimestamp,
                price: pos.entryPrice,
                action: isLong ? 'long_enter' : 'short_enter'
            });

            // 2. Map Exit Node
            if (pos.closedAt) {
                signals.push({
                    time: Math.floor(new Date(pos.closedAt).getTime() / 1000) as UTCTimestamp,
                    price: pos.exitPrice || pos.entryPrice,
                    action: isLong ? 'long_exit' : 'short_exit'
                });
            }
        });

        // Ensure chronological order for Lightweight Charts API
        return signals.sort((a, b) => (a.time as number) - (b.time as number));
    }, [strategyPositions]);

    // Hydrate Candlesticks using Binance Public API for the active mapped symbol
    useEffect(() => {
        if (strategyPositions.length === 0) return;

        // Default to the most common symbol traded, or the latest trade symbol
        const targetSymbol = strategyPositions[0].symbol;

        const fetchKlines = async () => {
            try {
                let formattedSymbol = targetSymbol.replace('/', '').toUpperCase();
                if (formattedSymbol.endsWith('USD') && !formattedSymbol.endsWith('USDT')) {
                    formattedSymbol += 'T';
                }

                const res = await fetch(`https://api.binance.us/api/v3/klines?symbol=${formattedSymbol}&interval=1h&limit=500`);
                if (res.ok) {
                    const data = await res.json();
                    const formattedData = data.map((candle: any[]) => ({
                        time: Math.floor(candle[0] / 1000) as UTCTimestamp,
                        open: parseFloat(candle[1]),
                        high: parseFloat(candle[2]),
                        low: parseFloat(candle[3]),
                        close: parseFloat(candle[4])
                    }));
                    setOhlcvData(formattedData);
                }
            } catch (error) {
                console.error("Error fetching klines for Strategy Report:", error);
            }
        };

        fetchKlines();
    }, [selectedStrategyId, strategyPositions]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Multi-Strategy Glassmorphism Tab Selector Component */}
            <div className="flex overflow-x-auto pb-2 gap-3 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                {subscriptions.map((sub) => (
                    <button
                        key={sub.id}
                        onClick={() => setSelectedStrategyId(sub.strategyId)}
                        className={`shrink-0 px-6 py-3 rounded-xl font-bold transition-all text-sm border flex items-center gap-2 ${
                            selectedStrategyId === sub.strategyId
                                ? "bg-foreground text-background border-foreground shadow-lg dark:shadow-white/5"
                                : "bg-white/50 dark:bg-black/40 backdrop-blur-md text-foreground/70 border-black/5 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
                        }`}
                    >
                        {sub.strategy?.name || "Algorithm Engine"}
                    </button>
                ))}
            </div>

            <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-black/5 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-2xl font-black text-foreground tracking-tight">{activeSubscription?.strategy?.name || "Strategy"} Report</h2>
                    <p className="text-foreground/60 text-sm mt-1 max-w-2xl">{activeSubscription?.strategy?.description || "Performance metrics, drawdown mappings, and historical trade logs strictly isolated to this algorithmic vault."}</p>
                </div>
                <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/20 dark:from-white/5 to-transparent skew-x-12 translate-x-10 pointer-events-none" />
            </div>

            {/* TradingView Executions Overlay Chart */}
            <div className="bg-white/50 dark:bg-black/40 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-2xl w-full flex flex-col overflow-hidden">
                <div className="p-4 border-b border-black/5 dark:border-white/10">
                    <h3 className="text-lg font-bold text-foreground">Algorithmic Executions</h3>
                    <p className="text-sm text-foreground/60">Historical precise long/short entries layered onto dynamic asset price action.</p>
                </div>
                <div className="p-4 h-[500px]">
                    {ohlcvData.length > 0 ? (
                        <TradingChart ohlcvData={ohlcvData} tradeSignals={tradeSignals} />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <Activity className="w-8 h-8 text-foreground/20 animate-pulse" />
                        </div>
                    )}
                </div>
            </div>

            <StrategyPerformance closedPositions={strategyPositions} currentBalance={totalBalance} />
        </div>
    );
}
