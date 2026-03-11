"use client";

import React, { useState, useMemo } from 'react';
import StrategyPerformance from '../StrategyPerformance';
import { Activity } from 'lucide-react';

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

    const activeSubscription = subscriptions.find(s => s.strategyId === selectedStrategyId);
    
    // Ensure we ONLY pass historical closed trades pertaining to the exact strategy the user clicked on
    const strategyPositions = useMemo(() => {
        return positions.filter(p => p.strategyId === selectedStrategyId);
    }, [positions, selectedStrategyId]);

    return (
        <div className="space-y-8">
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

            <StrategyPerformance closedPositions={strategyPositions} currentBalance={totalBalance} />
        </div>
    );
}
